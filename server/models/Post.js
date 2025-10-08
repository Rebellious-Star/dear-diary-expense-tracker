const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
  {
    author: String,
    content: String,
    timestamp: String,
    likes: { type: Number, default: 0 },
    isModerated: { type: Boolean, default: false },
    moderationReason: String,
  },
  { _id: true }
);

const PostSchema = new mongoose.Schema(
  {
    author: String,
    content: String,
    timestamp: String,
    likes: { type: Number, default: 0 },
    replies: { type: [ReplySchema], default: [] },
    isModerated: { type: Boolean, default: false },
    moderationReason: String,
    likedBy: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);




