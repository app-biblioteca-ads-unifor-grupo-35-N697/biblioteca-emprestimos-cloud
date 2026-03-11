import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const mockReservas = [
  {
    id: 1,
    livro: 'Dom Casmurro',
    autor: 'Machado de Assis',
    dataReserva: '2026-02-15',
    dataDevolucao: '2026-03-15',
    status: 'Ativa',
  },
  {
    id: 2,
    livro: 'Grande Sertão: Veredas',
    autor: 'Guimarães Rosa',
    dataReserva: '2026-02-20',
    dataDevolucao: '2026-03-20',
    status: 'Pendente',
  },
  {
    id: 3,
    livro: 'O Cortiço',
    autor: 'Aluísio Azevedo',
    dataReserva: '2026-01-10',
    dataDevolucao: '2026-02-10',
    status: 'Concluída',
  },
  {
    id: 4,
    livro: 'Memórias Póstumas de Brás Cubas',
    autor: 'Machado de Assis',
    dataReserva: '2026-02-01',
    dataDevolucao: '2026-03-01',
    status: 'Ativa',
  },
  {
    id: 5,
    livro: 'Capitães da Areia',
    autor: 'Jorge Amado',
    dataReserva: '2025-12-20',
    dataDevolucao: '2026-01-20',
    status: 'Cancelada',
  },
];

function Reservas() {
  const [abaAtiva, setAbaAtiva] = useState('ativas');
  const [reservas, setReservas] = useState(mockReservas);

  // Pegar nome do usuário do localStorage
  const usuarioJSON = localStorage.getItem('usuario');
  const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : { nome: 'Aluno' };

  // Filtrar reservas por status
  const getReservasFiltradas = () => {
    if (abaAtiva === 'ativas') {
      return reservas.filter((r) => r.status === 'Ativa');
    } else if (abaAtiva === 'historico') {
      return reservas.filter((r) => r.status === 'Concluída');
    } else {
      return reservas;
    }
  };

  // Formatar data
  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // Cancelar reserva
  const handleCancelarReserva = (id) => {
    setReservas(
      reservas.map((r) => (r.id === id ? { ...r, status: 'Cancelada' } : r))
    );
  };

  const reservasFiltradas = getReservasFiltradas();

  // Cor da borda esquerda por status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativa':
        return '#10b981';
      case 'Pendente':
        return '#f59e0b';
      case 'Concluída':
        return '#3b82f6';
      case 'Cancelada':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Classe do badge de status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Ativa':
        return 'badge-ativa';
      case 'Pendente':
        return 'badge-pendente';
      case 'Concluída':
        return 'badge-concluida';
      case 'Cancelada':
        return 'badge-cancelada';
      default:
        return '';
    }
  };

  return (
    <div className="reservas-page">
      <Navbar />

      <section className="reservas-section">
        <div className="reservas-container">
          <h1>Minhas Reservas</h1>
          <p className="reservas-subtitle">Usuário: {usuario.nome || 'Aluno'}</p>

          {/* Abas */}
          <div className="reservas-tabs fade-in">
            <button
              className={`tab-button ${abaAtiva === 'ativas' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('ativas')}
            >
              Ativas
            </button>
            <button
              className={`tab-button ${abaAtiva === 'historico' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('historico')}
            >
              Histórico
            </button>
            <button
              className={`tab-button ${abaAtiva === 'todas' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('todas')}
            >
              Todas
            </button>
          </div>

          {/* Lista de Reservas */}
          {reservasFiltradas.length > 0 ? (
            <div className="reservas-list fade-in">
              {reservasFiltradas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="reserva-item"
                  style={{ borderLeftColor: getStatusColor(reserva.status) }}
                >
                  <div className="reserva-info">
                    <h3>{reserva.livro}</h3>
                    <p className="reserva-autor">{reserva.autor}</p>
                    <div className="reserva-datas">
                      <span>Reservado em: {formatarData(reserva.dataReserva)}</span>
                      <span>Previsto para: {formatarData(reserva.dataDevolucao)}</span>
                    </div>
                  </div>

                  <div className="reserva-actions">
                    <span className={`badge-status ${getStatusBadgeClass(reserva.status)}`}>
                      {reserva.status}
                    </span>
                    {reserva.status === 'Ativa' && (
                      <button
                        className="btn-cancelar"
                        onClick={() => handleCancelarReserva(reserva.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="reservas-empty fade-in">
              <p>Nenhuma reserva encontrada</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Reservas;
