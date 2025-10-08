const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', ExpenseSchema);




