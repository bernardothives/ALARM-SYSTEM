require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3003,
    nodeEnv: process.env.NODE_ENV || 'development',
    alarmsServiceUrl: process.env.ALARMS_SERVICE_URL,
    loggingServiceUrl: process.env.LOGGING_SERVICE_URL,
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL,
};