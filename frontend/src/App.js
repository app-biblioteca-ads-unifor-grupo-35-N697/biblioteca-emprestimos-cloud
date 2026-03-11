import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Reservas from './pages/Reservas';
import LoginCadastro from './pages/LoginCadastro';
import './App.css';

// Componente de rota protegida
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/livro/:id" element={<Catalogo />} />
        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginCadastro />} />
        <Route path="/cadastro" element={<LoginCadastro />} />
      </Routes>
    </Router>
  );
}

export default App;