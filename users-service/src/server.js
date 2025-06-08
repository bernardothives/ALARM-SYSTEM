const express = require('express');
const config = require('./config');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');
require('./db/database'); // Inicializa a conexão e o schema do DB

const app = express();

// Middlewares Globais
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Para parsear corpos urlencoded

// Log simples de requisições (pode ser substituído por Morgan em produção)
if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        next();
    });
}

// Rotas
app.use('/api/usuarios', userRoutes); // Rotas expostas externamente
app.use('/interno/usuarios', userRoutes); // Rotas para comunicação interna entre serviços

// Tratador de rotas não encontradas (404)
app.use((req, res, next) => {
    const err = new Error('Rota não encontrada.');
    err.statusCode = 404;
    next(err);
});

// Middleware de tratamento de erros global (deve ser o último middleware)
app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Users Service (Detailed) running on port ${config.port} in ${config.nodeEnv} mode`);
});