const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function testUpdateAnswer() {
  try {
    console.log('=== Teste de Atualização de Resposta ===\n');
    
    // Antes de atualizar
    console.log('ANTES da atualização:');
    const before = await pool.query(`
      SELECT ua.*, a.text as alternative_text, a.is_correct
      FROM user_answers ua
      JOIN alternatives a ON ua.alternative_id = a.id
      WHERE ua.user_id = 23 AND ua.room_id = 9 AND ua.question_id = 6
    `);
    
    if (before.rows.length > 0) {
      const answer = before.rows[0];
      console.log(`Resposta atual: alt ${answer.alternative_id} (${answer.alternative_text}) - ${answer.is_correct ? 'Correta' : 'Errada'}`);
      console.log(`Answered at: ${answer.answered_at}`);
    }
    
    // Simular o UPSERT que o endpoint faz
    console.log('\n--- Simulando envio de nova resposta (alt 18) ---');
    
    await pool.query(`
      INSERT INTO user_answers (room_id, user_id, question_id, alternative_id, is_correct, answered_at) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, room_id, question_id) 
      DO UPDATE SET 
        alternative_id = EXCLUDED.alternative_id,
        is_correct = EXCLUDED.is_correct,
        answered_at = EXCLUDED.answered_at
    `, [9, 23, 6, 18, true]); // Alternativa 18 é correta
    
    // Atualizar estatísticas
    await pool.query(`
      INSERT INTO room_participants (room_id, user_id, score, correct_answers, total_answers, joined_at)
      VALUES ($1, $2, 0, 0, 0, CURRENT_TIMESTAMP)
      ON CONFLICT (room_id, user_id) 
      DO UPDATE SET 
        score = (SELECT COALESCE(SUM(CASE WHEN is_correct THEN 10 ELSE 0 END), 0) FROM user_answers WHERE user_id = $2 AND room_id = $1),
        correct_answers = (SELECT COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) FROM user_answers WHERE user_id = $2 AND room_id = $1),
        total_answers = (SELECT COUNT(*) FROM user_answers WHERE user_id = $2 AND room_id = $1)
    `, [9, 23]);
    
    // Depois de atualizar
    console.log('\nDEPOIS da atualização:');
    const after = await pool.query(`
      SELECT ua.*, a.text as alternative_text, a.is_correct
      FROM user_answers ua
      JOIN alternatives a ON ua.alternative_id = a.id
      WHERE ua.user_id = 23 AND ua.room_id = 9 AND ua.question_id = 6
    `);
    
    if (after.rows.length > 0) {
      const answer = after.rows[0];
      console.log(`Nova resposta: alt ${answer.alternative_id} (${answer.alternative_text}) - ${answer.is_correct ? 'Correta' : 'Errada'}`);
      console.log(`Answered at: ${answer.answered_at}`);
    }
    
    // Verificar estatísticas atualizadas
    const stats = await pool.query(`
      SELECT score, correct_answers, total_answers
      FROM room_participants 
      WHERE user_id = 23 AND room_id = 9
    `);
    
    console.log('\nEstatísticas atualizadas:');
    if (stats.rows.length > 0) {
      const s = stats.rows[0];
      console.log(`Score: ${s.score}, Acertos: ${s.correct_answers}, Total: ${s.total_answers}`);
    }

    console.log('\n=== Teste concluído ===');
    pool.end();
  } catch (error) {
    console.error('Erro:', error);
    pool.end();
  }
}

testUpdateAnswer();