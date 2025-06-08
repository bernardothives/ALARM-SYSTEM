const axios = require('axios');
const config = require('./config');
const ApiError = require('./errors/ApiError');

const usersServiceClient = axios.create({
    baseURL: config.usersServiceUrl, // Ex: http://localhost:3001
    timeout: 5000,
});

async function request(client, method, url, data = null) {
    try {
        const response = await client({ method, url, data });
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`API Client Error to ${client.defaults.baseURL}${url}: Status ${error.response.status}, Data:`, error.response.data);
            throw new ApiError(
                error.response.status,
                (error.response.data && error.response.data.message) || `Erro ao comunicar com serviço de usuários.`,
                true
            );
        } else if (error.request) {
            console.error(`API Client Error to ${client.defaults.baseURL}${url}: No response received.`, error.request);
            throw new ApiError(503, `Serviço de usuários (${client.defaults.baseURL}${url}) indisponível.`);
        } else {
            console.error(`API Client Error to ${client.defaults.baseURL}${url}: Request setup error.`, error.message);
            throw new ApiError(500, `Erro ao preparar requisição para serviço de usuários (${client.defaults.baseURL}${url}).`);
        }
    }
}

// Verifica se um usuário existe no users-service
exports.checkUserExists = async (userId) => {
    try {
        // Assumindo que users-service expõe /interno/usuarios/:id que retorna o usuário ou 404
        const responseData = await request(usersServiceClient, 'get', `/interno/usuarios/${userId}`);
        return responseData && responseData.success && responseData.data; // Retorna o usuário se encontrado
    } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) {
            return null; // Usuário não encontrado é um resultado esperado em alguns casos
        }
        throw error; // Re-lança outros erros
    }
};