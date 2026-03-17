import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';
import { fetchBooksWithDetails } from '../services/books';
import { getFriendlyError } from '../utils/errorMessages';

const STAT_INICIAL = [
  { id: 'titulos',     icon: '📚', color: '#3b82f6', value: '—', label: 'Títulos no Acervo' },
  { id: 'disponiveis', icon: '✅', color: '#10b981', value: '—', label: 'Exemplares Disponíveis' },
  { id: 'ativos',      icon: '🔖', color: '#f59e0b', value: '—', label: 'Empréstimos Ativos' },
  { id: 'registrados', icon: '📈', color: '#06b6d4', value: '—', label: 'Empréstimos Registrados' },
];

function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [stats, setStats] = useState(STAT_INICIAL);
  const [isLoading, setIsLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState('');

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [books, loans] = await Promise.all([
          fetchBooksWithDetails(),
          apiRequest('/api/loans'),
        ]);

        // Livros em destaque: os 3 com mais exemplares disponíveis
        const ordenados = [...books].sort((a, b) => {
          if (b.disponiveis !== a.disponiveis) return b.disponiveis - a.disponiveis;
          return a.titulo.localeCompare(b.titulo);
        });
        setFeaturedBooks(ordenados.slice(0, 3));

        setStats([
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
        ]);
      } catch (error) {
        setErroMsg(getFriendlyError(error, 'Não foi possível carregar os dados do acervo.'));
      } finally {
        setIsLoading(false);
      }
    }

    carregarDashboard();
  }, []);

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
            <div className="stat-number">{isLoading ? '...' : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </section>

      {erroMsg && <p className="home-status-message">{erroMsg}</p>}

      <section className="home-featured fade-in">
        <h2>Livros em Destaque</h2>

        {isLoading ? (
          <p className="home-status-message">Carregando acervo...</p>
        ) : featuredBooks.length > 0 ? (
          <div className="featured-books-grid">
            {featuredBooks.map((book) => (
              <div key={book.id} className="featured-card">
                <div className="featured-cover">📖</div>
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
