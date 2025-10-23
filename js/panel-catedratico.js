// URL de tu backend
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del catedrático (esto se queda igual)
    cargarDatosCatedratico();
    
    // ¡NUEVO! Cargar los selects desde la base de datos
    cargarSelectsDePeriodo();
    
    // (El resto de tu código de estilos se queda igual)
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

// Carga los datos del profesor en el header (SIN CAMBIOS)
function cargarDatosCatedratico() {
    const catedratico = JSON.parse(localStorage.getItem('catedraticoLogueado'));
    if (catedratico) {
        document.getElementById('nombre-profesor').textContent = catedratico.nombre;
        document.getElementById('codigo-profesor').textContent = `Código: ${catedratico.codigo}`;
    } else {
        // Asegúrate que esta ruta sea correcta
        window.location.href = 'login-catedratico.html'; 
    }
}

// Cierra la sesión (ACTUALIZADO para no usar confirm())
function logout() {
    mostrarMensaje('¿Está seguro que desea cerrar sesión?', 'confirm', () => {
        localStorage.removeItem('catedraticoLogueado');
        localStorage.removeItem('periodoSeleccionado');
        localStorage.removeItem('claseSeleccionada');
        // Asegúrate que esta ruta sea correcta
        window.location.href = "login-catedratico.html"; 
    });
}

// --- ¡NUEVA FUNCIÓN! ---
// Carga los <select> de año y semestre desde la BD
async function cargarSelectsDePeriodo() {
    try {
        const response = await fetch(`${API_URL}/api/periodos`);
        if (!response.ok) {
            throw new Error('No se pudo cargar la información de los períodos.');
        }
        
        const data = await response.json();
        
        if (data.success) {
            const anioSelect = document.getElementById('anio-lectivo');
            const semestreSelect = document.getElementById('semestre');
            
            // Limpiar selects (dejar solo la opción por defecto)
            anioSelect.innerHTML = '<option value="">Seleccione el año</option>';
            semestreSelect.innerHTML = '<option value="">Seleccione el semestre</option>';
            
            // Llenar Años
            data.anios.forEach(anio => {
                const option = document.createElement('option');
                option.value = anio;
                option.textContent = anio;
                anioSelect.appendChild(option);
            });
            
            // Llenar Semestres
            data.semestres.forEach(semestre => {
                const option = document.createElement('option');
                option.value = semestre;
                option.textContent = (semestre == 1) ? 'Primer Semestre' : 'Segundo Semestre';
                semestreSelect.appendChild(option);
            });

            // Cargar período guardado (si existe)
            cargarPeriodoGuardado();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error cargando períodos:', error);
        mostrarMensaje(error.message, 'error');
    }
}


// Carga el período guardado (SIN CAMBIOS)
function cargarPeriodoGuardado() {
    const periodo = localStorage.getItem('periodoSeleccionado');
    if (periodo) {
        const [anio, semestre] = periodo.split('-');
        document.getElementById('anio-lectivo').value = anio;
        document.getElementById('semestre').value = semestre;
    }
}

// =============================================
// LÓGICA DE FILTRADO DE CLASE (¡ACTUALIZADA!)
// =============================================

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
    localStorage.setItem('periodoSeleccionado', periodoSeleccionado);
    
    // --- ¡NUEVA LÓGICA DE FETCH! ---
    try {
        const response = await fetch(`${API_URL}/api/clases?periodo=${periodoSeleccionado}&catedratico=${catedratico.codigo}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarClasesEncontradas(data.clases);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error buscando clases:', error);
        mostrarMensaje(error.message, 'error');
    }
}

function mostrarClasesEncontradas(clases) {
    const seccionLista = document.getElementById('lista-clases-section');
    const container = document.getElementById('clases-container');
    const btnGestionar = document.getElementById('btn-gestionar');

    container.innerHTML = '';
    localStorage.removeItem('claseSeleccionada');
    btnGestionar.disabled = true;

    if (clases.length === 0) {
        container.innerHTML = '<p>No se encontraron clases asignadas para usted en este período.</p>';
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
    seccionLista.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function procederGestionar() {
    const claseSeleccionada = localStorage.getItem('claseSeleccionada');
    
    if (claseSeleccionada) {
        // Asegúrate que esta ruta sea correcta
        window.location.href = 'registroDecalificaciones.html'; 
    } else {
        mostrarMensaje('Por favor seleccione una clase de la lista', 'error');
    }
}


/**
 * Función para mostrar mensajes (ACTUALIZADA para no usar alert/confirm)
 * tipo = 'exito', 'error', o 'confirm'
 */
function mostrarMensaje(mensaje, tipo, callbackConfirm) {
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
    
    // Autocerrar solo si NO es confirmación
    if (tipo !== 'confirm') {
        setTimeout(() => {
            if (mensajeDiv.parentNode) {
                mensajeDiv.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => mensajeDiv.remove(), 300);
            }
        }, 4000);
    }
}

