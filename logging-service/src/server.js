const express = require('express');
const config = require('./config');
const logRoutes = require('./routes/logRoutes'); // Contém rotas internas e externas
const errorHandler = require('./middlewares/errorHandler');
require('./db/database'); // Inicializa a conexão e o schema do DB

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
app.use('/interno/logs', logRoutes); // Para o endpoint /interno/logs/registrar
app.use('/api/logs', logRoutes);     // Para os endpoints /api/logs e /api/logs/:id_evento

app.use((req, res, next) => {
    const err = new Error('Rota não encontrada.');
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Logging Service (Detailed) running on port ${config.port} in ${config.nodeEnv} mode`);
});