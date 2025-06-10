const express = require('express');
const config = require('./config');
const triggerRoutes = require('./routes/triggerRoutes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./errors/ApiError');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
        next();
    });
}

// Rotas
// O API Gateway encaminhará para /api/alarmes/... aqui.
app.use('/', triggerRoutes);


app.use((req, res, next) => {
    next(new ApiError(404, 'Rota não encontrada neste serviço (trigger-control).'));
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Trigger Control Service (Detailed) running on port ${config.port} in ${config.nodeEnv} mode`);
});