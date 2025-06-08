const AlarmModel = require('../models/alarmModel');
const ApiError = require('../errors/ApiError');
const apiClient = require('../apiClient'); // Para verificar se usuário existe

class AlarmController {
    // --- Alarme ---
    async createAlarm(req, res, next) {
        try {
            const newAlarm = await AlarmModel.createAlarm(req.body);
            res.status(201).json({ success: true, data: newAlarm });
        } catch (error) {
            next(error);
        }
    }

    async getAllAlarms(req, res, next) {
        try {
            const alarms = await AlarmModel.getAllAlarms(req.query);
            res.status(200).json({ success: true, count: alarms.length, data: alarms });
        } catch (error) {
            next(error);
        }
    }

    async getAlarmById(req, res, next) {
        try {
            const alarm = await AlarmModel.findAlarmById(req.params.id_alarme);
            if (!alarm) {
                throw new ApiError(404, 'Alarme não encontrado.');
            }
            res.status(200).json({ success: true, data: alarm });
        } catch (error) {
            next(error);
        }
    }

    async updateAlarm(req, res, next) {
        try {
            const updatedAlarm = await AlarmModel.updateAlarm(req.params.id_alarme, req.body);
            if (!updatedAlarm) {
                throw new ApiError(404, 'Alarme não encontrado para atualização.');
            }
            res.status(200).json({ success: true, data: updatedAlarm });
        } catch (error) {
            next(error);
        }
    }

    async deleteAlarm(req, res, next) {
        try {
            const success = await AlarmModel.deleteAlarm(req.params.id_alarme);
            if (!success) {
                throw new ApiError(404, 'Alarme não encontrado para deleção.');
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // --- Usuários do Alarme ---
    async linkUserToAlarm(req, res, next) {
        try {
            const { id_alarme } = req.params;
            const { id_usuario, permissao } = req.body;

            const alarm = await AlarmModel.findAlarmById(id_alarme);
            if (!alarm) {
                throw new ApiError(404, 'Alarme não encontrado para vincular usuário.');
            }

            const userExists = await apiClient.checkUserExists(id_usuario);
            if (!userExists) {
                throw new ApiError(404, `Usuário com ID ${id_usuario} não encontrado no serviço de usuários.`);
            }
            
            const existingLink = await AlarmModel.findLink(id_alarme, id_usuario);
            if (existingLink) {
                 throw new ApiError(409, 'Usuário já vinculado a este alarme.');
            }

            const newLink = await AlarmModel.linkUserToAlarm(id_alarme, id_usuario, permissao);
            res.status(201).json({ success: true, data: newLink });
        } catch (error) {
            next(error);
        }
    }

    async getLinkedUsers(req, res, next) { // Para API Externa
        try {
            const users = await AlarmModel.getUsersForAlarm(req.params.id_alarme);
            res.status(200).json({ success: true, count: users.length, data: users });
        } catch (error) {
            next(error);
        }
    }
    
    async getLinkedUsersInternal(req, res, next) { // Para API Interna (Notification Service)
        try {
            const { id_alarme } = req.params;
            const users = await AlarmModel.getUsersForAlarm(id_alarme);
             // Notification service pode precisar de mais dados do usuário, mas este serviço só tem o ID.
             // O Notification Service terá que chamar o Users Service para pegar o contato.
            res.status(200).json({ success: true, data: users.map(u => ({ id_usuario: u.id_usuario, permissao: u.permissao })) });
        } catch (error) {
            next(error);
        }
    }

    async unlinkUserFromAlarm(req, res, next) {
        try {
            const { id_alarme, id_usuario } = req.params;
            const success = await AlarmModel.unlinkUserFromAlarm(id_alarme, id_usuario);
            if (!success) {
                throw new ApiError(404, 'Vínculo usuário-alarme não encontrado para deleção.');
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // --- Pontos Monitorados ---
    async createMonitoredPoint(req, res, next) {
        try {
            const { id_alarme } = req.params;
            const alarm = await AlarmModel.findAlarmById(id_alarme);
            if (!alarm) {
                throw new ApiError(404, 'Alarme não encontrado para adicionar ponto.');
            }
            const newPoint = await AlarmModel.createMonitoredPoint(id_alarme, req.body);
            res.status(201).json({ success: true, data: newPoint });
        } catch (error) {
            next(error);
        }
    }

    async getMonitoredPoints(req, res, next) {
        try {
            const points = await AlarmModel.getMonitoredPointsForAlarm(req.params.id_alarme);
            res.status(200).json({ success: true, count: points.length, data: points });
        } catch (error) {
            next(error);
        }
    }
    
    async getMonitoredPointInternal(req, res, next) { // Para API Interna (Trigger Service)
        try {
            const { id_alarme, id_ponto } = req.params;
            const point = await AlarmModel.findMonitoredPointInAlarm(id_alarme, id_ponto);
            if (!point) {
                throw new ApiError(404, 'Ponto monitorado não encontrado neste alarme.');
            }
            res.status(200).json({ success: true, data: point });
        } catch (error) {
            next(error);
        }
    }

    async updateMonitoredPointStatus(req, res, next) { // Para API Interna (Trigger Service)
        try {
            const { id_alarme, id_ponto } = req.params;
            const { status_ponto } = req.body;
            const updatedPoint = await AlarmModel.updateMonitoredPointStatus(id_alarme, id_ponto, status_ponto);
            if (!updatedPoint) {
                throw new ApiError(404, 'Ponto monitorado não encontrado ou status inalterado.');
            }
            res.status(200).json({ success: true, data: updatedPoint });
        } catch (error) {
            next(error);
        }
    }
    
    async deleteMonitoredPoint(req, res, next) {
        try {
            const { id_alarme, id_ponto } = req.params;
            const success = await AlarmModel.deleteMonitoredPoint(id_alarme, id_ponto);
            if (!success) {
                throw new ApiError(404, 'Ponto monitorado não encontrado para deleção.');
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AlarmController();