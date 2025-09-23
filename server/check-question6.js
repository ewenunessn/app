const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'quiz_app',
  user: 'postgres',
  password: 'admin123'
});

async function checkQuestion6() {
  try {
    console.log('=== DETALHES DA PERGUNTA 6 (Brasil é?) ===\n');
    
    // Verificar a pergunta
    const questionResult = await pool.query(`
      SELECT q.id, q.question_text, q.room_id, qr.code as room_code
      FROM questions q
      JOIN quiz_rooms qr ON q.room_id = qr.id
      WHERE q.id = 6
    `);
    
    if (questionResult.rows.length === 0) {
      console.log('❌ Pergunta 6 não encontrada!');
      return;
    }
    
    const question = questionResult.rows[0];
    console.log(`Pergunta Q${question.id}: ${question.question_text}`);
    console.log(`Sala: ${question.room_code} (ID: ${question.room_id})\n`);
    
    // Verificar alternativas
    const alternativesResult = await pool.query(`
      SELECT a.id, a.text, a.is_correct,
             CASE 
               WHEN a.is_correct IS NULL THEN 'NULL'
               WHEN a.is_correct = true THEN '✓ CORRETA'
               ELSE '✗ ERRADA'
             END as status
      FROM alternatives a
      WHERE a.question_id = 6
      ORDER BY a.id
    `);
    
    console.log('Alternativas:');
    alternativesResult.rows.forEach(alt => {
      console.log(`  Alt ${alt.id}: "${alt.text}" - ${alt.status}`);
    });
    
    // Verificar respostas dos usuários para esta pergunta
    const answersResult = await pool.query(`
      SELECT ua.user_id, u.name, ua.alternative_id, ua.is_correct, ua.answered_at
      FROM user_answers ua
      JOIN users u ON ua.user_id = u.id
      WHERE ua.question_id = 6
      ORDER BY ua.answered_at DESC
    `);
    
    if (answersResult.rows.length > 0) {
      console.log('\nRespostas dos usuários:');
      answersResult.rows.forEach(answer => {
        console.log(`  ${answer.name} (ID: ${answer.user_id}): Alt ${answer.alternative_id} - ${answer.is_correct ? '✓ Correta' : '✗ Errada'} em ${answer.answered_at}`);
      });
    } else {
      console.log('\nNenhuma resposta registrada para esta pergunta.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkQuestion6();