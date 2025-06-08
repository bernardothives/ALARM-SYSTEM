CREATE TABLE IF NOT EXISTS eventos_alarme (
    id_evento TEXT PRIMARY KEY, -- UUID
    timestamp_evento DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_evento TEXT NOT NULL CHECK(length(tipo_evento) > 0), -- Ex: 'ARMADO', 'DESARMADO', 'DISPARO', 'USUARIO_CRIADO'
    id_alarme TEXT, -- UUID do alarme, pode ser NULL para eventos não relacionados a um alarme específico
    id_usuario TEXT, -- UUID do usuário, pode ser NULL
    id_ponto TEXT, -- UUID do ponto monitorado, pode ser NULL
    detalhes TEXT -- JSON string com detalhes adicionais do evento
);

-- Índice para consultas comuns
CREATE INDEX IF NOT EXISTS idx_eventos_timestamp ON eventos_alarme (timestamp_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo_evento ON eventos_alarme (tipo_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_id_alarme ON eventos_alarme (id_alarme);