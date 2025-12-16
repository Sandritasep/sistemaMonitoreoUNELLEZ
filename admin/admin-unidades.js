// ========================================
// Lógica para gestión de unidades de bus
// ========================================

// Variable para almacenar las unidades
let unidadesBus = [];

// Función para mostrar tabla de unidades
function mostrarTablaUnidades() {
    console.log('mostrando tabla unidades...');

    // Ocultar otras secciones
    const tablaRutas = document.getElementById('tablaRutas');
    const formularioRuta = document.getElementById('formularioRuta');
    const formularioUnidad = document.getElementById('formularioUnidad');
    const accionesUnid = document.getElementById('accionesUnidad');
    const accionesRuta = document.getElementById('accionesRuta');
    const statsUnid = document.querySelector('#rutasSection .admin-stats');
    
    if (accionesRuta) accionesRuta.style.display = 'none';
    if (tablaRutas) tablaRutas.style.display = 'none';
    if (formularioRuta) formularioRuta.style.display = 'none';
    if (formularioUnidad) formularioUnidad.style.display = 'none';
    if (accionesUnid) accionesUnid.style.display = 'block';
    if (statsUnid) statsUnid.style.display = 'grid';
    
    // Mostrar tabla de unidades
    document.getElementById('tablaUnidades').style.display = 'block';
    document.getElementById('accionesRuta').style.display = 'none';

    // Actualizar estado activo del stat
    const statUnidades = document.getElementById('statUnidades');
    if (statUnidades) {
        // Remover active de todos los stats primero
        document.querySelectorAll('.stat-card').forEach(card => {
            if (card.classList) {
                card.classList.remove('active');
            }
        });
        statUnidades.classList.add('active');
    }

    // Mostrar tabla de unidades
    const tablaUnidades = document.getElementById('tablaUnidades');
    if (tablaUnidades) tablaUnidades.style.display = 'block';
    
    // Cargar unidades si no están cargadas
    if (unidadesBus.length === 0) {
        cargarUnidadesDesdeStorage();
    } else {
        actualizarTablaUnidades();
    }
}

// Función para mostrar formulario de nueva unidad
function mostrarFormularioUnidad() {
    const statsRutas = document.querySelector('#rutasSection .admin-stats');
    const accionesUnid = document.getElementById('accionesUnidad');
    const tablaUnid = document.getElementById('tablaUnidades');
    document.getElementById('formularioUnidad').style.display = 'block';
    
    if (statsRutas) statsRutas.style.display = 'none';
    if (accionesUnid) accionesUnid.style.display = 'none';
    if (tablaUnid) tablaUnid.style.display = 'none';

    // Limpiar formulario
    document.getElementById('formNuevaUnidad').reset();
    
    // Generar ID automático si está vacío
    if (!document.getElementById('idUnidad').value) {
        generarIdUnidadAutomatico();
    }
    
    // Establecer fecha actual como predeterminada
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaAdquisicion').value = hoy;
}

// Función para generar ID automático
function generarIdUnidadAutomatico() {
    const ultimaUnidad = unidadesBus[unidadesBus.length - 1];
    let nuevoNumero = 1;
    
    if (ultimaUnidad && ultimaUnidad.id) {
        const match = ultimaUnidad.id.match(/BUS-(\d+)/);
        if (match) {
            nuevoNumero = parseInt(match[1]) + 1;
        }
    }
    
    const nuevoId = `BUS-${nuevoNumero.toString().padStart(3, '0')}`;
    document.getElementById('idUnidad').value = nuevoId;
}

// Función para cargar unidades desde localStorage
function cargarUnidadesDesdeStorage() {
    try {
        const unidadesGuardadas = localStorage.getItem('unidadesBus');
        if (unidadesGuardadas) {
            unidadesBus = JSON.parse(unidadesGuardadas);
        } else {
            // Datos de ejemplo
            unidadesBus = [
                {
                    id: 'BUS-001',
                    placa: 'ABC-123',
                    modelo: 'Yutong ZK6128HGA',
                    año: 2022,
                    capacidad: 40,
                    color: 'Blanco con franjas azules',
                    combustible: 'Diesel',
                    kilometraje: 15000,
                    características: 'Aire acondicionado, WiFi, USB, rampa para discapacitados',
                    estado: 'Disponible',
                    fechaAdquisicion: '2022-05-15',
                    observaciones: 'Unidad en perfecto estado'
                },
                {
                    id: 'BUS-002',
                    placa: 'DEF-456',
                    modelo: 'Mercedes Benz OH-1621',
                    año: 2020,
                    capacidad: 35,
                    color: 'Azul con franjas blancas',
                    combustible: 'Diesel',
                    kilometraje: 45000,
                    características: 'Aire acondicionado, asientos reclinables',
                    estado: 'En Mantenimiento',
                    fechaAdquisicion: '2020-03-10',
                    observaciones: 'En mantenimiento preventivo'
                },
                {
                    id: 'BUS-003',
                    placa: 'GHI-789',
                    modelo: 'Volvo B8R',
                    año: 2023,
                    capacidad: 45,
                    color: 'Rojo con franjas amarillas',
                    combustible: 'Diesel',
                    kilometraje: 8000,
                    características: 'Aire acondicionado, WiFi, TV, baño',
                    estado: 'En Ruta',
                    fechaAdquisicion: '2023-01-20',
                    observaciones: 'Asignado a Ruta 001'
                }
            ];
            guardarUnidadesEnStorage();
        }
        
        actualizarTablaUnidades();
        actualizarContadorUnidades();
    } catch (error) {
        console.error('Error cargando unidades:', error);
        mostrarNotificacion('Error al cargar las unidades de bus', 'error');
    }
}

// Función para guardar unidades en localStorage
function guardarUnidadesEnStorage() {
    try {
        localStorage.setItem('unidadesBus', JSON.stringify(unidadesBus));
    } catch (error) {
        console.error('Error guardando unidades:', error);
        mostrarNotificacion('Error al guardar las unidades', 'error');
    }
}

// Función para actualizar tabla de unidades
function actualizarTablaUnidades() {
    const cuerpoTabla = document.getElementById('cuerpoTablaUnidades');
    if (!cuerpoTabla) return;
    
    cuerpoTabla.innerHTML = '';
    
    if (unidadesBus.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="7" class="no-users">
                    <i class="fas fa-bus"></i>
                    <p>No hay unidades registradas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    unidadesBus.forEach((unidad, index) => {
        const fila = document.createElement('tr');
        
        // Determinar clase de estado
        let claseEstado = '';
        switch(unidad.estado) {
            case 'Disponible':
                claseEstado = 'estado-disponible';
                break;
            case 'En Mantenimiento':
                claseEstado = 'estado-mantenimiento';
                break;
            case 'En Ruta':
                claseEstado = 'estado-enruta';
                break;
            case 'Inactivo':
                claseEstado = 'estado-inactivo';
                break;
        }
        
        fila.innerHTML = `
            <td>
                <strong>${unidad.id}</strong>
            </td>
            <td>${unidad.placa}</td>
            <td>${unidad.modelo}</td>
            <td>${unidad.año}</td>
            <td>${unidad.capacidad} pasajeros</td>
            <td>
                <span class="estado-unidad ${claseEstado}">${unidad.estado}</span>
            </td>
            <td>
                <button class="btn-edit" onclick="verDetallesUnidad(${index})">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn-edit" onclick="editarUnidad(${index})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarUnidad(${index})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    // Actualizar contador
    document.getElementById('contadorResultadosUnidades').innerHTML = 
        `Mostrando <strong>${unidadesBus.length}</strong> de <strong>${unidadesBus.length}</strong> unidades`;
}

// Función para actualizar contador en estadísticas de rutas
function actualizarContadorUnidadesEstadisticas() {
    const totalUnidadesEl = document.getElementById('totalUnidades');
    if (totalUnidadesEl) {
        totalUnidadesEl.textContent = unidadesBus.length;
    }
}

// Función para actualizar contador de unidades
function actualizarContadorUnidades() {
    document.getElementById('totalUnidades').textContent = unidadesBus.length;
    actualizarContadorUnidadesEstadisticas();
}

// Función para guardar nueva unidad
function guardarNuevaUnidad(event) {
    event.preventDefault();
    
    // Validar ID único
    const idUnidad = document.getElementById('idUnidad').value.trim();
    if (unidadesBus.some(u => u.id === idUnidad)) {
        mostrarNotificacion('El ID de unidad ya existe. Por favor use otro.', 'error');
        return;
    }
    
    // Validar placa única
    const placaUnidad = document.getElementById('placaUnidad').value.trim();
    if (unidadesBus.some(u => u.placa === placaUnidad)) {
        mostrarNotificacion('La placa ya está registrada.', 'error');
        return;
    }
    
    // Crear objeto unidad
    const nuevaUnidad = {
        id: idUnidad,
        placa: placaUnidad,
        modelo: document.getElementById('modeloUnidad').value.trim(),
        año: parseInt(document.getElementById('anoUnidad').value),
        capacidad: parseInt(document.getElementById('capacidadUnidad').value),
        color: document.getElementById('colorUnidad').value.trim() || 'No especificado',
        combustible: document.getElementById('combustibleUnidad').value,
        kilometraje: document.getElementById('kilometrajeUnidad').value ? 
                     parseInt(document.getElementById('kilometrajeUnidad').value) : 0,
        características: document.getElementById('caracteristicasUnidad').value.trim() || 'Sin características especiales',
        estado: document.getElementById('estadoUnidad').value,
        fechaAdquisicion: document.getElementById('fechaAdquisicion').value,
        observaciones: document.getElementById('observacionesUnidad').value.trim() || 'Sin observaciones',
        fechaRegistro: new Date().toISOString()
    };
    
    // Agregar unidad
    unidadesBus.push(nuevaUnidad);
    guardarUnidadesEnStorage();
    actualizarTablaUnidades();
    actualizarContadorUnidades();

    // Exportar a ventana global para otras funciones
    window.unidadesBus = unidadesBus;
    
    // Mostrar notificación
    mostrarNotificacion(`Unidad ${nuevaUnidad.id} registrada exitosamente`, 'success');
    
    // Volver a la tabla
    mostrarTablaUnidades();
}

// Función para ver detalles de unidad
function verDetallesUnidad(index) {
    console.log('mostrando detalles unidad - indice: ', index);
    console.log('Unidad indice ', index, ': ', unidadesBus[index]);

    const unidad = unidadesBus[index];

    // Verificar si el modal ya existe y removerlo
    const modalExistente = document.getElementById('modalDetallesUnidad');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Crear modal de detalles
    const detallesHTML = `
        <div class="modal" id="modalDetallesUnidad">
            <div class="modal-overlay"></div>
            <div class="modal-content large">
                <div class="modal-step-header">
                    <h2><i class="fas fa-bus"></i> Detalles de Unidad</h2>
                    <button class="modal-close-btn" onclick="cerrarModalDetalles()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="data-summary">
                    <h3><i class="fas fa-info-circle"></i> Información General</h3>
                    <div class="summary-grid">
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-hashtag"></i> ID Unidad</div>
                            <div class="summary-value"><strong>${unidad.id}</strong></div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-car"></i> Placa</div>
                            <div class="summary-value">${unidad.placa}</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-cogs"></i> Modelo</div>
                            <div class="summary-value">${unidad.modelo}</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-calendar-alt"></i> Año</div>
                            <div class="summary-value">${unidad.año}</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-users"></i> Capacidad</div>
                            <div class="summary-value">${unidad.capacidad} pasajeros</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-palette"></i> Color</div>
                            <div class="summary-value">${unidad.color}</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-gas-pump"></i> Combustible</div>
                            <div class="summary-value">${unidad.combustible}</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-tachometer-alt"></i> Kilometraje</div>
                            <div class="summary-value">${unidad.kilometraje.toLocaleString()} km</div>
                        </div>
                    </div>
                </div>
                
                <div class="data-summary">
                    <h3><i class="fas fa-clipboard-check"></i> Estado y Mantenimiento</h3>
                    <div class="summary-grid">
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-clipboard-check"></i> Estado</div>
                            <div class="summary-value">
                                <span class="estado-unidad ${getClaseEstado(unidad.estado)}">
                                    ${unidad.estado}
                                </span>
                            </div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-calendar-day"></i> Fecha Adquisición</div>
                            <div class="summary-value">${formatearFecha(unidad.fechaAdquisicion)}</div>
                        </div>
                        <div class="summary-row">
                            <div class="summary-label"><i class="fas fa-clock"></i> Fecha Registro</div>
                            <div class="summary-value">${formatearFecha(unidad.fechaRegistro)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="data-summary">
                    <h3><i class="fas fa-star"></i> Características Especiales</h3>
                    <p style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin: 0;">
                        ${unidad.características}
                    </p>
                </div>
                
                ${unidad.observaciones ? `
                <div class="data-summary">
                    <h3><i class="fas fa-sticky-note"></i> Observaciones</h3>
                    <p style="padding: 10px; background: #f8f9fa; border-radius: 6px; margin: 0;">
                        ${unidad.observaciones}
                    </p>
                </div>
                ` : ''}
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="cerrarModalDetalles()">
                        <i class="fas fa-times"></i> Cerrar
                    </button>
                    <button type="button" class="btn-edit" onclick="editarUnidad(${index}); cerrarModalDetalles()">
                        <i class="fas fa-edit"></i> Editar Unidad
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // FORMA CORRECTA DE INSERTAR EL MODAL:
    // Crear un div temporal
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = detallesHTML;
    
    // Obtener el elemento modal
    const modalElement = tempDiv.querySelector('#modalDetallesUnidad');
    
    if (!modalElement) {
        console.error('No se pudo crear el elemento modal');
        return;
    }
    
    // Insertar el modal directamente en el body
    document.body.appendChild(modalElement);
    
    // Mostrar modal inmediatamente
    modalElement.classList.add('active');
    
    console.log('Modal creado y mostrado correctamente');
}

// Función auxiliar para obtener clase de estado
function getClaseEstado(estado) {
    switch(estado) {
        case 'Disponible': return 'estado-disponible';
        case 'En Mantenimiento': return 'estado-mantenimiento';
        case 'Inactivo': return 'estado-inactivo';
        default: return '';
    }
}

// Función para formatear fecha
function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para cerrar modal de detalles
function cerrarModalDetalles() {
    const modal = document.getElementById('modalDetallesUnidad');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Función para editar unidad
function editarUnidad(index) {
    const unidad = unidadesBus[index];
    
    // Mostrar formulario
    mostrarFormularioUnidad();
    
    // Llenar formulario con datos de la unidad
    document.getElementById('idUnidad').value = unidad.id;
    document.getElementById('placaUnidad').value = unidad.placa;
    document.getElementById('modeloUnidad').value = unidad.modelo;
    document.getElementById('anoUnidad').value = unidad.año;
    document.getElementById('capacidadUnidad').value = unidad.capacidad;
    document.getElementById('colorUnidad').value = unidad.color;
    document.getElementById('combustibleUnidad').value = unidad.combustible;
    document.getElementById('kilometrajeUnidad').value = unidad.kilometraje;
    document.getElementById('caracteristicasUnidad').value = unidad.características;
    document.getElementById('estadoUnidad').value = unidad.estado;
    document.getElementById('fechaAdquisicion').value = unidad.fechaAdquisicion;
    document.getElementById('observacionesUnidad').value = unidad.observaciones;
    
    // Cambiar evento del formulario para actualizar
    const form = document.getElementById('formNuevaUnidad');
    form.onsubmit = function(e) {
        e.preventDefault();
        actualizarUnidad(index);
    };
    
    // Cambiar texto del botón
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Unidad';
    submitBtn.onclick = function(e) {
        e.preventDefault();
        actualizarUnidad(index);
    };
}

// Función para actualizar unidad
function actualizarUnidad(index) {
    const unidadActualizada = {
        id: document.getElementById('idUnidad').value.trim(),
        placa: document.getElementById('placaUnidad').value.trim(),
        modelo: document.getElementById('modeloUnidad').value.trim(),
        año: parseInt(document.getElementById('anoUnidad').value),
        capacidad: parseInt(document.getElementById('capacidadUnidad').value),
        color: document.getElementById('colorUnidad').value.trim() || 'No especificado',
        combustible: document.getElementById('combustibleUnidad').value,
        kilometraje: document.getElementById('kilometrajeUnidad').value ? 
                     parseInt(document.getElementById('kilometrajeUnidad').value) : 0,
        características: document.getElementById('caracteristicasUnidad').value.trim() || 'Sin características especiales',
        estado: document.getElementById('estadoUnidad').value,
        fechaAdquisicion: document.getElementById('fechaAdquisicion').value,
        observaciones: document.getElementById('observacionesUnidad').value.trim() || 'Sin observaciones',
        fechaRegistro: unidadesBus[index].fechaRegistro // Mantener fecha original
    };
    
    // Actualizar unidad
    unidadesBus[index] = unidadActualizada;
    guardarUnidadesEnStorage();
    actualizarTablaUnidades();
    
    // Mostrar notificación
    mostrarNotificacion(`Unidad ${unidadActualizada.id} actualizada exitosamente`, 'success');
    
    // Volver a la tabla
    mostrarTablaUnidades();
}

// Función para eliminar unidad
function eliminarUnidad(index) {
    const unidad = unidadesBus[index];
    
    if (confirm(`¿Está seguro de eliminar la unidad ${unidad.id} (${unidad.placa})?`)) {
        // Verificar si la unidad está asignada a alguna ruta
        const rutas = JSON.parse(localStorage.getItem('rutas') || '[]');
        const unidadEnUso = rutas.some(ruta => 
            ruta.unidades && ruta.unidades.includes(unidad.id)
        );
        
        if (unidadEnUso) {
            mostrarNotificacion(`No se puede eliminar. La unidad ${unidad.id} está asignada a una ruta.`, 'error');
            return;
        }
        
        // Eliminar unidad
        unidadesBus.splice(index, 1);
        guardarUnidadesEnStorage();
        actualizarTablaUnidades();
        actualizarContadorUnidades();
        
        // Mostrar notificación
        mostrarNotificacion(`Unidad ${unidad.id} eliminada exitosamente`, 'success');
    }
}

// Función para filtrar columnas en tabla de unidades
function filtrarColumnaUnidad(input) {
    const columna = parseInt(input.getAttribute('data-columna'));
    const valor = input.value.toLowerCase();
    const filas = document.querySelectorAll('#cuerpoTablaUnidades tr');
    
    let visibleCount = 0;
    
    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length > 0) {
            const textoCelda = celdas[columna].textContent.toLowerCase();
            if (textoCelda.includes(valor)) {
                fila.style.display = '';
                visibleCount++;
            } else {
                fila.style.display = 'none';
            }
        }
    });
    
    document.getElementById('contadorResultadosUnidades').innerHTML = 
        `Mostrando <strong>${visibleCount}</strong> de <strong>${unidadesBus.length}</strong> unidades`;
}

// Función para limpiar filtros de unidades
function limpiarFiltrosUnidades() {
    document.querySelectorAll('.filtro-columna-unidad').forEach(input => {
        if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else {
            input.value = '';
        }
        filtrarColumnaUnidad(input);
    });
}

// Función para cargar unidades en formulario de ruta
function cargarUnidadesParaRuta() {
    const contenedor = document.getElementById('contenedorUnidades');
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (unidadesBus.length === 0) {
        contenedor.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No hay unidades registradas. Primero registre unidades en la sección "Unidades bus"</p>
            </div>
        `;
        return;
    }
    
    unidadesBus.forEach((unidad, index) => {
        const checkbox = document.createElement('div');
        checkbox.className = 'checkbox-item';
        checkbox.innerHTML = `
            <input type="checkbox" id="unidad-${index}" name="unidades" value="${unidad.id}">
            <label for="unidad-${index}">
                <strong>${unidad.id}</strong> - ${unidad.placa}<br>
                <small>${unidad.modelo} | ${unidad.capacidad} pax | ${unidad.estado}</small>
            </label>
        `;
        contenedor.appendChild(checkbox);
    });
}

// Exportar funciones
window.mostrarTablaUnidades = mostrarTablaUnidades;
window.mostrarFormularioUnidad = mostrarFormularioUnidad;
window.cargarUnidadesDesdeStorage = cargarUnidadesDesdeStorage;
window.guardarNuevaUnidad = guardarNuevaUnidad;
window.verDetallesUnidad = verDetallesUnidad;
window.editarUnidad = editarUnidad;
window.eliminarUnidad = eliminarUnidad;
window.filtrarColumnaUnidad = filtrarColumnaUnidad;
window.limpiarFiltrosUnidades = limpiarFiltrosUnidades;
window.cerrarModalDetalles = cerrarModalDetalles;
window.unidadesBus = unidadesBus;