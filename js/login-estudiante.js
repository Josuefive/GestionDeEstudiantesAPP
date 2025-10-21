// js/login-estudiante.js

// (El archivo "datos.js" ya debe estar cargado antes que este)

// Función para manejar el login de estudiantes
function manejarLoginEstudiante(event) {
    event.preventDefault();
    
    const carnet = document.getElementById('carnet').value.trim();
    const password = document.getElementById('password').value;
    
    if (!carnet || !password) {
        mostrarError('Por favor, complete todos los campos');
        return;
    }
    
    // Buscar estudiante en el array 'estudiantes' (de datos.js)
    const estudiante = estudiantes.find(est => est.carnet === carnet && est.password === password);
    
    if (estudiante) {
        // ¡Éxito! Guardamos solo el carnet. Es más seguro y ligero.
        // La próxima página usará este carnet para buscar los datos completos.
        localStorage.setItem('carnetEstudianteLogueado', estudiante.carnet);
        
        // Redirigir a página de calificaciones
        // Asegúrate que esta ruta sea correcta para tu proyecto
        window.location.href = '/html/panel-Estudiante.html'; 
    } else {
        mostrarError('Carnet o contraseña incorrectos');
    }
}

// Función para mostrar errores (tu función original está perfecta)
function mostrarError(mensaje) {
    const errorAnterior = document.querySelector('.error-message');
    if (errorAnterior) {
        errorAnterior.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `... (tus estilos de error) ...`;
    errorDiv.textContent = mensaje;
    
    const form = document.querySelector('.login-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => { input.style.animation = ''; }, 500);
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLoginEstudiante);
    }
    
    // (Tu código para la animación shake está bien)
    const style = document.createElement('style');
    style.textContent = `@keyframes shake { ... (tu animación) ... }`;
    document.head.appendChild(style);
});