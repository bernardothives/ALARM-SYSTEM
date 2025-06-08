const axios = require('axios');
const config = require('./config');
const ApiError = require('./errors/ApiError');

// Helper para requisições (pode ser movido para um utilitário compartilhado se tiver muitos serviços)
async function request(client, method, url, data = null, headers = {}) {
    try {
        const response = await client({ method, url, data, headers });
        return response.data;
    } catch (error) {
        const serviceName = client.defaults.baseURL;
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

// Clients
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

// Funções de chamada
exports.getMonitoredPointDetails = async (alarmId, pointId) => {
    // Alarms service expõe /interno/alarmes/:id_alarme/ponto/:id_ponto
    const responseData = await request(alarmsServiceClient, 'get', `/interno/alarmes/${alarmId}/ponto/${pointId}`);
    if (responseData && responseData.success) {
        return responseData.data;
    }
    if (responseData && !responseData.success) { // Caso o serviço retorne 200 mas com erro de lógica
        throw new ApiError(404, responseData.message || 'Ponto monitorado não encontrado no serviço de alarmes.');
    }
    return null;
};

exports.updateMonitoredPointStatus = async (alarmId, pointId, status) => {
    // Alarms service expõe PUT /interno/alarmes/:id_alarme/ponto/:id_ponto/status
    const responseData = await request(alarmsServiceClient, 'put', `/interno/alarmes/${alarmId}/ponto/${pointId}/status`, { status_ponto: status });
    if (responseData && responseData.success) {
        return responseData.data;
    }
    if (responseData && !responseData.success) {
        throw new ApiError(500, responseData.message || 'Falha ao atualizar status do ponto no serviço de alarmes.');
    }
    return null;
};

exports.logEvent = async (eventData) => {
    // Logging service expõe /interno/logs/registrar
    const responseData = await request(loggingServiceClient, 'post', '/interno/logs/registrar', eventData);
    if (!responseData || !responseData.success) {
        console.warn('[TriggerControl] Falha ao registrar log, mas continuando:', responseData);
    }
    return responseData;
};

exports.notifyUsers = async (notificationData) => {
    // Notification service expõe /interno/notificacoes/enviar
    const responseData = await request(notificationServiceClient, 'post', '/interno/notificacoes/enviar', notificationData);
    if (!responseData || !responseData.success) {
        console.warn('[TriggerControl] Falha ao enviar notificação, mas continuando:', responseData);
    }
    return responseData;
};