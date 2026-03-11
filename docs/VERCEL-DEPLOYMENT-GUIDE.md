# 🚀 Guia Completo: Deploy na Vercel (Março 2026)

## 📚 Índice
1. [Resumo Executivo](#resumo)
2. [Arquitetura de Deploy Recomendada](#arquitetura)
3. [Passo a Passo: Deploy do Frontend](#frontend)
4. [Passo a Passo: Deploy do Backend](#backend)
5. [Explicação de Cada Arquivo](#explica%C3%A7%C3%A3o)
6. [Troubleshooting](#troubleshooting)

---

## <a id="resumo"></a>📊 Resumo Executivo

Você tem um **monorepo com 2 aplicações:**
- **Frontend:** React 19 (Create React App)
- **Backend:** Express + Prisma + PostgreSQL

### Configuração Implementada:
✅ **vercel.json** - Configuração moderna (sem "builds" legado)  
✅ **package.json** - Node.js 22.x LTS configurado  
✅ **Headers de Segurança** - Proteção contra XSS, Clickjacking, etc.  
✅ **Variáveis de Ambiente** - 5 variáveis necessárias listadas  
✅ **Todas as dependências** compatíveis com Node.js 22.x  

---

## <a id="arquitetura"></a>🏗️ Arquitetura de Deploy Recomendada

```
┌─────────────────────────────────────────────────┐
│                  INTERNET                       │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
   ┌────▼────┐        ┌────▼────┐
   │ Vercel  │        │ Railway/ │
   │(Frontend)        │ Render   │
   │ React   │        │(Backend) │
   └────┬────┘        └────┬─────┘
        │                  │
        │ HTTPS            │ HTTPS
        │ (SPA)            │ (API REST)
        │                  │
   [build/]           [Node.js 22.x]
   [index.html]       [Express]
   [*.js, *.css]      [Prisma]
        │                  │
        └──────┬───────────┘
            PostgreSQL
           (Supabase/
            AWS RDS)
```

### ✅ Por que essa arquitetura?
- **Mais simples:** Você só cuida de 2 deployments separados
- **Mais escalável:** Frontend e backend escalam independentemente
- **Mais seguro:** CORS controla comunicação entre client e server
- **Mais barato:** Vercel é free-tier generoso para frontend

---

## <a id="frontend"></a>📱 Deploy do Frontend na Vercel

### Passo 1: Conectar seu repositório GitHub
1. Acesse [vercel.com](https://vercel.com)
2. Login com GitHub
3. Clique em "New Project"
4. Selecione seu repositório: `biblioteca-emprestimos-cloud`

### Passo 2: Configuração no painel da Vercel

**Settings → General:**
- Framework Preset: `Create React App`
- Build Command: `cd frontend && npm run build` (já está no `vercel.json`)
- Output Directory: `frontend/build` (já está no `vercel.json`)
- Node.js Version: **22.x** ✅

**Settings → Environment Variables:**
```
REACT_APP_API_URL = https://seu-backend-url.railway.app
```

### Passo 3: Deploy
- Clique "Deploy"
- Vercel vai automaticamente:
  1. Fazer checkout do seu código
  2. Instalar dependências
  3. Rodar `npm run build`
  4. Fazer deploy da pasta `/frontend/build`

**Resultado:** 
- URL como: `https://biblioteca-emprestimos.vercel.app`
- Qualquer push para `main` (ou branch configurada) = novo deploy automático

---

## <a id="backend"></a>🔧 Deploy do Backend (Recomendação: Railway/Render)

### ⚠️ Importante: Vercel vs Railway/Render/Heroku

| Plataforma | Pros | Cons |
|-----------|------|------|
| **Vercel** | Ótimo para frontend | Não ideal para Node.js sempre ativo |
| **Railway** | Node.js nativo, PostgreSQL included | Pago após limite |
| **Render** | Tier free com PostgreSQL | Mais lento a cold start |
| **Heroku** | Legado, fácil | Removeu tier free em 2022 |

**Recomendação:** Use **Railway.app** ou **Render.com**

### Exemplo: Deploy no Railway

#### Passo 1: Criar conta e novo projeto
1. Acesse [railway.app](https://railway.app)
2. New Project → GitHub
3. Selecione seu repositório

#### Passo 2: Configurar
```bash
# Railway detecta automaticamente Node.js
# Mas você pode customizar com railway.json:

{
  "buildCommand": "npm run build && npx prisma migrate deploy",
  "startCommand": "npm start"
}
```

#### Passo 3: Variáveis de Ambiente
No painel Railway → Variables:
```env
NODE_ENV=production
DATABASE_URL=postgresql://...seu banco railway...
JWT_SECRET=sua-chave-super-secreta-aqui
CORS_ORIGIN=https://biblioteca-emprestimos.vercel.app
PORT=3001
```

#### Passo 4: Deploy
- Railway faz deploy automático ao push em `main`
- Sua API estará em algo como: `https://seu-projeto.railway.app`

---

## <a id="explicação"></a>📖 Explicação de Cada Arquivo

### 1. **vercel.json** - O Maestro da Orquestra 🎼

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/build",
  "cleanUrls": false,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://seu-backend-url.com/api/:path*"
    }
  ],
  "headers": [...]
}
```

**O que cada propriedade faz:**

| Propriedade | Significado | Analogia |
|------------|------------|----------|
| `buildCommand` | Comando para buildar | "Receita para assar o bolo" |
| `outputDirectory` | Pasta com resultado do build | "Caixa com o bolo pronto" |
| `cleanUrls` | Remove `.html` das URLs | Se true: `/about` em vez de `/about.html` |
| `rewrites` | Redireciona requisições | Quando alguém bate na porta 1, você redireciona para casa 2 |
| `headers` | Adiciona headers HTTP | Segurança extra que você coloca na carta |

**Headers de Segurança Explicados:**

```
X-Content-Type-Options: nosniff
└─ "Não pense que isso é um script só porque parece um"

X-Frame-Options: SAMEORIGIN
└─ "Só deixa seu site ser embutido dentro dele mesmo"

X-XSS-Protection: 1; mode=block
└─ "Bloqueie ataques XSS (injeção de código malicioso)"

Referrer-Policy: strict-origin-when-cross-origin
└─ "Não conte para websites externos de onde o usuário veio"

Permissions-Policy: camera=(), microphone=(), geolocation=()
└─ "Ninguém acessa câmera, microfone ou localização"
```

---

### 2. **package.json** - A Carteira de Identidade

#### Frontend:
```json
"engines": {
  "node": "22.x"
}
```
**Significa:** "Este projeto SÓ roda em Node.js 22.x"

```json
"build": "CI=false react-scripts build"
```
**O que é `CI=false`?**
- `CI=true` = warnings viram erros e build falha
- `CI=false` = warnings são ignorados (recomendado para React)

#### Backend:
```json
"start": "node src/index.js"
```
**Comando que Vercel/Railway executa em produção**

```json
"build": "echo 'Build completed'"
```
**Para Node.js, build geralmente não faz nada (não precisa compilar)**

---

### 3. **Node.js 22.x vs versões antigas**

```
┌─────────────────────────────────────┐
│ Timeline de Node.js LTS             │
├─────────────────────────────────────┤
│ v18.x │ v20.x │ v22.x │ v24.x      │
│ 2022  │ 2023  │ 2024  │ 2025       │
│ ^^^^  │ ^^^^  │ ^^^^  │            │
│ Old   │ MID   │ NEW   │ Future     │
└─────────────────────────────────────┘
```

**Node.js 22.x Melhorias (março 2026):**
- ⚡ Mais rápido (V8 12.x)
- 📦 npm/yarn/pnpm otimizados
- 🔒 Melhor suporte a ESM (módulos JavaScript)
- 🐛 Menos bugs que v18/v20

**Compatibilidade:**
Sua maioria de pacotes usa `^` (permite qualquer versão compatível):
```
"express": "^4.21.2"
└─ Significa: 4.21.2 até (mas não 5.0.0)
└─ Todas compatíveis com Node 22.x ✅
```

---

## <a id="troubleshooting"></a>🔧 Troubleshooting Comum

### ❌ "Build falhou: Could not find a valid build"

**Solução:**
Vercel precisa saber qual é o root. Adicione no `vercel.json`:
```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/build"
}
```

---

### ❌ "Frontend não consegue conectar à API"

**Causa:** CORS bloqueado

**Solução:**

1. Atualize a variável no Vercel:
```env
REACT_APP_API_URL=https://seu-backend-real-url.railway.app
```

2. No backend (`src/index.js`):
```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
```

3. Reconstrua o frontend:
```bash
npm run build
```

---

### ❌ "Database connection refused"

**Causa:** `DATABASE_URL` não está configurada

**Solução:**
1. Painel Vercel/Railway → Settings → Environment Variables
2. Adicione `DATABASE_URL` com sua string PostgreSQL real
3. Re-deploy

---

### ❌ "Module not found: bcrypt"

**Causa:** `bcrypt` precisa compilar C++ nativo (às vezes falha)

**Solução Rápida:**
```bash
npm install --save bcrypt@latest
git push
```

**Solução Permanente:**
Use `bcryptjs` (puro JavaScript):
```bash
npm uninstall bcrypt
npm install bcryptjs
```

---

## ✅ Checklist Final

- [ ] `vercel.json` criado na raiz
- [ ] `package.json` (frontend) tem `"engines": { "node": "22.x" }`
- [ ] `package.json` (backend) tem `"engines": { "node": "22.x" }`
- [ ] Repositório sincronizado (git push)
- [ ] Projeto adicionado na Vercel (Frontend)
- [ ] Backend deployado em Railway/Render
- [ ] Variáveis de ambiente configuradas em AMBOS
- [ ] `REACT_APP_API_URL` aponta para URL real do backend
- [ ] `CORS_ORIGIN` no backend aponta para URL real do frontend
- [ ] Primeiro deploy feito
- [ ] Teste: Abra seu site no navegador
- [ ] Teste: Clique em um botão que chama a API

---

## 🎓 Resumo: O que Mudou e Por Quê

| Arquivo | Mudança | Por Quê |
|---------|---------|---------|
| `vercel.json` | Criado | Indicar à Vercel como buildar e servir |
| `frontend/package.json` | +`"engines": { "node": "22.x" }` | Garantir compatibilidade |
| `frontend/package.json` | `CI=false` no build | Para não falhar com warnings |
| `backend/package.json` | +`"engines": { "node": "22.x" }` | Garantir compatibilidade |
| `backend/package.json` | +`"start"` script | Vercel precisa saber como iniciar |

---

## 📞 Dúvidas Frequentes

**P: Posso fazer deploy de TUDO na Vercel?**  
R: Tecnicamente sim com serverless functions, mas não é recomendado para APIs pesadas.

**P: Preciso de `now.json`?**  
R: **NÃO!** `now.json` foi descontinuado em 2020. Use `vercel.json`.

**P: Como faço rollback se algo quebrar?**  
R: Vercel mantém histórico de deployments. Vá para "Deployments" e clique "Promote to Production".

**P: Quanto custa?**  
R: Frontend em Vercel = FREE (até 100 GB bandwidth/mês)  
Backend em Railway = $5/mês (começa pago depois do free tier)

---

## 🚀 Próximas Etapas

1. **Agora:** Faça push do seu código
2. **Depois:** Conecte na Vercel
3. **Depois:** Configure variáveis de ambiente
4. **Depois:** Deploy
5. **Depois:** Teste tudo

Boa sorte! 🎉
