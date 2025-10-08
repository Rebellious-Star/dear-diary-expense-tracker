// Quick script to view and clear users from MongoDB
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dear-diary';
const dbName = process.env.MONGO_DB || 'dear-diary';

async function main() {
  try {
    console.log(`🔗 Connecting to: ${mongoUri}`);
    console.log(`📦 Database: ${dbName}`);
    
    await mongoose.connect(mongoUri, { dbName });
    console.log('✅ MongoDB connected\n');

    // List all users BEFORE deletion
    console.log('📋 BEFORE - Users in database:');
    const usersBefore = await User.find().select('email username role createdAt');
    if (usersBefore.length === 0) {
      console.log('   (No users found)');
    } else {
      usersBefore.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (@${u.username}) - ${u.role} - Created: ${u.createdAt}`);
      });
      
      // Delete all users
      console.log('\n⚠️  Deleting all users...');
      const result = await User.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} user(s)\n`);
      
      // Verify deletion
      console.log('📋 AFTER - Users in database:');
      const usersAfter = await User.find().select('email username role createdAt');
      if (usersAfter.length === 0) {
        console.log('   ✅ (No users found - deletion successful!)');
      } else {
        console.log('   ⚠️  WARNING: Still found users after deletion:');
        usersAfter.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.email} (@${u.username})`);
        });
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
