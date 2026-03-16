import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';
import { getFriendlyError } from '../utils/errorMessages';

function getUserIdFromToken(token) {
  try {
    const payloadBase64Url = token.split('.')[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    return payload?.id || null;
  } catch (error) {
    return null;
  }
}

function LoginCadastro() {
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar se veio de /cadastro para ativar a aba Cadastro
  const abaInicial = location.pathname === '/cadastro' ? 'cadastro' : 'login';

  // Estado
  const [abaAtiva, setAbaAtiva] = useState(abaInicial);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpar formulários ao trocar de aba
  useEffect(() => {
    setEmail('');
    setSenha('');
    setNome('');
    setMatricula('');
    setConfirmarSenha('');
    setAceitoTermos(false);
  }, [abaAtiva]);

  // Submeter login
  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: senha }),
      });

      const token = data?.token;
      if (!token) {
        throw new Error('Token nao retornado pelo servidor');
      }

      const tipo = email === 'admin@biblioteca.com' ? 'admin' : 'aluno';
      const nomePadrao = tipo === 'admin' ? 'Administrador' : 'Aluno';
      const userId = getUserIdFromToken(token);

      const usuario = {
        id: userId,
        email,
        nome: nomePadrao,
        tipo,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      if (tipo === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao realizar login'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submeter cadastro
  const handleSubmitCadastro = async (e) => {
    e.preventDefault();

    if (!nome || !email || !matricula || !senha || !confirmarSenha) {
      alert('Preencha todos os campos');
      return;
    }

    if (senha !== confirmarSenha) {
      alert('As senhas não conferem');
      return;
    }

    if (!aceitoTermos) {
      alert('Você deve aceitar os termos de uso');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: nome, email, password: senha }),
      });

      const loginData = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: senha }),
      });

      const token = loginData?.token;
      if (!token) {
        throw new Error('Token nao retornado pelo servidor');
      }

      const tipo = email === 'admin@biblioteca.com' ? 'admin' : 'aluno';
      const userId = getUserIdFromToken(token);
      const usuario = {
        id: userId,
        email,
        nome,
        tipo,
        matricula,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      alert('Cadastro realizado com sucesso!');

      if (tipo === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao realizar cadastro'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-cadastro-page">
      <Navbar />

      <section className="login-cadastro-section">
        <div className="login-cadastro-card fade-in">
          {/* Logo */}
          <div className="logo-container">
            <h2>Biblioteca Universitária</h2>
          </div>

          {/* Abas */}
          <div className="login-cadastro-tabs">
            <button
              className={`tab-button ${abaAtiva === 'login' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('login')}
            >
              Entrar
            </button>
            <button
              className={`tab-button ${abaAtiva === 'cadastro' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('cadastro')}
            >
              Cadastrar
            </button>
          </div>

          {/* ABA LOGIN */}
          {abaAtiva === 'login' && (
            <form onSubmit={handleSubmitLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email-login">Email</label>
                <input
                  id="email-login"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha-login">Senha</label>
                <input
                  id="senha-login"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-submit btn-entrar">
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* ABA CADASTRO */}
          {abaAtiva === 'cadastro' && (
            <form onSubmit={handleSubmitCadastro} className="cadastro-form">
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email-cadastro">Email Institucional</label>
                <input
                  id="email-cadastro"
                  type="email"
                  placeholder="seu@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="matricula">Matrícula</label>
                <input
                  id="matricula"
                  type="text"
                  placeholder="12345678"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha-cadastro">Senha</label>
                <input
                  id="senha-cadastro"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmar-senha">Confirmar Senha</label>
                <input
                  id="confirmar-senha"
                  type="password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>

              <div className="form-group checkbox">
                <input
                  id="aceito-termos"
                  type="checkbox"
                  checked={aceitoTermos}
                  onChange={(e) => setAceitoTermos(e.target.checked)}
                  required
                />
                <label htmlFor="aceito-termos">Aceito os termos de uso</label>
              </div>

              <button type="submit" className="btn-submit btn-cadastrar">
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default LoginCadastro;
