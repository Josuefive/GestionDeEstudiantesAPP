// js/login-estudiante.js
document.addEventListener('DOMContentLoaded', () => {
  
  // Asegúrate que tu <form> en HTML tenga id="login-form-estudiante"
  const loginForm = document.querySelector('.login-form'); 
  
  // Añade un <p id="mensaje-error"></p> vacío en tu HTML
  const mensajeError = document.getElementById('mensaje-error'); 

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      // 1. Evita que el formulario se envíe solo
      event.preventDefault();

      // 2. Obtén los valores
      const carnet = document.getElementById('carnet').value;
      const password = document.getElementById('password').value;

      // 3. Envía la petición (fetch) a tu backend
      try {
        const response = await fetch('http://localhost:3000/login-estudiante', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            carnet: carnet,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) { // Si el servidor dice "200 OK"
          // ¡Éxito!
          localStorage.setItem('nombreEstudiante', data.nombre); // Guarda el nombre
          window.location.href = '/html/panel-Estudiante.html'; // Redirige

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