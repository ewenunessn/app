import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Sala de ${user.name}`,
          description: 'Uma nova sala de quiz',
          createdBy: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sala');
      }

      const room = await response.json();
      navigate(`/room/${room.code}`);
    } catch (err) {
      setError('Erro ao criar sala. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Por favor, insira o código da sala');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomCode.toUpperCase()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao entrar na sala');
      }

      navigate(`/room/${roomCode.toUpperCaseCase()}`);
    } catch (err) {
      setError(err.message || 'Erro ao entrar na sala. Verifique o código.');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomClick = (roomCode) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="user-info">
          <span className="user-avatar">{user.avatar}</span>
          <span className="user-name">{user.name}</span>
        </div>
        <button onClick={onLogout} className="logout-button">
          Sair
        </button>
      </header>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Olá, {user.name}! 👋</h1>
          <p>Pronto para testar seus conhecimentos?</p>
        </div>

        <div className="actions-section">
          <div className="create-room-card">
            <h3>Criar Nova Sala</h3>
            <p>Crie sua própria sala de quiz e convide seus amigos!</p>
            <button 
              onClick={handleCreateRoom} 
              disabled={isLoading}
              className="create-room-button"
            >
              {isLoading ? 'Criando...' : 'Criar Sala'}
            </button>
          </div>

          <div className="join-room-card">
            <h3>Entrar em Sala</h3>
            <p>Junte-se a uma sala existente usando o código.</p>
            <form onSubmit={handleJoinRoom} className="join-room-form">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Código da sala (ex: ABC123)"
                maxLength={6}
                className={error ? 'error' : ''}
              />
              {error && <span className="error-message">{error}</span>}
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>

        {rooms.length > 0 && (
          <div className="rooms-section">
            <h3>Salas Disponíveis</h3>
            <div className="rooms-list">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  className="room-card"
                  onClick={() => handleRoomClick(room.code)}
                >
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <p>{room.description}</p>
                    <div className="room-meta">
                      <span className="room-code">Código: {room.code}</span>
                      <span className="participant-count">
                        👥 {room.participant_count} participantes
                      </span>
                    </div>
                  </div>
                  <div className={`room-status ${room.status}`}>
                    {room.status === 'waiting' ? 'Aguardando' : 
                     room.status === 'active' ? 'Em andamento' : 'Finalizado'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;