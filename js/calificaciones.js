document.addEventListener('DOMContentLoaded', function() {
    // ... (tu código de verificación de sesión está bien) ...
    const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));
    const clase = JSON.parse(localStorage.getItem('claseSeleccionada'));

    if (!catedratico || !clase) {
        alert('Error: Sesión no válida o clase no seleccionada.');
        window.location.href = '/html/login-catedratico.html';
        return;
    }

    cargarInfoCatedratico(catedratico);
    cargarInfoClase(clase);
    cargarEstudiantes(clase.id); // 'CS102', 'PROG201', etc.
    actualizarEstadisticas();
});

function cargarInfoCatedratico(catedratico) {
    // Rellena el header
    const userInfoSpans = document.querySelectorAll('.user-info span');
    if (userInfoSpans.length >= 2) {
        userInfoSpans[0].textContent = catedratico.nombre;
        userInfoSpans[1].textContent = `Código: ${catedratico.codigo}`;
    }
}

function cargarInfoClase(clase) {
    // ... (tu función cargarInfoClase está bien) ...
    const grid = document.querySelector('.clase-info-detalle .info-grid');
    grid.innerHTML = `... (tu código para rellenar la info de la clase) ...`;
}


// --- ¡FUNCIÓN ACTUALIZADA! ---
function cargarEstudiantes(claseId) {
    const listaEstudiantes = estudiantesPorClase[claseId] || [];
    
    // Contenedor de la TABLA (Desktop)
    const tbody = document.querySelector('.calificaciones-table tbody');
    // Contenedor de las TARJETAS (Móvil)
    const cardsContainer = document.querySelector('.calificaciones-cards-container');
    
    tbody.innerHTML = ''; 
    cardsContainer.innerHTML = ''; // Limpiamos ambos

    document.getElementById('stat-total').textContent = listaEstudiantes.length;

    // Crear AMBAS estructuras para cada estudiante
    listaEstudiantes.forEach(est => {
        // --- 1. Crear Fila de Tabla ---
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${est.carnet}</td>
            <td>${est.nombre}</td>
            <td><input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15"></td>
            <td><input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15"></td>
            <td><input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15"></td>
            <td><input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15"></td>
            <td><input type="number" class="nota-input" min="0" max="40" placeholder="0-40" data-max="40"></td>
            <td class="total-cell">-</td>
            <td><span class="estado-cell estado-pendiente">Pendiente</span></td>
        `;
        
        // Agregar 'listener' a los inputs de la FILA
        tr.querySelectorAll('.nota-input').forEach(input => {
            input.addEventListener('input', () => calcularFila(tr));
        });
        tbody.appendChild(tr);

        // --- 2. Crear Tarjeta de Estudiante ---
        const card = document.createElement('div');
        card.className = 'student-card';
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
                        <input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15">
                    </div>
                    <div class="nota-item">
                        <label>S2:</label>
                        <input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15">
                    </div>
                    <div class="nota-item">
                        <label>S3:</label>
                        <input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15">
                    </div>
                    <div class="nota-item">
                        <label>S4:</label>
                        <input type="number" class="nota-input" min="0" max="15" placeholder="0-15" data-max="15">
                    </div>
                </div>
                <div class="nota-column">
                    <h4>Examen Final (40 pts)</h4>
                    <div class="nota-item">
                        <label>Examen:</label>
                        <input type="number" class="nota-input" min="0" max="40" placeholder="0-40" data-max="40">
                    </div>
                </div>
            </div>
        `;

        // Agregar 'listener' a los inputs de la TARJETA
        card.querySelectorAll('.nota-input').forEach(input => {
            input.addEventListener('input', () => calcularTarjeta(card));
        });
        cardsContainer.appendChild(card);
    });
}

// --- ¡FUNCIÓN SIN CAMBIOS! ---
function calcularFila(fila) {
    // Esta función calcula la fila de la tabla
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

    totalCell.textContent = total; // Actualiza total en tabla

    if (pendiente) {
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

// --- ¡FUNCIÓN NUEVA! ---
function calcularTarjeta(card) {
    // Esta función calcula la tarjeta (es una copia de calcularFila,
    // pero apunta a los selectores de la tarjeta)
    const inputs = card.querySelectorAll('.nota-input');
    const estadoCell = card.querySelector('.estado-cell'); // El badge de estado
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

    // En la tarjeta no hay celda de "Total", solo actualizamos el estado
    if (pendiente) {
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

// --- ¡FUNCIÓN ACTUALIZADA! ---
function actualizarEstadisticas() {
    // Esta función ahora debe decidir de dónde contar
    let filas = document.querySelectorAll('.calificaciones-table tbody tr');
    let selector = '.calificaciones-table .estado-cell';

    // Comprobar si las tarjetas están visibles
    const cardsContainer = document.querySelector('.calificaciones-cards-container');
    if (window.getComputedStyle(cardsContainer).display === 'flex') {
        filas = document.querySelectorAll('.student-card');
        selector = '.student-card .estado-cell';
    }

    let aprobados = 0;
    let reprobados = 0;
    let pendientes = 0;

    filas.forEach(fila => {
        const estado = fila.querySelector(selector).textContent;
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

// --- Tus otras funciones (logout, guardar, imprimir) ---
// (Déjalas como están)
function logout() {
    if (confirm("¿Está seguro que desea cerrar sesión?")) {
        localStorage.removeItem('catedraticoLogueado');
        localStorage.removeItem('claseSeleccionada');
        localStorage.removeItem('periodoSeleccionado');
        window.location.href = '/html/login-catedratico.html'; // Ajusta esta ruta
    }
}

function guardarCalificaciones() {
    // En un sistema real, aquí enviarías los datos a un servidor.
    // Por ahora, solo mostramos un mensaje de éxito.
    alert('¡Calificaciones guardadas exitosamente! (Simulación)');
}

function imprimirActa() {
    window.print();
}