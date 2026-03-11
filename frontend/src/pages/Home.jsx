import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const featuredBooks = [
  {
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    available: true,
  },
  {
    title: 'Grande Sertão: Veredas',
    author: 'Guimarães Rosa',
    available: false,
  },
  {
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    available: true,
  },
];

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero fade-in">
        <div className="home-hero-content">
          <h1>Bem-vindo à Biblioteca Universitária</h1>
          <p>Explore nosso acervo, reserve livros e acompanhe seus empréstimos</p>
          <div className="home-hero-buttons">
            <Link className="hero-primary-btn" to="/catalogo">
              Ver Catálogo
            </Link>
            <Link className="hero-secondary-btn" to="/cadastro">
              Cadastre-se
            </Link>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon">📚</div>
          <div className="stat-number">124</div>
          <div className="stat-label">Livros no Acervo</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-number">89</div>
          <div className="stat-label">Disponíveis</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon">🔖</div>
          <div className="stat-number">35</div>
          <div className="stat-label">Reservas Ativas</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="stat-icon">👤</div>
          <div className="stat-number">210</div>
          <div className="stat-label">Alunos Cadastrados</div>
        </div>
      </section>

      <section className="home-featured">
        <h2>Livros em Destaque</h2>
        <div className="featured-grid">
          {featuredBooks.map((book, index) => (
            <div key={index} className="featured-card">
              <div className="book-cover">📖</div>
              <h3>{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <span className={`book-badge ${book.available ? 'available' : 'unavailable'}`}>
                {book.available ? 'Disponível' : 'Indisponível'}
              </span>
              <Link className="book-detail-btn" to="/catalogo">
                Ver Detalhes
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <p>📚 Biblioteca Universitária © 2026</p>
      </footer>
    </div>
  );
}

export default Home;
