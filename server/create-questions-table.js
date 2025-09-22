const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function createQuestionsTable() {
  try {
    console.log('Criando tabela de perguntas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Criando tabela de alternativas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
        answer_text TEXT NOT NULL,
        answer_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Adicionando coluna de status de configuração...');
    
    await pool.query(`
      ALTER TABLE quiz_rooms 
      ADD COLUMN IF NOT EXISTS is_configuring BOOLEAN DEFAULT true
    `);

    console.log('Tabelas criadas com sucesso!');
    
    // Verificar estrutura
    const questionsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_questions'
    `);
    
    const answersResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_answers'
    `);
    
    console.log('Estrutura da tabela quiz_questions:', questionsResult.rows);
    console.log('Estrutura da tabela quiz_answers:', answersResult.rows);
    
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  } finally {
    await pool.end();
  }
}

createQuestionsTable();