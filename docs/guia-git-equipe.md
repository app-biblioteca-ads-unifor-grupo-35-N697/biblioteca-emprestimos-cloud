# Guia Git para a Equipe

Esse guia foi feito para padronizar o jeito que a gente vai usar o Git no projeto. Todo mundo precisa seguir esse fluxo pra não dar conflito e o histórico ficar organizado pro professor ver.

---

## Configuração inicial (só fazer uma vez)

Antes de qualquer coisa, abre o terminal no VS Code (`Ctrl + '`) e configura seu nome e email:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@gmail.com"
```

---

## Clonando o repositório (só fazer uma vez)

```bash
git clone https://github.com/app-biblioteca-ads-unifor-grupo-35-N697/biblioteca-emprestimos-cloud.git
cd biblioteca-emprestimos-cloud
```

---

## Fluxo que todo mundo tem que seguir

### 1. Antes de começar qualquer coisa, atualiza a main

```bash
git checkout main
git pull origin main
```

> Isso evita conflito. Sempre faz isso antes de criar branch nova.

### 2. Cria uma branch com o nome da sua tarefa

```bash
git checkout -b feature/nome-da-tarefa
```

Exemplos de nomes de branch que usamos no projeto:

```
feature/backend-setup
feature/database
feature/autenticacao
feature/modulo-livros
feature/modulo-emprestimos
feature/roteamento-api
test/testes-unitarios
ci/pipeline-actions
docs/readme
```

### 3. Faz as alterações e commita

Adiciona só os arquivos da sua tarefa (não faz `git add .` que adiciona tudo):

```bash
git add backend/src/arquivo.js
```

Depois commita com a mensagem no padrão (ver seção abaixo):

```bash
git commit -m "feat(auth): implementa login com JWT closes #4"
```

### 4. Sobe a branch pro GitHub

```bash
git push origin feature/nome-da-tarefa
```

### 5. Abre o Pull Request no GitHub

1. Entra no repositório no GitHub
2. Vai aparecer um botão verde/amarelo escrito **"Compare & pull request"** — clica nele
3. Coloca um título descritivo
4. Clica em **"Create pull request"**
5. Avisa no grupo que abriu o PR
6. Depois de aprovado, clica em **"Merge pull request"**

> Quando o PR for mergeado na main, a issue que estava no `closes #N` fecha automaticamente no Kanban.

---

## Padrão de commits semânticos

O formato é esse aqui:

```
<prefixo>(<escopo>): mensagem em minúsculas closes #número-da-issue
```

| Prefixo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Mudança na documentação |
| `style` | Mudança visual/estilização |
| `refactor` | Refatoração sem mudar funcionalidade |
| `perf` | Melhoria de performance |
| `test` | Adicionar ou corrigir testes |
| `build` | Docker, dependências, npm |
| `ci` | GitHub Actions, pipeline |
| `chore` | Tarefas gerais que não mexem no código |
| `revert` | Reverter um commit anterior |

### Exemplos do nosso projeto

**Backend:**
```bash
git commit -m "chore(backend): configura projeto Node.js com dependências closes #1"
git commit -m "feat(backend): configura servidor Express com CORS e morgan closes #3"
git commit -m "feat(auth): implementa registro e login com JWT closes #4"
git commit -m "feat(books): implementa CRUD de livros closes #5"
git commit -m "feat(loans): implementa empréstimos e devolução closes #6"
git commit -m "feat(routes): configura rotas da API com guards de autenticação closes #7"
```

**Frontend:**
```bash
git commit -m "chore(frontend): configura projeto React com Vite e dependências"
git commit -m "feat(frontend): cria estrutura base de rotas com React Router"
git commit -m "feat(frontend): implementa tela de login e registro"
git commit -m "feat(frontend): implementa listagem e busca de livros"
git commit -m "feat(frontend): implementa tela de empréstimos do usuário"
git commit -m "style(frontend): aplica estilização geral com CSS/Tailwind"
```

**Documentação:**
```bash
git commit -m "docs: adiciona README com visão geral do projeto"
git commit -m "docs: adiciona guia de configuração do ambiente local"
git commit -m "docs: atualiza diagrama de arquitetura com URL de produção"
git commit -m "docs: adiciona relatório técnico da disciplina"
```

**Banco de dados:**
```bash
git commit -m "feat(db): cria schema Prisma com models User, Book e Loan"
git commit -m "feat(db): aplica migration inicial no Supabase"
git commit -m "feat(db): adiciona singleton do PrismaClient"
git commit -m "fix(db): corrige tipo do campo quantiteAvailable no schema"
```

**DevOps e Deploy:**
```bash
git commit -m "build(docker): adiciona Dockerfile com node:20-alpine closes #9"
git commit -m "build(docker): adiciona .dockerignore excluindo node_modules e .env"
git commit -m "ci: configura pipeline GitHub Actions com testes e deploy closes #10"
git commit -m "ci: adiciona deploy automático via Render deploy hook"
git commit -m "chore(deploy): adiciona .env.example com variáveis necessárias"
```

**Segurança:**
```bash
git commit -m "feat(auth): adiciona middleware de autenticação JWT nas rotas protegidas"
git commit -m "fix(security): adiciona ensureAuth nas rotas de escrita da API"
git commit -m "chore(security): move credenciais para variáveis de ambiente"
git commit -m "fix(security): remove senha exposta do histórico de código"
```

**Testes:**
```bash
git commit -m "test(backend): adiciona testes unitários dos models com mock do Prisma closes #8"
git commit -m "test(backend): adiciona testes do controller de autenticação"
git commit -m "test(frontend): adiciona teste do componente de login"
git commit -m "test(frontend): adiciona teste de fluxo de empréstimo"
```

**Documentação:**
```bash
git commit -m "docs: adiciona README com visão geral do projeto"
git commit -m "docs: adiciona guia de configuração do ambiente local"
git commit -m "docs: adiciona guia de commits semânticos para a equipe"
git commit -m "docs: adiciona relatório técnico da disciplina"
git commit -m "docs: atualiza diagrama de arquitetura com URLs de produção"
```

**Correções gerais:**
```bash
git commit -m "fix(auth): corrige validação de token expirado"
git commit -m "fix(books): corrige contagem de livros disponíveis na devolução"
git commit -m "fix(frontend): corrige redirecionamento após login"
git commit -m "fix(loans): corrige cálculo de atraso na devolução"
```

---

## Como criar issues e usar o Kanban

O Kanban fica em **Projects** no repositório do GitHub. Toda tarefa nova vira uma issue antes de virar código.

### Criando uma issue

1. Vai em **Issues** no repositório
2. Clica em **"New issue"**
3. Coloca um título claro (ex: `Implementar autenticação com JWT`)
4. Na descrição, explica o que precisa ser feito
5. No lado direito:
   - **Assignees** → coloca quem vai fazer
   - **Labels** → seleciona a label certa (`feature`, `documentation`, `bug`, etc.)
   - **Projects** → adiciona ao Kanban do projeto
6. Clica em **"Submit new issue"**

> A issue vai aparecer na coluna **"To Do"** do Kanban automaticamente.

### Fluxo de cards no Kanban

Quando você começa a trabalhar numa issue:

1. Vai no **Projects** → abre o Kanban
2. Arrasta o card da issue de **"To Do"** para **"In Progress"**

Quando terminar e mergear o PR:

- Se o commit usou `closes #N`, a issue **fecha automaticamente** e o card vai para **"Done"** sozinho
- Se não usou `closes #N` no commit, vai na issue e fecha manualmente clicando em **"Close issue"**

### Vinculando PR a uma issue existente

Se a issue foi criada depois do commit (sem `closes #N`):

1. Vai na issue no GitHub
2. No lado direito, clica na **engrenagem ao lado de "Development"**
3. Pesquisa pelo nome do PR e seleciona
4. O PR passa a aparecer vinculado à issue

---

## Comandos úteis

| O que fazer | Comando |
|---|---|
| Ver em qual branch está | `git branch` |
| Ver status dos arquivos | `git status` |
| Ver histórico de commits | `git log --oneline` |
| Trocar de branch | `git checkout nome-da-branch` |
| Desfazer alteração em um arquivo | `git checkout -- nome-do-arquivo` |

---

## Regras que a gente combinou

- ✅ Sempre cria uma branch antes de começar a codar
- ✅ Sempre faz `git pull origin main` antes de criar branch nova
- ✅ Referencia a issue no commit com `closes #N`
- ✅ Abre PR pra mergear na main, nunca commita direto nela
- ❌ Nunca commita o arquivo `.env`
- ❌ Nunca commita a pasta `node_modules/`
- ❌ Nunca usa `git add .` sem checar o `git status` antes

---

## Para quem precisa de revisão 

> Depois de abrir o PR, **não clica em Merge**. Só Daniel ou Brunu fazem isso.

### Passo a passo completo — do código ao PR

**1. Atualiza a main e cria a branch da sua tarefa:**

```bash
git checkout main
git pull origin main
git checkout -b feature/nome-da-sua-tarefa
```

**2. Faz as alterações no código e verifica o que mudou:**

```bash
git status
```

**3. Adiciona só os arquivos da sua tarefa:**

```bash
git add backend/src/arquivo-que-voce-editou.js
```

> Nunca faz `git add .` sem checar o `git status` antes!

**4. Commita com mensagem no padrão:**

```bash
git commit -m "feat(escopo): descreve o que fez closes #número-da-issue"
```

**5. Sobe a branch pro GitHub:**

```bash
git push origin feature/nome-da-sua-tarefa
```

### Como pedir revisão no GitHub

Depois do push, vai aparecer um aviso amarelo no GitHub com o botão **"Compare & pull request"**:

1. Clica em **"Compare & pull request"**
2. Coloca um título descritivo
3. Na descrição, escreve `Closes #N` (número da issue) e explica o que fez
4. No lado direito, clica na **engrenagem ao lado de "Reviewers"**
5. Digita `mdanieldantas` ou `Brunu-Dantas` e seleciona
6. Clica em **"Create pull request"**
7. Manda mensagem no grupo avisando que abriu o PR e pediu revisão
8. **Aguarda** — quando aprovarem, Daniel ou Brunu fazem o merge

### Se o revisor pedir alteração

O GitHub vai mostrar que precisa de mudanças. Então:

**1. Faz a correção no VS Code e verifica:**

```bash
git status
```

**2. Adiciona o arquivo corrigido:**

```bash
git add backend/src/arquivo-corrigido.js
```

**3. Commita explicando a correção:**

```bash
git commit -m "fix(escopo): corrige conforme revisão do PR"
```

**4. Sobe a correção:**

```bash
git push origin feature/nome-da-sua-tarefa
```

> O PR atualiza automaticamente. Avisa no grupo que corrigiu.

---

## Para os revisores (Daniel e Brunu)

> Vocês têm permissão de bypass na branch `main`. O fluxo de vocês é esse:

### Quando alguém pedir revisão

1. Entra no repositório no GitHub
2. Clica em **"Pull requests"** no menu superior
3. Clica no PR que precisa de revisão
4. Vai na aba **"Files changed"** e lê o código alterado
5. Se estiver ok, clica em **"Review changes"** → seleciona **"Approve"** → **"Submit review"**
6. Se precisar de mudança, seleciona **"Request changes"**, escreve o que precisa corrigir → **"Submit review"**

### Como fazer o merge com bypass

Após aprovar o PR (ou quando for mergear o seu próprio):

1. Volta na aba **"Conversation"** do PR
2. Marca o checkbox **"Merge without waiting for requirements to be met (bypass rules)"**
3. Clica na seta ao lado do botão → seleciona **"Create a merge commit"**
4. Clica em **"Bypass rules and merge"**
5. Confirma clicando em **"Confirm merge"**
6. Clica em **"Delete branch"** para limpar a branch mergeada

> Após o merge, a issue referenciada com `closes #N` fecha automaticamente no Kanban.
