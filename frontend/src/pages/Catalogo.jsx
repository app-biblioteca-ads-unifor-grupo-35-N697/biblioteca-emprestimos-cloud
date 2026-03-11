import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const mockBooks = [
  { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis', disponiveis: 3, genero: 'Romance' },
  { id: 2, titulo: 'Grande Sertão: Veredas', autor: 'Guimarães Rosa', disponiveis: 0, genero: 'Romance' },
  { id: 3, titulo: 'O Cortiço', autor: 'Aluísio Azevedo', disponiveis: 2, genero: 'Romance' },
  { id: 4, titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', disponiveis: 1, genero: 'Romance' },
  { id: 5, titulo: 'O Alienista', autor: 'Machado de Assis', disponiveis: 4, genero: 'Contos' },
  { id: 6, titulo: 'Capitães da Areia', autor: 'Jorge Amado', disponiveis: 0, genero: 'Romance' },
  { id: 7, titulo: 'Gabriela, Cravo e Canela', autor: 'Jorge Amado', disponiveis: 2, genero: 'Romance' },
  { id: 8, titulo: 'Quincas Borba', autor: 'Machado de Assis', disponiveis: 1, genero: 'Romance' },
];

function Catalogo() {
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

                  <Link to={`/livro/${livro.id}`} className="btn-details">
                    Ver Detalhes
                  </Link>
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
