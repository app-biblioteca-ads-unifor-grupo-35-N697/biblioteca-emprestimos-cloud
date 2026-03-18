import React from 'react';
import Navbar from '../components/Navbar';
import FormularioCadastroLivro from '../components/FormularioCadastroLivro';

/**
 * Página de Cadastro de Livros
 * Rota dedicada para o formulário de cadastro com integração Google Books
 */
function CadastroLivro() {
  return (
    <div className="cadastro-livro-page">
      <Navbar />
      <main className="cadastro-livro-main">
        <FormularioCadastroLivro />
      </main>
    </div>
  );
}

export default CadastroLivro;
