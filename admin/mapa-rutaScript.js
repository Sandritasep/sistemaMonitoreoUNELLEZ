// Variables globales
let map;
let rutaData = null;
let markers = [];
let polyline = null;
let inicioMarker = null;
let destinoMarker = null;
let tempMarker = null;

// Función para obtener parámetros de URL
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
            params[key] = decodeURIComponent(value);
        }
    });
    
    return params;
}

// Inicializar el mapa
function initMap() {
    // Obtener datos de la URL
    const params = getUrlParams();
    
    if (!params.ruta) {
        document.body.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <h3>Error: No se proporcionaron datos de ruta</h3>
                    <p>Por favor, cierre esta ventana y vuelva a intentarlo.</p>
                    <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>
        `;
        return;
    }
    
    try {
        // Parsear datos de la ruta
        rutaData = JSON.parse(params.ruta);
        
        // Actualizar información en la cabecera
        document.getElementById('nombreRuta').textContent = 
            `Ruta ${rutaData.numero || 'N/A'} - ${rutaData.nombre || 'Sin nombre'}`;
        
        const estadoElement = document.getElementById('estadoRuta');
        estadoElement.textContent = rutaData.estado || 'Activa';
        estadoElement.className = `badge-estado ${rutaData.estado === 'Activa' ? 'estado-activa' : 'estado-inactiva'}`;
        
        // Inicializar mapa de Leaflet
        map = L.map('map', {
            attributionControl: false,
        }).setView([8.648040, -70.276408], 13); // Coordenadas por defecto
        
        // Añadir capa de OpenStreetMap
        L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Cargar puntos en el mapa
        cargarPuntosEnMapa();
        
        // Actualizar contadores
        actualizarContadores();
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        document.body.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <h3>Error al cargar los datos</h3>
                    <p>${error.message}</p>
                    <button class="btn btn-secondary" onclick="window.close()">Cerrar</button>
                </div>
            </div>
        `;
    }
}

// Cargar puntos en el mapa
function cargarPuntosEnMapa() {
    if (!rutaData) return;
    
    const puntos = [];
    
    // Procesar puntos de recorrido
    if (rutaData.puntosRecorrido && rutaData.puntosRecorrido.length > 0) {
        rutaData.puntosRecorrido.forEach((punto, index) => {
            if (punto.coordenadas && punto.coordenadas.lat && punto.coordenadas.lng) {
                const lat = punto.coordenadas.lat;
                const lng = punto.coordenadas.lng;
                
                // Agregar a la lista para la polilínea
                puntos.push([lat, lng]);
                
                // Crear marcador según el tipo
                let icono, color;
                let popupContent = `<strong>${getTipoNombre(punto.tipo)}</strong><br>`;
                popupContent += `${punto.descripcion || 'Sin descripción'}<br>`;
                popupContent += `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                
                if (punto.tipo === 'inicio') {
                    icono = L.divIcon({
                        className: 'custom-icon inicio',
                        html: `<div style="
                            background: #28a745;
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
                        ">I</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    color = '#28a745';
                    
                    // Guardar marcador de inicio
                    inicioMarker = L.marker([lat, lng], { icon: icono })
                        .addTo(map)
                        .bindPopup(popupContent);
                    
                } else if (punto.tipo === 'destino') {
                    icono = L.divIcon({
                        className: 'custom-icon destino',
                        html: `<div style="
                            background: #17a2b8;
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
                        ">D</div>`,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                    color = '#17a2b8';
                    
                    // Guardar marcador de destino
                    destinoMarker = L.marker([lat, lng], { icon: icono })
                        .addTo(map)
                        .bindPopup(popupContent);
                    
                } else {
                    icono = L.divIcon({
                        className: 'custom-icon cruce',
                        html: `<div style="
                            background: #6c757d;
                            color: white;
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            border: 2px solid white;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                        ">${index}</div>`,
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                    color = '#6c757d';
                    
                    const marker = L.marker([lat, lng], { icon: icono })
                        .addTo(map)
                        .bindPopup(popupContent);
                    
                    markers.push(marker);
                }
                
                // Añadir a la lista del sidebar
                agregarPuntoALista(punto, index, color);
            }
        });
    }
    
    // Procesar puntos de parada
    if (rutaData.puntosParada && rutaData.puntosParada.length > 0) {
        rutaData.puntosParada.forEach((parada, index) => {
            if (parada.coordenadas && parada.coordenadas.lat && parada.coordenadas.lng) {
                const lat = parada.coordenadas.lat;
                const lng = parada.coordenadas.lng;
                
                const icono = L.divIcon({
                    className: 'custom-icon parada',
                    html: `<div style="
                        background: #ffc107;
                        color: #212529;
                        border-radius: 50%;
                        width: 22px;
                        height: 22px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        border: 2px solid white;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    ">P</div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });
                
                const popupContent = `<strong>Parada de Bus</strong><br>${parada.descripcion || 'Parada'}<br>Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                
                const marker = L.marker([lat, lng], { icon: icono })
                    .addTo(map)
                    .bindPopup(popupContent);
                
                markers.push(marker);
                
                // Añadir a la lista de paradas
                agregarParadaALista(parada, index);
            }
        });
    }
    
    // Crear polilínea del recorrido (si hay al menos 2 puntos)
    if (puntos.length >= 2) {
        polyline = L.polyline(puntos, {
            color: '#1a2a6c',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);
    }
    
    // Ajustar el mapa para mostrar todos los marcadores
    if (puntos.length > 0) {
        const grupo = L.featureGroup(markers.concat(inicioMarker ? [inicioMarker] : []).concat(destinoMarker ? [destinoMarker] : []));
        map.fitBounds(grupo.getBounds().pad(0.1));
    }
}

// Función para obtener nombre del tipo
function getTipoNombre(tipo) {
    const tipos = {
        'inicio': 'Inicio de Ruta',
        'destino': 'Destino (UNELLEZ)',
        'cruce': 'Punto de Cruce',
        'parada': 'Parada de Bus'
    };
    return tipos[tipo] || tipo;
}

// Agregar punto a la lista del sidebar
function agregarPuntoALista(punto, index, color) {
    const lista = document.getElementById('listaPuntos');
    const lat = punto.coordenadas ? punto.coordenadas.lat : 'N/A';
    const lng = punto.coordenadas ? punto.coordenadas.lng : 'N/A';
    
    const item = document.createElement('div');
    item.className = `punto-item ${punto.tipo}`;
    item.onclick = () => {
        if (punto.coordenadas && punto.coordenadas.lat && punto.coordenadas.lng) {
            // Centrar el mapa en el punto
            map.setView([punto.coordenadas.lat, punto.coordenadas.lng], 16);
            
            // Mostrar marcador temporal
            mostrarMarcadorTemporal(punto);
            
            // Abrir popup del marcador original si existe
            abrirPopupMarcador(punto);
        }
    };
    
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span class="punto-tipo tipo-${punto.tipo}">${getTipoNombre(punto.tipo)}</span>
                <strong>Punto ${index + 1}</strong>
            </div>
            <i class="fas fa-map-marker-alt" style="color: ${color};"></i>
        </div>
        <div style="margin-top: 5px; color: #666;">
            ${punto.descripcion || 'Sin descripción'}
        </div>
        <div class="coordenadas">
            ${typeof lat === 'number' ? lat.toFixed(6) : lat}, ${typeof lng === 'number' ? lng.toFixed(6) : lng}
        </div>
    `;
    
    lista.appendChild(item);
}

// Agregar parada a la lista del sidebar
function agregarParadaALista(parada, index) {
    const lista = document.getElementById('listaParadas');
    const lat = parada.coordenadas ? parada.coordenadas.lat : 'N/A';
    const lng = parada.coordenadas ? parada.coordenadas.lng : 'N/A';
    
    const item = document.createElement('div');
    item.className = 'punto-item parada';
    item.onclick = () => {
        if (parada.coordenadas && parada.coordenadas.lat && parada.coordenadas.lng) {
            // Centrar el mapa en la parada
            map.setView([parada.coordenadas.lat, parada.coordenadas.lng], 17);
            
            // Mostrar marcador temporal
            mostrarMarcadorTemporal(parada, 'parada');
            
            // Abrir popup del marcador original si existe
            abrirPopupMarcador(parada, true);
        }
    };
    
    item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span class="punto-tipo tipo-parada">Parada</span>
                <strong>Parada ${index + 1}</strong>
            </div>
            <i class="fas fa-bus" style="color: #ffc107;"></i>
        </div>
        <div style="margin-top: 5px; color: #666;">
            ${parada.descripcion || 'Parada de bus'}
        </div>
        <div class="coordenadas">
            ${typeof lat === 'number' ? lat.toFixed(6) : lat}, ${typeof lng === 'number' ? lng.toFixed(6) : lng}
        </div>
    `;
    
    lista.appendChild(item);
}

// Actualizar contadores
function actualizarContadores() {
    const totalPuntos = (rutaData.puntosRecorrido ? rutaData.puntosRecorrido.length : 0) +
                        (rutaData.puntosParada ? rutaData.puntosParada.length : 0);
    
    document.getElementById('puntosCount').textContent = 
        `${totalPuntos}`;
}

// Funciones de zoom
function zoomInicio() {
    if (inicioMarker) {
        map.setView(inicioMarker.getLatLng(), 17);
    }
}

function zoomDestino() {
    if (destinoMarker) {
        map.setView(destinoMarker.getLatLng(), 17);
    }
}

function zoomCompleto() {
    const grupo = L.featureGroup(markers.concat(inicioMarker ? [inicioMarker] : []).concat(destinoMarker ? [destinoMarker] : []));
    if (grupo.getBounds().isValid()) {
        map.fitBounds(grupo.getBounds().pad(0.1));
    }
}

// Nueva función para mostrar marcador temporal
function mostrarMarcadorTemporal(punto, tipo = null) {
    // Eliminar marcador temporal anterior si existe
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    
    const lat = punto.coordenadas.lat;
    const lng = punto.coordenadas.lng;
    
    // Crear un icono personalizado para mejor control
    const customIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],      // Tamaño del icono
        iconAnchor: [12, 41],    // Punto del icono que corresponde a la posición
        popupAnchor: [0, -40],   // ¡CRUCIAL: popup 40px POR ENCIMA del marcador!
        shadowSize: [41, 41]
    });
    
    // Crear marcador temporal
    tempMarker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: 1000,
        title: 'Punto seleccionado'
    }).addTo(map);
    
    // Agregar clase para animación
    tempMarker.getElement()?.classList.add('marker-bounce');
    
    // Crear contenido para el popup
    let popupContent = `<div style="text-align: center; padding: 10px; min-width: 180px; max-width: 250px;">`;
    
    // Icono según tipo
    let icono = '';
    if (tipo === 'parada') {
        icono = '<i class="fas fa-bus" style="color: #ffc107; margin-right: 5px;"></i>';
        popupContent += `<strong style="font-size: 14px; display: block; margin-bottom: 8px;">${icono}PARADA DE BUS</strong>`;
    } else {
        switch(punto.tipo) {
            case 'inicio':
                icono = '<i class="fas fa-play-circle" style="color: #28a745; margin-right: 5px;"></i>';
                break;
            case 'destino':
                icono = '<i class="fas fa-flag-checkered" style="color: #17a2b8; margin-right: 5px;"></i>';
                break;
            default:
                icono = '<i class="fas fa-location-dot" style="color: #1a2a6c; margin-right: 5px;"></i>';
        }
        popupContent += `<strong style="font-size: 14px; display: block; margin-bottom: 8px;">${icono}${getTipoNombre(punto.tipo).toUpperCase()}</strong>`;
    }
    
    popupContent += `<div style="margin: 8px 0; font-size: 13px; line-height: 1.4;">${punto.descripcion || 'Punto seleccionado'}</div>`;
    popupContent += `<div style="background: #f8f9fa; padding: 6px; border-radius: 4px; margin-top: 8px;">`;
    popupContent += `<small style="color: #666; font-family: monospace; font-size: 11px; display: block;">`;
    popupContent += `<i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>Lat: ${lat.toFixed(6)}<br>`;
    popupContent += `<i class="fas fa-map-marker-alt" style="margin-right: 4px;"></i>Lng: ${lng.toFixed(6)}`;
    popupContent += `</small></div></div>`;
    
    // Crear y abrir popup - IMPORTANTE: popupAnchor ya está configurado en el icono
    tempMarker.bindPopup(popupContent, {
        offset: L.point(0, -5),  // Offset adicional si es necesario
        className: 'temp-popup',   // Clase personalizada
        closeButton: true,
        autoClose: false,
        closeOnClick: false,
        maxWidth: 250
    }).openPopup();
    
    // Asegurarse de que el marcador esté encima del popup
    setTimeout(() => {
        if (tempMarker && tempMarker.getElement()) {
            tempMarker.getElement().style.zIndex = '1001';
        }
    }, 100);
    
    // Auto-eliminar el marcador después de 5 segundos
    setTimeout(() => {
        if (tempMarker) {
            // Remover animación primero
            tempMarker.getElement()?.classList.remove('marker-bounce');
            
            // Cerrar popup
            tempMarker.closePopup();
            
            // Esperar un momento antes de remover para que la animación termine
            setTimeout(() => {
                if (tempMarker) {
                    map.removeLayer(tempMarker);
                    tempMarker = null;
                }
            }, 1000);
        }
    }, 5000);
}

// Función auxiliar para configurar popups correctamente
function configurarPopupMarker(marker, contenido, esTemporal = false) {
    return marker.bindPopup(contenido, {
        offset: L.point(0, -35), // Popup 35px por encima del marcador
        className: esTemporal ? 'temp-popup' : '',
        closeButton: true,
        autoClose: !esTemporal,
        closeOnClick: false,
        maxWidth: 250
    });
}

// Modifica la función toggleSidebar para usar solo iconos
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    const map = document.getElementById('map');
    
    if (sidebar.classList.contains('open')) {
        // Cerrar sidebar
        sidebar.classList.remove('open');
        if (map) map.style.marginRight = '0';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.title = 'Mostrar Panel';
        }
    } else {
        // Abrir sidebar
        sidebar.classList.add('open');
        if (map) map.style.marginRight = '300px';
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
            toggleBtn.title = 'Ocultar Panel';
        }
        
        // Ajustar para responsive
        if (window.innerWidth <= 768) {
            if (map) map.style.marginRight = '0';
        }
    }
}

// Función para verificar y aplicar estilos responsive al cargar
function aplicarEstilosResponsive() {
    const botones = document.querySelectorAll('.controls-buttons .btn');
    
    // Ocultar texto en botones si es mobile/tablet
    if (window.innerWidth <= 768) {
        botones.forEach(btn => {
            const texto = btn.querySelector('.btn-text');
            if (texto) {
                texto.style.display = 'none';
            }
            // Asegurar que solo muestre icono
            btn.style.justifyContent = 'center';
            btn.style.width = '40px';
            btn.style.minWidth = '40px';
        });
    }
    
    // Ajustar sidebar
    ajustarSidebarResponsive();
}


// Función para ajustar el sidebar en responsive
function ajustarSidebarResponsive() {
    const sidebar = document.getElementById('sidebar');
    const map = document.getElementById('map');
    
    if (!sidebar || !map) return;
    
    if (window.innerWidth <= 768) {
        // En móviles, ajustar posicionamiento
        sidebar.style.top = '110px';
        sidebar.style.height = 'calc(100vh - 110px)';
        
        // Remover cualquier estilo que ponga el sidebar abajo
        sidebar.style.bottom = 'auto';
        
        // Ajustar el mapa cuando el sidebar está abierto
        if (sidebar.classList.contains('open')) {
            map.style.width = '15%';
            map.style.marginLeft = '-70%';
        } else {
            map.style.width = '100%';
            map.style.marginLeft = '0';
        }
    } else {
        // En desktop, estilos normales
        sidebar.style.top = '130px';
        sidebar.style.height = 'calc(100vh - 130px)';
        map.style.width = '100%';
        map.style.marginLeft = '0';
    }
}




// Ajustar el mapa cuando se redimensiona la ventana
function ajustarMapaResize() {
    const sidebar = document.getElementById('sidebar');
    const map = document.getElementById('map');
    
    if (sidebar.classList.contains('open')) {
        if (window.innerWidth <= 768) {
            if (map) map.style.marginRight = '0';
        } else {
            if (map) map.style.marginRight = '300px';
        }
    }
}

// Modifica el DOMContentLoaded para incluir la función responsive
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el mapa
    initMap();
    
    // Inicializar la barra lateral como oculta
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    // estilos responsive
    aplicarEstilosResponsive();
    
    // Añadir listeners para redimensionamiento
    window.addEventListener('resize', function() {
        ajustarMapaResize();
        ajustarBotonesResponsive();
    });
    
    // Prevenir interacción con el mapa
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    if (map) {
        map.boxZoom.disable();
        map.keyboard.disable();
        map.zoomControl.remove();
    }
});