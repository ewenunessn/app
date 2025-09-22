-- Criar banco de dados
CREATE DATABASE quiz_app;

-- Conectar ao banco de dados
\c quiz_app;

-- Criar tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de salas de quiz
CREATE TABLE quiz_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_by INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar tabela de perguntas
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES quiz_rooms(id) ON DELETE CASCADE
);

-- Criar tabela de alternativas
CREATE TABLE alternatives (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Criar tabela de participantes da sala
CREATE TABLE room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES quiz_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)
);

-- Criar tabela de respostas dos usuários
CREATE TABLE user_answers (
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
);

-- Criar índices para melhor performance
CREATE INDEX idx_quiz_rooms_code ON quiz_rooms(code);
CREATE INDEX idx_questions_room_id ON questions(room_id);
CREATE INDEX idx_alternatives_question_id ON alternatives(question_id);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_user_answers_user_room ON user_answers(user_id, room_id);

-- Inserir dados de teste
INSERT INTO users (name, email, avatar) VALUES 
    ('Carol', 'carol@example.com', '👩‍💼'),
    ('João', 'joao@example.com', '👨‍💻'),
    ('Maria', 'maria@example.com', '👩‍🎓');

-- Inserir sala de teste
INSERT INTO quiz_rooms (name, code, created_by, status) VALUES 
    ('Quiz de Conhecimentos Gerais', 'QUIZ123', 1, 'waiting');

-- Inserir perguntas de teste
INSERT INTO questions (room_id, question_text) VALUES 
    (1, 'Qual é a capital do Brasil?'),
    (1, 'Quantos planetas existem no sistema solar?'),
    (1, 'Qual é o maior país do mundo em extensão territorial?');

-- Inserir alternativas para a pergunta 1
INSERT INTO alternatives (question_id, text, is_correct) VALUES 
    (1, 'São Paulo', false),
    (1, 'Rio de Janeiro', false),
    (1, 'Brasília', true),
    (1, 'Salvador', false);

-- Inserir alternativas para a pergunta 2
INSERT INTO alternatives (question_id, text, is_correct) VALUES 
    (2, '7', false),
    (2, '8', true),
    (2, '9', false),
    (2, '10', false);

-- Inserir alternativas para a pergunta 3
INSERT INTO alternatives (question_id, text, is_correct) VALUES 
    (3, 'Canadá', false),
    (3, 'China', false),
    (3, 'Estados Unidos', false),
    (3, 'Rússia', true);