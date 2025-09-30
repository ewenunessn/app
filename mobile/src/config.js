/**
 * Configurações centralizadas do aplicativo
 */

// Configuração da API
export const API_CONFIG = {
    BASE_URL: 'http://localhost:3001',
    FALLBACK_URL: 'https://quiz-educativo-api.vercel.app',
    TIMEOUT: 10000, // 10 segundos
};

// Configuração do Socket.io
export const SOCKET_CONFIG = {
    BASE_URL: 'https://quiz-educativo-api.vercel.app',
    FALLBACK_URL: 'http://192.168.1.100:5000',
};

// Informações do aplicativo
export const APP_INFO = {
    name: 'Quiz Educativo',
    icon: '🎯',
    description: 'Teste seus conhecimentos!',
    version: '1.0.0',
    author: 'Quiz Team',
};

// Configurações do quiz
export const QUIZ_CONFIG = {
    maxQuestions: 50,
    timePerQuestion: 30, // segundos
    passingScore: 70, // porcentagem
    showExplanations: true,
    allowRetry: true,
};