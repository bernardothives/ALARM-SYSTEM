require('dotenv').config();
module.exports = {
    port: process.env.PORT || 3002,
    databasePath: process.env.DATABASE_PATH,
    usersServiceUrl: process.env.USERS_SERVICE_URL
};