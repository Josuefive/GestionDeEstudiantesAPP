// js/panel-estudiante.js

// (El archivo "datos.js" ya debe estar cargado antes que este)

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Revisar la Sesión (Seguridad)
    const carnetLogueado = localStorage.getItem('carnetEstudianteLogueado');
    if (!carnetLogueado) {
        // Si no hay nadie logueado, lo regresamos al login
        window.location.href = '/html/login-estudiante.html'; // Ajusta esta ruta
        return;
    }

    // 2. Obtener los datos completos del estudiante
    const datosEstudiante = datosCompletosEstudiantes[carnetLogueado];
    if (!datosEstudiante) {
        // Si por alguna razón el carnet no tiene datos, mostramos error y regresamos
        alert('Error: No se encontraron datos para el estudiante.');
        localStorage.removeItem('carnetEstudianteLogueado');
        window.location.href = '/html/login-estudiante.html'; // Ajusta esta ruta
        return;
    }

    // 3. Cargar toda la información en la página
    cargarDatosEstudiante(datosEstudiante);
    
    // 4. Configurar el botón de Cerrar Sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('carnetEstudianteLogueado');
            window.location.href = '/html/login-estudiante.html'; // Ajusta esta ruta
        });
    }
});


/**
 * Función principal para rellenar todo el HTML con los datos del estudiante
 */
function cargarDatosEstudiante(datos) {
    // Cambiar el título de la página
    document.title = `Portal Estudiantil - ${datos.nombre}`;

    // Rellenar Navbar
    document.querySelector('.navbar .user-info span').textContent = datos.nombre;
    document.querySelector('.navbar .user-info .carnet').textContent = `Carnet: ${datos.carnet}`;

    // Rellenar Tarjeta de Información Personal
    document.querySelector('.info-personal-card .name').textContent = datos.nombre;
    document.querySelector('.info-personal-card .carnet').textContent = `Carnet: ${datos.carnet}`;
    document.querySelector('.info-personal-card .value[data-tipo="carrera"]').textContent = datos.carrera;
    document.querySelector('.info-personal-card .value[data-tipo="ingreso"]').textContent = datos.ingreso;
    document.querySelector('.info-personal-card .value[data-tipo="estado"]').textContent = datos.estado;

    // Rellenar Métricas (los cuadritos)
    document.querySelector('.metric-card[data-tipo="inscritas"] .metric-icon span').textContent = datos.metricas.inscritas;
    document.querySelector('.metric-card[data-tipo="aprobadas"] .metric-icon span').textContent = datos.metricas.aprobadas;
    document.querySelector('.metric-card[data-tipo="promedio"] .metric-icon span').textContent = datos.metricas.promedio;
    document.querySelector('.metric-card[data-tipo="tasa"] .metric-icon span').textContent = `${datos.metricas.tasa}%`;

    // Rellenar Tablas y Tarjetas de Calificaciones (la parte más importante)
    const tbody = document.querySelector('.grades-table tbody');
    const cardsContainer = document.querySelector('.grades-cards-container');

    // Limpiamos el contenido estático del HTML
    tbody.innerHTML = '';
    cardsContainer.innerHTML = '';

    // Iteramos sobre cada materia del estudiante y creamos el HTML
    datos.materias.forEach(materia => {
        tbody.appendChild(crearFilaTabla(materia));
        cardsContainer.appendChild(crearTarjetaMateria(materia));
    });
}


/**
 * Helper: Crea una fila <tr> para la tabla de notas
 */
function crearFilaTabla(materia) {
    const tr = document.createElement('tr');
    
    // Clases de estado (para color)
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

    // Funciones para manejar notas nulas (En Curso)
    const nota = (n) => (n.puntaje === null ? '-' : `${n.puntaje}/${n.max}`);
    const total = (t) => (t === null ? '-' : `${t}/100`);
    const barraWidth = (t) => (t === null ? 0 : t);

    tr.innerHTML = `
        <td>${materia.codigo}</td>
        <td>
            <span class="subject-title">${materia.asignatura}</span>
            <span class="subject-schedule">${materia.horario}</span>
        </td>
        <td>${materia.catedratico}</td>
        <td>${nota(materia.notas[0])}</td>
        <td>${nota(materia.notas[1])}</td>
        <td>${nota(materia.notas[2])}</td>
        <td>${nota(materia.notas[3])}</td>
        <td>${nota(materia.notas[4])}</td>
        <td>
            <div class="total-score">
                <span>${total(materia.total)}</span>
                <div class="progress-bar-bg">
                    <div class="progress-bar ${barraClase[materia.estado]}" style="width: ${barraWidth(materia.total)}%;"></div>
                </div>
            </div>
        </td>
        <td>
            <span class="status ${estadoClase[materia.estado]}">
                <i class="fas ${estadoIcono[materia.estado]}"></i> ${materia.estado}
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
    div.className = 'grade-card';

    // Clases de estado (para color)
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

    // Funciones para manejar notas nulas (En Curso)
    const nota = (n) => (n.puntaje === null ? '-' : `${n.tipo.split(' ')[0][0]}${n.tipo.split(' ')[1]}: ${n.puntaje}/${n.max}`);
    const examen = (n) => (n.puntaje === null ? '-' : `Examen: ${n.puntaje}/${n.max}`);
    const total = (t) => (t === null ? '-' : `Total: ${t}/100`);
    const barraWidth = (t) => (t === null ? 0 : t);

    div.innerHTML = `
        <div class="card-header">
            <span class="subject-code">${materia.codigo} - ${materia.asignatura}</span>
            <span class="status ${estadoClase[materia.estado]}">
                <i class="fas ${estadoIcono[materia.estado]}"></i> ${materia.estado}
            </span>
        </div>
        <div class="card-meta">
            <span>${materia.catedratico}</span>
            <span>${materia.horario}</span>
        </div>
        <div class="card-details">
            <div>
                <span class="detail-label">Sistemáticos</span>
                <div class="detail-scores">
                    <span>${nota(materia.notas[0])}</span>
                    <span>${nota(materia.notas[1])}</span>
                    <span>${nota(materia.notas[2])}</span>
                    <span>${nota(materia.notas[3])}</span>
                </div>
            </div>
            <div>
                <span class="detail-label">Evaluación Final</span>
                <span class="detail-scores">${examen(materia.notas[4])}</span>
            </div>
        </div>
        <div class="card-total">
            <span>${total(materia.total)}</span>
            <div class="progress-bar-bg">
                <div class="progress-bar ${barraClase[materia.estado]}" style="width: ${barraWidth(materia.total)}%;"></div>
            </div>
        </div>
    `;
    return div;
}