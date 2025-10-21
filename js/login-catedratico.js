    // Datos de catedráticos para login local
const catedraticos = [
    { codigo: 'PROF001', password: 'admin123', nombre: 'Dr. Cristiam' },
    { codigo: 'PROF002', password: 'profesor123', nombre: 'Dra. María Elena Ruiz' },
    { codigo: 'PROF003', password: 'profesor123', nombre: 'Lic. Roberto Carlos Silva' }
];

// Función para manejar el login de catedráticos
function manejarLoginCatedratico(event) {
    event.preventDefault();
    
    const codigo = document.getElementById('codigo').value.trim().toUpperCase();
    const password = document.getElementById('password').value;
    
    // Validar campos
    if (!codigo || !password) {
        mostrarError('Por favor, complete todos los campos');
        return;
    }
    
    // Buscar catedrático
    const catedratico = catedraticos.find(prof => prof.codigo === codigo && prof.password === password);
    
    if (catedratico) {
        // Guardar sesión
        localStorage.setItem('catedraticoLogueado', JSON.stringify(catedratico));
        
        // Mostrar mensaje de éxito
        mostrarExito(`Bienvenido, ${catedratico.nombre}`);
        
        // Redirigir después de 1 segundo
        setTimeout(() => {
            window.location.href = '/html/panel-catedratico.html';
        }, 1000);
    } else {
        mostrarError('Código o contraseña incorrectos');
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    // Remover mensajes anteriores
    removerMensajes();
    
    // Crear elemento de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fee2e2;
        color: #dc2626;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #fecaca;
        text-align: center;
        font-size: 14px;
    `;
    errorDiv.textContent = mensaje;
    
    // Insertar antes del formulario
    const form = document.querySelector('.login-form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Agregar animación de shake
    animarInputs();
}

// Función para mostrar éxito
function mostrarExito(mensaje) {
    // Remover mensajes anteriores
    removerMensajes();
    
    // Crear elemento de éxito
    const exitoDiv = document.createElement('div');
    exitoDiv.className = 'success-message';
    exitoDiv.style.cssText = `
        background: #d1fae5;
        color: #065f46;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        border: 1px solid #a7f3d0;
        text-align: center;
        font-size: 14px;
    `;
    exitoDiv.textContent = mensaje;
    
    // Insertar antes del formulario
    const form = document.querySelector('.login-form');
    form.insertBefore(exitoDiv, form.firstChild);
    
    // Deshabilitar botón
    const btn = form.querySelector('.btn-primary');
    btn.disabled = true;
    btn.textContent = 'Redirigiendo...';
}

// Función para remover mensajes
function removerMensajes() {
    const mensajes = document.querySelectorAll('.error-message, .success-message');
    mensajes.forEach(msg => msg.remove());
}

// Función para animar inputs
function animarInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    });
}

// Función para verificar si hay sesión activa
function verificarSesion() {
    const catedratico = localStorage.getItem('catedraticoLogueado');
    if (!catedratico && !window.location.href.includes('login')) {
        window.location.href = 'login-catedratico.html';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLoginCatedratico);
    }
    
    // Agregar estilos para la animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
    
    // Verificar sesión en páginas protegidas
    if (!window.location.href.includes('login')) {
        verificarSesion();
    }
});