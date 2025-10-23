// js/login-estudiante.js
document.addEventListener('DOMContentLoaded', () => {
  
  const loginForm = document.querySelector('.login-form'); 
  const mensajeError = document.getElementById('mensaje-error'); 

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const carnet = document.getElementById('carnet').value;
      const password = document.getElementById('password').value;

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

        if (response.ok) {
          // --- ¡ESTA ES LA CORRECCIÓN! ---
          // Guardamos un objeto con nombre y carnet
          const estudiante = {
              nombre: data.nombre,
              carnet: data.carnet
          };
          localStorage.setItem('estudianteLogueado', JSON.stringify(estudiante));
          
          window.location.href = '/html/panel-Estudiante.html'; // Redirige

       } else {
          if (mensajeError) {
            mensajeError.textContent = data.message;
            mensajeError.style.display = 'block';
          }
        }

      } catch (error) {
        console.error('Error de conexión:', error);
        if (mensajeError) {
          mensajeError.textContent = 'Error de conexión con el servidor.';
          mensajeError.style.display = 'block';
        }
      }
    });
  }
});
