# Relatório de Testes Automatizados — Backend

**Projeto:** biblioteca-emprestimos-cloud  
**Equipe:** Grupo 35 — N697  
**Ferramenta:** Jest v29.7.0  
**Data de execução:** 11/03/2026  
**Comando:** `npm test`

---

## Resultado Geral

| Métrica | Resultado |
|---|---|
| Test Suites | **3 passed**, 3 total |
| Tests | **24 passed**, 24 total |
| Snapshots | 0 total |
| Tempo de execução | 4.174 s |

---

## Arquivos Testados

| Arquivo de Teste | Resultado |
|---|---|
| `src/models/books-model.test.js` | ✅ PASS |
| `src/models/user.test.js` | ✅ PASS |
| `src/controllers/auth-controller.test.js` | ✅ PASS |

---

## Cobertura de Código

| Camada | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **controllers** | 100% | 100% | 75% | 100% |
| **database** | 100% | 100% | 100% | 100% |
| **errors** | 100% | 100% | 100% | 100% |
| **models** | 70.96% | 50% | 76.92% | 74.07% |
| **TOTAL** | **87.32%** | **86.2%** | **77.77%** | **89.55%** |

---

## O que foi testado

### `auth-controller.test.js` — 10 testes
- Registro: campo faltando → 400
- Registro: senha curta → 400
- Registro: e-mail duplicado → 400
- Registro: e-mail inválido → 400
- Registro: dados válidos → 201
- Login: campos faltando → 400
- Login: e-mail inválido → 400
- Login: usuário não encontrado → 401
- Login: senha incorreta → 401
- Login: credenciais válidas → 200 + token JWT

### `user.test.js` — 4 testes
- Retorna todos os usuários
- Retorna usuário pelo ID
- Retorna usuário pelo e-mail
- Cria usuário com senha hasheada

### `books-model.test.js` — 10 testes
- Retorna todos os livros
- Cria novo livro
- Retorna livro por ID (encontrado)
- Retorna null quando livro não existe
- Busca livros por autor
- Retorna lista vazia quando autor não existe
- Atualiza livro existente
- Lança erro 404 ao atualizar livro inexistente
- Deleta livro existente
- Lança erro 404 ao deletar livro inexistente

---

## Saída do terminal

```
> library-manager@1.0.0 test
> jest

 PASS  src/models/books-model.test.js
 PASS  src/models/user.test.js
 PASS  src/controllers/auth-controller.test.js

-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |   87.32 |     86.2 |   77.77 |   89.55 |
 controllers     |     100 |      100 |      75 |     100 |
  auth-ctrl.js   |     100 |      100 |      75 |     100 |
 database        |     100 |      100 |     100 |     100 |
  prisma.js      |     100 |      100 |     100 |     100 |
 errors          |     100 |      100 |     100 |     100 |
  HttpError.js   |     100 |      100 |     100 |     100 |
 models          |   70.96 |       50 |   76.92 |   74.07 |
  books-model.js |    62.5 |       50 |   66.66 |      65 | 12,32-43
  users-model.js |     100 |      100 |     100 |     100 |
-----------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Snapshots:   0 total
Time:        4.174 s, estimated 5 s
Ran all test suites.
```

---

## Relatório HTML completo

Disponível em: `backend/coverage/lcov-report/index.html`  
Gerado em: 2026-03-11T20:56:14.575Z
