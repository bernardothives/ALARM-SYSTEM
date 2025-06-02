const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/usuarios', userController.createUser);
router.get('/usuarios', userController.getAllUsers);
router.get('/usuarios/:id', userController.getUserById);

// Rotas internas (exemplo)
router.get('/interno/usuarios/:id/contato', userController.getUserById); // Simplificado, idealmente retornaria só o contato

module.exports = router;