import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Verificar se existe token no localStorage
  const token = localStorage.getItem('token');
  const usuarioJSON = localStorage.getItem('usuario');
  const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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

          {/* Reservas - apenas com token */}
          {token && (
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
                  Olá, {usuario?.nome || 'Aluno'}!
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
