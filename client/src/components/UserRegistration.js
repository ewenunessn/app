import React, { useState } from 'react';
import './UserRegistration.css';

const avatars = [
  { id: 'avatar1', name: 'Avatar 1', image: '🦊' },
  { id: 'avatar2', name: 'Avatar 2', image: '🦁' },
  { id: 'avatar3', name: 'Avatar 3', image: '🐼' },
  { id: 'avatar4', name: 'Avatar 4', image: '🐨' },
  { id: 'avatar5', name: 'Avatar 5', image: '🦄' },
  { id: 'avatar6', name: 'Avatar 6', image: '🐸' },
];

function UserRegistration({ onUserRegistered }) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Por favor, insira seu nome');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          avatar: avatars.find(a => a.id === selectedAvatar)?.image || '🦊'
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }

      const user = await response.json();
      onUserRegistered(user);
    } catch (err) {
      setError('Erro ao criar usuário. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-registration">
      <div className="registration-container">
        <h1>🎯 Quiz Online</h1>
        <p className="subtitle">Bem-vindo! Vamos começar criando seu perfil.</p>
        
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Seu Nome:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={50}
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="form-group">
            <label>Escolha seu Avatar:</label>
            <div className="avatar-selection">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar.id)}
                >
                  <span className="avatar-emoji">{avatar.image}</span>
                  <span className="avatar-name">{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading ? 'Criando...' : 'Começar'}
          </button>
        </form>

        <div className="info-box">
          <p>💡 <strong>Dica:</strong> Use seu nome real para que seus amigos possam te reconhecer no ranking!</p>
        </div>
      </div>
    </div>
  );
}

export default UserRegistration;