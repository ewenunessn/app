const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'quiz_app',
  user: 'postgres',
  password: 'admin123'
});

async function checkRoomQuestions() {
  try {
    console.log('=== VERIFICANDO PERGUNTAS DA SALA I84OGJ ===\n');
    
    // Obter perguntas da sala I84OGJ
    const questionsResult = await pool.query(`
      SELECT qr.code, qr.name as room_name, q.id as question_id, q.question_text
      FROM quiz_rooms qr 
      JOIN questions q ON qr.id = q.room_id 
      WHERE qr.code = $1 
      ORDER BY q.id
    `, ['I84OGJ']);
    
    if (questionsResult.rows.length === 0) {
      console.log('❌ Sala I84OGJ não encontrada ou sem perguntas!');
      return;
    }
    
    console.log(`Sala: ${questionsResult.rows[0].room_name} (${questionsResult.rows[0].code})`);
    console.log(`Total de perguntas: ${questionsResult.rows.length}\n`);
    
    for (const question of questionsResult.rows) {
      console.log(`Q${question.question_id}: ${question.question_text}`);
      
      // Verificar alternativas dessa pergunta
      const alternativesResult = await pool.query(`
        SELECT id, text, is_correct,
               CASE 
                 WHEN is_correct IS NULL THEN 'NULL'
                 WHEN is_correct = true THEN '✓ CORRETA'
                 ELSE '✗ ERRADA'
               END as status
        FROM alternatives 
        WHERE question_id = $1 
        ORDER BY id
      `, [question.question_id]);
      
      if (alternativesResult.rows.length === 0) {
        console.log('  ❌ Sem alternativas!');
      } else {
        alternativesResult.rows.forEach(alt => {
          console.log(`  Alt ${alt.id}: ${alt.text} - ${alt.status}`);
        });
        
        // Verificar se tem alternativa correta
        const correctCount = alternativesResult.rows.filter(alt => alt.is_correct === true).length;
        if (correctCount === 0) {
          console.log('  ❌ Nenhuma alternativa correta!');
        } else {
          console.log(`  ✓ ${correctCount} alternativa(s) correta(s)`);
        }
      }
      console.log('');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkRoomQuestions();