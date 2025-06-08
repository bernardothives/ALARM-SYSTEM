const express = require('express');
const router = express.Router();
const triggerController = require('../controllers/triggerController');
const { validateTriggerActionBody, validateAlarmIdParam } = require('../middlewares/validators/triggerValidator');

// O API Gateway encaminhará para /api/alarmes/:id_alarme/disparar aqui.
router.post(
    '/:id_alarme/disparar', // O prefixo /api/alarmes será adicionado no server.js
    validateAlarmIdParam,
    validateTriggerActionBody,
    triggerController.processAlarmTrigger // Não precisa de bind ou arrow function se os métodos do controller não usam 'this' diretamente para o contexto da classe
);

module.exports = router;