const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123'
});

async function checkMegLastAnswers() {
  try {
    const result = await pool.query(`
      SELECT * FROM user_answers 
      WHERE user_id = 25 AND room_id = 15 
      ORDER BY answered_at DESC 
      LIMIT 5
    `);
    
    console.log('Últimas respostas da Meg:');
    result.rows.forEach((row, i) => {
      console.log(`${i+1}. Q:${row.question_id} - Alt:${row.alternative_id} - Correta:${row.is_correct} - ${row.answered_at}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await pool.end();
  }
}

checkMegLastAnswers();