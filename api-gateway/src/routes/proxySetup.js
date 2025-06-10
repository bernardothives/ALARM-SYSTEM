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

// api-gateway/src/routes/proxySetup.js

module.exports = function (app) {
    // Rota para Users Service (permanece igual)
    if (config.services.users) {
        app.use('/api/usuarios', createProxy(config.services.users));
    }

    // Rota para Logging Service (permanece igual)
    if (config.services.logging) {
        app.use('/api/logs', createProxy(config.services.logging));
    }

    // --- NOVA ESTRUTURA DE ROTAS ---

    // Rota para Activation Control Service (Armar/Desarmar)
    // Agora tem seu próprio prefixo: /api/activation
    if (config.services.activationControl) {
        app.use('/api/activation', createProxy(config.services.activationControl));
    }

    // Rota para Trigger Control Service (Disparar)
    // Agora tem seu próprio prefixo: /api/trigger
    if (config.services.triggerControl) {
        app.use('/api/trigger', createProxy(config.services.triggerControl));
    }

    // Rota para Alarms Service (CRUD de alarmes e pontos)
    // Permanece a mesma, pois é o serviço principal para este recurso.
    if (config.services.alarms) {
        app.use('/api/alarmes', createProxy(config.services.alarms));
    }

    console.log('[API Gateway] Configuração de proxy robusta concluída.');
};