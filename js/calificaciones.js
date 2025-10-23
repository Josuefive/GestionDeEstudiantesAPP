// URL de tu backend
const API_URL = 'http://localhost:3000';

let claseGlobal = null; // Para guardar la clase actual

document.addEventListener('DOMContentLoaded', function() {
    const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));
    const clase = JSON.parse(localStorage.getItem('claseSeleccionada'));
    
    claseGlobal = clase; // Guardamos la clase para usarla al guardar

    if (!catedratico || !clase) {
        mostrarMensaje('Error: Sesión no válida o clase no seleccionada.', 'error');
        setTimeout(() => {
            window.location.href = 'panel-catedratico.html';
        }, 2000);
        return;
    }

    cargarInfoCatedratico(catedratico);
    cargarInfoClase(clase);
    
    // --- ¡LÓGICA ACTUALIZADA! ---
    // Ya no pasamos el ID, llamamos a la función asíncrona
    cargarEstudiantes(); 
});

function cargarInfoCatedratico(catedratico) {
    const userInfoSpans = document.querySelectorAll('.user-info span');
    if (userInfoSpans.length >= 2) {
        userInfoSpans[0].textContent = catedratico.nombre;
        userInfoSpans[1].textContent = `Código: ${catedratico.codigo}`;
    }
}

function cargarInfoClase(clase) {
    // (Esta es tu función original, solo la muevo aquí)
    const grid = document.querySelector('.clase-info-detalle .info-grid');
    grid.innerHTML = `
        <div class="info-item-detalle">
            <strong>Clase:</strong>
            <span>${clase.nombre} (ID: ${clase.id})</span>
        </div>
        <div class="info-item-detalle">
            <strong>Carrera:</strong>
            <span>${clase.carrera}</span>
        </div>
        <div class="info-item-detalle">
            <strong>Horario:</strong>
            <span>${clase.horario}</span>
        </div>
        <div class="info-item-detalle">
            <strong>Período:</strong>
            <span>${clase.periodo_id}</span>
        </div>
    `;
}


// --- ¡FUNCIÓN TOTALMENTE ACTUALIZADA! ---
async function cargarEstudiantes() {
    if (!claseGlobal) return;

    try {
        // 1. Hacemos fetch al nuevo endpoint
        const response = await fetch(`${API_URL}/api/inscripciones?claseId=${claseGlobal.id}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }
        
        const listaEstudiantes = data.estudiantes || [];
    
        const tbody = document.querySelector('.calificaciones-table tbody');
        const cardsContainer = document.querySelector('.calificaciones-cards-container');
        
        tbody.innerHTML = ''; 
        cardsContainer.innerHTML = ''; 

        document.getElementById('stat-total').textContent = listaEstudiantes.length;
        
        if (listaEstudiantes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem;">No hay estudiantes inscritos en esta clase.</td></tr>';
            return;
        }

        // 2. Crear AMBAS estructuras para cada estudiante
        listaEstudiantes.forEach(est => {
            // 3. ¡Rellenamos los inputs con los valores de la BD!
            //    (Usamos '|| ""' para mostrar vacío en lugar de 'null')
            const s1 = est.sistematico1 || "";
            const s2 = est.sistematico2 || "";
            const s3 = est.sistematico3 || "";
            const s4 = est.sistematico4 || "";
            const ex = est.examen_final || "";

            // --- 1. Crear Fila de Tabla ---
            const tr = document.createElement('tr');
            // Guardamos el carnet en el 'dataset' para saber a quién guardar
            tr.dataset.carnet = est.carnet; 
            tr.innerHTML = `
                <td>${est.carnet}</td>
                <td>${est.nombre}</td>
                <td><input type="number" class="nota-input" value="${s1}" min="0" max="15" placeholder="0-15" data-max="15"></td>
                <td><input type="number" class="nota-input" value="${s2}" min="0" max="15" placeholder="0-15" data-max="15"></td>
                <td><input type="number" class="nota-input" value="${s3}" min="0" max="15" placeholder="0-15" data-max="15"></td>
                <td><input type="number" class="nota-input" value="${s4}" min="0" max="15" placeholder="0-15" data-max="15"></td>
                <td><input type="number" class="nota-input" value="${ex}" min="0" max="40" placeholder="0-40" data-max="40"></td>
                <td class="total-cell">-</td>
                <td><span class="estado-cell estado-pendiente">Pendiente</span></td>
            `;
            
            tr.querySelectorAll('.nota-input').forEach(input => {
                input.addEventListener('input', () => calcularFila(tr));
            });
            tbody.appendChild(tr);
            calcularFila(tr); // Calcular el estado inicial

            // --- 2. Crear Tarjeta de Estudiante ---
            const card = document.createElement('div');
            card.className = 'student-card';
            card.dataset.carnet = est.carnet;
            card.innerHTML = `
                <div class="student-card-header">
                    <div class="info">
                        <span class="name">${est.nombre}</span>
                        <span class="carnet">Carnet: ${est.carnet}</span>
                    </div>
                    <span class="estado-cell estado-pendiente">Pendiente</span>
                </div>
                <div class="student-card-body">
                    <div class="nota-column">
                        <h4>Sistemáticos (15 pts c/u)</h4>
                        <div class="nota-item">
                            <label>S1:</label>
                            <input type="number" class="nota-input" value="${s1}" min="0" max="15" placeholder="0-15" data-max="15">
                        </div>
                        <div class="nota-item">
                            <label>S2:</label>
                            <input type="number" class="nota-input" value="${s2}" min="0" max="15" placeholder="0-15" data-max="15">
                        </div>
                        <div class="nota-item">
                            <label>S3:</label>
                            <input type="number" class="nota-input" value="${s3}" min="0" max="15" placeholder="0-15" data-max="15">
                        </div>
                        <div class="nota-item">
                            <label>S4:</label>
                            <input type="number" class="nota-input" value="${s4}" min="0" max="15" placeholder="0-15" data-max="15">
                        </div>
                    </div>
                    <div class="nota-column">
                        <h4>Examen Final (40 pts)</h4>
                        <div class="nota-item">
                            <label>Examen:</label>
                            <input type="number" class="nota-input" value="${ex}" min="0" max="40" placeholder="0-40" data-max="40">
                        </div>
                    </div>
                </div>
            `;

            card.querySelectorAll('.nota-input').forEach(input => {
                input.addEventListener('input', () => calcularTarjeta(card));
            });
            cardsContainer.appendChild(card);
            calcularTarjeta(card); // Calcular el estado inicial
        });

    } catch (error) {
        console.error('Error cargando estudiantes:', error);
        mostrarMensaje(error.message, 'error');
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 2rem;">${error.message}</td></tr>`;
    }
}

// --- ¡FUNCIÓN SIN CAMBIOS! ---
function calcularFila(fila) {
    const inputs = fila.querySelectorAll('.nota-input');
    const totalCell = fila.querySelector('.total-cell');
    const estadoCell = fila.querySelector('.estado-cell');
    let total = 0;
    let pendiente = false;

    inputs.forEach(input => {
        let valor = parseFloat(input.value);
        const max = parseFloat(input.dataset.max);
        if (valor > max) { valor = max; input.value = max; }
        if (valor < 0) { valor = 0; input.value = 0; }
        if (input.value === '' || isNaN(valor)) {
            pendiente = true;
            valor = 0;
        }
        total += valor;
    });

    totalCell.textContent = total; 

    if (pendiente && total === 0) { // Solo pendiente si no hay nada escrito
        estadoCell.textContent = 'Pendiente';
        estadoCell.className = 'estado-cell estado-pendiente';
    } else if (total >= 60) {
        estadoCell.textContent = 'Aprobado';
        estadoCell.className = 'estado-cell estado-aprobado';
    } else {
        estadoCell.textContent = 'Reprobado';
        estadoCell.className = 'estado-cell estado-reprobado';
    }
    actualizarEstadisticas();
}

// --- ¡FUNCIÓN SIN CAMBIOS! ---
function calcularTarjeta(card) {
    const inputs = card.querySelectorAll('.nota-input');
    const estadoCell = card.querySelector('.estado-cell'); 
    let total = 0;
    let pendiente = false;

    inputs.forEach(input => {
        let valor = parseFloat(input.value);
        const max = parseFloat(input.dataset.max);
        if (valor > max) { valor = max; input.value = max; }
        if (valor < 0) { valor = 0; input.value = 0; }
        if (input.value === '' || isNaN(valor)) {
            pendiente = true;
            valor = 0;
        }
        total += valor;
    });

    if (pendiente && total === 0) {
        estadoCell.textContent = 'Pendiente';
        estadoCell.className = 'estado-cell estado-pendiente';
    } else if (total >= 60) {
        estadoCell.textContent = 'Aprobado';
        estadoCell.className = 'estado-cell estado-aprobado';
    } else {
        estadoCell.textContent = 'Reprobado';
        estadoCell.className = 'estado-cell estado-reprobado';
    }
    actualizarEstadisticas();
}

// --- ¡FUNCIÓN SIN CAMBIOS! ---
function actualizarEstadisticas() {
    let filas = document.querySelectorAll('.calificaciones-table tbody tr');
    let selector = '.calificaciones-table .estado-cell';

    const cardsContainer = document.querySelector('.calificaciones-cards-container');
    if (window.getComputedStyle(cardsContainer).display === 'flex') {
        filas = document.querySelectorAll('.student-card');
        selector = '.student-card .estado-cell';
    }

    let aprobados = 0;
    let reprobados = 0;
    let pendientes = 0;

    filas.forEach(fila => {
        const estadoCell = fila.querySelector(selector);
        if (!estadoCell) return; // Si la fila está vacía
        
        const estado = estadoCell.textContent;
        if (estado === 'Aprobado') {
            aprobados++;
        } else if (estado === 'Reprobado') {
            reprobados++;
        } else {
            pendientes++;
        }
    });

    document.getElementById('stat-aprobados').textContent = aprobados;
    document.getElementById('stat-reprobados').textContent = reprobados;
    document.getElementById('stat-pendientes').textContent = pendientes;
}

// --- ¡FUNCIÓN ACTUALIZADA! ---
async function guardarCalificaciones() {
    const btnGuardar = document.querySelector('.btn-primary');
    btnGuardar.textContent = 'Guardando...';
    btnGuardar.disabled = true;
    
    const notasParaGuardar = [];
    const filas = document.querySelectorAll('.calificaciones-table tbody tr');
    
    filas.forEach(fila => {
        const carnet = fila.dataset.carnet;
        if (!carnet) return; // Omitir filas vacías
        
        const inputs = fila.querySelectorAll('.nota-input');
        
        // Convertir '' o null a 0 para la BD
        const parseNota = (input) => parseFloat(input.value) || 0;
        
        notasParaGuardar.push({
            carnet: carnet,
            s1: parseNota(inputs[0]),
            s2: parseNota(inputs[1]),
            s3: parseNota(inputs[2]),
            s4: parseNota(inputs[3]),
            ex: parseNota(inputs[4])
        });
    });

    try {
        const response = await fetch(`${API_URL}/api/calificaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                claseId: claseGlobal.id,
                notas: notasParaGuardar
            })
        });

        const data = await response.json();
        if (data.success) {
            mostrarMensaje('¡Calificaciones guardadas exitosamente!', 'exito');
            // Sincronizar tarjetas con la tabla (opcional pero buena idea)
            sincronizarTarjetasConTabla(notasParaGuardar);
        } else {
            throw new Error(data.message);
        }

    } catch (error) {
        console.error('Error al guardar:', error);
        mostrarMensaje(error.message, 'error');
    } finally {
        btnGuardar.textContent = 'Guardar Calificaciones';
        btnGuardar.disabled = false;
    }
}

// --- ¡NUEVA FUNCIÓN AUXILIAR! ---
// Sincroniza las tarjetas móviles con lo que se guardó desde la tabla
function sincronizarTarjetasConTabla(notasGuardadas) {
    notasGuardadas.forEach(est => {
        const card = document.querySelector(`.student-card[data-carnet="${est.carnet}"]`);
        if (card) {
            const inputs = card.querySelectorAll('.nota-input');
            inputs[0].value = est.s1 || "";
            inputs[1].value = est.s2 || "";
            inputs[2].value = est.s3 || "";
            inputs[3].value = est.s4 || "";
            inputs[4].value = est.ex || "";
            calcularTarjeta(card); // Recalcular estado de la tarjeta
        }
    });
}


function imprimirActa() {
    window.print();
}

function logout() {
    mostrarMensaje('¿Está seguro que desea cerrar sesión?', 'confirm', () => {
        localStorage.removeItem('catedraticoLogueado');
        localStorage.removeItem('claseSeleccionada');
        localStorage.removeItem('periodoSeleccionado');
        window.location.href = 'panel-catedratico.html';
    });
}

// --- ¡NUEVA FUNCIÓN DE MENSAJES! ---
// (Reemplaza alert y confirm)
function mostrarMensaje(mensaje, tipo, callbackConfirm) {
    const mensajeViejo = document.getElementById('mensaje-flotante');
    if (mensajeViejo) mensajeViejo.remove();

    const mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensaje-flotante';
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
    } else { // 'confirm'
        mensajeDiv.style.background = '#FEF3C7';
        mensajeDiv.style.color = '#92400E';
        mensajeDiv.style.border = '1px solid #FDE68A';
        
        const btnSi = document.createElement('button');
        btnSi.textContent = 'Sí';
        btnSi.style.cssText = 'background: #92400E; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;';
        btnSi.onclick = () => {
            mensajeDiv.remove();
            if (callbackConfirm) callbackConfirm();
        };
        
        const btnNo = document.createElement('button');
        btnNo.textContent = 'No';
        btnNo.style.cssText = 'background: transparent; color: #92400E; border: 1px solid #92400E; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer;';
        btnNo.onclick = () => mensajeDiv.remove();
        
        const btnWrapper = document.createElement('div');
        btnWrapper.style.display = 'flex';
        btnWrapper.style.gap = '0.5rem';
        btnWrapper.appendChild(btnSi);
        btnWrapper.appendChild(btnNo);
        mensajeDiv.appendChild(btnWrapper);
    }
    
    document.body.appendChild(mensajeDiv);
    
    if (tipo !== 'confirm') {
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => mensajeDiv.remove(), 300);
            }
        }, 4000);
    }
}
