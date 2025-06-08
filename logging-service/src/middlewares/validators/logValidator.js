const Joi = require('joi');
const ApiError = require('../../errors/ApiError');

const createLogSchema = Joi.object({
    tipo_evento: Joi.string().alphanum().min(3).max(50).required()
        .messages({
            'any.required': `"tipo_evento" é obrigatório.`,
            'string.empty': `"tipo_evento" não pode ser vazio.`
        }),
    id_alarme: Joi.string().uuid().allow(null), // Permite UUID ou null
    id_usuario: Joi.string().uuid().allow(null),
    id_ponto: Joi.string().uuid().allow(null),
    detalhes: Joi.object().unknown(true).allow(null) // Permite um objeto JSON arbitrário ou null
});

const getLogsQuerySchema = Joi.object({
    tipo_evento: Joi.string().alphanum().min(3).max(50),
    id_alarme: Joi.string().uuid(),
    id_usuario: Joi.string().uuid(),
    data_inicio: Joi.date().iso(), // Formato YYYY-MM-DDTHH:MM:SS.SSSZ ou YYYY-MM-DD
    data_fim: Joi.date().iso().min(Joi.ref('data_inicio')),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
});


const validate = (schema, source = 'body') => (req, res, next) => {
    const dataToValidate = source === 'body' ? req.body : req.query;
    const { error } = schema.validate(dataToValidate, { abortEarly: false, allowUnknown: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new ApiError(400, errorMessage));
    }
    // Se a validação for de query params, substitua req.query pelos valores validados (com defaults)
    if (source === 'query') {
        req.query = schema.validate(dataToValidate).value; // Joi retorna os valores com defaults aplicados
    }
    return next();
};

module.exports = {
    validateCreateLog: validate(createLogSchema, 'body'),
    validateGetLogsQuery: validate(getLogsQuerySchema, 'query'),
};