const express = require('express');
const router = express.Router();
const alarmController = require('../controllers/alarmController');
const {
    validateCreateAlarm,
    validateLinkUserToAlarm,
    validateCreateMonitoredPoint,
    validateUpdateMonitoredPointStatus,
} = require('../middlewares/validators/alarmValidator');

// --- Rotas de Alarmes ---
router.post('/', validateCreateAlarm, alarmController.createAlarm);
router.get('/', alarmController.getAllAlarms);
router.get('/:id_alarme', alarmController.getAlarmById);
// router.put('/:id_alarme', validateUpdateAlarm, alarmController.updateAlarm); // Adicionar validador se necessário
router.delete('/:id_alarme', alarmController.deleteAlarm);

// --- Rotas de Usuários do Alarme (Externas) ---
router.post('/:id_alarme/usuarios', validateLinkUserToAlarm, alarmController.linkUserToAlarm);
router.get('/:id_alarme/usuarios', alarmController.getLinkedUsers);
router.delete('/:id_alarme/usuarios/:id_usuario', alarmController.unlinkUserFromAlarm);

// --- Rotas de Pontos Monitorados (Externas) ---
router.post('/:id_alarme/pontos', validateCreateMonitoredPoint, alarmController.createMonitoredPoint);
router.get('/:id_alarme/pontos', alarmController.getMonitoredPoints);
router.delete('/:id_alarme/pontos/:id_ponto', alarmController.deleteMonitoredPoint);
// PUT para atualizar nome do ponto pode ser adicionado aqui

// --- Rotas Internas (para outros microservices) ---
// Notification Service usa para pegar usuários de um alarme
router.get('/interno/:id_alarme/usuarios', alarmController.getLinkedUsersInternal);

// Trigger Control Service usa para pegar detalhes de um ponto e atualizar seu status
router.get('/interno/:id_alarme/ponto/:id_ponto', alarmController.getMonitoredPointInternal);
router.put('/interno/:id_alarme/ponto/:id_ponto/status', validateUpdateMonitoredPointStatus, alarmController.updateMonitoredPointStatus);


module.exports = router;