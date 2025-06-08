const apiClient = require('../apiClient');
const ApiError = require('../errors/ApiError');

class TriggerController {
    async processAlarmTrigger(req, res, next) {
        const { id_alarme } = req.params;
        const { id_ponto, timestamp_disparo } = req.body;

        let pointDetails; // Para usar em logs e notificações

        try {
            // 1. Validar se o alarme e o ponto existem
            pointDetails = await apiClient.getMonitoredPointDetails(id_alarme, id_ponto);
            if (!pointDetails) {
                // A chamada apiClient.getMonitoredPointDetails já deve lançar ApiError 404
                // mas uma verificação adicional não prejudica.
                throw new ApiError(404, `Ponto monitorado com ID ${id_ponto} não encontrado para o alarme ${id_alarme}.`);
            }
            console.log(`[TriggerControl] Alarme ${id_alarme}, Ponto ${id_ponto} ('${pointDetails.nome_ponto}') validado.`);

            // 2. Atualizar o status do ponto para 'violado' no Alarms Service
            // Esta é uma etapa crítica. Se falhar, o disparo não deve ser totalmente processado.
            const updatedPoint = await apiClient.updateMonitoredPointStatus(id_alarme, id_ponto, 'violado');
            if (!updatedPoint) {
                throw new ApiError(500, `Falha ao atualizar o status do ponto ${id_ponto} para 'violado'.`);
            }
            console.log(`[TriggerControl] Status do ponto ${id_ponto} atualizado para 'violado'.`);

            // 3. Registrar o evento de disparo no Logging Service
            try {
                await apiClient.logEvent({
                    tipo_evento: 'DISPARO',
                    id_alarme: id_alarme,
                    id_ponto: id_ponto,
                    id_usuario: null, // Disparos geralmente não são associados a um usuário específico que o causou
                    detalhes: {
                        nome_ponto: pointDetails.nome_ponto,
                        timestamp_disparo: timestamp_disparo,
                        status_anterior: pointDetails.status_ponto, // Status antes da violação
                        origem: 'trigger-control-service'
                    }
                });
                console.log(`[TriggerControl] Evento DISPARO para alarme ${id_alarme}, ponto ${id_ponto} logado.`);
            } catch (logError) {
                console.warn(`[TriggerControl] Falha ao logar evento de disparo para alarme ${id_alarme}, ponto ${id_ponto}. Erro: ${logError.message}`);
                // Não parar o fluxo principal por falha no log
            }

            // 4. Enviar notificação para o Notification Service
            try {
                await apiClient.notifyUsers({
                    tipo_notificacao: 'DISPARO',
                    id_alarme: id_alarme,
                    id_ponto_disparado: id_ponto,
                    mensagem_customizada: `ALARME DISPARADO! Alarme: ${id_alarme}, Ponto: "${pointDetails.nome_ponto}" (${id_ponto}) foi violado em ${new Date(timestamp_disparo).toLocaleString()}.`
                });
                console.log(`[TriggerControl] Solicitação de notificação de DISPARO para alarme ${id_alarme}, ponto ${id_ponto} enviada.`);
            } catch (notifyError) {
                console.warn(`[TriggerControl] Falha ao solicitar notificação de disparo para alarme ${id_alarme}, ponto ${id_ponto}. Erro: ${notifyError.message}`);
            }

            res.status(200).json({
                success: true,
                message: `Alarme ${id_alarme} disparado com sucesso para o ponto "${pointDetails.nome_ponto}" (${id_ponto}).`
            });

        } catch (error) {
            // Erros críticos (validação de ponto, atualização de status) virão para cá
            next(error); // Passa para o error handler global
        }
    }
}

module.exports = new TriggerController();