# Assistente de Manutenção de Ativos

Este projeto é um sistema online para gerenciar a manutenção de equipamentos e veículos (ativos), permitindo aos usuários cadastrar seus ativos, registrar manutenções realizadas e acompanhar as próximas manutenções agendadas.

## Visão Geral

O objetivo é fornecer uma plataforma centralizada para que os usuários nunca mais esqueçam de uma manutenção importante, mantendo um histórico organizado e uma visão clara das pendências.

## Funcionalidades Principais

*   **Contas de Usuário Seguras:** Cadastro, login e logout de usuários, com dados de ativos e manutenções isolados por conta.
*   **Gerenciamento de Ativos:**
    *   Adicionar novos ativos (ex: carros, máquinas, computadores).
    *   Fornecer nome e descrição detalhada para cada ativo.
    *   Listar, editar e remover ativos cadastrados.
*   **Registro de Manutenções:**
    *   Registrar manutenções realizadas para cada ativo (serviço, data de execução, detalhes).
    *   Informar a data da próxima manutenção (opcional).
    *   Visualizar histórico de manutenções por ativo.
    *   Editar e remover registros de manutenção.
*   **Painel de Pendências:** Tela principal que exibe as manutenções que estão próximas de vencer ou já venceram, ordenadas por urgência. O sistema identifica automaticamente quando uma pendência é resolvida pelo registro de uma nova manutenção.
*   **Configurações da Conta:**
    *   Visualizar e atualizar dados do perfil do usuário (nome, email).
    *   Alterar senha.
    *   (Futuro) Opção para alternar entre tema claro e escuro.

## Tecnologias Utilizadas

**Backend:**

*   **Linguagem:** TypeScript
*   **Framework:** Express.js
*   **Banco de Dados:** PostgreSQL
*   **Conexão com Banco de Dados:** Pacote `pg` (node-postgres)
*   **Autenticação:** JSON Web Tokens (JWT) armazenados em cookies `HttpOnly`.
*   **Hashing de Senhas:** bcrypt

**Frontend:**

*   **Framework/Biblioteca:** React (com Vite)
*   **Linguagem:** TypeScript
*   **Roteamento:** React Router DOM v6+
*   **Gerenciamento de Estado Global (Autenticação):** React Context API
*   **Componentização/Estilização:** Material UI (MUI)
*   **Chamadas API:** Fetch API

## Estrutura do Projeto

O projeto é um monorepo simples com duas pastas principais:

*   `backend/`: Contém o código do servidor Express.js.
*   `frontend/`: Contém o código da aplicação React (Vite).

## Configuração e Instalação

### Pré-requisitos

*   Node.js (versão LTS recomendada, ex: 18.x ou 20.x)
*   npm (geralmente vem com o Node.js) ou Yarn
*   PostgreSQL instalado e rodando.

### Backend

1.  **Navegue até a pasta do backend:**
    ```bash
    cd backend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as Variáveis de Ambiente:**
    *   Crie um arquivo `.env` na raiz da pasta `backend/` baseado no exemplo abaixo (ou ajuste conforme sua configuração do PostgreSQL e segredo JWT):
        ```env
        PORT=3000

        DB_HOST=localhost
        DB_PORT=5432
        DB_USER=seu_usuario_postgres
        DB_PASSWORD=sua_senha_postgres
        DB_NAME=manutencao_ativo_db

        JWT_SECRET="seu_segredo_jwt_super_longo_e_seguro_aqui"
        ```
4.  **Crie o Banco de Dados e as Tabelas:**
    *   Certifique-se de que o banco de dados especificado em `DB_NAME` exista no seu PostgreSQL.
    *   Execute o script SQL localizado em `sql/create_table.sql` no seu banco de dados para criar as tabelas necessárias (`usuarios`, `ativos`, `manutencoes`).

5.  **Inicie o servidor backend em modo de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O servidor backend estará rodando em `http://localhost:3000` (ou a porta definida em `.env`).

### Frontend

1.  **Navegue até a pasta do frontend (em um novo terminal):**
    ```bash
    cd frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as Variáveis de Ambiente do Frontend:**
    *   A pasta `frontend/` já deve conter um arquivo `.env` com:
        ```env
        VITE_API_BASE_URL=http://localhost:3000/api
        ```
        Isso aponta para o seu servidor backend. Ajuste a porta se o seu backend estiver rodando em uma porta diferente de 3000.

4.  **Inicie o servidor de desenvolvimento do frontend:**
    ```bash
    npm run dev
    ```
    A aplicação frontend estará acessível em `http://localhost:5173` (ou a porta indicada pelo Vite).

## Servindo o Frontend a partir do Backend (Para Simular Produção)

1.  **Faça o build do frontend:**
    *   Na pasta `frontend/`, execute:
        ```bash
        npm run build
        ```
    *   Isso criará uma pasta `frontend/dist/` com os arquivos estáticos otimizados da sua aplicação React.

2.  **Configure e Inicie o Backend para Servir os Arquivos:**
    *   O arquivo `backend/src/app.ts` já está configurado para servir os arquivos da pasta `frontend/dist/`.
    *   Inicie apenas o servidor backend:
        ```bash
        cd backend
        npm run dev 
        # ou, para um ambiente mais próximo da produção, após compilar o backend com 'npm run build':
        # npm start
        ```
3.  **Acesse a Aplicação Completa:**
    *   Abra seu navegador e vá para `http://localhost:3000` (a porta do seu servidor Express).
    *   O backend servirá o `index.html` do frontend, e a aplicação completa (frontend + API) rodará a partir desta URL.

## Estrutura das Rotas da API (Backend)

Todas as rotas da API são prefixadas com `/api`.

*   **Usuários (`/api/usuarios`)**
    *   `POST /registrar`: Cria um novo usuário.
    *   `POST /login`: Autentica um usuário e retorna um token JWT em um cookie.
    *   `POST /logout`: Invalida a sessão do usuário (limpa o cookie).
    *   `GET /perfil` (Protegida): Retorna os dados do usuário logado.
    *   `PUT /:id` (Protegida): Atualiza os dados do usuário (nome, email, senha).
    *   `DELETE /:id` (Protegida): Deleta um usuário.
    *   `GET /` (Protegida, geralmente admin): Lista todos os usuários.

*   **Ativos (`/api/ativos`)** (Todas protegidas)
    *   `POST /`: Cria um novo ativo para o usuário logado.
    *   `GET /`: Lista todos os ativos do usuário logado.
    *   `PUT /:id`: Atualiza um ativo específico do usuário logado.
    *   `DELETE /:id`: Deleta um ativo específico do usuário logado.

*   **Manutenções (`/api/manutencoes`)** (Todas protegidas)
    *   `POST /`: Cria um novo registro de manutenção para um ativo.
    *   `GET /historico`: Lista todas as manutenções dos ativos do usuário logado.
    *   `GET /pendentes`: Lista as manutenções pendentes/urgentes para o usuário logado.
    *   `PUT /:id`: Atualiza um registro de manutenção.
    *   `DELETE /:id`: Deleta um registro de manutenção.

## Contribuição

[Instruções sobre como contribuir, se aplicável, ou remover esta seção]

## Licença

[Tipo de licença, ex: MIT, ou remover esta seção]

---

Sinta-se à vontade para copiar, colar e modificar este README para o seu projeto! Adicione quaisquer detalhes específicos que achar relevante.

## Github do projeto

https://github.com/Nicolassouza92/DesafioRel-mpago-3.git