const UserModel = require('../models/userModel');
const ApiError = require('../errors/ApiError');

class UserController {
    async createUser(req, res, next) {
        try {
            // Validação já feita pelo middleware userValidator.validateCreateUser
            const newUser = await UserModel.create(req.body);
            res.status(201).json({ success: true, data: newUser });
        } catch (error) {
            next(error); // Passa para o error handler global
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const users = await UserModel.getAll(req.query); // Passa query params para filtros/paginação
            res.status(200).json({ success: true, count: users.length, data: users });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById(id);
            if (!user) {
                throw new ApiError(404, 'Usuário não encontrado.');
            }
            res.status(200).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
    
    // Especial para rota interna de obter contato
    async getUserContactInternal(req, res, next) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById(id);
            if (!user) {
                throw new ApiError(404, 'Usuário não encontrado para obter contato.');
            }
            // Retornar apenas o necessário para o serviço de notificação
            res.status(200).json({data: { id_usuario: user.id_usuario, numero_celular: user.numero_celular }});
        } catch (error) {
            next(error);
        }
    }


    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            // Validação do corpo já feita pelo middleware userValidator.validateUpdateUser
            const updatedUser = await UserModel.update(id, req.body);
            if (!updatedUser) {
                throw new ApiError(404, 'Usuário não encontrado para atualização.');
            }
            res.status(200).json({ success: true, data: updatedUser });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const success = await UserModel.delete(id);
            if (!success) {
                throw new ApiError(404, 'Usuário não encontrado para deleção.');
            }
            res.status(204).send(); // 204 No Content
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();