const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../errors/ApiError');

class LogModel {
    async createLog(logData) {
        const { tipo_evento, id_alarme, id_usuario, id_ponto, detalhes } = logData;
        const id_evento = uuidv4();
        // SQLite não armazena JSON nativamente, então stringificamos
        const detalhesJson = detalhes ? JSON.stringify(detalhes) : null;

        const sql = `INSERT INTO eventos_alarme (id_evento, tipo_evento, id_alarme, id_usuario, id_ponto, detalhes)
                     VALUES (?, ?, ?, ?, ?, ?)`;
        try {
            await db.run(sql, [id_evento, tipo_evento, id_alarme, id_usuario, id_ponto, detalhesJson]);
            // Retornar o evento criado, parseando 'detalhes' de volta para JSON se não for null
            const createdEvent = await this.findLogById(id_evento);
            return createdEvent;
        } catch (err) {
            throw new ApiError(500, 'Erro ao registrar evento no banco de dados.', false, err.stack);
        }
    }

    async findLogById(id_evento) {
        const sql = 'SELECT * FROM eventos_alarme WHERE id_evento = ?';
        try {
            const event = await db.get(sql, [id_evento]);
            if (event && event.detalhes) {
                try {
                    event.detalhes = JSON.parse(event.detalhes);
                } catch (parseError) {
                    console.warn(`Falha ao parsear JSON de detalhes para evento ${id_evento}: ${parseError.message}`);
                    // Mantém como string se não puder parsear
                }
            }
            return event;
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar evento por ID.', false, err.stack);
        }
    }

    async getLogs(filters = {}) {
        const { tipo_evento, id_alarme, id_usuario, data_inicio, data_fim, page = 1, limit = 20 } = filters;
        let sql = 'SELECT * FROM eventos_alarme';
        const conditions = [];
        const params = [];

        if (tipo_evento) {
            conditions.push('tipo_evento = ?');
            params.push(tipo_evento);
        }
        if (id_alarme) {
            conditions.push('id_alarme = ?');
            params.push(id_alarme);
        }
        if (id_usuario) {
            conditions.push('id_usuario = ?');
            params.push(id_usuario);
        }
        if (data_inicio) {
            conditions.push('timestamp_evento >= ?');
            params.push(new Date(data_inicio).toISOString());
        }
        if (data_fim) {
            // Adicionar 1 dia e subtrair 1ms para incluir o dia inteiro se data_fim for só YYYY-MM-DD
            let endDate = new Date(data_fim);
            if (data_fim.length === 10) { // Se for apenas YYYY-MM-DD
                endDate.setDate(endDate.getDate() + 1);
                endDate.setMilliseconds(endDate.getMilliseconds() -1);
            }
            conditions.push('timestamp_evento <= ?');
            params.push(endDate.toISOString());
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY timestamp_evento DESC'; // Mais recentes primeiro

        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        let countSql = 'SELECT COUNT(*) as total FROM eventos_alarme';
        if (conditions.length > 0) {
            countSql += ' WHERE ' + conditions.join(' AND ');
        }
        // Removendo os params de limit e offset para a contagem
        const countParams = params.slice(0, params.length - 2);


        try {
            const logs = await db.all(sql, params);
            const totalResult = await db.get(countSql, countParams);
            const totalLogs = totalResult.total;

            logs.forEach(log => {
                if (log.detalhes) {
                    try {
                        log.detalhes = JSON.parse(log.detalhes);
                    } catch (e) { /* Mantém como string */ }
                }
            });
            return {
                data: logs,
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
                totalCount: totalLogs
            };
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar logs.', false, err.stack);
        }
    }
}

module.exports = new LogModel();