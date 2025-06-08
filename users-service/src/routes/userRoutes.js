const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateCreateUser, validateUpdateUser } = require('../middlewares/validators/userValidator');

// Rotas Externas (prefixadas com /api pelo server.js)
router.post('/', validateCreateUser, userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Rotas Internas (prefixadas com /interno pelo server.js)
// Usadas por outros microservices, podem ter menos validações ou validações específicas
// e retornar apenas os dados estritamente necessários.
router.get('/:id/contato', userController.getUserContactInternal);


module.exports = router;