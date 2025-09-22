require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app', // Forçar uso do banco quiz_app
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

const createTables = async () => {
  try {
    console.log('🔧 Criando tabelas PostgreSQL...');

    // Criar tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        avatar VARCHAR(255) DEFAULT 'default-avatar.png',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar tabela de salas de quiz
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_rooms (
        id SERIAL PRIMARY KEY,
        code VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        created_by INTEGER REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        finished_at TIMESTAMP
      );
    `);

    // Criar tabela de perguntas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_order INTEGER NOT NULL,
        time_limit INTEGER DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar tabela de alternativas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alternatives (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        alternative_text TEXT NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        alternative_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar tabela de participantes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        score INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        total_answers INTEGER DEFAULT 0,
        UNIQUE(room_id, user_id)
      );
    `);

    // Criar tabela de respostas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_answers (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        alternative_id INTEGER REFERENCES alternatives(id) ON DELETE CASCADE,
        is_correct BOOLEAN NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id, question_id)
      );
    `);

    // Criar índices
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_quiz_rooms_code ON quiz_rooms(code);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_quiz_rooms_status ON quiz_rooms(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_questions_room_id ON questions(room_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_alternatives_question_id ON alternatives(question_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_answers_room_user ON user_answers(room_id, user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_answers_question ON user_answers(question_id);`);

    console.log('✅ Tabelas criadas com sucesso!');

    // Inserir dados de teste
    console.log('📝 Inserindo dados de teste...');

    // Verificar se já existem usuários
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (userCheck.rows[0].count == 0) {
      await pool.query(`
        INSERT INTO users (name, email, avatar) VALUES 
        ('Admin', 'admin@example.com', 'admin-avatar.png'),
        ('Jogador Teste', 'teste@example.com', 'player-avatar.png');
      `);

      await pool.query(`
        INSERT INTO quiz_rooms (code, name, description, created_by, status) VALUES 
        ('TEST123', 'Sala de Teste', 'Sala para testar o quiz', 1, 'waiting');
      `);

      await pool.query(`
        INSERT INTO questions (room_id, question_text, question_order, time_limit) VALUES 
        (1, 'Qual é a capital do Brasil?', 1, 30),
        (1, 'Quanto é 2 + 2?', 2, 30),
        (1, 'Qual é a cor do céu?', 3, 30);
      `);

      await pool.query(`
        INSERT INTO alternatives (question_id, alternative_text, is_correct, alternative_order) VALUES 
        (1, 'São Paulo', false, 1),
        (1, 'Rio de Janeiro', false, 2),
        (1, 'Brasília', true, 3),
        (1, 'Salvador', false, 4),
        (2, '3', false, 1),
        (2, '4', true, 2),
        (2, '5', false, 3),
        (2, '6', false, 4),
        (3, 'Verde', false, 1),
        (3, 'Vermelho', false, 2),
        (3, 'Azul', true, 3),
        (3, 'Amarelo', false, 4);
      `);

      console.log('✅ Dados de teste inseridos com sucesso!');
    } else {
      console.log('📊 Dados de teste já existem.');
    }

    console.log('🎉 Banco de dados PostgreSQL configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
  } finally {
    await pool.end();
  }
};

createTables();