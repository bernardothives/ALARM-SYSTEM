const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');
const ApiError = require('../errors/ApiError');

const onProxyError = (err, req, res, target) => {
    console.error(`[API Gateway] Proxy Error para ${target}: ${err.message}`);
    // Evita enviar stack trace do proxy para o cliente em produção
    const errorMessage = (config.nodeEnv === 'development') ? err.message : 'Erro ao contatar o serviço de destino.';
    if (!res.headersSent) {
        res.status(503).json({ // 503 Service Unavailable
            success: false,
            message: `O serviço (${new URL(target).hostname}) está temporariamente indisponível ou ocorreu um erro.`,
            details: errorMessage
        });
    }
};

const createProxy = (targetUrl, pathRewriteRules = null) => {
    if (!targetUrl) {
        // Retorna um middleware que informa que o serviço não está configurado
        return (req, res, next) => {
            const serviceName = Object.keys(config.services).find(key => config.services[key] === targetUrl) || 'desconhecido';
            console.warn(`[API Gateway] Tentativa de acesso a rota para serviço (${serviceName}) não configurado: ${req.originalUrl}`);
            return next(new ApiError(503, `O serviço de destino para esta rota não está configurado no API Gateway.`));
        };
    }
    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        secure: config.nodeEnv === 'production', // Valide certificados SSL em produção
        logLevel: config.nodeEnv === 'development' ? 'debug' : 'info',
        pathRewrite: pathRewriteRules, // Ex: { '^/api/oldpath': '/api/newpath' }
        onProxyReq: (proxyReq, req, res) => {
            // Adicionar cabeçalhos, se necessário, ex: para tracing
            // proxyReq.setHeader('X-Request-ID', require('uuid').v4());
            console.log(`[GW] Proxying ${req.method} ${req.originalUrl} to ${targetUrl}${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`[GW] Received response from ${targetUrl}${req.url} - Status: ${proxyRes.statusCode}`);
            // Modificar cabeçalhos de resposta, se necessário
        },
        onError: (err, req, res) => onProxyError(err, req, res, targetUrl),
    });
};

module.exports = function (app) {
    // --- Users Service ---
    if (config.services.users) {
        app.use('/api/usuarios', createProxy(config.services.users));
    }

    // --- Logging Service (para consulta externa) ---
    if (config.services.logging) {
        app.use('/api/logs', createProxy(config.services.logging));
    }

    // --- Rotas complexas para /api/alarmes ---
    // Estas rotas precisam ser definidas ANTES da rota genérica para o alarms-service

    // Activation Control Service (Armar/Desarmar)
    if (config.services.activationControl) {
        app.use('/api/alarmes/:id_alarme/armar', createProxy(config.services.activationControl));
        app.use('/api/alarmes/:id_alarme/desarmar', createProxy(config.services.activationControl));
    }

    // Trigger Control Service (Disparar)
    if (config.services.triggerControl) {
        app.use('/api/alarmes/:id_alarme/disparar', createProxy(config.services.triggerControl));
    }

    // Alarms Service (CRUD de alarmes, pontos, usuários vinculados)
    // Esta deve ser a última rota para /api/alarmes para pegar tudo que não foi pego antes.
    if (config.services.alarms) {
        app.use('/api/alarmes', createProxy(config.services.alarms));
    }

    console.log('[API Gateway] Configuração de proxy concluída.');
};