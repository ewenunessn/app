import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RoomConfig.css';

function RoomConfig({ user }) {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentAnswers, setCurrentAnswers] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Carregar perguntas existentes
    loadQuestions();
  }, [roomCode]);

  const loadQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomCode}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar dados
    if (!currentQuestion.trim()) {
      setError('Digite a pergunta');
      setIsLoading(false);
      return;
    }

    if (currentAnswers.some(answer => !answer.trim())) {
      setError('Preencha todas as alternativas');
      setIsLoading(false);
      return;
    }

    if (correctAnswer === null || correctAnswer === undefined) {
      setError('Selecione a alternativa correta');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomCode}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          answers: currentAnswers,
          correct_answer: correctAnswer + 1 // +1 porque no banco é 1-indexado
        }),
      });

      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions([...questions, newQuestion]);
        
        // Limpar formulário
        setCurrentQuestion('');
        setCurrentAnswers(['', '', '', '']);
        setCorrectAnswer(0);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao adicionar pergunta');
      }
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizeRoom = async () => {
    if (questions.length === 0) {
      setError('Adicione pelo menos uma pergunta antes de abrir a sala');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomCode}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        navigate(`/room/${roomCode}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao finalizar sala');
      }
    } catch (error) {
      console.error('Erro ao finalizar sala:', error);
      setError('Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAnswer = (index, value) => {
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value;
    setCurrentAnswers(newAnswers);
  };

  const removeQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  return (
    <div className="room-config">
      <div className="config-header">
        <h2>Configurar Sala: {roomCode}</h2>
        <p className="config-subtitle">Adicione perguntas antes de abrir a sala para os jogadores</p>
      </div>

      <div className="questions-list">
        <h3>Perguntas Adicionadas ({questions.length})</h3>
        {questions.length === 0 ? (
          <p className="no-questions">Nenhuma pergunta adicionada ainda</p>
        ) : (
          questions && questions.length > 0 && questions.map((question, index) => (
            <div key={question.id} className="question-item">
              <div className="question-header">
                <span className="question-number">{index + 1}.</span>
                <span className="question-text">{question.question}</span>
                <button 
                  className="remove-question"
                  onClick={() => removeQuestion(question.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="add-question-form">
        <h3>Adicionar Nova Pergunta</h3>
        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label>Pergunta:</label>
            <textarea
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Digite sua pergunta aqui..."
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="answers-section">
            <label>Alternativas (marque a correta):</label>
            {currentAnswers && currentAnswers.length > 0 && currentAnswers.map((answer, index) => (
              <div key={index} className="answer-input">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === index}
                  onChange={() => setCorrectAnswer(index)}
                  disabled={isLoading}
                />
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => updateAnswer(index, e.target.value)}
                  placeholder={`Alternativa ${index + 1}`}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="add-question-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Adicionando...' : 'Adicionar Pergunta'}
            </button>
          </div>
        </form>
      </div>

      <div className="finalize-section">
        <button 
          className="finalize-btn"
          onClick={handleFinalizeRoom}
          disabled={isLoading || questions.length === 0}
        >
          {isLoading ? 'Finalizando...' : 'Abrir Sala para Jogar'}
        </button>
        {questions.length === 0 && (
          <p className="finalize-hint">Adicione pelo menos uma pergunta para abrir a sala</p>
        )}
      </div>
    </div>
  );
}

export default RoomConfig;