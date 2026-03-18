import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';
import { fetchBooksWithGoogleDetails } from '../services/books';
import { getFriendlyError } from '../utils/errorMessages';

function Catalogo() {
  const navigate = useNavigate();
  const [livros, setLivros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('todos');

  useEffect(() => {
    async function carregarLivros() {
      try {
        setIsLoading(true);
        const livrosMapeados = await fetchBooksWithGoogleDetails();
        setLivros(livrosMapeados);
      } catch (error) {
        alert(getFriendlyError(error, 'Falha ao carregar livros'));
      } finally {
        setIsLoading(false);
      }
    }

    carregarLivros();
  }, []);

  // Filtrar livros em tempo real
  const livrosFiltrados = useMemo(() => {
    let resultado = livros;

    // Filtro de busca (título ou autor)
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (livro) =>
          livro.titulo.toLowerCase().includes(buscaLower) ||
          livro.autor.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de disponibilidade
    if (filtroDisponibilidade === 'disponiveis') {
      resultado = resultado.filter((livro) => livro.disponiveis > 0);
    } else if (filtroDisponibilidade === 'indisponiveis') {
      resultado = resultado.filter((livro) => livro.disponiveis === 0);
    }

    return resultado;
  }, [livros, busca, filtroDisponibilidade]);

  // Função para reservar livro
  const handleReservar = async (livro) => {
    const token = localStorage.getItem('token');

    // Verificar se está logado
    if (!token) {
      alert('Você precisa estar logado para fazer uma reserva');
      navigate('/login');
      return;
    }

    // Verificar se livro está disponível
    if (livro.disponiveis <= 0) {
      alert('Este livro não está disponível no momento');
      return;
    }

    try {
      await apiRequest('/api/loans', {
        method: 'POST',
        body: JSON.stringify({ bookId: livro.id }),
      });

      setLivros((prev) =>
        prev.map((item) =>
          item.id === livro.id
            ? { ...item, disponiveis: Math.max(0, item.disponiveis - 1) }
            : item
        )
      );

      alert(`Livro "${livro.titulo}" reservado com sucesso! Confira em "Minhas Reservas".`);
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao reservar livro'));
    }
  };

  return (
    <div className="catalogo-page">
      <Navbar />

      <section className="catalogo-section">
        <div className="catalogo-container">
          <h1>Catálogo de Livros</h1>

          {/* Controles de Filtro */}
          <div className="catalogo-controls fade-in">
            {/* Barra de busca */}
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="catalogo-search"
            />

            {/* Select de disponibilidade */}
            <select
              value={filtroDisponibilidade}
              onChange={(e) => setFiltroDisponibilidade(e.target.value)}
              className="catalogo-filter"
            >
              <option value="todos">Todos</option>
              <option value="disponiveis">Disponíveis</option>
              <option value="indisponiveis">Indisponíveis</option>
            </select>
          </div>

          {/* Grid de Livros */}
          {isLoading ? (
            <div className="catalogo-empty fade-in">
              <p>Carregando livros...</p>
            </div>
          ) : livrosFiltrados.length > 0 ? (
            <div className="catalogo-grid fade-in">
              {livrosFiltrados.map((livro) => (
                <div key={livro.id} className="catalogo-card">
                  <div className="catalogo-capa">
                    <span className="catalogo-capa-fallback" aria-hidden="true">
                      📖
                    </span>
                    {livro.urlCapa && (
                      <img
                        src={livro.urlCapa}
                        alt={`Capa do livro ${livro.titulo}`}
                        className="catalogo-capa-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <h3>{livro.titulo}</h3>
                  <p className="catalogo-autor">{livro.autor}</p>
                  <p className="catalogo-genero">{livro.genero}</p>
                  
                  <div className="catalogo-disponibilidade">
                    {livro.disponiveis > 0 ? (
                      <>
                        <span className="badge available">Disponível</span>
                        <p className="catalogo-qtd">({livro.disponiveis} cópias)</p>
                      </>
                    ) : (
                      <>
                        <span className="badge unavailable">Indisponível</span>
                        <p className="catalogo-qtd">(0 cópias)</p>
                      </>
                    )}
                  </div>

                  <div className="catalogo-card-actions">
                    <button
                      className={`btn-reservar ${
                        livro.disponiveis > 0 ? 'btn-reservar-ativo' : 'btn-reservar-desabilitado'
                      }`}
                      onClick={() => handleReservar(livro)}
                      disabled={livro.disponiveis <= 0}
                    >
                      Reservar
                    </button>
                    <Link to={`/livro/${livro.id}`} className="btn-details">
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="catalogo-empty fade-in">
              <p>Nenhum livro encontrado</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;
