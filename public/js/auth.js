document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Mostrar alerta visual en el formulario
  const showAlert = (elId, isSuccess, message) => {
    const alertEl = document.getElementById(elId);
    if (!alertEl) return;
    
    alertEl.style.display = 'block';
    alertEl.className = `alert ${isSuccess ? 'alert-success' : 'alert-error'}`;
    alertEl.innerHTML = message;
    
    // Ocultar alerta de error después de 5 segundos
    if (!isSuccess) {
      setTimeout(() => {
        alertEl.style.display = 'none';
      }, 5000);
    }
  };

  // Manejar envío del formulario de Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginBtn');
      const originalText = btn.innerHTML;
      
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></span> Verificando...';

      const formData = new FormData(loginForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          showAlert('loginAlert', true, data.message);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 800);
        } else {
          showAlert('loginAlert', false, `❌ ${data.message}`);
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      } catch (error) {
        showAlert('loginAlert', false, '❌ Error al conectar con el servidor');
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  }

  // Manejar envío del formulario de Registro
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerBtn');
      const originalText = btn.innerHTML;

      // Validar contraseña
      const password = document.getElementById('password').value;
      if (password.length < 6) {
        showAlert('registerAlert', false, '❌ La contraseña debe tener al menos 6 caracteres');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></span> Creando cuenta...';

      const formData = new FormData(registerForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
          showAlert('registerAlert', true, `🎉 ${data.message}`);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1200);
        } else {
          showAlert('registerAlert', false, `❌ ${data.message}`);
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      } catch (error) {
        showAlert('registerAlert', false, '❌ Error interno al registrar la cuenta');
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  }
});
