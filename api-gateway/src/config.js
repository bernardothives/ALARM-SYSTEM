require('dotenv').config();

const AppConfig = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',

    services: {
        users: process.env.USERS_SERVICE_TARGET,
        alarms: process.env.ALARMS_SERVICE_TARGET,
        activationControl: process.env.ACTIVATION_CONTROL_SERVICE_TARGET,
        triggerControl: process.env.TRIGGER_CONTROL_SERVICE_TARGET,
        // notification: process.env.NOTIFICATION_SERVICE_TARGET, // Geralmente interno
        logging: process.env.LOGGING_SERVICE_TARGET,
    },
};

// Validar se todas as URLs de serviço necessárias foram definidas
for (const [key, value] of Object.entries(AppConfig.services)) {
    if (key !== 'notification' && !value) { // Exceção para notification service que é interno
        console.warn(`[API Gateway Config] ATENÇÃO: A URL para o serviço '${key}' não está definida no .env (Ex: ${key.toUpperCase()}_SERVICE_TARGET). Algumas rotas podem não funcionar.`);
    }
}


module.exports = AppConfig;