const db = require('../db/database');

exports.create = (user, callback) => {
    const { nome, numero_celular } = user;
    const sql = 'INSERT INTO usuarios (nome, numero_celular) VALUES (?, ?)';
    db.run(sql, [nome, numero_celular], function(err) {
        callback(err, { id_usuario: this.lastID });
    });
};

exports.findById = (id, callback) => {
    const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?';
    db.get(sql, [id], callback);
};

exports.getAll = (callback) => {
    const sql = 'SELECT * FROM usuarios';
    db.all(sql, [], callback);
};

// Adicionar update e delete conforme necessário