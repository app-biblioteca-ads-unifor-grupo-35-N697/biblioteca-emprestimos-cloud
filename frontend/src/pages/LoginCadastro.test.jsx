import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginCadastro from './LoginCadastro';
import { apiRequest } from '../services/api';

const mockNavigate = jest.fn();

jest.mock('../services/api', () => ({
  apiRequest: jest.fn(),
}));

jest.mock('../components/Navbar', () => function NavbarMock() {
  return <div data-testid="navbar">Navbar</div>;
});

jest.mock('react-router-dom', () => {
  return {
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/login' }),
  };
}, { virtual: true });

describe('Fluxo de autenticacao - LoginCadastro', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.alert = jest.fn();
  });

  it('realiza login e salva token no localStorage', async () => {
    apiRequest.mockResolvedValueOnce({ token: 'header.payload.signature' });

    render(<LoginCadastro />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'aluno@teste.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123456' },
    });

    const botoesEntrar = screen.getAllByRole('button', { name: 'Entrar' });
    fireEvent.click(botoesEntrar[botoesEntrar.length - 1]);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'aluno@teste.com', password: '123456' }),
      });
    });

    expect(localStorage.getItem('token')).toBe('header.payload.signature');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('realiza cadastro e depois login automatico', async () => {
    apiRequest
      .mockResolvedValueOnce({ id: 'u1' })
      .mockResolvedValueOnce({ token: 'header.payload.signature' });

    render(<LoginCadastro />);

    const botoesCadastrar = screen.getAllByRole('button', { name: 'Cadastrar' });
    fireEvent.click(botoesCadastrar[botoesCadastrar.length - 1]);

    fireEvent.change(screen.getByLabelText('Nome Completo'), {
      target: { value: 'Aluno Teste' },
    });
    fireEvent.change(screen.getByLabelText('Email Institucional'), {
      target: { value: 'novo@teste.com' },
    });
    fireEvent.change(screen.getByLabelText('Matrícula'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar Senha'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByLabelText('Aceito os termos de uso'));

    const botoesSubmitCadastro = screen.getAllByRole('button', { name: 'Cadastrar' });
    fireEvent.click(botoesSubmitCadastro[botoesSubmitCadastro.length - 1]);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenNthCalledWith(1, '/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Aluno Teste',
          email: 'novo@teste.com',
          password: '123456',
        }),
      });
    });

    expect(apiRequest).toHaveBeenNthCalledWith(2, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'novo@teste.com', password: '123456' }),
    });
    expect(localStorage.getItem('token')).toBe('header.payload.signature');
  });
});
