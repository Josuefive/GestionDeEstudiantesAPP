// js/panel-estudiante.js
const API_URL = 'http://localhost:3000'; // URL base de tu backend

// Variables globales para guardar los datos
let datosEstudianteGlobal = {};
let materiasPeriodoActual = [];

document.addEventListener('DOMContentLoaded', async function() {
    
    // Inyectar estilos para mensajes de error
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

    // 1. Revisar la Sesión
    const estudianteLogueado = JSON.parse(localStorage.getItem('estudianteLogueado'));
    if (!estudianteLogueado || !estudianteLogueado.carnet) {
        console.error("No se encontró estudianteLogueado en localStorage.");
        window.location.href = '/html/login-estudiante.html'; 
        return;
    }

    // 2. Configurar el botón de Cerrar Sesión
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('estudianteLogueado');
            window.location.href = '/html/login-estudiante.html';
        });
    }

    // 3. Cargar datos iniciales (métricas + último periodo)
    try {
        console.log(`Cargando datos iniciales para carnet: ${estudianteLogueado.carnet}`);
        
        const response = await fetch(`${API_URL}/api/calificaciones/estudiante?carnet=${estudianteLogueado.carnet}`);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor' }));
            console.error("Error en la respuesta del fetch:", response.status, errorData);
            throw new Error(errorData.message || `Error ${response.status}`);
        }

        const data = await response.json();
        console.log("Datos iniciales recibidos:", data);

        if (!data.success) {
             console.error("El backend devolvió success: false", data.message);
            throw new Error(data.message);
        }
        
        // 4. Cargar datos en la página
        cargarDatosPagina(data); // Carga header, info personal, métricas
        poblarSelectorPeriodos(data.periodos, data.periodoActual); // Carga el dropdown
        actualizarListaMaterias(data.materias); // Carga la tabla de notas

        // 5. Añadir listener al selector de periodo
        const periodoSelector = document.getElementById('periodo-selector');
        if (periodoSelector) {
            periodoSelector.addEventListener('change', (e) => {
                const periodoSeleccionado = e.target.value;
                cargarMateriasPorPeriodo(periodoSeleccionado, estudianteLogueado.carnet);
            });
        }
        
        // 6. AÑADIR LISTENER AL BOTÓN DE DESCARGA (LUGAR CORRECTO)
        const btnDescargar = document.getElementById('btn-descargar-pdf');
        if (btnDescargar) {
            btnDescargar.addEventListener('click', descargarPDF);
        }

    } catch (error) {
        console.error('Error al cargar datos del estudiante:', error);
        
     
        mostrarMensaje(`Error: ${error.message}. Serás redirigido.`, 'error');
        
        setTimeout(() => {
            localStorage.removeItem('estudianteLogueado');
            window.location.href = '/html/login-estudiante.html';
        }, 3000);
    }
});



function cargarDatosPagina(datos) {
    // GUARDAR DATOS GLOBALMENTE
    datosEstudianteGlobal = datos; 
    
    document.title = `Portal Estudiantil - ${datos.nombre}`;

    // Rellenar Header
    document.getElementById('nombre-estudiante').textContent = datos.nombre;
    document.getElementById('carnet-estudiante').textContent = `Carnet: ${datos.carnet}`;

    // Rellenar Tarjeta de Información Personal
    document.querySelector('.info-personal-card .name').textContent = datos.nombre;
    document.querySelector('.info-personal-card .carnet').textContent = `Carnet: ${datos.carnet}`;
    document.querySelector('.info-personal-card .value[data-tipo="carrera"]').textContent = datos.carrera;
    document.querySelector('.info-personal-card .value[data-tipo="ingreso"]').textContent = datos.ingreso;
    const estadoCard = document.querySelector('.info-personal-card .value[data-tipo="estado"]');
    if (estadoCard) {
        estadoCard.textContent = datos.estado;
        estadoCard.className = `value status status-${datos.estado.toLowerCase()}`;
    }

    // Rellenar Métricas Globales
    document.querySelector('.metric-card[data-tipo="inscritas"] .metric-icon span').textContent = datos.metricas.inscritas;
    document.querySelector('.metric-card[data-tipo="aprobadas"] .metric-icon span').textContent = datos.metricas.aprobadas;
    document.querySelector('.metric-card[data-tipo="promedio"] .metric-icon span').textContent = datos.metricas.promedio;
    document.querySelector('.metric-card[data-tipo="tasa"] .metric-icon span').textContent = `${datos.metricas.tasa}%`;
}



function poblarSelectorPeriodos(periodos, periodoActual) {
    const select = document.getElementById('periodo-selector');
    if (!select) return;

    if (!periodos || periodos.length === 0) {
        select.innerHTML = '<option value="">No hay periodos</option>';
        return;
    }

    select.innerHTML = ''; // Limpiar
    periodos.forEach(periodo => {
        const option = document.createElement('option');
        option.value = periodo;
        option.textContent = formatearPeriodo(periodo); // "II Semestre 2024"
        if (periodo === periodoActual) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}



async function cargarMateriasPorPeriodo(periodo, carnet) {
    console.log(`Cargando materias para periodo: ${periodo}`);
    const tbody = document.querySelector('.grades-table tbody');
    const cardsContainer = document.querySelector('.grades-cards-container');
    
    // Mostrar estado de carga
    if(tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Cargando...</td></tr>';
    if(cardsContainer) cardsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Cargando...</p>';

    try {
        const response = await fetch(`${API_URL}/api/calificaciones/estudiante?carnet=${carnet}&periodo=${periodo}`);
        if (!response.ok) throw new Error('No se pudo cargar el período.');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        actualizarListaMaterias(data.materias);

    } catch (error) {
        console.error("Error cargando materias del periodo:", error);
        mostrarMensaje(`Error al cargar período: ${error.message}`, 'error');
        if(tbody) tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">Error al cargar.</td></tr>';
        if(cardsContainer) cardsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Error al cargar.</p>';
    }
}

function actualizarListaMaterias(materias) {
    // GUARDAR MATERIAS GLOBALMENTE
    materiasPeriodoActual = materias;
    
    const tbody = document.querySelector('.grades-table tbody');
    const cardsContainer = document.querySelector('.grades-cards-container');
    const thead = document.querySelector('.grades-table thead');

    // Limpiar contenido previo
    if(tbody) tbody.innerHTML = '';
    if(cardsContainer) cardsContainer.innerHTML = '';
    if(thead) thead.innerHTML = ''; // Limpiar por si acaso

    // Crear la cabecera de la tabla
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
    
    // Verificar si hay materias
    if (!materias || materias.length === 0) {
        const msj = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">No hay materias inscritas en este período.</td></tr>';
        if(tbody) tbody.innerHTML = msj;
        if(cardsContainer) cardsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">No hay materias inscritas en este período.</p>';
        
        // Ponemos el promedio del semestre en 0
        document.querySelector('.metric-card[data-tipo="promedio-semestre"] .metric-icon span').textContent = '0.0';
        return;
    }

    let sumaSemestre = 0;
    let materiasConNotaSemestre = 0;


    materias.forEach(materia => {
        if(tbody) tbody.appendChild(crearFilaTabla(materia)); 
        if(cardsContainer) cardsContainer.appendChild(crearTarjetaMateria(materia));

        // Cálculo para el promedio del semestre
        if (materia.total !== null) {
            sumaSemestre += materia.total;
            materiasConNotaSemestre++;
        }
    });

    // Calcular y mostrar el promedio del semestre
    const promedioSemestre = (materiasConNotaSemestre > 0) ? (sumaSemestre / materiasConNotaSemestre).toFixed(1) : '0.0';
    document.querySelector('.metric-card[data-tipo="promedio-semestre"] .metric-icon span').textContent = promedioSemestre;
}

function crearFilaTabla(materia) {
    const tr = document.createElement('tr');
    
    // Mapeos para clases CSS e íconos
    const estadoClase = { 'Aprobado': 'status-approved', 'Reprobado': 'status-reprobated', 'En Curso': 'status-in-progress' };
    const estadoIcono = { 'Aprobado': 'fa-check-circle', 'Reprobado': 'fa-times-circle', 'En Curso': 'fa-hourglass-half' };
    const barraClase = { 'Aprobado': 'green', 'Reprobado': 'red', 'En Curso': 'gray' };

    // Helper para buscar la nota en el array
    const getNota = (tipo) => materia.notas.find(n => n.tipo === tipo)?.puntaje;

    const s1 = getNota('Sist. 1');
    const s2 = getNota('Sist. 2');
    const s3 = getNota('Sist. 3');
    const s4 = getNota('Sist. 4');
    const exf = getNota('Examen');
    
    // Función para formatear notas (maneja nulls)
    const nota = (n) => (n === null || n === undefined) ? '-' : `${n}/15`;
    const notaEx = (n) => (n === null || n === undefined) ? '-' : `${n}/40`;
    const total = (t) => (t === null || t === undefined) ? '-' : `${t}/100`;
    const barraWidth = (t) => (t === null || t === undefined) ? 0 : t;

    tr.innerHTML = `
        <td>${materia.codigo || '-'}</td>
        <td>
            <span class="subject-title">${materia.asignatura || 'N/A'}</span>
            <span class="subject-schedule">${materia.horario || '-'}</span>
        </td>
        <td>${materia.catedratico || '-'}</td>
        <td>${nota(s1)}</td>
        <td>${nota(s2)}</td>
        <td>${nota(s3)}</td>
        <td>${nota(s4)}</td>
        <td>${notaEx(exf)}</td>
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


function crearTarjetaMateria(materia) {
    const div = document.createElement('div');
    
    // Mapeos
    const estadoClase = { 'Aprobado': 'status-approved', 'Reprobado': 'status-reprobated', 'En Curso': 'status-in-progress' };
    const estadoIcono = { 'Aprobado': 'fa-check-circle', 'Reprobado': 'fa-times-circle', 'En Curso': 'fa-hourglass-half' };
    const barraClase = { 'Aprobado': 'green', 'Reprobado': 'red', 'En Curso': 'gray' };

    // Helper para buscar la nota en el array
    const getNota = (tipo) => materia.notas.find(n => n.tipo === tipo)?.puntaje;

    const s1 = getNota('Sist. 1');
    const s2 = getNota('Sist. 2');
    const s3 = getNota('Sist. 3');
    const s4 = getNota('Sist. 4');
    const exf = getNota('Examen');

    // Funciones de formato (manejan nulls)
    const notaSist = (label, n) => `${label}: ${(n === null || n === undefined) ? '-' : `${n}/15`}`;
    const notaEx = (n) => `Examen: ${(n === null || n === undefined) ? '-' : `${n}/40`}`;
    const total = (t) => (t === null || t === undefined) ? 'Total: -' : `Total: ${t}/100`;
    const barraWidth = (t) => (t === null || t === undefined) ? 0 : t;

    // Asignar clase de borde según el estado
    const estadoBorde = (materia.estado || 'En Curso').toLowerCase().replace(' ', '-');
    div.className = `grade-card grade-card-border-${estadoBorde}`;
    
    // Insertar estilos de borde si no existen
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
                    <span>${notaSist('S1', s1)}</span>
                    <span>${notaSist('S2', s2)}</span>
                    <span>${notaSist('S3', s3)}</span>
                    <span>${notaSist('S4', s4)}</span>
                </div>
            </div>
            <div>
                <span class="detail-label">Evaluación Final</span>
                <span class="detail-scores">${notaEx(exf)}</span>
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

function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // 1. Datos del Estudiante
    const estudiante = datosEstudianteGlobal;
    const periodoTexto = formatearPeriodo(document.getElementById('periodo-selector').value);

    doc.setFontSize(16);
    doc.text("Historial de Calificaciones", 14, 22);
    doc.setFontSize(11);
    doc.text(`Estudiante: ${estudiante.nombre}`, 14, 30);
    doc.text(`Carnet: ${estudiante.carnet}`, 14, 36);
    doc.text(`Carrera: ${estudiante.carrera}`, 14, 42);
    doc.text(`Periodo: ${periodoTexto}`, 14, 48);

    // 2. Definir Columnas y Filas para la tabla
    const head = [["Código", "Asignatura", "S1", "S2", "S3", "S4", "ExF", "Total", "Estado"]];
    
    const body = materiasPeriodoActual.map(m => {
        const getNota = (tipo) => m.notas.find(n => n.tipo === tipo)?.puntaje;
        const s1 = getNota('Sist. 1') ?? '-';
        const s2 = getNota('Sist. 2') ?? '-';
        const s3 = getNota('Sist. 3') ?? '-';
        const s4 = getNota('Sist. 4') ?? '-';
        const exf = getNota('Examen') ?? '-';
        
        return [
            m.codigo,
            m.asignatura,
            s1,
            s2,
            s3,
            s4,
            exf,
            m.total ?? '-',
            m.estado
        ];
    });

    // 3. Generar la tabla
    doc.autoTable({
        startY: 55,
        head: head,
        body: body,
        theme: 'grid'
    });

    // 4. Descargar el archivo
    doc.save(`calificaciones_${estudiante.carnet}_${periodoTexto}.pdf`);
}



function formatearPeriodo(periodoString) {
    if (!periodoString) return "N/A";
    const partes = periodoString.split('-');
    if (partes.length < 2) return periodoString;
    
    const [anio, semestre] = partes;
    const semestreTexto = (semestre == '1') ? 'I Semestre' : 'II Semestre';
    return `${semestreTexto} ${anio}`;
}


function mostrarMensaje(mensaje, tipo) {
    // Remover cualquier mensaje existente
    const mensajeViejo = document.getElementById('mensaje-flotante');
    if (mensajeViejo) mensajeViejo.remove();

    const mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensaje-flotante';
    mensajeDiv.className = `mensaje-flotante mensaje-${tipo}`;
    mensajeDiv.textContent = mensaje;
    
    // Estilos base
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    `;
    
    if (tipo === 'exito') {
        mensajeDiv.style.background = '#D1FAE5';
        mensajeDiv.style.color = '#065F46';
        mensajeDiv.style.border = '1px solid #A7F3D0';
    } else if (tipo === 'error') {
        mensajeDiv.style.background = '#FEE2E2';
        mensajeDiv.style.color = '#991B1B';
        mensajeDiv.style.border = '1px solid #FECACA';
    }
    
    document.body.appendChild(mensajeDiv);
    
    // Autocerrar
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => mensajeDiv.remove(), 300);
        }
    }, 4000);
}