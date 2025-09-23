const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'quiz_app',
  user: 'postgres',
  password: 'admin123'
});

async function checkAlternativesCorrect() {
  try {
    console.log('=== VERIFICANDO ALTERNATIVAS CORRETAS ===\n');
    
    const result = await pool.query(`
      SELECT q.id as question_id, 
             q.question_text, 
             a.id as alt_id, 
             a.text as alt_text, 
             a.is_correct,
             CASE 
               WHEN a.is_correct IS NULL THEN 'NULL'
               WHEN a.is_correct = true THEN '✓ CORRETA'
               ELSE '✗ ERRADA'
             END as status
      FROM questions q 
      JOIN alternatives a ON q.id = a.question_id 
      ORDER BY q.id, a.id
    `);
    
    let currentQ = null;
    result.rows.forEach(row => {
      if (currentQ !== row.question_id) {
        console.log(`\nQ${row.question_id}: ${row.question_text}`);
        currentQ = row.question_id;
      }
      console.log(`  Alt ${row.alt_id}: ${row.alt_text} - ${row.status}`);
    });
    
    // Verificar se há alternativas com is_correct NULL
    const nullCount = await pool.query(`
      SELECT COUNT(*) as null_count 
      FROM alternatives 
      WHERE is_correct IS NULL
    `);
    
    console.log(`\n=== RESUMO ===`);
    console.log(`Alternativas com is_correct = NULL: ${nullCount.rows[0].null_count}`);
    
    if (nullCount.rows[0].null_count > 0) {
      console.log('⚠️  ATENÇÃO: Há alternativas sem marcação de correta/incorreta!');
    }
    
    // Verificar se cada pergunta tem pelo menos uma alternativa correta
    const questionsWithoutCorrect = await pool.query(`
      SELECT q.id, q.question_text
      FROM questions q
      LEFT JOIN alternatives a ON q.id = a.question_id AND a.is_correct = true
      WHERE a.id IS NULL
    `);
    
    if (questionsWithoutCorrect.rows.length > 0) {
      console.log(`\n❌ ${questionsWithoutCorrect.rows.length} perguntas sem alternativa correta:`);
      questionsWithoutCorrect.rows.forEach(q => {
        console.log(`   - Q${q.id}: ${q.question_text}`);
      });
    } else {
      console.log('\n✓ Todas as perguntas têm pelo menos uma alternativa correta');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkAlternativesCorrect();