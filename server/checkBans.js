// Check user ban status
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dear-diary';
const dbName = process.env.MONGO_DB || 'dear-diary';

async function main() {
  try {
    await mongoose.connect(mongoUri, { 
      dbName,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected!\n');

    // List all users with ban info
    const users = await User.find().select('email username role isBanned banExpiry forumWarnings');
    console.log(`📋 Users and Ban Status:\n`);
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.username} (${u.email})`);
      console.log(`   Role: ${u.role}`);
      console.log(`   Warnings: ${u.forumWarnings || 0}`);
      console.log(`   Banned: ${u.isBanned ? 'YES' : 'NO'}`);
      if (u.isBanned && u.banExpiry) {
        console.log(`   Ban Expires: ${new Date(u.banExpiry).toLocaleString()}`);
      } else if (u.isBanned) {
        console.log(`   Ban Type: PERMANENT`);
      }
      console.log('');
    });

    await mongoose.disconnect();
    console.log('✅ Done\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
