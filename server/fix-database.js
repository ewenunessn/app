const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app', // Forçar uso do banco quiz_app
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function fixDatabase() {
  try {
    console.log('🔧 Verificando e corrigindo estrutura do banco...');

    // Adicionar coluna description se não existir
    await pool.query(`
      ALTER TABLE quiz_rooms 
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    console.log('✅ Coluna description adicionada à tabela quiz_rooms');

    // Adicionar colunas started_at e finished_at se não existirem
    await pool.query(`
      ALTER TABLE quiz_rooms 
      ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
    `);
    await pool.query(`
      ALTER TABLE quiz_rooms 
      ADD COLUMN IF NOT EXISTS finished_at TIMESTAMP;
    `);
    console.log('✅ Colunas de timestamps adicionadas');

    // Verificar estrutura final
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_rooms' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estrutura final da tabela quiz_rooms:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });

    console.log('🎉 Banco de dados corrigido com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao corrigir banco de dados:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase();