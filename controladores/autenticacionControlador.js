const bcrypt = require('bcryptjs');
const UsuarioModelo = require('../modelos/usuarioModelo');

class AutenticacionControlador {
  // Manejar el inicio de sesión
  static async iniciarSesion(req, res) {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ exito: false, mensaje: 'Por favor proporciona correo y contraseña' });
      }

      const usuario = await UsuarioModelo.buscarPorCorreo(correo);
      if (!usuario) {
        return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas o cuenta no registrada' });
      }

      // Verificar si la contraseña coincide
      let coincide = false;
      if (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) {
        coincide = await bcrypt.compare(password, usuario.password);
      } else {
        coincide = (password === usuario.password);
      }

      if (!coincide) {
        return res.status(401).json({ exito: false, mensaje: 'Credenciales inválidas' });
      }

      if (!usuario.estado) {
        return res.status(403).json({ exito: false, mensaje: 'Tu cuenta está inactiva. Contacta al administrador.' });
      }

      // Guardar sesión en cookies en español
      res.cookie('token_acceso', usuario.id_usuario, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('info_usuario', JSON.stringify({ nombre: usuario.nombre, correo: usuario.correo }), { maxAge: 24 * 60 * 60 * 1000 });

      return res.json({
        exito: true,
        mensaje: `¡Bienvenido de nuevo, ${usuario.nombre}!`,
        usuario: { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo }
      });

    } catch (error) {
      console.error('Error en AutenticacionControlador.iniciarSesion:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error interno del servidor al autenticar' });
    }
  }

  // Manejar el registro de nuevos usuarios
  static async registrar(req, res) {
    try {
      const { correo, password, nombre, apaterno, amaterno } = req.body;

      if (!correo || !password || !nombre || !apaterno) {
        return res.status(400).json({ exito: false, mensaje: 'Completa todos los campos obligatorios' });
      }

      const usuarioExistente = await UsuarioModelo.buscarPorCorreo(correo);
      if (usuarioExistente) {
        return res.status(409).json({ exito: false, mensaje: 'El correo electrónico ya está registrado' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordEncriptada = await bcrypt.hash(password, salt);

      const nuevoUsuario = await UsuarioModelo.crear({
        correo,
        password: passwordEncriptada,
        nombre,
        apaterno,
        amaterno
      });

      res.cookie('token_acceso', nuevoUsuario.id_usuario, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie('info_usuario', JSON.stringify({ nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo }), { maxAge: 24 * 60 * 60 * 1000 });

      return res.status(201).json({
        exito: true,
        mensaje: '¡Cuenta creada con éxito! Redirigiendo...',
        usuario: { id: nuevoUsuario.id_usuario, nombre: nuevoUsuario.nombre, correo: nuevoUsuario.correo }
      });

    } catch (error) {
      console.error('Error en AutenticacionControlador.registrar:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error interno al registrar la cuenta' });
    }
  }

  // Cerrar sesión
  static cerrarSesion(req, res) {
    res.clearCookie('token_acceso');
    res.clearCookie('info_usuario');
    return res.json({ exito: true, mensaje: 'Sesión finalizada exitosamente' });
  }
}

module.exports = AutenticacionControlador;
