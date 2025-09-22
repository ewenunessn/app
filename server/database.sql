-- Criação do banco de dados e tabelas para o Quiz App

-- Criar banco de dados (execute separadamente se necessário)
-- CREATE DATABASE quiz_app;

-- Conectar ao banco quiz_app
\c quiz_app;

-- Tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'default-avatar.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de salas de quiz
CREATE TABLE quiz_rooms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'waiting', -- waiting, active, finished
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP
);

-- Tabela de perguntas
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    time_limit INTEGER DEFAULT 30, -- segundos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de alternativas
CREATE TABLE alternatives (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    alternative_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    alternative_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de participantes da sala
CREATE TABLE room_participants (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_answers INTEGER DEFAULT 0,
    UNIQUE(room_id, user_id)
);

-- Tabela de respostas dos usuários
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES quiz_rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    alternative_id INTEGER REFERENCES alternatives(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id, question_id)
);

-- Índices para melhor performance
CREATE INDEX idx_quiz_rooms_code ON quiz_rooms(code);
CREATE INDEX idx_quiz_rooms_status ON quiz_rooms(status);
CREATE INDEX idx_questions_room_id ON questions(room_id);
CREATE INDEX idx_alternatives_question_id ON alternatives(question_id);
CREATE INDEX idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX idx_user_answers_room_user ON user_answers(room_id, user_id);
CREATE INDEX idx_user_answers_question ON user_answers(question_id);

-- Inserir dados de teste
INSERT INTO users (name, avatar) VALUES 
('Admin', 'admin-avatar.png'),
('Jogador Teste', 'player-avatar.png');

-- Criar sala de teste
INSERT INTO quiz_rooms (code, name, description, created_by, status) VALUES 
('TEST123', 'Sala de Teste', 'Sala para testar o quiz', 1, 'waiting');

-- Criar perguntas de teste
INSERT INTO questions (room_id, question_text, question_order, time_limit) VALUES 
(1, 'Qual é a capital do Brasil?', 1, 30),
(1, 'Quanto é 2 + 2?', 2, 30),
(1, 'Qual é a cor do céu?', 3, 30);

-- Criar alternativas para pergunta 1
INSERT INTO alternatives (question_id, alternative_text, is_correct, alternative_order) VALUES 
(1, 'São Paulo', false, 1),
(1, 'Rio de Janeiro', false, 2),
(1, 'Brasília', true, 3),
(1, 'Salvador', false, 4);

-- Criar alternativas para pergunta 2
INSERT INTO alternatives (question_id, alternative_text, is_correct, alternative_order) VALUES 
(2, '3', false, 1),
(2, '4', true, 2),
(2, '5', false, 3),
(2, '6', false, 4);

-- Criar alternativas para pergunta 3
INSERT INTO alternatives (question_id, alternative_text, is_correct, alternative_order) VALUES 
(3, 'Verde', false, 1),
(3, 'Vermelho', false, 2),
(3, 'Azul', true, 3),
(3, 'Amarelo', false, 4);