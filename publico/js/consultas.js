document.addEventListener('DOMContentLoaded', () => {
  let idConsultaActual = '1';
  let datosActuales = [];
  let filasFiltradas = [];
  let tituloActual = '';
  let logoBase64 = null;

  // Variables de paginación y ordenamiento
  let paginaActual = 1;
  const filasPorPagina = 10;
  let columnaOrden = null;
  let ordenAscendente = true;

  // 1. Extraer nombre real del perfil desde la cookie correcta 'info_usuario'
  let usuarioActivo = 'Administrador Ejecutivo';
  const cookies = document.cookie.split(';');
  cookies.forEach(c => {
    const [nombre, valor] = c.trim().split('=');
    if (nombre === 'info_usuario' && valor) {
      try {
        const info = JSON.parse(decodeURIComponent(valor));
        if (info && info.nombre) {
          usuarioActivo = info.nombre;
        }
      } catch (e) {
        console.warn('No se pudo decodificar info_usuario en consultas');
      }
    }
  });

  const etiquetaUsuarioConsulta = document.getElementById('etiquetaUsuarioConsulta');
  if (etiquetaUsuarioConsulta) {
    etiquetaUsuarioConsulta.innerHTML = `<strong>${usuarioActivo}</strong>`;
  }

  // 2. Reloj en tiempo real dinámico en la cabecera
  const cabeceraDerecha = document.querySelector('header div');
  if (cabeceraDerecha && etiquetaUsuarioConsulta) {
    const relojElemento = document.createElement('span');
    relojElemento.style.color = '#94a3b8';
    relojElemento.style.fontSize = '0.9rem';
    relojElemento.style.fontWeight = '600';
    cabeceraDerecha.insertBefore(relojElemento, etiquetaUsuarioConsulta);

    const actualizarReloj = () => {
      const ahora = new Date();
      relojElemento.innerText = `⌚ ${ahora.toLocaleTimeString('es-MX')}`;
    };
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
  }

  // Pre-cargar el logotipo oficial a formato Base64 para incrustarlo de forma transparente y nativa en jsPDF
  const precargarLogoBase64 = () => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = '/LogoApp.png';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      logoBase64 = canvas.toDataURL('image/png');
    };
    img.onerror = () => {
      console.warn('No se pudo convertir LogoApp.png a Base64 para el PDF.');
    };
  };
  precargarLogoBase64();

  // Cerrar sesión de forma segura desde la vista de consultas
  const botonCerrarSesion = document.getElementById('botonCerrarSesion');
  if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener('click', async () => {
      try {
        await fetch('/api/autenticacion/salir', { method: 'POST' });
        document.cookie = "token_acceso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "info_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/login';
      } catch (err) {
        document.cookie = "token_acceso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "info_usuario=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/login';
      }
    });
  }

  const enlaces = document.querySelectorAll('.supervinculo');
  const tituloVistaActual = document.getElementById('tituloVistaActual');
  const subtituloVistaActual = document.getElementById('subtituloVistaActual');
  const areaRenderizado = document.getElementById('areaRenderizado');
  const botonDescargarPdf = document.getElementById('botonDescargarPdf');
  const botonExportarCsv = document.getElementById('botonExportarCsv');
  const botonExportarJson = document.getElementById('botonExportarJson');
  const buscadorTabla = document.getElementById('buscadorTabla');
  const contadorFilas = document.getElementById('contadorFilas');
  const contenedorPaginacion = document.getElementById('contenedorPaginacion');

  // Función para cargar una vista desde PostgreSQL a través de la API
  const cargarVista = async (id) => {
    idConsultaActual = id;
    
    // Reiniciar estados interactivos
    paginaActual = 1;
    columnaOrden = null;
    ordenAscendente = true;
    if (buscadorTabla) buscadorTabla.value = '';

    // Actualizar clases de los botones en la barra lateral
    enlaces.forEach(enlace => {
      if (enlace.getAttribute('data-id') === id) {
        enlace.classList.add('activo');
      } else {
        enlace.classList.remove('activo');
      }
    });

    tituloVistaActual.innerText = 'Consultando base de datos...';
    subtituloVistaActual.innerText = 'Obteniendo registros de PostgreSQL';
    areaRenderizado.innerHTML = '<div class="cargando"><div class="spinner"></div></div>';
    contadorFilas.innerText = 'Cargando...';
    contenedorPaginacion.innerHTML = '';

    try {
      const respuesta = await fetch(`/api/consultas/${id}`);
      const resultado = await respuesta.json();

      if (resultado.exito) {
        // Enriquecer datos inyectando un número secuencial (#) a cada fila
        datosActuales = resultado.datos.map((f, i) => ({ '#': i + 1, ...f }));
        filasFiltradas = [...datosActuales];
        tituloActual = resultado.titulo;

        tituloVistaActual.innerText = resultado.titulo;
        subtituloVistaActual.innerText = `Consulta directa exitosa`;
        
        actualizarVista();
      } else {
        mostrarVacio('Error en consulta SQL', resultado.mensaje || 'Revisa la consola del servidor');
      }
    } catch (err) {
      mostrarVacio('Fallo de conexión', 'No se pudo contactar al backend de PostgreSQL local');
    }
  };

  // Función maestra para procesar paginación y renderizado
  const actualizarVista = () => {
    contadorFilas.innerHTML = `Mostrando <strong>${filasFiltradas.length}</strong> de ${datosActuales.length} registros`;

    if (filasFiltradas.length === 0) {
      areaRenderizado.innerHTML = `
        <div class="estado-vacio">
          <h3>Sin coincidencias</h3>
          <p>Ninguna fila cumple con los criterios de búsqueda actuales.</p>
          <button id="botonLimpiarFiltros" style="margin-top:1rem;padding:0.5rem 1rem;background:#0a192f;color:#fff;border:none;border-radius:6px;cursor:pointer;">Restablecer Vista</button>
        </div>
      `;
      contenedorPaginacion.innerHTML = '';
      const btnLimpiar = document.getElementById('botonLimpiarFiltros');
      if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
          if (buscadorTabla) buscadorTabla.value = '';
          filasFiltradas = [...datosActuales];
          actualizarVista();
        });
      }
      return;
    }

    // Paginación
    const totalPaginas = Math.ceil(filasFiltradas.length / filasPorPagina);
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;

    const indiceInicio = (paginaActual - 1) * filasPorPagina;
    const filasPagina = filasFiltradas.slice(indiceInicio, indiceInicio + filasPorPagina);

    dibujarTabla(filasPagina);
    dibujarPaginacion(totalPaginas);
  };

  // Renderizar la estructura HTML de la tabla interactiva
  const dibujarTabla = (filas) => {
    const columnas = Object.keys(filasFiltradas[0] || {});

    let html = `
      <table class="tabla-datos">
        <thead>
          <tr>
            ${columnas.map(col => {
              let flecha = '';
              if (columnaOrden === col) {
                flecha = `<span class="indicador-orden">${ordenAscendente ? '▲' : '▼'}</span>`;
              }
              return `<th data-col="${col}" title="Haz clic para ordenar por esta columna">${col} ${flecha}</th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    filas.forEach(fila => {
      html += '<tr>';
      columnas.forEach(col => {
        let valor = fila[col];
        
        if (valor === null || valor === undefined) {
          valor = '<span style="color:#94a3b8;">N/A</span>';
        } else if (col === '#') {
          valor = `<strong>${valor}</strong>`;
        } else if (typeof valor === 'boolean' || valor === 'Activo' || valor === 'Inactivo') {
          const esActivo = valor === true || valor === 'Activo';
          valor = `<span class="badge ${esActivo ? 'badge-activo' : 'badge-inactivo'}">${esActivo ? 'Activo' : 'Inactivo'}</span>`;
        } else if ((col.toLowerCase().includes('salario') || col.toLowerCase().includes('nómina')) && !isNaN(valor)) {
          valor = `$${Number(valor).toLocaleString('es-MX')}`;
        }

        html += `<td>${valor}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    areaRenderizado.innerHTML = html;

    // Escuchar clics en encabezados para ordenar de forma súper interactiva
    document.querySelectorAll('.tabla-datos th').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.getAttribute('data-col');
        if (columnaOrden === col) {
          ordenAscendente = !ordenAscendente;
        } else {
          columnaOrden = col;
          ordenAscendente = true;
        }

        filasFiltradas.sort((a, b) => {
          let valA = a[columnaOrden];
          let valB = b[columnaOrden];

          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          if (typeof valA === 'string') {
            return ordenAscendente 
              ? String(valA).localeCompare(String(valB)) 
              : String(valB).localeCompare(String(valA));
          }

          return ordenAscendente ? (valA - valB) : (valB - valA);
        });

        actualizarVista();
      });
    });
  };

  // Construir la botonera inferior de páginas
  const dibujarPaginacion = (totalPaginas) => {
    if (totalPaginas <= 1) {
      contenedorPaginacion.innerHTML = '';
      return;
    }

    let botones = `
      <span style="color:#64748b; font-size:0.85rem;">Página <strong>${paginaActual}</strong> de ${totalPaginas}</span>
      <div class="botones-paginacion">
        <button class="boton-pag" id="pagAnterior" ${paginaActual === 1 ? 'disabled' : ''}>Anterior</button>
    `;

    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
        botones += `<button class="boton-pag ${i === paginaActual ? 'activo' : ''}" data-pag="${i}">${i}</button>`;
      } else if (i === paginaActual - 2 || i === paginaActual + 2) {
        botones += `<span style="padding:0.2rem 0.4rem;color:#cbd5e1;">...</span>`;
      }
    }

    botones += `
        <button class="boton-pag" id="pagSiguiente" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente</button>
      </div>
    `;

    contenedorPaginacion.innerHTML = botones;

    if (document.getElementById('pagAnterior')) {
      document.getElementById('pagAnterior').addEventListener('click', () => {
        if (paginaActual > 1) { paginaActual--; actualizarVista(); }
      });
    }
    if (document.getElementById('pagSiguiente')) {
      document.getElementById('pagSiguiente').addEventListener('click', () => {
        if (paginaActual < totalPaginas) { paginaActual++; actualizarVista(); }
      });
    }
    contenedorPaginacion.querySelectorAll('button[data-pag]').forEach(b => {
      b.addEventListener('click', () => {
        paginaActual = Number(b.getAttribute('data-pag'));
        actualizarVista();
      });
    });
  };

  const mostrarVacio = (titulo, mensaje) => {
    tituloVistaActual.innerText = titulo;
    subtituloVistaActual.innerText = '';
    contadorFilas.innerText = '0 registros';
    areaRenderizado.innerHTML = `
      <div class="estado-vacio">
        <h3 style="color:#0a192f; font-size:1.3rem; margin-bottom:0.5rem;">${titulo}</h3>
        <p>${mensaje}</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
  };

  // Búsqueda en tiempo real sobre el arreglo local
  if (buscadorTabla) {
    buscadorTabla.addEventListener('input', (e) => {
      const termino = e.target.value.toLowerCase().trim();
      paginaActual = 1;

      if (!termino) {
        filasFiltradas = [...datosActuales];
      } else {
        filasFiltradas = datosActuales.filter(fila => {
          return Object.values(fila).some(valor => {
            if (valor === null || valor === undefined) return false;
            return String(valor).toLowerCase().includes(termino);
          });
        });
      }

      if (columnaOrden) {
        filasFiltradas.sort((a, b) => {
          let valA = a[columnaOrden]; let valB = b[columnaOrden];
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;
          if (typeof valA === 'string') return ordenAscendente ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
          return ordenAscendente ? (valA - valB) : (valB - valA);
        });
      }

      actualizarVista();
    });
  }

  // Opciones de exportación complementaria: Excel (CSV)
  if (botonExportarCsv) {
    botonExportarCsv.addEventListener('click', () => {
      const filasAExportar = filasFiltradas.length > 0 ? filasFiltradas : datosActuales;
      if (filasAExportar.length === 0) return alert('No hay datos para exportar.');

      const columnas = Object.keys(filasAExportar[0]);
      let contenidoCsv = columnas.join(',') + '\n';

      filasAExportar.forEach(fila => {
        const valoresFila = columnas.map(col => {
          let val = fila[col];
          if (val === null || val === undefined) return '""';
          val = String(val).replace(/"/g, '""');
          if (val.includes(',') || val.includes('\n')) return `"${val}"`;
          return val;
        });
        contenidoCsv += valoresFila.join(',') + '\n';
      });

      const blob = new Blob(['\ufeff' + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `csmonterrey_${tituloActual.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Opciones de exportación complementaria: JSON
  if (botonExportarJson) {
    botonExportarJson.addEventListener('click', () => {
      const filasAExportar = filasFiltradas.length > 0 ? filasFiltradas : datosActuales;
      if (filasAExportar.length === 0) return alert('No hay datos para exportar.');

      const blob = new Blob([JSON.stringify(filasAExportar, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `csmonterrey_${tituloActual.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // Generación nativa de reporte PDF de alto nivel utilizando jsPDF + autoTable
  if (botonDescargarPdf) {
    botonDescargarPdf.addEventListener('click', () => {
      const filasAExportar = filasFiltradas.length > 0 ? filasFiltradas : datosActuales;
      if (!filasAExportar || filasAExportar.length === 0) {
        alert('No hay registros en pantalla para construir el documento PDF.');
        return;
      }

      const htmlOriginal = botonDescargarPdf.innerHTML;
      botonDescargarPdf.innerHTML = 'Generando Membrete...';
      botonDescargarPdf.disabled = true;

      setTimeout(() => {
        try {
          const { jsPDF } = window.jspdf;
          const documento = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

          documento.setFillColor(10, 25, 47);
          documento.rect(0, 0, documento.internal.pageSize.width, 110, 'F');

          let inicioTextoX = 40;
          if (logoBase64) {
            documento.addImage(logoBase64, 'PNG', 40, 25, 60, 60);
            inicioTextoX = 115;
          }

          documento.setTextColor(255, 255, 255);
          documento.setFont('helvetica', 'bold');
          documento.setFontSize(22);
          documento.text('REPORTE CORPORATIVO CSMONTERREY', inicioTextoX, 48);

          documento.setFontSize(13);
          documento.setFont('helvetica', 'normal');
          documento.text(`Módulo de Datos: ${tituloActual}`, inicioTextoX, 72);

          documento.setFontSize(10);
          documento.setTextColor(200, 215, 240);
          documento.text(`Generado por: ${usuarioActivo} | Motor: PostgreSQL (bdmonterrey)`, inicioTextoX, 90);

          const columnas = Object.keys(filasAExportar[0]);
          let sumaSalarios = 0;
          let columnaSalarialEncontrada = false;

          const filasTabla = filasAExportar.map(fila => {
            return columnas.map(col => {
              const val = fila[col];
              if (val === null || val === undefined) return 'N/A';
              if (typeof val === 'boolean') return val ? 'Activo' : 'Inactivo';
              
              if ((col.toLowerCase().includes('salario') || col.toLowerCase().includes('nómina') || col.toLowerCase().includes('presupuesto')) && !isNaN(val)) {
                columnaSalarialEncontrada = true;
                sumaSalarios += Number(val);
                return `$${Number(val).toLocaleString('es-MX')}`;
              }
              return String(val);
            });
          });

          documento.autoTable({
            startY: 130,
            head: [columnas],
            body: filasTabla,
            theme: 'grid',
            headStyles: {
              fillColor: [10, 25, 47],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 10
            },
            bodyStyles: {
              fontSize: 9,
              textColor: [40, 50, 65]
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252]
            },
            margin: { left: 40, right: 40, bottom: 60 },
            didDrawPage: function(datosPaginacion) {
              const altoTotal = documento.internal.pageSize.height;
              const anchoTotal = documento.internal.pageSize.width;

              documento.setFontSize(8);
              documento.setTextColor(140, 150, 165);
              
              const textoFiltro = buscadorTabla && buscadorTabla.value.trim() ? `Filtro Activo: "${buscadorTabla.value.trim()}"` : 'Vista sin filtros';
              documento.text(`Firma Digital de Integridad | ${textoFiltro} | Fecha: ${new Date().toLocaleString('es-MX')}`, 40, altoTotal - 25);
              documento.text(`Página ${documento.internal.getNumberOfPages()}`, anchoTotal - 80, altoTotal - 25);
            }
          });

          if (columnaSalarialEncontrada) {
            const posYFinal = documento.lastAutoTable.finalY + 20;
            documento.setFillColor(241, 245, 249);
            documento.rect(40, posYFinal - 12, documento.internal.pageSize.width - 80, 25, 'F');
            
            documento.setFontSize(10);
            documento.setFont('helvetica', 'bold');
            documento.setTextColor(10, 25, 47);
            documento.text(`SUMATORIA TOTAL PRESUPUESTARIA: $${sumaSalarios.toLocaleString('es-MX')}`, 50, posYFinal + 4);
          }

          const sufijo = buscadorTabla && buscadorTabla.value.trim() ? '_filtrado' : '';
          const nombreArchivo = `csmonterrey_${tituloActual.toLowerCase().replace(/[^a-z0-9]/g, '_')}${sufijo}.pdf`;
          documento.save(nombreArchivo);

        } catch (error) {
          console.error('Error en exportación PDF avanzada:', error);
          alert('Error al compilar el archivo jsPDF.');
        } finally {
          botonDescargarPdf.innerHTML = htmlOriginal;
          botonDescargarPdf.disabled = false;
        }
      }, 450);
    });
  }

  // Escuchar clics en los 10 supervínculos sin emojis
  enlaces.forEach(enlace => {
    enlace.addEventListener('click', () => {
      const idDestino = enlace.getAttribute('data-id');
      if (idDestino !== idConsultaActual) {
        cargarVista(idDestino);
      }
    });
  });

  // 3. Ruteo Dinámico Inmediato: Comprobar si el dashboard nos mandó a abrir una vista específica vía localStorage
  const vistaGuardada = localStorage.getItem('vistaSeleccionada');
  if (vistaGuardada) {
    localStorage.removeItem('vistaSeleccionada'); // Limpiar para que no se quede bloqueado
    cargarVista(vistaGuardada);
  } else {
    cargarVista('1');
  }
});
