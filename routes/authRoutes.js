const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();

// Rutas POST para inicio de sesión y registro
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Rutas GET para consulta de estado de sesión y cierre de sesión
router.get('/status', AuthController.checkStatus);
router.get('/logout', AuthController.logout);

module.exports = router;
