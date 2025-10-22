// js/login-catedratico.js
document.addEventListener('DOMContentLoaded', () => {
    
  // Asegúrate que tu <form> tenga el id="login-form-catedratico"
  const loginForm = document.querySelector('.login-form'); 
  
  // Añade un <p id="mensaje-error"></p> en tu HTML
  const mensajeError = document.getElementById('mensaje-error'); 

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const codigo = document.getElementById('codigo').value.toUpperCase();
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://localhost:3000/login-catedratico', { // <-- Llama al endpoint de catedrático
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            codigo: codigo,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Guarda los datos del catedrático
          localStorage.setItem('catedraticoLogueado', JSON.stringify(data.catedratico));
          window.location.href = '/html/panel-catedratico.html';
      } else {
          // 5. Muestra error del servidor
          if (mensajeError) {
            mensajeError.textContent = data.message;
            mensajeError.style.display = 'block'; // <-- ¡AÑADE ESTA LÍNEA!
          }
        }

      } catch (error) {
        // ...
        if (mensajeError) {
          mensajeError.textContent = 'Error de conexión con el servidor.';
          mensajeError.style.display = 'block'; // <-- ¡AÑADE ESTA LÍNEA!
        }
      }
    });
  }
});