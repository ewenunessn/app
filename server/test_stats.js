const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'quiz_app',
  user: 'postgres',
  password: 'admin123'
});

async function testStats() {
  const roomCode = 'I84OGJ';
  const userId = 23;
  
  try {
    // Obter ID da sala
    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0) {
      console.log('Sala não encontrada');
      return;
    }
    const roomId = roomResult.rows[0].id;
    console.log('Room ID:', roomId);
    
    // Executar a query de estatísticas
    const statsResult = await pool.query(`
      SELECT 
        u.name, 
        u.avatar,
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 10 ELSE 0 END), 0) as score,
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END), 0) as correct_answers,
        COUNT(ua.id) as total_answers,
        CASE 
          WHEN COUNT(ua.id) > 0 THEN ROUND(CAST((SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(ua.id)) * 100 AS numeric), 1)
          ELSE 0
        END as accuracy,
        (SELECT COUNT(*) FROM questions WHERE room_id = $1) as total_questions
      FROM users u
      LEFT JOIN user_answers ua ON u.id = ua.user_id AND ua.room_id = $1
      WHERE u.id = $2
      GROUP BY u.id, u.name, u.avatar
    `, [roomId, userId]);
    
    console.log('Stats result:', statsResult.rows);
    
    if (statsResult.rows.length === 0) {
      console.log('Participante não encontrado');
    } else {
      console.log('Estatísticas encontradas:', statsResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    pool.end();
  }
}

testStats();