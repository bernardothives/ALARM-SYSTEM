require('dotenv').config(); // Carrega variáveis do .env

module.exports = {
    port: process.env.PORT || 3001,
    databasePath: process.env.DATABASE_PATH
};