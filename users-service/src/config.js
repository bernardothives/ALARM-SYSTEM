require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3001,
    databasePath: process.env.DATABASE_PATH || './data/usuarios_db.sqlite',
    nodeEnv: process.env.NODE_ENV || 'development',
};