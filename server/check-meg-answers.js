const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function checkMegAnswers() {
  try {
    console.log('=== VERIFICANDO RESPOSTAS DA MEG NA SALA 0LT3MS ===');
    
    // Primeiro, pegar o ID da sala 0LT3MS
    const roomResult = await pool.query('SELECT id, name, code, status FROM quiz_rooms WHERE code = $1', ['0LT3MS']);
    
    if (roomResult.rows.length === 0) {
      console.log('Sala 0LT3MS não encontrada!');
      return;
    }
    
    const roomId = roomResult.rows[0].id;
    console.log(`Sala encontrada: ID ${roomId}, Código: ${roomResult.rows[0].code}, Status: ${roomResult.rows[0].status}`);
    
    // Verificar respostas da Meg (usuário 25)
    const answersResult = await pool.query(`
      SELECT 
        ua.id as answer_id,
        q.question_text,
        a.text as alternative_text,
        a.is_correct,
        ua.answered_at
      FROM user_answers ua
      JOIN questions q ON ua.question_id = q.id
      JOIN alternatives a ON ua.alternative_id = a.id
      WHERE ua.room_id = $1 AND ua.user_id = $2
      ORDER BY ua.answered_at
    `, [roomId, 25]);
    
    console.log(`\nRespostas encontradas: ${answersResult.rows.length}`);
    
    if (answersResult.rows.length > 0) {
      answersResult.rows.forEach((answer, index) => {
        console.log(`\nResposta ${index + 1}:`);
        console.log(`  Pergunta: ${answer.question_text}`);
        console.log(`  Alternativa: ${answer.alternative_text}`);
        console.log(`  Correta: ${answer.is_correct ? 'Sim' : 'Não'}`);
        console.log(`  Data: ${answer.answered_at}`);
      });
    } else {
      console.log('Meg não respondeu nenhuma pergunta nesta sala!');
    }
    
    // Verificar estatísticas do participante
    const statsResult = await pool.query(`
      SELECT score, correct_answers, total_answers
      FROM room_participants 
      WHERE room_id = $1 AND user_id = $2
    `, [roomId, 25]);
    
    if (statsResult.rows.length > 0) {
      console.log(`\nEstatísticas do participante:`);
      console.log(`  Score: ${statsResult.rows[0].score}`);
      console.log(`  Acertos: ${statsResult.rows[0].correct_answers}`);
      console.log(`  Total: ${statsResult.rows[0].total_answers}`);
    } else {
      console.log('\nMeg não está na tabela room_participants!');
    }
    
    // Verificar total de perguntas da sala
    const questionsResult = await pool.query('SELECT COUNT(*) as total FROM questions WHERE room_id = $1', [roomId]);
    console.log(`\nTotal de perguntas na sala: ${questionsResult.rows[0].total}`);
    
  } catch (error) {
    console.error('Erro ao verificar respostas:', error);
  } finally {
    await pool.end();
  }
}

checkMegAnswers();