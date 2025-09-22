require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = process.env.PORT || 5000;

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'quiz_app', // Forçar uso do banco quiz_app
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
});

// Middleware - Configuração CORS para aceitar múltiplas origens
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];
    
    // Permitir requisições sem origin (ex: Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Testar conexão com banco de dados
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err);
  }
  console.log('Conectado ao banco de dados PostgreSQL');
  release();
});

// Socket.io para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
    console.log(`Usuário ${socket.id} entrou na sala ${roomCode}`);
  });

  socket.on('leave-room', (roomCode) => {
    socket.leave(roomCode);
    console.log(`Usuário ${socket.id} saiu da sala ${roomCode}`);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

// Função para gerar código único da sala
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Rotas da API

// Criar novo usuário
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const result = await pool.query(
      'INSERT INTO users (name, email, avatar) VALUES ($1, $2, $3) RETURNING *',
      [name, email || null, avatar || '👤']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Obter usuário por ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// Criar nova sala de quiz
app.post('/api/rooms', async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;
    const code = generateRoomCode();

    const result = await pool.query(
      'INSERT INTO quiz_rooms (code, name, description, created_by, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code, name, description, createdBy, 'waiting']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar sala:', error);
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

// Obter sala por código
app.get('/api/rooms/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quiz_rooms WHERE code = $1', [req.params.code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar sala:', error);
    res.status(500).json({ error: 'Erro ao buscar sala' });
  }
});

// Listar todas as salas
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT qr.*, u.name as created_by_name,
             COUNT(rp.id) as participant_count
      FROM quiz_rooms qr
      LEFT JOIN users u ON qr.created_by = u.id
      LEFT JOIN room_participants rp ON qr.id = rp.room_id
      WHERE qr.status != 'finished'
      GROUP BY qr.id, u.name
      ORDER BY qr.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar salas:', error);
    res.status(500).json({ error: 'Erro ao listar salas' });
  }
});

// Entrar em uma sala
app.post('/api/rooms/:code/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const roomCode = req.params.code;

    // Verificar se a sala existe
    const roomResult = await pool.query('SELECT * FROM quiz_rooms WHERE code = $1', [roomCode]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const room = roomResult.rows[0];

    // Verificar se o usuário existe
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Adicionar participante à sala
    await pool.query(
      'INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2) ON CONFLICT (room_id, user_id) DO NOTHING',
      [room.id, userId]
    );

    // Notificar outros participantes via socket
    io.to(roomCode).emit('user-joined', {
      userId,
      userName: userResult.rows[0].name,
      roomCode
    });

    res.json({ success: true, room: room });
  } catch (error) {
    console.error('Erro ao entrar na sala:', error);
    res.status(500).json({ error: 'Erro ao entrar na sala' });
  }
});

// Obter perguntas da sala
app.get('/api/rooms/:code/questions', async (req, res) => {
  try {
    const roomCode = req.params.code;

    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const questionsResult = await pool.query(
      'SELECT * FROM questions WHERE room_id = $1 ORDER BY id',
      [roomResult.rows[0].id]
    );

    res.json(questionsResult.rows);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

// Criar pergunta
app.post('/api/rooms/:code/questions', async (req, res) => {
  try {
    const roomCode = req.params.code;
    const { question, options, correct_answer, time_limit = 30 } = req.body;

    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const result = await pool.query(
      'INSERT INTO questions (room_id, question, options, correct_answer, time_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [roomResult.rows[0].id, question, JSON.stringify(options), correct_answer, time_limit]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro ao criar pergunta' });
  }
});

// Enviar resposta
app.post('/api/answers', async (req, res) => {
  try {
    const { userId, roomCode, questionId, answer, timeSpent } = req.body;

    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const questionResult = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pergunta não encontrada' });
    }

    const isCorrect = questionResult.rows[0].correct_answer === answer;
    const points = isCorrect ? Math.max(10 - Math.floor(timeSpent / 3), 1) : 0;

    const result = await pool.query(
      'INSERT INTO answers (user_id, room_id, question_id, answer, is_correct, points, time_spent) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, roomResult.rows[0].id, questionId, answer, isCorrect, points, timeSpent]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
    res.status(500).json({ error: 'Erro ao enviar resposta' });
  }
});

// Obter estatísticas do usuário
app.get('/api/rooms/:code/users/:userId/stats', async (req, res) => {
  try {
    const { code, userId } = req.params;

    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [code]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_answers,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
        SUM(points) as total_points,
        AVG(time_spent) as avg_time
      FROM answers 
      WHERE user_id = $1 AND room_id = $2
    `, [userId, roomResult.rows[0].id]);

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Obter ranking da sala
app.get('/api/rooms/:code/ranking', async (req, res) => {
  try {
    const { code } = req.params;

    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [code]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const rankingResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.avatar,
        SUM(a.points) as total_points,
        COUNT(a.id) as total_answers,
        SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_answers
      FROM users u
      LEFT JOIN answers a ON u.id = a.user_id AND a.room_id = $1
      WHERE u.id IN (SELECT user_id FROM room_participants WHERE room_id = $1)
      GROUP BY u.id, u.name, u.avatar
      ORDER BY total_points DESC
    `, [roomResult.rows[0].id]);

    res.json(rankingResult.rows);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Iniciar quiz
app.post('/api/rooms/:code/start', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      'UPDATE quiz_rooms SET status = $1, started_at = CURRENT_TIMESTAMP WHERE code = $2 RETURNING *',
      ['active', code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    io.to(code).emit('quiz-started');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao iniciar quiz:', error);
    res.status(500).json({ error: 'Erro ao iniciar quiz' });
  }
});

// Finalizar quiz
app.post('/api/rooms/:code/finish', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      'UPDATE quiz_rooms SET status = $1, finished_at = CURRENT_TIMESTAMP WHERE code = $2 RETURNING *',
      ['finished', code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    io.to(code).emit('quiz-finished');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao finalizar quiz:', error);
    res.status(500).json({ error: 'Erro ao finalizar quiz' });
  }
});

// Criar pergunta
app.post('/api/questions', async (req, res) => {
  try {
    const { roomId, questionText, alternatives, timeLimit } = req.body;

    const questionResult = await pool.query(
      'INSERT INTO questions (room_id, question_text, question_order, time_limit) VALUES ($1, $2, (SELECT COALESCE(MAX(question_order), 0) + 1 FROM questions WHERE room_id = $1), $3) RETURNING *',
      [roomId, questionText, timeLimit || 30]
    );

    const question = questionResult.rows[0];

    // Criar alternativas
    for (let i = 0; i < alternatives.length; i++) {
      await pool.query(
        'INSERT INTO alternatives (question_id, alternative_text, is_correct, alternative_order) VALUES ($1, $2, $3, $4)',
        [question.id, alternatives[i].text, alternatives[i].isCorrect, i + 1]
      );
    }

    res.json(question);
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro ao criar pergunta' });
  }
});

// Obter perguntas de uma sala
app.get('/api/rooms/:code/questions', async (req, res) => {
  try {
    const roomCode = req.params.code;

    // Obter ID da sala
    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const roomId = roomResult.rows[0].id;

    // Obter perguntas com alternativas
    const questionsResult = await pool.query(`
      SELECT q.*, 
             json_agg(
               json_build_object(
                 'id', a.id,
                 'text', a.alternative_text,
                 'isCorrect', a.is_correct,
                 'order', a.alternative_order
               ) ORDER BY a.alternative_order
             ) as alternatives
      FROM questions q
      LEFT JOIN alternatives a ON q.id = a.question_id
      WHERE q.room_id = $1
      GROUP BY q.id
      ORDER BY q.question_order
    `, [roomId]);

    res.json(questionsResult.rows);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

// Enviar resposta
app.post('/api/answers', async (req, res) => {
  try {
    const { roomCode, userId, questionId, alternativeId } = req.body;

    // Obter ID da sala
    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const roomId = roomResult.rows[0].id;

    // Verificar se a alternativa está correta
    const altResult = await pool.query('SELECT is_correct FROM alternatives WHERE id = $1', [alternativeId]);
    
    if (altResult.rows.length === 0) {
      return res.status(404).json({ error: 'Alternativa não encontrada' });
    }

    const isCorrect = altResult.rows[0].is_correct;

    // Salvar resposta
    await pool.query(
      'INSERT INTO user_answers (room_id, user_id, question_id, alternative_id, is_correct) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (room_id, user_id, question_id) DO UPDATE SET alternative_id = $4, is_correct = $5, answered_at = CURRENT_TIMESTAMP',
      [roomId, userId, questionId, alternativeId, isCorrect]
    );

    // Atualizar pontuação do participante
    if (isCorrect) {
      await pool.query(
        'UPDATE room_participants SET score = score + 10, correct_answers = correct_answers + 1, total_answers = total_answers + 1 WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
      );
    } else {
      await pool.query(
        'UPDATE room_participants SET total_answers = total_answers + 1 WHERE room_id = $1 AND user_id = $2',
        [roomId, userId]
      );
    }

    // Notificar outros usuários
    io.to(roomCode).emit('answer-submitted', {
      userId,
      questionId,
      isCorrect
    });

    res.json({ success: true, isCorrect });
  } catch (error) {
    console.error('Erro ao enviar resposta:', error);
    res.status(500).json({ error: 'Erro ao enviar resposta' });
  }
});

// Obter ranking da sala
app.get('/api/rooms/:code/ranking', async (req, res) => {
  try {
    const roomCode = req.params.code;

    // Obter ID da sala
    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const roomId = roomResult.rows[0].id;

    // Obter ranking
    const rankingResult = await pool.query(`
      SELECT u.name, u.avatar, rp.score, rp.correct_answers, rp.total_answers,
             CASE 
               WHEN rp.total_answers > 0 THEN ROUND((rp.correct_answers::float / rp.total_answers) * 100, 1)
               ELSE 0
             END as accuracy
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = $1
      ORDER BY rp.score DESC, rp.correct_answers DESC
    `, [roomId]);

    res.json(rankingResult.rows);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking' });
  }
});

// Iniciar quiz
app.post('/api/rooms/:code/start', async (req, res) => {
  try {
    const roomCode = req.params.code;

    const result = await pool.query(
      'UPDATE quiz_rooms SET status = $1, started_at = CURRENT_TIMESTAMP WHERE code = $2 RETURNING *',
      ['active', roomCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    // Notificar todos os participantes
    io.to(roomCode).emit('quiz-started', {
      roomCode,
      startedAt: result.rows[0].started_at
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao iniciar quiz:', error);
    res.status(500).json({ error: 'Erro ao iniciar quiz' });
  }
});

// Finalizar quiz
app.post('/api/rooms/:code/finish', async (req, res) => {
  try {
    const roomCode = req.params.code;

    const result = await pool.query(
      'UPDATE quiz_rooms SET status = $1, finished_at = CURRENT_TIMESTAMP WHERE code = $2 RETURNING *',
      ['finished', roomCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    // Notificar todos os participantes
    io.to(roomCode).emit('quiz-finished', {
      roomCode,
      finishedAt: result.rows[0].finished_at
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao finalizar quiz:', error);
    res.status(500).json({ error: 'Erro ao finalizar quiz' });
  }
});

// Obter estatísticas do usuário em uma sala
app.get('/api/rooms/:code/users/:userId/stats', async (req, res) => {
  try {
    const { code: roomCode, userId } = req.params;

    // Obter ID da sala
    const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const roomId = roomResult.rows[0].id;

    // Obter estatísticas do usuário
    const statsResult = await pool.query(`
      SELECT u.name, u.avatar, rp.score, rp.correct_answers, rp.total_answers,
             CASE 
               WHEN rp.total_answers > 0 THEN ROUND((rp.correct_answers::float / rp.total_answers) * 100, 1)
               ELSE 0
             END as accuracy,
             (SELECT COUNT(*) FROM questions WHERE room_id = $1) as total_questions
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = $1 AND rp.user_id = $2
    `, [roomId, userId]);

    if (statsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Participante não encontrado' });
    }

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});