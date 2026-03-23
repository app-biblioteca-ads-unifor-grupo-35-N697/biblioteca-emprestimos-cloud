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
  * Correção na exclusão de usuários no `users-controller.js`, implementando a mesma validação (`findFirst` em empréstimos) para evitar Erro 500 e retornar um Status 409.

---

## 3. Guia de Adequação para o Front-end — ✅ IMPLEMENTADO

As alterações de robustez no backend exigem ajustes na forma como o Front-end (React/Axios) lê os erros. **Todas as ações necessárias foram implementadas com sucesso:**

### ✅ 3.1 — Ajustar as Capturas de Erro

**Status:** ✅ IMPLEMENTADO

* **O que foi alterado:**
  - Arquivo: `frontend/src/services/api.js`
  - Mudança: Alterada a priorização de erro para dar preferência a `data.error`
  - De: `data.message || data.error || "Erro ao processar a requisicao"`
  - Para: `data.error || data.message || "Erro ao processar a requisicao"`

* **Motivo:**
  Devido ao novo *Error Handler Global* do backend, o backend agora não retorna mais propriedades `"message"`. **Toda mensagem de falha viaja estritamente dentro da propriedade `"error"`**.

* **Implementação:**
  Componentes que capturam erros (formulários de login, registro, etc.) agora leem corretamente `err.response.data.error` através da função `getFriendlyError()`.

---

### ✅ 3.2 — Tratar o Novo Erro de Exclusão de Livros (409 Conflict)

**Status:** ✅ IMPLEMENTADO

* **O que foi alterado:**
  - Arquivo: `frontend/src/services/api.js` — Adicionada preservação de status HTTP
  - Arquivo: `frontend/src/pages/PainelAdmin.jsx` — Função `handleExcluirLivro`

* **Mudanças em `api.js`:**
  ```javascript
  if (!response.ok) {
    const error = new Error(message);
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }
  ```
  Agora todos os erros preservam `error.status` para que componentes possam verificar especificamente códigos de status HTTP.

* **Mudanças em `PainelAdmin.jsx`:**
  ```javascript
  if (error.status === 409) {
    alert('❌ Não é possível excluir este livro pois ele possui um histórico de empréstimo ativo/finalizado.');
  } else {
    alert(getFriendlyError(error, 'Falha ao excluir livro'));
  }
  ```
  Ao tentar excluir um livro com empréstimos associados, exibe uma mensagem específica e amigável.

---

### ✅ 3.3 — Tratar o Novo Erro de Exclusão de Usuários (409 Conflict)

**Status:** ✅ IMPLEMENTADO — NOVA FEATURE ADICIONADA

#### Nova Funcionalidade: Gerenciamento de Usuários no Painel Admin

* **O que foi adicionado:**
  - Sistema de abas no `PainelAdmin.jsx`: "Livros" e "Usuários"
  - Página completa de gerenciamento de usuários com CRUD
  - Estilos responsivos em `index.css`

* **Funcionalidades Implementadas:**
  1. **Listar Usuários:** Exibe tabela com nome, email, função (Admin/Aluno) e status
  2. **Buscar Usuários:** Filtro em tempo real por nome ou email
  3. **Editar Usuário:** Alterar nome e email via prompt
  4. **Deletar Usuário:** Com validações robustas

* **Proteções Implementadas:**
  - ⚠️ Não permite deletar o último administrador do sistema
  - ⚠️ Valida se usuário possui empréstimos antes de deletar
  - ⚠️ **Trata especificamente erro 409 do backend:**
    ```javascript
    if (error.status === 409) {
      alert('❌ Não é possível excluir este usuário pois ele possui um histórico de empréstimo ativo/finalizado.');
    } else {
      alert(getFriendlyError(error, 'Falha ao excluir usuário'));
    }
    ```

* **Arquivos Modificados:**
  1. `frontend/src/pages/PainelAdmin.jsx`
     - Adicionados estados: `abaAtiva`, `usuarios`, `userIdsComEmprestimos`, `isLoadingUsers`, `buscaUsuarios`
     - Adicionada função `carregarUsuarios()`
     - Adicionada função `handleEditarUsuario()`
     - Adicionada função `handleExcluirUsuario()` com tratamento de erro 409
     - Adicionado filtro `usuariosFiltrados`
     - Adicionado JSX renderizando abas e seção de usuários

  2. `frontend/src/index.css`
     - `.painel-admin-tabs` — Estilos para abas com indicador ativo
     - `.painel-tab` — Botão de aba com transições
     - `.painel-usuarios-table` — Tabela responsiva de usuários
     - `.badge` — Variações (admin, aluno, available, unavailable)
     - `.status-ok` / `.status-warning` — Indicadores de status
     - `.usuario-actions` — Botões de ação (editar/deletar)
     - Responsividade para mobile com tabela com scroll horizontal

---

## 4. Resumo de Implementações

| Funcionalidade | Status | Arquivo | Descrição |
|---|---|---|---|
| Priorizar `data.error` | ✅ | `api.js` | Backend agora prioriza propriedade `error` |
| Preservar status HTTP | ✅ | `api.js` | Erros incluem `error.status` para verificação |
| Erro 409 (Livros) | ✅ | `PainelAdmin.jsx` | Mensagem amigável ao tentar deletar livro com empréstimos |
| Erro 409 (Usuários) | ✅ | `PainelAdmin.jsx` | Mensagem amigável ao tentar deletar usuário com empréstimos |
| Gerenciamento Usuários | ✅ | `PainelAdmin.jsx` + `index.css` | Nova seção no Painel Admin com CRUD de usuários |
| Abas do Painel | ✅ | `PainelAdmin.jsx` + `index.css` | Navegação entre Livros e Usuários |

---

## 5. Guia de Testes e Cuidados com o Banco de Dados

Ao rodar os testes automatizados do backend localmente, a equipe precisa estar atenta ao comportamento de limpeza do banco de dados:

* **Como rodar os testes:** Na pasta `backend`, execute o comando `npm test`.
* **⚠️ Efeito Colateral (Atenção):** Os nossos testes (`users-controller.test.js` e `seed-admin.test.js`) utilizam métodos de faxina (`beforeAll` e `afterAll` com `deleteMany`) para garantir que os testes rodem em um ambiente limpo. Se o seu arquivo `.env` estiver apontando para a URL de produção/desenvolvimento do **Supabase**, rodar os testes **apagará dados reais, incluindo o usuário Admin**.
* **O que fazer após os testes:** Caso você rode os testes apontados para o Supabase, você precisará repopular o administrador imediatamente após o fim do teste para não perder acesso ao sistema. Basta rodar:
  ```bash
  npx prisma db seed
  ```

### 🚀 Melhorias Futuras (Boas Práticas)

Para evitar esse risco no futuro, as seguintes melhorias técnicas devem ser priorizadas nas próximas *Sprints*:
* **Isolamento de Banco de Dados:** Nunca usar a mesma URL de banco (`DATABASE_URL`) para produção e testes.
* **Banco Local (Docker):** Criar um script ou um `docker-compose.yml` para levantar um banco PostgreSQL temporário localmente exclusivo para o `npm test` (semelhante ao que já fazemos no pipeline do GitHub Actions).
* **Arquivo `.env.test`:** Configurar o Jest para ler variáveis de um ambiente de testes, abortando a execução caso detecte a URL do Supabase.
* **Testes para Componentes Frontend:** Implementar testes unitários para o novo componente de gerenciamento de usuários.

