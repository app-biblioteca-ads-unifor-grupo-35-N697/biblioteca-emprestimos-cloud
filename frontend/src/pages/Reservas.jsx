import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';
import { getFriendlyError } from '../utils/errorMessages';


function Reservas() {
  const [abaAtiva, setAbaAtiva] = useState('ativas');
  const [reservas, setReservas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pegar nome do usuário do localStorage
  const usuarioJSON = localStorage.getItem('usuario');
  const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : { nome: 'Aluno', email: '' };

  // Carregar reservas reais da API ao montar o componente
  useEffect(() => {
    async function carregarReservas() {
      if (!usuario?.id) {
        setReservas([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loansData = await apiRequest('/api/loans');
        const minhasLoans = loansData.filter((loan) => loan.userId === usuario.id);

        const uniqueBookIds = [...new Set(minhasLoans.map((loan) => loan.bookId))];
        const booksDetalhes = await Promise.all(
          uniqueBookIds.map(async (bookId) => {
            try {
              const book = await apiRequest(`/api/books/${bookId}`);
              return [bookId, book];
            } catch (error) {
              return [bookId, null];
            }
          })
        );

        const bookById = Object.fromEntries(booksDetalhes);

        const minhasReservas = minhasLoans.map((loan) => {
          const book = bookById[loan.bookId] || {};
          return {
            id: loan.id,
            livro: book.title || 'Livro',
            autor: book.author || 'Autor não informado',
            dataReserva: loan.loanDate,
            dataDevolucao: loan.returnDate,
            status: loan.isReturned ? 'Concluída' : 'Ativa',
          };
        });

        setReservas(minhasReservas);
      } catch (error) {
        alert(getFriendlyError(error, 'Falha ao carregar reservas'));
      } finally {
        setIsLoading(false);
      }
    }

    carregarReservas();
  }, [usuario?.id]);

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
    if (!data) return '-';
    const date = new Date(data);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  // Devolver reserva
  const handleDevolverReserva = async (id) => {
    try {
      await apiRequest(`/api/loans/${id}/return`, { method: 'POST' });
      setReservas((prev) =>
        prev.map((reserva) =>
          reserva.id === id ? { ...reserva, status: 'Concluída' } : reserva
        )
      );
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao devolver livro'));
    }
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
          {isLoading ? (
            <div className="reservas-empty fade-in">
              <p>Carregando reservas...</p>
            </div>
          ) : reservasFiltradas.length > 0 ? (
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
                        onClick={() => handleDevolverReserva(reserva.id)}
                      >
                        Devolver
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
