CREATE TABLE IF NOT EXISTS alarmes (
    id_alarme INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao_local TEXT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios_alarmes (
    id_associacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_alarme INTEGER,
    id_usuario INTEGER,
    permissao TEXT, -- 'admin', 'usuario'
    FOREIGN KEY (id_alarme) REFERENCES alarmes(id_alarme) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) -- Assumindo que usuarios.id_usuario existe no users-service
);

CREATE TABLE IF NOT EXISTS pontos_monitorados (
    id_ponto INTEGER PRIMARY KEY AUTOINCREMENT,
    id_alarme INTEGER,
    nome_ponto TEXT NOT NULL,
    status_ponto TEXT DEFAULT 'normal', -- 'normal', 'violado'
    FOREIGN KEY (id_alarme) REFERENCES alarmes(id_alarme) ON DELETE CASCADE
);