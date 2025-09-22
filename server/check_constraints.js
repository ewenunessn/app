const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function checkConstraints() {
  try {
    // Verificar constraints
    const constraintsResult = await pool.query(`
      SELECT table_name, constraint_name, constraint_type 
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_answers'
    `);
    
    console.log('Constraints da tabela user_answers:');
    constraintsResult.rows.forEach(row => {
      console.log(`- ${row.constraint_name}: ${row.constraint_type}`);
    });

    // Verificar colunas
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'user_answers' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nColunas da tabela user_answers:');
    columnsResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}) ${row.is_nullable}`);
    });

    // Verificar índices únicos
    const indexesResult = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'user_answers' 
      AND indexdef LIKE '%UNIQUE%'
    `);
    
    console.log('\nÍndices únicos:');
    indexesResult.rows.forEach(row => {
      console.log(`- ${row.indexname}: ${row.indexdef}`);
    });

    pool.end();
  } catch (error) {
    console.error('Erro:', error);
    pool.end();
  }
}

checkConstraints();