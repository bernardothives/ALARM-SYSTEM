const ApiError = require('../errors/ApiError');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.code === 'SQLITE_CONSTRAINT' ? 409 : 500); // Ex: Conflito de constraint
        const message = error.message || 'Algo deu muito errado!';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        ...(config.nodeEnv === 'development' && { stack: error.stack }), // Inclui stack em dev
    };

    if (config.nodeEnv === 'development') {
        console.error('[DEV_ERROR_LOG]:', error);
    } else {
        // Em produção, logar o erro de forma mais estruturada (ex: para um serviço de logging)
        console.error('[PROD_ERROR_LOG]:', {
            message: error.message,
            statusCode: error.statusCode,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            // stack: error.isOperational ? undefined : error.stack // Não logar stack de erros operacionais
        });
    }

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;