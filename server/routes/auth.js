const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const signToken = (user) =>
  jwt.sign({ uid: user._id, email: user.email, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email exists' });
    const usernameExists = await User.findOne({ username: username });
    if (usernameExists) return res.status(409).json({ error: 'Username exists' });
    const hash = bcrypt.hashSync(password, 10);
    const isFirst = (await User.estimatedDocumentCount()) === 0;
    const user = await User.create({ email: email.toLowerCase(), username, passwordHash: hash, role: isFirst ? 'admin' : 'user' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role, isBanned: user.isBanned, banExpiry: user.banExpiry } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Check if ban has expired
    if (user.isBanned && user.banExpiry && new Date() > user.banExpiry) {
      user.isBanned = false;
      user.banExpiry = undefined;
      await user.save();
    }
    
    const token = signToken(user);
    res.json({ token, user: { id: user._id, email: user.email, username: user.username, role: user.role, isBanned: user.isBanned, banExpiry: user.banExpiry } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get current user's info (including ban status)
router.get('/me', async (req, res) => {
  try {
    const h = req.headers.authorization || '';
    const t = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!t) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(t, JWT_SECRET);
    const user = await User.findOne({ username: payload.username }).select('_id email username role isBanned banExpiry forumWarnings');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ 
      id: user._id, 
      email: user.email, 
      username: user.username, 
      role: user.role, 
      isBanned: user.isBanned, 
      banExpiry: user.banExpiry,
      forumWarnings: user.forumWarnings || 0
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

// Admin-only: list users
router.get('/users', async (req, res) => {
  try {
    const h = req.headers.authorization || '';
    const t = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!t) {
      console.log('❌ /auth/users: No token provided');
      return res.status(401).json({ error: 'No token' });
    }
    const payload = jwt.verify(t, JWT_SECRET);
    console.log('✅ /auth/users: Token verified. User:', payload.username, 'Role:', payload.role);
    if (payload.role !== 'admin') {
      console.log('❌ /auth/users: User is not admin. Role:', payload.role);
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    const users = await User.find().select('_id email username role isBanned banExpiry createdAt');
    console.log(`✅ /auth/users: Returning ${users.length} users`);
    res.json(users.map(u => ({ id: u._id, email: u.email, username: u.username, role: u.role, isBanned: u.isBanned, banExpiry: u.banExpiry, createdAt: u.createdAt })));
  } catch (e) {
    console.error('❌ /auth/users error:', e.message);
    res.status(500).json({ error: e.message });
  }
});


