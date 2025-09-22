const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function migrateData() {
  try {
    console.log('=== MIGRANDO DADOS DAS TABELAS ANTIGAS PARA AS NOVAS ===\n');
    
    // Buscar perguntas da tabela antiga que não existem na nova
    const oldQuestions = await pool.query(`
      SELECT qq.*, qr.id as room_id_correto 
      FROM quiz_questions qq
      JOIN quiz_rooms qr ON qq.room_id = qr.id
      WHERE qq.room_id NOT IN (SELECT DISTINCT room_id FROM questions WHERE room_id IS NOT NULL)
    `);
    
    console.log(`Encontradas ${oldQuestions.rows.length} perguntas antigas para migrar`);
    
    // Buscar alternativas antigas
    for (const question of oldQuestions.rows) {
      console.log(`\nMigrando pergunta ID ${question.id}: "${question.question.substring(0, 50)}..."`);
      
      // Inserir na tabela nova
      const newQuestion = await pool.query(`
        INSERT INTO questions (room_id, question_text) 
        VALUES ($1, $2) 
        RETURNING id
      `, [
        question.room_id_correto,
        question.question
      ]);
      
      const newQuestionId = newQuestion.rows[0].id;
      console.log(`  ✓ Pergunta migrada para ID ${newQuestionId}`);
      
      // Buscar alternativas antigas dessa pergunta
      const oldAlternatives = await pool.query(`
        SELECT * FROM quiz_answers 
        WHERE question_id = $1 
        ORDER BY id
      `, [question.id]);
      
      console.log(`  Encontradas ${oldAlternatives.rows.length} alternativas`);
      
      // Migrar alternativas
      for (const alt of oldAlternatives.rows) {
        await pool.query(`
          INSERT INTO alternatives (question_id, text, is_correct) 
          VALUES ($1, $2, $3)
        `, [
          newQuestionId,
          alt.answer_text,
          alt.is_correct || false
        ]);
      }
      
      console.log(`  ✓ ${oldAlternatives.rows.length} alternativas migradas`);
    }
    
    console.log('\n=== MIGRAÇÃO CONCLUÍDA ===');
    
    // Verificar resultado final
    const finalCheck = await pool.query(`
      SELECT COUNT(*) as total_questions 
      FROM questions 
      WHERE room_id IN (SELECT id FROM quiz_rooms)
    `);
    
    console.log(`Total de perguntas válidas após migração: ${finalCheck.rows[0].total_questions}`);
    
    await pool.end();
  } catch (error) {
    console.error('Erro na migração:', error);
  }
}

migrateData();