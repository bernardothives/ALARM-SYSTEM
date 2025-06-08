const Joi = require('joi');
const ApiError = require('../../errors/ApiError');

// Esquemas de validação
const createAlarmSchema = Joi.object({
    descricao_local: Joi.string().min(3).max(255).required()
        .messages({
            'string.empty': `"descricao_local" não pode ser vazia.`,
            'any.required': `"descricao_local" é um campo obrigatório.`
        }),
});

const linkUserToAlarmSchema = Joi.object({
    id_usuario: Joi.string().uuid().required()
        .messages({ 'any.required': `"id_usuario" é obrigatório.` }),
    permissao: Joi.string().valid('admin', 'usuario').required()
        .messages({ 'any.required': `"permissao" é obrigatória.` }),
});

const createMonitoredPointSchema = Joi.object({
    nome_ponto: Joi.string().min(3).max(100).required()
        .messages({ 'any.required': `"nome_ponto" é obrigatório.` }),
});

const updateMonitoredPointStatusSchema = Joi.object({
    status_ponto: Joi.string().valid('normal', 'violado').required()
        .messages({ 'any.required': `"status_ponto" é obrigatório.` }),
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new ApiError(400, errorMessage));
    }
    return next();
};

module.exports = {
    validateCreateAlarm: validate(createAlarmSchema),
    validateLinkUserToAlarm: validate(linkUserToAlarmSchema),
    validateCreateMonitoredPoint: validate(createMonitoredPointSchema),
    validateUpdateMonitoredPointStatus: validate(updateMonitoredPointStatusSchema),
};