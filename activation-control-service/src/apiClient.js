const axios = require('axios');
const config = require('./config');
const ApiError = require('./errors/ApiError');

// Helper para requisições
async function request(client, method, url, data = null, headers = {}) {
    try {
        const response = await client({ method, url, data, headers });
        return response.data; // Assumindo que a resposta útil está em response.data
    } catch (error) {
        const serviceName = client.defaults.baseURL; // Para identificar o serviço que falhou
        if (error.response) {
            console.error(`API Client Error to ${serviceName}${url}: Status ${error.response.status}, Data:`, error.response.data);
            throw new ApiError(
                error.response.status,
                (error.response.data && error.response.data.message) || `Erro ao comunicar com ${serviceName}.`,
                true
            );
        } else if (error.request) {
            console.error(`API Client Error to ${serviceName}${url}: No response received.`, error.request);
            throw new ApiError(503, `Serviço ${serviceName} indisponível ou não respondeu.`);
        } else {
            console.error(`API Client Error to ${serviceName}${url}: Request setup error.`, error.message);
            throw new ApiError(500, `Erro ao preparar requisição para ${serviceName}.`);
        }
    }
}

// --- Clients para cada serviço ---
const alarmsServiceClient = axios.create({
    baseURL: config.alarmsServiceUrl,
    timeout: 5000,
});

const loggingServiceClient = axios.create({
    baseURL: config.loggingServiceUrl,
    timeout: 3000,
});

const notificationServiceClient = axios.create({
    baseURL: config.notificationServiceUrl,
    timeout: 4000,
});


// --- Funções de chamada ---
exports.getAlarmDetails = async (alarmId) => {
    // Alarms service expõe /api/alarmes/:id_alarme para detalhes externos
    // ou poderia ter um /interno/alarmes/:id_alarme
    const responseData = await request(alarmsServiceClient, 'get', `/${alarmId}`);
    if (responseData && responseData.success) {
        return responseData.data;
    }
    // Se responseData.success for false ou não existir, o erro já deveria ter sido lançado por request
    // Ou, se o serviço de alarmes retornar 200 com success: false:
    if (responseData && !responseData.success) {
        throw new ApiError(404, responseData.message || 'Alarme não encontrado no serviço de alarmes.');
    }
    return null; // Caso de retorno inesperado
};

exports.logEvent = async (eventData) => {
    // Logging service expõe /interno/logs/registrar
    const responseData = await request(loggingServiceClient, 'post', '/', eventData);
    if (!responseData || !responseData.success) {
        // Logar falha mas não necessariamente parar o fluxo principal, dependendo da criticidade
        console.warn('[ActivationControl] Falha ao registrar log, mas continuando:', responseData);
    }
    return responseData;
};

exports.notifyUsers = async (notificationData) => {
    // Notification service expõe /interno/notificacoes/enviar
    const responseData = await request(notificationServiceClient, 'post', '/', notificationData);
     if (!responseData || !responseData.success) {
        console.warn('[ActivationControl] Falha ao enviar notificação, mas continuando:', responseData);
    }
    return responseData;
};