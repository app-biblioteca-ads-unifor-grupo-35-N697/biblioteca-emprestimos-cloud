import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';
import { getFriendlyError } from '../utils/errorMessages';
import { enrichBookWithGoogleData, mapBookFromApi } from '../services/books';

function PainelAdmin() {
  // Abas
  const [abaAtiva, setAbaAtiva] = useState('livros');
  
  // Estados para Livros
  const [livros, setLivros] = useState([]);
  const [bookIdsComEmprestimos, setBookIdsComEmprestimos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionState, setActionState] = useState({ type: null, bookId: null, userId: null });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    disponiveis: '',
  });

  // Estados para Usuários
  const [usuarios, setUsuarios] = useState([]);
  const [userIdsComEmprestimos, setUserIdsComEmprestimos] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [buscaUsuarios, setBuscaUsuarios] = useState('');

  useEffect(() => {
    async function carregarLivros() {
      try {
        setIsLoading(true);
        const data = await apiRequest('/api/books');
        const emprestimos = await apiRequest('/api/loans');
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
          urlCapa: '',
        }));

        // Enriquecer livros com dados do Google Books (incluindo capa)
        const livrosEnriquecidos = await Promise.all(
          livrosMapeados.map(async (livro) => {
            try {
              return await enrichBookWithGoogleData(livro);
            } catch (error) {
              return livro;
            }
          })
        );

        const idsComEmprestimos = Array.isArray(emprestimos)
          ? [...new Set(emprestimos.map((emprestimo) => emprestimo.bookId).filter(Boolean))]
          : [];

        setBookIdsComEmprestimos(idsComEmprestimos);
        setLivros(livrosEnriquecidos);
      } catch (error) {
        alert(getFriendlyError(error, 'Falha ao carregar livros'));
      } finally {
        setIsLoading(false);
      }
    }

    carregarLivros();
  }, []);

  // Carregar usuários quando aba de usuários for ativada
  useEffect(() => {
    if (abaAtiva === 'usuarios' && usuarios.length === 0) {
      carregarUsuarios();
    }
  }, [abaAtiva]);

  async function carregarUsuarios() {
    try {
      setIsLoadingUsers(true);
      const [usuariosData, emprestimosData] = await Promise.all([
        apiRequest('/api/users'),
        apiRequest('/api/loans'),
      ]);

      setUsuarios(usuariosData || []);

      const userIdsComEmprest = Array.isArray(emprestimosData)
        ? [...new Set(emprestimosData.map((emp) => emp.userId).filter(Boolean))]
        : [];

      setUserIdsComEmprestimos(userIdsComEmprest);
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao carregar usuários'));
    } finally {
      setIsLoadingUsers(false);
    }
  }

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
    const livroParaExcluir = livros.find((livro) => livro.id === id);
    if (!livroParaExcluir) {
      alert('Livro não encontrado');
      return;
    }

    if (bookIdsComEmprestimos.includes(id)) {
      alert('Nao e possivel excluir este livro porque existem emprestimos vinculados a ele.');
      return;
    }

    if (
      window.confirm(
        `Tem certeza que deseja excluir "${livroParaExcluir.titulo}" de ${livroParaExcluir.autor}?`
      )
    ) {
      try {
        setActionState({ type: 'deleting', bookId: id });
        console.log(`🗑️ Excluindo livro ID: ${id}`);

        // Evita erro de integridade referencial: livro com emprestimos não pode ser removido.
        const emprestimos = await apiRequest('/api/loans');
        const possuiEmprestimosVinculados =
          Array.isArray(emprestimos) &&
          emprestimos.some((emprestimo) => emprestimo.bookId === id);

        if (possuiEmprestimosVinculados) {
          alert(
            'Nao e possivel excluir este livro porque existem emprestimos vinculados a ele.'
          );
          return;
        }
        
        const response = await apiRequest(`/api/books/${id}`, { method: 'DELETE' });
        console.log('✅ Livro excluído com sucesso:', response);
        
        setLivros((prev) => prev.filter((livro) => livro.id !== id));
        setBookIdsComEmprestimos((prev) => prev.filter((bookId) => bookId !== id));
        alert(`Livro "${livroParaExcluir.titulo}" excluído com sucesso!`);
      } catch (error) {
        console.error('❌ Erro ao excluir livro:', error);
        
        // Verificar especificamente erro 409 (Conflito)
        if (error.status === 409) {
          alert('❌ Não é possível excluir este livro pois ele possui um histórico de empréstimo ativo/finalizado.');
        } else {
          alert(getFriendlyError(error, 'Falha ao excluir livro'));
        }
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

  // ========== FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ==========

  const handleEditarUsuario = async (usuario) => {
    const novoNome = window.prompt('Novo nome:', usuario.name);
    if (novoNome === null) return;

    const novoEmail = window.prompt('Novo email:', usuario.email);
    if (novoEmail === null) return;

    try {
      setActionState({ type: 'editing', userId: usuario.id });
      const usuarioAtualizadoApi = await apiRequest(`/api/users/${usuario.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: novoNome,
          email: novoEmail,
          role: usuario.role,
        }),
      });

      setUsuarios((prev) =>
        prev.map((item) =>
          item.id === usuario.id
            ? {
                ...item,
                name: usuarioAtualizadoApi.name ?? novoNome,
                email: usuarioAtualizadoApi.email ?? novoEmail,
              }
            : item
        )
      );
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      alert(getFriendlyError(error, 'Falha ao atualizar usuário'));
    } finally {
      setActionState({ type: null, userId: null });
    }
  };

  const handleExcluirUsuario = async (usuario) => {
    // Proteção: não permitir excluir último admin
    if (usuario.role === 'admin') {
      const admins = usuarios.filter((u) => u.role === 'admin');
      if (admins.length <= 1) {
        alert('❌ Não é possível remover o último administrador do sistema.');
        return;
      }
    }

    if (userIdsComEmprestimos.includes(usuario.id)) {
      alert('Não é possível excluir este usuário porque ele possui empréstimos vinculados.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário "${usuario.name}" (${usuario.email})?`)) {
      try {
        setActionState({ type: 'deleting', userId: usuario.id });
        console.log(`🗑️ Excluindo usuário ID: ${usuario.id}`);

        await apiRequest(`/api/users/${usuario.id}`, { method: 'DELETE' });
        console.log('✅ Usuário excluído com sucesso');

        setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
        setUserIdsComEmprestimos((prev) => prev.filter((uid) => uid !== usuario.id));
        alert(`Usuário "${usuario.name}" excluído com sucesso!`);
      } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);

        // Verificar especificamente erro 409 (Conflito)
        if (error.status === 409) {
          alert('❌ Não é possível excluir este usuário pois ele possui um histórico de empréstimo ativo/finalizado.');
        } else {
          alert(getFriendlyError(error, 'Falha ao excluir usuário'));
        }
      } finally {
        setActionState({ type: null, userId: null });
      }
    }
  };

  // Filtrar usuários por busca
  const usuariosFiltrados = useMemo(() => {
    if (!buscaUsuarios.trim()) return usuarios;
    const buscaLower = buscaUsuarios.toLowerCase();
    return usuarios.filter(
      (usuario) =>
        usuario.name.toLowerCase().includes(buscaLower) ||
        usuario.email.toLowerCase().includes(buscaLower)
    );
  }, [usuarios, buscaUsuarios]);

  return (
    <div className="painel-admin-page">
      <Navbar />

      <section className="painel-admin-section">
        <div className="painel-admin-container">
          <div className="painel-admin-header fade-in">
            <h1>Painel do Administrador</h1>
            <p>Gerenciar catálogo de livros e usuários</p>
          </div>

          {/* Abas de Navegação */}
          <div className="painel-admin-tabs fade-in">
            <button
              className={`painel-tab ${abaAtiva === 'livros' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('livros')}
            >
              📚 Gerenciar Livros
            </button>
            <button
              className={`painel-tab ${abaAtiva === 'usuarios' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('usuarios')}
            >
              👥 Gerenciar Usuários
            </button>
          </div>

          {/* ========== ABA LIVROS ========== */}
          {abaAtiva === 'livros' && (
            <>
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
                  {mostrarFormulario ? 'Cancelar' : '+ Adicionar Manual'}
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
                      <div className="painel-livro-capa">
                        <span className="painel-livro-capa-fallback" aria-hidden="true">
                          📖
                        </span>
                        {livro.urlCapa && (
                          <img
                            src={livro.urlCapa}
                            alt={`Capa do livro ${livro.titulo}`}
                            className="painel-livro-capa-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
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
                        {bookIdsComEmprestimos.includes(livro.id) && (
                          <p className="painel-livro-alerta" style={{ margin: '0 0 8px', color: '#fbbf24', fontSize: '0.85rem' }}>
                            Livro com emprestimos vinculados
                          </p>
                        )}
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
                          disabled={isActionInProgress || bookIdsComEmprestimos.includes(livro.id)}
                          title={
                            bookIdsComEmprestimos.includes(livro.id)
                              ? 'Nao e possivel excluir: existem emprestimos vinculados a este livro.'
                              : 'Excluir livro'
                          }
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
            </>
          )}

          {/* ========== ABA USUÁRIOS ========== */}
          {abaAtiva === 'usuarios' && (
            <>
              {/* Controles de Usuários */}
              <div className="painel-admin-controls fade-in">
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={buscaUsuarios}
                  onChange={(e) => setBuscaUsuarios(e.target.value)}
                  className="painel-search"
                />
              </div>

              {/* Lista de Usuários */}
              <div className="painel-admin-stats fade-in">
                <p>
                  Total de usuários: <strong>{usuariosFiltrados.length}</strong>
                </p>
              </div>

              {isLoadingUsers ? (
                <div className="painel-empty fade-in">
                  <p>Carregando usuários...</p>
                </div>
              ) : usuariosFiltrados.length > 0 ? (
                <div className="painel-usuarios-table fade-in">
                  <table>
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Função</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.map((usuario) => (
                        <tr key={usuario.id}>
                          <td>{usuario.name}</td>
                          <td>{usuario.email}</td>
                          <td>
                            <span className={`badge ${usuario.role === 'admin' ? 'admin' : 'aluno'}`}>
                              {usuario.role === 'admin' ? '🔐 Admin' : '👤 Aluno'}
                            </span>
                          </td>
                          <td>
                            {userIdsComEmprestimos.includes(usuario.id) ? (
                              <span className="status-warning" title="Este usuário possui empréstimos associados">
                                ⚠️ Com empréstimos
                              </span>
                            ) : (
                              <span className="status-ok">✅ Disponível</span>
                            )}
                          </td>
                          <td>
                            <div className="usuario-actions">
                              <button
                                className="btn-details"
                                onClick={() => handleEditarUsuario(usuario)}
                                disabled={isActionInProgress}
                                title="Editar usuário"
                              >
                                {actionState.type === 'editing' && actionState.userId === usuario.id
                                  ? 'Salvando...'
                                  : '✎'}
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleExcluirUsuario(usuario)}
                                disabled={
                                  isActionInProgress ||
                                  (usuario.role === 'admin' && usuarios.filter((u) => u.role === 'admin').length <= 1) ||
                                  userIdsComEmprestimos.includes(usuario.id)
                                }
                                title={
                                  usuario.role === 'admin' && usuarios.filter((u) => u.role === 'admin').length <= 1
                                    ? 'Não é possível excluir o último admin'
                                    : userIdsComEmprestimos.includes(usuario.id)
                                    ? 'Não é possível excluir: existem empréstimos vinculados'
                                    : 'Excluir usuário'
                                }
                              >
                                {actionState.type === 'deleting' && actionState.userId === usuario.id
                                  ? 'Excluindo...'
                                  : '🗑️'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="painel-empty fade-in">
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default PainelAdmin;
