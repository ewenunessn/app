// Script de debug para testar o handleQuizFinished
export function debugQuizFinish(roomCode, userId) {
    console.log('=== DEBUG QUIZ FINISH ===');
    console.log('Room Code:', roomCode);
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    // Testar endpoint de estatísticas
    fetch(`http://localhost:5000/api/rooms/${roomCode}/users/${userId}/stats`)
        .then(response => {
            console.log('Stats Response Status:', response.status);
            console.log('Stats Response Headers:', Object.fromEntries(response.headers.entries()));
            return response.json();
        })
        .then(data => {
            console.log('Stats Data:', data);
        })
        .catch(error => {
            console.error('Stats Error:', error);
        });
    
    // Testar endpoint de ranking
    fetch(`http://localhost:5000/api/rooms/${roomCode}/ranking`)
        .then(response => {
            console.log('Ranking Response Status:', response.status);
            console.log('Ranking Response Headers:', Object.fromEntries(response.headers.entries()));
            return response.json();
        })
        .then(data => {
            console.log('Ranking Data:', data);
        })
        .catch(error => {
            console.error('Ranking Error:', error);
        });
    
    console.log('=== FIM DEBUG ===');
}