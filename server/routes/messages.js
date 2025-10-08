const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

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

router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const list = await Message.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post('/', async (req, res) => {
  const { name, email, subject, message, timestamp } = req.body;
  const m = await Message.create({ name, email, subject, message, timestamp });
  res.json(m);
});

router.post('/:id/reply', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { text } = req.body;
  await Message.updateOne({ _id: req.params.id }, { replied: true, replyText: text });
  res.json({ ok: true });
});

module.exports = router;




