const ConsultaModelo = require('../modelos/consultaModelo');

class ConsultaControlador {
  // Manejador central para despachar la consulta solicitada
  static async ejecutarConsulta(req, res) {
    const { id } = req.params;

    try {
      let datos = [];
      let titulo = '';

      switch (id) {
        case '1':
          datos = await ConsultaModelo.obtenerEmpleadosGenerales();
          titulo = 'Lista General de Empleados con Detalles';
          break;
        case '2':
          datos = await ConsultaModelo.obtenerSucursalesDirectorio();
          titulo = 'Directorio de Sucursales y Ubicaciones';
          break;
        case '3':
          datos = await ConsultaModelo.obtenerPuestosCatalogo();
          titulo = 'Catálogo de Puestos y Rangos Salariales';
          break;
        case '4':
          datos = await ConsultaModelo.obtenerEstadisticasDepartamentos();
          titulo = 'Estadísticas e Inversión por Departamento';
          break;
        case '5':
          datos = await ConsultaModelo.obtenerTopMejorPagados();
          titulo = 'Top 10 Empleados Mejor Pagados';
          break;
        case '6':
          datos = await ConsultaModelo.obtenerEstructuraGerencial();
          titulo = 'Estructura Gerencial y Cadena de Mando';
          break;
        case '7':
          datos = await ConsultaModelo.obtenerDistribucionGeografica();
          titulo = 'Distribución Geográfica de Sedes Corporativas';
          break;
        case '8':
          datos = await ConsultaModelo.obtenerGastoNominaSucursal();
          titulo = 'Gasto Total en Nómina por Sucursal';
          break;
        case '9':
          datos = await ConsultaModelo.obtenerAntiguedadEmpleados();
          titulo = 'Antigüedad y Fechas de Contratación';
          break;
        case '10':
          datos = await ConsultaModelo.obtenerUsuariosSistema();
          titulo = 'Cuentas de Usuario y Estado de Acceso';
          break;
        default:
          return res.status(404).json({ exito: false, mensaje: 'Consulta no identificada' });
      }

      return res.json({
        exito: true,
        titulo,
        total: datos.length,
        datos
      });

    } catch (error) {
      console.error(`Error al ejecutar la consulta ${id}:`, error);
      return res.status(500).json({ 
        exito: false, 
        mensaje: 'Error al consultar la base de datos PostgreSQL',
        error: error.message 
      });
    }
  }
}

module.exports = ConsultaControlador;
