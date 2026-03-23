# Plano de Refatoração e Melhorias — Backend e Integração

**Data:** Março de 2026  
**Módulo:** Backend (Node.js / Express / Prisma) e Frontend (React)  
**Objetivo:** Descobrir e resolver a causa das quedas do servidor em produção e inconsistência no banco de dados.  
**Status:** Finalizado ✅

---

## 1. Problemas Diagnosticados

O servidor backend estava "caindo" de forma abrupta e os usuários relatavam problemas de "Livro não encontrado". Duas causas principais foram isoladas:

1. **Falta de Tratamento Global de Erros:** Exceções lançadas nos *controllers* (como `throw new HttpError`) não eram capturadas por blocos `try...catch`, fazendo com que o processo do Node.js travasse e derrubasse a aplicação inteira.
2. **Quebra de Integridade Referencial:** A exclusão de livros não validava a existência de empréstimos ativos ou antigos. Apagar um livro deixava os registros de empréstimos corrompidos, causando as falhas de busca posteriores.

---

## 2. Modificações Realizadas no Backend (Concluídas)

O foco do trabalho foi exclusivamente na correção estrutural e blindagem da API (sem adição de novas funcionalidades de negócio).

* **Implementação de Error Handler Global (`error-handler.js`):** 
  Criado e registrado no `app.js` um middleware para interceptar qualquer erro. Agora, o servidor se mantém online e responde ao frontend com um JSON padronizado.

* **Refatoração dos Controllers:**
  * Envolvidos todos os métodos dos controllers (`books`, `loans`, `users`, `auth`) com `try...catch(next)`.
  * **Correção Crítica:** O `DELETE /api/books/:id` agora consulta o banco antes da exclusão. Se o livro tiver empréstimos, a operação é bloqueada com um erro `409 Conflict`.

* **Proteção do Banco de Dados:**
  * Adicionada a constraint `onDelete: Restrict` na tabela de Empréstimos no `schema.prisma`.
  * Refatorado o script `seed-admin.js` para utilizar a instrução não-destrutiva `upsert`, evitando mudanças indesejadas nos IDs que corrompiam os vínculos do banco.

* **Resolvido Conflito de Versão do Prisma:**
  * Limpeza do cache do ambiente local e downgrade seguro do Prisma para a versão 6.19.2, corrigindo as falhas de compilação do `schema.prisma` geradas pela atualização acidental para a v7.

* **Correções Finais (Estabilização e Testes):**
  * Ajuste na propriedade de leitura de status no `error-handler.js` (de `err.statusCode` para `err.status`), garantindo que o backend retorne os códigos HTTP exatos (400, 401, 403) em vez de Erros 500 genéricos.
  * Limpeza no arquivo de rotas (`api.js`), removendo uma rota órfã (`POST /api/books/search/author`) que impedia o servidor de iniciar corretamente.
  * Correção da consulta de validação de exclusão no `books-controller.js`, utilizando `prisma.loan.findFirst` para evitar um Erro 500 ao tentar deletar livros.
  * Configuração do comando de inicialização no `package.json` (`prisma db seed`) para facilitar a popularização do banco de dados na nuvem.
  * Refatoração de segurança no `seed-admin.js`, removendo a senha fixa (hardcoded) do código e adotando o uso da variável de ambiente `ADMIN_PASSWORD`.

---

## 3. Guia de Adequação para o Front-end

As alterações de robustez no backend exigem pequenos ajustes na forma como o Front-end (React/Axios) lê os erros:

* **Ajustar as Capturas de Erro:**
  Devido ao novo *Error Handler Global*, o backend agora não retorna mais propriedades `"message"`. **Toda mensagem de falha viaja estritamente dentro da propriedade `"error"`**.  
  **Ação necessária:** Em componentes que capturam erros (formulários de login, registro, etc.), alterar a leitura de `err.response.data.message` para `err.response.data.error`.

* **Tratar o Novo Erro de Exclusão (409 Conflict):**
  Ao tentar excluir um livro que tenha um empréstimo associado, a resposta agora é um Status HTTP 409.  
  **Ação necessária:** Na tela de Painel Admin de livros, verificar se `err.response.status === 409` e exibir um alerta amigável (ex: "Não é possível excluir este livro pois ele possui um histórico de empréstimo ativo/finalizado").