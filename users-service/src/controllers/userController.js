const UserModel = require('../models/userModel');

exports.createUser = (req, res) => {
    UserModel.create(req.body, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create user', details: err.message });
        }
        res.status(201).json(user);
    });
};

exports.getUserById = (req, res) => {
    UserModel.findById(req.params.id, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to get user' });
        }
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
};

exports.getAllUsers = (req, res) => {
    UserModel.getAll((err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to get users' });
        }
        res.json(users);
    });
};  