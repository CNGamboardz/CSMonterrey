const pool = require('../configuracion/base_datos');

class UsuarioModelo {
  // Buscar un usuario por su correo electrónico
  static async buscarPorCorreo(correo) {
    const consulta = 'SELECT * FROM tblusuarios WHERE correo = $1';
    const { rows } = await pool.query(consulta, [correo]);
    return rows[0];
  }

  // Buscar un usuario por su identificador único
  static async buscarPorId(id_usuario) {
    const consulta = 'SELECT * FROM tblusuarios WHERE id_usuario = $1';
    const { rows } = await pool.query(consulta, [id_usuario]);
    return rows[0];
  }

  // Registrar una nueva cuenta de usuario
  static async crear({ correo, password, nombre, apaterno, amaterno }) {
    // Generar un identificador con formato USR-XXXXX
    const numeroAleatorio = Math.floor(10000 + Math.random() * 90000);
    const id_usuario = `USR-${numeroAleatorio}`;

    const consulta = `
      INSERT INTO tblusuarios (id_usuario, correo, password, estado, nombre, apaterno, amaterno)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_usuario, correo, nombre, apaterno, estado
    `;

    const valores = [id_usuario, correo, password, true, nombre, apaterno, amaterno || null];
    const { rows } = await pool.query(consulta, valores);
    return rows[0];
  }
}

module.exports = UsuarioModelo;
