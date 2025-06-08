const Joi = require('joi');
const ApiError = require('../../errors/ApiError');

const triggerActionSchema = Joi.object({
    id_ponto: Joi.string().uuid().required()
        .messages({
            'string.guid': `"id_ponto" deve ser um UUID válido.`,
            'any.required': `"id_ponto" é obrigatório no corpo da requisição.`
        }),
    timestamp_disparo: Joi.date().iso().required() // Ex: "2024-06-03T10:00:00Z"
        .messages({
            'date.format': `"timestamp_disparo" deve estar no formato ISO 8601.`,
            'any.required': `"timestamp_disparo" é obrigatório.`
        })
});

const alarmIdParamSchema = Joi.object({
    id_alarme: Joi.string().uuid().required()
        .messages({
            'string.guid': `"id_alarme" deve ser um UUID válido na URL.`,
            'any.required': `"id_alarme" é obrigatório na URL.`
        })
});

const validateParams = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false, allowUnknown: true });
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

module.exports = {
    validateTriggerActionBody: validateBody(triggerActionSchema),
    validateAlarmIdParam: validateParams(alarmIdParamSchema),
};