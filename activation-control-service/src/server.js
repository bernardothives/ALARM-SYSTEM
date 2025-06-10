const express = require('express');
const config = require('./config');
const activationRoutes = require('./routes/activationRoutes');
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
// Ex: Gateway recebe /api/alarmes/uuid123/armar e encaminha para este serviço na rota /api/alarmes/uuid123/armar
app.use('/', activationRoutes);


app.use((req, res, next) => {
    next(new ApiError(404, 'Rota não encontrada neste serviço (activation-control).'));
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Activation Control Service (Detailed) running on port ${config.port} in ${config.nodeEnv} mode`);
});