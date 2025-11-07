document.addEventListener('DOMContentLoaded', () => {
    
  const loginForm = document.querySelector('.login-form'); 
  const mensajeError = document.getElementById('mensaje-error'); 

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Cambiado de 'codigo' a 'usuario'
      const usuario = document.getElementById('usuario').value;
      const password = document.getElementById('password').value;

      try {
        // 1. Apuntamos al nuevo endpoint
        const response = await fetch('/login-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            usuario: usuario, // Cambiado de 'codigo'
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 2. Guardamos en localStorage como 'adminLogueado'
          localStorage.setItem('adminLogueado', JSON.stringify(data.admin));
          
          // 3. Redirigimos al futuro panel de admin
          window.location.href = '/html/panel-admin.html';
      } else {
          if (mensajeError) {
            mensajeError.textContent = data.message;
            mensajeError.style.display = 'block'; 
          }
        }
      } catch (error) {
        if (mensajeError) {
          mensajeError.textContent = 'Error de conexión con el servidor.';
          mensajeError.style.display = 'block'; 
        }
      }
    });
  }
});