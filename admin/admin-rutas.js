// ========================================
// ADMIN-RUTAS.JS - Gestión de rutas
// ========================================

// Variables específicas de rutas
let unidadesDisponibles = [];

// Función para cargar unidades desde el sistema de unidades
function cargarUnidadesParaRuta() {
    if (typeof window.unidadesBus !== 'undefined' && Array.isArray(window.unidadesBus)) {
        // Transformar las unidades del sistema al formato que necesita el formulario
        unidadesDisponibles = window.unidadesBus.map(unidad => ({
            id: unidad.id,
            nombre: `${unidad.id} - ${unidad.placa}`,
            estado: unidad.estado,
            modelo: unidad.modelo,
            capacidad: unidad.capacidad
        }));
    }
    
    const contenedorUnidades = document.getElementById('contenedorUnidades');
    if (!contenedorUnidades) return;
    
    contenedorUnidades.innerHTML = '';
    
    if (unidadesDisponibles.length === 0) {
        contenedorUnidades.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No hay unidades registradas. Primero registre unidades en la sección "Unidades bus"</p>
                <button type="button" class="btn btn-secondary" onclick="mostrarTablaUnidades()" 
                    style="margin-top: 10px;">
                    <i class="fas fa-bus"></i> Ir a Unidades
                </button>
            </div>
        `;
        return;
    }
    
    unidadesDisponibles.forEach(unidad => {
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
            default:
                claseEstado = 'estado-inactivo';
        }
        
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        checkboxItem.innerHTML = `
            <input type="checkbox" id="${unidad.id}" name="unidades" value="${unidad.id}">
            <label for="${unidad.id}">
                <strong>${unidad.nombre}</strong><br>
                <small>${unidad.modelo || 'Sin modelo'} | ${unidad.capacidad || 'N/A'} pax</small><br>
                <span class="estado-unidad ${claseEstado}">${unidad.estado}</span>
            </label>
        `;
        contenedorUnidades.appendChild(checkboxItem);
    });
}

// Mostrar contenido de rutas (tabla + botón)
function mostrarContenidoRutas() {
    console.log('mostrando tabla de rutas...');

    const accionesRuta = document.getElementById('accionesRuta');
    const accionesUnidad = document.getElementById('accionesUnidad');
    const tablaRutas = document.getElementById('tablaRutas');
    const tablaUnid = document.getElementById('tablaUnidades');
    const formularioUnidad = document.getElementById('formularioUnidad');
    const formularioRuta = document.getElementById('formularioRuta');
    const statsRutas = document.querySelector('#rutasSection .admin-stats');
    
    // Mostrar
    if (statsRutas) statsRutas.style.display = 'grid';
    if (accionesRuta) accionesRuta.style.display = 'flex';
    if (tablaRutas) tablaRutas.style.display = 'block';
    
    // Ocultar
    if (tablaUnid) tablaUnid.style.display = 'none';
    if (formularioUnidad) formularioUnidad.style.display = 'none';
    if (formularioRuta) formularioRuta.style.display = 'none';
    if (accionesUnidad) accionesUnidad.style.display = 'none';
    
    cargarRutas();
}


// Mostrar formulario de ruta
function mostrarFormularioRuta() {
    const accionesRuta = document.getElementById('accionesRuta');
    const tablaRutas = document.getElementById('tablaRutas');
    const formularioRuta = document.getElementById('formularioRuta');
    const statsRutas = document.querySelector('#rutasSection .admin-stats');
    
    // Ocultar: stats, botón y tabla
    if (statsRutas) statsRutas.style.display = 'none';
    if (accionesRuta) accionesRuta.style.display = 'none';
    if (tablaRutas) tablaRutas.style.display = 'none';
    
    // Mostrar formulario
    if (formularioRuta) {
        formularioRuta.style.display = 'block';
        
        // Resetear formulario
        document.getElementById('formNuevaRutaCompleta').reset();
        document.getElementById('numeroRuta').value = '';
        document.getElementById('nombreRuta').value = '';
        document.getElementById('descripcionRuta').value = '';
        document.getElementById('estadoRuta').value = 'Activa';
        
        // Cargar unidades disponibles desde el sistema
        if (typeof cargarUnidadesParaRuta === 'function') {
            cargarUnidadesParaRuta();
        }
        
        // Inicializar mapa
        if (typeof inicializarMapa === 'function') {
            setTimeout(() => {
                inicializarMapa();
            }, 100);
        }
    }
}

// Cargar rutas desde localStorage
function cargarRutas() {
    console.log('Cargando rutas...');
    
    let rutasDB;
    try {
        rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
    } catch (error) {
        console.error('Error al cargar rutas:', error);
        rutasDB = {};
    }
    
    // Convertir a array
    window.rutas = Object.keys(rutasDB).map(clave => ({
        id: clave,
        ...rutasDB[clave]
    }));
    
    console.log('Rutas cargadas:', window.rutas.length);

    // Cargar unidades para mostrar en la tabla
    if (typeof cargarUnidadesParaRuta === 'function') {
        cargarUnidadesParaRuta();
    }
    
    // Actualizar estadísticas
    actualizarEstadisticasRutas(window.rutas);
    
    // Renderizar tabla si está visible
    if (document.getElementById('tablaRutas') && document.getElementById('tablaRutas').style.display === 'block') {
        renderizarTablaRutas(window.rutas);
    }
}

// Renderizar tabla de rutas
function renderizarTablaRutas(listaRutas) {
    const cuerpoTabla = document.getElementById('cuerpoTablaRutas');
    const contadorResultados = document.getElementById('contadorResultadosRutas');
    
    if (!cuerpoTabla) return;
    
    // Aplicar filtros
    listaRutas = aplicarFiltrosRutas(listaRutas);
    
    if (listaRutas.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6" class="no-users">
                    <i class="fas fa-route"></i>
                    <h3>No hay rutas registradas</h3>
                    <p>Presiona "Nueva Ruta" para crear una</p>
                </td>
            </tr>
        `;
        
        if (contadorResultados) {
            contadorResultados.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> rutas`;
        }
        return;
    }
    
    cuerpoTabla.innerHTML = '';
    
    listaRutas.forEach(ruta => {
        const fila = document.createElement('tr');
        
        // Formatear unidades
        const unidadesFormateadas = Array.isArray(ruta.unidades) 
            ? ruta.unidades.map(unidadId => {
                const unidad = unidadesDisponibles.find(u => u.id === unidadId);
                return unidad ? unidad.nombre : unidadId;
            }).join(', ')
            : ruta.unidad || 'No asignada';
        
        // Contar puntos
        const totalPuntosRecorrido = ruta.puntosRecorrido ? ruta.puntosRecorrido.length : 0;
        const totalPuntosParada = ruta.puntosParada ? ruta.puntosParada.length : 0;
        
        // Estado
        const estado = ruta.estado || 'Activa';
        const claseEstado = estado === 'Activa' ? 'status-active' : 'status-inactive';
        
        fila.innerHTML = `
            <td><strong>${ruta.numero || 'N/A'}</strong></td>
            <td>
                <strong>${ruta.nombre}</strong>
                ${ruta.descripcion ? `<br><small>${ruta.descripcion.substring(0, 50)}${ruta.descripcion.length > 50 ? '...' : ''}</small>` : ''}
            </td>
            <td>${unidadesFormateadas}</td>
            <td>
                <div class="info-puntos">
                    <span class="badge-dias">${totalPuntosRecorrido} puntos recorrido</span>
                    <span class="badge-turnos">${totalPuntosParada} paradas</span>
                </div>
            </td>
            <td><span class="user-status ${claseEstado}">${estado}</span></td>
            <td>
                <button class="btn-edit" onclick="verDetallesRuta('${ruta.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn-edit" onclick="editarRuta('${ruta.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarRuta('${ruta.id}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${listaRutas.length}</strong> de <strong>${window.rutas.length}</strong> rutas`;
    }
}

// Aplicar filtros a rutas
function aplicarFiltrosRutas(listaRutas) {
    let filtrados = [...listaRutas];
    
    window.filtrosRutas.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(ruta => {
            switch(indice) {
                case 0: // Número
                    return (ruta.numero || '').toLowerCase().includes(filtro);
                case 1: // Nombre
                    return (ruta.nombre || '').toLowerCase().includes(filtro);
                case 2: // Unidad
                    const unidades = Array.isArray(ruta.unidades) 
                        ? ruta.unidades.join(' ').toLowerCase()
                        : (ruta.unidad || '').toLowerCase();
                    return unidades.includes(filtro);
                case 3: // Estado
                    const estado = (ruta.estado || 'Activa').toLowerCase();
                    return estado.includes(filtro);
                default:
                    return true;
            }
        });
    });
    
    return filtrados;
}

// Filtrar por columna en tabla de rutas
function filtrarColumnaRuta(input) {
    const indiceColumna = parseInt(input.dataset.columna);
    const valor = input.value.toLowerCase();
    
    window.filtrosRutas[indiceColumna] = valor;
    renderizarTablaRutas(window.rutas);
}

// Limpiar filtros de rutas
function limpiarFiltrosRutas() {
    window.filtrosRutas = ['', '', '', ''];
    document.querySelectorAll('#tablaRutas .filtro-columna-ruta').forEach(input => {
        input.value = '';
    });
    renderizarTablaRutas(window.rutas);
}

// Cargar unidades disponibles
function cargarUnidadesDisponibles() {
    const contenedorUnidades = document.getElementById('contenedorUnidades');
    if (!contenedorUnidades) return;
    
    contenedorUnidades.innerHTML = '';
    
    unidadesDisponibles.forEach(unidad => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        checkboxItem.innerHTML = `
            <input type="checkbox" id="${unidad.id}" name="unidades" value="${unidad.id}">
            <label for="${unidad.id}">${unidad.nombre} <span class="estado-unidad ${unidad.estado}">(${unidad.estado})</span></label>
        `;
        contenedorUnidades.appendChild(checkboxItem);
    });
}

// Actualizar estadísticas de rutas
function actualizarEstadisticasRutas(listaRutas) {
    const rutasActivas = listaRutas.filter(ruta => ruta.estado === 'Activa').length;
    const unidadesAsignadas = listaRutas.reduce((total, ruta) => {
        return total + (Array.isArray(ruta.unidades) ? ruta.unidades.length : 1);
    }, 0);
    
    const totalRoutesEl = document.getElementById('totalRoutes');
    const totalUnidadesEl = document.getElementById('totalUnidades');
    
    if (totalRoutesEl) totalRoutesEl.textContent = rutasActivas;
    if (totalUnidadesEl) totalUnidadesEl.textContent = unidadesAsignadas;
}

// Guardar nueva ruta
function guardarNuevaRutaCompleta(event) {
    event.preventDefault();
    
    // Validar formulario
    const numeroRuta = document.getElementById('numeroRuta').value.trim();
    const nombreRuta = document.getElementById('nombreRuta').value.trim();
    const descripcion = document.getElementById('descripcionRuta').value.trim();
    const estado = document.getElementById('estadoRuta').value;
    
    // Obtener unidades seleccionadas
    const unidadesSeleccionadas = Array.from(document.querySelectorAll('input[name="unidades"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Validaciones
    if (!numeroRuta) {
        mostrarNotificacion('El número de ruta es requerido', 'error');
        return;
    }
    
    if (!nombreRuta) {
        mostrarNotificacion('El nombre de la ruta es requerido', 'error');
        return;
    }
    
    if (unidadesSeleccionadas.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos una unidad', 'error');
        return;
    }
    
    if (!descripcion) {
        mostrarNotificacion('La descripción del recorrido es requerida', 'error');
        return;
    }

    // Verificar que las unidades seleccionadas estén disponibles
    const unidadesNoDisponibles = unidadesSeleccionadas.filter(unidadId => {
        const unidad = unidadesDisponibles.find(u => u.id === unidadId);
        return unidad && unidad.estado !== 'Disponible' && unidad.estado !== 'En Ruta';
    });
    
    if (unidadesNoDisponibles.length > 0) {
        mostrarNotificacion('Algunas unidades seleccionadas no están disponibles', 'error');
        return;
    }
    
    // Verificar si ya existe una ruta con el mismo número
    let rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
    const rutaExistente = Object.values(rutasDB).find(ruta => ruta.numero === numeroRuta);
    
    if (rutaExistente) {
        mostrarNotificacion('Ya existe una ruta con ese número', 'error');
        return;
    }
    
    // Obtener puntos del mapa (si la función existe)
    const puntosRecorrido = window.puntosRecorrido || [];
    const puntosParada = window.puntosParada || [];
    
    if (puntosRecorrido.length < 2) {
        mostrarNotificacion('Debe marcar al menos el INICIO y DESTINO de la ruta', 'error');
        return;
    }
    
    // Crear objeto de ruta
    const nuevaRuta = {
        id: `ruta_${Date.now()}`,
        numero: numeroRuta,
        nombre: nombreRuta,
        unidades: unidadesSeleccionadas,
        descripcion: descripcion,
        estado: estado,
        puntosRecorrido: puntosRecorrido,
        puntosParada: puntosParada,
        fechaCreacion: new Date().toISOString(),
        creadaPor: window.sesionAdmin ? window.sesionAdmin.username : 'admin'
    };
    
    // Guardar en localStorage
    rutasDB[nuevaRuta.id] = nuevaRuta;
    
    try {
        localStorage.setItem('unellez_routes', JSON.stringify(rutasDB));
        mostrarNotificacion('Ruta creada exitosamente', 'success');
        
        // Volver a la tabla
        setTimeout(() => {
            mostrarContenidoRutas();
        }, 1000);
        
    } catch (error) {
        console.error('Error al guardar ruta:', error);
        mostrarNotificacion('Error al guardar la ruta', 'error');
    }
}

// Eliminar ruta
function eliminarRuta(idRuta) {
    if (!confirm('¿Está seguro de eliminar esta ruta?')) return;
    
    let rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
    
    if (rutasDB[idRuta]) {
        delete rutasDB[idRuta];
        
        try {
            localStorage.setItem('unellez_routes', JSON.stringify(rutasDB));
            mostrarNotificacion('Ruta eliminada exitosamente', 'success');
            cargarRutas();
        } catch (error) {
            console.error('Error al eliminar ruta:', error);
            mostrarNotificacion('Error al eliminar la ruta', 'error');
        }
    } else {
        mostrarNotificacion('Ruta no encontrada', 'error');
    }
}

// Editar ruta (placeholder)
function editarRuta(idRuta) {
    mostrarNotificacion(`Funcionalidad de edición para ruta ${idRuta} está en desarrollo`, 'info');
}

// Ver detalles de ruta
function verDetallesRuta(idRuta) {
    mostrarNotificacion(`Viendo detalles de ruta ${idRuta}`, 'info');
}

// Configurar evento del formulario
document.addEventListener('DOMContentLoaded', function() {
    const formNuevaRutaCompleta = document.getElementById('formNuevaRutaCompleta');
    if (formNuevaRutaCompleta) {
        formNuevaRutaCompleta.onsubmit = guardarNuevaRutaCompleta;
    }
});