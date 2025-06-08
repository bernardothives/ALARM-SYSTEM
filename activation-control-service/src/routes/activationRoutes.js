const express = require('express');
const router = express.Router();
const activationController = require('../controllers/activationController');
const { validateActivationActionBody, validateAlarmIdParam } = require('../middlewares/validators/activationValidator');

// As rotas no API Gateway são /api/alarmes/:id_alarme/armar (ou desarmar)
// Este serviço recebe o path já roteado.
// O API Gateway deve ser configurado para passar o path completo ou este serviço
// deve montar as rotas para corresponder ao que o gateway envia.
// Vamos assumir que o gateway encaminha para estas rotas neste serviço:
router.post(
    '/:id_alarme/armar', // O prefixo /api/alarmes será adicionado no server.js
    validateAlarmIdParam,
    validateActivationActionBody,
    (req, res, next) => activationController.armAlarm(req, res, next) // Garantindo o 'this'
);

router.post(
    '/:id_alarme/desarmar',
    validateAlarmIdParam,
    validateActivationActionBody,
    (req, res, next) => activationController.disarmAlarm(req, res, next)
);

module.exports = router;