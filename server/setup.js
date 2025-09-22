const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Função para testar conexão PostgreSQL
async function testPostgreSQLConnection() {
  try {
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'postgres', // Conectar ao banco padrão primeiro
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin123'
    });

    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch (error) {
    console.log('❌ PostgreSQL não disponível:', error.message);
    return false;
  }
}

// Função para criar banco de dados PostgreSQL
async function createPostgreSQLDatabase() {
  try {
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin123'
    });

    // Criar banco de dados
    await pool.query('CREATE DATABASE quiz_app');
    console.log('✅ Banco de dados PostgreSQL criado com sucesso!');
    
    await pool.end();
    return true;
  } catch (error) {
    if (error.code === '42P04') {
      console.log('📊 Banco de dados já existe.');
      return true;
    }
    console.error('❌ Erro ao criar banco de dados:', error.message);
    return false;
  }
}

// Função para configurar tabelas PostgreSQL
async function setupPostgreSQLTables() {
  try {
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'quiz_app',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin123'
    });

    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        avatar VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS quiz_rooms (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(10) UNIQUE NOT NULL,
        created_by INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES quiz_rooms(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS alternatives (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL,
        text VARCHAR(500) NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE IF NOT EXISTS room_participants (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES quiz_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(room_id, user_id)
      )`,
      
      `CREATE TABLE IF NOT EXISTS user_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        alternative_id INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES quiz_rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (alternative_id) REFERENCES alternatives(id) ON DELETE CASCADE,
        UNIQUE(user_id, room_id, question_id)
      )`
    ];

    // Criar índices
    const createIndexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_quiz_rooms_code ON quiz_rooms (code)',
      'CREATE INDEX IF NOT EXISTS idx_questions_room_id ON questions (room_id)',
      'CREATE INDEX IF NOT EXISTS idx_alternatives_question_id ON alternatives (question_id)',
      'CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants (room_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_answers_user_room ON user_answers (user_id, room_id)'
    ];

    // Executar queries
    for (const query of createTableQueries) {
      await pool.query(query);
    }

    for (const query of createIndexQueries) {
      await pool.query(query);
    }

    console.log('✅ Tabelas PostgreSQL criadas com sucesso!');
    
    // Inserir dados de teste
    await insertTestData(pool);
    
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Erro ao configurar tabelas PostgreSQL:', error.message);
    return false;
  }
}

// Função para inserir dados de teste
async function insertTestData(pool) {
  try {
    // Verificar se já existem dados
    const result = await pool.query('SELECT COUNT(*) as count FROM users');
    
    if (result.rows[0].count === '0') {
      console.log('📝 Inserindo dados de teste...');

      // Inserir usuários de teste
      await pool.query(`
        INSERT INTO users (name, email, avatar) VALUES 
          ('Carol', 'carol@example.com', '👩‍💼'),
          ('João', 'joao@example.com', '👨‍💻'),
          ('Maria', 'maria@example.com', '👩‍🎓')
      `);

      // Inserir sala de teste
      await pool.query(`
        INSERT INTO quiz_rooms (name, code, created_by, status) VALUES 
          ('Quiz de Conhecimentos Gerais', 'QUIZ123', 1, 'waiting')
      `);

      // Inserir perguntas de teste
      const questions = [
        { text: 'Qual é a capital do Brasil?', roomId: 1 },
        { text: 'Quantos planetas existem no sistema solar?', roomId: 1 },
        { text: 'Qual é o maior país do mundo em extensão territorial?', roomId: 1 }
      ];

      for (const q of questions) {
        await pool.query('INSERT INTO questions (room_id, question_text) VALUES ($1, $2)', [q.roomId, q.text]);
      }

      // Inserir alternativas
      const alternatives = [
        // Pergunta 1
        { questionId: 1, text: 'São Paulo', correct: false },
        { questionId: 1, text: 'Rio de Janeiro', correct: false },
        { questionId: 1, text: 'Brasília', correct: true },
        { questionId: 1, text: 'Salvador', correct: false },
        // Pergunta 2
        { questionId: 2, text: '7', correct: false },
        { questionId: 2, text: '8', correct: true },
        { questionId: 2, text: '9', correct: false },
        { questionId: 2, text: '10', correct: false },
        // Pergunta 3
        { questionId: 3, text: 'Canadá', correct: false },
        { questionId: 3, text: 'China', correct: false },
        { questionId: 3, text: 'Estados Unidos', correct: false },
        { questionId: 3, text: 'Rússia', correct: true }
      ];

      for (const alt of alternatives) {
        await pool.query('INSERT INTO alternatives (question_id, text, is_correct) VALUES ($1, $2, $3)', 
          [alt.questionId, alt.text, alt.correct]);
      }

      console.log('✅ Dados de teste inseridos com sucesso!');
    } else {
      console.log('📊 Dados de teste já existem no banco.');
    }
  } catch (error) {
    console.error('❌ Erro ao inserir dados de teste:', error.message);
  }
}

// Função principal de configuração
async function setupDatabase() {
  console.log('🔧 Configurando banco de dados...');
  
  // Testar conexão PostgreSQL
  const postgresAvailable = await testPostgreSQLConnection();
  
  if (postgresAvailable) {
    console.log('✅ PostgreSQL está disponível!');
    
    // Criar banco de dados
    const dbCreated = await createPostgreSQLDatabase();
    
    if (dbCreated) {
      // Configurar tabelas
      await setupPostgreSQLTables();
      
      console.log('✅ Banco de dados PostgreSQL configurado com sucesso!');
      return 'postgresql';
    }
  }
  
  // Se PostgreSQL não estiver disponível, usar SQLite
  console.log('📦 Usando SQLite como fallback...');
  const { createTables, insertTestData } = require('./database');
  createTables();
  insertTestData();
  console.log('✅ Banco de dados SQLite configurado com sucesso!');
  return 'sqlite';
}

// Executar configuração se chamado diretamente
if (require.main === module) {
  setupDatabase()
    .then(dbType => {
      console.log(`🎉 Configuração concluída! Usando: ${dbType}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro na configuração:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };