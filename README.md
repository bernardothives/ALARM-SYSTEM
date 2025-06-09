# Backend para Sistema de Controle e Monitoramento de Alarmes

Este projeto implementa o backend para um sistema de controle e monitoramento de alarmes antifurto, construído com uma arquitetura de microservices. O sistema permite o gerenciamento de usuários, alarmes, pontos monitorados, e processa eventos de ativação, desativação e disparo de alarmes.

## 📖 Sobre o Projeto

O backend é composto por um **API Gateway** que serve como ponto único de entrada e seis **microservices** independentes, cada um com sua responsabilidade específica. A comunicação entre os serviços é feita via APIs REST, e cada serviço que necessita de persistência de dados utiliza seu próprio banco de dados SQLite.

## 🏛️ Arquitetura

O sistema segue o padrão de microservices para garantir escalabilidade, resiliência e manutenibilidade.

-   **API Gateway**: Ponto único de entrada (`Single Point of Entry`) para todas as requisições externas. Ele roteia as chamadas para o microservice apropriado, além de poder ser estendido para lidar com autenticação, logging e rate limiting.

-   **Users Service**: Responsável pelo CRUD (Create, Read, Update, Delete) de usuários, gerenciando informações como nome e número de celular.

-   **Alarms Service**: Gerencia o cadastro de centrais de alarme, os pontos monitorados (sensores de porta, presença, etc.) e os vínculos entre usuários e alarmes.

-   **Activation Control Service**: Orquestra o fluxo de "Armar" e "Desarmar" um alarme. Não possui banco de dados próprio, apenas coordena chamadas para outros serviços (Logging e Notification).

-   **Trigger Control Service**: Orquestra o fluxo de "Disparo" de um alarme. Valida o ponto monitorado, atualiza seu status, e coordena chamadas para os serviços de Logging e Notification.

-   **Logging Service**: Centraliza o registro de todos os eventos importantes do sistema (ativações, disparos, erros, etc.) em um banco de dados de logs para auditoria e depuração.

-   **Notification Service**: Responsável por notificar os usuários sobre eventos relevantes. Nesta implementação, o envio de notificações é **simulado** através de logs no console.

## 🛠️ Tecnologias Utilizadas

-   **Node.js**: Ambiente de execução para todos os serviços.
-   **Express.js**: Framework web para criar as APIs REST.
-   **SQLite3**: Banco de dados relacional leve e baseado em arquivo, usado para persistência de dados em cada serviço.
-   **Axios**: Cliente HTTP para a comunicação entre microservices.
-   **Joi**: Para validação de schemas e dados de entrada nas requisições.
-   **UUID**: Para a geração de identificadores únicos universais.
-   **http-proxy-middleware**: Para o roteamento de requisições no API Gateway.
-   **Dotenv**: Para gerenciamento de variáveis de ambiente.
-   **Morgan, Helmet, CORS**: Middlewares para logging HTTP, segurança e permissões de origem no API Gateway.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
-   [Node.js](https://nodejs.org/) (versão 18.x ou superior recomendada)
-   [npm](https://www.npmjs.com/) (geralmente instalado com o Node.js)
-   Um cliente de API como [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/) para realizar os testes.

## 🚀 Instalação e Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento local.

**1. Clone o Repositório:**
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd alarm-system-backend
```

**2. Configure as Variáveis de Ambiente:**
Cada serviço possui seu próprio arquivo `.env` para configuração. Crie um arquivo `.env` na raiz de cada pasta de serviço (ex: `api-gateway/`, `users-service/`, etc.) seguindo os exemplos abaixo:

<details>
<summary><strong>Clique para ver os arquivos .env de cada serviço</strong></summary>

-   **`api-gateway/.env`**
    ```env
    PORT=3000
    NODE_ENV=development
    CORS_ORIGIN=http://localhost:3000
    USERS_SERVICE_TARGET=http://localhost:3001
    ALARMS_SERVICE_TARGET=http://localhost:3002
    ACTIVATION_CONTROL_SERVICE_TARGET=http://localhost:3003
    TRIGGER_CONTROL_SERVICE_TARGET=http://localhost:3004
    LOGGING_SERVICE_TARGET=http://localhost:3006
    ```
-   **`users-service/.env`**
    ```env
    PORT=3001
    DATABASE_PATH=./data/usuarios_db.sqlite
    NODE_ENV=development
    ```
-   **`alarms-service/.env`**
    ```env
    PORT=3002
    DATABASE_PATH=./data/alarmes_db.sqlite
    NODE_ENV=development
    USERS_SERVICE_URL=http://localhost:3001
    ```
-   **`logging-service/.env`**
    ```env
    PORT=3006
    DATABASE_PATH=./data/logs_db.sqlite
    NODE_ENV=development
    ```
-   **`activation-control-service/.env`**
    ```env
    PORT=3003
    NODE_ENV=development
    ALARMS_SERVICE_URL=http://localhost:3002
    LOGGING_SERVICE_URL=http://localhost:3006
    NOTIFICATION_SERVICE_URL=http://localhost:3005
    ```
-   **`trigger-control-service/.env`**
    ```env
    PORT=3004
    NODE_ENV=development
    ALARMS_SERVICE_URL=http://localhost:3002
    LOGGING_SERVICE_URL=http://localhost:3006
    NOTIFICATION_SERVICE_URL=http://localhost:3005
    ```
-   **`notification-service/.env`**
    ```env
    PORT=3005
    NODE_ENV=development
    ALARMS_SERVICE_URL=http://localhost:3002
    USERS_SERVICE_URL=http://localhost:3001
    ```

</details>

**3. Instale todas as dependências:**
Na raiz do projeto (`alarm-system-backend`), execute o script abaixo para instalar as dependências de todos os serviços de uma vez.

```bash
# Navegue para cada pasta de serviço e execute 'npm install'
for dir in */; do (cd "$dir" && npm install); done
```

## ▶️ Executando o Sistema

Para rodar o sistema, você precisa iniciar cada um dos 7 serviços em um terminal separado.

1.  Abra 7 terminais no seu editor de código ou no seu sistema operacional.
2.  Em cada terminal, execute um dos comandos abaixo:

    -   **Terminal 1 (API Gateway):**
        ```bash
        cd api-gateway && npm run start:dev
        ```
    -   **Terminal 2 (Users Service):**
        ```bash
        cd users-service && npm run start:dev
        ```
    -   **Terminal 3 (Alarms Service):**
        ```bash
        cd alarms-service && npm run start:dev
        ```
    -   **Terminal 4 (Logging Service):**
        ```bash
        cd logging-service && npm run start:dev
        ```
    -   **Terminal 5 (Activation Control Service):**
        ```bash
        cd activation-control-service && npm run start:dev
        ```
    -   **Terminal 6 (Trigger Control Service):**
        ```bash
        cd trigger-control-service && npm run start:dev
        ```
    -   **Terminal 7 (Notification Service):**
        ```bash
        cd notification-service && npm run start:dev
        ```
3.  Após iniciar todos os serviços, você verá logs em cada terminal confirmando que os servidores estão rodando em suas respectivas portas (de 3000 a 3006).

## 🧪 Testando a Aplicação

Use o **Postman** ou similar para testar. **Todas as requisições devem ser feitas para o API Gateway**: `http://localhost:3000`.

**Anote os IDs (`id_usuario`, `id_alarme`, `id_ponto`) retornados pelas requisições `POST`, pois eles serão necessários nos passos seguintes.**

<details>
<summary><strong>Clique para ver o guia de testes passo a passo</strong></summary>

### Cenário 1: Setup Inicial

1.  **Criar Usuário**
    -   `POST` `http://localhost:3000/api/usuarios`
    -   Body:
        ```json
        { "nome": "Usuário Principal", "numero_celular": "+5511987654321" }
        ```
    -   **Anote o `id_usuario` da resposta.**

2.  **Criar Alarme**
    -   `POST` `http://localhost:3000/api/alarmes`
    -   Body:
        ```json
        { "descricao_local": "Escritório Central" }
        ```
    -   **Anote o `id_alarme` da resposta.**

3.  **Vincular Usuário ao Alarme**
    -   `POST` `http://localhost:3000/api/alarmes/<SEU_ID_DE_ALARME>/usuarios`
    -   Body:
        ```json
        { "id_usuario": "<SEU_ID_DE_USUARIO>", "permissao": "admin" }
        ```

4.  **Criar Ponto Monitorado**
    -   `POST` `http://localhost:3000/api/alarmes/<SEU_ID_DE_ALARME>/pontos`
    -   Body:
        ```json
        { "nome_ponto": "Sensor da Porta Principal" }
        ```
    -   **Anote o `id_ponto` da resposta.**

### Cenário 2: Orquestração de Eventos

1.  **Armar o Alarme**
    -   `POST` `http://localhost:3000/api/alarmes/<SEU_ID_DE_ALARME>/armar`
    -   Body:
        ```json
        { "id_usuario_acionador": "<SEU_ID_DE_USUARIO>", "metodo": "app_mobile" }
        ```
    -   **Observe os logs** nos terminais dos serviços `activation-control`, `logging` e `notification`. Você deve ver a notificação simulada.

2.  **Disparar o Alarme**
    -   `POST` `http://localhost:3000/api/alarmes/<SEU_ID_DE_ALARME>/disparar`
    -   Body:
        ```json
        { "id_ponto": "<SEU_ID_DE_PONTO>", "timestamp_disparo": "2025-06-09T15:00:00Z" }
        ```
    -   **Observe os logs** nos terminais dos serviços `trigger-control`, `alarms`, `logging` e `notification`. Você deve ver a notificação de disparo.

3.  **Desarmar o Alarme**
    -   `POST` `http://localhost:3000/api/alarmes/<SEU_ID_DE_ALARME>/desarmar`
    -   Body:
        ```json
        { "id_usuario_acionador": "<SEU_ID_DE_USUARIO>", "metodo": "app_mobile" }
        ```
    -   **Observe os logs** para o evento de desarmamento.

### Cenário 3: Verificação

1.  **Consultar Logs do Alarme**
    -   `GET` `http://localhost:3000/api/logs?id_alarme=<SEU_ID_DE_ALARME>`
    -   Verifique se os eventos `ARMADO`, `DISPARO` e `DESARMADO` estão na resposta.

2.  **Verificar Status do Ponto**
    -   `GET` `http://localhost:3000/api/alarmes/<SEU_ID_DE_ALARME>/pontos`
    -   Verifique se o ponto monitorado agora possui `"status_ponto": "violado"`.

</details>

## 📁 Estrutura de Pastas
O projeto está organizado em uma estrutura de monorepo, onde cada pasta na raiz representa um microservice independente ou o API Gateway.

```
alarm-system-backend/
├── api-gateway/                # Ponto de Entrada e Roteador
├── users-service/              # Gerencia usuários
├── alarms-service/             # Gerencia alarmes e pontos
├── logging-service/            # Gerencia logs de eventos
├── activation-control-service/ # Orquestra armar/desarmar
├── trigger-control-service/    # Orquestra disparos
├── notification-service/       # Orquestra notificações
└── README.md                   # Este arquivo
```
Dentro de cada serviço, a estrutura segue um padrão MVC (Model-View-Controller) adaptado para APIs, com pastas para `controllers`, `models`, `routes`, `middlewares`, etc.

## 🔮 Possíveis Melhorias

Este projeto serve como uma base sólida. Para um ambiente de produção, as seguintes melhorias poderiam ser implementadas:
-   **Autenticação e Autorização:** Implementar JWT (JSON Web Tokens) no API Gateway para proteger as rotas.
-   **Containerização:** Usar Docker e Docker Compose para facilitar a configuração do ambiente e o deploy.
-   **Notificações Reais:** Integrar com serviços de Push Notification (Firebase Cloud Messaging) ou SMS (Twilio).
-   **Banco de Dados Robusto:** Migrar de SQLite para um banco de dados como PostgreSQL ou MongoDB em produção.
-   **Testes Automatizados:** Escrever testes unitários e de integração para garantir a confiabilidade do código.
-   **Observabilidade:** Implementar logging estruturado (ex: Winston, Pino) e tracing distribuído para monitorar a saúde do sistema.