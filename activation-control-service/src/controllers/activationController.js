const apiClient = require('../apiClient');
const ApiError = require('../errors/ApiError');

class ActivationController {
    async handleActivation(req, res, next, actionType) { // actionType: 'ARMADO' ou 'DESARMADO'
        const { id_alarme } = req.params;
        const { id_usuario_acionador, metodo } = req.body;

        try {
            // 1. Validar se o alarme existe (opcional, mas bom para consistência)
            const alarmDetails = await apiClient.getAlarmDetails(id_alarme);
            if (!alarmDetails) {
                // getAlarmDetails já lança ApiError com 404 se não encontrar,
                // mas podemos adicionar uma verificação explícita se a lógica do apiClient mudar.
                throw new ApiError(404, `Alarme com ID ${id_alarme} não encontrado.`);
            }
            console.log(`[ActivationControl] Alarme ${id_alarme} encontrado: ${alarmDetails.descricao_local}`);

            // 2. Registrar o evento no Logging Service
            // Mesmo que falhe, o processo principal de notificação pode continuar (decisão de negócio)
            try {
                await apiClient.logEvent({
                    tipo_evento: actionType,
                    id_alarme: id_alarme,
                    id_usuario: id_usuario_acionador || null, // Pode ser null
                    detalhes: {
                        metodo: metodo || 'api_direta', // 'api_direta' se não especificado
                        origem: 'activation-control-service'
                    }
                });
                console.log(`[ActivationControl] Evento ${actionType} para alarme ${id_alarme} logado.`);
            } catch (logError) {
                console.warn(`[ActivationControl] Falha ao logar evento para alarme ${id_alarme}, continuando... Erro: ${logError.message}`);
                // Não relançar o erro para não parar o fluxo principal por falha no log
            }

            // 3. Enviar notificação para o Notification Service
            // Mesmo que falhe, a operação de armar/desarmar é considerada "bem-sucedida"
            try {
                await apiClient.notifyUsers({
                    tipo_notificacao: actionType,
                    id_alarme: id_alarme,
                    id_usuario_acao: id_usuario_acionador || null,
                    mensagem_customizada: `Alarme "${alarmDetails.descricao_local}" (${id_alarme}) foi ${actionType.toLowerCase()}.`
                });
                console.log(`[ActivationControl] Solicitação de notificação para ${actionType} do alarme ${id_alarme} enviada.`);
            } catch (notifyError) {
                console.warn(`[ActivationControl] Falha ao solicitar notificação para alarme ${id_alarme}, continuando... Erro: ${notifyError.message}`);
            }

            res.status(200).json({
                success: true,
                message: `Alarme "${alarmDetails.descricao_local}" (${id_alarme}) ${actionType.toLowerCase()} com sucesso.`
            });

        } catch (error) {
            // Se getAlarmDetails ou outra lógica crítica falhar, o erro será pego aqui
            next(error); // Passa para o error handler global
        }
    }

    armAlarm(req, res, next) {
        this.handleActivation(req, res, next, 'ARMADO');
    }

    disarmAlarm(req, res, next) {
        this.handleActivation(req, res, next, 'DESARMADO');
    }
}

// Exportar instância para manter o 'this' correto se usar arrow functions nos handlers de rota.
module.exports = new ActivationController();