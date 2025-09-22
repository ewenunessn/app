const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app', // Forçar uso do banco quiz_app
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT current_database(), version()');
    console.log('Banco atual:', result.rows[0].current_database);
    console.log('Versão PostgreSQL:', result.rows[0].version);
    
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%quiz%' ORDER BY table_name");
    console.log('Tabelas do quiz:', tables.rows);
    
    if (tables.rows.length > 0) {
      const columns = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'quiz_rooms' ORDER BY ordinal_position");
      console.log('Colunas da tabela quiz_rooms:', columns.rows);
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

testConnection();