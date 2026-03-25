import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import LivroDetalhe from './pages/LivroDetalhe';
import Reservas from './pages/Reservas';
import LoginCadastro from './pages/LoginCadastro';
import PainelAdmin from './pages/PainelAdmin';
import CadastroLivro from './pages/CadastroLivro';
import { apiRequest } from './services/api';
import { clearStoredSession, getStoredToken, getStoredUser } from './utils/auth';
import { queryClient } from './config/queryClient';
import './App.css';

// Componente de rota protegida (para alunos)
function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const token = getStoredToken();

  useEffect(() => {
    async function validarAcesso() {
      if (!token) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        await apiRequest('/auth/teste');
        setIsAuthorized(true);
      } catch (error) {
        clearStoredSession();
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    }

    validarAcesso();
  }, [token]);

  if (isLoading) {
    return <div className="page-loading">Validando acesso...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}

// Componente de rota protegida para admin
function AdminRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const token = getStoredToken();
  const usuario = getStoredUser();

  useEffect(() => {
    async function validarAcesso() {
      if (!token || usuario?.tipo !== 'admin') {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      try {
        await apiRequest('/auth/teste');
        setIsAuthorized(true);
      } catch (error) {
        clearStoredSession();
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    }

    validarAcesso();
  }, [token, usuario?.tipo]);

  if (isLoading) {
    return <div className="page-loading">Validando acesso...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/livro/:id" element={<LivroDetalhe />} />
          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <Reservas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <PainelAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/cadastro-livro"
            element={
              <AdminRoute>
                <CadastroLivro />
              </AdminRoute>
            }
          />
          <Route path="/login" element={<LoginCadastro />} />
          <Route path="/cadastro" element={<LoginCadastro />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;