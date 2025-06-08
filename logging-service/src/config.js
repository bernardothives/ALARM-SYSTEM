require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3006,
    databasePath: process.env.DATABASE_PATH || './data/logs_db.sqlite',
    nodeEnv: process.env.NODE_ENV || 'development',
};