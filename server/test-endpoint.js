const https = require('https');

// Testar endpoint /api/rooms/I84OGJ/users/23/stats
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/rooms/I84OGJ/users/23/stats',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('=== TESTANDO ENDPOINT /api/rooms/I84OGJ/users/23/stats ===\n');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Body: ${data}`);
    
    try {
      const parsed = JSON.parse(data);
      console.log('\nResposta parseada:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('\nResposta não é JSON válido');
    }
  });
});

req.on('error', (error) => {
  console.error('Erro na requisição:', error);
});

req.end();