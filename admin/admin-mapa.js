// ========================================
// Lógica del mapa Leaflet
// ========================================

// Inicializar mapa
function inicializarMapa(limpiarPuntos = true) {
    console.log("Iniciando mapa...", limpiarPuntos ? "(limpiando puntos)" : "(manteniendo puntos)");
    console.log("Puntos antes:", {
        recorrido: puntosRecorrido.length,
        parada: puntosParada.length,
        marcadores: marcadores.length
    });

    // Destruir mapa existente
    if (mapa) {
        mapa.remove();
        mapa = null;
    }
    
    // Crear nuevo mapa centrado en Barinas Venezuela
    mapa = L.map('map', {
        attributionControl: false,
        zoomControl: false,
    }).setView([8.630485, -70.209908], 13);
    
    // Añadir capa de cartoDB
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapa);

    // Control para mostrar ubicacion actual
    const marcarControl = L.control({ position: 'topleft' });
    marcarControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'control-mapa marcar-control');
        div.innerHTML = `
            <button title="Mostrar ubicacion actual" onclick="mostrarUbicacionActual()">
                <i class="fas fa-map-marker-alt"></i>
            </button>
        `;
        return div;
    };
    marcarControl.addTo(mapa);

     // Inicializar línea seleccionable
    if (lineaSeleccionable) {
        mapa.removeLayer(lineaSeleccionable);
    }

    // Crear línea seleccionable para la polilínea
    lineaSeleccionable = L.polyline([], {
        color: 'transparent',
        weight: 15,
        opacity: 0.5,
        className: 'linea-seleccionable'
    }).addTo(mapa);

    // Evento para hacer clic en la línea y añadir punto
    lineaSeleccionable.on('click', function(e) {
        // Solo procesar si hay al menos 2 puntos en el recorrido
        if (puntosRecorrido.length >= 2) {
            clickEnLineaActivo = true;
            agregarPuntoEnLinea(e.latlng);
            clickEnLineaActivo = false;
        }
    });

    // Evento de clic en el mapa
    mapa.on('click', function(e) {
        manejarClicMapa(e.latlng.lat, e.latlng.lng);
    });

    // Forzar redibujado del mapa
    setTimeout(() => {
        if (mapa) {
            mapa.invalidateSize();
        }
    }, 300);
    
     // SOLO reiniciar arrays si se solicita limpiar puntos
    if (limpiarPuntos) {
        console.log("⚠️ LIMPIANDO PUNTOS DEL MAPA");
        window.puntosRecorrido = [];
        window.puntosParada = [];
        window.marcadores = [];
        window.modoMarcado = null;
        window.puntoSeleccionado = null;
        window.clickEnLineaActivo = false;
        window.ubicacionUsuario = null;
    } else {
        console.log("✅ MANTENIENDO PUNTOS EXISTENTES");
        console.log("Puntos en variables globales:", {
            recorrido: window.puntosRecorrido ? window.puntosRecorrido.length : 0,
            parada: window.puntosParada ? window.puntosParada.length : 0
        });
    }
    // Forzar redibujado del mapa
    setTimeout(() => {
        if (mapa) {
            mapa.invalidateSize();
        }
    }, 300);
    
    // Si hay puntos cargados, actualizar el mapa
    if (window.puntosRecorrido && window.puntosRecorrido.length > 0) {
        console.log("Actualizando mapa con puntos existentes...");
        setTimeout(() => {
            actualizarMapa();
            actualizarListaPuntos();
            
            // Centrar en los puntos si existen
            if (window.puntosRecorrido.length > 0) {
                const coordenadas = window.puntosRecorrido
                    .filter(p => p && p.coordenadas)
                    .map(p => [p.coordenadas.lat, p.coordenadas.lng]);
                
                if (coordenadas.length > 0) {
                    const bounds = L.latLngBounds(coordenadas);
                    mapa.fitBounds(bounds, { padding: [50, 50] });
                }
            };
        }, 500);
    }
    
    actualizarListaPuntos();
}

// Función específica para inicializar mapa cuando se edita
function inicializarMapaParaEdicion() {
    console.log("Inicializando mapa para edición (sin limpiar puntos)");
    return inicializarMapa(false);
}

// Función para mostrar la ubicación actual del usuario
function mostrarUbicacionActual() {
    if (!mapa) return;
    
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
        mostrarNotificacion('Tu navegador no soporta geolocalización', 'error');
        return;
    }
    
    // Mostrar mensaje de carga
    mostrarNotificacion('Obteniendo tu ubicación...', 'info');
    
    // Solicitar ubicación
    navigator.geolocation.getCurrentPosition(
        // Éxito
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // Guardar ubicación
            ubicacionUsuario = { lat, lng, accuracy };
            
            // Eliminar marcador anterior si existe
            if (marcadorUbicacion) {
                mapa.removeLayer(marcadorUbicacion);
            }
            
            // Crear marcador para la ubicación del usuario
            marcadorUbicacion = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-div-icon ubicacion-actual',
                    html: `<div style="background-color: #9c27b0; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(156, 39, 176, 0.5);">
                        <i class="fas fa-user"></i>
                    </div>`,
                    iconSize: [31, 31],
                    iconAnchor: [15.5, 15.5]
                }),
                zIndexOffset: 1000 // Asegurar que esté encima de otros marcadores
            }).addTo(mapa);
            
            // Crear círculo para mostrar precisión
            const circle = L.circle([lat, lng], {
                color: '#9c27b0',
                fillColor: '#9c27b0',
                fillOpacity: 0.1,
                radius: accuracy
            }).addTo(mapa);
            
            // Agregar popup informativo
            marcadorUbicacion.bindPopup(`
                <div style="text-align: center;">
                    <strong><i class="fas fa-user"></i> Tu ubicación actual</strong><br>
                    Lat: ${lat.toFixed(6)}<br>
                    Lng: ${lng.toFixed(6)}<br>
                    <small>Precisión: ${Math.round(accuracy)} metros</small>
                </div>
            `).openPopup();
            
            // Centrar mapa en la ubicación del usuario
            mapa.setView([lat, lng], 16);
            
            // Mostrar notificación de éxito
            mostrarNotificacion('Ubicación encontrada correctamente', 'success');
            
            // Remover el círculo de precisión después de 5 segundos
            setTimeout(() => {
                if (circle && mapa.hasLayer(circle)) {
                    mapa.removeLayer(circle);
                }
            }, 5000);
        },
        // Error
        function(error) {
            let mensajeError = 'No se pudo obtener tu ubicación. ';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensajeError += 'Permiso denegado. Por favor, permite el acceso a tu ubicación.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensajeError += 'La información de ubicación no está disponible.';
                    break;
                case error.TIMEOUT:
                    mensajeError += 'Tiempo de espera agotado.';
                    break;
                default:
                    mensajeError += 'Error desconocido.';
            }
            
            mostrarNotificacion(mensajeError, 'error');
            
            // Si hay una ubicación guardada anteriormente, centrar ahí
            if (ubicacionUsuario) {
                mapa.setView([ubicacionUsuario.lat, ubicacionUsuario.lng], 13);
                mostrarNotificacion('Usando ubicación anterior', 'info');
            }
        },
        // Opciones
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

// Función para centrar en Barinas (ubicación por defecto)
function centrarEnBarinas() {
    if (mapa) {
        mapa.setView([8.630485, -70.209908], 13);
        mostrarNotificacion('Centrado en Barinas, Venezuela', 'info');
    }
}

// Manejar clic en el mapa con validaciones
function manejarClicMapa(lat, lng) {    
    if (!modoMarcado) return;

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
                mostrarNotificacion('Ya existe un punto de destino.', 'error');
                return;
            }
            
            puntosRecorrido.push({
                tipo: 'destino',
                coordenadas: coordenadas,
                descripcion: 'UNELLEZ (DESTINO)'
            });
            
            mostrarNotificacion('Punto de destino añadido. Ahora puede añadir puntos de parada.', 'success');
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
            break;
    }
    
    // Actualizar mapa y lista
    actualizarMapa();
    actualizarListaPuntos();
    
    // NO desactivar modoMarcado automáticamente para permitir múltiples puntos del mismo tipo
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

// Función para agregar punto en la línea entre dos puntos
function agregarPuntoEnLinea(latlng) {
    if (puntosRecorrido.length < 2) return;
    
    // Encontrar el segmento más cercano
    let minDistance = Infinity;
    let insertIndex = -1;
    
    for (let i = 0; i < puntosRecorrido.length - 1; i++) {
        const puntoA = puntosRecorrido[i].coordenadas;
        const puntoB = puntosRecorrido[i + 1].coordenadas;
        
        // Calcular distancia del punto clicado al segmento
        const distance = distanceToSegment(
            latlng.lat, latlng.lng,
            puntoA.lat, puntoA.lng,
            puntoB.lat, puntoB.lng
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            insertIndex = i + 1;
        }
    }
    
    if (insertIndex > 0 && minDistance < 0.0005) {
        if (puntosRecorrido[insertIndex - 1].tipo === 'destino') {
            mostrarNotificacion('No puede agregar puntos después del destino final', 'error');
            return;
        }
        
        if (insertIndex === 1 && puntosRecorrido[0].tipo === 'inicio' && 
            puntosRecorrido[1] && puntosRecorrido[1].tipo !== 'cruce') {
        }
        
        // Insertar nuevo punto de cruce
        const nuevoPunto = {
            tipo: 'cruce',
            coordenadas: { lat: latlng.lat, lng: latlng.lng },
            descripcion: `Punto de cruce ${puntosRecorrido.filter(p => p.tipo === 'cruce').length + 1}`
        };
        
        puntosRecorrido.splice(insertIndex, 0, nuevoPunto);
        
        mostrarNotificacion('Punto de cruce añadido en la línea del recorrido.', 'success');
        actualizarMapa();
        actualizarListaPuntos();
        
        // Desactivar el modo de marcado después de agregar en línea
        modoMarcado = null;
        document.querySelectorAll('.controles-mapa button').forEach(btn => {
            btn.classList.remove('active');
        });
    }
}

// Función auxiliar para calcular distancia a segmento
function distanceToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
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

    if (coordenadasRecorrido.length > 1) {
        polilineaRecorrido = L.polyline(coordenadasRecorrido, {
            color: '#007bff',
            weight: 4,
            opacity: 0.7,
            dashArray: '5, 10'
        }).addTo(mapa);

        if (coordenadasRecorrido.length >= 2) {
            lineaSeleccionable.setLatLngs(coordenadasRecorrido);
        } else {
            lineaSeleccionable.setLatLngs([]);
        }
    }
    
    // Añadir marcadores
    puntosRecorrido.forEach((punto, index) => {
        let icono;
        
        switch(punto.tipo) {
            case 'inicio':
                icono = L.divIcon({
                    className: 'custom-div-icon inicio-draggable',
                    html: `<div style="background-color: #28a745; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: move;">I</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                break;
                
            case 'destino':
                icono = L.divIcon({
                    className: 'custom-div-icon destino-draggable',
                    html: `<div style="background-color: #dc3545; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: move;">F</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });
                break;
                
            default: // cruce
                icono = L.divIcon({
                    className: 'custom-div-icon cruce-draggable',
                    html: `<div style="background-color: #007bff; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); cursor: move;">${index}</div>`,
                    iconSize: [29, 29],
                    iconAnchor: [14.5, 14.5]
                });
        }
        
        const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], { icon: icono, draggable: true})
            .addTo(mapa)
            .bindPopup(`<strong>${punto.descripcion}</strong><br>Lat: ${punto.coordenadas.lat.toFixed(6)}<br>Lng: ${punto.coordenadas.lng.toFixed(6)}`)
            .on('dragstart', function() {
                clickEnLineaActivo = true;
            })
            .on('dragend', function(e) {
                const newLatLng = e.target.getLatLng();
                punto.coordenadas = { lat: newLatLng.lat, lng: newLatLng.lng };
                actualizarMapa();
                actualizarListaPuntos();
                mostrarNotificacion('Punto movido correctamente', 'info');
                setTimeout(() => {
                    clickEnLineaActivo = false;
                }, 100);
            });
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
        
        const marker = L.marker([punto.coordenadas.lat, punto.coordenadas.lng], { icon: icono, draggable: true })
            .addTo(mapa)
            .bindPopup(`<strong>${punto.descripcion}</strong><br>Lat: ${punto.coordenadas.lat.toFixed(6)}<br>Lng: ${punto.coordenadas.lng.toFixed(6)}`)
            .on('dragstart', function() {
                // Desactivar clics en línea mientras se arrastra
                clickEnLineaActivo = true;
            })
            .on('dragend', function(e) {
                const newLatLng = e.target.getLatLng();
                punto.coordenadas = { lat: newLatLng.lat, lng: newLatLng.lng };
                actualizarMapa();
                actualizarListaPuntos();
                mostrarNotificacion('Punto de parada movido correctamente', 'info');
                // Reactivar clics en línea después de un pequeño delay
                setTimeout(() => {
                    clickEnLineaActivo = false;
                }, 100);
            });

        marcadores.push(marker);
    });
    
    if (marcadores.length > 0) {
        if (marcadores.length === 1) {
            mapa.setView([marcadores[0].getLatLng().lat, marcadores[0].getLatLng().lng], 15);
        }
        else {
            const group = new L.featureGroup(marcadores);
            const bounds = group.getBounds();
            const currentBounds = mapa.getBounds();
            if (!currentBounds.contains(bounds)) {
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
                    <div class="punto-acciones">
                        <small><i class="fas fa-arrows-alt"></i> Arrastre en el mapa para mover</small>
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
                    <div class="punto-acciones">
                        <small><i class="fas fa-arrows-alt"></i> Arrastre en el mapa para mover</small>
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
    modoMarcado = 'inicio';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoInicio()"]').classList.add('active');
    mostrarNotificacion('Modo: Marcar INICIO. Haz clic en el mapa para añadir el punto de inicio.', 'info');
}

function iniciarMarcadoCruce() {
    modoMarcado = 'cruce';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoCruce()"]').classList.add('active');
    mostrarNotificacion('Modo: Añadir PUNTOS DE CRUCE. Haz clic en el mapa para añadir puntos. Puedes añadir varios.', 'info');
}

function iniciarMarcadoDestino() {
    modoMarcado = 'destino';
    document.querySelectorAll('.controles-mapa button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[onclick="iniciarMarcadoDestino()"]').classList.add('active');
    mostrarNotificacion('Modo: Marcar DESTINO. Haz clic en el mapa para añadir el punto final (UNELLEZ).', 'info');
}

function iniciarMarcadoParada() {
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
        
        if (punto.tipo === 'inicio') {
            if (confirm('¿Eliminar punto de INICIO? Esto eliminará todos los puntos de cruce y destino asociados.')) {
                puntosRecorrido = [];
                puntosParada = []; 
                mostrarNotificacion('Punto de inicio y todos los puntos asociados eliminados', 'warning');
            } else {
                return;
            }
        } 
        else if (punto.tipo === 'destino') {
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
    clickEnLineaActivo = false;
    
    if (mapa) {
        marcadores.forEach(marker => mapa.removeLayer(marker));
        marcadores = [];
        
        if (polilineaRecorrido) mapa.removeLayer(polilineaRecorrido);
        polilineaRecorrido = null;

        if (lineaSeleccionable) {
            lineaSeleccionable.setLatLngs([]);
        }

        if (window.marcadorUbicacion) {
            mapa.removeLayer(window.marcadorUbicacion);
            window.marcadorUbicacion = null;
        }
        
        // Restablecer controles
        document.querySelectorAll('.controles-mapa button, .control-mapa button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Centrar en Barinas
        centrarEnBarinas();

        document.querySelector('.marcar-control button').classList.add('active');
    }
    
    actualizarListaPuntos();
    mostrarNotificacion('Mapa limpiado correctamente', 'info');
}

// Función para verificar si se puede agregar puntos en línea
function puedeAgregarEnLinea() {
    return puntosRecorrido.length >= 2 && 
           puntosRecorrido.some(p => p.tipo === 'inicio') && 
           puntosRecorrido.some(p => p.tipo === 'destino');
}

// Inicializar mapa si es necesario
function inicializarMapaSiEsNecesario(limpiarPuntos = true) {
    console.log('Verificando si el mapa necesita inicialización...');
    console.log('limpiarPuntos:', limpiarPuntos);
    
    // Verificar si el elemento del mapa existe
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('❌ Elemento del mapa no encontrado');
        return false;
    }
    
    // Verificar si Leaflet está cargado
    if (typeof L === 'undefined') {
        console.error('❌ Leaflet no está cargado');
        return false;
    }
    
    // Verificar si el mapa ya existe
    if (!mapa || typeof mapa.setView !== 'function') {
        console.log('Mapa no inicializado, iniciando ahora...');
        
        try {
            // Llamar a la función original con el parámetro
            inicializarMapa(limpiarPuntos);
            console.log('✅ Mapa inicializado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error al inicializar el mapa:', error);
            return false;
        }
    } else {
        console.log('Mapa ya está inicializado');
        
        // Si no debemos limpiar puntos, mantener los existentes
        if (!limpiarPuntos && window.puntosRecorrido && window.puntosRecorrido.length > 0) {
            console.log('Manteniendo puntos existentes en el mapa');
        }
        
        return true;
    }
}