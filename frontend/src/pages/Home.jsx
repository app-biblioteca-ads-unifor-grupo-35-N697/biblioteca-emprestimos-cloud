import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const featuredBooks = [
  {
    id: 1,
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    available: true,
  },
  {
    id: 2,
    title: 'Grande Sertão: Veredas',
    author: 'Guimarães Rosa',
    available: false,
  },
  {
    id: 3,
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    available: true,
  },
];

function Home() {
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
        <div className="stat-card" style={{ borderLeftColor: '#a855f7' }}>
          <div className="stat-icon">👤</div>
          <div className="stat-number">210</div>
          <div className="stat-label">Alunos Cadastrados</div>
        </div>
      </section>

      <section className="home-featured fade-in">
        <h2>Livros em Destaque</h2>
        <div className="featured-books-grid">
          {featuredBooks.map((book) => (
            <div key={book.id} className="featured-card">
              <div className="featured-cover">📖</div>
              <h3>{book.title}</h3>
              <p className="featured-author">{book.author}</p>
              <div className="featured-badge-container">
                <span className={`badge ${book.available ? 'available' : 'unavailable'}`}>
                  {book.available ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <Link to="/catalogo" className="btn-details">
                Ver Detalhes
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="home-footer fade-in">
        <p>📚 Biblioteca Universitária © 2026</p>
      </footer>
    </div>
  );
}

export default Home;
