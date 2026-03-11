# 🔐 Variáveis de Ambiente para Vercel

## Para o Frontend (React)

> **Nota:** Variáveis no frontend devem ter prefixo `REACT_APP_`

```env
# URL da API do backend (ajuste se seu backend 
# estiver em um serviço como Railway, Render, etc)
REACT_APP_API_URL=https://seu-backend-url.herokuapp.com
```

## Para o Backend (Express + Node.js 22.x)

```env
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@host:5432/biblioteca?schema=public"

# Autenticação
JWT_SECRET="sua-chave-secreta-muito-segura-aqui-256-caracteres-minimo"

# Ambiente
NODE_ENV="production"

# Porta (Vercel define automaticamente, mas você pode customizar)
PORT=3001

# CORS (para permitir requisições do frontend)
CORS_ORIGIN="https://seu-frontend.vercel.app"
```

## Como Adicionar na Vercel Console:

1. Acesse **Settings** → **Environment Variables**
2. Para desenvolvimento (Development): adicione todas acima
3. Para produção (Production): use valores reais
4. **Re-deploy** após adicionar

---

## Checklist de Variáveis:

- [ ] `REACT_APP_API_URL` - URL do backend
- [ ] `DATABASE_URL` - String de conexão PostgreSQL
- [ ] `JWT_SECRET` - Chave para tokens JWT
- [ ] `NODE_ENV` - Definido como "production"
- [ ] `CORS_ORIGIN` - URL do frontend para CORS
