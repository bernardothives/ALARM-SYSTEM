const Joi = require('joi');
const ApiError = require('../../errors/ApiError');

const sendNotificationSchema = Joi.object({
    tipo_notificacao: Joi.string().valid('ARMADO', 'DESARMADO', 'DISPARO').required()
        .messages({
            'any.required': `"tipo_notificacao" é obrigatório.`,
            'any.only': `"tipo_notificacao" deve ser ARMADO, DESARMADO ou DISPARO.`
        }),
    id_alarme: Joi.string().uuid().required()
        .messages({
            'string.guid': `"id_alarme" deve ser um UUID válido.`,
            'any.required': `"id_alarme" é obrigatório.`
        }),
    id_usuario_acao: Joi.string().uuid().optional().allow(null, '') // Quem armou/desarmou
        .messages({
            'string.guid': `"id_usuario_acao" deve ser um UUID válido.`
        }),
    id_ponto_disparado: Joi.string().uuid().optional().allow(null, '') // Qual ponto disparou
        .messages({
            'string.guid': `"id_ponto_disparado" deve ser um UUID válido.`
        }),
    nome_ponto_disparado: Joi.string().optional().allow(null, ''), // Nome do ponto, para a mensagem
    descricao_alarme: Joi.string().optional().allow(null, ''), // Descrição do alarme, para a mensagem
    mensagem_customizada: Joi.string().optional().allow(null, '')
});


const validateBody = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true }); // allowUnknown para campos extras que não usamos mas podem vir
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return next(new ApiError(400, `Erro no corpo da requisição para notificação: ${errorMessage}`));
    }
    return next();
};

module.exports = {
    validateSendNotificationBody: validateBody(sendNotificationSchema),
};