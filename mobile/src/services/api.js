import axios from 'axios';
import { API_CONFIG } from '../config';
import { storageService } from './storage';

const api = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação (se existir)
api.interceptors.request.use(
  async (config) => {
    try {
      const { userId, userName } = await storageService.getUser();
      if (userId && userName) {
        // Adiciona informações do usuário no header para identificação
        config.headers['X-User-Id'] = userId;
        config.headers['X-User-Name'] = userName;
      }
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Serviços da API
export const quizService = {
  createQuiz: (quizData) => api.post('/quiz', quizData),
  getQuizzes: () => api.get('/quiz'),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  getQuizQuestions: (id) => api.get(`/quiz/${id}/questions`),
  saveResult: (id, resultData) => api.post(`/quiz/${id}/result`, resultData),
};

export const userService = {
  createUser: (userData) => api.post('/users', userData),
  getUser: (id) => api.get(`/users/${id}`),
};

export default api;