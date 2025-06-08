require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3005,
    nodeEnv: process.env.NODE_ENV || 'development',
    alarmsServiceUrl: process.env.ALARMS_SERVICE_URL,
    usersServiceUrl: process.env.USERS_SERVICE_URL,
};