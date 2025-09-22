const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function testAnswerFlow() {
  try {
    console.log('=== Teste de Fluxo de Respostas ===\n');
    
    // 1. Verificar respostas atuais do usuário 23 na sala 9
    const currentAnswers = await pool.query(`
      SELECT q.id as question_id, q.question_text, ua.alternative_id, ua.is_correct, ua.answered_at
      FROM questions q
      LEFT JOIN user_answers ua ON q.id = ua.question_id AND ua.user_id = 23 AND ua.room_id = 9
      WHERE q.room_id = 9
      ORDER BY q.id
    `);
    
    console.log('Respostas atuais do usuário 23 na sala 9:');
    currentAnswers.rows.forEach(row => {
      console.log(`Q${row.question_id}: ${row.alternative_id ? `Respondida (alt ${row.alternative_id}, ${row.is_correct ? 'correta' : 'errada'})` : 'Não respondida'}`);
    });
    
    // 2. Verificar estatísticas do participante
    const participantStats = await pool.query(`
      SELECT score, correct_answers, total_answers
      FROM room_participants 
      WHERE user_id = 23 AND room_id = 9
    `);
    
    console.log('\nEstatísticas atuais do participante:');
    if (participantStats.rows.length > 0) {
      const stats = participantStats.rows[0];
      console.log(`Score: ${stats.score}, Acertos: ${stats.correct_answers}, Total: ${stats.total_answers}`);
    } else {
      console.log('Participante não encontrado');
    }
    
    // 3. Verificar ranking
    const ranking = await pool.query(`
      SELECT u.name, 
             COALESCE(SUM(CASE WHEN ua.is_correct THEN 10 ELSE 0 END), 0) as score,
             COALESCE(SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END), 0) as correct_answers,
             COUNT(ua.id) as total_answers
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN user_answers ua ON u.id = ua.user_id AND ua.room_id = 9
      WHERE rp.room_id = 9
      GROUP BY u.id, u.name
      ORDER BY score DESC
    `);
    
    console.log('\nRanking atual:');
    ranking.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name}: ${row.score} pontos (${row.correct_answers}/${row.total_answers})`);
    });

    console.log('\n=== Teste concluído ===');
    pool.end();
  } catch (error) {
    console.error('Erro:', error);
    pool.end();
  }
}

testAnswerFlow();