<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# API de Gerenciamento de Usuários

Uma API completa para gerenciamento de usuários com controle de acesso baseado em funções (RBAC), desenvolvida com NestJS e PostgreSQL.

## Sumário

- [API de Gerenciamento de Usuários](#api-de-gerenciamento-de-usuários)
  - [Sumário](#sumário)
  - [Visão Geral](#visão-geral)
  - [Funcionalidades](#funcionalidades)
  - [Tecnologias](#tecnologias)
  - [Requisitos](#requisitos)
  - [Instalação](#instalação)
    - [Com Docker (Recomendado)](#com-docker-recomendado)
    - [Sem Docker](#sem-docker)
  - [Documentação da API](#documentação-da-api)
  - [Modelo de Acesso](#modelo-de-acesso)
    - [1. Administrador (ADMIN)](#1-administrador-admin)
    - [2. Gerente (MANAGER)](#2-gerente-manager)
    - [3. Usuário comum (USER)](#3-usuário-comum-user)
  - [Endpoints](#endpoints)
    - [Autenticação](#autenticação)
      - [Exemplo de Requisição](#exemplo-de-requisição)
      - [Exemplo de Resposta](#exemplo-de-resposta)
    - [Usuários](#usuários)
      - [Exemplo de Criação (POST /users)](#exemplo-de-criação-post-users)
      - [Exemplo de Atualização (PATCH /users/:id)](#exemplo-de-atualização-patch-usersid)
  - [Usuários Padrão (após executar o seed)](#usuários-padrão-após-executar-o-seed)
  - [Autenticação](#autenticação-1)
  - [Testes](#testes)

## Visão Geral

Este sistema implementa uma API RESTful para gerenciamento de usuários com diferentes níveis de acesso. O projeto utiliza arquitetura Domain-Driven Design (DDD) e implementa um sistema de controle de acesso baseado em funções usando a biblioteca CASL.

## Funcionalidades

- **Autenticação de usuários**
  - Login com JWT (JSON Web Token)
  - Proteção de rotas para usuários autenticados

- **Gerenciamento de usuários**
  - Criação, leitura, atualização e exclusão de usuários
  - Diferentes permissões baseadas em funções

- **Autorização baseada em funções**
  - Três níveis de acesso: Administrador, Gerente e Usuário
  - Controle granular de permissões com CASL

- **Documentação Interativa**
  - Documentação Swagger completa e interativa

## Tecnologias

- **NestJS**: Framework para construção de APIs escaláveis
- **TypeORM**: ORM para interação com banco de dados
- **PostgreSQL**: Banco de dados relacional
- **CASL**: Biblioteca para implementação de autorização
- **Passport/JWT**: Autenticação de usuários
- **Swagger**: Documentação interativa da API
- **Jest**: Framework de testes

## Requisitos

- Node.js (v22+)
- Banco de dados PostgreSQL
- Gerenciador de pacotes pnpm
- Docker e Docker Compose (opcional, para execução em contêineres)

## Instalação

### Com Docker (Recomendado)

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd management_users
```

2. Configure o arquivo .env conforme o .env.example:

```
# Server
PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=user_management

# JWT
JWT_SECRET=sua_chave_super_secreta_altere_em_producao
JWT_EXPIRATION=24h
```

3. Execute os contêineres Docker:

```bash
docker-compose up -d
```

A API estará disponível em http://localhost:3000/api e o banco de dados será automaticamente configurado.

### Sem Docker

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd management_users
```

2. Instale as dependências:

```bash
pnpm install
```

3. Configure o arquivo .env:
   - Crie um arquivo `.env` baseado no arquivo `.env.example`
   - Atualize as configurações de conexão com o banco de dados no arquivo `.env`

4. Inicie o banco de dados PostgreSQL

5. Inicie a aplicação:

```bash
pnpm start:dev
```

6. Popule o banco de dados com usuários iniciais:

```bash
pnpm seed
```

## Documentação da API

Após iniciar a aplicação, você pode acessar a documentação Swagger em:

```
http://localhost:3000/api
```

A documentação Swagger permite:
- Visualizar todos os endpoints disponíveis
- Testar as requisições diretamente no navegador
- Verificar os esquemas de dados e requisitos de cada rota

## Modelo de Acesso

O sistema implementa três perfis de usuário com diferentes permissões:

### 1. Administrador (ADMIN)
- **Permissões**: Acesso total ao sistema
- Pode criar novos usuários
- Pode listar todos os usuários
- Pode editar qualquer usuário (inclusive alterar papéis/funções)
- Pode excluir usuários

### 2. Gerente (MANAGER)
- **Permissões Limitadas**:
  - Pode visualizar (listar) todos os usuários
  - Pode editar informações de usuários, mas NÃO pode alterar a função/papel deles
  - NÃO pode criar novos usuários
  - NÃO pode excluir usuários

### 3. Usuário comum (USER)
- **Permissões Restritas**:
  - Pode ver e editar apenas seu próprio perfil
  - NÃO pode alterar sua própria função/papel
  - NÃO pode ver, criar ou excluir outros usuários

## Endpoints

### Autenticação

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST   | /auth/login | Autenticar usuário e obter token JWT | Público |

#### Exemplo de Requisição
```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

#### Exemplo de Resposta
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Usuários

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET    | /users | Listar todos os usuários | ADMIN, MANAGER |
| GET    | /users/me | Obter dados do usuário atual | Todos |
| GET    | /users/:id | Obter usuário específico | ADMIN, MANAGER, próprio USER |
| POST   | /users | Criar novo usuário | ADMIN |
| PATCH  | /users/:id | Atualizar usuário | ADMIN, MANAGER (limites), próprio USER (limites) |
| DELETE | /users/:id | Excluir usuário | ADMIN |

#### Exemplo de Criação (POST /users)
```json
{
  "name": "Novo Usuário",
  "email": "novo@example.com",
  "password": "Senha123!",
  "role": "user"
}
```

#### Exemplo de Atualização (PATCH /users/:id)
```json
{
  "name": "Nome Atualizado",
  "email": "atualizado@example.com"
}
```

## Usuários Padrão (após executar o seed)

1. Usuário Administrador
   - Email: admin@example.com
   - Senha: Admin123!
   - Função: admin

2. Usuário Gerente
   - Email: manager@example.com
   - Senha: Manager123!
   - Função: manager

3. Usuário Comum
   - Email: user@example.com
   - Senha: User123!
   - Função: user

## Autenticação

Todos os endpoints protegidos exigem um token JWT no cabeçalho de Autorização:
```
Authorization: Bearer <token>
```

## Testes

- Execute testes unitários:
  ```bash
  pnpm test
  ```

- Execute testes e2e:
  ```bash
  pnpm test:e2e
  ```

- Verifique a cobertura de testes:
  ```bash
  pnpm test:cov
  ```
