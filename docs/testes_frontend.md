# Testes do Frontend - Biblioteca de Empréstimos

## 📋 Resumo Executivo

O projeto possui **3 arquivos de teste** no frontend que cobrem componentes, páginas e serviços críticos:

| Arquivo | Localização | Testes | Foco |
|---------|------------|--------|------|
| FormularioCadastroLivro.test.jsx | `src/components/` | 11+ | Renderização, Busca ISBN, Auto-preenchimento |
| LoginCadastro.test.jsx | `src/pages/` | 2 | Autenticação, Login, Cadastro |
| googleBooks.test.js | `src/services/` | 10+ | Integração API, Validação, Cache |

---

## 🧪 Arquivos de Teste Detalhados

### 1. FormularioCadastroLivro.test.jsx

**Localização:** `frontend/src/components/FormularioCadastroLivro.test.jsx`

**Descrição:** Testa o componente de formulário para cadastro de novos livros com múltiplos cenários de interação.

**Cenários de teste:**

#### ✅ Renderização (4 testes)
- Renderiza formulário com todos os campos (ISBN, Título, Autor, Sinopse, URL da Capa)
- Renderiza os botões corretos (Buscar Dados, Salvar Livro, Limpar)
- Inputs inicialmente vazios
- Sem preview de capa no início

#### ✅ Busca por ISBN - onBlur (3 testes)
- Dispara busca ao sair do campo com valor preenchido
- Não busca se campo está vazio
- Não busca se ISBN contém apenas espaços

#### ✅ Busca via Botão "Buscar Dados" (4 testes)
- Busca quando clica no botão
- Botão desabilitado quando ISBN está vazio
- Botão habilitado quando tem valor no ISBN
- Mostra "⏳ Buscando..." durante a operação

#### ✅ Auto-preenchimento de campos (em progresso)
- Preenche os campos automaticamente quando livro é encontrado

**Mock:** Serviço `googleBooks` é mockado para simular respostas da API

---

### 2. LoginCadastro.test.jsx

**Localização:** `frontend/src/pages/LoginCadastro.test.jsx`

**Descrição:** Testa o fluxo de autenticação (login e cadastro de usuários).

**Cenários de teste:**

#### ✅ Teste 1: Login com Sucesso
- Realiza login com email e senha
- Salva token no `localStorage`
- Navega para página inicial (`/`)
- Verifica chamada correta da API `/auth/login`

#### ✅ Teste 2: Cadastro com Login Automático
- Realiza cadastro com dados de novo usuário
- Valida chamada da API `/auth/register`
- Realiza login automático após cadastro bem-sucedido
- Salva token no `localStorage`
- Verifica chamada correta de `/auth/login`

**Mocks:**
- `apiRequest` - função de requisição HTTP
- `Navbar` - componente de navegação
- `react-router-dom` - roteamento e navegação

---

### 3. googleBooks.test.js

**Localização:** `frontend/src/services/googleBooks.test.js`

**Descrição:** Testa integração com a API Google Books com validações robustas e tratamento de erros.

**Cenários de teste:**

#### ✅ Validação de ISBN (2 testes)
- Valida ISBN-13: `9780134685991`
- Valida ISBN-10: `0134685997`
- Valida ISBN com hífen: `978-0-134-68599-1`
- Rejeita ISBN vazio, inválido ou undefined

#### ✅ Busca de Livro (8+ testes)
- **Sucesso:** Busca livro com sucesso e mapeia campos corretamente
  - Retorna: `{ titulo, autor, sinopse, urlCapa, isbn }`
  - Valida headers: `User-Agent: BibliotecaEmprestimos/1.0 (educacional)`

- **Cache:** Retorna cache para mesmo ISBN sem nova chamada HTTP
  - Mesma busca `9780134685991` e `978-0134685991` = 1 chamada HTTP

- **Trim:** Faz trim automático de espaços antes de buscar
  - `"  9780134685991  "` → `isbn:9780134685991`

- **Erros tratados:**
  - ISBN vazio → lança `"ISBN é obrigatório"`
  - Livro não encontrado → lança `"Nenhum livro encontrado com ISBN: 9999999999999"`
  - Falha HTTP → lança `"Erro ao conectar com Google Books: 500"`
  - Falha de rede → lança mensagem amigável sobre conexão

- **Retry automático em 429:**
  - Faz retry automático quando API retorna status 429 (throttling)
  - Tenta 3 vezes antes de falhar

- **Fallback para Open Library:**
  - Após esgotar tentativas de 429 com Google Books, tenta Open Library
  - Mapeia resposta OpenLibrary corretamente

---

## 🚀 Como Executar os Testes

### Pré-requisitos
- Node.js 22.x instalado
- Dependências instaladas: `npm install`

### Comandos Básicos

#### 1. Executar TODOS os testes
```bash
npm test
```
Inicia Jest em modo interativo com opções:
- `a` - executar todos os testes
- `f` - executar apenas testes que falharam
- `p` - filtrar por nome de arquivo
- `t` - filtrar por nome de teste
- `q` - sair

#### 2. Executar teste específico (arquivo)
```bash
npm test FormularioCadastroLivro
npm test LoginCadastro
npm test googleBooks
```

#### 3. Executar teste específico (por nome)
```bash
npm test -t "deve renderizar o formulário"
npm test -- --testNamePattern="deve preencher os campos"
```

#### 4. Modo watch (reexecuta ao salvar arquivo)
```bash
npm test -- --watch
```

#### 5. Com coverage (cobertura de código)
```bash
npm test -- --coverage
```
Mostra:
- % de linhas cobertas
- % de funções cobertas
- % de branches cobertos

#### 6. Modo CI (para pipelines - sem interatividade)
```bash
npm test -- --ci --watchAll=false
```

#### 7. Executar sem modo watch
```bash
npm test -- --watchAll=false
```

---

## 🔧 Configuração

### Framework de Testes
- **Jest** (via `react-scripts`)
- **Testing Library** para componentes React
- **@testing-library/user-event** para simulação de eventos

### Dependencies instaladas
```json
{
  "@testing-library/react": "^16.3.2",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^13.5.0",
  "@testing-library/dom": "^10.4.1"
}
```

### Configuração no package.json
```json
{
  "scripts": {
    "test": "react-scripts test"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  }
}
```

---

## 📊 Cobertura Atual

### ✅ Componentes Testados
- `FormularioCadastroLivro` - Cobertura completa de fluxos principais

### ✅ Páginas Testadas
- `LoginCadastro` - Fluxo de autenticação

### ✅ Serviços Testados
- `googleBooks` - Integração com API, validação e cache

### ❌ Componentes SEM Testes
- `Navbar`
- `FormularioCadastroLivro` (específico - parcialmente testado)

### ❌ Páginas SEM Testes
- `Catalogo`
- `Home`
- `LivroDetalhe`
- `CadastroLivro`
- `PainelAdmin`
- `Reservas`

### ❌ Serviços SEM Testes
- `api` (requisições HTTP)
- `books` (lógica de livros)
- `hooks` (custom hooks)
- `auth` (autenticação/utilitários)
- `errorMessages` (tratamento de mensagens)

---

## 📌 Boas Práticas Observadas

✅ **Mocks adequados:** Serviços externos são mockados (googleBooks, API)
✅ **Async/await:** Usa `waitFor` para operações assíncronas
✅ **User events:** Usa `userEvent` ao invés de `fireEvent` para interações mais realistas
✅ **Cleanup:** Cada teste usa `beforeEach` para limpar mocks e estado
✅ **Testes descritivos:** Nomes de testes em português, claros e objetivos
✅ **Cobertura de erros:** Valida casos de sucesso e falha

---

## 🎯 Próximos Passos Sugeridos

1. **Aumentar cobertura** das páginas sem testes (Catalogo, Home, PainelAdmin, etc)
2. **Testar** o serviço `api.js` com mocks de requisições
3. **Validar** custom hooks em `hooks.js`
4. **Adicionar** testes de integração entre pages e components
5. **Configurar** pre-commit hooks para rodar testes antes de commit
6. **Adicionar** CI/CD pipeline para rodar testes em cada push

---

## 📝 Notas Técnicas

- Os testes usam **localStorage** para token de autenticação
- **Fetch** global é mockado para simular requisições HTTP
- **Timers** são mockados para testes de retry/delay
- **React Query** não é testado diretamente (usa mock de apiRequest)
- Componentes usam **Tailwind CSS** (não testado visualmente)

