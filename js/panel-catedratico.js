// URL de tu backend
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    
    cargarDatosCatedratico();
    
    inicializarPanel();

    // (El código de animación de 'mostrarMensaje' se queda igual)
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

// Carga los datos del profesor en el header (Sin cambios)
function cargarDatosCatedratico() {
    const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));
    if (catedratico) {
        document.getElementById('nombre-profesor').textContent = catedratico.nombre;
        document.getElementById('codigo-profesor').textContent = `Código: ${catedratico.codigo}`;
    } else {
        window.location.href = 'login-catedratico.html'; 
    }
}

// Cierra la sesión (Sin cambios)
function logout() {
    mostrarMensaje('¿Está seguro que desea cerrar sesión?', 'confirm', () => {
        localStorage.removeItem('catedraticoLogueado');
        localStorage.removeItem('periodoSeleccionado');
        localStorage.removeItem('claseSeleccionada');
        window.location.href = "login-catedratico.html"; 
    });
}


// Se ejecuta al cargar la página. Obtiene el periodo actual y carga todo.
async function inicializarPanel() {
    try {
        const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));
        if (!catedratico || !catedratico.codigo) {
            mostrarMensaje('Error de autenticación.', 'error');
            return;
        }

        // 1. Obtener los periodos disponibles
        const response = await fetch(`${API_URL}/api/periodos`);
        if (!response.ok) throw new Error('No se pudo cargar la información de los períodos.');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message);

        // 2. Llenar los dropdowns (para la búsqueda antigua)
        llenarSelectsDePeriodo(data.anios, data.semestres);

        // 3. Determinar el periodo actual (el más reciente)
        const anioActual = data.anios[0]; // anios viene en DESC
        const semestreActual = data.semestres[data.semestres.length - 1]; // semestres en ASC
        const periodoActualString = `${anioActual}-${semestreActual}`;

        // 4. Mostrar el periodo actual en la UI
        document.getElementById('periodo-actual-display').textContent = `Año ${anioActual} - ${semestreActual == 1 ? 'Primer' : 'Segundo'} Semestre`;
        
        // 5. Cargar clases del periodo actual
        await cargarClasesPeriodoActual(periodoActualString, catedratico.codigo);

    } catch (error) {
        console.error('Error inicializando panel:', error);
        mostrarMensaje(error.message, 'error');
    }
}

async function cargarClasesPeriodoActual(periodo, codigoCatedratico) {
    try {
        const response = await fetch(`${API_URL}/api/clases?periodo=${periodo}&catedratico=${codigoCatedratico}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarClasesEncontradas(data.clases, 'actual'); // 'actual' es el nuevo tipo
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error cargando clases actuales:', error);
        mostrarMensaje(error.message, 'error');
        document.getElementById('clases-container').innerHTML = '<p>Error al cargar las clases.</p>';
    }
}
function llenarSelectsDePeriodo(anios, semestres) {
    const anioSelect = document.getElementById('anio-lectivo');
    const semestreSelect = document.getElementById('semestre');
    
    anioSelect.innerHTML = '<option value="">Seleccione el año</option>';
    semestreSelect.innerHTML = '<option value="">Seleccione el semestre</option>';
    
    anios.forEach(anio => {
        const option = document.createElement('option');
        option.value = anio;
        option.textContent = anio;
        anioSelect.appendChild(option);
    });
    
    semestres.forEach(semestre => {
        const option = document.createElement('option');
        option.value = semestre;
        option.textContent = (semestre == 1) ? 'Primer Semestre' : 'Segundo Semestre';
        semestreSelect.appendChild(option);
    });
}
function toggleBusquedaAntigua() {
    const wrapper = document.getElementById('selector-antiguo-wrapper');
    const btn = document.getElementById('btn-ver-anteriores');
    
    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Buscador';
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        wrapper.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-calendar-alt"></i> Ver Semestres Anteriores';
    }
}
async function buscarClases() {
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
    // No guardamos esto en localStorage, para no confundirlo con el periodo actual
    
    try {
        const response = await fetch(`${API_URL}/api/clases?periodo=${periodoSeleccionado}&catedratico=${catedratico.codigo}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarClasesEncontradas(data.clases, 'busqueda'); // 'busqueda' es el nuevo tipo
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error buscando clases:', error);
        mostrarMensaje(error.message, 'error');
    }
}

// MODIFICADA: Acepta un 'tipo' para cambiar el título
function mostrarClasesEncontradas(clases, tipo = 'actual') {
    const seccionLista = document.getElementById('lista-clases-section');
    const container = document.getElementById('clases-container');
    const btnGestionar = document.getElementById('btn-gestionar');
    const titulo = document.getElementById('lista-clases-titulo');

    // Actualizar título
    if (tipo === 'actual') {
        titulo.textContent = 'Mis Clases (Periodo Actual)';
    } else {
        titulo.textContent = 'Resultados de la Búsqueda';
    }

    container.innerHTML = '';
    localStorage.removeItem('claseSeleccionada');
    btnGestionar.disabled = true;

    if (clases.length === 0) {
        if (tipo === 'actual') {
            container.innerHTML = '<p>No tiene clases asignadas para el periodo actual.</p>';
        } else {
            container.innerHTML = '<p>No se encontraron clases asignadas para usted en este período.</p>';
        }
        seccionLista.style.display = 'block';
        return;
    }

    clases.forEach(clase => {
        const card = document.createElement('label');
        card.className = 'clase-radio-card';
        
        card.innerHTML = `
            <input type="radio" name="clase-seleccionada" value='${JSON.stringify(clase)}'>
            <h4>${clase.nombre}</h4>
            <p><strong>ID:</strong> ${clase.id}</p>
            <p><strong>Carrera:</strong> ${clase.carrera}</p>
            <p><strong>Horario:</strong> ${clase.horario}</p>
        `;
        
        card.querySelector('input').addEventListener('change', function() {
            if (this.checked) {
                localStorage.setItem('claseSeleccionada', this.value); 
                btnGestionar.disabled = false;
            }
        });

        container.appendChild(card);
    });

    seccionLista.style.display = 'block';
    // No hacemos scroll automático, solo si es una búsqueda
    if (tipo === 'busqueda') {
        seccionLista.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Sin cambios
function procederGestionar() {
    const claseSeleccionada = localStorage.getItem('claseSeleccionada');
    
    if (claseSeleccionada) {
        window.location.href = 'registroDecalificaciones.html'; 
    } else {
        mostrarMensaje('Por favor seleccione una clase de la lista', 'error');
    }
}

// Sin cambios
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