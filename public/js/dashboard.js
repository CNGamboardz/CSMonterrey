document.addEventListener('DOMContentLoaded', () => {
  // Variables globales de estado
  let currentQueryId = '1';
  let currentData = [];
  let currentTitle = '';

  // Elementos del DOM
  const queryLinks = document.querySelectorAll('.query-link');
  const viewTitleEl = document.getElementById('currentViewTitle');
  const rowCountBadgeEl = document.getElementById('rowCountBadge');
  const tableRenderArea = document.getElementById('tableRenderArea');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userNameDisplay = document.getElementById('userNameDisplay');

  // 1. Mostrar nombre de usuario autenticado desde la cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const userInfoCookie = getCookie('user_info');
  if (userInfoCookie) {
    try {
      const userInfo = JSON.parse(decodeURIComponent(userInfoCookie));
      if (userInfo.nombre) {
        userNameDisplay.innerText = userInfo.nombre;
      }
    } catch (e) {
      // Usar predeterminado
    }
  }

  // 2. Función para cargar y renderizar la consulta activa
  const loadQueryData = async (queryId) => {
    currentQueryId = queryId;

    // Actualizar clases activas en la barra lateral
    queryLinks.forEach(link => {
      if (link.getAttribute('data-query') === queryId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Mostrar Spinner de carga
    viewTitleEl.innerHTML = 'Consultando base de datos...';
    rowCountBadgeEl.innerText = 'Cargando';
    rowCountBadgeEl.className = 'status-badge status-active';
    tableRenderArea.innerHTML = `
      <div class="loader-container">
        <div class="spinner"></div>
      </div>
    `;

    try {
      const response = await fetch(`/api/queries/${queryId}`);
      const result = await response.json();

      if (result.success) {
        currentData = result.data;
        currentTitle = result.title;

        // Renderizar título y conteo
        viewTitleEl.innerHTML = result.title;
        rowCountBadgeEl.innerText = `${result.count} registros devueltos`;
        
        // Renderizar tabla HTML
        renderTable(result.data);
      } else {
        showEmptyState('Error al consultar vista', result.message || 'Intenta nuevamente más tarde');
      }
    } catch (error) {
      showEmptyState('Error de conexión', 'No se pudo comunicar con el servidor PostgreSQL');
    }
  };

  // 3. Función para dibujar la tabla HTML dinámicamente
  const renderTable = (rows) => {
    if (!rows || rows.length === 0) {
      showEmptyState('No hay registros disponibles', 'La consulta SQL se ejecutó con éxito pero devolvió 0 filas.');
      return;
    }

    // Extraer nombres de las columnas a partir del primer objeto
    const columns = Object.keys(rows[0]);

    let html = `
      <table class="styled-table">
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    rows.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        let cellValue = row[col];
        
        // Formateo de valores específicos para mayor estética
        if (cellValue === null || cellValue === undefined) {
          cellValue = '<span style="color:var(--text-muted);">N/A</span>';
        } else if (typeof cellValue === 'boolean' || cellValue === 'Activo' || cellValue === 'Inactivo') {
          const isActive = cellValue === true || cellValue === 'Activo';
          cellValue = `<span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">${isActive ? 'Activo' : 'Inactivo'}</span>`;
        } else if (col.toLowerCase().includes('salario') || col.toLowerCase().includes('nómina')) {
          // Agregar símbolo de moneda si es numérico
          if (!isNaN(cellValue)) {
            cellValue = `$${Number(cellValue).toLocaleString('es-MX')}`;
          }
        }

        html += `<td>${cellValue}</td>`;
      });
      html += '</tr>';
    });

    html += `
        </tbody>
      </table>
    `;

    tableRenderArea.innerHTML = html;
  };

  // Mostrar estado vacío
  const showEmptyState = (title, message) => {
    viewTitleEl.innerHTML = title;
    rowCountBadgeEl.innerText = '0 registros';
    rowCountBadgeEl.className = 'status-badge status-inactive';
    tableRenderArea.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
  };

  // 4. Escuchar clics en los 10 supervínculos
  queryLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetQuery = link.getAttribute('data-query');
      if (targetQuery !== currentQueryId) {
        loadQueryData(targetQuery);
      }
    });
  });

  // 5. Descargar Reporte PDF de forma nativa utilizando jsPDF + autoTable
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      if (!currentData || currentData.length === 0) {
        alert('No hay datos en la tabla activa para exportar a PDF.');
        return;
      }

      // Animación en el botón
      const originalHtml = downloadPdfBtn.innerHTML;
      downloadPdfBtn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;margin-right:8px;"></span> Exportando...';
      downloadPdfBtn.disabled = true;

      setTimeout(() => {
        try {
          const { jsPDF } = window.jspdf;
          // Configuración horizontal (landscape) para que quepan todas las columnas corporativas
          const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });

          // Encabezado estelar del reporte
          doc.setFillColor(14, 165, 233); // Azul Primario
          doc.rect(0, 0, doc.internal.pageSize.width, 120, 'F');

          // Título principal en blanco
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(22);
          doc.text('CORPORATIVO CSMONTERREY', 40, 45);

          // Subtítulo del reporte activo
          doc.setFontSize(14);
          doc.setFont('helvetica', 'normal');
          doc.text(`Reporte de Base de Datos: ${currentTitle}`, 40, 75);

          // Metadatos adicionales
          doc.setFontSize(10);
          doc.setTextColor(240, 248, 255);
          doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')} | Servidor: PostgreSQL (bdmonterrey)`, 40, 100);

          // Preparar datos para autoTable
          const columns = Object.keys(currentData[0]);
          const tableRows = currentData.map(row => {
            return columns.map(col => {
              const val = row[col];
              if (val === null || val === undefined) return 'N/A';
              if (typeof val === 'boolean') return val ? 'Activo' : 'Inactivo';
              // Agregar formato de moneda en el PDF para consistencia
              if ((col.toLowerCase().includes('salario') || col.toLowerCase().includes('nómina')) && !isNaN(val)) {
                return `$${Number(val).toLocaleString('es-MX')}`;
              }
              return String(val);
            });
          });

          // Dibujar la tabla
          doc.autoTable({
            startY: 140,
            head: [columns],
            body: tableRows,
            theme: 'grid',
            headStyles: {
              fillColor: [11, 15, 25], // Gris profundo corporativo
              textColor: [34, 211, 238], // Cian
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'left'
            },
            bodyStyles: {
              fontSize: 9,
              textColor: [40, 40, 40],
              lineColor: [220, 220, 220]
            },
            alternateRowStyles: {
              fillColor: [248, 250, 252]
            },
            margin: { top: 140, left: 40, right: 40, bottom: 50 },
            didDrawPage: function(data) {
              // Pie de página con numeración
              const str = 'Página ' + doc.internal.getNumberOfPages();
              doc.setFontSize(8);
              doc.setTextColor(120, 120, 120);
              doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 30);
              doc.text('Sistema de Gestión MVC CSMonterrey', doc.internal.pageSize.width - data.settings.margin.right - 140, doc.internal.pageSize.height - 30);
            }
          });

          // Guardar el archivo PDF
          const safeFilename = currentTitle.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.pdf';
          doc.save(safeFilename);

        } catch (err) {
          console.error('Error al generar PDF:', err);
          alert('Hubo un error al compilar el documento PDF. Verifica la consola para detalles.');
        } finally {
          downloadPdfBtn.innerHTML = originalHtml;
          downloadPdfBtn.disabled = false;
        }
      }, 500);
    });
  }

  // 6. Manejar cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        try {
          await fetch('/api/auth/logout');
          window.location.href = '/login';
        } catch (e) {
          window.location.href = '/login';
        }
      }
    });
  }

  // 7. Cargar la consulta inicial (Supervínculo 1) al entrar
  loadQueryData('1');
});
