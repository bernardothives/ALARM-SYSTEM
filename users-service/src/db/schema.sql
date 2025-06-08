CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario TEXT PRIMARY KEY, -- UUID
    nome TEXT NOT NULL,
    numero_celular TEXT UNIQUE NOT NULL CHECK(length(numero_celular) >= 10), -- Validação básica
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar data_atualizacao (específico do SQLite)
CREATE TRIGGER IF NOT EXISTS update_usuarios_data_atualizacao
AFTER UPDATE ON usuarios
FOR EACH ROW
BEGIN
    UPDATE usuarios SET data_atualizacao = CURRENT_TIMESTAMP WHERE id_usuario = OLD.id_usuario;
END;