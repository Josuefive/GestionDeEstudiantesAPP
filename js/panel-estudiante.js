// js/panel-estudiante.js
const API_URL = 'http://localhost:3000'; // URL base de tu backend

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. Revisar la Sesión (Seguridad)
    // Busca "estudianteLogueado", que es lo que guarda el nuevo login
    const estudianteLogueado = JSON.parse(localStorage.getItem('estudianteLogueado'));
    if (!estudianteLogueado || !estudianteLogueado.carnet) {
        // Si no lo encuentra, lo manda al login
        console.error("No se encontró estudianteLogueado en localStorage.");
        window.location.href = '/html/login-estudiante.html'; 
        return;
    }

    // 2. Configurar el botón de Cerrar Sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('estudianteLogueado'); // Limpiar sesión
            window.location.href = '/html/login-estudiante.html';
        });
    }

    // 3. Cargar toda la información desde el Backend
    try {
        console.log(`Cargando datos para carnet: ${estudianteLogueado.carnet}`);
        // Llama al ENDPOINT 6 de tu backend
        const response = await fetch(`${API_URL}/api/calificaciones/estudiante?carnet=${estudianteLogueado.carnet}`);
        
        // Verifica si la respuesta del servidor es OK (status 200-299)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' })); // Intenta parsear error
            console.error("Error en la respuesta del fetch:", response.status, errorData);
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos recibidos del backend:", data);

        // Verifica si la respuesta JSON indica éxito
        if (!data.success) {
             console.error("El backend devolvió success: false", data.message);
            throw new Error(data.message);
        }
        
        // 4. Cargar toda la información en la página
        // (data es la respuesta completa: {success, nombre, carnet, carrera, metricas, materias})
        cargarDatosEstudiante(data);

    } catch (error) {
        console.error('Error al cargar datos del estudiante:', error);
        alert(`Error al cargar datos: ${error.message}. Serás redirigido al login.`);
        // Si falla, borra la sesión y lo manda al login
        localStorage.removeItem('estudianteLogueado');
        window.location.href = '/html/login-estudiante.html';
    }
});


/**
 * Función principal para rellenar todo el HTML con los datos del API
 */
function cargarDatosEstudiante(datos) {
    // 'datos' es la respuesta completa de nuestro ENDPOINT 6 mejorado
    
    // Cambiar el título de la página
    document.title = `Portal Estudiantil - ${datos.nombre}`;

    // --- Rellenar Header (usando los nuevos IDs) ---
    const nombreHeader = document.getElementById('nombre-estudiante');
    const carnetHeader = document.getElementById('carnet-estudiante');
    if(nombreHeader) nombreHeader.textContent = datos.nombre;
    if(carnetHeader) carnetHeader.textContent = `Carnet: ${datos.carnet}`;
    // --- FIN ---

    // Rellenar Tarjeta de Información Personal
    const nombreCard = document.querySelector('.info-personal-card .name');
    const carnetCard = document.querySelector('.info-personal-card .carnet');
    const carreraCard = document.querySelector('.info-personal-card .value[data-tipo="carrera"]');
    const ingresoCard = document.querySelector('.info-personal-card .value[data-tipo="ingreso"]');
    const estadoCard = document.querySelector('.info-personal-card .value[data-tipo="estado"]');

    if(nombreCard) nombreCard.textContent = datos.nombre;
    if(carnetCard) carnetCard.textContent = `Carnet: ${datos.carnet}`;
    if(carreraCard) carreraCard.textContent = datos.carrera;
    if(ingresoCard) ingresoCard.textContent = datos.ingreso;
    if(estadoCard) {
        estadoCard.textContent = datos.estado;
        // Ajustar clase si es necesario (ej. si hubiera estado 'Inactivo')
        estadoCard.className = `value status status-${datos.estado.toLowerCase()}`;
    }


    // Rellenar Métricas (los cuadritos)
    const metricInscritas = document.querySelector('.metric-card[data-tipo="inscritas"] .metric-icon span');
    const metricAprobadas = document.querySelector('.metric-card[data-tipo="aprobadas"] .metric-icon span');
    const metricPromedio = document.querySelector('.metric-card[data-tipo="promedio"] .metric-icon span');
    const metricTasa = document.querySelector('.metric-card[data-tipo="tasa"] .metric-icon span');

    if (metricInscritas) metricInscritas.textContent = datos.metricas.inscritas;
    if (metricAprobadas) metricAprobadas.textContent = datos.metricas.aprobadas;
    if (metricPromedio) metricPromedio.textContent = datos.metricas.promedio;
    if (metricTasa) metricTasa.textContent = `${datos.metricas.tasa}%`;


    // Rellenar Tablas y Tarjetas de Calificaciones
    const tbody = document.querySelector('.grades-table tbody');
    const cardsContainer = document.querySelector('.grades-cards-container');
    const thead = document.querySelector('.grades-table thead'); // Asegúrate que thead exista

    // Limpiar contenido previo
    if(tbody) tbody.innerHTML = '';
    if(cardsContainer) cardsContainer.innerHTML = '';
    if(thead) thead.innerHTML = ''; 

    // Verificar si hay materias
    if (!datos.materias || datos.materias.length === 0) {
        if(tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">No tienes materias inscritas.</td></tr>';
        if(cardsContainer) cardsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No tienes materias inscritas.</p>';
        return;
    }
    
    // Crear la cabecera de la tabla (si existe thead)
    if(thead) {
        thead.innerHTML = `
            <tr>
                <th>Código</th>
                <th>Asignatura</th>
                <th>Catedrático</th>
                <th>Sist. 1</th>
                <th>Sist. 2</th>
                <th>Sist. 3</th>
                <th>Sist. 4</th>
                <th>Examen</th>
                <th>Total</th>
                <th>Estado</th>
            </tr>
        `;
    }

    // Iteramos sobre cada materia del estudiante y creamos el HTML
    datos.materias.forEach(materia => {
        if(tbody) tbody.appendChild(crearFilaTabla(materia));
        if(cardsContainer) cardsContainer.appendChild(crearTarjetaMateria(materia));
    });
}


/**
 * Helper: Crea una fila <tr> para la tabla de notas
 */
function crearFilaTabla(materia) {
    const tr = document.createElement('tr');
    
    // Mapeos para clases CSS e íconos (igual que antes)
    const estadoClase = {
        'Aprobado': 'status-approved',
        'Reprobado': 'status-reprobated',
        'En Curso': 'status-in-progress'
    };
    const estadoIcono = {
        'Aprobado': 'fa-check-circle',
        'Reprobado': 'fa-times-circle',
        'En Curso': 'fa-hourglass-half'
    };
    const barraClase = {
        'Aprobado': 'green',
        'Reprobado': 'red',
        'En Curso': 'gray'
    };

    // Función para formatear notas (maneja nulls)
    const nota = (n) => (n === null || n === undefined) ? '-' : `${n}/15`; // Asume max 15
    const notaEx = (n) => (n === null || n === undefined) ? '-' : `${n}/40`; // Asume max 40
    const total = (t) => (t === null || t === undefined) ? '-' : `${t}/100`;
    const barraWidth = (t) => (t === null || t === undefined) ? 0 : t;

    tr.innerHTML = `
        <td>${materia.codigo || '-'}</td>
        <td>
            <span class="subject-title">${materia.asignatura || 'N/A'}</span>
            <span class="subject-schedule">${materia.horario || '-'}</span>
        </td>
        <td>${materia.catedratico || '-'}</td>
        <td>${nota(materia.s1)}</td>
        <td>${nota(materia.s2)}</td>
        <td>${nota(materia.s3)}</td>
        <td>${nota(materia.s4)}</td>
        <td>${notaEx(materia.exf)}</td>
        <td>
            <div class="total-score">
                <span>${total(materia.total)}</span>
                <div class="progress-bar-bg">
                    <div class="progress-bar ${barraClase[materia.estado]}" style="width: ${barraWidth(materia.total)}%;"></div>
                </div>
            </div>
        </td>
        <td>
            <span class="status ${estadoClase[materia.estado] || 'status-in-progress'}">
                <i class="fas ${estadoIcono[materia.estado] || 'fa-hourglass-half'}"></i> ${materia.estado || 'En Curso'}
            </span>
        </td>
    `;
    return tr;
}


/**
 * Helper: Crea una <div> para las tarjetas de notas (vista móvil)
 */
function crearTarjetaMateria(materia) {
    const div = document.createElement('div');
    
    // Mapeos (igual que antes)
    const estadoClase = {
        'Aprobado': 'status-approved',
        'Reprobado': 'status-reprobated',
        'En Curso': 'status-in-progress'
    };
    const estadoIcono = {
        'Aprobado': 'fa-check-circle',
        'Reprobado': 'fa-times-circle',
        'En Curso': 'fa-hourglass-half'
    };
     const barraClase = {
        'Aprobado': 'green',
        'Reprobado': 'red',
        'En Curso': 'gray'
    };

    // Funciones de formato (manejan nulls)
    const notaSist = (label, n) => (n === null || n === undefined) ? '-' : `${label}: ${n}/15`;
    const notaEx = (n) => (n === null || n === undefined) ? '-' : `Examen: ${n}/40`;
    const total = (t) => (t === null || t === undefined) ? '-' : `Total: ${t}/100`;
    const barraWidth = (t) => (t === null || t === undefined) ? 0 : t;

    // Asignar clase de borde según el estado
    const estadoBorde = (materia.estado || 'En Curso').toLowerCase().replace(' ', '-');
    div.className = `grade-card grade-card-border-${estadoBorde}`;


    div.innerHTML = `
        <div class="card-header">
            <span class="subject-code">${materia.codigo || '-'} - ${materia.asignatura || 'N/A'}</span>
            <span class="status ${estadoClase[materia.estado] || 'status-in-progress'}">
                <i class="fas ${estadoIcono[materia.estado] || 'fa-hourglass-half'}"></i> ${materia.estado || 'En Curso'}
            </span>
        </div>
        <div class="card-meta">
            <span>${materia.catedratico || '-'}</span>
            <span>${materia.horario || '-'}</span>
        </div>
        <div class="card-details">
            <div>
                <span class="detail-label">Sistemáticos</span>
                <div class="detail-scores">
                    <span>${notaSist('S1', materia.s1)}</span>
                    <span>${notaSist('S2', materia.s2)}</span>
                    <span>${notaSist('S3', materia.s3)}</span>
                    <span>${notaSist('S4', materia.s4)}</span>
                </div>
            </div>
            <div>
                <span class="detail-label">Evaluación Final</span>
                <span class="detail-scores">${notaEx(materia.exf)}</span>
            </div>
        </div>
        <div class="card-total">
            <span>${total(materia.total)}</span>
            <div class="progress-bar-bg">
                <div class="progress-bar ${barraClase[materia.estado]}" style="width: ${barraWidth(materia.total)}%;"></div>
            </div>
        </div>
    `;

    // Asegurarnos de que los estilos para los bordes existan (esto solo se añade una vez)
    if (!document.getElementById('card-border-styles')) {
        const style = document.createElement('style');
        style.id = 'card-border-styles';
        style.innerHTML = `
            .grade-card-border-aprobado { border-left-color: var(--status-approved) !important; }
            .grade-card-border-reprobado { border-left-color: var(--status-reprobated) !important; }
            .grade-card-border-en-curso { border-left-color: var(--status-in-progress) !important; }
        `;
        document.head.appendChild(style);
    }

    return div;
}

