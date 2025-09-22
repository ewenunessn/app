import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import UserRegistration from './components/UserRegistration';
import Dashboard from './components/Dashboard';
import QuizRoom from './components/QuizRoom';
import QuestionCreator from './components/QuestionCreator';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário no localStorage
    const savedUser = localStorage.getItem('quizUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleUserLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('quizUser', JSON.stringify(userData));
  };

  const handleUserLogout = () => {
    setUser(null);
    localStorage.removeItem('quizUser');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">🔄</div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              user ? 
                <Navigate to="/dashboard" replace /> : 
                <UserRegistration onUserRegistered={handleUserLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? 
                <Dashboard user={user} onLogout={handleUserLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/room/:roomCode" 
            element={
              user ? 
                <QuizRoom user={user} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/create" 
            element={
              user ? 
                <QuestionCreator user={user} /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
