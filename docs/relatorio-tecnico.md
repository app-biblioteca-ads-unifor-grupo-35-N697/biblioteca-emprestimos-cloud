Relatório Técnico: Sistema de Empréstimos de Livros em Nuvem
Curso: Desenvolvimento de Software em Nuvem (ADS/IA - Unifor)
Grupo: 35 N697
Data: Março de 2026

1. Visão Geral do Sistema
O Sistema de Empréstimos de Livros em Nuvem é uma aplicação web desenvolvida para facilitar o gerenciamento de empréstimos de livros em bibliotecas virtuais. O sistema permite que usuários registrem-se, naveguem por um catálogo de livros, solicitem empréstimos e acompanhem o status de suas reservas. A arquitetura é baseada em uma abordagem cliente-servidor, com separação clara entre front-end, back-end e banco de dados, garantindo escalabilidade e segurança.

A aplicação atende a um caso de uso mais elaborado, conforme as diretrizes do projeto, ao incluir múltiplos perfis de usuário (administrador e usuário comum), autenticação JWT, operações CRUD completas e integração com serviços em nuvem. O sistema foi projetado para ser acessível via navegador, com interface responsiva e API RESTful documentada via Swagger. Esta visão geral destaca a relevância do sistema em contextos educacionais e empresariais, onde a gestão de recursos compartilhados é essencial.

2. Diagrama de Arquitetura em Nuvem
A arquitetura do sistema segue um modelo em camadas distribuído na nuvem, utilizando serviços gerenciados para otimizar performance e reduzir custos operacionais. O diagrama abaixo, representado em Mermaid, ilustra o fluxo de dados e componentes:

Descrição dos Componentes:

Usuário: Acessa a aplicação via navegador.
Front-end (React/Vercel): Interface responsiva hospedada na Vercel, protegida por Cloudflare CDN para otimização de entrega de conteúdo.
Back-end (Node.js/Render): API REST containerizada em Docker, hospedada no Render, com autenticação JWT.
Banco de Dados (Supabase): Serviço gerenciado PostgreSQL para persistência de dados.
CI/CD (GitHub Actions): Pipeline automatizado para testes e deploy.
Repositório (GitHub): Controle de versão centralizado.
Esta arquitetura garante alta disponibilidade, com separação de ambientes (desenvolvimento e produção) e uso de containers para portabilidade.

3. Tecnologias e Serviços Utilizados
O projeto emprega uma stack tecnológica moderna e escalável, alinhada às melhores práticas de desenvolvimento em nuvem. A tabela abaixo resume as principais tecnologias e serviços:

Componente	Tecnologia/Serviço	Justificativa
Front-end	React + Vite	Framework moderno para interfaces dinâmicas e responsivas, com Vite para build otimizado.
Back-end	Node.js + Express	Ambiente runtime leve e eficiente para APIs REST, com Express para roteamento.
Banco de Dados	PostgreSQL (Supabase)	Banco relacional gerenciado em nuvem, com suporte a queries complexas e segurança integrada.
ORM	Prisma	Ferramenta para mapeamento objeto-relacional, facilitando migrações e queries seguras.
Autenticação	JWT (jsonwebtoken)	Padrão stateless para autenticação segura, evitando sessões no servidor.
Containerização	Docker	Empacotamento da aplicação para portabilidade e isolamento.
CI/CD	GitHub Actions	Pipeline automatizado para testes e deploy, integrado ao repositório.
Deploy Front-end	Vercel	Plataforma de hospedagem otimizada para aplicações React, com CDN integrado.
Deploy Back-end	Render	Serviço PaaS para aplicações containerizadas, com escalabilidade automática.
CDN	Cloudflare	Aceleração de conteúdo estático e proteção contra ataques.
Documentação	Swagger/OpenAPI	Geração automática de documentação interativa para a API.
Controle de Versão	Git + GitHub	Colaboração distribuída com branches por funcionalidade e commits semânticos.
Essas tecnologias foram escolhidas por sua maturidade, comunidade ativa e compatibilidade com os requisitos de nuvem, garantindo um sistema robusto e de fácil manutenção.

4. Estratégia de Deploy e CI/CD
A estratégia de deploy adota uma abordagem DevOps completa, com pipeline CI/CD automatizado via GitHub Actions. O processo é dividido em estágios: build, teste e deploy, assegurando qualidade e rapidez nas liberações.

Pipeline CI/CD (GitHub Actions):

Build: Compilação do código back-end e front-end, geração de containers Docker.
Testes: Execução de testes automatizados (Jest para back-end, testes unitários para front-end), com cobertura de código.
Deploy: Publicação automática no Render (back-end) e Vercel (front-end) via webhooks.
Estratégia de Deploy:

Back-end: Container Docker hospedado no Render, com variáveis de ambiente para credenciais (JWT_KEY, DATABASE_URL).
Front-end: Build estático hospedado na Vercel, com integração ao GitHub para deploys automáticos.
Banco de Dados: Supabase gerencia migrações via Prisma, com dados persistidos fora do container.
Ambientes: Separação entre desenvolvimento (branches) e produção (main), com testes obrigatórios antes do merge.
Benefícios: Redução de erros manuais, deploy contínuo e monitoramento via logs do Render/Vercel. A estratégia suporta escalabilidade horizontal, com possibilidade de múltiplas instâncias via Render.

5. Papéis e Contribuições da Equipe
A equipe do Grupo 35 N697 foi organizada com papéis técnicos claros, conforme as diretrizes do projeto, assegurando uma distribuição equilibrada de responsabilidades. Cada membro contribuiu com expertise específica, resultando em um produto coeso e de qualidade.

Marcos Daniel Gomes Dantas (matrícula 2425179, GitHub: mdanieldantas)
Papel: Desenvolvedor Back-end + DevOps
Contribuições: Implementou a API REST completa com autenticação JWT, integrou o banco Supabase com Prisma, configurou Docker para containerização, estabeleceu o pipeline CI/CD via GitHub Actions e gerenciou o deploy no Render. Sua expertise em infraestrutura foi crucial para a estabilidade do sistema.

Kaio Bruno Soares dos Santos (matrícula 2425109, GitHub: DevKaioBrunu)
Papel: Desenvolvedor Front-end
Contribuições: Desenvolveu as telas React responsivas, implementou a integração com a API via fetch/ axios, configurou roteamento com React Router e preparou o deploy na Vercel. Seu foco em UX garantiu uma interface intuitiva e acessível.

Raphael Araripe Magalhães (matrícula 2425278, GitHub: raphael-araripe)
Papel: Arquiteto + Documentação + Deploy
Contribuições: Projetou a arquitetura em nuvem, criou diagramas visuais (Mermaid), elaborou o relatório técnico e README, configurou o deploy na Vercel e integrou o Cloudflare CDN. Sua visão arquitetural unificou os componentes do sistema.

Erico Alves de Lima (matrícula 2323762, GitHub: EricoAlves07)
Papel: QA + Testes + Vídeo
Contribuições: Implementou testes automatizados com Jest, conduziu testes manuais de integração e produziu o vídeo demonstrativo do sistema. Sua abordagem de qualidade assegurou a confiabilidade e documentou o funcionamento para avaliação.

A colaboração foi facilitada por reuniões semanais, uso de GitHub Projects para rastreamento e commits semânticos, resultando em um projeto alinhado às diretrizes acadêmicas.

6. Dificuldades Encontradas e Soluções
Durante o desenvolvimento, diversos desafios foram enfrentados, típicos de projetos em nuvem colaborativos. Abaixo, destacam-se os principais, com as soluções adotadas:

Integração Front-end/Back-end: Conflitos na comunicação API devido a mudanças de endpoints.
Solução: Implementação de documentação Swagger/OpenAPI e testes de integração manuais, garantindo consistência.

Gerenciamento de Estado Autenticado: Dificuldade em manter sessões JWT entre reloads no front-end.
Solução: Uso de localStorage para persistência temporária e middleware de validação no back-end.

Deploy e Escalabilidade: Problemas iniciais com containers Docker no Render, causando timeouts.
Solução: Otimização de Dockerfile (uso de multi-stage builds) e configuração de health checks no Render.

Conflitos de Merge: Branches paralelas causaram conflitos em arquivos compartilhados.
Solução: Adoção rigorosa de pull requests com revisões obrigatórias e resolução manual de conflitos.

Integração com Supabase: Latência em queries complexas devido à configuração inicial.
Solução: Otimização de índices no PostgreSQL e uso de Prisma para queries eficientes.

Coordenação de Equipe: Dificuldade em sincronizar tarefas entre papéis distintos.
Solução: Uso de Kanban no GitHub Projects e reuniões diárias, melhorando a comunicação.

Essas dificuldades foram superadas com pesquisa, testes iterativos e colaboração, fortalecendo as habilidades da equipe em desenvolvimento em nuvem.