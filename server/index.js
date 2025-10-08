const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json());

// Mongo connection with retry logic
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dear-diary';
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, { 
      dbName: process.env.MONGO_DB || 'dear-diary',
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log('✅ MongoDB connected');
  } catch (e) {
    console.error('❌ MongoDB connection error:', e.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

connectDB();

// Routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/messages', require('./routes/messages'));

// Start
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));




