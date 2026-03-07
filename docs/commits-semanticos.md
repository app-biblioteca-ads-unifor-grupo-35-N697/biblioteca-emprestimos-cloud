# Guia de Commits Semânticos

Este projeto utiliza o padrão **Conventional Commits**. Todo commit deve seguir o formato:

```
<prefixo>(escopo opcional): mensagem em minúsculas
```

**Exemplo:**
```
feat(auth): implement JWT login endpoint
```

---

## Prefixos

| Prefixo | Descrição | Quando usar |
|---|---|---|
| `feat` | Features | Uma nova funcionalidade |
| `fix` | Correções de Erros | Uma correção de bug |
| `docs` | Documentação | Apenas mudanças na documentação |
| `style` | Estilos | Mudanças em relação a estilização |
| `refactor` | Refatoração de Código | Alteração de código que não corrige bug nem adiciona funcionalidade |
| `perf` | Melhorias de Performance | Alteração de código que melhora o desempenho |
| `test` | Testes | Adição de testes em falta ou correção de testes existentes |
| `build` | Builds | Mudanças que afetam o sistema de build ou dependências externas |
| `ci` | Integrações Contínuas | Alterações em arquivos e scripts de configuração de CI |
| `chore` | Tarefas | Outras mudanças que não modificam arquivos de código-fonte ou de teste |
| `revert` | Reverter | Reverte um commit anterior |

---

## Escopos usados neste projeto

| Escopo | O que representa |
|---|---|
| `backend` | Configuração geral do projeto backend |
| `db` | Banco de dados, Prisma, migrations |
| `auth` | Autenticação e autorização |
| `books` | Módulo de livros |
| `loans` | Módulo de empréstimos |
| `routes` | Roteamento da API |
| `docker` | Containerização |
| `ci` | Pipeline CI/CD |

---

## Referenciando Issues

Sempre que um commit resolve uma issue, adicione `closes #N` no final da mensagem:

```
feat(auth): implement JWT login endpoint closes #4
```

Isso fecha automaticamente a issue no GitHub ao fazer o merge.

---

## Fluxo de branches

1. Criar branch: `git checkout -b feature/nome-da-feature`
2. Commitar na branch com mensagem semântica
3. Push: `git push origin feature/nome-da-feature`
4. Abrir Pull Request no GitHub para mergear na `main`
