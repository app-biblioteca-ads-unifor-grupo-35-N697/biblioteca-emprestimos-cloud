import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';
import { getFriendlyError } from '../utils/errorMessages';

function PainelAdmin() {
  const [livros, setLivros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionState, setActionState] = useState({ type: null, bookId: null });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    disponiveis: '',
  });

  useEffect(() => {
    async function carregarLivros() {
      try {
        setIsLoading(true);
        const data = await apiRequest('/api/books');
        const detalhes = await Promise.all(
          data.map(async (livro) => {
            try {
              return await apiRequest(`/api/books/${livro.id}`);
            } catch (error) {
              return livro;
            }
          })
        );

        const livrosMapeados = detalhes.map((livro) => ({
          id: livro.id,
          titulo: livro.title || 'Sem titulo',
          autor: livro.author || 'Autor não informado',
          genero: 'N/A',
          disponiveis: Number.isFinite(livro.quantiteAvailable)
            ? livro.quantiteAvailable
            : 0,
        }));
        setLivros(livrosMapeados);
      } catch (error) {
        alert(getFriendlyError(error, 'Falha ao carregar livros'));
      } finally {
        setIsLoading(false);
      }
    }

    carregarLivros();
  }, []);

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

  const isActionInProgress = actionState.type !== null;
  const isAdding = actionState.type === 'adding';

  // Adicionar novo livro
  const handleAdicionarLivro = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.autor || formData.disponiveis === '') {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setActionState({ type: 'adding', bookId: null });
      const novoLivroApi = await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.titulo,
          author: formData.autor,
          quantiteAvailable: Number(formData.disponiveis),
        }),
      });

      const novoLivro = {
        id: novoLivroApi.id,
        titulo: novoLivroApi.title,
        autor: novoLivroApi.author || formData.autor,
        genero: 'N/A',
        disponiveis: novoLivroApi.quantiteAvailable ?? Number(formData.disponiveis),
      };

      setLivros((prev) => [novoLivro, ...prev]);
      setFormData({ titulo: '', autor: '', disponiveis: '' });
      setMostrarFormulario(false);
      alert('Livro adicionado com sucesso!');
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao adicionar livro'));
    } finally {
      setActionState({ type: null, bookId: null });
    }
  };

  const handleEditarLivro = async (livro) => {
    const novoTitulo = window.prompt('Novo título:', livro.titulo);
    if (novoTitulo === null) return;

    const novoAutor = window.prompt('Novo autor:', livro.autor);
    if (novoAutor === null) return;

    const novaQuantidadeStr = window.prompt(
      'Nova quantidade disponível:',
      String(livro.disponiveis)
    );
    if (novaQuantidadeStr === null) return;

    const novaQuantidade = Number(novaQuantidadeStr);
    if (Number.isNaN(novaQuantidade) || novaQuantidade < 0) {
      alert('Quantidade inválida');
      return;
    }

    try {
      setActionState({ type: 'editing', bookId: livro.id });
      const livroAtualizadoApi = await apiRequest(`/api/books/${livro.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: novoTitulo,
          author: novoAutor,
          quantiteAvailable: novaQuantidade,
        }),
      });

      setLivros((prev) =>
        prev.map((item) =>
          item.id === livro.id
            ? {
                ...item,
                titulo: livroAtualizadoApi.title ?? novoTitulo,
                autor: livroAtualizadoApi.author ?? novoAutor,
                disponiveis: livroAtualizadoApi.quantiteAvailable ?? novaQuantidade,
              }
            : item
        )
      );
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao atualizar livro'));
    } finally {
      setActionState({ type: null, bookId: null });
    }
  };

  // Excluir livro
  const handleExcluirLivro = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      try {
        setActionState({ type: 'deleting', bookId: id });
        await apiRequest(`/api/books/${id}`, { method: 'DELETE' });
        setLivros((prev) => prev.filter((livro) => livro.id !== id));
      } catch (error) {
        alert(getFriendlyError(error, 'Falha ao excluir livro'));
      } finally {
        setActionState({ type: null, bookId: null });
      }
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
              disabled={isActionInProgress}
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
                      disabled={isAdding}
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
                      disabled={isAdding}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
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
                      disabled={isAdding}
                      required
                    />
                  </div>
                </div>

                <div className="painel-formulario-actions">
                  <button type="submit" className="btn-submit btn-adicionar-livro">
                    {isAdding ? 'Adicionando...' : 'Adicionar Livro'}
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

          {isLoading ? (
            <div className="painel-empty fade-in">
              <p>Carregando livros...</p>
            </div>
          ) : livrosFiltrados.length > 0 ? (
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
                  <div className="catalogo-card-actions">
                    <button
                      className="btn-details"
                      onClick={() => handleEditarLivro(livro)}
                      disabled={isActionInProgress}
                    >
                      {actionState.type === 'editing' && actionState.bookId === livro.id
                        ? 'Salvando...'
                        : 'Editar'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleExcluirLivro(livro.id)}
                      disabled={isActionInProgress}
                    >
                      {actionState.type === 'deleting' && actionState.bookId === livro.id
                        ? 'Excluindo...'
                        : 'Excluir'}
                    </button>
                  </div>
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
