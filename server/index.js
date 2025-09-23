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
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001", 
      "http://localhost:3002", 
      "http://127.0.0.1:3000", 
      "http://127.0.0.1:3001",
      "http://192.168.18.12:3000",
      "http://192.168.18.12:3001",
      "http://*:3000",
      "http://*:3001"
    ],
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
      'http://127.0.0.1:3001',
      'http://192.168.18.12:3000',
      'http://192.168.18.12:3001',
      /^http:\/\/192\.168\./, // Permitir qualquer IP da rede 192.168.x.x
      /^http:\/\/10\./, // Permitir qualquer IP da rede 10.x.x.x
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[01])\./ // Permitir IPs da rede 172.16-31.x.x
    ];
    
    // Permitir requisições sem origin (ex: Postman)
    if (!origin) return callback(null, true);
    
    // Verificar se a origem está na lista permitida ou corresponde a um padrão regex
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
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

    // Verificar se a sala está configurada
    if (room.is_configuring) {
      return res.status(400).json({ error: 'Sala ainda está sendo configurada pelo criador' });
    }

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

// Obter perguntas da sala (nova estrutura)
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

    // Buscar alternativas para cada pergunta
    const questionsWithAnswers = [];
    for (const question of questionsResult.rows) {
      const alternativesResult = await pool.query(
        'SELECT * FROM alternatives WHERE question_id = $1 ORDER BY id',
        [question.id]
      );
      
      questionsWithAnswers.push({
        ...question,
        alternatives: alternativesResult.rows
      });
    }

    res.json(questionsWithAnswers);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

// Criar pergunta com alternativas (nova estrutura)
app.post('/api/rooms/:code/questions', async (req, res) => {
  try {
    const roomCode = req.params.code;
    const { question, answers, correct_answer } = req.body;

    // Verificar se a sala existe e se o usuário é o dono
    const roomResult = await pool.query('SELECT * FROM quiz_rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const room = roomResult.rows[0];
    
    // Verificar se a sala ainda está em configuração
    if (!room.is_configuring) {
      return res.status(400).json({ error: 'Sala já está aberta para jogar' });
    }

    // Criar a pergunta
    const result = await pool.query(
      'INSERT INTO questions (room_id, question_text) VALUES ($1, $2) RETURNING *',
      [room.id, question]
    );

    const newQuestion = result.rows[0];

    // Criar as alternativas
    for (let i = 0; i < answers.length; i++) {
      await pool.query(
        'INSERT INTO alternatives (question_id, text, is_correct) VALUES ($1, $2, $3)',
        [result.rows[0].id, answers[i], i === correct_answer ? true : false]
      );
    }

    res.json(newQuestion);
  } catch (error) {
    console.error('Erro ao criar pergunta:', error);
    res.status(500).json({ error: 'Erro ao criar pergunta' });
  }
});

// Finalizar configuração da sala (abrir para jogar)
app.post('/api/rooms/:code/finalize', async (req, res) => {
  try {
    const roomCode = req.params.code;
    const { userId } = req.body;

    // Verificar se a sala existe e se o usuário é o dono
    const roomResult = await pool.query('SELECT * FROM quiz_rooms WHERE code = $1', [roomCode]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const room = roomResult.rows[0];
    
    if (room.created_by !== userId) {
      return res.status(403).json({ error: 'Apenas o criador da sala pode finalizar a configuração' });
    }

    // Verificar se tem pelo menos uma pergunta
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM questions WHERE room_id = $1',
      [room.id]
    );

    if (parseInt(countResult.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Adicione pelo menos uma pergunta antes de abrir a sala' });
    }

    // Atualizar status da sala
    await pool.query(
      'UPDATE quiz_rooms SET is_configuring = false, status = $1 WHERE code = $2',
      ['waiting', roomCode]
    );

    res.json({ success: true, message: 'Sala aberta para jogar!' });
  } catch (error) {
    console.error('Erro ao finalizar sala:', error);
    res.status(500).json({ error: 'Erro ao finalizar sala' });
  }
});

// ROTA ANTIGA - DESABILITADA (não atualiza estatísticas)
// Enviar resposta
// app.post('/api/answers', async (req, res) => {
//   try {
//     const { userId, roomCode, questionId, alternativeId, timeSpent } = req.body;

//     const roomResult = await pool.query('SELECT id FROM quiz_rooms WHERE code = $1', [roomCode]);
//     if (roomResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Sala não encontrada' });
//     }

//     const questionResult = await pool.query('SELECT * FROM questions WHERE id = $1', [questionId]);
//     if (questionResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Pergunta não encontrada' });
//     }

//     // Buscar a alternativa selecionada
//     const alternativeResult = await pool.query('SELECT * FROM alternatives WHERE id = $1', [alternativeId]);
//     if (alternativeResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Alternativa não encontrada' });
//     }

//     const selectedAlternative = alternativeResult.rows[0];
//     const isCorrect = selectedAlternative.is_correct;
//     const points = isCorrect ? Math.max(10 - Math.floor(timeSpent / 3), 1) : 0;

//     const result = await pool.query(
//       'INSERT INTO user_answers (user_id, room_id, question_id, alternative_id, is_correct, answered_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
//       [userId, roomResult.rows[0].id, questionId, alternativeId, isCorrect]
//     );

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Erro ao enviar resposta:', error);
//     res.status(500).json({ error: 'Erro ao enviar resposta' });
//   }
// });

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
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 10 ELSE 0 END), 0) as total_points,
        COUNT(ua.id) as total_answers,
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END), 0) as correct_answers
      FROM users u
      INNER JOIN room_participants rp ON u.id = rp.user_id AND rp.room_id = $1
      LEFT JOIN user_answers ua ON u.id = ua.user_id AND ua.room_id = $1
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
                 'text', a.text,
                 'isCorrect', a.is_correct,
                 'order', a.id
               ) ORDER BY a.id
             ) as alternatives
      FROM questions q
      LEFT JOIN alternatives a ON q.id = a.question_id
      WHERE q.room_id = $1
      GROUP BY q.id
      ORDER BY q.id
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

    // Salvar resposta (permite atualizar se já existir)
    await pool.query(`
      INSERT INTO user_answers (room_id, user_id, question_id, alternative_id, is_correct, answered_at) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, room_id, question_id) 
      DO UPDATE SET 
        alternative_id = EXCLUDED.alternative_id,
        is_correct = EXCLUDED.is_correct,
        answered_at = EXCLUDED.answered_at
    `, [roomId, userId, questionId, alternativeId, isCorrect]);

    // Recalcular estatísticas do participante baseado em TODAS as respostas
    await pool.query(`
      INSERT INTO room_participants (room_id, user_id, score, correct_answers, total_answers, joined_at)
      VALUES ($1, $2, 0, 0, 0, CURRENT_TIMESTAMP)
      ON CONFLICT (room_id, user_id) 
      DO UPDATE SET 
        score = (SELECT COALESCE(SUM(CASE WHEN is_correct THEN 10 ELSE 0 END), 0) FROM user_answers WHERE user_id = $2 AND room_id = $1),
        correct_answers = (SELECT COALESCE(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END), 0) FROM user_answers WHERE user_id = $2 AND room_id = $1),
        total_answers = (SELECT COUNT(*) FROM user_answers WHERE user_id = $2 AND room_id = $1)
    `, [roomId, userId]);

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

    // Obter ranking baseado em user_answers
    const rankingResult = await pool.query(`
      SELECT 
        u.name, 
        u.avatar, 
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 10 ELSE 0 END), 0) as score,
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END), 0) as correct_answers,
        COUNT(ua.id) as total_answers,
        CASE 
          WHEN COUNT(ua.id) > 0 THEN ROUND(CAST((SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(ua.id)) * 100 AS numeric), 1)
          ELSE 0
        END as accuracy
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN user_answers ua ON u.id = ua.user_id AND ua.room_id = $1
      WHERE rp.room_id = $1
      GROUP BY u.id, u.name, u.avatar
      ORDER BY score DESC, correct_answers DESC
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

    // Obter estatísticas do usuário baseado em user_answers
    const statsResult = await pool.query(`
      SELECT 
        u.name, 
        u.avatar,
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 10 ELSE 0 END), 0) as score,
        COALESCE(SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END), 0) as correct_answers,
        COUNT(ua.id) as total_answers,
        CASE 
          WHEN COUNT(ua.id) > 0 THEN ROUND(CAST((SUM(CASE WHEN ua.is_correct THEN 1 ELSE 0 END)::float / COUNT(ua.id)) * 100 AS numeric), 1)
          ELSE 0
        END as accuracy,
        (SELECT COUNT(*) FROM questions WHERE room_id = $1) as total_questions
      FROM users u
      LEFT JOIN user_answers ua ON u.id = ua.user_id AND ua.room_id = $1
      WHERE u.id = $2
      GROUP BY u.id, u.name, u.avatar
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

// Iniciar servidor escutando em todas as interfaces de rede
server.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Acesse o servidor em: http://192.168.18.12:${port}`);
  console.log(`Ou use o IP local da máquina na rede`);
});