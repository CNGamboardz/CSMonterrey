const pool = require('../config/database');

class QueryModel {
  // 1. Lista General de Empleados
  static async getEmpleadosGenerales() {
    const query = `
      SELECT 
        e.id_empleado AS "ID Empleado", 
        e.nombre || ' ' || e.apaterno AS "Empleado", 
        p.nombre_puesto AS "Puesto", 
        d.nombre_departamento AS "Departamento", 
        s.nombre_sucursal AS "Sucursal", 
        e.salario AS "Salario Mensual" 
      FROM tblempleados e 
      JOIN tblpuestos p ON e.id_puesto = p.id_puesto 
      JOIN tbldepartamentos d ON e.id_departamento = d.id_departamento 
      JOIN tblsucursales s ON e.id_sucursal = s.id_sucursal 
      ORDER BY e.id_empleado;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 2. Directorio de Sucursales y Ubicaciones
  static async getSucursalesDirectorio() {
    const query = `
      SELECT 
        s.id_sucursal AS "No. Sucursal", 
        s.nombre_sucursal AS "Nombre de Sucursal", 
        s.direccion AS "Dirección", 
        c.nombre_ciudad AS "Ciudad", 
        es.nombre_estado AS "Estado", 
        d.nombre_departamento AS "Depto. Asignado" 
      FROM tblsucursales s 
      JOIN tblciudades c ON s.id_ciudad = c.id_ciudad 
      JOIN tblestados es ON c.id_estado = es.id_estado 
      JOIN tbldepartamentos d ON s.id_departamento = d.id_departamento 
      ORDER BY s.id_sucursal;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 3. Catálogo de Puestos y Rangos Salariales
  static async getPuestosCatalogo() {
    const query = `
      SELECT 
        id_puesto AS "Código Puesto", 
        nombre_puesto AS "Denominación del Puesto", 
        salario_min AS "Salario Mínimo", 
        salario_max AS "Salario Máximo" 
      FROM tblpuestos 
      ORDER BY salario_max DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 4. Estadísticas por Departamento
  static async getEstadisticasDepartamentos() {
    const query = `
      SELECT 
        d.nombre_departamento AS "Departamento", 
        COUNT(e.id_empleado) AS "Total Empleados", 
        COALESCE(ROUND(AVG(e.salario), 2), 0) AS "Salario Promedio", 
        COALESCE(SUM(e.salario), 0) AS "Nómina Mensual" 
      FROM tbldepartamentos d 
      LEFT JOIN tblempleados e ON d.id_departamento = e.id_departamento 
      GROUP BY d.nombre_departamento 
      ORDER BY "Nómina Mensual" DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 5. Top Empleados Mejor Pagados
  static async getTopMejorPagados() {
    const query = `
      SELECT 
        e.id_empleado AS "ID", 
        e.nombre || ' ' || e.apaterno AS "Nombre del Empleado", 
        p.nombre_puesto AS "Cargo", 
        s.nombre_sucursal AS "Sucursal de Base", 
        e.salario AS "Salario Registrado" 
      FROM tblempleados e 
      JOIN tblpuestos p ON e.id_puesto = p.id_puesto 
      JOIN tblsucursales s ON e.id_sucursal = s.id_sucursal 
      ORDER BY e.salario DESC 
      LIMIT 10;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 6. Estructura Gerencial (Cadena de mando)
  static async getEstructuraGerencial() {
    const query = `
      SELECT 
        e.id_empleado AS "ID Empleado", 
        e.nombre || ' ' || e.apaterno AS "Subordinado", 
        p.nombre_puesto AS "Puesto Subordinado", 
        COALESCE(g.nombre || ' ' || g.apaterno, 'Sin Superior (CEO)') AS "Gerente Directo" 
      FROM tblempleados e 
      LEFT JOIN tblempleados g ON e.id_gerente = g.id_empleado 
      JOIN tblpuestos p ON e.id_puesto = p.id_puesto 
      ORDER BY e.id_gerente NULLS FIRST, e.id_empleado;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 7. Distribución Geográfica de Sedes
  static async getDistribucionGeografica() {
    const query = `
      SELECT 
        c.id_ciudad AS "ID Ciudad", 
        c.nombre_ciudad AS "Ciudad / Municipio", 
        e.nombre_estado AS "Estado de la República" 
      FROM tblciudades c 
      JOIN tblestados e ON c.id_estado = e.id_estado 
      ORDER BY e.nombre_estado, c.nombre_ciudad;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 8. Gasto en Nómina por Sucursal
  static async getGastoNominaSucursal() {
    const query = `
      SELECT 
        s.nombre_sucursal AS "Sucursal", 
        c.nombre_ciudad AS "Ciudad Ubicación", 
        COUNT(e.id_empleado) AS "Plantilla Activa", 
        COALESCE(SUM(e.salario), 0) AS "Inversión en Nómina" 
      FROM tblsucursales s 
      JOIN tblciudades c ON s.id_ciudad = c.id_ciudad 
      LEFT JOIN tblempleados e ON s.id_sucursal = e.id_sucursal 
      GROUP BY s.nombre_sucursal, c.nombre_ciudad 
      ORDER BY "Inversión en Nómina" DESC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 9. Antigüedad y Fechas de Contratación
  static async getAntiguedadEmpleados() {
    const query = `
      SELECT 
        id_empleado AS "ID", 
        nombre || ' ' || apaterno AS "Empleado", 
        TO_CHAR(fecha_contratacion, 'YYYY-MM-DD') AS "Fecha Contratación", 
        salario AS "Salario Actual" 
      FROM tblempleados 
      ORDER BY fecha_contratacion ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  // 10. Directorio de Cuentas de Usuario del Sistema
  static async getUsuariosSistema() {
    const query = `
      SELECT 
        id_usuario AS "ID Usuario", 
        correo AS "Correo Electrónico", 
        nombre || ' ' || apaterno AS "Nombre Registrado", 
        CASE WHEN estado = true THEN 'Activo' ELSE 'Inactivo' END AS "Estado de Cuenta" 
      FROM tblusuarios 
      ORDER BY id_usuario;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }
}

module.exports = QueryModel;
