// ========================================
// ADMIN-MAPA.JS - Lógica del mapa Leaflet
// ========================================

// Variables para el mapa
let mapa = null;
let puntosRecorrido = [];
let puntosParada = [];
let modoMarcado = null;
let modoArrastre = false;
let modoMoverPunto = false;
let puntoSeleccionado = null;
let polilineaRecorrido = null;
let marcadores = [];
let lineaSeleccionable = null;

// Inicializar mapa
function inicializarMapa() {
    // Destruir mapa existente
    if (mapa) {
        mapa.remove();
        mapa = null;
    }
    
    // Crear nuevo mapa centrado en Barinas Venezuela
    mapa = L.map('map', {
        attributionControl: false,
    }).setView([8.630485, -70.209908], 13);
    
    // Añadir capa de cartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapa);

    // Controles de zoom
    L.control.zoom({
        position: 'topright'
    }).addTo(mapa);
    
    // Añadir evento de clic al mapa
    mapa.on('click', function(e) {
        if (!modoArrastre) {
            manejarClicMapa(e.latlng.lat, e.latlng.lng);
        }
    });

    // Control para mover el mapa (hand)
    const moverControl = L.control({ position: 'topright' });
    moverControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'control-mapa mover-control');
        div.innerHTML = `
            <button title="Mover mapa (Haz clic y arrastra)" onclick="activarModoArrastre()">
                <i class="fas fa-hand-paper"></i>
            </button>
        `;
        return div;
    };
    moverControl.addTo(mapa);

    // Control para marcar puntos
    const marcarControl = L.control({ position: 'topright' });
    marcarControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'control-mapa marcar-control');
        div.innerHTML = `
            <button title="Marcar puntos (Haz clic en el mapa)" onclick="desactivarModoArrastre()">
                <i class="fas fa-map-marker-alt"></i>
            </button>
        `;
        return div;
    };
    marcarControl.addTo(mapa);

    // Forzar redibujado del mapa
    setTimeout(() => {
        if (mapa) {
            mapa.invalidateSize();
        }
    }, 300);
    
    // Reiniciar arrays
    puntosRecorrido = [];
    puntosParada = [];
    marcadores = [];
    modoMarcado = null;
    modoArrastre = false;
    
    // Actualizar lista de puntos
    actualizarListaPuntos();
    
    // Exportar para usar en admin-rutas.js
    window.puntosRecorrido = puntosRecorrido;
    window.puntosParada = puntosParada;

    console.log("Mapa inicializado correctamente");
}

// Activar modo arrastre del mapa
function activarModoArrastre() {
    modoArrastre = true;
    modoMarcado = null;
    document.querySelector('.marcar-control button').classList.remove('active');
    document.querySelector('.mover-control button').classList.add('active');
    mostrarNotificacion('Modo mover activado: Haz clic y arrastra el mapa', 'info');
}

// Desactivar modo arrastre del mapa
function desactivarModoArrastre() {
    modoArrastre = false;
    document.querySelector('.mover-control button').classList.remove('active');
    document.querySelector('.marcar-control button').classList.add('active');
    mostrarNotificacion('Modo marcar activado: Haz clic en el mapa para añadir puntos', 'info');
}

// Manejar clic en el mapa con validaciones
function manejarClicMapa(lat, lng) {
    if (!modoMarcado || modoArrastre) return;
    
    const coordenadas = { lat: lat, lng: lng };
    
    // Validaciones según las reglas
    switch(modoMarcado) {
        case 'inicio':
            // Validación: Solo puede haber un punto de inicio
            if (puntosRecorrido.some(p => p.tipo === 'inicio')) {
                mostrarNotificacion('Ya existe un punto de inicio. Elimine el actual para añadir otro.', 'error');
                return;
            }
            
            puntosRecorrido.unshift({
                tipo: 'inicio',
                coordenadas: coordenadas,
                descripcion: 'INICIO de la ruta'
            });
            mostrarNotificacion('Punto de inicio añadido. Ahora puede añadir puntos de cruce.', 'success');
            break;
            
        case 'cruce':
            // Validación: No se pueden poner puntos de cruce sin punto de inicio
            if (!puntosRecorrido.some(p => p.tipo === 'inicio')) {
                mostrarNotificacion('Primero debe añadir el punto de inicio', 'error');
                return;
            }
            
            // Validación: No se pueden poner puntos de cruce si ya hay punto final
            if (puntosRecorrido.some(p => p.tipo === 'destino')) {
                mostrarNotificacion('No puede añadir puntos de cruce después del punto final', 'error');
                return;
            }
            
            // Encontrar posición para insertar (después del inicio, antes del destino si existe)
            const indexDestino = puntosRecorrido.findIndex(p => p.tipo === 'destino');
            const insertIndex = indexDestino > -1 ? indexDestino : puntosRecorrido.length;
            
            puntosRecorrido.splice(insertIndex, 0, {
                tipo: 'cruce',
                coordenadas: coordenadas,
                descripcion: `Punto de cruce ${puntosRecorrido.filter(p => p.tipo === 'cruce').length + 1}`
            });
            
            mostrarNotificacion('Punto de cruce añadido. Puede seguir añadiendo más puntos de cruce.', 'info');
            break;
            
        case 'destino':
            // Validación: No se puede poner punto final sin punto de inicio
            if (!puntosRecorrido.some(p => p.tipo === 'inicio')) {
                mostrarNotificacion('Primero debe añadir el punto de inicio', 'error');
                return;
            }
            
            // Validación: No se puede poner punto final sin al menos un punto de cruce
            if (!puntosRecorrido.some(p => p.tipo === 'cruce')) {
                mostrarNotificacion('Debe añadir al menos un punto de cruce antes del destino', 'error');
                return;
            }
            
            // Validación: Solo puede haber un punto de destino
            if (puntosRecorrido.some(p => p.tipo === 'destino')) {
                mostrarNotificacion('Ya existe un punto de destino. Elimine el actual para añadir otro.', 'error');
                return;
            }
            
            puntosRecorrido.push({
                tipo: 'destino',
                coordenadas: coordenadas,
                descripcion: 'UNELLEZ (DESTINO)'
            });
            
            mostrarNotificacion('Punto de destino añadido. Ahora puede añadir puntos de parada.', 'success');
            // No desactivar modoMarcado para permitir seguir en modo destino si hay error
            break;
            
        case 'parada':
            // Validación: No se pueden poner puntos parada sin inicio y destino
            const tieneInicio = puntosRecorrido.some(p => p.tipo === 'inicio');
            const tieneDestino = puntosRecorrido.some(p => p.tipo === 'destino');
            
            if (!tieneInicio || !tieneDestino) {
                mostrarNotificacion('Debe tener punto de inicio y destino antes de añadir paradas', 'error');
                return;
            }
            
            puntosParada.push({
                tipo: 'parada',
                coordenadas: coordenadas,
                descripcion: `Punto de parada ${puntosParada.length + 1}`
            });
            
            mostrarNotificacion(`Punto de parada ${puntosParada.length} añadido. Puede seguir añadiendo más paradas.`, 'info');
            break;
    }
    
    // Actualizar mapa y lista
    actualizarMapa();
    actualizarListaPuntos();
    
    // NO desactivar modoMarcado automáticamente para permitir múltiples puntos del mismo tipo
    // Solo desactivar si es inicio o destino (solo uno permitido)
    if (modoMarcado === 'inicio' || modoMarcado === 'destino') {
        // Verificar si ya se añadió el punto
        const puntosDelTipo = puntosRecorrido.filter(p => p.tipo === modoMarcado).length;
        if (puntosDelTipo > 0) {
            modoMarcado = null;
            document.querySelectorAll('.controles-mapa button').forEach(btn => {
                btn.classList.remove('active');
            });
        }
    }
}

// Actualizar mapa
function actualizarMapa() {
    // Limpiar marcadores existentes
    marcadores.forEach(marker => mapa.removeLayer(marker));
    marcadores = [];
    
    // Eliminar polilínea existente
    if (polilineaRecorrido) mapa.removeLayer(polilineaRecorrido);
    
    // Crear array de coordenadas para la polilínea del recorrido
    const coordenadasRecorrido = puntosRecorrido.map(punto => 
        [punto.coordenadas.lat, punto.coordenadas.lng]
    );
    
    // Añadir polilínea del recorrido
    if (coordenadasRecorrido.length > 1) {
        polilineaRecorrido = L.polyline(coordenadasRecorrido, {
            color: '#007bff',
            weight: 4,
            opacity: 0.7,
            dashArray: '5, 10'
        }).addTo(mapa);
    }
    
    // Añadir marcadores
    puntosRecorrido.forEach((punto, index) => {
        let icono;
        
        switch(punto.tipo) {
            case 'inicio':
                icono = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #28a745; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">I</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                break;
                
            case 'destino':
                icono = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #dc3545; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">F</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                break;
                
            default: // cruce
                icono = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #007bff; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">${index}</div>`,
                    iconSize: [29, 29],
                    iconAnchor: [14.5, 14.5]
                });
        }
        
        const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], { icon: icono })
            .addTo(mapa)
            .bindPopup(`<strong>${punto.descripcion}</strong><br>Lat: ${punto.coordenadas.lat.toFixed(6)}<br>Lng: ${punto.coordenadas.lng.toFixed(6)}`);
        
        marcadores.push(marker);
    });
    
    // Añadir marcadores para puntos de parada
    puntosParada.forEach((punto, index) => {
        const icono = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #fd7e14; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">P${index + 1}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
        
        const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], { icon: icono })
            .addTo(mapa)
            .bindPopup(`<strong>${punto.descripcion}</strong><br>Lat: ${punto.coordenadas.lat.toFixed(6)}<br>Lng: ${punto.coordenadas.lng.toFixed(6)}`);
        
        marcadores.push(marker);
    });
    
    // Solo ajustar vista si hay marcadores y NO hacer zoom out automático
    if (marcadores.length > 0) {
        // Si es el primer punto, centrar en ese punto
        if (marcadores.length === 1) {
            mapa.setView([marcadores[0].getLatLng().lat, marcadores[0].getLatLng().lng], 15);
        }
        // Para múltiples puntos, ajustar vista pero mantener zoom si es posible
        else {
            const group = new L.featureGroup(marcadores);
            const bounds = group.getBounds();
            
            // Mantener el zoom actual si los puntos están visibles
            const currentBounds = mapa.getBounds();
            if (!currentBounds.contains(bounds)) {
                // Solo ajustar si los puntos no están visibles
                mapa.fitBounds(bounds.pad(0.1));
            }
        }
    }
}

// Actualizar lista de puntos
function actualizarListaPuntos() {
    const listaPuntos = document.getElementById('listaPuntos');
    if (!listaPuntos) return;
    
    listaPuntos.innerHTML = '';
    
    // Mostrar puntos de recorrido
    puntosRecorrido.forEach((punto, index) => {
        const puntoItem = document.createElement('div');
        puntoItem.className = `punto-item ${punto.tipo}`;
        puntoItem.innerHTML = `
            <div class="punto-info">
                <div class="punto-numero">${index + 1}</div>
                <div>
                    <div class="punto-descripcion">
                        <strong>${punto.descripcion}</strong>
                        ${punto.tipo === 'cruce' ? ` #${puntosRecorrido.filter(p => p.tipo === 'cruce').findIndex(p => p === punto) + 1}` : ''}
                    </div>
                    <div class="punto-coordenadas">
                        Lat: ${punto.coordenadas.lat.toFixed(6)}, Lng: ${punto.coordenadas.lng.toFixed(6)}
                    </div>
                </div>
            </div>
            <button type="button" class="btn-eliminar-punto" onclick="eliminarPunto('recorrido', ${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        listaPuntos.appendChild(puntoItem);
    });
    
    // Mostrar puntos de parada
    puntosParada.forEach((punto, index) => {
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
            <button type="button" class="btn-eliminar-punto" onclick="eliminarPunto('parada', ${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        listaPuntos.appendChild(puntoItem);
    });
    
    if (puntosRecorrido.length === 0 && puntosParada.length === 0) {
        listaPuntos.innerHTML = '<div class="no-puntos">No se han marcado puntos en el mapa</div>';
    }
}

// Funciones para modos de marcado
function iniciarMarcadoInicio() {
    desactivarModoArrastre();
    modoMarcado = 'inicio';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoInicio()"]').classList.add('active');
    mostrarNotificacion('Modo: Marcar INICIO. Haz clic en el mapa para añadir el punto de inicio.', 'info');
}

function iniciarMarcadoCruce() {
    desactivarModoArrastre();
    modoMarcado = 'cruce';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoCruce()"]').classList.add('active');
    mostrarNotificacion('Modo: Añadir PUNTOS DE CRUCE. Haz clic en el mapa para añadir puntos. Puedes añadir varios.', 'info');
}

function iniciarMarcadoDestino() {
    desactivarModoArrastre();
    modoMarcado = 'destino';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoDestino()"]').classList.add('active');
    mostrarNotificacion('Modo: Marcar DESTINO. Haz clic en el mapa para añadir el punto final (UNELLEZ).', 'info');
}

function iniciarMarcadoParada() {
    desactivarModoArrastre();
    modoMarcado = 'parada';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoParada()"]').classList.add('active');
    mostrarNotificacion('Modo: Añadir PUNTOS DE PARADA. Haz clic en el mapa para añadir paradas. Puedes añadir varias.', 'info');
}

// Eliminar punto
function eliminarPunto(tipo, index) {
    if (tipo === 'recorrido') {
        const punto = puntosRecorrido[index];
        
        // Validaciones especiales para eliminación
        if (punto.tipo === 'inicio') {
            // Si se elimina el inicio, eliminar todos los puntos de cruce y destino
            if (confirm('¿Eliminar punto de INICIO? Esto eliminará todos los puntos de cruce y destino asociados.')) {
                puntosRecorrido = [];
                puntosParada = []; // También eliminar paradas
                mostrarNotificacion('Punto de inicio y todos los puntos asociados eliminados', 'warning');
            } else {
                return;
            }
        } 
        else if (punto.tipo === 'destino') {
            // Si se elimina el destino, preguntar si mantener puntos de cruce
            if (confirm('¿Eliminar punto de DESTINO? Los puntos de cruce se mantendrán.')) {
                puntosRecorrido.splice(index, 1);
                mostrarNotificacion('Punto de destino eliminado', 'warning');
            } else {
                return;
            }
        }
        else {
            puntosRecorrido.splice(index, 1);
        }
    } else {
        puntosParada.splice(index, 1);
    }
    
    actualizarMapa();
    actualizarListaPuntos();
}

// Limpiar mapa
function limpiarMapa() {
    if (!confirm('¿Está seguro de limpiar todos los puntos del mapa?')) return;
    
    puntosRecorrido = [];
    puntosParada = [];
    modoMarcado = null;
    modoArrastre = false;
    
    if (mapa) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
        
        if (polilineaRecorrido) mapa.removeLayer(polilineaRecorrido);
        polilineaRecorrido = null;
        
        // Restablecer controles
        document.querySelectorAll('.controles-mapa button, .control-mapa button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.marcar-control button').classList.add('active');
    }
    
    actualizarListaPuntos();
    mostrarNotificacion('Mapa limpiado correctamente', 'info');
}

// Exportar funciones
window.inicializarMapa = inicializarMapa;
window.iniciarMarcadoInicio = iniciarMarcadoInicio;
window.iniciarMarcadoCruce = iniciarMarcadoCruce;
window.iniciarMarcadoDestino = iniciarMarcadoDestino;
window.iniciarMarcadoParada = iniciarMarcadoParada;
window.limpiarMapa = limpiarMapa;
window.eliminarPunto = eliminarPunto;
window.activarModoArrastre = activarModoArrastre;
window.desactivarModoArrastre = desactivarModoArrastre;