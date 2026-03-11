import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { mockBooks } from '../data/mockBooks';

function Catalogo() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('todos');

  // Filtrar livros em tempo real
  const livrosFiltrados = useMemo(() => {
    let resultado = mockBooks;

    // Filtro de busca (título ou autor)
    if (busca.trim()) {
      const buscaLower = busca.toLowerCase();
      resultado = resultado.filter(
        (livro) =>
          livro.titulo.toLowerCase().includes(buscaLower) ||
          livro.autor.toLowerCase().includes(buscaLower)
      );
    }

    // Filtro de disponibilidade
    if (filtroDisponibilidade === 'disponiveis') {
      resultado = resultado.filter((livro) => livro.disponiveis > 0);
    } else if (filtroDisponibilidade === 'indisponiveis') {
      resultado = resultado.filter((livro) => livro.disponiveis === 0);
    }

    return resultado;
  }, [busca, filtroDisponibilidade]);

  // Função para reservar livro
  const handleReservar = (livro) => {
    const token = localStorage.getItem('token');
    const usuarioJSON = localStorage.getItem('usuario');
    const usuario = usuarioJSON ? JSON.parse(usuarioJSON) : null;

    // Verificar se está logado
    if (!token || !usuario) {
      alert('Você precisa estar logado para fazer uma reserva');
      navigate('/login');
      return;
    }

    // Verificar se livro está disponível
    if (livro.disponiveis <= 0) {
      alert('Este livro não está disponível no momento');
      return;
    }

    // Obter reservas atuais do localStorage
    const reservasJSON = localStorage.getItem('reservas');
    const reservas = reservasJSON ? JSON.parse(reservasJSON) : [];

    // Verificar se já existe reserva deste livro pelo mesmo usuário
    const jaReservado = reservas.some(
      (r) => r.livroId === livro.id && r.usuarioEmail === usuario.email
    );

    if (jaReservado) {
      alert('Você já tem uma reserva ativa para este livro');
      return;
    }

    // Criar nova reserva
    const hoje = new Date();
    const dataReserva = hoje.toISOString().split('T')[0]; // YYYY-MM-DD

    // Data de devolução: 30 dias depois
    const dataDevolucao = new Date(hoje);
    dataDevolucao.setDate(dataDevolucao.getDate() + 30);
    const dataDevolucaoFormatada = dataDevolucao.toISOString().split('T')[0];

    const novaReserva = {
      id: Date.now(),
      livroId: livro.id,
      livro: livro.titulo,
      autor: livro.autor,
      dataReserva,
      dataDevolucao: dataDevolucaoFormatada,
      status: 'Ativa',
      usuarioEmail: usuario.email,
      usuarioNome: usuario.nome,
    };

    // Salvar no localStorage
    reservas.push(novaReserva);
    localStorage.setItem('reservas', JSON.stringify(reservas));

    alert(`Livro "${livro.titulo}" reservado com sucesso! Você pode conferir em "Minhas Reservas"`);
  };

  return (
    <div className="catalogo-page">
      <Navbar />

      <section className="catalogo-section">
        <div className="catalogo-container">
          <h1>Catálogo de Livros</h1>

          {/* Controles de Filtro */}
          <div className="catalogo-controls fade-in">
            {/* Barra de busca */}
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="catalogo-search"
            />

            {/* Select de disponibilidade */}
            <select
              value={filtroDisponibilidade}
              onChange={(e) => setFiltroDisponibilidade(e.target.value)}
              className="catalogo-filter"
            >
              <option value="todos">Todos</option>
              <option value="disponiveis">Disponíveis</option>
              <option value="indisponiveis">Indisponíveis</option>
            </select>
          </div>

          {/* Grid de Livros */}
          {livrosFiltrados.length > 0 ? (
            <div className="catalogo-grid fade-in">
              {livrosFiltrados.map((livro) => (
                <div key={livro.id} className="catalogo-card">
                  <div className="catalogo-capa">📖</div>
                  <h3>{livro.titulo}</h3>
                  <p className="catalogo-autor">{livro.autor}</p>
                  <p className="catalogo-genero">{livro.genero}</p>
                  
                  <div className="catalogo-disponibilidade">
                    {livro.disponiveis > 0 ? (
                      <>
                        <span className="badge available">Disponível</span>
                        <p className="catalogo-qtd">({livro.disponiveis} cópias)</p>
                      </>
                    ) : (
                      <>
                        <span className="badge unavailable">Indisponível</span>
                        <p className="catalogo-qtd">(0 cópias)</p>
                      </>
                    )}
                  </div>

                  <div className="catalogo-card-actions">
                    <button
                      className={`btn-reservar ${
                        livro.disponiveis > 0 ? 'btn-reservar-ativo' : 'btn-reservar-desabilitado'
                      }`}
                      onClick={() => handleReservar(livro)}
                      disabled={livro.disponiveis <= 0}
                    >
                      Reservar
                    </button>
                    <Link to={`/livro/${livro.id}`} className="btn-details">
                      Ver Detalhes
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="catalogo-empty fade-in">
              <p>Nenhum livro encontrado</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Catalogo;
