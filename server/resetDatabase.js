// Complete database reset script - clears users AND posts
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Post = require('./models/Post');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dear-diary';
const dbName = process.env.MONGO_DB || 'dear-diary';

async function main() {
  try {
    console.log('🔄 FULL DATABASE RESET');
    console.log(`🔗 Connecting to: ${mongoUri}`);
    console.log(`📦 Database: ${dbName}\n`);
    
    await mongoose.connect(mongoUri, { dbName });
    console.log('✅ MongoDB connected\n');

    // Clear Users
    console.log('👥 Clearing Users...');
    const usersBefore = await User.countDocuments();
    console.log(`   Found ${usersBefore} user(s)`);
    if (usersBefore > 0) {
      const userResult = await User.deleteMany({});
      console.log(`   ✅ Deleted ${userResult.deletedCount} user(s)`);
    }
    
    // Clear Posts
    console.log('\n💬 Clearing Posts...');
    const postsBefore = await Post.countDocuments();
    console.log(`   Found ${postsBefore} post(s)`);
    if (postsBefore > 0) {
      const postResult = await Post.deleteMany({});
      console.log(`   ✅ Deleted ${postResult.deletedCount} post(s)`);
    }
    
    // Verify
    console.log('\n🔍 Verification:');
    const usersAfter = await User.countDocuments();
    const postsAfter = await Post.countDocuments();
    console.log(`   Users: ${usersAfter}`);
    console.log(`   Posts: ${postsAfter}`);
    
    if (usersAfter === 0 && postsAfter === 0) {
      console.log('\n✅ Database reset successful!');
      console.log('\n⚠️  IMPORTANT: Restart your backend server now!');
      console.log('   Run: npm run dev (or restart your server)\n');
    } else {
      console.log('\n⚠️  WARNING: Some data still remains!');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
