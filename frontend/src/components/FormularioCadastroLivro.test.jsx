import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FormularioCadastroLivro from './FormularioCadastroLivro';
import * as googleBooksService from '../services/googleBooks';
import * as apiService from '../services/api';

/**
 * Testes do componente FormularioCadastroLivro
 * Testa renderização, interações, validação e integração com serviço
 */

jest.mock('../services/googleBooks');
jest.mock('../services/api');

describe('FormularioCadastroLivro - Componente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock padrão para apiRequest
    apiService.apiRequest.mockResolvedValue({ id: 'novo-livro-id' });
  });

  /**
   * TESTES: Renderização
   */
  describe('Renderização', () => {
    it('deve renderizar o formulário com todos os campos', () => {
      render(<FormularioCadastroLivro />);

      expect(screen.getByText('📖 Cadastrar Novo Livro')).toBeInTheDocument();
      expect(screen.getByLabelText(/ISBN/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Título/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Autor/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sinopse/)).toBeInTheDocument();
      expect(screen.getByLabelText(/URL da Capa/)).toBeInTheDocument();
    });

    it('deve renderizar os botões corretos', () => {
      render(<FormularioCadastroLivro />);

      expect(screen.getByRole('button', { name: /Buscar Dados/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Salvar Livro/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Limpar/i })).toBeInTheDocument();
    });

    it('deve ter os inputs inicialmente vazios', () => {
      render(<FormularioCadastroLivro />);

      expect(screen.getByLabelText(/ISBN/).value).toBe('');
      expect(screen.getByLabelText(/Título/).value).toBe('');
      expect(screen.getByLabelText(/Autor/).value).toBe('');
      expect(screen.getByLabelText(/Sinopse/).value).toBe('');
      expect(screen.getByLabelText(/URL da Capa/).value).toBe('');
    });

    it('não deve exibir preview de capa inicialmente', () => {
      render(<FormularioCadastroLivro />);

      const previewContainer = screen.queryByAltText(/Prévia da capa/i);
      expect(previewContainer).not.toBeInTheDocument();
    });
  });

  /**
   * TESTES: Busca de ISBN
   */
  describe('Busca de ISBN - onBlur', () => {
    it('deve disparar busca ao sair do campo ISBN com valor', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.blur(isbnInput);

      await waitFor(() => {
        expect(googleBooksService.fetchBookByISBN).toHaveBeenCalledWith(
          '9780134685991'
        );
      });
    });

    it('não deve disparar busca ao sair do campo ISBN vazio', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);

      fireEvent.blur(isbnInput);

      expect(googleBooksService.fetchBookByISBN).not.toHaveBeenCalled();
    });

    it('não deve disparar busca se ISBN só tem espaços', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);

      await userEvent.type(isbnInput, '   ');
      fireEvent.blur(isbnInput);

      expect(googleBooksService.fetchBookByISBN).not.toHaveBeenCalled();
    });
  });

  /**
   * TESTES: Busca via Botão
   */
  describe('Busca via Botão "Buscar Dados"', () => {
    it('deve buscar quando clica no botão Buscar Dados', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(googleBooksService.fetchBookByISBN).toHaveBeenCalledWith(
          '9780134685991'
        );
      });
    });

    it('deve desabilitar botão Buscar se ISBN está vazio', () => {
      render(<FormularioCadastroLivro />);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      expect(botaoBuscar).toBeDisabled();
    });

    it('deve habilitar botão Buscar quando tem valor no ISBN', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');

      expect(botaoBuscar).not.toBeDisabled();
    });

    it('deve mostrar "⏳ Buscando..." durante a busca', async () => {
      let resolvePromise;
      const promiseComControle = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      googleBooksService.fetchBookByISBN.mockReturnValue(promiseComControle);

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      // Durante loading
      expect(screen.getByRole('button', { name: /⏳ Buscando/i })).toBeInTheDocument();

      // Resolve a promise
      resolvePromise({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /⏳ Buscando/i })).not.toBeInTheDocument();
      });
    });
  });

  /**
   * TESTES: Auto-preenchimento
   */
  describe('Auto-preenchimento de campos', () => {
    it('deve preencher os campos quando livro encontrado', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook of agile software craftsmanship',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título/).value).toBe('Clean Code');
        expect(screen.getByLabelText(/Autor/).value).toBe('Robert C. Martin');
        expect(screen.getByLabelText(/Sinopse/).value).toBe(
          'A handbook of agile software craftsmanship'
        );
        expect(screen.getByLabelText(/URL da Capa/).value).toBe(
          'http://example.com/cover.jpg'
        );
      });
    });

    it('deve manter ISBN no formulário após preenchimento', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(screen.getByLabelText(/ISBN/).value).toBe('9780134685991');
      });
    });
  });

  /**
   * TESTES: Mensagens de Feedback
   */
  describe('Mensagens de feedback', () => {
    it('deve exibir mensagem de sucesso quando livro encontrado', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(screen.getByText(/✅ Livro encontrado/)).toBeInTheDocument();
      });
    });

    it('deve exibir mensagem de erro quando livro não encontrado', async () => {
      googleBooksService.fetchBookByISBN.mockRejectedValue(
        new Error('Nenhum livro encontrado com ISBN: 9999999999999')
      );

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9999999999999');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(
          screen.getByText(/Nenhum livro encontrado com ISBN/)
        ).toBeInTheDocument();
      });
    });

    it('deve exibir mensagem de erro quando falha conexão', async () => {
      googleBooksService.fetchBookByISBN.mockRejectedValue(
        new Error('Falha na conexão com Google Books')
      );

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(
          screen.getByText(/Falha na conexão com Google Books/)
        ).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando ISBN é vazio ao salvar', async () => {
      render(<FormularioCadastroLivro />);
      const botaoSalvar = screen.getByRole('button', { name: /Salvar Livro/i });

      fireEvent.click(botaoSalvar);

      await waitFor(() => {
        expect(screen.getByText(/ISBN é obrigatório/)).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando Título é vazio ao salvar', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoSalvar = screen.getByRole('button', { name: /Salvar Livro/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoSalvar);

      await waitFor(() => {
        expect(screen.getByText(/Título é obrigatório/)).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando Autor é vazio ao salvar', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const tituloInput = screen.getByLabelText(/Título/);
      const botaoSalvar = screen.getByRole('button', { name: /Salvar Livro/i });

      await userEvent.type(isbnInput, '9780134685991');
      await userEvent.type(tituloInput, 'Clean Code');
      fireEvent.click(botaoSalvar);

      await waitFor(() => {
        expect(screen.getByText(/Autor é obrigatório/)).toBeInTheDocument();
      });
    });
  });

  /**
   * TESTES: Preview de Capa
   */
  describe('Preview de Capa', () => {
    it('deve exibir preview quando tem URL da capa', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        const img = screen.getByAltText(/Prévia da capa/);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'http://example.com/cover.jpg');
      });
    });

    it('não deve exibir preview quando URL está vazia', () => {
      render(<FormularioCadastroLivro />);

      expect(screen.queryByAltText(/Prévia da capa/i)).not.toBeInTheDocument();
    });
  });

  /**
   * TESTES: Botão Limpar
   */
  describe('Botão Limpar', () => {
    it('deve resetar todos os campos quando clica Limpar', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });
      const botaoLimpar = screen.getByRole('button', { name: /Limpar/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(screen.getByLabelText(/Título/).value).toBe('Clean Code');
      });

      fireEvent.click(botaoLimpar);

      expect(screen.getByLabelText(/ISBN/).value).toBe('');
      expect(screen.getByLabelText(/Título/).value).toBe('');
      expect(screen.getByLabelText(/Autor/).value).toBe('');
      expect(screen.getByLabelText(/Sinopse/).value).toBe('');
      expect(screen.getByLabelText(/URL da Capa/).value).toBe('');
    });

    it('deve limpar as mensagens quando clica Limpar', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });
      const botaoLimpar = screen.getByRole('button', { name: /Limpar/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(screen.getByText(/✅ Livro encontrado/)).toBeInTheDocument();
      });

      fireEvent.click(botaoLimpar);

      expect(screen.queryByText(/✅ Livro encontrado/)).not.toBeInTheDocument();
    });
  });

  /**
   * TESTES: Validação Manual de Campos
   */
  describe('Edição Manual de Campos', () => {
    it('deve permitir editar título após preenchimento automático', async () => {
      googleBooksService.fetchBookByISBN.mockResolvedValue({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });
      const tituloInput = screen.getByLabelText(/Título/);

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      await waitFor(() => {
        expect(tituloInput.value).toBe('Clean Code');
      });

      // Editar o título
      await userEvent.clear(tituloInput);
      await userEvent.type(tituloInput, 'Clean Code - Editado');

      expect(tituloInput.value).toBe('Clean Code - Editado');
    });

    it('deve desabilitar campos durante busca', async () => {
      let resolvePromise;
      const promiseComControle = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      googleBooksService.fetchBookByISBN.mockReturnValue(promiseComControle);

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const tituloInput = screen.getByLabelText(/Título/);
      const botaoBuscar = screen.getByRole('button', { name: /Buscar Dados/i });

      await userEvent.type(isbnInput, '9780134685991');
      fireEvent.click(botaoBuscar);

      // Durante loading, campos devem estar desabilitados
      expect(isbnInput).toBeDisabled();
      expect(tituloInput).toBeDisabled();

      // Resolver promise
      resolvePromise({
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        sinopse: 'A handbook',
        urlCapa: 'http://example.com/cover.jpg',
        isbn: '9780134685991',
      });

      // Após loading, campos deve estar habilitados
      await waitFor(() => {
        expect(isbnInput).not.toBeDisabled();
        expect(tituloInput).not.toBeDisabled();
      });
    });
  });

  /**
   * TESTES: Salvamento
   */
  describe('Salvamento de Livro', () => {
    it('deve fazer console.log dos dados ao salvar', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const tituloInput = screen.getByLabelText(/Título/);
      const autorInput = screen.getByLabelText(/Autor/);
      const botaoSalvar = screen.getByRole('button', { name: /Salvar Livro/i });

      await userEvent.type(isbnInput, '9780134685991');
      await userEvent.type(tituloInput, 'Clean Code');
      await userEvent.type(autorInput, 'Robert C. Martin');
      fireEvent.click(botaoSalvar);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Livro salvo no backend com sucesso'),
          expect.any(Object)
        );
      });

      consoleSpy.mockRestore();
    });

    it('deve mostrar mensagem de sucesso após salvar', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const tituloInput = screen.getByLabelText(/Título/);
      const autorInput = screen.getByLabelText(/Autor/);
      const botaoSalvar = screen.getByRole('button', { name: /Salvar Livro/i });

      await userEvent.type(isbnInput, '9780134685991');
      await userEvent.type(tituloInput, 'Clean Code');
      await userEvent.type(autorInput, 'Robert C. Martin');
      fireEvent.click(botaoSalvar);

      await waitFor(() => {
        expect(screen.getByText(/✅ Livro salvo com sucesso/)).toBeInTheDocument();
      });
    });

    it('deve limpar formulário após salvar com sucesso', async () => {
      render(<FormularioCadastroLivro />);
      const isbnInput = screen.getByLabelText(/ISBN/);
      const tituloInput = screen.getByLabelText(/Título/);
      const autorInput = screen.getByLabelText(/Autor/);
      const botaoSalvar = screen.getByRole('button', { name: /Salvar Livro/i });

      await userEvent.type(isbnInput, '9780134685991');
      await userEvent.type(tituloInput, 'Clean Code');
      await userEvent.type(autorInput, 'Robert C. Martin');
      fireEvent.click(botaoSalvar);

      await waitFor(() => {
        expect(isbnInput.value).toBe('');
        expect(tituloInput.value).toBe('');
        expect(autorInput.value).toBe('');
      });
    });
  });
});
