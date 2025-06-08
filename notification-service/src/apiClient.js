const axios = require('axios');
const config = require('./config');
const ApiError = require('./errors/ApiError');

// Helper para requisições
async function request(client, method, url, data = null, headers = {}) {
    try {
        const response = await client({ method, url, data, headers });
        return response.data;
    } catch (error) {
        const serviceName = client.defaults.baseURL;
        if (error.response) {
            console.error(`[NotificationSvc-ApiClient] Erro para ${serviceName}${url}: Status ${error.response.status}, Data:`, error.response.data);
            // Não lançar erro fatal aqui, pois o notification service pode tentar continuar com outros usuários.
            // Apenas retornar null ou um objeto de erro que o controller pode verificar.
            return { success: false, status: error.response.status, message: (error.response.data && error.response.data.message) || `Erro no serviço ${serviceName}.` };
        } else if (error.request) {
            console.error(`[NotificationSvc-ApiClient] Erro para ${serviceName}${url}: Sem resposta.`, error.request);
            return { success: false, status: 503, message: `Serviço ${serviceName} indisponível.` };
        } else {
            console.error(`[NotificationSvc-ApiClient] Erro para ${serviceName}${url}: Configuração da requisição.`, error.message);
            return { success: false, status: 500, message: `Erro ao preparar requisição para ${serviceName}.` };
        }
    }
}

// Clients
const alarmsServiceClient = axios.create({
    baseURL: config.alarmsServiceUrl,
    timeout: 5000,
});

const usersServiceClient = axios.create({
    baseURL: config.usersServiceUrl,
    timeout: 5000,
});

// Funções de chamada
exports.getUsersForAlarm = async (alarmId) => {
    // Alarms service expõe /interno/alarmes/:id_alarme/usuarios
    // Espera-se que retorne { success: true, data: [{ id_usuario: 'uuid', permissao: 'admin' }, ...] }
    const responseData = await request(alarmsServiceClient, 'get', `/interno/alarmes/${alarmId}/usuarios`);
    if (responseData && responseData.success) {
        return responseData.data; // Array de usuários vinculados
    }
    console.warn(`[NotificationSvc-ApiClient] Não foi possível obter usuários para o alarme ${alarmId}. Resposta:`, responseData);
    return []; // Retorna array vazio em caso de falha para não quebrar o loop no controller
};

exports.getUserContactDetails = async (userId) => {
    // Users service expõe /interno/usuarios/:id_usuario/contato
    // Espera-se que retorne { success: true, data: { id_usuario: 'uuid', numero_celular: 'xxxx' } }
    const responseData = await request(usersServiceClient, 'get', `/interno/usuarios/${userId}/contato`);
    if (responseData && responseData.success && responseData.data) {
        return responseData.data.numero_celular; // Apenas o número de celular
    }
    console.warn(`[NotificationSvc-ApiClient] Não foi possível obter contato para o usuário ${userId}. Resposta:`, responseData);
    return null;
};