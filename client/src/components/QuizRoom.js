import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './QuizRoom.css';

function QuizRoom({ user }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    // Conectar ao socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Entrar na sala
    newSocket.emit('join-room', roomCode);

    // Configurar listeners do socket
    newSocket.on('user-joined', (data) => {
      console.log('Usuário entrou:', data);
      // Atualizar lista de participantes
    });

    newSocket.on('quiz-started', () => {
      setRoom(prev => ({ ...prev, status: 'active' }));
    });

    newSocket.on('quiz-finished', () => {
      handleQuizFinished();
    });

    newSocket.on('answer-submitted', () => {
      // Atualizar estado se necessário
    });

    return () => {
      newSocket.emit('leave-room', roomCode);
      newSocket.close();
    };
  }, [roomCode]);

  useEffect(() => {
    fetchRoomData();
  }, []);

  useEffect(() => {
    let timer;
    if (room?.status === 'active' && timeLeft > 0 && !hasAnswered) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, hasAnswered, room?.status]);

  const fetchRoomData = async () => {
    try {
      // Buscar informações da sala
      const roomResponse = await fetch(`http://localhost:5000/api/rooms/${roomCode}`);
      if (!roomResponse.ok) throw new Error('Sala não encontrada');
      const roomData = await roomResponse.json();
      setRoom(roomData);

      // Buscar perguntas
      const questionsResponse = await fetch(`http://localhost:5000/api/rooms/${roomCode}/questions`);
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData);
      }

      // Entrar na sala
      await fetch(`http://localhost:5000/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados da sala');
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (alternativeId) => {
    if (hasAnswered) return;

    setSelectedAnswer(alternativeId);
    setHasAnswered(true);

    try {
      await fetch('http://localhost:5000/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode,
          userId: user.id,
          questionId: questions[currentQuestionIndex].id,
          alternativeId,
        }),
      });

      // Avançar para próxima pergunta após 2 segundos
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setHasAnswered(false);
          setTimeLeft(30);
        } else {
          // Fim do quiz
          handleQuizFinished();
        }
      }, 2000);
    } catch (err) {
      console.error('Erro ao enviar resposta:', err);
    }
  };

  const handleTimeUp = () => {
    setHasAnswered(true);
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setTimeLeft(30);
      } else {
        handleQuizFinished();
      }
    }, 2000);
  };

  const handleQuizFinished = async () => {
    try {
      // Buscar estatísticas do usuário
      const statsResponse = await fetch(`http://localhost:5000/api/rooms/${roomCode}/users/${user.id}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
      }

      // Buscar ranking
      const rankingResponse = await fetch(`http://localhost:5000/api/rooms/${roomCode}/ranking`);
      if (rankingResponse.ok) {
        const rankingData = await rankingResponse.json();
        setRanking(rankingData);
      }

      setShowResults(true);
    } catch (err) {
      console.error('Erro ao buscar resultados:', err);
    }
  };

  const handleStartQuiz = async () => {
    try {
      await fetch(`http://localhost:5000/api/rooms/${roomCode}/start`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Erro ao iniciar quiz:', err);
    }
  };

  const handleFinishQuiz = async () => {
    try {
      await fetch(`http://localhost:5000/api/rooms/${roomCode}/finish`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Erro ao finalizar quiz:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="quiz-room loading">
        <div className="loading-spinner">🔄</div>
        <p>Carregando sala...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-room error">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-results">
        <div className="results-container">
          <div className="user-results">
            <h2>🎉 Parabéns, {user.name}!</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Pontuação</h3>
                <p className="stat-value">{userStats?.score || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Acertos</h3>
                <p className="stat-value">
                  {userStats?.correct_answers || 0}/{userStats?.total_questions || 0}
                </p>
              </div>
              <div className="stat-card">
                <h3>Precisão</h3>
                <p className="stat-value">{userStats?.accuracy || 0}%</p>
              </div>
            </div>
            
            <div className="prize-message">
              <h3>🏆 Você ganhou um brinde!</h3>
              <p>Parabéns pela participação! Entre em contato com o organizador para receber seu prêmio.</p>
            </div>
          </div>

          <div className="ranking-section">
            <h3>Ranking Final</h3>
            <div className="ranking-list">
              {ranking.map((participant, index) => (
                <div key={index} className={`ranking-item ${participant.name === user.name ? 'current-user' : ''}`}>
                  <div className="rank-position">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="rank-info">
                    <span className="rank-name">{participant.name}</span>
                    <span className="rank-score">{participant.score} pts</span>
                  </div>
                  <div className="rank-accuracy">
                    {participant.accuracy}% acerto
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="back-button">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Estado aguardando início
  if (room?.status === 'waiting') {
    return (
      <div className="quiz-room waiting">
        <div className="room-info">
          <h2>Sala: {room.name}</h2>
          <p>Código: <strong>{room.code}</strong></p>
          <p>Aguardando o início do quiz...</p>
          
          <div className="participants-list">
            <h3>Participantes:</h3>
            <div className="participants-grid">
              {/* Lista de participantes seria carregada aqui */}
              <div className="participant">
                <span className="participant-avatar">{user.avatar}</span>
                <span className="participant-name">{user.name} (Você)</span>
              </div>
            </div>
          </div>

          {room.created_by === user.id && (
            <button onClick={handleStartQuiz} className="start-quiz-button">
              Iniciar Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // Estado do quiz ativo
  if (room?.status === 'active' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="quiz-room active">
        <div className="quiz-header">
          <div className="question-counter">
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </div>
          <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
            ⏰ {timeLeft}s
          </div>
        </div>

        <div className="question-container">
          <h3 className="question-text">{currentQuestion.question_text}</h3>
          
          <div className="alternatives-grid">
            {currentQuestion.alternatives.map((alternative) => (
              <button
                key={alternative.id}
                className={`alternative-button ${
                  selectedAnswer === alternative.id
                    ? alternative.is_correct
                      ? 'correct'
                      : 'incorrect'
                    : ''
                } ${hasAnswered ? (alternative.is_correct ? 'correct' : 'disabled') : ''}`}
                onClick={() => handleAnswerSubmit(alternative.id)}
                disabled={hasAnswered}
              >
                {alternative.text}
              </button>
            ))}
          </div>

          {hasAnswered && (
            <div className="answer-feedback">
              {questions[currentQuestionIndex].alternatives.find(a => a.id === selectedAnswer)?.is_correct
                ? '✅ Correto!'
                : '❌ Incorreto!'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default QuizRoom;