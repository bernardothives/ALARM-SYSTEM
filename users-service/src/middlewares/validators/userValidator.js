const Joi = require('joi');
const ApiError = require('../../errors/ApiError');

const createUserSchema = Joi.object({
    nome: Joi.string().min(3).max(100).required()
        .messages({
            'string.base': `"nome" deve ser do tipo texto`,
            'string.empty': `"nome" não pode ser vazio`,
            'string.min': `"nome" deve ter no mínimo {#limit} caracteres`,
            'string.max': `"nome" deve ter no máximo {#limit} caracteres`,
            'any.required': `"nome" é um campo obrigatório`
        }),
    numero_celular: Joi.string().pattern(/^[+\d]{10,15}$/).required() // Padrão simples para números de celular
        .messages({
            'string.pattern.base': `"numero_celular" inválido. Use formato internacional ou local com DDD.`,
            'any.required': `"numero_celular" é um campo obrigatório`
        })
});

const updateUserSchema = Joi.object({
    nome: Joi.string().min(3).max(100)
         .messages({ /* ... mensagens ... */ }),
    numero_celular: Joi.string().pattern(/^[+\d]{10,15}$/)
         .messages({ /* ... mensagens ... */ })
}).min(1); // Pelo menos um campo deve ser fornecido para atualização

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false }); // abortEarly: false para mostrar todos os erros
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new ApiError(400, errorMessage)); // 400 Bad Request
    }
    return next();
};

module.exports = {
    validateCreateUser: validate(createUserSchema),
    validateUpdateUser: validate(updateUserSchema),
};