CREATE TABLE IF NOT EXISTS alarmes (
    id_alarme TEXT PRIMARY KEY, -- UUID
    descricao_local TEXT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER IF NOT EXISTS update_alarmes_data_atualizacao
AFTER UPDATE ON alarmes
FOR EACH ROW
BEGIN
    UPDATE alarmes SET data_atualizacao = CURRENT_TIMESTAMP WHERE id_alarme = OLD.id_alarme;
END;

CREATE TABLE IF NOT EXISTS usuarios_alarmes (
    id_associacao TEXT PRIMARY KEY, -- UUID
    id_alarme TEXT NOT NULL,
    id_usuario TEXT NOT NULL, -- UUID do usuário (vem do users-service)
    permissao TEXT NOT NULL CHECK(permissao IN ('admin', 'usuario')), -- 'admin', 'usuario'
    data_associacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_alarme) REFERENCES alarmes(id_alarme) ON DELETE CASCADE,
    UNIQUE (id_alarme, id_usuario) -- Um usuário só pode ser associado uma vez a um alarme
);

CREATE TABLE IF NOT EXISTS pontos_monitorados (
    id_ponto TEXT PRIMARY KEY, -- UUID
    id_alarme TEXT NOT NULL,
    nome_ponto TEXT NOT NULL,
    status_ponto TEXT DEFAULT 'normal' CHECK(status_ponto IN ('normal', 'violado')), -- 'normal', 'violado'
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_alarme) REFERENCES alarmes(id_alarme) ON DELETE CASCADE
);

CREATE TRIGGER IF NOT EXISTS update_pontos_monitorados_data_atualizacao
AFTER UPDATE ON pontos_monitorados
FOR EACH ROW
BEGIN
    UPDATE pontos_monitorados SET data_atualizacao = CURRENT_TIMESTAMP WHERE id_ponto = OLD.id_ponto;
END;