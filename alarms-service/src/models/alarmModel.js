const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../errors/ApiError');

class AlarmModel {
    // --- Alarmes ---
    async createAlarm(data) {
        const { descricao_local } = data;
        const id_alarme = uuidv4();
        const sql = 'INSERT INTO alarmes (id_alarme, descricao_local) VALUES (?, ?)';
        try {
            await db.run(sql, [id_alarme, descricao_local]);
            return { id_alarme, descricao_local };
        } catch (err) {
            throw new ApiError(500, 'Erro ao criar alarme.', false, err.stack);
        }
    }

    async findAlarmById(id_alarme) {
        const sql = 'SELECT * FROM alarmes WHERE id_alarme = ?';
        try {
            return await db.get(sql, [id_alarme]);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar alarme por ID.', false, err.stack);
        }
    }

    async getAllAlarms(filters = {}) {
        // Adicionar lógica de filtros/paginação se necessário
        const sql = 'SELECT * FROM alarmes';
        try {
            return await db.all(sql);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar todos os alarmes.', false, err.stack);
        }
    }

    async updateAlarm(id_alarme, data) {
        const { descricao_local } = data;
        const sql = 'UPDATE alarmes SET descricao_local = ? WHERE id_alarme = ?';
        try {
            const { changes } = await db.run(sql, [descricao_local, id_alarme]);
            if (changes === 0) return null;
            return await this.findAlarmById(id_alarme);
        } catch (err) {
            throw new ApiError(500, 'Erro ao atualizar alarme.', false, err.stack);
        }
    }

    async deleteAlarm(id_alarme) {
        const sql = 'DELETE FROM alarmes WHERE id_alarme = ?';
        try {
            const { changes } = await db.run(sql, [id_alarme]);
            return changes > 0;
        } catch (err) {
            throw new ApiError(500, 'Erro ao deletar alarme.', false, err.stack);
        }
    }

    // --- Usuários do Alarme ---
    async linkUserToAlarm(id_alarme, id_usuario, permissao) {
        const id_associacao = uuidv4();
        const sql = 'INSERT INTO usuarios_alarmes (id_associacao, id_alarme, id_usuario, permissao) VALUES (?, ?, ?, ?)';
        try {
            await db.run(sql, [id_associacao, id_alarme, id_usuario, permissao]);
            return { id_associacao, id_alarme, id_usuario, permissao };
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed')) {
                throw new ApiError(409, 'Usuário já vinculado a este alarme.');
            }
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY constraint failed')) {
                 throw new ApiError(404, 'Alarme não encontrado para vincular usuário.');
            }
            throw new ApiError(500, 'Erro ao vincular usuário ao alarme.', false, err.stack);
        }
    }

    async getUsersForAlarm(id_alarme) {
        const sql = 'SELECT id_usuario, permissao, data_associacao FROM usuarios_alarmes WHERE id_alarme = ?';
        try {
            return await db.all(sql, [id_alarme]);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar usuários do alarme.', false, err.stack);
        }
    }
    
    async findLink(id_alarme, id_usuario) {
        const sql = 'SELECT * FROM usuarios_alarmes WHERE id_alarme = ? AND id_usuario = ?';
        try {
            return await db.get(sql, [id_alarme, id_usuario]);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar vínculo de usuário e alarme.', false, err.stack);
        }
    }

    async unlinkUserFromAlarm(id_alarme, id_usuario) {
        const sql = 'DELETE FROM usuarios_alarmes WHERE id_alarme = ? AND id_usuario = ?';
        try {
            const { changes } = await db.run(sql, [id_alarme, id_usuario]);
            return changes > 0;
        } catch (err) {
            throw new ApiError(500, 'Erro ao desvincular usuário do alarme.', false, err.stack);
        }
    }

    // --- Pontos Monitorados ---
    async createMonitoredPoint(id_alarme, data) {
        const { nome_ponto } = data;
        const id_ponto = uuidv4();
        const sql = 'INSERT INTO pontos_monitorados (id_ponto, id_alarme, nome_ponto) VALUES (?, ?, ?)';
        try {
            await db.run(sql, [id_ponto, id_alarme, nome_ponto]);
            return { id_ponto, id_alarme, nome_ponto, status_ponto: 'normal' };
        } catch (err) {
             if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('FOREIGN KEY constraint failed')) {
                 throw new ApiError(404, 'Alarme não encontrado para adicionar ponto.');
            }
            throw new ApiError(500, 'Erro ao criar ponto monitorado.', false, err.stack);
        }
    }

    async getMonitoredPointsForAlarm(id_alarme) {
        const sql = 'SELECT * FROM pontos_monitorados WHERE id_alarme = ?';
        try {
            return await db.all(sql, [id_alarme]);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar pontos monitorados do alarme.', false, err.stack);
        }
    }

    async findMonitoredPointById(id_ponto) {
        const sql = 'SELECT * FROM pontos_monitorados WHERE id_ponto = ?';
        try {
            return await db.get(sql, [id_ponto]);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar ponto monitorado por ID.', false, err.stack);
        }
    }
    
    async findMonitoredPointInAlarm(id_alarme, id_ponto) {
        const sql = 'SELECT * FROM pontos_monitorados WHERE id_alarme = ? AND id_ponto = ?';
         try {
            return await db.get(sql, [id_alarme, id_ponto]);
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar ponto monitorado específico do alarme.', false, err.stack);
        }
    }


    async updateMonitoredPointStatus(id_alarme, id_ponto, status_ponto) {
        const sql = 'UPDATE pontos_monitorados SET status_ponto = ? WHERE id_alarme = ? AND id_ponto = ?';
        try {
            const { changes } = await db.run(sql, [status_ponto, id_alarme, id_ponto]);
            if (changes === 0) return null; // Nenhum ponto encontrado ou status já era o mesmo
            return await this.findMonitoredPointInAlarm(id_alarme, id_ponto);
        } catch (err) {
            throw new ApiError(500, 'Erro ao atualizar status do ponto monitorado.', false, err.stack);
        }
    }

    async deleteMonitoredPoint(id_alarme, id_ponto) {
        const sql = 'DELETE FROM pontos_monitorados WHERE id_alarme = ? AND id_ponto = ?';
        try {
            const { changes } = await db.run(sql, [id_alarme, id_ponto]);
            return changes > 0;
        } catch (err) {
            throw new ApiError(500, 'Erro ao deletar ponto monitorado.', false, err.stack);
        }
    }
}

module.exports = new AlarmModel();