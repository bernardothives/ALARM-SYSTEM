const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { validateSendNotificationBody } = require('../middlewares/validators/notificationValidator');

// Rota Interna, chamada por outros microservices
// O prefixo /interno/notificacoes será adicionado no server.js
router.post(
    '/enviar',
    validateSendNotificationBody,
    notificationController.sendNotification
);

module.exports = router;