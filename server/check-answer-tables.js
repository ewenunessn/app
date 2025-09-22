const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'quiz_app',
  user: 'postgres',
  password: 'admin123'
});

async function checkTables() {
  try {
    // Verificar tabelas existentes
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%answer%' OR table_name LIKE '%participant%')
    `);
    
    console.log('Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(' - ' + row.table_name);
    });

    // Verificar estrutura de cada tabela
    for (const row of tablesResult.rows) {
      console.log(`\nEstrutura da tabela ${row.table_name}:`);
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [row.table_name]);
      
      columnsResult.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(obrigatório)' : '(opcional)'}`);
      });
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    pool.end();
  }
}

checkTables();