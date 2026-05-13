const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');

class AuthController {
  // Manejar el inicio de sesión
  static async login(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ success: false, message: 'Por favor proporciona correo y contraseña' });
      }

      const user = await UserModel.findByEmail(correo);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas o cuenta no registrada' });
      }

      // Verificar si la contraseña coincide (si empieza con $2a$ o $2b$ es bcrypt)
      let isMatch = false;
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // Respaldo en caso de que hayan guardado la contraseña en texto plano
        isMatch = (password === user.password);
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }

      if (!user.estado) {
        return res.status(403).json({ success: false, message: 'Tu cuenta está inactiva. Contacta al administrador.' });
      }

      // Guardar sesión en cookie (firmada o simple para la demostración)
      res.cookie('auth_token', user.id_usuario, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('user_info', JSON.stringify({ nombre: user.nombre, correo: user.correo }), { maxAge: 24 * 60 * 60 * 1000 });

      return res.json({
        success: true,
        message: `¡Bienvenido de nuevo, ${user.nombre}!`,
        user: { id: user.id_usuario, nombre: user.nombre, correo: user.correo }
      });

    } catch (error) {
      console.error('Error en AuthController.login:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor al autenticar' });
    }
  }

  // Manejar el registro de usuarios
  static async register(req, res) {
    try {
      const { correo, password, nombre, apaterno, amaterno } = req.body;

      if (!correo || !password || !nombre || !apaterno) {
        return res.status(400).json({ success: false, message: 'Completa todos los campos obligatorios' });
      }

      // Verificar si el correo ya existe
      const existingUser = await UserModel.findByEmail(correo);
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado' });
      }

      // Encriptar la contraseña con bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await UserModel.create({
        correo,
        password: hashedPassword,
        nombre,
        apaterno,
        amaterno
      });

      // Autenticar automáticamente al nuevo usuario
      res.cookie('auth_token', newUser.id_usuario, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('user_info', JSON.stringify({ nombre: newUser.nombre, correo: newUser.correo }), { maxAge: 24 * 60 * 60 * 1000 });

      return res.status(201).json({
        success: true,
        message: '¡Cuenta creada con éxito! Redirigiendo al panel...',
        user: { id: newUser.id_usuario, nombre: newUser.nombre, correo: newUser.correo }
      });

    } catch (error) {
      console.error('Error en AuthController.register:', error);
      return res.status(500).json({ success: false, message: 'Error interno al registrar la cuenta' });
    }
  }

  // Verificar estado de la sesión actual
  static async checkStatus(req, res) {
    const userId = req.cookies.auth_token;
    if (!userId) {
      return res.json({ authenticated: false });
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.json({ authenticated: false });
      }

      return res.json({
        authenticated: true,
        user: { id: user.id_usuario, nombre: user.nombre, correo: user.correo }
      });
    } catch (error) {
      return res.json({ authenticated: false });
    }
  }

  // Cerrar sesión
  static logout(req, res) {
    res.clearCookie('auth_token');
    res.clearCookie('user_info');
    return res.json({ success: true, message: 'Sesión finalizada exitosamente' });
  }
}

module.exports = AuthController;
