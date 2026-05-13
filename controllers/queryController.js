const QueryModel = require('../models/queryModel');

class QueryController {
  // Manejador central para despachar la consulta solicitada
  static async executeQuery(req, res) {
    const { id } = req.params;

    try {
      let data = [];
      let title = '';

      switch (id) {
        case '1':
          data = await QueryModel.getEmpleadosGenerales();
          title = 'Lista General de Empleados con Detalles';
          break;
        case '2':
          data = await QueryModel.getSucursalesDirectorio();
          title = 'Directorio de Sucursales y Ubicaciones';
          break;
        case '3':
          data = await QueryModel.getPuestosCatalogo();
          title = 'Catálogo de Puestos y Rangos Salariales';
          break;
        case '4':
          data = await QueryModel.getEstadisticasDepartamentos();
          title = 'Estadísticas e Inversión por Departamento';
          break;
        case '5':
          data = await QueryModel.getTopMejorPagados();
          title = 'Top 10 Empleados Mejor Pagados';
          break;
        case '6':
          data = await QueryModel.getEstructuraGerencial();
          title = 'Estructura Gerencial y Cadena de Mando';
          break;
        case '7':
          data = await QueryModel.getDistribucionGeografica();
          title = 'Distribución Geográfica de Sedes Corporativas';
          break;
        case '8':
          data = await QueryModel.getGastoNominaSucursal();
          title = 'Gasto Total en Nómina por Sucursal';
          break;
        case '9':
          data = await QueryModel.getAntiguedadEmpleados();
          title = 'Antigüedad y Fechas de Contratación';
          break;
        case '10':
          data = await QueryModel.getUsuariosSistema();
          title = 'Cuentas de Usuario y Estado de Acceso';
          break;
        default:
          return res.status(404).json({ success: false, message: 'Consulta no identificada' });
      }

      return res.json({
        success: true,
        title,
        count: data.length,
        data
      });

    } catch (error) {
      console.error(`Error al ejecutar la consulta ${id}:`, error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al consultar la base de datos PostgreSQL',
        error: error.message 
      });
    }
  }
}

module.exports = QueryController;
