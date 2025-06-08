const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../errors/ApiError');

class UserModel {
    async create(userData) {
        const { nome, numero_celular } = userData;
        const id_usuario = uuidv4();
        const sql = 'INSERT INTO usuarios (id_usuario, nome, numero_celular) VALUES (?, ?, ?)';
        try {
            await db.run(sql, [id_usuario, nome, numero_celular]);
            return { id_usuario, nome, numero_celular };
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: usuarios.numero_celular')) {
                throw new ApiError(409, 'Número de celular já cadastrado.'); // 409 Conflict
            }
            throw new ApiError(500, 'Erro ao criar usuário no banco de dados.', false, err.stack);
        }
    }

    async findById(id_usuario) {
        const sql = 'SELECT id_usuario, nome, numero_celular, data_criacao, data_atualizacao FROM usuarios WHERE id_usuario = ?';
        try {
            const user = await db.get(sql, [id_usuario]);
            return user;
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar usuário por ID.', false, err.stack);
        }
    }

    async findByPhoneNumber(numero_celular) {
        const sql = 'SELECT id_usuario, nome, numero_celular FROM usuarios WHERE numero_celular = ?';
         try {
            const user = await db.get(sql, [numero_celular]);
            return user;
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar usuário por número de celular.', false, err.stack);
        }
    }

    async getAll(filters = {}) { // Exemplo de paginação/filtros simples
        let sql = 'SELECT id_usuario, nome, numero_celular, data_criacao, data_atualizacao FROM usuarios';
        const params = [];
        // Adicionar lógica de filtros e paginação aqui se necessário
        // sql += ' LIMIT ? OFFSET ?'; params.push(limit, offset);

        try {
            const users = await db.all(sql, params);
            return users;
        } catch (err) {
            throw new ApiError(500, 'Erro ao buscar todos os usuários.', false, err.stack);
        }
    }

    async update(id_usuario, userData) {
        const fields = [];
        const params = [];
        Object.keys(userData).forEach(key => {
            if (userData[key] !== undefined) { // Apenas campos definidos
                fields.push(`${key} = ?`);
                params.push(userData[key]);
            }
        });

        if (fields.length === 0) {
            throw new ApiError(400, 'Nenhum campo fornecido para atualização.');
        }

        params.push(id_usuario); // Para a cláusula WHERE
        const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`;

        try {
            const { changes } = await db.run(sql, params);
            if (changes === 0) {
                return null; // Usuário não encontrado para atualizar
            }
            return await this.findById(id_usuario); // Retorna o usuário atualizado
        } catch (err) {
             if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: usuarios.numero_celular')) {
                throw new ApiError(409, 'Número de celular já cadastrado para outro usuário.');
            }
            throw new ApiError(500, 'Erro ao atualizar usuário.', false, err.stack);
        }
    }

    async delete(id_usuario) {
        const sql = 'DELETE FROM usuarios WHERE id_usuario = ?';
        try {
            const { changes } = await db.run(sql, [id_usuario]);
            return changes > 0; // Retorna true se deletou, false se não encontrou
        } catch (err) {
            throw new ApiError(500, 'Erro ao deletar usuário.', false, err.stack);
        }
    }
}

module.exports = new UserModel();