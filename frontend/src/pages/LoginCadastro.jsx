import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
  const handleSubmitLogin = (e) => {
    e.preventDefault();

    if (!email || !senha) {
      alert('Preencha todos os campos');
      return;
    }

    // Salvar no localStorage
    const token = 'fake-token-' + Date.now();
    
    // Determinar tipo de usuário baseado no email
    const tipo = email === 'admin@biblioteca.com' ? 'admin' : 'aluno';
    const nomePadrao = tipo === 'admin' ? 'Administrador' : 'Aluno';
    
    const usuario = {
      email,
      nome: nomePadrao,
      tipo,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    // Redirecionar para /admin se admin, senão para /
    if (tipo === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Submeter cadastro
  const handleSubmitCadastro = (e) => {
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

    // Salvar no localStorage
    const token = 'fake-token-' + Date.now();
    
    // Determinar tipo de usuário baseado no email
    const tipo = email === 'admin@biblioteca.com' ? 'admin' : 'aluno';
    
    const usuario = {
      email,
      nome,
      tipo,
      matricula,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    alert('Cadastro realizado com sucesso!');

    // Redirecionar para /admin se admin, senão para /
    if (tipo === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
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
                Entrar
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
                Cadastrar
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default LoginCadastro;
