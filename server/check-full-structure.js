const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkStructure() {
  try {
    console.log('=== ESTRUTURA COMPLETA DO BANCO DE DADOS ===\n');
    
    // Verificar todas as tabelas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('Tabelas encontradas:');
    for (const table of tables.rows) {
      console.log(`\n--- Tabela: ${table.table_name} ---`);
      
      // Estrutura da tabela
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);
      
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(obrigatório)' : '(opcional)'}`);
      });
      
      // Chaves primárias
      const pks = await pool.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
      `, [table.table_name]);
      
      if (pks.rows.length > 0) {
        console.log(`  PK: ${pks.rows.map(r => r.column_name).join(', ')}`);
      }
      
      // Chaves estrangeiras
      const fks = await pool.query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY'
      `, [table.table_name]);
      
      fks.rows.forEach(fk => {
        console.log(`  FK: ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    }
    
    // Verificar dados existentes
    console.log('\n=== DADOS EXISTENTES ===');
    
    for (const table of tables.rows) {
      const count = await pool.query(`SELECT COUNT(*) as total FROM ${table.table_name}`);
      console.log(`${table.table_name}: ${count.rows[0].total} registros`);
    }
    
    console.log('\n=== ANÁLISE DE CONSISTÊNCIA ===');
    
    // Verificar se as perguntas têm alternativas
    const questionsWithoutAlternatives = await pool.query(`
      SELECT q.id, q.question_text
      FROM questions q
      LEFT JOIN alternatives a ON q.id = a.question_id
      WHERE a.id IS NULL
    `);
    
    if (questionsWithoutAlternatives.rows.length > 0) {
      console.log(`\n⚠️  ${questionsWithoutAlternatives.rows.length} perguntas sem alternativas:`);
      questionsWithoutAlternatives.rows.forEach(q => {
        console.log(`   - Q${q.id}: ${q.question_text}`);
      });
    }
    
    // Verificar alternativas corretas por pergunta
    const correctAlternatives = await pool.query(`
      SELECT q.id, q.question_text, COUNT(a.id) as correct_count
      FROM questions q
      LEFT JOIN alternatives a ON q.id = a.question_id AND a.is_correct = true
      GROUP BY q.id, q.question_text
    `);
    
    console.log('\nAlternativas corretas por pergunta:');
    correctAlternatives.rows.forEach(q => {
      console.log(`   Q${q.id}: ${q.correct_count} correta(s) - ${q.question_text}`);
    });
    
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
  } finally {
    await pool.end();
  }
}

checkStructure();