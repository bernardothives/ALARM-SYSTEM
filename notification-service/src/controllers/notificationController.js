const apiClient = require('../apiClient');
const ApiError = require('../errors/ApiError'); // Embora o apiClient tente não lançar, o controller pode.

class NotificationController {
    async sendNotification(req, res, next) {
        const {
            tipo_notificacao,
            id_alarme,
            id_usuario_acao, // Opcional
            id_ponto_disparado, // Opcional
            nome_ponto_disparado, // Opcional, vindo do trigger-control
            descricao_alarme, // Opcional, vindo do activation-control
            mensagem_customizada // Opcional
        } = req.body;

        let notificationCount = 0;
        let failedUserLookups = 0;

        try {
            console.log(`[NotificationService] Processando notificação: Tipo=${tipo_notificacao}, Alarme=${id_alarme}`);

            const usersToNotify = await apiClient.getUsersForAlarm(id_alarme);

            if (!usersToNotify || usersToNotify.length === 0) {
                console.log(`[NotificationService] Nenhum usuário encontrado para o alarme ${id_alarme}. Nenhuma notificação enviada.`);
                return res.status(200).json({ success: true, message: 'Nenhum usuário para notificar ou alarme não encontrado.', notifications_sent: 0 });
            }

            console.log(`[NotificationService] ${usersToNotify.length} usuário(s) encontrado(s) para o alarme ${id_alarme}.`);

            for (const alarmUser of usersToNotify) {
                const userContactNumber = await apiClient.getUserContactDetails(alarmUser.id_usuario);

                if (userContactNumber) {
                    let message = mensagem_customizada;
                    if (!message) {
                        // Construir mensagem padrão se não houver customizada
                        const alarmRef = descricao_alarme ? `"${descricao_alarme}" (${id_alarme})` : `Alarme ${id_alarme}`;
                        switch (tipo_notificacao) {
                            case 'ARMADO':
                                message = `Alerta: ${alarmRef} foi ARMADO.`;
                                if (id_usuario_acao) message += ` (ID Usuário: ${id_usuario_acao})`;
                                break;
                            case 'DESARMADO':
                                message = `Alerta: ${alarmRef} foi DESARMADO.`;
                                if (id_usuario_acao) message += ` (ID Usuário: ${id_usuario_acao})`;
                                break;
                            case 'DISPARO':
                                const pontoRef = nome_ponto_disparado ? `"${nome_ponto_disparado}" (${id_ponto_disparado})` : `Ponto ${id_ponto_disparado}`;
                                message = `URGENTE! ${alarmRef} DISPAROU! Ponto: ${pontoRef} violado.`;
                                break;
                            default:
                                message = `Evento ${tipo_notificacao} no alarme ${id_alarme}.`;
                        }
                    }

                    // SIMULAÇÃO DE ENVIO
                    console.log(`---> [SIMULATED NOTIFICATION to ${userContactNumber}]: ${message}`);
                    notificationCount++;
                } else {
                    failedUserLookups++;
                    console.warn(`[NotificationService] Não foi possível obter o número de contato para o usuário ${alarmUser.id_usuario} do alarme ${id_alarme}.`);
                }
            }

            const summaryMessage = `Processamento de notificações concluído para alarme ${id_alarme}. Enviadas: ${notificationCount}. Falhas na busca de contato: ${failedUserLookups}.`;
            console.log(`[NotificationService] ${summaryMessage}`);
            res.status(200).json({ success: true, message: summaryMessage, notifications_sent: notificationCount, contact_lookup_failures: failedUserLookups });

        } catch (error) {
            // Erro inesperado no próprio notification service (não vindo do apiClient)
            console.error(`[NotificationService] Erro geral ao processar notificações para alarme ${id_alarme}:`, error);
            next(new ApiError(500, "Erro interno ao processar notificações.", false, error.stack));
        }
    }
}

module.exports = new NotificationController();