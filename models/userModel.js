const pool = require('../config/database');

class UserModel {
  // Buscar un usuario por su correo electrónico
  static async findByEmail(correo) {
    const query = 'SELECT * FROM tblusuarios WHERE correo = $1';
    const { rows } = await pool.query(query, [correo]);
    return rows[0];
  }

  // Buscar un usuario por su ID
  static async findById(id_usuario) {
    const query = 'SELECT * FROM tblusuarios WHERE id_usuario = $1';
    const { rows } = await pool.query(query, [id_usuario]);
    return rows[0];
  }

  // Crear un nuevo usuario
  static async create({ correo, password, nombre, apaterno, amaterno }) {
    // Generar un id_usuario aleatorio con formato USR-XXXXX (longitud máx 9)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const id_usuario = `USR-${randomNum}`;

    const query = `
      INSERT INTO tblusuarios (id_usuario, correo, password, estado, nombre, apaterno, amaterno)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_usuario, correo, nombre, apaterno, estado
    `;

    const values = [id_usuario, correo, password, true, nombre, apaterno, amaterno || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = UserModel;
