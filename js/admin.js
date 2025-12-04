// Variables globales para admin
let adminSession = JSON.parse(localStorage.getItem('admin_session')) || null;

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, verificando sesión...');
    console.log('Sesión actual:', adminSession);
    
    // Si hay sesión activa, mostrar contenido admin
    if (adminSession && adminSession.loggedIn) {
        console.log('Sesión activa encontrada, mostrando panel...');
        showAdminContent();
        initializeAdminPanel();
    } else {
        console.log('No hay sesión activa, mostrando login...');
        // Mostrar login modal
        showLoginModal();
    }
});

// Mostrar modal de login
function showLoginModal() {
    console.log('Mostrando modal de login...');
    document.getElementById('loginModal').classList.add('active');
    document.body.classList.remove('admin-logged-in');
    document.getElementById('loginForm').reset();
    
    // Poner foco en el campo de usuario
    setTimeout(() => {
        document.getElementById('adminUsername').focus();
    }, 300);
}

// Mostrar contenido admin
function showAdminContent() {
    console.log('Mostrando contenido admin...');
    
    // Ocultar login modal
    document.getElementById('loginModal').classList.remove('active');
    
    // Añadir clase al body para mostrar admin
    document.body.classList.add('admin-logged-in');
    
    // Mostrar nombre del admin
    if (adminSession && adminSession.username) {
        document.getElementById('adminName').textContent = adminSession.username;
    }
    
    // Cargar datos iniciales
    initializeAdminPanel();
}

// Función de login
function adminLogin() {
    console.log('Intentando login...');
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    // Credenciales hardcodeadas para demo
    const adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        console.log('Credenciales correctas, creando sesión...');
        // Crear sesión
        adminSession = {
            loggedIn: true,
            username: username,
            loginTime: Date.now()
        };
        
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        
        // Mostrar notificación de éxito
        showNotification('¡Inicio de sesión exitoso!', 'success');
        
        // Mostrar contenido admin
        setTimeout(() => {
            showAdminContent();
        }, 500);
        
    } else {
        showNotification('Credenciales incorrectas. Use: admin / admin123', 'error');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Alternar visibilidad de contraseña
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleButton = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('fa-eye');
        toggleButton.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('fa-eye-slash');
        toggleButton.classList.add('fa-eye');
    }
}

// Inicializar panel admin
function initializeAdminPanel() {
    console.log('Inicializando panel admin...');
    
    // Configurar formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            adminLogin();
        });
    }
    
    // Inicializar modal de conductor
    initializeConductorModal();
    
    // Asegurar que el DOM esté listo antes de cargar usuarios
    setTimeout(() => {
        // Cargar datos
        loadUsers();
        loadRoutes();
        updateStats();
    }, 300);
    
    // Configurar autofocus en login
    setTimeout(() => {
        const adminUsername = document.getElementById('adminUsername');
        if (adminUsername && !adminSession) {
            adminUsername.focus();
        }
    }, 100);
}

// Mostrar sección
function showSection(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(section + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Cargar usuarios y actualizar estadísticas
// Variables para las tablas
let todosUsuarios = [];
let todosConductores = [];
let filtroActual = 'all';
let filtrosColumnas = ['', '', '', ''];
let filtrosColumnasConductores = ['', '', '', '', '', '', ''];

// Modificar la función loadUsers para usar la tabla
function loadUsers() {
    console.log('Cargando usuarios...');
    
    try {
        const usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        const todosLosUsuarios = Object.values(usuariosDB).map(usuario => ({
            ...usuario,
            id: usuario.cedula
        }));
        
        // Separar conductores del resto
        todosConductores = todosLosUsuarios.filter(usuario => usuario.tipo === 'conductor');
        todosUsuarios = todosLosUsuarios.filter(usuario => usuario.tipo !== 'conductor');
        
        console.log(`Se cargaron ${todosUsuarios.length} usuarios y ${todosConductores.length} conductores`);
        
        // Actualizar estadísticas
        updateStats();
        
        // Solo renderizar si los elementos existen
        if (document.getElementById('usersTableBody') && document.getElementById('conductoresTableBody')) {
            // Renderizar tabla según el filtro actual
            if (filtroActual === 'conductor') {
                renderConductoresTable(todosConductores);
            } else {
                renderUsersTable(todosUsuarios);
            }
        }
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        todosUsuarios = [];
        todosConductores = [];
        
        // Solo intentar renderizar si los elementos existen
        if (document.getElementById('usersTableBody')) {
            renderUsersTable([]);
        }
        if (document.getElementById('conductoresTableBody')) {
            renderConductoresTable([]);
        }
    }
}

// Función para renderizar tabla de usuarios (sin conductores)
function renderUsersTable(usuarios) {
    const tbody = document.getElementById('usersTableBody');
    const contadorResultados = document.getElementById('resultsCount');
    const tablaUsuarios = document.getElementById('tableUsuarios');
    const tablaConductores = document.getElementById('tableConductores');
    
    if (!tbody || !tablaUsuarios || !tablaConductores) {
        console.error('Elementos de la tabla no encontrados');
        return;
    }
    
    // Mostrar tabla de usuarios y ocultar tabla de conductores
    tablaUsuarios.style.display = 'block';
    tablaConductores.style.display = 'none';
    
    if (usuarios.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-users">
                    <i class="fas fa-user-slash"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>Crea nuevos usuarios desde el sistema principal</p>
                </td>
            </tr>
        `;
        
        if (contadorResultados) {
            contadorResultados.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> usuarios`;
        }
        return;
    }
    
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        
        // Icono según tipo
        let iconoTipo = 'fas fa-user';
        if (usuario.tipo === 'estudiante') iconoTipo = 'fas fa-user-graduate';
        if (usuario.tipo === 'obrero') iconoTipo = 'fas fa-hard-hat';
        
        // Clase para el tipo
        const claseTipo = `type-${usuario.tipo}`;
        
        // Estado
        const estado = usuario.activo ? 'Activo' : 'Inactivo';
        const claseEstado = usuario.activo ? 'status-active' : 'status-inactive';
        
        fila.innerHTML = `
            <td>
                <span class="user-type ${claseTipo}">
                    <i class="${iconoTipo}"></i>
                    ${usuario.tipo}
                </span>
            </td>
            <td>${usuario.cedula}</td>
            <td>
                <strong>${usuario.nombre} ${usuario.apellido}</strong>
                ${usuario.detalles ? `<br><small style="color: #666; font-size: 12px;">${usuario.detalles}</small>` : ''}
            </td>
            <td>
                <span class="user-status ${claseEstado}">${estado}</span>
            </td>
            <td>
                <button class="btn-delete" onclick="eliminarUsuario('${usuario.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${usuarios.length}</strong> de <strong>${todosUsuarios.length}</strong> usuarios`;
    }
}

// Función para renderizar tabla de conductores
function renderConductoresTable(conductores) {
    const tbody = document.getElementById('conductoresTableBody');
    const contadorResultados = document.getElementById('conductoresResultsCount');
    const tablaUsuarios = document.getElementById('tableUsuarios');
    const tablaConductores = document.getElementById('tableConductores');
    
    if (!tbody || !tablaUsuarios || !tablaConductores) {
        console.error('Elementos de la tabla de conductores no encontrados');
        return;
    }
    
    // Mostrar tabla de conductores y ocultar tabla de usuarios
    tablaUsuarios.style.display = 'none';
    tablaConductores.style.display = 'block';
    
    if (conductores.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-users">
                    <i class="fas fa-bus"></i>
                    <h3>No hay conductores registrados</h3>
                    <p>Presiona "Nuevo Conductor" para registrar uno</p>
                </td>
            </tr>
        `;
        
        if (contadorResultados) {
            contadorResultados.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> conductores`;
        }
        return;
    }
    
    tbody.innerHTML = '';
    
    conductores.forEach(conductor => {
        const fila = document.createElement('tr');
        
        // Formatear días
        const diasFormateados = Array.isArray(conductor.diasTrabajo) 
            ? conductor.diasTrabajo.map(dia => 
                `<span class="badge-dias">${dia.charAt(0).toUpperCase() + dia.slice(1)}</span>`
              ).join(' ')
            : '<span class="badge-dias">No asignado</span>';
        
        // Formatear turnos
        const turnosFormateados = Array.isArray(conductor.turnos) 
            ? conductor.turnos.map(turno => 
                `<span class="badge-turnos">${turno}</span>`
              ).join(' ')
            : '<span class="badge-turnos">No asignado</span>';
        
        // Información de unidad
        const unidadInfo = conductor.unidad 
            ? `<span class="badge-unidad">${conductor.unidad.nombre.split(' - ')[0]}</span>`
            : '<span class="badge-unidad">No asignada</span>';
        
        // Estado
        const estado = conductor.activo ? 'Activo' : 'Inactivo';
        const claseEstado = conductor.activo ? 'status-active' : 'status-inactive';
        
        fila.innerHTML = `
            <td>
                <span class="user-type type-conductor">
                    <i class="fas fa-user-tie"></i>
                    Conductor
                </span>
            </td>
            <td>${conductor.cedula}</td>
            <td>
                <strong>${conductor.nombre} ${conductor.apellido}</strong>
                <br><small style="color: #666; font-size: 11px;">${conductor.rutaNombre || ''}</small>
            </td>
            <td>${diasFormateados}</td>
            <td>${turnosFormateados}</td>
            <td>${unidadInfo}</td>
            <td>
                <span class="user-status ${claseEstado}">${estado}</span>
            </td>
            <td>
                <button class="btn-edit" onclick="editarConductor('${conductor.cedula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarConductor('${conductor.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${conductores.length}</strong> de <strong>${todosConductores.length}</strong> conductores`;
    }
}

// Filtrar usuarios por tipo
function filterUsersByType(tipo) {
    console.log(`Filtrando por tipo: ${tipo}`);
    
    // Pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
        // Verificar que los elementos existan antes de proceder
        const tablaUsuarios = document.getElementById('tableUsuarios');
        const tablaConductores = document.getElementById('tableConductores');
        
        console.log('Tabla usuarios encontrada:', !!tablaUsuarios);
        console.log('Tabla conductores encontrada:', !!tablaConductores);
        
        if (!tablaUsuarios || !tablaConductores) {
            console.error('Tablas no encontradas. IDs buscados: tableUsuarios, tableConductores');
            console.error('Elementos actuales en el DOM:');
            console.error('tableUsuarios:', document.getElementById('tableUsuarios'));
            console.error('tableConductores:', document.getElementById('tableConductores'));
            return;
        }
        
        filtroActual = tipo;
        
        // Resaltar el stat seleccionado
        document.querySelectorAll('.stat-card').forEach(card => {
            if (card && card.style) {
                card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }
        });
        
        if (tipo !== 'all') {
            // Buscar la tarjeta que contiene el onclick con este tipo
            const tarjetas = document.querySelectorAll('.stat-card');
            let tarjetaSeleccionada = null;
            
            tarjetas.forEach(tarjeta => {
                const onclickAttr = tarjeta.getAttribute('onclick');
                if (onclickAttr && onclickAttr.includes(tipo)) {
                    tarjetaSeleccionada = tarjeta;
                }
            });
            
            if (tarjetaSeleccionada && tarjetaSeleccionada.style) {
                tarjetaSeleccionada.style.boxShadow = '0 0 0 3px rgba(26, 42, 108, 0.2)';
            }
        } else {
            const tarjetaTotal = document.getElementById('total-users');
            if (tarjetaTotal && tarjetaTotal.style) {
                tarjetaTotal.style.boxShadow = '0 0 0 3px rgba(26, 42, 108, 0.2)';
            }
        }
        
        console.log('Filtro actual:', filtroActual);
        console.log('Todos usuarios:', todosUsuarios.length);
        console.log('Todos conductores:', todosConductores.length);
        
        if (tipo === 'conductor') {
            // Mostrar conductores
            let conductoresFiltrados = todosConductores;
            console.log('Conductores antes de filtros:', conductoresFiltrados.length);
            conductoresFiltrados = aplicarFiltrosColumnasConductores(conductoresFiltrados);
            console.log('Conductores después de filtros:', conductoresFiltrados.length);
            renderConductoresTable(conductoresFiltrados);
        } else if (tipo === 'all') {
            // Mostrar todos los usuarios (excepto conductores)
            let usuariosFiltrados = todosUsuarios;
            console.log('Usuarios antes de filtros:', usuariosFiltrados.length);
            usuariosFiltrados = aplicarFiltrosColumnas(usuariosFiltrados);
            console.log('Usuarios después de filtros:', usuariosFiltrados.length);
            renderUsersTable(usuariosFiltrados);
        } else {
            // Mostrar por tipo específico (estudiante, obrero)
            let usuariosFiltrados = todosUsuarios.filter(usuario => usuario.tipo === tipo);
            console.log(`Usuarios tipo ${tipo}:`, usuariosFiltrados.length);
            usuariosFiltrados = aplicarFiltrosColumnas(usuariosFiltrados);
            renderUsersTable(usuariosFiltrados);
        }
    }, 100); // Pequeño retraso para asegurar que el DOM esté listo
}

// Filtrar por columna en tabla de usuarios
function filterColumn(input) {
    const indiceColumna = parseInt(input.dataset.column);
    const valor = input.value.toLowerCase();
    
    filtrosColumnas[indiceColumna] = valor;
    
    aplicarTodosLosFiltros();
}

// Filtrar por columna en tabla de conductores
function filterConductorColumn(input) {
    const indiceColumna = parseInt(input.dataset.column);
    const valor = input.value.toLowerCase();
    
    filtrosColumnasConductores[indiceColumna] = valor;
    
    aplicarTodosLosFiltrosConductores();
}

// Aplicar filtros de columna para usuarios
function aplicarFiltrosColumnas(usuarios) {
    let filtrados = [...usuarios];
    
    filtrosColumnas.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(usuario => {
            switch(indice) {
                case 0: // Tipo
                    return usuario.tipo.toLowerCase().includes(filtro);
                case 1: // Cédula
                    return usuario.cedula.toLowerCase().includes(filtro);
                case 2: // Nombre
                    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
                    return nombreCompleto.includes(filtro) || 
                           usuario.nombre.toLowerCase().includes(filtro) || 
                           usuario.apellido.toLowerCase().includes(filtro);
                case 3: // Estado
                    const estado = usuario.activo ? 'activo' : 'inactivo';
                    return estado.includes(filtro);
                default:
                    return true;
            }
        });
    });
    
    return filtrados;
}

// Aplicar filtros de columna para conductores
function aplicarFiltrosColumnasConductores(conductores) {
    let filtrados = [...conductores];
    
    filtrosColumnasConductores.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(conductor => {
            switch(indice) {
                case 0: // Tipo (siempre "conductor")
                    return 'conductor'.includes(filtro);
                case 1: // Cédula
                    return conductor.cedula.toLowerCase().includes(filtro);
                case 2: // Nombre
                    const nombreCompleto = `${conductor.nombre} ${conductor.apellido}`.toLowerCase();
                    return nombreCompleto.includes(filtro) || 
                           conductor.nombre.toLowerCase().includes(filtro) || 
                           conductor.apellido.toLowerCase().includes(filtro);
                case 3: // Días
                    const dias = Array.isArray(conductor.diasTrabajo) 
                        ? conductor.diasTrabajo.join(' ').toLowerCase()
                        : '';
                    return dias.includes(filtro);
                case 4: // Turno
                    const turnos = Array.isArray(conductor.turnos) 
                        ? conductor.turnos.join(' ').toLowerCase()
                        : '';
                    return turnos.includes(filtro);
                case 5: // Unidad Bus
                    const unidad = conductor.unidad 
                        ? conductor.unidad.nombre.toLowerCase()
                        : '';
                    return unidad.includes(filtro);
                case 6: // Estado
                    const estado = conductor.activo ? 'activo' : 'inactivo';
                    return estado.includes(filtro);
                default:
                    return true;
            }
        });
    });
    
    return filtrados;
}

// Aplicar todos los filtros para usuarios
function aplicarTodosLosFiltros() {
    if (filtroActual === 'conductor') {
        // Si estamos viendo conductores, usar su lógica de filtros
        let conductoresFiltrados = todosConductores;
        conductoresFiltrados = aplicarFiltrosColumnasConductores(conductoresFiltrados);
        renderConductoresTable(conductoresFiltrados);
        return;
    }
    
    let usuariosFiltrados = todosUsuarios;
    
    // Filtro por tipo
    if (filtroActual !== 'all') {
        usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.tipo === filtroActual);
    }
    
    // Filtros por columna
    usuariosFiltrados = aplicarFiltrosColumnas(usuariosFiltrados);
    
    renderUsersTable(usuariosFiltrados);
}

// Aplicar todos los filtros para conductores
function aplicarTodosLosFiltrosConductores() {
    let conductoresFiltrados = todosConductores;
    
    // Filtros por columna
    conductoresFiltrados = aplicarFiltrosColumnasConductores(conductoresFiltrados);
    
    renderConductoresTable(conductoresFiltrados);
}

// Limpiar todos los filtros de usuarios
function clearFilters() {
    filtroActual = 'all';
    filtrosColumnas = ['', '', '', ''];
    
    // Limpiar inputs de filtros
    document.querySelectorAll('.column-filter').forEach(input => {
        if (input.tagName === 'INPUT') {
            input.value = '';
        } else if (input.tagName === 'SELECT') {
            input.value = '';
        }
    });
    
    // Quitar resaltado de stats
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    });
    
    renderUsersTable(todosUsuarios);
}

// Limpiar todos los filtros de conductores
function clearConductoresFilters() {
    filtrosColumnasConductores = ['', '', '', '', '', '', ''];
    
    // Limpiar inputs de filtros de conductores
    document.querySelectorAll('.column-filter-conductor').forEach(input => {
        if (input.tagName === 'INPUT') {
            input.value = '';
        } else if (input.tagName === 'SELECT') {
            input.value = '';
        }
    });
    
    renderConductoresTable(todosConductores);
}

// Actualizar estadísticas
function updateStats() {
    const estudiantes = todosUsuarios.filter(u => u.tipo === 'estudiante').length;
    const obreros = todosUsuarios.filter(u => u.tipo === 'obrero').length;
    const conductores = todosConductores.length;
    const totalUsuarios = estudiantes + obreros; // Total sin conductores
    const totalGeneral = estudiantes + obreros + conductores;
    
    // Actualizar solo si los elementos existen
    const estudiantesEl = document.getElementById('estudiantesCount');
    const obrerosEl = document.getElementById('obrerosCount');
    const conductoresEl = document.getElementById('conductoresCount');
    const totalEl = document.getElementById('totalUsers');
    
    if (estudiantesEl) estudiantesEl.textContent = estudiantes;
    if (obrerosEl) obrerosEl.textContent = obreros;
    if (conductoresEl) conductoresEl.textContent = conductores;
    if (totalEl) totalEl.textContent = totalUsuarios; // Mostrar solo usuarios sin conductores
    
    console.log('Estadísticas actualizadas:', { estudiantes, obreros, conductores, totalUsuarios, totalGeneral });
}

// Función para eliminar usuario (tabla usuario)
function eliminarUsuario(cedula) {
    if (!confirm(`¿Está seguro de eliminar al usuario con cédula ${cedula}?`)) {
        return;
    }
    
    eliminarUsuarioPorCedula(cedula, false);
}

// Función para eliminar conductor
function eliminarConductor(cedula) {
    if (!confirm(`¿Está seguro de eliminar al conductor con cédula ${cedula}?`)) {
        return;
    }
    
    eliminarUsuarioPorCedula(cedula, true);
}

// Función para editar conductor (placeholder por ahora)
function editarConductor(cedula) {
    showNotification(`Editar conductor ${cedula} - Funcionalidad en desarrollo`, 'info');
    // Aquí podrías abrir un modal de edición similar al de registro
    // openEditConductorModal(cedula);
}

// Cargar rutas
function loadRoutes() {
    console.log('Cargando rutas...');
    
    let routesDB;
    try {
        routesDB = JSON.parse(localStorage.getItem('unellez_routes')) || {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
    } catch (error) {
        console.error('Error al cargar rutas:', error);
        routesDB = {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
    }
    
    // Guardar rutas si no existen o hubo error
    try {
        localStorage.setItem('unellez_routes', JSON.stringify(routesDB));
    } catch (error) {
        console.error('Error al guardar rutas:', error);
    }
    
    const routesList = document.getElementById('routesList');
    routesList.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando rutas...</div>';
    
    setTimeout(() => {
        routesList.innerHTML = '';
        
        // Calcular capacidad total
        let totalCapacity = 0;
        let activeRoutes = 0;
        
        Object.keys(routesDB).forEach(routeKey => {
            const route = routesDB[routeKey];
            totalCapacity += route.capacidad || 0;
            if (route.activa) activeRoutes++;
            
            const routeItem = document.createElement('div');
            routeItem.className = 'route-item';
            
            routeItem.innerHTML = `
                <div class="route-info">
                    <h4 style="color: #1a2a6c;"><i class="fas fa-route" style="color: #1a2a6c;"></i> ${routeKey.toUpperCase()} - ${route.nombre}</h4>
                    <p style="color:#666;"><strong>unidad:</strong> ${route.capacidad} pasajeros</p>
                    <p style="color:#666;"><strong>Estado:</strong> ${route.activa ? 'Activa' : 'Inactiva'}</p>
                </div>
                <div class="route-actions">
                    <button class="btn btn-small" onclick="editRoute('${routeKey}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            `;
            
            routesList.appendChild(routeItem);
        });
        
        // Actualizar estadísticas de rutas
        document.getElementById('totalRoutes').textContent = activeRoutes;
        document.getElementById('totalCapacity').textContent = totalCapacity;
    }, 500);
}

// Abrir formulario de ruta
function openRouteForm() {
    showNotification('Funcionalidad de edición de rutas - En desarrollo', 'info');
}

// Cerrar sesión admin
function logoutAdmin() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('admin_session');
        adminSession = null;
        showNotification('Sesión cerrada exitosamente', 'success');
        
        setTimeout(() => {
            showLoginModal();
        }, 1000);
    }
}

// Mostrar notificación
function showNotification(message, type) {
    // Remover notificaciones anteriores
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Crear notificación visual
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#1a2a6c'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
        animation-fill-mode: forwards;
        min-width: 300px;
        max-width: 400px;
    `;
    
    // Añadir icono según tipo
    let icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'info') icon = 'fas fa-info-circle';
    
    notification.innerHTML = `
        <i class="${icon}" style="margin-right: 10px;"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Añadir estilos CSS para animaciones si no existen
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Función para editar ruta (placeholder)
function editRoute(routeKey) {
    showNotification(`Editar ruta ${routeKey} - Funcionalidad en desarrollo`, 'info');
}

//----------------------------------------
//-----------------------------------------
//MODAL REGISTRO NUEVO CONDUCTOR
//----------------------------------------
//----------------------------------------


// Abrir modal para registrar conductor
function openDirectConductorModal() {
    document.getElementById('modalDirectConductor').classList.add('active');
    resetModalSteps();
    
    // Limpiar datos anteriores
    scannedUserData = null;
    document.getElementById('directConductorForm').reset();
    
    // Iniciar en paso 1 (escaneo QR)
    showStep('stepScanQR');
    
    // Iniciar escáner QR con botones por defecto
    setTimeout(() => {
        startQRScanner();
    }, 100);
}

// Cerrar modal conductor
function closeDirectConductorModal() {
    console.log("Cerrando modal registro nuevo conductor");

    const qrReaderDiv = document.getElementById('qr-reader');
    if (qrReaderDiv) {
        qrReaderDiv.innerHTML = '';
        console.log("✅ Contenedor QR limpiado");
    }
    
    // 3. Resetear variables
    qrScannerActive = false;
    scannedUserData = null;
    
    // 4. Cerrar el modal
    const modal = document.getElementById('modalDirectConductor');
    if (modal) {
        modal.classList.remove('active');
        console.log("✅ Modal cerrado");
    }
    
    // 5. Opcional: Limpiar formulario
    const form = document.getElementById('directConductorForm');
    if (form) {
        form.reset();
    }
}

// Resetear pasos del modal
function resetModalSteps() {
    // Ocultar todos los pasos
    document.querySelectorAll('.modal-step').forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active');
    });
}

// Mostrar un paso específico
function showStep(stepId) {
    resetModalSteps();
    const step = document.getElementById(stepId);
    if (step) {
        step.style.display = 'block';
        step.classList.add('active');
    }
}

//=========================================
// ===== ESCÁNER QR CON html5-qrcode =====
//===========================================

// Variables para el modal de conductor
let html5QrCode = null;
let qrScannerActive = false;
let scannedUserData = null;


// Iniciar escáner QR
let scanner = null;


function startQRScanner() {
    // Configuración mínima que funciona
    const config = {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE  // ← ESTO ES LO MÁS IMPORTANTE
        ]
    };
    
    // Crear y renderizar
    scanner = new Html5QrcodeScanner('qr-reader', config);
    
    scanner.render(
        (decodedText) => {
            console.log("QR:", decodedText);
            if (scanner) scanner.clear();
            processQRData(decodedText);
        },
        (error) => {
            console.log("Escaneando...", error);
        }
    );
}

// Detener escáner QR
function stopQRScanner() {
    console.log("🛑 Intentando detener scanner...");
    
    if (scanner) {
        console.log("🔍 Scanner encontrado, limpiando...");
        scanner.clear().then(() => {
            qrScannerActive = false;
            scanner = null;
            console.log("✅ Scanner detenido correctamente");
        }).catch(err => {
            console.warn("⚠️ Advertencia al limpiar scanner:", err);
            qrScannerActive = false;
            scanner = null;
        });
    } else {
        console.log("ℹ️ No hay scanner activo para detener");
        qrScannerActive = false;
    }
    
    // Limpiar también si usabas html5QrCode (por si acaso)
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            html5QrCode = null;
        }).catch(err => {
            console.warn("Error al detener html5QrCode:", err);
        });
    }
}

// Volver al escaneo
function goBackToScan() {
    showStep('stepScanQR');
    startQRScanner();
}

// ===== PROCESAMIENTO DE DATOS DEL QR =====

// Procesar datos del QR
function processQRData(qrData) {
    try {
        // En producción, aquí enviarías los datos al backend
        // Por ahora simulamos una respuesta del backend
        
        // Simular petición al backend
        validateQRWithBackend(qrData).then(backendData => {
            // Guardar datos recibidos
            scannedUserData = backendData;
            
            // Mostrar resumen de datos
            showDataSummary(backendData);
            
            // Cargar opciones de ruta
            loadRutasOptions();
            
            // Generar credenciales por defecto
            generateDefaultCredentials();
            
            // Mostrar formulario
            showStep('stepForm');
            
        }).catch(error => {
            console.error("Error del backend:", error);
            showNotification('Error al validar datos con el sistema', 'error');
        });
        
    } catch (error) {
        console.error("Error procesando QR:", error);
        showNotification('Error al procesar el código QR', 'error');
    }
}

// Simular validación con backend
async function validateQRWithBackend(qrData) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        // Intentar parsear como JSON
        const parsedData = JSON.parse(qrData);
        
        // Validar datos mínimos
        if (!parsedData.cedula || !parsedData.nombre) {
            throw new Error("Datos incompletos en el QR");
        }
        
        return {
            nombre: parsedData.nombre || '',
            apellido: parsedData.apellido || '',
            cedula: parsedData.cedula || '',
            condicion: parsedData.condicion || 'Conductor',
            cargo: parsedData.cargo || 'Conductor UNELLEZ',
            tipo: 'conductor'
        };
        
    } catch (error) {
        // Si no es JSON, parsear como string simple
        const parts = qrData.split('|');
        return {
            nombre: parts[0] || '',
            apellido: parts[1] || '',
            cedula: parts[2] || '',
            condicion: parts[3] || 'Conductor',
            cargo: parts[4] || 'Conductor UNELLEZ',
            tipo: 'conductor'
        };
    }
}

// Mostrar resumen de datos EN FILAS
function showDataSummary(userData) {
    const summaryGrid = document.getElementById('summaryGrid');
    
    summaryGrid.innerHTML = `
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-user"></i> Nombre Completo:</div>
            <div class="summary-value">${userData.nombre} ${userData.apellido}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-id-card"></i> Cédula:</div>
            <div class="summary-value">${userData.cedula}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-user-tag"></i> Condición:</div>
            <div class="summary-value">${userData.condicion}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-briefcase"></i> Cargo:</div>
            <div class="summary-value">${userData.cargo}</div>
        </div>
    `;
}

//====================================
// ===== FORMULARIO Y VALIDACIONES =====
//====================================

// Cargar opciones de rutas
function loadRutasOptions() {
    const select = document.getElementById('directRuta');
    select.innerHTML = '<option value="">Seleccione una ruta</option>';
    
    try {
        const routesDB = JSON.parse(localStorage.getItem('unellez_routes')) || {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
        
        Object.keys(routesDB).forEach(key => {
            if (routesDB[key].activa) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `Ruta ${key.slice(-1)} - ${routesDB[key].nombre}`;
                select.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Error cargando rutas:", error);
    }
}

// NUEVAS FUNCIONES PARA LOS CHECKBOXES

// Seleccionar todos los días
function seleccionarTodosDias(checkbox) {
    const diasCheckboxes = document.querySelectorAll('input[name="dias"]');
    diasCheckboxes.forEach(diaCheckbox => {
        diaCheckbox.checked = checkbox.checked;
    });
}

// Seleccionar todos los turnos
function seleccionarTodosTurnos(checkbox) {
    const turnosCheckboxes = document.querySelectorAll('input[name="turnos"]');
    turnosCheckboxes.forEach(turnoCheckbox => {
        turnoCheckbox.checked = checkbox.checked;
    });
}

// MODIFICA la función loadRutasOptions() para también cargar unidades:
function loadRutasOptions() {
    const selectRuta = document.getElementById('directRuta');
    const selectUnidad = document.getElementById('directUnidad');
    
    // Limpiar selects
    selectRuta.innerHTML = '<option value="">Seleccione una ruta</option>';
    selectUnidad.innerHTML = '<option value="">Seleccione una unidad</option>';
    
    try {
        // Cargar rutas
        const routesDB = JSON.parse(localStorage.getItem('unellez_routes')) || {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
        
        Object.keys(routesDB).forEach(key => {
            if (routesDB[key].activa) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `Ruta ${key.slice(-1)} - ${routesDB[key].nombre}`;
                selectRuta.appendChild(option);
            }
        });
        
        // Cargar unidades (buses)
        // En un sistema real, esto vendría de una base de datos
        // Por ahora, creamos unidades de ejemplo basadas en las rutas
        const unidades = [
            { id: 'bus_001', nombre: 'Bus 001 - Mercedes Benz', placa: 'ABC-123', capacidad: 40, estado: 'disponible' },
            { id: 'bus_002', nombre: 'Bus 002 - Volvo', placa: 'DEF-456', capacidad: 35, estado: 'disponible' },
            { id: 'bus_003', nombre: 'Bus 003 - Yutong', placa: 'GHI-789', capacidad: 45, estado: 'disponible' },
            { id: 'bus_004', nombre: 'Bus 004 - Higer', placa: 'JKL-012', capacidad: 30, estado: 'disponible' },
            { id: 'bus_005', nombre: 'Bus 005 - Mercedes Benz', placa: 'MNO-345', capacidad: 40, estado: 'disponible' }
        ];
        
        unidades.forEach(unidad => {
            if (unidad.estado === 'disponible') {
                const option = document.createElement('option');
                option.value = unidad.id;
                option.textContent = `${unidad.nombre} (Placa: ${unidad.placa})`;
                selectUnidad.appendChild(option);
            }
        });
        
    } catch (error) {
        console.error("Error cargando rutas y unidades:", error);
    }
}

// MODIFICA la función validateConductorForm() para validar los nuevos campos:
function validateConductorForm() {
    const campos = [
        { id: 'directRuta', nombre: 'Ruta' },
        { id: 'directUnidad', nombre: 'Unidad' },
        { id: 'directUsuario', nombre: 'Nombre de usuario' },
        { id: 'directPassword', nombre: 'Contraseña' },
        { id: 'directConfirmPassword', nombre: 'Confirmar contraseña' }
    ];
    
    // Validar campos requeridos
    for (const campo of campos) {
        const elemento = document.getElementById(campo.id);
        if (!elemento.value.trim()) {
            showNotification(`El campo "${campo.nombre}" es requerido`, 'error');
            elemento.focus();
            return false;
        }
    }
    
    // Validar que se haya seleccionado al menos un día
    const diasSeleccionados = document.querySelectorAll('input[name="dias"]:checked');
    if (diasSeleccionados.length === 0) {
        showNotification('Debe seleccionar al menos un día de trabajo', 'error');
        return false;
    }
    
    // Validar que se haya seleccionado al menos un turno
    const turnosSeleccionados = document.querySelectorAll('input[name="turnos"]:checked');
    if (turnosSeleccionados.length === 0) {
        showNotification('Debe seleccionar al menos un turno', 'error');
        return false;
    }
    
    // Validar que las contraseñas coincidan
    const contraseña = document.getElementById('directPassword').value;
    const confirmarContraseña = document.getElementById('directConfirmPassword').value;
    
    if (contraseña !== confirmarContraseña) {
        showNotification('Las contraseñas no coinciden', 'error');
        document.getElementById('directConfirmPassword').focus();
        return false;
    }
    
    // Validar longitud de contraseña
    if (contraseña.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        document.getElementById('directPassword').focus();
        return false;
    }
    
    return true;
}

// MODIFICA la función registerDirectConductor() para guardar los nuevos datos:
function registerDirectConductor(event) {
    if (event) event.preventDefault();
    
    // Validar datos del formulario
    if (!validateConductorForm()) {
        return;
    }
    
    // Obtener días seleccionados
    const diasSeleccionados = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Obtener turnos seleccionados
    const turnosSeleccionados = Array.from(document.querySelectorAll('input[name="turnos"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Obtener información de la unidad seleccionada
    const selectUnidad = document.getElementById('directUnidad');
    const unidadSeleccionada = {
        id: selectUnidad.value,
        nombre: selectUnidad.options[selectUnidad.selectedIndex].text
    };
    
    // Crear objeto con datos del conductor
    const datosConductor = {
        ...scannedUserData,
        ruta: document.getElementById('directRuta').value,
        rutaNombre: document.getElementById('directRuta').options[document.getElementById('directRuta').selectedIndex].text,
        unidad: unidadSeleccionada,
        diasTrabajo: diasSeleccionados,
        turnos: turnosSeleccionados,
        nombreUsuario: document.getElementById('directUsuario').value.trim(),
        contraseña: document.getElementById('directPassword').value,
        activo: true,
        detalles: `Conductor | Ruta: ${document.getElementById('directRuta').options[document.getElementById('directRuta').selectedIndex].text} | Unidad: ${unidadSeleccionada.nombre}`,
        horarioDetalles: `Días: ${diasSeleccionados.join(', ')} | Turnos: ${turnosSeleccionados.join(', ')}`,
        fechaRegistro: new Date().toISOString(),
        registradoPor: adminSession ? adminSession.nombreUsuario : 'admin'
    };
    
    // Validar que no exista ya el usuario
    let usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    
    // Verificar si ya existe la cédula
    const cedulaExiste = Object.values(usuariosDB).find(usuario => usuario.cedula === datosConductor.cedula);
    if (cedulaExiste) {
        showNotification('Ya existe un conductor con esta cédula', 'error');
        return;
    }
    
    // Verificar si ya existe el nombre de usuario
    const usuarioExiste = Object.values(usuariosDB).find(usuario => usuario.nombreUsuario === datosConductor.nombreUsuario);
    if (usuarioExiste) {
        showNotification('El nombre de usuario ya está en uso', 'error');
        return;
    }
    
    // Guardar en localStorage
    const usuarioId = 'cond_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    usuariosDB[usuarioId] = datosConductor;
    
    try {
        localStorage.setItem('unellez_users', JSON.stringify(usuariosDB));
        
        // Mostrar éxito y cerrar modal
        showNotification('Conductor registrado exitosamente', 'success');
        
        // También actualizar el estado de la unidad a "asignada"
        actualizarEstadoUnidad(unidadSeleccionada.id, 'asignada');
        
        setTimeout(() => {
            closeDirectConductorModal();
            loadUsers(); // Actualizar tabla
        }, 1000);
        
    } catch (error) {
        console.error("Error al guardar conductor:", error);
        showNotification('Error al guardar el conductor', 'error');
    }
}

// Función para actualizar el estado de la unidad
function actualizarEstadoUnidad(idUnidad, nuevoEstado) {
    try {
        // En un sistema real, esto actualizaría en la base de datos
        // Por ahora, solo mostramos un log
        console.log(`Actualizando unidad ${idUnidad} a estado: ${nuevoEstado}`);
        
        // Aquí podrías tener un localStorage para unidades
        // localStorage.setItem('unellez_unidades', JSON.stringify(unidadesActualizadas));
        
    } catch (error) {
        console.error("Error actualizando estado de unidad:", error);
    }
}

// MODIFICA initializeConductorModal() para inicializar los checkboxes:
function initializeConductorModal() {
    // Configurar formulario
    const formulario = document.getElementById('directConductorForm');
    if (formulario) {
        formulario.addEventListener('submit', registerDirectConductor);
    }
    
    // Configurar validación de contraseñas en tiempo real
    const inputsContraseña = ['directPassword', 'directConfirmPassword'];
    inputsContraseña.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', checkPasswordMatch);
        }
    });
    
    // Configurar eventos para los checkboxes
    configurarEventosCheckboxes();
}

function configurarEventosCheckboxes() {
    // Cuando se desmarque "seleccionar todos" de días, desmarcar el checkbox principal
    const checkboxesDias = document.querySelectorAll('input[name="dias"]');
    checkboxesDias.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkboxTodosDias = document.getElementById('todosDias');
            if (!this.checked && checkboxTodosDias.checked) {
                checkboxTodosDias.checked = false;
            }
        });
    });
    
    // Cuando se desmarque "seleccionar todos" de turnos, desmarcar el checkbox principal
    const checkboxesTurnos = document.querySelectorAll('input[name="turnos"]');
    checkboxesTurnos.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkboxTodosTurnos = document.getElementById('todosTurnos');
            if (!this.checked && checkboxTodosTurnos.checked) {
                checkboxTodosTurnos.checked = false;
            }
        });
    });
}

// Generar credenciales por defecto
function generateDefaultCredentials() {
    if (!scannedUserData) return;
    
    const { nombre, apellido, cedula } = scannedUserData;
    
    // Generar usuario (primera letra nombre + apellido + últimos 3 dígitos cédula)
    const username = `${nombre.charAt(0).toLowerCase()}${apellido.toLowerCase().replace(/\s+/g, '')}${cedula.slice(-3)}`;
    document.getElementById('directUsuario').value = username;
    
    // Generar contraseña temporal
    const tempPassword = generateTempPassword();
    document.getElementById('directPassword').value = tempPassword;
    document.getElementById('directConfirmPassword').value = tempPassword;
    
    // Verificar coincidencia de contraseñas
    checkPasswordMatch();
}

// Generar contraseña temporal
function generateTempPassword() {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    return password;
}

// Verificar que las contraseñas coincidan
function checkPasswordMatch() {
    const password = document.getElementById('directPassword').value;
    const confirmPassword = document.getElementById('directConfirmPassword').value;
    const messageElement = document.getElementById('passwordMatchMessage') || createPasswordMatchElement();
    
    if (password && confirmPassword) {
        if (password === confirmPassword) {
            messageElement.className = 'password-match';
            messageElement.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
        } else {
            messageElement.className = 'password-mismatch';
            messageElement.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
        }
    }
}

// Crear elemento para mensaje de contraseña
function createPasswordMatchElement() {
    const messageElement = document.createElement('div');
    messageElement.id = 'passwordMatchMessage';
    document.getElementById('directConfirmPassword').parentNode.appendChild(messageElement);
    return messageElement;
}

//================================================
// ================= REGISTRO FINAL =================
//================================================

// Registrar conductor
function registerDirectConductor(event) {
    if (event) event.preventDefault();
    
    // Validar datos del formulario
    if (!validateConductorForm()) {
        return;
    }
    
    // Crear objeto con datos del conductor
    const conductorData = {
        ...scannedUserData,
        ruta: document.getElementById('directRuta').value,
        username: document.getElementById('directUsuario').value.trim(),
        password: document.getElementById('directPassword').value,
        activo: true,
        detalles: `Conductor | Ruta: ${document.getElementById('directRuta').selectedOptions[0].text}`,
        fechaRegistro: new Date().toISOString(),
        registradoPor: adminSession ? adminSession.username : 'admin'
    };
    
    // Validar que no exista ya el usuario
    let usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    
    // Verificar si ya existe la cédula
    const cedulaExists = Object.values(usersDB).find(user => user.cedula === conductorData.cedula);
    if (cedulaExists) {
        showNotification('Ya existe un conductor con esta cédula', 'error');
        return;
    }
    
    // Verificar si ya existe el username
    const usernameExists = Object.values(usersDB).find(user => user.username === conductorData.username);
    if (usernameExists) {
        showNotification('El nombre de usuario ya está en uso', 'error');
        return;
    }
    
    // Guardar en localStorage
    const userId = 'cond_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    usersDB[userId] = conductorData;
    
    try {
        localStorage.setItem('unellez_users', JSON.stringify(usersDB));
        
        // Mostrar éxito y cerrar modal
        showNotification('Conductor registrado exitosamente', 'success');
        setTimeout(() => {
            closeDirectConductorModal();
            loadUsers(); // Actualizar tabla
        }, 1000);
        
    } catch (error) {
        console.error("Error al guardar conductor:", error);
        showNotification('Error al guardar el conductor', 'error');
    }
}

// Validar formulario de conductor
function validateConductorForm() {
    const campos = [
        { id: 'directRuta', name: 'Ruta' },
        { id: 'directUsuario', name: 'Nombre de usuario' },
        { id: 'directPassword', name: 'Contraseña' },
        { id: 'directConfirmPassword', name: 'Confirmar contraseña' }
    ];
    
    // Validar campos requeridos
    for (const campo of campos) {
        const element = document.getElementById(campo.id);
        if (!element.value.trim()) {
            showNotification(`El campo "${campo.name}" es requerido`, 'error');
            element.focus();
            return false;
        }
    }
    
    // Validar que las contraseñas coincidan
    const password = document.getElementById('directPassword').value;
    const confirmPassword = document.getElementById('directConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        document.getElementById('directConfirmPassword').focus();
        return false;
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
        showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
        document.getElementById('directPassword').focus();
        return false;
    }
    
    return true;
}

// ===== INICIALIZACIÓN =====

// Inicializar el modal de conductor
function initializeConductorModal() {
    // Configurar formulario
    const form = document.getElementById('directConductorForm');
    if (form) {
        form.addEventListener('submit', registerDirectConductor);
    }
    
    // Configurar validación de contraseñas en tiempo real
    const passwordInputs = ['directPassword', 'directConfirmPassword'];
    passwordInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', checkPasswordMatch);
        }
    });
    
    // El botón ya está en el HTML, no necesitamos crearlo dinámicamente
}
