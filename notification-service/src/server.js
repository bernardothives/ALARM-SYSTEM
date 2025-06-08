const express = require('express');
const config = require('./config');
const notificationRoutes = require('./routes/notificationRoutes');
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
// Este serviço só tem rotas internas
app.use('/interno/notificacoes', notificationRoutes);


app.use((req, res, next) => {
    next(new ApiError(404, 'Rota não encontrada neste serviço (notification-service).'));
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Notification Service (Detailed) running on port ${config.port} in ${config.nodeEnv} mode`);
});