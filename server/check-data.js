const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

async function checkData() {
  try {
    console.log('=== VERIFICANDO DADOS DO BANCO ===\n');
    
    // Verificar salas
    const rooms = await pool.query('SELECT * FROM quiz_rooms ORDER BY id DESC LIMIT 5');
    console.log('Salas existentes:');
    if (rooms.rows.length === 0) {
      console.log('❌ Nenhuma sala encontrada!');
    } else {
      rooms.rows.forEach(row => {
        console.log(`ID: ${row.id}, Código: ${row.code}, Nome: ${row.name}`);
      });
    }
    
    console.log('\n=== VERIFICANDO PERGUNTAS ===');
    
    // Verificar perguntas nas tabelas novas
    const questions = await pool.query('SELECT * FROM questions ORDER BY id LIMIT 5');
    console.log(`\nTabela 'questions' (${questions.rows.length} registros):`);
    if (questions.rows.length === 0) {
      console.log('❌ Nenhuma pergunta encontrada na tabela nova!');
    } else {
      questions.rows.forEach(row => {
        console.log(`ID: ${row.id}, Sala: ${row.room_id}, Texto: ${row.question_text.substring(0, 50)}...`);
      });
    }
    
    // Verificar alternativas
    const alternatives = await pool.query('SELECT * FROM alternatives ORDER BY id LIMIT 10');
    console.log(`\nTabela 'alternatives' (${alternatives.rows.length} registros):`);
    if (alternatives.rows.length === 0) {
      console.log('❌ Nenhuma alternativa encontrada!');
    } else {
      alternatives.rows.forEach(row => {
        console.log(`ID: ${row.id}, Pergunta: ${row.question_id}, Texto: ${row.text.substring(0, 30)}...`);
      });
    }
    
    // Verificar perguntas nas tabelas antigas
    const oldQuestions = await pool.query('SELECT * FROM quiz_questions ORDER BY id LIMIT 5');
    console.log(`\nTabela 'quiz_questions' antiga (${oldQuestions.rows.length} registros):`);
    if (oldQuestions.rows.length > 0) {
      oldQuestions.rows.forEach(row => {
        console.log(`ID: ${row.id}, Sala: ${row.room_id}, Pergunta: ${row.question.substring(0, 50)}...`);
      });
    }
    
    console.log('\n=== RESUMO ===');
    console.log(`Tabela 'questions' (nova): ${questions.rows.length} perguntas`);
    console.log(`Tabela 'quiz_questions' (antiga): ${oldQuestions.rows.length} perguntas`);
    console.log(`Tabela 'alternatives': ${alternatives.rows.length} alternativas`);
    
    if (questions.rows.length === 0 && oldQuestions.rows.length > 0) {
      console.log('\n⚠️  ATENÇÃO: As perguntas estão apenas na tabela antiga!');
      console.log('É necessário migrar os dados das tabelas antigas para as novas.');
    }
    
    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkData();