const LogModel = require('../models/logModel');
const ApiError = require('../errors/ApiError');

class LogController {
    async createLogEntry(req, res, next) { // Endpoint interno
        try {
            // Validação já feita pelo middleware logValidator.validateCreateLog
            const newLogEntry = await LogModel.createLog(req.body);
            res.status(201).json({ success: true, data: newLogEntry });
        } catch (error) {
            next(error);
        }
    }

    async getAllLogs(req, res, next) { // Endpoint externo para consulta
        try {
            // Validação dos query params já feita pelo middleware logValidator.validateGetLogsQuery
            // req.query terá os valores com defaults aplicados pelo Joi
            const logsResult = await LogModel.getLogs(req.query);
            res.status(200).json({ success: true, ...logsResult });
        } catch (error) {
            next(error);
        }
    }

    async getLogById(req, res, next) { // Endpoint externo para consulta específica
        try {
            const { id_evento } = req.params;
            const logEntry = await LogModel.findLogById(id_evento);
            if (!logEntry) {
                throw new ApiError(404, 'Registro de log não encontrado.');
            }
            res.status(200).json({ success: true, data: logEntry });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LogController();