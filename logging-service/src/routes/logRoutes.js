const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { validateCreateLog, validateGetLogsQuery } = require('../middlewares/validators/logValidator');

// Rota Interna (usada por outros microservices para registrar logs)
// Não precisa de prefixo /api, será acessada como /interno/logs/registrar
router.post('/registrar', validateCreateLog, logController.createLogEntry);


// Rotas Externas (prefixadas com /api pelo server.js, para consulta de logs)
router.get('/', validateGetLogsQuery, logController.getAllLogs);
router.get('/:id_evento', logController.getLogById);


module.exports = router;