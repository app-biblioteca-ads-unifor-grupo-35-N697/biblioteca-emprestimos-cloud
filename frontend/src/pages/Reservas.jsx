import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';


function Reservas() {
  const [abaAtiva, setAbaAtiva] = useState('ativas');
  const [reservas, setReservas] = useState([]);

  // Pegar nome do usuário do localStorage
  const usuarioJSON = localStorage.getItem('usuario');
  const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : { nome: 'Aluno', email: '' };

  // Carregar reservas ao montar o componente
  useEffect(() => {
    // Obter reservas do localStorage
    const reservasJSON = localStorage.getItem('reservas');
    let reservasLocal = reservasJSON ? JSON.parse(reservasJSON) : [];

    // Filtrar apenas reservas do usuário logado
    const minhasReservas = reservasLocal.filter(
      (r) => r.usuarioEmail === usuario.email
    );

    setReservas(minhasReservas);
  }, [usuario.email]);

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
    // Atualiza o estado local apenas para a interface
    const novasReservas = reservas.map((r) =>
      r.id === id ? { ...r, status: 'Cancelada' } : r
    );
    setReservas(novasReservas);

    // Persistir alteração no localStorage para que a mudança sobreviva
    // à navegação e recarregamentos da página.
    const reservasJSON = localStorage.getItem('reservas');
    const reservasLocal = reservasJSON ? JSON.parse(reservasJSON) : [];
    const atualizadas = reservasLocal.map((r) =>
      r.id === id ? { ...r, status: 'Cancelada' } : r
    );
    localStorage.setItem('reservas', JSON.stringify(atualizadas));
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
