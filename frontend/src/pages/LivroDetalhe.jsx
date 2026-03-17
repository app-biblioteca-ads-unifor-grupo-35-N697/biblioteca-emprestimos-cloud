import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { fetchBookDetails } from '../services/books';
import { apiRequest } from '../services/api';
import { getFriendlyError } from '../utils/errorMessages';

function LivroDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [livro, setLivro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [erroMsg, setErroMsg] = useState('');

  useEffect(() => {
    async function carregarLivro() {
      try {
        setIsLoading(true);
        setErroMsg('');
        const book = await fetchBookDetails(id);
        setLivro(book);
      } catch (error) {
        setErroMsg(getFriendlyError(error, 'Falha ao carregar os detalhes do livro.'));
      } finally {
        setIsLoading(false);
      }
    }

    carregarLivro();
  }, [id]);

  const handleReservar = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Você precisa estar logado para fazer uma reserva');
      navigate('/login');
      return;
    }

    if (!livro || livro.disponiveis <= 0) {
      alert('Este livro não está disponível no momento');
      return;
    }

    try {
      setIsReserving(true);
      await apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify({ bookId: livro.id }),
      });

      setLivro((prev) => ({
        ...prev,
        disponiveis: Math.max(0, prev.disponiveis - 1),
      }));
      alert(`Livro "${livro.titulo}" reservado com sucesso! Confira em "Minhas Reservas".`);
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao reservar livro'));
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="livro-detalhe-page">
      <Navbar />

      <section className="livro-detalhe-section">
        <div className="livro-detalhe-container fade-in">
          <Link to="/catalogo" className="livro-detalhe-backlink">
            ← Voltar para o catálogo
          </Link>

          {isLoading ? (
            <div className="page-loading">
              <p>Carregando detalhes do livro...</p>
            </div>
          ) : erroMsg ? (
            <div className="page-feedback page-feedback-error">
              <p>{erroMsg}</p>
              <Link to="/catalogo" className="btn-details">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <div className="livro-detalhe-card">
              <div className="livro-detalhe-cover">📘</div>

              <div className="livro-detalhe-content">
                <span
                  className={`badge ${livro.disponiveis > 0 ? 'available' : 'unavailable'}`}
                >
                  {livro.disponiveis > 0 ? 'Disponível para reserva' : 'Indisponível'}
                </span>

                <h1>{livro.titulo}</h1>
                <p className="livro-detalhe-author">{livro.autor}</p>

                <div className="livro-detalhe-meta">
                  <div className="livro-detalhe-meta-card">
                    <span className="livro-detalhe-meta-label">Categoria</span>
                    <strong>{livro.genero}</strong>
                  </div>
                  <div className="livro-detalhe-meta-card">
                    <span className="livro-detalhe-meta-label">Exemplares disponíveis</span>
                    <strong>{livro.disponiveis}</strong>
                  </div>
                </div>

                <div className="livro-detalhe-actions">
                  <button
                    className="btn-primary"
                    onClick={handleReservar}
                    disabled={isReserving || livro.disponiveis <= 0}
                  >
                    {isReserving ? 'Reservando...' : 'Reservar livro'}
                  </button>
                  <Link
                    to="/reservas"
                    className="btn-secondary livro-detalhe-link-secondary"
                  >
                    Ver minhas reservas
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default LivroDetalhe;
