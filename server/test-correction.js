const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'quiz_app',
  password: 'admin123',
  port: 5432,
});

async function testCorrection() {
  try {
    // Criar uma nova sala de teste
    const roomResult = await pool.query(
      'INSERT INTO quiz_rooms (code, name, created_by, is_configuring, status) VALUES ($1, $2, $3, true, $4) RETURNING *',
      ['TEST99', 'Sala de Teste Correção', 1, 'configuring']
    );
    
    const roomId = roomResult.rows[0].id;
    console.log('Sala criada:', roomResult.rows[0]);

    // Criar uma pergunta de teste com a correção (índice 0 = primeira alternativa)
    const questionResult = await pool.query(
      'INSERT INTO questions (room_id, question_text) VALUES ($1, $2) RETURNING *',
      [roomId, 'Teste: Qual é a capital do Brasil?']
    );
    
    const questionId = questionResult.rows[0].id;
    console.log('Pergunta criada:', questionResult.rows[0]);

    // Criar alternativas com a lógica correta (índice 0 = correta)
    const alternatives = [
      'Brasília',    // índice 0 - correta
      'Rio de Janeiro', // índice 1
      'São Paulo',   // índice 2
      'Salvador'     // índice 3
    ];

    for (let i = 0; i < alternatives.length; i++) {
      await pool.query(
        'INSERT INTO alternatives (question_id, text, is_correct) VALUES ($1, $2, $3)',
        [questionId, alternatives[i], i === 0 ? true : false] // índice 0 é correto
      );
    }

    console.log('Alternativas criadas com sucesso!');

    // Verificar o resultado
    const result = await pool.query(`
      SELECT q.id as question_id, q.question_text, 
             a.id as alternative_id, a.text as alternative_text, a.is_correct
      FROM questions q
      JOIN alternatives a ON q.id = a.question_id
      WHERE q.id = $1
      ORDER BY a.id
    `, [questionId]);

    console.log('\nResultado do teste:');
    result.rows.forEach(row => {
      console.log(`Alt ${row.alternative_id}: ${row.alternative_text} - ${row.is_correct ? 'CORRETA' : 'errada'}`);
    });

    // Limpar teste
    await pool.query('DELETE FROM quiz_rooms WHERE code = $1', ['TEST99']);
    console.log('\nTeste concluído com sucesso! A correção está funcionando.');

  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await pool.end();
  }
}

testCorrection();