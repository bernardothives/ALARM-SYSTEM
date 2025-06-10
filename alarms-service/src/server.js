const express = require('express');
const config = require('./config');
const alarmRoutes = require('./routes/alarmRoutes');
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
app.use('/', alarmRoutes); // Rotas expostas externamente
// app.use('/interno/alarmes', alarmRoutes); // Rotas para comunicação interna entre serviços (ex: /interno/alarmes/:id_alarme/usuarios)

app.use((req, res, next) => {
    const err = new Error('Rota não encontrada.');
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Alarms Service (Detailed) running on port ${config.port} in ${config.nodeEnv} mode`);
});