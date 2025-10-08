// Quick check without mongoose - uses existing server connection
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/health',
  method: 'GET'
};

console.log('Checking if server is running...');

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Server is running');
    console.log('\n💡 The MongoDB SSL errors suggest:');
    console.log('   1. Your MongoDB Atlas connection is unstable');
    console.log('   2. Your IP might not be whitelisted in MongoDB Atlas');
    console.log('   3. Network/firewall issues\n');
    console.log('📋 To check if user was banned:');
    console.log('   - Check server console for "User X banned successfully"');
    console.log('   - Or check MongoDB Atlas dashboard directly\n');
  } else {
    console.log('❌ Server returned status:', res.statusCode);
  }
});

req.on('error', (e) => {
  console.error('❌ Server not running:', e.message);
  console.log('\n💡 Start server with: cd server && npm run dev');
});

req.end();
