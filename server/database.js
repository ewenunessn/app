const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar banco de dados SQLite
const dbPath = path.join(__dirname, 'quiz.db');
const db = new sqlite3.Database(dbPath);

// Criar tabelas
const createTables = () => {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de salas
    db.run(`CREATE TABLE IF NOT EXISTS quiz_rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      created_by INTEGER NOT NULL,
      status TEXT DEFAULT 'waiting',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users (id)
    )`);

    // Tabela de perguntas
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES quiz_rooms (id) ON DELETE CASCADE
    )`);

    // Tabela de alternativas
    db.run(`CREATE TABLE IF NOT EXISTS alternatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
    )`);

    // Tabela de participantes da sala
    db.run(`CREATE TABLE IF NOT EXISTS room_participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES quiz_rooms (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(room_id, user_id)
    )`);

    // Tabela de respostas dos usuários
    db.run(`CREATE TABLE IF NOT EXISTS user_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      alternative_id INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES quiz_rooms (id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
      FOREIGN KEY (alternative_id) REFERENCES alternatives (id) ON DELETE CASCADE,
      UNIQUE(user_id, room_id, question_id)
    )`);

    // Índices para melhor performance
    db.run('CREATE INDEX IF NOT EXISTS idx_quiz_rooms_code ON quiz_rooms (code)');
    db.run('CREATE INDEX IF NOT EXISTS idx_questions_room_id ON questions (room_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_alternatives_question_id ON alternatives (question_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants (room_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_user_answers_user_room ON user_answers (user_id, room_id)');

    console.log('✅ Banco de dados SQLite configurado com sucesso!');
  });
};

// Inserir dados de teste
const insertTestData = () => {
  db.serialize(() => {
    // Verificar se já existem dados
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Erro ao verificar dados:', err);
        return;
      }

      if (row.count === 0) {
        console.log('📝 Inserindo dados de teste...');

        // Inserir usuário de teste
        db.run(`INSERT INTO users (name, email, avatar) VALUES (?, ?, ?)`,
          ['Carol', 'carol@example.com', '👩‍💼'],
          function(err) {
            if (err) {
              console.error('Erro ao inserir usuário:', err);
              return;
            }
            const userId = this.lastID;

            // Inserir sala de teste
            db.run(`INSERT INTO quiz_rooms (name, code, created_by, status) VALUES (?, ?, ?, ?)`,
              ['Quiz de Conhecimentos Gerais', 'QUIZ123', userId, 'waiting'],
              function(err) {
                if (err) {
                  console.error('Erro ao inserir sala:', err);
                  return;
                }
                const roomId = this.lastID;

                // Inserir perguntas de teste
                const questions = [
                  {
                    text: 'Qual é a capital do Brasil?',
                    alternatives: [
                      { text: 'São Paulo', correct: false },
                      { text: 'Rio de Janeiro', correct: false },
                      { text: 'Brasília', correct: true },
                      { text: 'Salvador', correct: false }
                    ]
                  },
                  {
                    text: 'Quantos planetas existem no sistema solar?',
                    alternatives: [
                      { text: '7', correct: false },
                      { text: '8', correct: true },
                      { text: '9', correct: false },
                      { text: '10', correct: false }
                    ]
                  },
                  {
                    text: 'Qual é o maior país do mundo em extensão territorial?',
                    alternatives: [
                      { text: 'Canadá', correct: false },
                      { text: 'China', correct: false },
                      { text: 'Estados Unidos', correct: false },
                      { text: 'Rússia', correct: true }
                    ]
                  }
                ];

                questions.forEach((q, index) => {
                  db.run(`INSERT INTO questions (room_id, question_text) VALUES (?, ?)`,
                    [roomId, q.text],
                    function(err) {
                      if (err) {
                        console.error('Erro ao inserir pergunta:', err);
                        return;
                      }
                      const questionId = this.lastID;

                      // Inserir alternativas
                      q.alternatives.forEach(alt => {
                        db.run(`INSERT INTO alternatives (question_id, text, is_correct) VALUES (?, ?, ?)`,
                          [questionId, alt.text, alt.correct],
                          function(err) {
                            if (err) {
                              console.error('Erro ao inserir alternativa:', err);
                            }
                          }
                        );
                      });
                    }
                  );
                });
              }
            );
          }
        );
      } else {
        console.log('📊 Dados de teste já existem no banco.');
      }
    });
  });
};

// Exportar funções
module.exports = {
  db,
  createTables,
  insertTestData
};