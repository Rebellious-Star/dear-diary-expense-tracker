const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
    timestamp: String,
    replied: { type: Boolean, default: false },
    replyText: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);




