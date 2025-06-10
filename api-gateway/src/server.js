const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const setupProxies = require('./routes/proxySetup');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./errors/ApiError');

const app = express();

// --- Middlewares de Segurança e Logging ---
app.use(helmet()); // Define vários cabeçalhos HTTP para segurança
app.use(cors({ origin: config.corsOrigin })); // Permite requisições Cross-Origin

// Logging HTTP - 'dev' para desenvolvimento, 'combined' para produção
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));

// --- Configuração das Rotas de Proxy ---
setupProxies(app);

// --- Tratamento de Erros ---
// Rota não encontrada no Gateway (se nenhuma regra de proxy corresponder)
app.use((req, res, next) => {
    next(new ApiError(404, `A rota ${req.originalUrl} não foi encontrada no API Gateway.`));
});

// Middleware de tratamento de erros global (deve ser o último)
app.use(errorHandler);


// --- Iniciar Servidor ---
app.listen(config.port, () => {
    console.log(`[API Gateway] Rodando na porta ${config.port} em modo ${config.nodeEnv}`);
    console.log(`[API Gateway] CORS habilitado para origem: ${config.corsOrigin}`);
    Object.entries(config.services).forEach(([name, url]) => {
        if (url) console.log(`[API Gateway] Proxy para ${name}: ${url}`);
    });
});