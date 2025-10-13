import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.isAdmin) return;
      const [u, m, p] = await Promise.all([
        api.get('/auth/users'),
        api.get('/messages'),
        api.get('/forum/posts'),
      ]);
      setUsers(u.data || []);
      setMessages(m.data || []);
      setPosts(p.data || []);
    };
    load().catch(() => {});
  }, [user]);

  const unban = async (username: string) => {
    try {
      await api.post('/forum/moderation/unban', { username });
      
      // Small delay to ensure backend processes the unban
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const u = await api.get('/auth/users');
      setUsers(u.data || []);
    } catch (err) {
      console.error('Failed to unban user:', err);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: '2rem' }}>Admins only.</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-accent)', color: 'var(--accent-brown)' }}>Admin Console</h1>

        <section style={{ marginTop: '1.5rem' }}>
          <h2>Users</h2>
          <div className="translucent-card">
            {users.length === 0 ? 'No users' : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                <strong>Email</strong><strong>Username</strong><strong>Role</strong><strong>Status</strong>
                {users.map((u) => (
                  <React.Fragment key={u.id}>
                    <div>{u.email}</div>
                    <div>{u.username}</div>
                    <div>{u.role}</div>
                    <div>
                      {u.isBanned ? (
                        <button className="btn-secondary" onClick={() => unban(u.username)}>Unban</button>
                      ) : 'Active'}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ marginTop: '1.5rem' }}>
          <h2>Messages</h2>
          <div className="translucent-card">
            {messages.length === 0 ? 'No messages' : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {messages.map((m: any) => (
                  <div key={m._id}>
                    <strong>{m.name}</strong> • {m.email} • {new Date(m.timestamp).toLocaleString()} <br />
                    {m.subject && (<span>Subject: {m.subject} • </span>)}
                    {m.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ marginTop: '1.5rem' }}>
          <h2>Forum Posts</h2>
          <div className="translucent-card">
            {posts.length === 0 ? 'No posts' : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {posts.map((p: any) => (
                  <div key={p._id}>
                    <strong>{p.author}</strong> • {new Date(p.timestamp).toLocaleString()} <br />
                    {p.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;




