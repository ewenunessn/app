// Teste de simulação do final do quiz
const roomCode = 'I84OGJ';
const userId = 23;

console.log('=== TESTE SIMULAÇÃO FINAL DO QUIZ ===');
console.log('Room:', roomCode, 'User:', userId);

// Simular chamada ao handleQuizFinished
Promise.all([
  fetch(`http://localhost:5000/api/rooms/${roomCode}/users/${userId}/stats`),
  fetch(`http://localhost:5000/api/rooms/${roomCode}/ranking`)
]).then(async ([statsRes, rankingRes]) => {
  console.log('Stats status:', statsRes.status);
  console.log('Ranking status:', rankingRes.status);
  
  if (statsRes.ok) {
    const stats = await statsRes.json();
    console.log('Stats data:', JSON.stringify(stats, null, 2));
  }
  
  if (rankingRes.ok) {
    const ranking = await rankingRes.json();
    console.log('Ranking data:', JSON.stringify(ranking, null, 2));
  }
  
  console.log('=== TESTE CONCLUÍDO ===');
}).catch(err => {
  console.error('Erro:', err);
});