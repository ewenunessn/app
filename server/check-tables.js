const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkTables() {
  try {
    // Verificar todas as tabelas
    const allTables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Todas as tabelas do banco:');
    allTables.rows.forEach(row => console.log(`- ${row.table_name}`));
    
    // Verificar se as tabelas novas existem
    const newTables = ['questions', 'alternatives', 'user_answers'];
    const oldTables = ['quiz_questions', 'quiz_answers'];
    
    console.log('\n=== VERIFICAÇÃO DE TABELAS ===');
    
    for (const table of newTables) {
      const exists = allTables.rows.some(row => row.table_name === table);
      console.log(`Tabela '${table}': ${exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
    }
    
    for (const table of oldTables) {
      const exists = allTables.rows.some(row => row.table_name === table);
      console.log(`Tabela '${table}': ${exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
    }
    
    // Se as tabelas novas não existirem, precisamos criar
    const questionsExists = allTables.rows.some(row => row.table_name === 'questions');
    if (!questionsExists) {
      console.log('\n⚠️  AS TABELAS NOVAS NÃO EXISTEM! É necessário executar o setup do banco de dados.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkTables();