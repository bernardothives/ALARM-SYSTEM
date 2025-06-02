const axios = require('axios');
const config = require('./config');

const usersServiceClient = axios.create({
    baseURL: config.usersServiceUrl + '/api' // Ou /interno se for o caso
});

exports.getUserById = async (userId) => {
    try {
        // A rota no users-service pode precisar de ajuste para ser /api/usuarios/:id
        const response = await usersServiceClient.get(`/usuarios/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${userId} from Users Service:`, error.message);
        return null;
    }
};