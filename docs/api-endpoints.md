# Endpoints da API — Backend Biblioteca

Esse documento lista todas as rotas disponíveis no backend pra quem vai desenvolver o frontend ou testar a API. Qualquer dúvida, chama o Daniel ou o Brunu.

---

## URL base

Enquanto tiver rodando local:

```
http://localhost:3001
```

Em produção (após o deploy no Render):

```
https://url-do-render.onrender.com
```

> Quando o deploy estiver feito, a gente atualiza aqui com a URL real.

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

As rotas marcadas com 🔒 precisam de token JWT no header de toda requisição:

```
Authorization: Bearer <token>
```

O token é obtido no login (veja abaixo).

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

---

### POST `/api/books` — Cadastrar livro

**Body (JSON):**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "quantityAvailable": 3
}
```

**Resposta (201):** objeto do livro criado.

---

### PUT `/api/books/:id` — Atualizar livro

**Body (JSON):** campos que quer atualizar.

**Resposta (200):** objeto do livro atualizado.

---

### DELETE `/api/books/:id` — Remover livro

**Resposta (200):** objeto do livro removido.

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
| POST | `/api/books` | Cadastra livro | ✅ |
| PUT | `/api/books/:id` | Atualiza livro | ✅ |
| DELETE | `/api/books/:id` | Remove livro | ✅ |
| GET | `/api/loans` | Lista empréstimos | ✅ |
| POST | `/api/loans` | Cria empréstimo | ✅ |
| PUT | `/api/loans/:id` | Devolve livro | ✅ |
