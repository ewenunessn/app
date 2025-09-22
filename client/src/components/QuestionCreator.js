import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionCreator.css';

function QuestionCreator({ user }) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      alternatives: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      alternatives: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateAlternative = (questionIndex, altIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].alternatives[altIndex][field] = value;
    setQuestions(newQuestions);
  };

  const setCorrectAlternative = (questionIndex, altIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].alternatives.forEach((alt, i) => {
      alt.is_correct = i === altIndex;
    });
    setQuestions(newQuestions);
  };

  const addAlternative = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].alternatives.push({
      text: '',
      is_correct: false
    });
    setQuestions(newQuestions);
  };

  const removeAlternative = (questionIndex, altIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].alternatives.length > 2) {
      newQuestions[questionIndex].alternatives.splice(altIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const validateForm = () => {
    if (!roomName.trim()) {
      setError('Por favor, insira um nome para a sala.');
      return false;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.question_text.trim()) {
        setError(`Por favor, insira o texto da pergunta ${i + 1}.`);
        return false;
      }

      const hasCorrectAlternative = question.alternatives.some(alt => alt.is_correct);
      if (!hasCorrectAlternative) {
        setError(`Por favor, selecione uma alternativa correta para a pergunta ${i + 1}.`);
        return false;
      }

      for (let j = 0; j < question.alternatives.length; j++) {
        if (!question.alternatives[j].text.trim()) {
          setError(`Por favor, insira o texto da alternativa ${j + 1} da pergunta ${i + 1}.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Criar sala
      const roomResponse = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: roomName,
          created_by: user.id,
        }),
      });

      if (!roomResponse.ok) {
        throw new Error('Erro ao criar sala');
      }

      const roomData = await roomResponse.json();
      const roomCode = roomData.code;

      // Adicionar perguntas
      for (const question of questions) {
        const questionResponse = await fetch(`http://localhost:5000/api/rooms/${roomCode}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question_text: question.question_text,
            alternatives: question.alternatives,
          }),
        });

        if (!questionResponse.ok) {
          throw new Error('Erro ao adicionar pergunta');
        }
      }

      setSuccess('Sala e perguntas criadas com sucesso!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Erro ao criar sala e perguntas.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="question-creator">
      <div className="creator-container">
        <div className="creator-header">
          <h2>Criar Sala de Quiz</h2>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Voltar ao Dashboard
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>✅ {success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="creator-form">
          <div className="room-info-section">
            <h3>Informações da Sala</h3>
            <div className="form-group">
              <label htmlFor="roomName">Nome da Sala:</label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ex: Quiz de Conhecimentos Gerais"
                required
              />
            </div>
          </div>

          <div className="questions-section">
            <div className="section-header">
              <h3>Perguntas</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="add-button"
              >
                + Adicionar Pergunta
              </button>
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="question-card">
                <div className="question-header">
                  <h4>Pergunta {questionIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="remove-button"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>Texto da Pergunta:</label>
                  <textarea
                    value={question.question_text}
                    onChange={(e) => updateQuestion(questionIndex, 'question_text', e.target.value)}
                    placeholder="Digite a pergunta aqui..."
                    rows="3"
                    required
                  />
                </div>

                <div className="alternatives-section">
                  <h5>Alternativas (Marque a correta):</h5>
                  
                  {question.alternatives.map((alternative, altIndex) => (
                    <div key={altIndex} className="alternative-item">
                      <div className="alternative-radio">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={alternative.is_correct}
                          onChange={() => setCorrectAlternative(questionIndex, altIndex)}
                          required
                        />
                      </div>
                      
                      <div className="alternative-input">
                        <input
                          type="text"
                          value={alternative.text}
                          onChange={(e) => updateAlternative(questionIndex, altIndex, 'text', e.target.value)}
                          placeholder={`Alternativa ${altIndex + 1}`}
                          required
                        />
                      </div>

                      {question.alternatives.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeAlternative(questionIndex, altIndex)}
                          className="remove-alt-button"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addAlternative(questionIndex)}
                    className="add-alt-button"
                  >
                    + Adicionar Alternativa
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? 'Criando Sala...' : 'Criar Sala de Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionCreator;