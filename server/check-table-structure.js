const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'quiz_app',
  user: 'postgres',
  password: 'admin123'
});

async function checkTableStructure() {
  try {
    console.log('=== VERIFICANDO ESTRUTURA DA TABELA ALTERNATIVES ===\n');
    
    // Verificar estrutura da tabela
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'alternatives'
      ORDER BY ordinal_position
    `);
    
    console.log('Colunas da tabela alternatives:');
    result.rows.forEach(row => {
      console.log(` - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkTableStructure();