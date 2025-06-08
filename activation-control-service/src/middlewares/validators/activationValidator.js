const Joi = require('joi');
const ApiError = require('../../errors/ApiError');

const activationActionSchema = Joi.object({
    id_usuario_acionador: Joi.string().uuid().optional().allow(null, '') // UUID do usuário ou null/vazio
        .messages({
            'string.guid': `"id_usuario_acionador" deve ser um UUID válido.`
        }),
    metodo: Joi.string().min(2).max(50).optional().allow(null, '') // Ex: 'app', 'teclado', 'token', 'controle_remoto'
        .messages({
            'string.min': `"metodo" deve ter no mínimo {#limit} caracteres.`,
            'string.max': `"metodo" deve ter no máximo {#limit} caracteres.`
        })
});

const validateParams = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false, allowUnknown: true }); // allowUnknown para não reclamar de outros params
     if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new ApiError(400, `Erro nos parâmetros da URL: ${errorMessage}`));
    }
    return next();
};

const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new ApiError(400, `Erro no corpo da requisição: ${errorMessage}`));
    }
    return next();
};

const alarmIdParamSchema = Joi.object({
    id_alarme: Joi.string().uuid().required()
        .messages({
            'string.guid': `"id_alarme" deve ser um UUID válido na URL.`,
            'any.required': `"id_alarme" é obrigatório na URL.`
        })
});

module.exports = {
    validateActivationActionBody: validateBody(activationActionSchema),
    validateAlarmIdParam: validateParams(alarmIdParamSchema),
};