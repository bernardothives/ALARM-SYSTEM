const ApiError = require('../errors/ApiError'); // Certifique-se que o caminho está correto
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Se não for um ApiError, transforme em um para padronização
    // Isso pode acontecer para erros gerados pelo Express ou outros middlewares
    if (!(error instanceof ApiError)) {
        const statusCode = err.status || err.statusCode || 500;
        const message = err.message || 'Ocorreu um erro inesperado no API Gateway.';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        // Inclui stack apenas em desenvolvimento e se o erro não for operacional
        ...(config.nodeEnv === 'development' && !error.isOperational && { stack: error.stack }),
    };

    if (config.nodeEnv === 'development') {
        console.error('[GW_DEV_ERROR_LOG]:', error);
    } else {
        // Em produção, logar de forma mais estruturada
        console.error('[GW_PROD_ERROR_LOG]:', {
            message: error.message,
            statusCode: error.statusCode,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
        });
    }

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;