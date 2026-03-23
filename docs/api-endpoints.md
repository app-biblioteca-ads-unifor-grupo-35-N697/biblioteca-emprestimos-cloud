
# Endpoints da API — Backend Biblioteca

Esse documento lista todas as rotas disponíveis no backend para quem vai desenvolver o frontend ou testar a API. Qualquer dúvida, chama o Daniel ou o Brunu.

---

## Links importantes

- [Swagger (documentação interativa)](https://biblioteca-emprestimos-cloud.onrender.com/docs)
- [Render (deploy/painel)](https://dashboard.render.com/)
- [Guia de padrões do projeto](../backend/documentacao-library-manager-main/padroes-projeto.md)
- [Repositório](https://github.com/app-biblioteca-ads-unifor-grupo-35-n697-nuvem/biblioteca-emprestimos-cloud)

---

## Usuário admin padrão

O sistema garante que sempre existe um usuário admin para acesso administrativo:

```
Email: admin@biblioteca.com
Senha: (definida no seed/script, altere após deploy)
```

Esse admin é criado automaticamente pelo seed do backend. Recomenda-se alterar a senha após o deploy.

---

## URL base

Enquanto tiver rodando local:

```
http://localhost:3001
```

Em produção (Render):

```
https://biblioteca-emprestimos-cloud.onrender.com
```

---

## Como rodar o backend local

Na pasta `backend/`, roda:

```bash
npm install
npm run dev
```

Precisa ter o arquivo `.env` configurado com as variáveis do `.env.example`:

```
PORT=3001
JWT_KEY=qualquer_string_secreta
DATABASE_URL=url_do_supabase
```

---


## Autenticação

As rotas marcadas com 🔒 precisam de token JWT no header:

```
Authorization: Bearer <token>
```
O token é obtido no login (veja abaixo).

### Exemplo de requisição autenticada

```http
GET /api/books HTTP/1.1
Host: biblioteca-emprestimos-cloud.onrender.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5...
```

---

---

## Rotas de autenticação

### POST `/auth/register` — Cadastrar usuário

Não precisa de token.

**Body (JSON):**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com"
}
```

---

### POST `/auth/login` — Fazer login

Não precisa de token.

**Body (JSON):**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Resposta (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

> Guarda esse token — vai precisar ele pra chamar todas as outras rotas.

---


## Permissões por papel

- Rotas de CRUD de usuários (GET, POST, PUT, DELETE) são exclusivas de admin.
- Rotas de livros e empréstimos: qualquer usuário autenticado pode visualizar e reservar/devolver livros.
- Apenas admin pode cadastrar/editar/remover livros (recomendado para bibliotecas reais).

---

## Rotas de livros 🔒

### GET `/api/books` — Listar todos os livros
**Resposta (200):**
```json
[
  {
    "id": 1,
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "quantityAvailable": 3
  }
]
```

### POST `/api/books` — Cadastrar livro (apenas admin)
**Body (JSON):**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "quantityAvailable": 3
}
```
**Resposta (201):** objeto do livro criado.

### PUT `/api/books/:id` — Atualizar livro (apenas admin)
**Body (JSON):** campos que quer atualizar.
**Resposta (200):** objeto do livro atualizado.

### DELETE `/api/books/:id` — Remover livro (apenas admin)
**Resposta (200):** objeto do livro removido.
**Erro (409):** `{"error": "Não é possível remover o livro, pois ele possui empréstimos associados."}`

---

## Rotas de empréstimos 🔒

### GET `/api/loans` — Listar empréstimos

**Resposta (200):**
```json
[
  {
    "id": 1,
    "userId": 1,
    "bookId": 2,
    "loanDate": "2026-03-07T00:00:00.000Z",
    "returnDate": null
  }
]
```

---

### POST `/api/loans` — Criar empréstimo

**Body (JSON):**
```json
{
  "bookId": 2
}
```

**Resposta (201):** objeto do empréstimo criado.

---

### PUT `/api/loans/:id` — Devolver livro

Não precisa de body.

**Resposta (200):** objeto do empréstimo com `returnDate` preenchido.

---


## Resumo rápido

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Cadastra usuário | ❌ |
| POST | `/auth/login` | Login, retorna token | ❌ |
| GET | `/api/books` | Lista livros | ✅ |
| POST | `/api/books` | Cadastra livro | ✅ (admin) |
| PUT | `/api/books/:id` | Atualiza livro | ✅ (admin) |
| DELETE | `/api/books/:id` | Remove livro | ✅ (admin) |
| GET | `/api/loans` | Lista empréstimos | ✅ |
| POST | `/api/loans` | Cria empréstimo | ✅ |
| PUT | `/api/loans/:id` | Devolve livro | ✅ |
| GET | `/api/users` | Lista usuários | ✅ (admin) |
| POST | `/api/users` | Cadastra usuário | ✅ (admin) |
| PUT | `/api/users/:id` | Atualiza usuário | ✅ (admin) |
| DELETE | `/api/users/:id` | Remove usuário | ✅ (admin) |

> **Atenção nas exclusões (DELETE):** As rotas de remover Livro e remover Usuário retornarão o Status **409 Conflict** caso o registro possua empréstimos associados. O Front-end deve tratar esse status e exibir um alerta amigável, pois a API não permite a exclusão para manter a integridade do banco.

---

## Exemplos de erros comuns

### 401 — Não autenticado
```json
{
  "error": "Token ausente ou inválido."
}
```

### 403 — Sem permissão
```json
{
  "error": "Acesso negado: apenas administradores podem executar esta ação."
}
```

### 404 — Não encontrado
```json
{
  "error": "Recurso não encontrado."
}
```

---

## Dicas para integração frontend

- Use o Swagger para testar endpoints e visualizar exemplos de payload/resposta.
- Sempre obtenha o token JWT no login e envie no header Authorization.
- Trate erros de autenticação e permissão no frontend.
- **⚠️ FORMATO DE ERROS (ATUALIZADO):** Graças ao novo Error Handler global do backend, todos os erros devolvidos pela API enviarão a mensagem dentro da propriedade `"error"` e não mais `"message"`. (Exemplo: `err.response.data.error`). Certifique-se de ajustar isso no Axios.
- Consulte o guia de padrões do projeto para entender fluxos e regras de negócio.
- Em caso de dúvida, consulte os links importantes ou peça ajuda ao time.
