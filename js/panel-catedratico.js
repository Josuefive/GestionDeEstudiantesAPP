// js/panel-catedratico.js

// (El script 'datos-clases.js' debe cargarse ANTES que este)

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del catedrático
    cargarDatosCatedratico();
    
    // Cargar período guardado si existe
    cargarPeriodoGuardado();
    
    // Agregar estilos para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Carga los datos del profesor en el header
function cargarDatosCatedratico() {
    const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));
    if (catedratico) {
        document.getElementById('nombre-profesor').textContent = catedratico.nombre;
        document.getElementById('codigo-profesor').textContent = `Código: ${catedratico.codigo}`;
    } else {
        // Si no hay sesión, lo regresa al login
        window.location.href = '/html/login-catedratico.html';
    }
}

// Cierra la sesión
function logout() {
    if(confirm("¿Está seguro que desea cerrar sesión?")) {
        localStorage.removeItem('catedraticoLogueado');
        localStorage.removeItem('periodoSeleccionado');
        localStorage.removeItem('claseSeleccionada');
        window.location.href = "/html/login-catedratico.html"; // Ir a login, no al index
    }
}

// Si el usuario ya había seleccionado un período, lo carga
function cargarPeriodoGuardado() {
    const periodo = localStorage.getItem('periodoSeleccionado');
    if (periodo) {
        const [anio, semestre] = periodo.split('-');
        document.getElementById('anio-lectivo').value = anio;
        document.getElementById('semestre').value = semestre;
        // Opcional: buscar clases automáticamente al cargar la página
        // buscarClases(); 
    }
}

// =============================================
// NUEVA LÓGICA DE FILTRADO Y SELECCIÓN DE CLASE
// =============================================

/**
 * Paso 1: Llamado por el botón "Buscar Clases".
 * Filtra las clases por profesor y período.
 */
function buscarClases() {
    const anio = document.getElementById('anio-lectivo').value;
    const semestre = document.getElementById('semestre').value;
    const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));

    if (!anio || !semestre) {
        mostrarMensaje('Por favor seleccione año y semestre', 'error');
        return;
    }

    if (!catedratico || !catedratico.codigo) {
        mostrarMensaje('Error: No se pudo identificar al catedrático.', 'error');
        return;
    }

    const periodoSeleccionado = `${anio}-${semestre}`;
    localStorage.setItem('periodoSeleccionado', periodoSeleccionado);
    
    // Filtrar la base de datos global 'todasLasClases'
    const clasesFiltradas = todasLasClases.filter(clase => {
        return clase.periodo === periodoSeleccionado && clase.profesorId === catedratico.codigo;
    });

    // Llamar a la función para mostrar las clases en el HTML
    mostrarClasesEncontradas(clasesFiltradas);
}

/**
 * Paso 2: Construye el HTML para la lista de clases.
 */
function mostrarClasesEncontradas(clases) {
    const seccionLista = document.getElementById('lista-clases-section');
    const container = document.getElementById('clases-container');
    const btnGestionar = document.getElementById('btn-gestionar');

    // Limpiar resultados anteriores
    container.innerHTML = '';
    localStorage.removeItem('claseSeleccionada'); // Limpiar selección anterior
    btnGestionar.disabled = true;

    if (clases.length === 0) {
        container.innerHTML = '<p>No se encontraron clases asignadas para usted en este período.</p>';
        seccionLista.style.display = 'block';
        return;
    }

    // Crear una tarjeta de radio por cada clase
    clases.forEach(clase => {
        const card = document.createElement('label');
        card.className = 'clase-radio-card';
        // Usamos JSON.stringify para guardar el objeto *entero* en el value
        card.innerHTML = `
            <input type="radio" name="clase-seleccionada" value='${JSON.stringify(clase)}'>
            <h4>${clase.nombre}</h4>
            <p><strong>Carrera:</strong> ${clase.carrera}</p>
            <p><strong>Horario:</strong> ${clase.horario}</p>
            <p><strong>Estudiantes:</strong> ${clase.estudiantes}</p>
        `;
        
        // Añadir el listener para guardar la selección
        card.querySelector('input').addEventListener('change', function() {
            if (this.checked) {
                // Guardar el objeto COMPLETO de la clase
                localStorage.setItem('claseSeleccionada', this.value); 
                btnGestionar.disabled = false; // Activar el botón de gestionar
            }
        });

        container.appendChild(card);
    });

    // Mostrar la sección de la lista
    seccionLista.style.display = 'block';
    seccionLista.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/**
 * Paso 3: Llamado por el botón "Gestionar Calificaciones".
 * Redirige a la página de registro.
 */
function procederGestionar() {
    const claseSeleccionada = localStorage.getItem('claseSeleccionada');
    
    if (claseSeleccionada) {
        window.location.href = '/html/registroDecalificaciones.html';
    } else {
        mostrarMensaje('Por favor seleccione una clase de la lista', 'error');
    }
}


// Función para mostrar mensajes (sin cambios)
function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-flotante mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    
    if (tipo === 'exito') {
        mensajeDiv.style.background = '#D1FAE5';
        mensajeDiv.style.color = '#065F46';
        mensajeDiv.style.border = '1px solid #A7F3D0';
    } else {
        mensajeDiv.style.background = '#FEE2E2';
        mensajeDiv.style.color = '#991B1B';
        mensajeDiv.style.border = '1px solid #FECACA';
    }
    
    document.body.appendChild(mensajeDiv);
    
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => mensajeDiv.remove(), 300);
        }
    }, 4000);
}