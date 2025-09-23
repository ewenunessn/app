const http = require('http');

async function testAnswerEndpoint() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      roomCode: '0LT3MS',
      userId: 25,
      questionId: 1,
      alternativeId: 1
    });

    const options = {
      hostname: '192.168.18.12',
      port: 5000,
      path: '/api/answers',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Resposta:', responseData);
        resolve(responseData);
      });
    });

    req.on('error', (error) => {
      console.error('Erro:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

testAnswerEndpoint();