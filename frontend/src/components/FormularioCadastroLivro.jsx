import React, { useState, useRef, useEffect } from 'react';
import { fetchBookByISBN, isValidISBN } from '../services/googleBooks';
import { apiRequest } from '../services/api';
import '../styles/FormularioCadastroLivro.css';

/**
 * Componente de formulário para cadastro de novos livros
 * Integra com Google Books API para auto-preenchimento de dados
 */
function FormularioCadastroLivro() {
  const [formData, setFormData] = useState({
    isbn: '',
    titulo: '',
    autor: '',
    quantidadeDisponivel: 0,
    sinopse: '',
    urlCapa: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ type: '', texto: '' });
  const [erroRateLimit, setErroRateLimit] = useState(false);
  
  // Ref para debounce na busca onBlur
  const debounceTimeoutRef = useRef(null);
  const ultimaRequisicaoRef = useRef(null);

  /**
   * Busca dados do livro na API do Google Books
   */
  const handleBuscarDados = async (isbnValue = null) => {
    const isbnParaBuscar = isbnValue || formData.isbn;

    if (!isbnParaBuscar.trim()) {
      setMensagem({
        type: 'erro',
        texto: 'Por favor, insira um ISBN para buscar.',
      });
      return;
    }

    if (!isValidISBN(isbnParaBuscar)) {
      setMensagem({
        type: 'aviso',
        texto: 'ISBN pode estar em formato inválido. Continuando a busca...',
      });
    }

    setIsLoading(true);
    setMensagem({ type: '', texto: '' });
    setErroRateLimit(false);

    try {
      const dadosLivro = await fetchBookByISBN(isbnParaBuscar);

      setFormData((prev) => ({
        ...prev,
        ...dadosLivro,
        isbn: isbnParaBuscar.trim(),
      }));

      setMensagem({
        type: 'sucesso',
        texto: '✅ Livro encontrado! Dados preenchidos automaticamente.',
      });
    } catch (error) {
      const isRateLimitError = error.message.includes('Muitas requisições');

      setMensagem({
        type: 'erro',
        texto: isRateLimitError
          ? '❌ Google Books está com limite de requisições. Aguarde alguns segundos e tente novamente.'
          : `❌ ${error.message}`,
      });
      setErroRateLimit(isRateLimitError);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dispara busca ao sair do campo ISBN (onBlur) com debounce
   */
  const handleISBNBlur = (e) => {
    const isbn = e.target.value.trim();
    
    // Limpa timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (!isbn) return;
    
    // Evita requisições muito próximas (< 500ms)
    const agora = Date.now();
    if (ultimaRequisicaoRef.current && agora - ultimaRequisicaoRef.current < 500) {
      return;
    }
    
    // Set novo timeout para debounce (300ms após o blur)
    debounceTimeoutRef.current = setTimeout(() => {
      handleBuscarDados(isbn);
      ultimaRequisicaoRef.current = Date.now();
    }, 300);
  };

  /**
   * Limpar timeouts ao desmontar o componente
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Atualiza um campo do formulário
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Valida o formulário
   */
  const validarFormulario = () => {
    const { isbn, titulo, autor, quantidadeDisponivel } = formData;

    if (!isbn.trim()) {
      setMensagem({ type: 'erro', texto: 'ISBN é obrigatório.' });
      return false;
    }

    if (!titulo.trim()) {
      setMensagem({ type: 'erro', texto: 'Título é obrigatório.' });
      return false;
    }

    if (!autor.trim()) {
      setMensagem({ type: 'erro', texto: 'Autor é obrigatório.' });
      return false;
    }

    if (quantidadeDisponivel < 0) {
      setMensagem({ type: 'erro', texto: 'Quantidade deve ser um número positivo.' });
      return false;
    }

    return true;
  };

  /**
   * Salva o livro enviando para o backend
   */
  const handleSalvar = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setIsLoading(true);
    setMensagem({ type: '', texto: '' });

    try {
      // Envia apenas os campos esperados
      const novoLivro = await apiRequest('/api/books', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.titulo,
          author: formData.autor,
          quantiteAvailable: Number(formData.quantidadeDisponivel),
        }),
      });

      console.log('📚 Livro salvo no backend com sucesso:', novoLivro);

      setMensagem({
        type: 'sucesso',
        texto: '✅ Livro salvo com sucesso!',
      });

      // Limpa o formulário
      setFormData({
        isbn: '',
        titulo: '',
        autor: '',
        quantidadeDisponivel: 0,
        sinopse: '',
        urlCapa: '',
      });
    } catch (error) {
      setMensagem({
        type: 'erro',
        texto: `❌ Erro ao salvar livro: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa o formulário
   */
  const handleLimpar = () => {
    setFormData({
      isbn: '',
      titulo: '',
      autor: '',
      quantidadeDisponivel: 0,
      sinopse: '',
      urlCapa: '',
    });
    setMensagem({ type: '', texto: '' });
    setErroRateLimit(false);
  };

  return (
    <div className="formulario-cadastro-livro">
      <div className="formulario-container">
        <h2>📖 Cadastrar Novo Livro</h2>

        {/* Mensagens de feedback */}
        {mensagem.texto && (
          <div className={`mensagem mensagem-${mensagem.type}`}>
            {mensagem.texto}
          </div>
        )}

        {erroRateLimit && (
          <div className="campo-grupo" style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className="botao botao-buscar"
              onClick={() => handleBuscarDados(formData.isbn)}
              disabled={isLoading || !formData.isbn.trim()}
              title="Tentar buscar novamente no Google Books"
            >
              {isLoading ? '⏳ Tentando...' : '🔄 Tentar Novamente'}
            </button>
          </div>
        )}

        <form onSubmit={handleSalvar}>
          {/* Campo ISBN com busca */}
          <div className="campo-grupo">
            <label htmlFor="isbn">
              ISBN <span className="obrigatorio">*</span>
            </label>
            <div className="grupo-entrada-botao">
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                onBlur={handleISBNBlur}
                placeholder="Ex: 978-0134685991"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => handleBuscarDados()}
                disabled={isLoading || !formData.isbn.trim()}
                className="botao-buscar"
                title="Buscar dados do livro na Google Books API"
              >
                {isLoading ? '⏳ Buscando...' : '🔍 Buscar Dados'}
              </button>
            </div>
          </div>

          {/* Campo Título */}
          <div className="campo-grupo">
            <label htmlFor="titulo">
              Título <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Digite o título do livro"
              disabled={isLoading}
            />
          </div>

          {/* Campo Autor */}
          <div className="campo-grupo">
            <label htmlFor="autor">
              Autor <span className="obrigatorio">*</span>
            </label>
            <input
              type="text"
              id="autor"
              name="autor"
              value={formData.autor}
              onChange={handleChange}
              placeholder="Digite o autor(es)"
              disabled={isLoading}
            />
          </div>

          {/* Campo Sinopse */}
          <div className="campo-grupo">
            <label htmlFor="sinopse">Sinopse</label>
            <textarea
              id="sinopse"
              name="sinopse"
              value={formData.sinopse}
              onChange={handleChange}
              placeholder="Digite a sinopse do livro"
              rows="5"
              disabled={isLoading}
            />
          </div>

          {/* Campo URL da Capa */}
          <div className="campo-grupo">
            <label htmlFor="urlCapa">URL da Capa</label>
            <input
              type="text"
              id="urlCapa"
              name="urlCapa"
              value={formData.urlCapa}
              onChange={handleChange}
              placeholder="https://..."
              disabled={isLoading}
            />
          </div>

          {/* Prévia da capa */}
          {formData.urlCapa && (
            <div className="campo-grupo">
              <label>Prévia da Capa</label>
              <div className="preview-capa">
                <img
                  src={formData.urlCapa}
                  alt="Prévia da capa"
                  onError={(e) => {
                    e.target.alt = 'Erro ao carregar imagem';
                    e.target.style.opacity = '0.5';
                  }}
                />
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="grupo-botoes">
            <button
              type="submit"
              disabled={isLoading}
              className="botao botao-salvar"
            >
              {isLoading ? '⏳ Salvando...' : '💾 Salvar Livro'}
            </button>
            <button
              type="button"
              onClick={handleLimpar}
              disabled={isLoading}
              className="botao botao-limpar"
            >
              🔄 Limpar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioCadastroLivro;
