// Simple script to just check users without deleting
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dear-diary';
const dbName = process.env.MONGO_DB || 'dear-diary';

async function main() {
  try {
    console.log('🔗 Attempting connection...');
    
    // Add timeout and retry options
    await mongoose.connect(mongoUri, { 
      dbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected!\n');

    // Just list users
    const users = await User.find().select('email username role createdAt');
    console.log(`📋 Found ${users.length} user(s):\n`);
    
    if (users.length > 0) {
      users.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (@${u.username}) - ${u.role}`);
      });
    } else {
      console.log('   (Database is empty)');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done\n');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Try these solutions:');
    console.log('   1. Check if your MongoDB Atlas cluster is running');
    console.log('   2. Verify your IP is whitelisted in MongoDB Atlas');
    console.log('   3. Check your internet connection');
    console.log('   4. Try again in a few minutes\n');
    process.exit(1);
  }
}

main();
