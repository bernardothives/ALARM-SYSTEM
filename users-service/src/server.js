const express = require('express');
const config = require('./config');
const userRoutes = require('./routes/userRoutes');
require('./db/database'); // Para inicializar o DB ao iniciar

const app = express();

app.use(express.json());
app.use('/api', userRoutes); // Prefixo /api para rotas externas
app.use('/', userRoutes); // Para rotas internas sem prefixo /api

app.listen(config.port, () => {
    console.log(`Users Service running on port ${config.port}`);
});