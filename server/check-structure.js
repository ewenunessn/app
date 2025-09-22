const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkStructure() {
  try {
    console.log('=== ESTRUTURA DAS TABELAS ===\n');
    
    // Verificar estrutura da tabela questions
    const questionsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'questions' 
      ORDER BY ordinal_position
    `);
    
    console.log('Tabela questions:');
    questionsStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(obrigatório)' : '(opcional)'}`);
    });
    
    // Verificar estrutura da tabela quiz_questions
    const oldQuestionsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_questions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nTabela quiz_questions (antiga):');
    oldQuestionsStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(obrigatório)' : '(opcional)'}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkStructure();