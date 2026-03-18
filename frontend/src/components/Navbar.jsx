import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearStoredSession, getStoredToken, getStoredUser } from '../utils/auth';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Verificar se existe token no localStorage
  const token = getStoredToken();
  const usuario = getStoredUser();

  const handleLogout = () => {
    clearStoredSession();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <Link to="/" className="navbar-brand">
          Biblioteca Universitária
        </Link>

        {/* Mobile toggle button */}
        <button className="navbar-mobile-toggle" onClick={toggleMenu}>
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Links */}
        <div className={`navbar-links ${menuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          <Link to="/catalogo" className="navbar-link" onClick={() => setMenuOpen(false)}>
            Catálogo
          </Link>

          {/* Reservas ou Painel Admin - apenas com token */}
          {token && usuario?.tipo === 'admin' && (
            <>
              <Link to="/admin" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Painel Admin
              </Link>
              <Link to="/admin/cadastro-livro" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Cadastrar Livro
              </Link>
            </>
          )}

          {token && usuario?.tipo === 'aluno' && (
            <Link to="/reservas" className="navbar-link" onClick={() => setMenuOpen(false)}>
              Reservas
            </Link>
          )}

          {/* Contêiner de ações da direita */}
          <div className="navbar-actions">
            {!token ? (
              <>
                <Link to="/cadastro" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  Cadastre-se
                </Link>
                <Link to="/login" className="btn-entrar" onClick={() => setMenuOpen(false)}>
                  Entrar
                </Link>
              </>
            ) : (
              <>
                <span className="navbar-usuario">
                  Olá, {usuario?.nome || 'Usuário'}!
                </span>
                <button className="btn-sair" onClick={handleLogout}>
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
