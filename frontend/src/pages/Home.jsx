import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useBooksWithGoogle, useUserLoans } from '../services/hooks';
import { getFriendlyError } from '../utils/errorMessages';

const STAT_INICIAL = [
  { id: 'titulos',     icon: '📚', color: '#3b82f6', value: '—', label: 'Títulos no Acervo' },
  { id: 'disponiveis', icon: '✅', color: '#10b981', value: '—', label: 'Exemplares Disponíveis' },
  { id: 'ativos',      icon: '🔖', color: '#f59e0b', value: '—', label: 'Empréstimos Ativos' },
  { id: 'registrados', icon: '📈', color: '#06b6d4', value: '—', label: 'Empréstimos Registrados' },
];

function Home() {
  // Buscar livros com React Query (cache automático)
  const { data: books = [], isLoading: isLoadingBooks, error: errorBooks } = useBooksWithGoogle();
  
  // Buscar empréstimos com React Query (cache automático)
  const { data: loans = [], isLoading: isLoadingLoans, error: errorLoans } = useUserLoans();

  // Calcular livros em destaque
  const featuredBooks = useMemo(() => {
    const ordenados = [...books].sort((a, b) => {
      if (b.disponiveis !== a.disponiveis) return b.disponiveis - a.disponiveis;
      return a.titulo.localeCompare(b.titulo);
    });
    return ordenados.slice(0, 3);
  }, [books]);

  // Calcular stats
  const stats = useMemo(() => {
    if (isLoadingBooks || isLoadingLoans) {
      return STAT_INICIAL;
    }

    return [
      {
        id: 'titulos',
        icon: '📚',
        color: '#3b82f6',
        value: books.length,
        label: 'Títulos no Acervo',
      },
      {
        id: 'disponiveis',
        icon: '✅',
        color: '#10b981',
        value: books.reduce((soma, b) => soma + b.disponiveis, 0),
        label: 'Exemplares Disponíveis',
      },
      {
        id: 'ativos',
        icon: '🔖',
        color: '#f59e0b',
        value: loans.filter((l) => !l.isReturned).length,
        label: 'Empréstimos Ativos',
      },
      {
        id: 'registrados',
        icon: '📈',
        color: '#06b6d4',
        value: loans.length,
        label: 'Empréstimos Registrados',
      },
    ];
  }, [books, loans, isLoadingBooks, isLoadingLoans]);

  const isLoading = isLoadingBooks || isLoadingLoans;
  const erroMsg = errorBooks ? getFriendlyError(errorBooks, 'Erro ao carregar livros') 
                 : errorLoans ? getFriendlyError(errorLoans, 'Erro ao carregar empréstimos')
                 : '';

  return (
    <div className="home-page">
      <Navbar />

      <section className="home-hero fade-in">
        <div className="home-hero-content">
          <h1>Bem-vindo à Biblioteca Universitária</h1>
          <p>Explore nosso acervo e reserve livros com facilidade</p>
          <div className="home-hero-buttons">
            <Link className="btn-primary" to="/catalogo">
              Ver Catálogo
            </Link>
            <Link className="btn-secondary" to="/cadastro">
              Cadastre-se
            </Link>
          </div>
        </div>
      </section>

      <section className="home-stats fade-in">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-number">{isLoading ? '⏳' : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {erroMsg && <p className="home-status-message">⚠️ {erroMsg}</p>}

      <section className="home-featured fade-in">
        <h2>Livros em Destaque</h2>

        {isLoading ? (
          <p className="home-status-message">⏳ Carregando acervo com cache inteligente...</p>
        ) : featuredBooks.length > 0 ? (
          <div className="featured-books-grid">
            {featuredBooks.map((book) => (
              <div key={book.id} className="featured-card">
                <div className="featured-cover">
                  <span className="featured-cover-fallback" aria-hidden="true">
                    📖
                  </span>
                  {book.urlCapa && (
                    <img
                      src={book.urlCapa}
                      alt={`Capa do livro ${book.titulo}`}
                      className="featured-cover-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <h3>{book.titulo}</h3>
                <p className="featured-author">{book.autor}</p>
                <div className="featured-badge-container">
                  <span className={`badge ${book.disponiveis > 0 ? 'available' : 'unavailable'}`}>
                    {book.disponiveis > 0
                      ? `${book.disponiveis} disponível(is)`
                      : 'Indisponível'}
                  </span>
                </div>
                <Link to={`/livro/${book.id}`} className="btn-details">
                  Ver Detalhes
                </Link>
              </div>
            ))}
          </div>
        ) : (
          !erroMsg && <p className="home-status-message">Nenhum livro cadastrado no momento.</p>
        )}
      </section>

      <footer className="home-footer fade-in">
        <p>📚 Biblioteca Universitária © 2026</p>
      </footer>
    </div>
  );
}

export default Home;
