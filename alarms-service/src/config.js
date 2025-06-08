require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3002,
    databasePath: process.env.DATABASE_PATH || './data/alarmes_db.sqlite',
    nodeEnv: process.env.NODE_ENV || 'development',
    usersServiceUrl: process.env.USERS_SERVICE_URL,
};