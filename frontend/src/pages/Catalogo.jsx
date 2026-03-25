import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBooksWithGooglePaginated, useBorrowBook } from '../services/hooks';
import { getFriendlyError } from '../utils/errorMessages';

const PAGE_SIZE = 12;

function Catalogo() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState('');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('todos');
  
  // Buscar livros com paginação e cache automático
  const { data: livrosData, isLoading, error } = useBooksWithGooglePaginated(page, PAGE_SIZE);
  const { mutate: borrowBook, isPending: isBorrowing } = useBorrowBook();

  // Filtrar livros em tempo real (dentro da página)
  const livrosFiltrados = useMemo(() => {
    if (!livrosData?.data) return [];
    
    let resultado = livrosData.data;

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
  }, [livrosData?.data, busca, filtroDisponibilidade]);

  // Função para reservar livro
  const handleReservar = (livro) => {
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

    // Usar mutation do React Query com retry automático
    borrowBook(livro.id, {
      onSuccess: () => {
        alert(`Livro "${livro.titulo}" reservado com sucesso! Confira em "Minhas Reservas".`);
      },
      onError: (error) => {
        alert(getFriendlyError(error, 'Falha ao reservar livro'));
      },
    });
  };

  // Navegar para próxima página
  const handleProximaPagina = () => {
    if (livrosData?.hasMore) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navegar para página anterior
  const handlePaginaAnterior = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

          {/* Informação de paginação */}
          {livrosData && (
            <div className="catalogo-info fade-in">
              <p>
                Página {livrosData.page} de {Math.ceil(livrosData.total / PAGE_SIZE)} 
                ({livrosData.total} livros total)
              </p>
            </div>
          )}

          {/* Grid de Livros */}
          {isLoading ? (
            <div className="catalogo-empty fade-in">
              <p>⏳ Carregando acervo...</p>
            </div>
          ) : error ? (
            <div className="catalogo-empty fade-in">
              <p>❌ Erro ao carregarcatálogo. Tentando novamente...</p>
            </div>
          ) : livrosFiltrados.length > 0 ? (
            <>
              <div className="catalogo-grid fade-in">
                {livrosFiltrados.map((livro) => (
                  <div key={livro.id} className="catalogo-card">
                    <div className="catalogo-capa">
                      <span className="catalogo-capa-fallback" aria-hidden="true">
                        📖
                      </span>
                    </div>
                    <h3>{livro.titulo}</h3>
                    <p className="catalogo-autor">{livro.autor}</p>
                    
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
                        disabled={livro.disponiveis <= 0 || isBorrowing}
                      >
                        {isBorrowing ? '⏳ ...' : 'Reservar'}
                      </button>
                      <Link to={`/livro/${livro.id}`} className="btn-details">
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controles de paginação */}
              <div className="catalogo-pagination fade-in">
                <button
                  className="btn-paginacao"
                  onClick={handlePaginaAnterior}
                  disabled={page === 1}
                >
                  ← Anterior
                </button>
                <span className="paginacao-info">Página {livrosData?.page || 1}</span>
                <button
                  className="btn-paginacao"
                  onClick={handleProximaPagina}
                  disabled={!livrosData?.hasMore}
                >
                  Próxima →
                </button>
              </div>
            </>
          ) : (
            <div className="catalogo-empty fade-in">
              <p>Nenhum livro encontrado com os filtros aplicados</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;
