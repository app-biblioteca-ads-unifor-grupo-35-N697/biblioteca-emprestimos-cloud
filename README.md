# 📚 Biblioteca Empréstimos Cloud

[![build passing](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/app-biblioteca-ads-unifor-grupo-35-N697/biblioteca-emprestimos-cloud/actions)  
[![license MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)  
[![node version](https://img.shields.io/badge/node-20-blue)](https://nodejs.org/)

---

## ✅ Descrição

Sistema de empréstimos de livros em nuvem para bibliotecas, desenvolvido para a disciplina **Desenvolvimento de Software em Nuvem (ADS/IA - Unifor)**.  
Permite que usuários façam cadastro, busquem livros, solicitem empréstimos e acompanhem o status das reservas. A plataforma utiliza arquitetura moderna em nuvem com front-end React + Vercel, back-end Node.js + Render e banco PostgreSQL no Supabase.

---

## 🚀 Funcionalidades principais

- ✅ Cadastro e login com autenticação JWT  
- ✅ Listagem e busca de livros  
- ✅ Solicitação de empréstimo e controle de status  
- ✅ Página de “Meus Empréstimos” para usuários  
- ✅ Proteção de rotas (somente autenticados acessam reservas)  
- ✅ API REST documentada com Swagger  
- ✅ Deploy automático via CI/CD

---

## 🧰 Tecnologias e serviços utilizados

| Camada | Tecnologia / Serviço | Motivo |
|--------|----------------------|--------|
| Front-end | React + Vite | Interface rápida e reativa |
| Back-end | Node.js + Express | API REST leve e escalável |
| Banco de Dados | PostgreSQL (Supabase) | Banco gerenciado em nuvem |
| ORM | Prisma | Query segura e migrações |
| Autenticação | JWT (jsonwebtoken) | Auth stateless |
| Containerização | Docker | Portabilidade e isolamento |
| CI/CD | GitHub Actions | Testes e deploy automático |
| Deploy Front | Vercel | Hosting otimizado para React |
| Deploy Back | Render | PaaS containerizado |
| CDN | Cloudflare | CDN + proteção |
| Documentação | Swagger / OpenAPI | API autodescritiva |
| Versionamento | Git + GitHub | Colaboração e histórico |

---

## 🛠️ Como rodar localmente

### Pré-requisitos
- Node.js v18+ (recomendado v20)
- npm (ou yarn)
- Docker (opcional, para rodar o banco localmente)

### 1) Clonar o repositório
```bash
git clone https://github.com/app-biblioteca-ads-unifor-grupo-35-N697/biblioteca-emprestimos-cloud.git
cd biblioteca-emprestimos-cloud
```

### 2) Backend
```bash
cd backend
npm install
```

> ✅ Crie um arquivo `.env` a partir do `.env.example` (se houver) e configure as variáveis abaixo.

#### Variáveis de ambiente do backend
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_KEY=sua_chave_super_secreta
```

### 3) Frontend
```bash
cd ../frontend
npm install
```

#### Variáveis de ambiente do frontend
Crie um `.env.local` com:
```env
VITE_API_URL=https://biblioteca-emprestimos-cloud.onrender.com
```

### 4) Rodar localmente
#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

---

## 🧩 Endpoints da API

| Método | Rota | Precisa JWT? | Descrição |
|--------|------|--------------|-----------|
| POST | /auth/register | ❌ | Registrar usuário |
| POST | /auth/login | ❌ | Fazer login e receber JWT |
| GET | /books | ❌ / ✅ | Listar livros (público / filtros aut.) |
| GET | /books/:id | ❌ | Detalhes de um livro |
| POST | /books | ✅ | Criar novo livro (admin) |
| PUT | /books/:id | ✅ | Atualizar livro (admin) |
| DELETE | /books/:id | ✅ | Remover livro (admin) |
| POST | /loans | ✅ | Solicitar empréstimo |
| GET | /loans | ✅ | Listar empréstimos do usuário |
| PUT | /loans/:id/return | ✅ | Marcar devolução |
| GET | /swagger | ❌ | Documentação da API (Swagger UI) |

---

## 🧪 Como rodar os testes

No backend:
```bash
cd backend
npm test
```

---

## 🌐 Links de deploy

- Back-end: https://biblioteca-emprestimos-cloud.onrender.com
- Front-end: (preencher após deploy no Vercel)

---

## 👥 Equipe (Grupo 35 N697)

- **Marcos Daniel Gomes Dantas (2425179)** — GitHub: [mdanieldantas](https://github.com/mdanieldantas)  
  Dev Back-end + DevOps (API REST, Supabase, Docker, CI/CD, Render)

- **Kaio Bruno Soares dos Santos (2425109)** — GitHub: [DevKaioBrunu](https://github.com/DevKaioBrunu)  
  Dev Front-end (Telas React, integração com API, deploy)

- **Raphael Araripe Magalhães (2425278)** — GitHub: [raphael-araripe](https://github.com/raphael-araripe)  
  Arquiteto + Documentação + Deploy (diagrama, relatório, README, Vercel, Cloudflare)

- **Erico Alves de Lima (2323762)** — GitHub: [EricoAlves07](https://github.com/EricoAlves07)  
  QA + Testes + Vídeo (testes Jest, testes manuais, vídeo demo)

---

## 📄 Licença

Este projeto está licenciado sob a MIT License. Veja o arquivo [LICENSE](LICENSE) para detalhes.
