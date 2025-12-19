// ========================================
// ADMIN-RUTAS.JS - Gestión de rutas
// ========================================

if (typeof window !== 'undefined') {
    // Variables del mapa
    window.mapa = window.mapa || null;
    window.puntosRecorrido = window.puntosRecorrido || [];
    window.puntosParada = window.puntosParada || [];
    window.marcadores = window.marcadores || [];
    window.polilineaRecorrido = window.polilineaRecorrido || null;
    window.lineaSeleccionable = window.lineaSeleccionable || null;
    window.modoMarcado = window.modoMarcado || null;
    window.clickEnLineaActivo = window.clickEnLineaActivo || false;
    
    // Variables de rutas
    window.unidadesDisponibles = window.unidadesDisponibles || [];
    window.rutaEditandoId = window.rutaEditandoId || null;
    window.rutaEditando = window.rutaEditando || null;
    window.filtrosRutas = window.filtrosRutas || ['', '', '', ''];
}

// Función para cargar unidades desde el sistema de unidades
function cargarUnidadesParaRuta() {
    if (typeof window.unidadesBus !== 'undefined' && Array.isArray(window.unidadesBus)) {
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

// Mostrar contenido de rutas
function mostrarContenidoRutas() {
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

// Mostrar formulario de ruta - VERSIÓN CON LÓGICA DE EDICIÓN MEJORADA
function mostrarFormularioRuta(limpiarPuntos = true) {
    console.log('=== mostrarFormularioRuta ===');
    console.log('limpiarPuntos:', limpiarPuntos);
    console.log('rutaEditandoId:', rutaEditandoId);
    console.log('window.rutaEditando:', window.rutaEditando);
    
    const accionesRuta = document.getElementById('accionesRuta');
    const tablaRutas = document.getElementById('tablaRutas');
    const formularioRuta = document.getElementById('formularioRuta');
    const statsRutas = document.querySelector('#rutasSection .admin-stats');
    
    // Ocultar
    if (statsRutas) statsRutas.style.display = 'none';
    if (accionesRuta) accionesRuta.style.display = 'none';
    if (tablaRutas) tablaRutas.style.display = 'none';
    
    // Mostrar formulario
    if (formularioRuta) {
        formularioRuta.style.display = 'block';
        
        // Resetear formulario solo si no estamos editando
        if (rutaEditandoId === null) {
            document.getElementById('formNuevaRutaCompleta').reset();
            document.getElementById('numeroRuta').value = '';
            document.getElementById('nombreRuta').value = '';
            document.getElementById('descripcionRuta').value = '';
            document.getElementById('estadoRuta').value = '';
            
            // Restaurar título por defecto
            const formularioHeader = document.querySelector('#formularioRuta .formulario-header h3');
            if (formularioHeader) {
                formularioHeader.innerHTML = '<i class="fas fa-plus-circle"></i> Crear Nueva Ruta';
            }
            
            // Restaurar el submit por defecto
            const form = document.getElementById('formNuevaRutaCompleta');
            if (form) {
                form.onsubmit = guardarNuevaRutaCompleta;
            }
        } else {
            // Si estamos editando, cambiar título
            const formularioHeader = document.querySelector('#formularioRuta .formulario-header h3');
            if (formularioHeader) {
                formularioHeader.innerHTML = `<i class="fas fa-edit"></i> Editar Ruta`;
            }
            
            // Configurar submit para edición
            const form = document.getElementById('formNuevaRutaCompleta');
            if (form) {
                form.onsubmit = function(e) {
                    e.preventDefault();
                    actualizarRutaFinal(rutaEditandoId, e);
                };
            }
        }
        
        // Cargar unidades
        if (typeof cargarUnidadesParaRuta === 'function') {
            cargarUnidadesParaRuta();
        }
        
        setTimeout(() => {
            console.log('Inicializando mapa...');
            
            if (typeof window.inicializarMapaSiEsNecesario === 'function') {
                window.inicializarMapaSiEsNecesario(limpiarPuntos);
            }
        }, 300);
    }
}

// Cargar rutas desde localStorage
function cargarRutas() {
    let rutasDB;
    try {
        rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
    } catch (error) {
        console.error('Error al cargar rutas:', error);
        rutasDB = {};
    }
    
    window.rutas = Object.keys(rutasDB).map(clave => ({
        id: clave,
        ...rutasDB[clave]
    }));
    
    if (typeof cargarUnidadesParaRuta === 'function') {
        cargarUnidadesParaRuta();
    }
    
    actualizarEstadisticasRutas(window.rutas);
    
    if (document.getElementById('tablaRutas') && document.getElementById('tablaRutas').style.display === 'block') {
        renderizarTablaRutas(window.rutas);
    }
}

// Renderizar tabla de rutas
function renderizarTablaRutas(listaRutas) {
    const cuerpoTabla = document.getElementById('cuerpoTablaRutas');
    const contadorResultados = document.getElementById('contadorResultadosRutas');
    
    if (!cuerpoTabla) return;
    
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
        
        const unidadesFormateadas = Array.isArray(ruta.unidades) 
            ? ruta.unidades.map(unidadId => {
                const unidad = unidadesDisponibles.find(u => u.id === unidadId);
                return unidad ? unidad.nombre : unidadId;
            }).join(', ')
            : ruta.unidad || 'No asignada';
        
        const totalPuntosRecorrido = ruta.puntosRecorrido ? ruta.puntosRecorrido.length : 0;
        const totalPuntosParada = ruta.puntosParada ? ruta.puntosParada.length : 0;
        
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
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <button class="btn-edit" onclick="verDetallesRuta('${ruta.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i> Detalles
                    </button>
                    <button class="btn-map" onclick="abrirMapaRuta('${ruta.id}')" title="Ver en mapa">
                        <i class="fas fa-map"></i> Mapa
                    </button>
                    <button class="btn-edit" onclick="editarRuta('${ruta.id}')" title="Editar ruta">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="eliminarRuta('${ruta.id}')" title="Eliminar ruta">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${listaRutas.length}</strong> de <strong>${window.rutas.length}</strong> rutas`;
    }
}

// Función para ver detalles de una ruta
function verDetallesRuta(idRuta) {
    try {
        console.log('=== INICIANDO verDetallesRuta ===');
        console.log('Parámetro idRuta:', idRuta);
        
        // Si window.rutas no existe, cargarlo
        if (!window.rutas || !Array.isArray(window.rutas)) {
            console.log('window.rutas no existe o no es array, intentando cargar...');
            if (typeof cargarRutas === 'function') {
                cargarRutas();
                // Esperar un momento para que se carguen
                setTimeout(() => {
                    verDetallesRuta(idRuta);
                }, 500);
                return;
            } else {
                throw new Error('Función cargarRutas no disponible');
            }
        }
        
        console.log('Total rutas disponibles:', window.rutas.length);
        
        // Buscar ruta por ID
        let ruta = null;
        for (let i = 0; i < window.rutas.length; i++) {
            if (window.rutas[i].id === idRuta) {
                ruta = window.rutas[i];
                console.log(`Ruta encontrada en índice ${i}:`, ruta);
                break;
            }
        }
        
        if (!ruta) {
            // Intentar buscar por número si no se encuentra por ID
            console.log('Buscando por número de ruta...');
            ruta = window.rutas.find(r => r.numero === idRuta);
            
            if (!ruta) {
                console.error('Ruta no encontrada con ningún criterio');
                mostrarNotificacion(`Ruta "${idRuta}" no encontrada en el sistema`, 'error');
                return;
            }
        }
        
        // Eliminar modal existente
        const modalExistente = document.getElementById('modalDetallesRuta');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Formatear unidades asignadas
        const unidadesFormateadas = Array.isArray(ruta.unidades) 
            ? ruta.unidades.map(unidadId => {
                // Buscar la unidad en las unidades disponibles
                const unidad = unidadesDisponibles.find(u => u.id === unidadId);
                return unidad ? `${unidad.id} - ${unidad.nombre}` : unidadId;
            }).join(', ')
            : ruta.unidad || 'No asignada';
        
        // Contar puntos
        const totalPuntosRecorrido = ruta.puntosRecorrido ? ruta.puntosRecorrido.length : 0;
        const totalPuntosParada = ruta.puntosParada ? ruta.puntosParada.length : 0;
        
        // Función para obtener el tipo en español
        const getTipoEspañol = (tipo) => {
            const tipos = {
                'inicio': 'Inicio',
                'destino': 'Destino (UNELLEZ)',
                'cruce': 'Punto de Cruce',
                'parada': 'Parada'
            };
            return tipos[tipo] || tipo;
        };
        
        // Crear HTML del modal
        const modalHTML = `
            <div class="modal active" id="modalDetallesRuta">
                <div class="modal-overlay"></div>
                <div class="modal-content large">
                    <div class="modal-step-header">
                        <h2><i class="fas fa-route"></i> Detalles de Ruta: ${ruta.numero || 'N/A'} - ${ruta.nombre || 'Sin nombre'}</h2>
                        <button class="modal-close-btn" onclick="cerrarModalDetallesRuta()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="data-summary">
                        <h3><i class="fas fa-info-circle"></i> Información Básica</h3>
                        <div class="summary-grid">
                            <div class="summary-row">
                                <div class="summary-label"><i class="fas fa-hashtag"></i> Número de Ruta</div>
                                <div class="summary-value"><strong>${ruta.numero || 'N/A'}</strong></div>
                            </div>
                            <div class="summary-row">
                                <div class="summary-label"><i class="fas fa-signature"></i> Nombre</div>
                                <div class="summary-value">${ruta.nombre || 'N/A'}</div>
                            </div>
                            <div class="summary-row">
                                <div class="summary-label"><i class="fas fa-bus"></i> Unidades Asignadas</div>
                                <div class="summary-value">${unidadesFormateadas}</div>
                            </div>
                            <div class="summary-row">
                                <div class="summary-label"><i class="fas fa-map-marked-alt"></i> Puntos del Recorrido</div>
                                <div class="summary-value">
                                    <span class="badge-dias">${totalPuntosRecorrido} puntos de recorrido</span>
                                    <span class="badge-turnos">${totalPuntosParada} paradas</span>
                                </div>
                            </div>
                            <div class="summary-row">
                                <div class="summary-label"><i class="fas fa-clipboard-check"></i> Estado</div>
                                <div class="summary-value">
                                    <span class="user-status ${ruta.estado === 'Activa' ? 'status-active' : 'status-inactive'}">
                                        ${ruta.estado || 'Activa'}
                                    </span>
                                </div>
                            </div>
                            <div class="summary-row">
                                <div class="summary-label"><i class="fas fa-calendar-day"></i> Fecha Creación</div>
                                <div class="summary-value">${formatearFechaRuta(ruta.fechaCreacion)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="data-summary">
                        <h3><i class="fas fa-road"></i> Descripción del Recorrido</h3>
                        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; margin-top: 10px;">
                            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${ruta.descripcion || 'Sin descripción disponible'}</p>
                        </div>
                    </div>
                    
                    ${ruta.puntosRecorrido && ruta.puntosRecorrido.length > 0 ? `
                    <div class="data-summary">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 style="margin: 0;"><i class="fas fa-map-marker-alt"></i> Puntos del Recorrido (${ruta.puntosRecorrido.length})</h3>
                            <button class="btn-edit" onclick="abrirMapaRuta('${ruta.id}')" style="margin-left: 10px;">
                                <i class="fas fa-map"></i> Ver Mapa
                            </button>
                        </div>
                        <div style="max-height: 250px; overflow-y: auto; margin-top: 10px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="background: #e9ecef;">
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">#</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Tipo</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Descripción</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Coordenadas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ruta.puntosRecorrido.map((punto, index) => {
                                        const lat = punto.coordenadas ? punto.coordenadas.lat : undefined;
                                        const lng = punto.coordenadas ? punto.coordenadas.lng : undefined;
                                        
                                        // Determinar clase CSS según el tipo
                                        let claseTd = '';
                                        if (punto.tipo === 'inicio') {
                                            claseTd = 'background-color: #d4edda !important;';
                                        } else if (punto.tipo === 'destino') {
                                            claseTd = 'background-color: #d1ecf1 !important;';
                                        }
                                        
                                        return `
                                            <tr style="${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; ${claseTd}">
                                                    <strong>${index + 1}</strong>
                                                </td>
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; ${claseTd}">
                                                    <span style="
                                                        display: inline-block;
                                                        padding: 3px 8px;
                                                        border-radius: 12px;
                                                        font-size: 12px;
                                                        font-weight: 500;
                                                        ${punto.tipo === 'inicio' ? 'background: #28a745; color: white;' : 
                                                          punto.tipo === 'destino' ? 'background: #17a2b8; color: white;' : 
                                                          'background: #6c757d; color: white;'}
                                                    ">
                                                        ${getTipoEspañol(punto.tipo)}
                                                    </span>
                                                </td>
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; ${claseTd}">
                                                    ${punto.descripcion || 'Sin descripción'}
                                                </td>
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; ${claseTd}">
                                                    ${lat !== undefined ? lat.toFixed(6) : 'N/A'},<br>
                                                    ${lng !== undefined ? lng.toFixed(6) : 'N/A'}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : '<div class="data-summary"><p><i class="fas fa-exclamation-circle"></i> No hay puntos de recorrido registrados</p></div>'}
                    
                    ${ruta.puntosParada && ruta.puntosParada.length > 0 ? `
                    <div class="data-summary">
                        <h3><i class="fas fa-bus"></i> Puntos de Parada (${ruta.puntosParada.length})</h3>
                        <div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <thead>
                                    <tr style="background: #e9ecef;">
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">#</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Descripción</th>
                                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Coordenadas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ruta.puntosParada.map((parada, index) => {
                                        const lat = parada.coordenadas ? parada.coordenadas.lat : undefined;
                                        const lng = parada.coordenadas ? parada.coordenadas.lng : undefined;
                                        
                                        return `
                                            <tr style="${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">
                                                    ${index + 1}
                                                </td>
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">
                                                    ${parada.descripcion || 'Parada de bus'}
                                                </td>
                                                <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">
                                                    ${lat !== undefined ? lat.toFixed(6) : 'N/A'},<br>
                                                    ${lng !== undefined ? lng.toFixed(6) : 'N/A'}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="cerrarModalDetallesRuta()">
                            <i class="fas fa-times"></i> Cerrar
                        </button>
                        <button type="button" class="btn-edit" onclick="editarRuta('${ruta.id}'); cerrarModalDetallesRuta()">
                            <i class="fas fa-edit"></i> Editar Ruta
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar directamente al final del body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        console.log('Modal de detalles de ruta creado exitosamente');
        
    } catch (error) {
        console.error('Error en verDetallesRuta:', error);
        mostrarNotificacion(`Error al mostrar detalles: ${error.message}`, 'error');
    }
}

// Función para abrir el mapa de la ruta en nueva pestaña
function abrirMapaRuta(idRuta) {
    try {
        console.log('Abriendo mapa de ruta:', idRuta);
        
        // Buscar la ruta
        const ruta = window.rutas.find(r => r.id === idRuta);
        
        if (!ruta) {
            mostrarNotificacion('Ruta no encontrada', 'error');
            return;
        }
        
        // Crear un objeto con los datos necesarios
        const datosMapa = {
            id: ruta.id,
            numero: ruta.numero,
            nombre: ruta.nombre,
            puntosRecorrido: ruta.puntosRecorrido || [],
            puntosParada: ruta.puntosParada || [],
            estado: ruta.estado || 'Activa'
        };
        
        // Codificar los datos para pasarlos por URL
        const datosCodificados = encodeURIComponent(JSON.stringify(datosMapa));
        
        // Crear URL para la página del mapa
        const urlMapa = `mapa-ruta.html?ruta=${datosCodificados}`;
        
        // Abrir en nueva pestaña
        window.open(urlMapa, '_blank', 'width=1200,height=800,location=no,menubar=no,toolbar=no');
        
    } catch (error) {
        console.error('Error al abrir mapa de ruta:', error);
        mostrarNotificacion('Error al abrir el mapa', 'error');
    }
}

// Función para cerrar el modal de detalles de ruta
function cerrarModalDetallesRuta() {
    const modal = document.getElementById('modalDetallesRuta');
    if (modal) {
        // Primero quitar la clase 'active' para animación
        modal.classList.remove('active');
        
        // Esperar a que termine la animación y luego eliminar
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Función auxiliar para formatear fecha (si no existe)
function formatearFechaRuta(fechaString) {
    if (!fechaString) return 'No especificada';
    
    try {
        const fecha = new Date(fechaString);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
        
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Error en fecha';
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

// Editar ruta - VERSIÓN CORREGIDA
function editarRuta(idRuta) {
    try {
        console.log('=== EDITAR RUTA ===');
        console.log('ID Ruta:', idRuta);
        
        // Cargar ruta desde localStorage directamente
        const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
        const ruta = rutasDB[idRuta];
        
        if (!ruta) {
            mostrarNotificacion('Ruta no encontrada', 'error');
            return;
        }

        console.log('Ruta encontrada:', ruta);
        window.rutaEditandoId = idRuta;
        window.rutaEditando = ruta;
        
        // Mostrar formulario SIN limpiar puntos
        mostrarFormularioRuta(false);
        
        // Llenar campos del formulario INMEDIATAMENTE
        document.getElementById('numeroRuta').value = ruta.numero || '';
        document.getElementById('nombreRuta').value = ruta.nombre || '';
        document.getElementById('descripcionRuta').value = ruta.descripcion || '';
        document.getElementById('estadoRuta').value = ruta.estado || 'Activa';
        
        // Cambiar título del formulario
        const formularioHeader = document.querySelector('#formularioRuta .formulario-header h3');
        if (formularioHeader) {
            formularioHeader.innerHTML = `<i class="fas fa-edit"></i> Editar Ruta: ${ruta.numero} - ${ruta.nombre}`;
        }
        
        // IMPORTANTE: Cargar los puntos en las variables globales ANTES de que el mapa se inicialice
        window.puntosRecorrido = ruta.puntosRecorrido ? [...ruta.puntosRecorrido] : [];
        window.puntosParada = ruta.puntosParada ? [...ruta.puntosParada] : [];
        
        console.log('Puntos cargados en variables globales:', {
            recorrido: window.puntosRecorrido.length,
            parada: window.puntosParada.length
        });
        
        // Marcar unidades seleccionadas
        setTimeout(() => {
            if (ruta.unidades && Array.isArray(ruta.unidades)) {
                ruta.unidades.forEach(unidadId => {
                    const checkbox = document.querySelector(`input[name="unidades"][value="${unidadId}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        }, 500);
        
        // Configurar el formulario para actualizar
        const form = document.getElementById('formNuevaRutaCompleta');
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                actualizarRutaFinal(idRuta, e);
            };
        }
        
        // Esperar a que el mapa se cargue y luego forzar la actualización
        setTimeout(() => {
            // Verificar si el mapa ya está listo
            if (window.mapa && typeof window.actualizarMapa === 'function') {
                console.log('Mapa listo, actualizando con puntos cargados...');
                window.actualizarMapa();
                
                // Actualizar lista de puntos
                if (typeof window.actualizarListaPuntos === 'function') {
                    window.actualizarListaPuntos();
                }
                
                // Ajustar vista para mostrar todos los puntos
                if (window.puntosRecorrido.length > 0) {
                    const coordenadas = window.puntosRecorrido
                        .filter(p => p && p.coordenadas)
                        .map(p => [p.coordenadas.lat, p.coordenadas.lng]);
                    
                    if (coordenadas.length > 0) {
                        setTimeout(() => {
                            const bounds = L.latLngBounds(coordenadas);
                            window.mapa.fitBounds(bounds, { padding: [50, 50] });
                            console.log('Vista ajustada a puntos');
                        }, 500);
                    }
                }
            } else {
                console.log('Mapa no está listo aún, reintentando...');
                // Reintentar después de 500ms
                setTimeout(() => {
                    if (window.mapa && typeof window.actualizarMapa === 'function') {
                        window.actualizarMapa();
                        if (typeof window.actualizarListaPuntos === 'function') {
                            window.actualizarListaPuntos();
                        }
                    }
                }, 500);
            }
        }, 1000);
        
        mostrarNotificacion(`Editando ruta ${ruta.numero} - ${ruta.nombre}`, 'info');
        
    } catch (error) {
        console.error('Error en editarRuta:', error);
        mostrarNotificacion('Error al cargar la ruta para editar', 'error');
    }
}

// Función para crear puntos en el mapa manualmente
function crearPuntosEnMapa() {
    console.log('crearPuntosEnMapa() llamado');
    
    if (!window.mapa) {
        console.error('No hay mapa disponible');
        return;
    }
    
    // Verificar que hay puntos
    if (!window.puntosRecorrido || window.puntosRecorrido.length === 0) {
        console.log('No hay puntos para mostrar');
        return;
    }
    
    console.log(`Creando ${window.puntosRecorrido.length} puntos en el mapa`);
    
    // Limpiar marcadores existentes
    if (window.marcadores && window.marcadores.length > 0) {
        window.marcadores.forEach(marker => {
            if (marker && window.mapa.hasLayer(marker)) {
                window.mapa.removeLayer(marker);
            }
        });
    }
    window.marcadores = [];
    
    // Limpiar polilínea
    if (window.polilineaRecorrido && window.mapa.hasLayer(window.polilineaRecorrido)) {
        window.mapa.removeLayer(window.polilineaRecorrido);
    }
    
    // Crear marcadores
    window.puntosRecorrido.forEach((punto, index) => {
        if (!punto || !punto.coordenadas) return;
        
        let icono, color, texto;
        
        switch(punto.tipo) {
            case 'inicio':
                color = '#28a745';
                texto = 'I';
                break;
            case 'destino':
                color = '#dc3545';
                texto = 'F';
                break;
            default:
                color = '#007bff';
                texto = (index + 1).toString();
        }
        
        const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="
                    background-color: ${color};
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    border: 3px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    cursor: move;
                ">${texto}</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            }),
            draggable: true
        }).addTo(window.mapa);
        
        marker.bindPopup(`
            <strong>${punto.descripcion || 'Punto sin descripción'}</strong><br>
            Tipo: ${punto.tipo}<br>
            Lat: ${punto.coordenadas.lat.toFixed(6)}<br>
            Lng: ${punto.coordenadas.lng.toFixed(6)}
        `);
        
        window.marcadores.push(marker);
    });
    
    // Crear polilínea
    if (window.puntosRecorrido.length >= 2) {
        const coordenadas = window.puntosRecorrido
            .filter(p => p && p.coordenadas)
            .map(p => [p.coordenadas.lat, p.coordenadas.lng]);
        
        if (coordenadas.length >= 2) {
            window.polilineaRecorrido = L.polyline(coordenadas, {
                color: '#007bff',
                weight: 4,
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(window.mapa);
        }
    }
    
    console.log('Puntos creados exitosamente en el mapa');
}

function crearMarcadorSimple(punto, index) {
    if (!window.mapa || !punto.coordenadas) return;
    
    let color, texto;
    switch(punto.tipo) {
        case 'inicio':
            color = '#28a745';
            texto = 'I';
            break;
        case 'destino':
            color = '#17a2b8';
            texto = 'D';
            break;
        default:
            color = '#6c757d';
            texto = (index + 1).toString();
    }
    
    const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], {
        icon: L.divIcon({
            html: `<div style="
                background-color: ${color};
                color: white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">${texto}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        }),
        draggable: true
    }).addTo(window.mapa);
    
    marker.bindPopup(`
        <strong>${punto.tipo.toUpperCase()}</strong><br>
        ${punto.descripcion || 'Sin descripción'}<br>
        Lat: ${punto.coordenadas.lat.toFixed(6)}<br>
        Lng: ${punto.coordenadas.lng.toFixed(6)}
    `);
    
    // Evento de arrastre simple
    marker.on('dragend', function(e) {
        const nuevaPos = e.target.getLatLng();
        if (window.puntosRecorrido && window.puntosRecorrido[index]) {
            window.puntosRecorrido[index].coordenadas = {
                lat: nuevaPos.lat,
                lng: nuevaPos.lng
            };
            crearPolilineaSimple();
            actualizarListaPuntosSimple();
        }
    });
}

// Función simple para crear marcador de parada
function crearMarcadorParadaSimple(parada, index) {
    if (!window.mapa || !parada.coordenadas) return;
    
    const marker = L.marker([parada.coordenadas.lat, parada.coordenadas.lng], {
        icon: L.divIcon({
            html: `<div style="
                background-color: #ffc107;
                color: #212529;
                border-radius: 50%;
                width: 26px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            ">P</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        }),
        draggable: true
    }).addTo(window.mapa);
    
    marker.bindPopup(`
        <strong>PARADA</strong><br>
        ${parada.descripcion || 'Parada de bus'}<br>
        Lat: ${parada.coordenadas.lat.toFixed(6)}<br>
        Lng: ${parada.coordenadas.lng.toFixed(6)}
    `);
}

// Función simple para crear polilínea
function crearPolilineaSimple() {
    if (!window.mapa || !window.puntosRecorrido || window.puntosRecorrido.length < 2) return;
    
    // Eliminar polilínea anterior
    if (window.polyline) {
        window.mapa.removeLayer(window.polyline);
    }
    
    // Crear array de coordenadas
    const coordenadas = window.puntosRecorrido
        .filter(p => p.coordenadas)
        .map(p => [p.coordenadas.lat, p.coordenadas.lng]);
    
    if (coordenadas.length >= 2) {
        window.polyline = L.polyline(coordenadas, {
            color: '#1a2a6c',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(window.mapa);
    }
}

// Función simple para actualizar lista de puntos
function actualizarListaPuntosSimple() {
    const listaPuntos = document.getElementById('listaPuntos');
    if (!listaPuntos) return;
    
    listaPuntos.innerHTML = '';
    
    // Mostrar puntos de recorrido
    if (window.puntosRecorrido) {
        window.puntosRecorrido.forEach((punto, index) => {
            const puntoItem = document.createElement('div');
            puntoItem.className = `punto-item ${punto.tipo}`;
            puntoItem.innerHTML = `
                <div class="punto-info">
                    <div class="punto-numero">${index + 1}</div>
                    <div>
                        <div class="punto-descripcion">
                            <strong>${punto.descripcion}</strong>
                        </div>
                        <div class="punto-coordenadas">
                            Lat: ${punto.coordenadas.lat.toFixed(6)}, Lng: ${punto.coordenadas.lng.toFixed(6)}
                        </div>
                    </div>
                </div>
            `;
            listaPuntos.appendChild(puntoItem);
        });
    }
    
    // Mostrar puntos de parada
    if (window.puntosParada) {
        window.puntosParada.forEach((punto, index) => {
            const puntoItem = document.createElement('div');
            puntoItem.className = 'punto-item parada';
            puntoItem.innerHTML = `
                <div class="punto-info">
                    <div class="punto-numero">P${index + 1}</div>
                    <div>
                        <div class="punto-descripcion">
                            <strong>${punto.descripcion}</strong>
                        </div>
                        <div class="punto-coordenadas">
                            Lat: ${punto.coordenadas.lat.toFixed(6)}, Lng: ${punto.coordenadas.lng.toFixed(6)}
                        </div>
                    </div>
                </div>
            `;
            listaPuntos.appendChild(puntoItem);
        });
    }
    
    if ((!window.puntosRecorrido || window.puntosRecorrido.length === 0) && 
        (!window.puntosParada || window.puntosParada.length === 0)) {
        listaPuntos.innerHTML = '<div class="no-puntos">No se han marcado puntos en el mapa</div>';
    }
}

// Función para actualizar lista de puntos en la UI
function actualizarListaPuntosDesdeRuta() {
    const listaPuntos = document.getElementById('listaPuntos');
    if (!listaPuntos) return;
    
    listaPuntos.innerHTML = '';
    
    // Mostrar puntos de recorrido
    if (window.puntosRecorrido) {
        window.puntosRecorrido.forEach((punto, index) => {
            const puntoItem = document.createElement('div');
            puntoItem.className = `punto-item ${punto.tipo}`;
            puntoItem.innerHTML = `
                <div class="punto-info">
                    <div class="punto-numero">${index + 1}</div>
                    <div>
                        <div class="punto-descripcion">
                            <strong>${punto.descripcion}</strong>
                            ${punto.tipo === 'cruce' ? ` #${window.puntosRecorrido.filter(p => p.tipo === 'cruce').findIndex(p => p === punto) + 1}` : ''}
                        </div>
                        <div class="punto-coordenadas">
                            Lat: ${punto.coordenadas.lat.toFixed(6)}, Lng: ${punto.coordenadas.lng.toFixed(6)}
                        </div>
                        <div class="punto-acciones">
                            <small><i class="fas fa-arrows-alt"></i> Arrastre en el mapa para mover</small>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn-eliminar-punto" onclick="eliminarPuntoDesdeRuta('recorrido', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            listaPuntos.appendChild(puntoItem);
        });
    }
    
    // Mostrar puntos de parada
    if (window.puntosParada) {
        window.puntosParada.forEach((punto, index) => {
            const puntoItem = document.createElement('div');
            puntoItem.className = 'punto-item parada';
            puntoItem.innerHTML = `
                <div class="punto-info">
                    <div class="punto-numero">P${index + 1}</div>
                    <div>
                        <div class="punto-descripcion">
                            <strong>${punto.descripcion}</strong>
                        </div>
                        <div class="punto-coordenadas">
                            Lat: ${punto.coordenadas.lat.toFixed(6)}, Lng: ${punto.coordenadas.lng.toFixed(6)}
                        </div>
                        <div class="punto-acciones">
                            <small><i class="fas fa-arrows-alt"></i> Arrastre en el mapa para mover</small>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn-eliminar-punto" onclick="eliminarPuntoDesdeRuta('parada', ${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            listaPuntos.appendChild(puntoItem);
        });
    }
    
    if ((!window.puntosRecorrido || window.puntosRecorrido.length === 0) && 
        (!window.puntosParada || window.puntosParada.length === 0)) {
        listaPuntos.innerHTML = '<div class="no-puntos">No se han marcado puntos en el mapa</div>';
    }
}

// Función para eliminar punto durante la edición
function eliminarPuntoDesdeRuta(tipo, index) {
    if (tipo === 'recorrido' && window.puntosRecorrido && window.puntosRecorrido[index]) {
        const punto = window.puntosRecorrido[index];
        
        if (punto.tipo === 'inicio') {
            if (confirm('¿Eliminar punto de INICIO? Esto eliminará todos los puntos de cruce y destino asociados.')) {
                window.puntosRecorrido = [];
                window.puntosParada = [];
                mostrarNotificacion('Punto de inicio y todos los puntos asociados eliminados', 'warning');
            } else {
                return;
            }
        } else if (punto.tipo === 'destino') {
            if (confirm('¿Eliminar punto de DESTINO? Los puntos de cruce se mantendrán.')) {
                window.puntosRecorrido.splice(index, 1);
                mostrarNotificacion('Punto de destino eliminado', 'warning');
            } else {
                return;
            }
        } else {
            window.puntosRecorrido.splice(index, 1);
        }
    } else if (tipo === 'parada' && window.puntosParada && window.puntosParada[index]) {
        window.puntosParada.splice(index, 1);
    }
    
    // Actualizar mapa y lista
    if (window.mapa) {
        // Recrear todo el mapa
        if (window.polyline) {
            window.mapa.removeLayer(window.polyline);
            window.polyline = null;
        }
        
        // Remover todos los marcadores
        window.mapa.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                window.mapa.removeLayer(layer);
            }
        });
        
        // Recrear marcadores y polilínea
        if (window.puntosRecorrido) {
            window.puntosRecorrido.forEach((punto, index) => {
                crearMarcadorParaRuta(punto, index);
            });
        }
        
        if (window.puntosParada) {
            window.puntosParada.forEach((parada, index) => {
                crearMarcadorParadaParaRuta(parada, index);
            });
        }
        
        crearPolilineaDesdePuntosExistentes();
    }
    
    actualizarListaPuntosDesdeRuta();
}

// Función para actualizar una ruta existente - ÚNICA VERSIÓN
function actualizarRutaFinal(idRuta, event) {
    if (event) event.preventDefault();
    
    try {
        console.log('Actualizando ruta:', idRuta);
        
        // Validar formulario
        const numeroRuta = document.getElementById('numeroRuta').value.trim();
        const nombreRuta = document.getElementById('nombreRuta').value.trim();
        const descripcion = document.getElementById('descripcionRuta').value.trim();
        const estado = document.getElementById('estadoRuta').value;
        
        // Obtener unidades seleccionadas
        const unidadesSeleccionadas = Array.from(document.querySelectorAll('input[name="unidades"]:checked'))
            .map(checkbox => checkbox.value);
        
        // Validaciones básicas
        if (!numeroRuta || !nombreRuta || unidadesSeleccionadas.length === 0 || !descripcion) {
            mostrarNotificacion('Complete todos los campos requeridos', 'error');
            return;
        }
        
        // Obtener puntos del mapa usando las variables globales
        const puntosRecorrido = window.puntosRecorrido || [];
        const puntosParada = window.puntosParada || [];
        
        if (puntosRecorrido.length < 2) {
            mostrarNotificacion('Debe haber al menos el INICIO y DESTINO de la ruta', 'error');
            return;
        }
        
        // Cargar rutas existentes
        let rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
        
        // Verificar si el número de ruta ya existe
        const otraRutaConMismoNumero = Object.values(rutasDB).find(r => 
            r.numero === numeroRuta && r.id !== idRuta
        );
        
        // Crear objeto de ruta actualizado
        const rutaActualizada = {
            id: idRuta,
            numero: numeroRuta,
            nombre: nombreRuta,
            unidades: unidadesSeleccionadas,
            descripcion: descripcion,
            estado: estado,
            puntosRecorrido: puntosRecorrido,
            puntosParada: puntosParada,
            fechaCreacion: rutasDB[idRuta] ? rutasDB[idRuta].fechaCreacion : new Date().toISOString(),
            fechaActualizacion: new Date().toISOString(),
            creadaPor: rutasDB[idRuta] ? rutasDB[idRuta].creadaPor : 'admin',
            actualizadaPor: window.sesionAdmin ? window.sesionAdmin.username : 'admin'
        };
        
        // Actualizar en localStorage
        rutasDB[idRuta] = rutaActualizada;
        localStorage.setItem('unellez_routes', JSON.stringify(rutasDB));
        
        // Resetear variable de edición
        rutaEditandoId = null;
        window.rutaEditando = null;

        // Limpiar puntos del mapa
        window.puntosRecorrido = [];
        window.puntosParada = [];
        
        mostrarNotificacion(`Ruta ${numeroRuta} - ${nombreRuta} actualizada exitosamente`, 'success');
        
        // Volver a la tabla
        setTimeout(() => {
            mostrarContenidoRutas();
        }, 1000);
        
    } catch (error) {
        console.error('Error al actualizar ruta:', error);
        mostrarNotificacion('Error al actualizar la ruta', 'error');
    }
}

// Función para inicializar o esperar el mapa
function asegurarMapaInicializado(callback) {
    if (window.mapa && typeof window.mapa.setView === 'function') {
        // El mapa ya está inicializado
        if (callback) callback();
        return true;
    } else {
        // Esperar un momento y reintentar
        console.log('Mapa no inicializado, esperando...');
        setTimeout(() => {
            asegurarMapaInicializado(callback);
        }, 500);
        return false;
    }
}

// Función para agregar punto a la lista del formulario
function agregarPuntoALista(punto, index, color, tipo) {
    const lista = document.getElementById('listaPuntos');
    if (!lista) return;
    
    const item = document.createElement('div');
    item.className = 'punto-item';
    item.dataset.index = index;
    item.dataset.tipo = tipo;
    
    const tipoTexto = {
        'inicio': 'INICIO',
        'destino': 'DESTINO',
        'cruce': 'CRUCE',
        'parada': 'PARADA'
    }[tipo] || 'PUNTO';
    
    item.innerHTML = `
        <div class="punto-header">
            <span class="punto-tipo" style="background-color: ${color}">${tipoTexto}</span>
            <span class="punto-numero">Punto ${index + 1}</span>
            <button type="button" class="btn-eliminar-punto" onclick="eliminarPunto(${index}, '${tipo}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="punto-descripcion">${punto.descripcion || 'Sin descripción'}</div>
        <div class="punto-coordenadas">
            ${punto.coordenadas ? `${punto.coordenadas.lat.toFixed(6)}, ${punto.coordenadas.lng.toFixed(6)}` : 'Sin coordenadas'}
        </div>
    `;
    
    lista.appendChild(item);
}

// Configurar evento del formulario
document.addEventListener('DOMContentLoaded', function() {
    const formNuevaRutaCompleta = document.getElementById('formNuevaRutaCompleta');
    if (formNuevaRutaCompleta) {
        formNuevaRutaCompleta.onsubmit = guardarNuevaRutaCompleta;
    }
});

window.verDetallesRuta = verDetallesRuta;
window.cerrarModalDetallesRuta = cerrarModalDetallesRuta;
window.formatearFechaRuta = formatearFechaRuta;
window.abrirMapaRuta = abrirMapaRuta;
window.actualizarRutaFinal = actualizarRutaFinal;
window.eliminarPuntoDesdeRuta = eliminarPuntoDesdeRuta;
window.crearMarcadorSimple = crearMarcadorSimple;
window.crearMarcadorParadaSimple = crearMarcadorParadaSimple;
window.crearPolilineaSimple = crearPolilineaSimple;
window.actualizarListaPuntosSimple = actualizarListaPuntosSimple;
window.editarRuta = editarRuta;
window.mostrarFormularioRuta = mostrarFormularioRuta;