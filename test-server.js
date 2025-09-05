const { exec } = require('child_process');

console.log('🧪 Testing NFL Pick Em Backend Setup...\n');

// Start the server
console.log('1. Starting backend server...');
const server = exec('cd packages/backend && npm run dev', { cwd: '/home/codespace/Project-Pick-EM' });

server.stdout.on('data', (data) => {
  console.log('Server:', data.toString());
  
  // Test health endpoint when server starts
  if (data.includes('🚀 Server running on port 3002')) {
    setTimeout(() => {
      console.log('\n2. Testing health endpoint...');
      exec('curl -s http://localhost:3002/health', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ Health endpoint failed:', error.message);
        } else {
          console.log('✅ Health endpoint response:', stdout);
        }
        
        console.log('\n3. Checking database connection...');
        exec('cd packages/backend && node -e "const {PrismaClient} = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.team.count().then(count => {console.log(\'✅ Database connected. Teams:\', count); process.exit(0);}).catch(err => {console.log(\'❌ Database error:\', err.message); process.exit(1);})"', { cwd: '/home/codespace/Project-Pick-EM' }, (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Database test failed:', error.message);
          } else {
            console.log(stdout);
          }
          
          console.log('\n🎉 Backend setup test completed!');
          server.kill();
          process.exit(0);
        });
      });
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.log('Server Error:', data.toString());
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout');
  server.kill();
  process.exit(1);
}, 10000);
