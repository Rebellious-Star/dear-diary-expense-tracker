import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  AlertTriangle, 
  Ban,
  Shield,
  Users,
  ThumbsUp,
  Reply,
  Flag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: Reply[];
  isModerated: boolean;
  moderationReason?: string;
  likedBy?: string[]; // usernames who liked (for single-like limit)
}

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isModerated: boolean;
  moderationReason?: string;
}

// Bad words filter (simplified version)
const badWords = [
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'hate', 'kill', 'die',
  'fuck', 'shit', 'bitch', 'ass', 'bastard', 'piss', 'bloody', 'bugger'
];

const checkForBadWords = (text: string): { hasBadWords: boolean; badWords: string[] } => {
  const foundWords = badWords.filter(word => 
    text.toLowerCase().includes(word.toLowerCase())
  );
  return {
    hasBadWords: foundWords.length > 0,
    badWords: foundWords
  };
};

const ForumPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadedForum, setLoadedForum] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [newReply, setNewReply] = useState<{ [key: string]: string }>({});
  const [showReplyForm, setShowReplyForm] = useState<{ [key: string]: boolean }>({});
  const [userWarnings, setUserWarnings] = useState<{ [key: string]: number }>({});
  const [bannedUsers, setBannedUsers] = useState<{ [key: string]: { isBanned: boolean; expiry?: Date | string } }>({});
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const setUserBanInUsersStore = (username: string, isBanned: boolean, expiry?: Date) => {
    try {
      const raw = localStorage.getItem('users');
      if (!raw) return;
      const users = JSON.parse(raw);
      let changed = false;
      const updated = users.map((u: any) => {
        if (String(u.username).toLowerCase() === username.toLowerCase()) {
          changed = true;
          return {
            ...u,
            isBanned,
            banExpiry: expiry ? expiry.toISOString() : undefined,
          };
        }
        return u;
      });
      if (changed) {
        localStorage.setItem('users', JSON.stringify(updated));
      }
    } catch {}
  };

  // Load posts from backend and sync ban/warning status
  useEffect(() => {
    const load = async () => {
      const res = await api.get('/forum/posts');
      setPosts(res.data || []);
      
      // Clear state when user changes (including logout)
      setUserWarnings({});
      setBannedUsers({});
      
      if (user) {
        try {
          // Fetch current user's info (including ban status and warnings)
          const meRes = await api.get('/auth/me');
          const userData = meRes.data;
          
          // Update warnings from backend
          if (userData.forumWarnings) {
            setUserWarnings({ [user.username]: userData.forumWarnings });
          } else {
            setUserWarnings({});
          }
          
          // Update ban status from backend
          if (userData.isBanned) {
            setBannedUsers({
              [user.username]: { isBanned: true, expiry: userData.banExpiry }
            });
          } else {
            setBannedUsers({});
          }
          
          // If admin, also fetch all users for admin panel
          if (userData.role === 'admin') {
            try {
              const usersRes = await api.get('/auth/users');
              const bans: { [key: string]: { isBanned: boolean; expiry?: Date | string } } = {};
              (usersRes.data || []).forEach((u: any) => {
                if (u.isBanned) {
                  bans[u.username] = { isBanned: true, expiry: u.banExpiry };
                }
              });
              setBannedUsers(bans);
            } catch (adminErr) {
              console.error('Failed to fetch users (admin only):', adminErr);
            }
          }
        } catch (err) {
          console.error('Failed to sync user status:', err);
        }
      }
      
      setLoadedForum(true);
    };
    load().catch(() => setLoadedForum(true));
  }, [user]);

  // Sync posts across tabs/refresh sequences
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'forumPosts' && e.newValue) {
        try { setPosts(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Live-sync banned users via storage events
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'bannedUsers' && e.newValue) {
        try {
          setBannedUsers(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // backend is source of truth for posts

  useEffect(() => {
    localStorage.setItem('userWarnings', JSON.stringify(userWarnings));
  }, [userWarnings]);

  useEffect(() => {
    localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
  }, [bannedUsers]);

  const isUserBanned = (username: string): boolean => {
    const banInfo = bannedUsers[username];
    if (!banInfo) return false;
    
    if (banInfo.isBanned && banInfo.expiry) {
      const expiryDate = new Date(banInfo.expiry as any);
      if (new Date() > expiryDate) {
        // Ban expired
        setBannedUsers(prev => ({
          ...prev,
          [username]: { isBanned: false }
        }));
        return false;
      }
    }
    
    return banInfo.isBanned;
  };

  const handleModeration = async (content: string, author: string): Promise<{ isModerated: boolean; reason?: string }> => {
    const { hasBadWords, badWords: foundWords } = checkForBadWords(content);
    
    if (hasBadWords) {
      console.log(`🚨 Profanity detected! User: ${author}, Words: ${foundWords.join(', ')}`);
      try {
        console.log('📡 Calling /forum/moderation/warn...');
        const res = await api.post('/forum/moderation/warn', { username: author });
        console.log('✅ Warning API response:', res.data);
        
        const { warnings, isBanned, banExpiry } = res.data;
        
        // Update local state
        setUserWarnings(prev => ({
          ...prev,
          [author]: warnings
        }));
        
        if (isBanned) {
          console.log(`🚫 User ${author} is now BANNED. Expiry: ${banExpiry || 'PERMANENT'}`);
          setBannedUsers(prev => ({
            ...prev,
            [author]: { isBanned: true, expiry: banExpiry }
          }));
          setUserBanInUsersStore(author, true, banExpiry ? new Date(banExpiry) : undefined);
        }
        
        // Show appropriate message
        if (warnings === 1) {
          toast.error(`Warning: Inappropriate language detected. Please use respectful language. Found: ${foundWords.join(', ')}`);
          return { isModerated: true, reason: `Inappropriate language: ${foundWords.join(', ')}` };
        } else if (warnings === 2) {
          toast.error(`You have been temporarily banned for 24 hours due to repeated inappropriate language. Found: ${foundWords.join(', ')}`);
          return { isModerated: true, reason: `Temporary ban: ${foundWords.join(', ')}` };
        } else if (warnings >= 3) {
          toast.error(`You have been permanently banned from the forum. Please join our Discord server to appeal: https://discord.gg/dear-diary-expense-tracker`);
          return { isModerated: true, reason: `Permanent ban: ${foundWords.join(', ')}` };
        }
      } catch (err: any) {
        console.error('❌ Failed to process warning:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        toast.error(`Failed to process moderation: ${err.response?.data?.error || err.message}`);
      }
    }
    
    return { isModerated: false };
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!user) {
      toast.error('Please log in to post');
      return;
    }

    if (isUserBanned(user.username)) {
      toast.error('You are banned from posting. Please join our Discord server to appeal.');
      return;
    }

    // Check for profanity BEFORE creating post
    const moderation = await handleModeration(newPost, user.username);
    
    // If moderated (banned), don't create the post at all
    if (moderation.isModerated) {
      setNewPost('');
      return; // Stop here - user was warned/banned, don't create post
    }

    // Only create post if not moderated
    const payload = {
      content: newPost,
      timestamp: new Date().toISOString(),
      isModerated: false,
      moderationReason: undefined,
    };
    try {
      // Optimistic update: Add post to UI immediately
      const optimisticPost: Post = {
        id: Date.now().toString(),
        author: user.username,
        content: newPost,
        timestamp: payload.timestamp,
        likes: 0,
        replies: [],
        isModerated: false,
      };
      setPosts([optimisticPost, ...posts]);
      toast.success('Post added successfully!');
      setNewPost('');
      
      // Post to backend
      await api.post('/forum/posts', payload);
      
      // No background refresh - trust optimistic update
    } catch (err) {
      console.error('Failed to add post:', err);
      toast.error('Failed to add post. Please try again.');
      // Revert optimistic update by removing the post
      setPosts(prev => prev.filter(p => p.id !== optimisticPost.id));
    }
  };

  const handleReplySubmit = async (postId: string) => {
    const replyContent = newReply[postId];
    if (!replyContent?.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    if (!user) {
      toast.error('Please log in to reply');
      return;
    }

    if (isUserBanned(user.username)) {
      toast.error('You are banned from posting. Please join our Discord server to appeal.');
      return;
    }

    // Check for profanity BEFORE creating reply
    const moderation = await handleModeration(replyContent, user.username);
    
    // If moderated (banned), don't create the reply at all
    if (moderation.isModerated) {
      setNewReply(prev => ({ ...prev, [postId]: '' }));
      setShowReplyForm(prev => ({ ...prev, [postId]: false }));
      return; // Stop here - user was warned/banned, don't create reply
    }

    // Only create reply if not moderated
    const payload = {
      content: replyContent,
      timestamp: new Date().toISOString(),
      isModerated: false,
      moderationReason: undefined,
    };
    try {
      // Optimistic update: Add reply to UI immediately
      const optimisticReply: Reply = {
        id: Date.now().toString(),
        author: user.username,
        content: replyContent,
        timestamp: payload.timestamp,
        likes: 0,
        isModerated: false,
      };
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, replies: [...p.replies, optimisticReply] } : p
      ));
      toast.success('Reply added successfully!');
      setNewReply({ ...newReply, [postId]: '' });
      setShowReplyForm({ ...showReplyForm, [postId]: false });
      
      // Post to backend
      await api.post(`/forum/posts/${postId}/replies`, payload);
      
      // No background refresh - trust optimistic update
    } catch (err) {
      console.error('Failed to add reply:', err);
      toast.error('Failed to add reply. Please try again.');
      // Revert optimistic update by removing the reply
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, replies: p.replies.filter(r => r.id !== optimisticReply.id) } : p
      ));
    }
  };

  const handleLike = async (postId: string, replyId?: string) => {
    if (!user) {
      toast.error('Please log in to like posts');
      return;
    }

    try {
      await api.post(`/forum/posts/${postId}/like`);
      
      // Small delay to ensure backend processes the like
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const res = await api.get('/forum/posts');
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to like post:', err);
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = (postId: string) => {
    if (!user) {
      toast.error('Please log in to delete posts');
      return;
    }
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.author !== user.username && !user.isAdmin) {
      toast.error('You can only delete your own posts');
      return;
    }
    
    // Call backend API to delete post
    api.delete(`/forum/posts/${postId}`).then(async () => {
      const res = await api.get('/forum/posts');
      setPosts(res.data || []);
      toast.success('Post deleted');
    }).catch((err) => {
      console.error('Delete failed:', err);
      // Fallback to optimistic delete
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted');
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="forum-page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Farm Background Animation */}
      <div className="farm-background"></div>
      
      {/* Floating Farm Elements */}
      <motion.div
        className="floating-wheat"
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          fontSize: '3rem',
          opacity: 0.15,
          zIndex: 1,
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌾
      </motion.div>

      <Navbar />

      <div className="container" style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '2rem',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Header */}
        <motion.div
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-accent)',
            textAlign: 'center',
          }}>
            💬 Community Forum
          </h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--dark-brown)',
            fontSize: '1.1rem',
            marginBottom: '2rem',
          }}>
            Connect with fellow students and share financial advice
          </p>
          {user?.isAdmin && (
            <div style={{ textAlign: 'center' }}>
              <button
                className="btn-secondary"
                onClick={async () => {
                  // Fetch users from backend when opening
                  if (!showAdminPanel) {
                    try {
                      console.log('Fetching users from /auth/users...');
                      const res = await api.get('/auth/users');
                      console.log('Users response:', res.data);
                      setAllUsers(res.data || []);
                      // Build bannedUsers map from backend data
                      const bans: { [key: string]: { isBanned: boolean; expiry?: Date | string } } = {};
                      (res.data || []).forEach((u: any) => {
                        console.log(`User ${u.username}: isBanned=${u.isBanned}, banExpiry=${u.banExpiry}`);
                        if (u.isBanned) {
                          bans[u.username] = { isBanned: true, expiry: u.banExpiry };
                        }
                      });
                      console.log('Banned users map:', bans);
                      setBannedUsers(bans);
                    } catch (err: any) {
                      console.error('Failed to fetch users:', err);
                      console.error('Error response:', err.response?.data);
                      toast.error(`Failed to load users: ${err.response?.data?.error || err.message}`);
                    }
                  }
                  setShowAdminPanel(!showAdminPanel);
                }}
              >
                {showAdminPanel ? 'Hide' : 'Show'} Admin Panel
              </button>
            </div>
          )}
        </motion.div>
        {/* Admin Panel */}
        {user?.isAdmin && showAdminPanel && (
          <motion.div
            className="translucent-card"
            style={{ marginBottom: '2rem', border: '2px dashed var(--farm-green)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Shield size={20} /> Moderation Panel
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(() => {
                // Use backend data (allUsers) instead of localStorage
                const bannedUsersList = allUsers.filter(u => u.isBanned);
                if (bannedUsersList.length === 0) {
                  return <div style={{ color: 'var(--dark-brown)' }}>No banned users.</div>;
                }
                return bannedUsersList.map((u: any) => (
                  <div key={u.username} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0'
                  }}>
                    <div style={{ color: 'var(--accent-brown)', fontWeight: 600 }}>
                      {u.username} ({u.email}) {u.banExpiry ? `• Temp ban until ${new Date(u.banExpiry).toLocaleString()}` : '• Permanent ban'}
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={async () => {
                        try {
                          await api.post('/forum/moderation/unban', { username: u.username });
                          toast.success(`${u.username} has been unbanned`);
                          // Refresh users list
                          const res = await api.get('/auth/users');
                          setAllUsers(res.data || []);
                          const bans: { [key: string]: { isBanned: boolean; expiry?: Date | string } } = {};
                          (res.data || []).forEach((user: any) => {
                            if (user.isBanned) {
                              bans[user.username] = { isBanned: true, expiry: user.banExpiry };
                            }
                          });
                          setBannedUsers(bans);
                        } catch (err) {
                          console.error('Unban failed:', err);
                          toast.error('Failed to unban user');
                        }
                      }}
                    >
                      Unban
                    </button>
                  </div>
                ));
              })()}
            </div>
          </motion.div>
        )}

        {/* Community Guidelines */}
        <motion.div
          className="translucent-card"
          style={{ marginBottom: '2rem', background: 'rgba(240, 230, 140, 0.2)' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Shield size={24} color="var(--wheat-gold)" />
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginLeft: '0.5rem',
            }}>
              Community Guidelines
            </h3>
          </div>
          <div style={{ color: 'var(--dark-brown)', lineHeight: 1.6 }}>
            <p style={{ marginBottom: '0.5rem' }}>
              • Be respectful and use appropriate language
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              • Share helpful financial advice and tips
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              • No spam, harassment, or inappropriate content
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              • 1st warning: Content removed, 2nd warning: 24h ban, 3rd warning: Permanent ban
            </p>
            <p style={{ fontWeight: 'bold', color: 'var(--barn-red)' }}>
              • Banned users can appeal through our Discord server
            </p>
          </div>
        </motion.div>

        {/* New Post Form */}
        {user && !isUserBanned(user.username) && (
          <motion.div
            className="translucent-card"
            style={{ marginBottom: '2rem' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1rem',
            }}>
              Share Your Thoughts
            </h3>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="input-field"
              placeholder="Ask a question, share a tip, or start a discussion..."
              rows={4}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--dark-brown)' }}>
                {userWarnings[user.username] ? (
                  <span style={{ color: 'var(--barn-red)', fontWeight: 'bold' }}>
                    <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                    Warnings: {userWarnings[user.username]}/3
                  </span>
                ) : (
                  <span style={{ color: 'var(--farm-green)' }}>
                    <Shield size={16} style={{ marginRight: '0.5rem' }} />
                    Clean record
                  </span>
                )}
              </div>
              <button
                onClick={handlePostSubmit}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Send size={16} />
                Post
              </button>
            </div>
          </motion.div>
        )}

        {/* Ban Notice */}
        {user && isUserBanned(user.username) && (
          <motion.div
            className="translucent-card"
            style={{ 
              marginBottom: '2rem', 
              background: 'rgba(205, 92, 92, 0.2)',
              border: '2px solid var(--barn-red)'
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Ban size={24} color="var(--barn-red)" />
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: 'var(--barn-red)',
                marginLeft: '0.5rem',
              }}>
                Account Suspended
              </h3>
            </div>
            <p style={{ color: 'var(--dark-brown)', marginBottom: '1rem' }}>
              You have been banned from posting due to repeated violations of our community guidelines.
            </p>
            <p style={{ color: 'var(--dark-brown)', fontWeight: 'bold' }}>
              To appeal your ban, please join our Discord server:
            </p>
            <a 
              href="https://discord.gg/dear-diary-expense-tracker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginTop: '1rem',
                textDecoration: 'none'
              }}
            >
              <Users size={16} />
              Join Discord Server
            </a>
          </motion.div>
        )}

        {/* Posts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.length === 0 ? (
            <motion.div
              className="translucent-card"
              style={{ textAlign: 'center', padding: '3rem' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <p style={{ fontSize: '1.1rem', color: 'var(--dark-brown)' }}>
                No posts yet. Be the first to start a conversation!
              </p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                className="translucent-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
              >
                {/* Post Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--farm-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                  }}>
                    <User size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                      {post.author}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', display: 'flex', alignItems: 'center' }}>
                      <Clock size={14} style={{ marginRight: '0.5rem' }} />
                      {formatTime(post.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div style={{ marginBottom: '1rem' }}>
                  {post.isModerated ? (
                    <div style={{
                      background: 'rgba(205, 92, 92, 0.1)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--barn-red)',
                      color: 'var(--barn-red)',
                      fontStyle: 'italic',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Flag size={16} style={{ marginRight: '0.5rem' }} />
                        Content removed by moderation
                      </div>
                      <div style={{ fontSize: '0.9rem' }}>
                        Reason: {post.moderationReason}
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      color: 'var(--dark-brown)', 
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap' 
                    }}>
                      {post.content}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(210, 180, 140, 0.3)',
                  paddingTop: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-brown)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(154, 205, 50, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      <ThumbsUp size={16} />
                      {post.likes}
                    </button>
                    
                    <button
                      onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-brown)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(154, 205, 50, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                      }}
                    >
                      <Reply size={16} />
                      Reply ({post.replies.length})
                    </button>
                  </div>
                  {(user && (user.username === post.author || user.isAdmin)) && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem' }}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {showReplyForm[post.id] && user && !isUserBanned(user.username) && (
                  <motion.div
                    style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(210, 180, 140, 0.3)' }}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <textarea
                      value={newReply[post.id] || ''}
                      onChange={(e) => setNewReply(prev => ({ ...prev, [post.id]: e.target.value }))}
                      className="input-field"
                      placeholder="Write a reply..."
                      rows={3}
                      style={{ marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button
                        onClick={() => setShowReplyForm(prev => ({ ...prev, [post.id]: false }))}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReplySubmit(post.id)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <Send size={16} />
                        Reply
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Replies */}
                {post.replies.length > 0 && (
                  <div style={{ marginTop: '1rem', paddingLeft: '2rem' }}>
                    {post.replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        style={{
                          padding: '1rem',
                          marginBottom: '0.5rem',
                          background: 'rgba(244, 241, 232, 0.5)',
                          borderRadius: '8px',
                          border: '1px solid rgba(210, 180, 140, 0.2)',
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            background: 'var(--light-brown)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.5rem',
                          }}>
                            <User size={14} color="white" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--accent-brown)', fontSize: '0.9rem' }}>
                              {reply.author}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--dark-brown)', display: 'flex', alignItems: 'center' }}>
                              <Clock size={12} style={{ marginRight: '0.3rem' }} />
                              {formatTime(reply.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        {reply.isModerated ? (
                          <div style={{
                            background: 'rgba(205, 92, 92, 0.1)',
                            padding: '0.8rem',
                            borderRadius: '6px',
                            border: '1px solid var(--barn-red)',
                            color: 'var(--barn-red)',
                            fontStyle: 'italic',
                            fontSize: '0.9rem',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem' }}>
                              <Flag size={14} style={{ marginRight: '0.3rem' }} />
                              Content removed by moderation
                            </div>
                            <div style={{ fontSize: '0.8rem' }}>
                              Reason: {reply.moderationReason}
                            </div>
                          </div>
                        ) : (
                          <div style={{ 
                            color: 'var(--dark-brown)', 
                            lineHeight: 1.5,
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-wrap' 
                          }}>
                            {reply.content}
                          </div>
                        )}
                        
                        <div style={{ marginTop: '0.5rem' }}>
                          <button
                            onClick={() => handleLike(post.id, reply.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-brown)',
                              cursor: 'pointer',
                              padding: '0.3rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(154, 205, 50, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            <ThumbsUp size={12} />
                            {reply.likes}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPage;







