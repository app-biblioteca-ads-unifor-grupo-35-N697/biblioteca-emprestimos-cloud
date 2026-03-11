import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { mockBooks as initialBooks } from '../data/mockBooks';

function PainelAdmin() {
  const [livros, setLivros] = useState(initialBooks);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    genero: '',
    disponiveis: '',
  });

  // Filtrar livros por busca
  const livrosFiltrados = useMemo(() => {
    if (!busca.trim()) return livros;
    const buscaLower = busca.toLowerCase();
    return livros.filter(
      (livro) =>
        livro.titulo.toLowerCase().includes(buscaLower) ||
        livro.autor.toLowerCase().includes(buscaLower)
    );
  }, [livros, busca]);

  // Adicionar novo livro
  const handleAdicionarLivro = (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.autor || !formData.genero || formData.disponiveis === '') {
      alert('Preencha todos os campos');
      return;
    }

    const novoLivro = {
      id: Date.now(),
      titulo: formData.titulo,
      autor: formData.autor,
      genero: formData.genero,
      disponiveis: parseInt(formData.disponiveis),
    };

    setLivros([...livros, novoLivro]);
    setFormData({ titulo: '', autor: '', genero: '', disponiveis: '' });
    setMostrarFormulario(false);
    alert('Livro adicionado com sucesso!');
  };

  // Excluir livro
  const handleExcluirLivro = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      setLivros(livros.filter((livro) => livro.id !== id));
    }
  };

  // Atualizar campo do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="painel-admin-page">
      <Navbar />

      <section className="painel-admin-section">
        <div className="painel-admin-container">
          <div className="painel-admin-header fade-in">
            <h1>Painel do Administrador</h1>
            <p>Gerenciar catálogo de livros</p>
          </div>

          {/* Controles */}
          <div className="painel-admin-controls fade-in">
            <input
              type="text"
              placeholder="Buscar por título ou autor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="painel-search"
            />
            <button
              className="btn-submit btn-adicionar"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              {mostrarFormulario ? 'Cancelar' : '+ Adicionar Livro'}
            </button>
          </div>

          {/* Formulário de Adicionar Livro */}
          {mostrarFormulario && (
            <div className="painel-formulario fade-in">
              <h2>Adicionar Novo Livro</h2>
              <form onSubmit={handleAdicionarLivro}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="titulo">Título</label>
                    <input
                      id="titulo"
                      type="text"
                      name="titulo"
                      placeholder="Digite o título do livro"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="autor">Autor</label>
                    <input
                      id="autor"
                      type="text"
                      name="autor"
                      placeholder="Digite o nome do autor"
                      value={formData.autor}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="genero">Gênero</label>
                    <input
                      id="genero"
                      type="text"
                      name="genero"
                      placeholder="Ex: Romance, Ficção Científica..."
                      value={formData.genero}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="disponiveis">Quantidade Disponível</label>
                    <input
                      id="disponiveis"
                      type="number"
                      name="disponiveis"
                      placeholder="0"
                      value={formData.disponiveis}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="painel-formulario-actions">
                  <button type="submit" className="btn-submit btn-adicionar-livro">
                    Adicionar Livro
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Livros */}
          <div className="painel-admin-stats fade-in">
            <p>
              Total de livros: <strong>{livrosFiltrados.length}</strong>
            </p>
          </div>

          {livrosFiltrados.length > 0 ? (
            <div className="painel-livros-grid fade-in">
              {livrosFiltrados.map((livro) => (
                <div key={livro.id} className="painel-livro-card">
                  <div className="painel-livro-capa">📖</div>
                  <div className="painel-livro-info">
                    <h3>{livro.titulo}</h3>
                    <p className="painel-livro-autor">{livro.autor}</p>
                    <p className="painel-livro-genero">{livro.genero}</p>
                    <p className="painel-livro-qtd">
                      {livro.disponiveis > 0 ? (
                        <span className="badge available">{livro.disponiveis} disponíveis</span>
                      ) : (
                        <span className="badge unavailable">Indisponível</span>
                      )}
                    </p>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleExcluirLivro(livro.id)}
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="painel-empty fade-in">
              <p>Nenhum livro encontrado</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PainelAdmin;
