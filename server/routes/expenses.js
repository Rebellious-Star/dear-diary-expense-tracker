const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');

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
  console.log('📥 GET /expenses - userId:', req.user.uid);
  const list = await Expense.find({ userId: req.user.uid }).sort({ createdAt: -1 });
  console.log(`✅ Found ${list.length} expenses for user ${req.user.uid}`);
  // Transform _id to id for frontend compatibility
  const transformed = list.map(e => ({
    id: e._id.toString(),
    type: e.type,
    amount: e.amount,
    currency: e.currency,
    category: e.category,
    description: e.description,
    date: e.date,
  }));
  res.json(transformed);
});

router.post('/', auth, async (req, res) => {
  const { type, amount, currency = 'INR', category, description, date } = req.body;
  console.log('📤 POST /expenses - userId:', req.user.uid, 'expense:', { type, amount, category, description });
  const item = await Expense.create({ userId: req.user.uid, type, amount, currency, category, description, date });
  console.log('✅ Created expense:', item._id.toString(), 'for userId:', item.userId);
  // Return with id field for frontend compatibility
  res.json({
    id: item._id.toString(),
    type: item.type,
    amount: item.amount,
    currency: item.currency,
    category: item.category,
    description: item.description,
    date: item.date,
  });
});

router.delete('/:id', auth, async (req, res) => {
  await Expense.deleteOne({ _id: req.params.id, userId: req.user.uid });
  res.json({ ok: true });
});

module.exports = router;




