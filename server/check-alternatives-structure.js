const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkAlternativesStructure() {
  try {
    console.log('=== ESTRUTURA DA TABELA ALTERNATIVES ===\n');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'alternatives' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colunas da tabela alternatives:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(obrigatório)' : '(opcional)'}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkAlternativesStructure();