const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(t, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  // Transform _id to id for frontend compatibility
  const transformed = posts.map(p => ({
    id: p._id.toString(),
    author: p.author,
    content: p.content,
    timestamp: p.timestamp,
    likes: p.likes,
    replies: p.replies.map(r => ({
      id: r._id.toString(),
      author: r.author,
      content: r.content,
      timestamp: r.timestamp,
      likes: r.likes,
      isModerated: r.isModerated,
      moderationReason: r.moderationReason,
    })),
    isModerated: p.isModerated,
    moderationReason: p.moderationReason,
    likedBy: p.likedBy,
  }));
  res.json(transformed);
});

router.post('/posts', auth, async (req, res) => {
  try {
    const { content, timestamp } = req.body;
    // Check if user is banned
    const user = await User.findOne({ username: req.user.username });
    if (user && user.isBanned) {
      // Check if ban has expired
      if (user.banExpiry && new Date() > user.banExpiry) {
        // Ban expired, unban user
        await User.updateOne({ username: req.user.username }, { isBanned: false, banExpiry: undefined });
      } else {
        return res.status(403).json({ error: 'You are banned from posting' });
      }
    }
    const post = await Post.create({ author: req.user.username, content, timestamp, likes: 0, replies: [], isModerated: false });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/posts/:id/replies', auth, async (req, res) => {
  try {
    const { content, timestamp } = req.body;
    // Check if user is banned
    const user = await User.findOne({ username: req.user.username });
    if (user && user.isBanned) {
      // Check if ban has expired
      if (user.banExpiry && new Date() > user.banExpiry) {
        // Ban expired, unban user
        await User.updateOne({ username: req.user.username }, { isBanned: false, banExpiry: undefined });
      } else {
        return res.status(403).json({ error: 'You are banned from posting' });
      }
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    post.replies.push({ author: req.user.username, content, timestamp, likes: 0, isModerated: false });
    await post.save();
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/posts/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (!post.likedBy.includes(req.user.username)) {
    post.likedBy.push(req.user.username);
    post.likes += 1;
    await post.save();
  }
  res.json(post);
});

router.delete('/posts/:id', auth, async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (!isAdmin && post.author !== req.user.username) return res.status(403).json({ error: 'Forbidden' });
  await Post.deleteOne({ _id: post._id });
  res.json({ ok: true });
});

router.post('/moderation/ban', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { username, until } = req.body;
  await User.updateOne({ username }, { isBanned: true, banExpiry: until ? new Date(until) : undefined });
  res.json({ ok: true });
});

router.post('/moderation/unban', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { username } = req.body;
  await User.updateOne({ username }, { isBanned: false, banExpiry: undefined });
  res.json({ ok: true });
});

// Increment warning for user (called by frontend when profanity detected)
router.post('/moderation/warn', auth, async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Increment warnings
    user.forumWarnings = (user.forumWarnings || 0) + 1;
    
    // Auto-ban based on warnings
    if (user.forumWarnings === 2) {
      // 24-hour ban on second warning
      const banExpiry = new Date();
      banExpiry.setHours(banExpiry.getHours() + 24);
      user.isBanned = true;
      user.banExpiry = banExpiry;
    } else if (user.forumWarnings >= 3) {
      // Permanent ban on third warning
      user.isBanned = true;
      user.banExpiry = undefined;
    }
    
    await user.save();
    
    res.json({ 
      ok: true, 
      warnings: user.forumWarnings,
      isBanned: user.isBanned,
      banExpiry: user.banExpiry
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;




