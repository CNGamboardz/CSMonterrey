document.addEventListener('DOMContentLoaded', () => {
  const formularioLogin = document.getElementById('formularioLogin');
  const formularioRegistro = document.getElementById('formularioRegistro');

  const mostrarAlerta = (idElemento, esExito, mensaje) => {
    const el = document.getElementById(idElemento);
    if (!el) return;
    el.style.display = 'block';
    el.className = `alerta ${esExito ? 'alerta-exito' : 'alerta-error'}`;
    el.innerHTML = mensaje;
  };

  // Petición para Login
  if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const boton = document.getElementById('botonLogin');
      const textoOriginal = boton.innerText;
      boton.disabled = true;
      boton.innerText = 'Verificando...';

      const datos = new FormData(formularioLogin);
      const cuerpo = Object.fromEntries(datos.entries());

      try {
        const respuesta = await fetch('/api/autenticacion/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cuerpo)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
          mostrarAlerta('alertaLogin', true, '¡Autenticado con éxito!');
          setTimeout(() => window.location.href = '/dashboard', 600);
        } else {
          mostrarAlerta('alertaLogin', false, resultado.mensaje);
          boton.disabled = false;
          boton.innerText = textoOriginal;
        }
      } catch (err) {
        mostrarAlerta('alertaLogin', false, 'Error de conexión con el servidor');
        boton.disabled = false;
        boton.innerText = textoOriginal;
      }
    });
  }

  // Petición para Registro
  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const boton = document.getElementById('botonRegistro');
      const textoOriginal = boton.innerText;

      const password = document.getElementById('password').value;
      if (password.length < 6) {
        mostrarAlerta('alertaRegistro', false, 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      boton.disabled = true;
      boton.innerText = 'Creando cuenta...';

      const datos = new FormData(formularioRegistro);
      const cuerpo = Object.fromEntries(datos.entries());

      try {
        const respuesta = await fetch('/api/autenticacion/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cuerpo)
        });
        const resultado = await respuesta.json();

        if (resultado.exito) {
          mostrarAlerta('alertaRegistro', true, '¡Cuenta registrada exitosamente!');
          setTimeout(() => window.location.href = '/dashboard', 800);
        } else {
          mostrarAlerta('alertaRegistro', false, resultado.mensaje);
          boton.disabled = false;
          boton.innerText = textoOriginal;
        }
      } catch (err) {
        mostrarAlerta('alertaRegistro', false, 'Error de servidor al registrar');
        boton.disabled = false;
        boton.innerText = textoOriginal;
      }
    });
  }
});
