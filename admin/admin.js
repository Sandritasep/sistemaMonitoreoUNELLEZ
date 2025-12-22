// Función para alternar el menú móvil
function toggleMobileMenu() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');
    
    if (sidebar.classList.contains('open')) {
        // Cerrar sidebar
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        if (menuToggle) {
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    } else {
        // Abrir sidebar
        sidebar.classList.add('open');
        overlay.classList.add('active');
        if (menuToggle) {
            menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        }
    }
}

// Función para alternar la visibilidad de las instrucciones especiales
function toggleInstruccionesEspeciales() {
    const instruccionesEspeciales = document.getElementById('instruccionesEspeciales');
    const toggleButton = document.querySelector('.btn-toggle-instrucciones');
    const toggleIcon = document.querySelector('.toggle-icon');
    const toggleText = toggleButton.querySelector('span');
    
    if (instruccionesEspeciales.style.display === 'none' || !instruccionesEspeciales.style.display) {
        // Mostrar instrucciones
        instruccionesEspeciales.style.display = 'block';
        toggleButton.classList.add('active');
        toggleText.textContent = 'Ocultar funcionalidades adicionales';
        
        // Cambiar icono a bombillo encendido
        const bombilloIcon = toggleButton.querySelector('.fa-lightbulb');
        bombilloIcon.classList.remove('far');
        bombilloIcon.classList.add('fas');
        bombilloIcon.style.color = '#FFD700';
        
        // Animar el icono de flecha
        toggleIcon.style.transform = 'rotate(180deg)';
        
        // Animar la aparición
        instruccionesEspeciales.style.animation = 'slideDown 0.3s ease-out';
    } else {
        // Ocultar instrucciones
        instruccionesEspeciales.style.display = 'none';
        toggleButton.classList.remove('active');
        toggleText.textContent = 'Mostrar funcionalidades adicionales';
        
        // Cambiar icono a bombillo normal
        const bombilloIcon = toggleButton.querySelector('.fa-lightbulb');
        bombilloIcon.classList.remove('far');
        bombilloIcon.classList.add('fas');
        bombilloIcon.style.color = '#FFD700';
        
        // Animar el icono de flecha
        toggleIcon.style.transform = 'rotate(0deg)';
    }
}

// ========================================
// Funciones principales del panel
// ========================================

// Variables globales para administración
let sesionAdmin = JSON.parse(localStorage.getItem('admin_session')) || null;

// Variables para las tablas de usuarios
let todosUsuarios = [];
let estudiantes = [];
let trabajadores = [];
let conductores = [];
let filtroActual = 'todos';

// Variables para rutas (compartidas con admin-rutas.js)
let rutas = [];
let filtrosRutas = ['', '', '', ''];

// Verificar sesión al cargar la página
function inicializarSistema() {
    console.log('Inicializando sistema...');
    
    if (sesionAdmin && sesionAdmin.loggedIn) {
        mostrarContenidoAdmin();
        inicializarPanelAdmin();
    } else {
        mostrarModalLogin();
    }
}

// Mostrar modal de login
function mostrarModalLogin() {
    console.log('Mostrando modal de login...');
    document.getElementById('loginModal').classList.add('active');
    document.body.classList.remove('admin-logged-in');
    document.getElementById('loginForm').reset();
    
    // Configurar evento del formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            adminLogin();
        };
    }
    
    setTimeout(() => {
        document.getElementById('adminUsername').focus();
    }, 300);
}

// Función de login
function adminLogin() {
    console.log('Intentando login...');
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    const credencialesAdmin = {
        username: 'admin',
        password: 'admin123'
    };
    
    if (username === credencialesAdmin.username && password === credencialesAdmin.password) {
        console.log('Credenciales correctas, creando sesión...');
        sesionAdmin = {
            loggedIn: true,
            username: username,
            loginTime: Date.now()
        };
        
        localStorage.setItem('admin_session', JSON.stringify(sesionAdmin));
        mostrarNotificacion('¡Inicio de sesión exitoso!', 'success');
        
        setTimeout(() => {
            mostrarContenidoAdmin();
        }, 500);
        
    } else {
        mostrarNotificacion('Credenciales incorrectas. Use: admin / admin123', 'error');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Mostrar contenido admin
function mostrarContenidoAdmin() {
    console.log('Mostrando contenido admin...');
    
    document.getElementById('loginModal').classList.remove('active');
    document.body.classList.add('admin-logged-in');
    
    if (sesionAdmin && sesionAdmin.username) {
        document.getElementById('adminName').textContent = sesionAdmin.username;
    }
    
    inicializarPanelAdmin();
}

// Inicializar panel admin
function inicializarPanelAdmin() {
    console.log('Inicializando panel admin...');
    
    // Configurar navegación
    document.querySelectorAll('.btn-admin').forEach(btn => {
        btn.onclick = function() {
            const seccion = this.getAttribute('onclick').match(/mostrarSeccion\('(\w+)'\)/)[1];
            mostrarSeccion(seccion);
        };
    });

    inicializarModalConductor();
    
    // Cargar datos iniciales
    setTimeout(() => {
        cargarUsuarios();
        if (typeof cargarRutas === 'function') cargarRutas();
        if (typeof cargarUnidadesDesdeStorage === 'function') cargarUnidadesDesdeStorage();
        actualizarEstadisticas();
    }, 300);
}

// Mostrar sección
function mostrarSeccion(seccion) {
    console.log(`Mostrando sección: ${seccion}`);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostrar sección seleccionada
    const seccionObjetivo = document.getElementById(seccion + 'Section');
    if (seccionObjetivo) {
        seccionObjetivo.classList.add('active');
        
        // Acciones específicas por sección
        if (seccion === 'rutas') {
            mostrarContenidoRutas();
        } else if (seccion === 'usuarios') {
            // Mostrar tabla de usuarios
            const accionesConductor = document.getElementById('accionesConductor');
            if (accionesConductor) accionesConductor.style.display = 'none';
            filtrarUsuariosPorTipo('todos');
        }
    }
}

// Alternar visibilidad de contraseña
function togglePasswordVisibility(buttonElement) {
    let passwordInput, toggleButton;
    
    if (buttonElement && buttonElement.classList.contains('toggle-password')) {
        toggleButton = buttonElement;
        passwordInput = toggleButton.previousElementSibling;
    } else {
        passwordInput = document.getElementById('adminPassword');
        toggleButton = document.querySelector('.toggle-password');
    }
    
    if (!passwordInput) return;
    
    let icon = toggleButton.tagName === 'BUTTON' ? toggleButton.querySelector('i') : toggleButton;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        passwordInput.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// Cerrar sesión admin
function cerrarSesionAdmin() {
    console.log('Cerrando sesión...');
    
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('admin_session');
        sesionAdmin = null;
        mostrarNotificacion('Sesión cerrada exitosamente', 'success');
        
        setTimeout(() => {
            mostrarModalLogin();
        }, 1000);
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
    const notificacionesExistentes = document.querySelectorAll('.custom-notification');
    notificacionesExistentes.forEach(notificacion => notificacion.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = 'custom-notification';
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#6c757d'};
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
    
    let icono = 'fas fa-check-circle';
    if (tipo === 'error') icono = 'fas fa-exclamation-circle';
    if (tipo === 'info') icono = 'fas fa-info-circle';
    
    notificacion.innerHTML = `
        <i class="${icono}" style="margin-right: 10px;"></i>
        ${mensaje}
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 3000);
}

// Añadir estilos CSS para animaciones si no existen
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}


// ========================================
// FUNCIONES PARA GESTIÓN DE USUARIOS
// ========================================

// Variables para filtros de usuarios
let filtrosEstudiantes = ['', '', '', '', '', ''];
let filtrosTrabajadores = ['', '', '', '', '', '', ''];
let filtrosConductores = ['', '', '', '', '', '', ''];
let filtrosTodos = ['', '', '', '', ''];

// Cargar usuarios y actualizar estadísticas
function cargarUsuarios() {
    console.log('Cargando usuarios...');
    
    try {
        const usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        todosUsuarios = Object.values(usuariosDB).map(usuario => ({
            ...usuario,
            id: usuario.cedula
        }));
        
        // Separar por tipo
        estudiantes = todosUsuarios.filter(usuario => usuario.tipo === 'estudiante');
        trabajadores = todosUsuarios.filter(usuario => usuario.tipo === 'trabajador' || usuario.tipo === 'obrero');
        conductores = todosUsuarios.filter(usuario => usuario.tipo === 'conductor');
        
        console.log(`Se cargaron: ${estudiantes.length} estudiantes, ${trabajadores.length} trabajadores, ${conductores.length} conductores`);
        
        actualizarEstadisticas();
        
        // Renderizar tabla según el filtro actual
        if (document.getElementById('cuerpoTablaEstudiantes')) {
            switch(filtroActual) {
                case 'estudiante':
                    renderizarTablaEstudiantes(estudiantes);
                    break;
                case 'trabajador':
                    renderizarTablaTrabajadores(trabajadores);
                    break;
                case 'conductor':
                    renderizarTablaConductores(conductores);
                    break;
                case 'todos':
                    renderizarTablaTodosUsuarios(todosUsuarios);
                    break;
            }
        }
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        todosUsuarios = [];
        estudiantes = [];
        trabajadores = [];
        conductores = [];
        
        renderizarTablaEstudiantes([]);
        renderizarTablaTrabajadores([]);
        renderizarTablaConductores([]);
        renderizarTablaTodosUsuarios([]);
    }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const totalEstudiantes = estudiantes.length;
    const totalTrabajadores = trabajadores.length;
    const totalConductores = conductores.length;
    const totalGeneral = totalEstudiantes + totalTrabajadores + totalConductores;
    
    // Actualizar contadores
    const estudiantesEl = document.getElementById('contadorEstudiantes');
    const trabajadoresEl = document.getElementById('contadorTrabajadores');
    const conductoresEl = document.getElementById('contadorConductores');
    const totalEl = document.getElementById('totalUsuarios');
    
    if (estudiantesEl) estudiantesEl.textContent = totalEstudiantes;
    if (trabajadoresEl) trabajadoresEl.textContent = totalTrabajadores;
    if (conductoresEl) conductoresEl.textContent = totalConductores;
    if (totalEl) totalEl.textContent = totalGeneral;
    
    console.log('Estadísticas actualizadas:', { 
        estudiantes: totalEstudiantes, 
        trabajadores: totalTrabajadores, 
        conductores: totalConductores, 
        total: totalGeneral 
    });
}

// Función para renderizar tabla de estudiantes
function renderizarTablaEstudiantes(estudiantes) {
    const cuerpoTabla = document.getElementById('cuerpoTablaEstudiantes');
    const contadorResultados = document.getElementById('contadorResultadosEstudiantes');
    const tablaEstudiantes = document.getElementById('tablaEstudiantes');
    
    if (!cuerpoTabla || !tablaEstudiantes) {
        console.error('Elementos de la tabla no encontrados');
        return;
    }
    
    // Ocultar todas las tablas primero
    ocultarTodasLasTablas();
    tablaEstudiantes.style.display = 'block';
    
    // Aplicar filtros
    estudiantes = aplicarFiltrosEstudiantes(estudiantes);
    
    if (estudiantes.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="7" class="no-users">
                    <i class="fas fa-user-graduate"></i>
                    <h3>No hay estudiantes registrados</h3>
                    <p>Registra nuevos estudiantes desde el sistema principal</p>
                </td>
            </tr>
        `;
        
        if (contadorResultados) {
            contadorResultados.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> estudiantes`;
        }
        return;
    }
    
    cuerpoTabla.innerHTML = '';
    
    estudiantes.forEach(estudiante => {
        const fila = document.createElement('tr');
        
        // Icono y tipo
        const iconoTipo = 'fas fa-user-graduate';
        const claseTipo = 'type-estudiante';
        
        // Estado
        const estado = estudiante.activo ? 'Activo' : 'Inactivo';
        const claseEstado = estudiante.activo ? 'status-active' : 'status-inactive';
        
        // Carrera (si no existe, mostrar "No especificada")
        const carrera = estudiante.carrera || 'No especificada';
        
        // Ruta elegida (si no existe, mostrar "No asignada")
        const ruta = estudiante.rutaNombre || estudiante.ruta || 'No asignada';
        
        fila.innerHTML = `
            <td>
                <span class="user-type ${claseTipo}">
                    <i class="${iconoTipo}"></i>
                    Estudiante
                </span>
            </td>
            <td>${estudiante.cedula}</td>
            <td>
                <strong>${estudiante.nombre} ${estudiante.apellido}</strong>
            </td>
            <td>${carrera}</td>
            <td>${ruta}</td>
            <td>
                <span class="user-status ${claseEstado}">${estado}</span>
            </td>
            <td>
                <button class="btn-edit" onclick="editarUsuario('${estudiante.cedula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarUsuario('${estudiante.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${estudiantes.length}</strong> de <strong>${estudiantes.length}</strong> estudiantes`;
    }
}

// Función para renderizar tabla de trabajadores
function renderizarTablaTrabajadores(trabajadores) {
    const cuerpoTabla = document.getElementById('cuerpoTablaTrabajadores');
    const contadorResultados = document.getElementById('contadorResultadosTrabajadores');
    const tablaTrabajadores = document.getElementById('tablaTrabajadores');
    
    if (!cuerpoTabla || !tablaTrabajadores) {
        console.error('Elementos de la tabla no encontrados');
        return;
    }
    
    ocultarTodasLasTablas();
    tablaTrabajadores.style.display = 'block';
    
    // Aplicar filtros
    trabajadores = aplicarFiltrosTrabajadores(trabajadores);
    
    if (trabajadores.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="8" class="no-users">
                    <i class="fas fa-briefcase"></i>
                    <h3>No hay trabajadores registrados</h3>
                    <p>Registra nuevos trabajadores desde el sistema principal</p>
                </td>
            </tr>
        `;
        
        if (contadorResultados) {
            contadorResultados.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> trabajadores`;
        }
        return;
    }
    
    cuerpoTabla.innerHTML = '';
    
    trabajadores.forEach(trabajador => {
        const fila = document.createElement('tr');
        
        // Icono y tipo
        const iconoTipo = 'fas fa-briefcase';
        const claseTipo = 'type-obrero';
        
        // Estado
        const estado = trabajador.activo ? 'Activo' : 'Inactivo';
        const claseEstado = trabajador.activo ? 'status-active' : 'status-inactive';
        
        // Condición y cargo
        const condicion = trabajador.condicion || 'No especificada';
        const cargo = trabajador.cargo || 'No especificado';
        
        // Ruta elegida
        const ruta = trabajador.rutaNombre || trabajador.ruta || 'No asignada';
        
        fila.innerHTML = `
            <td>
                <span class="user-type ${claseTipo}">
                    <i class="${iconoTipo}"></i>
                    Trabajador
                </span>
            </td>
            <td>${trabajador.cedula}</td>
            <td>
                <strong>${trabajador.nombre} ${trabajador.apellido}</strong>
            </td>
            <td>${condicion}</td>
            <td>${cargo}</td>
            <td>${ruta}</td>
            <td>
                <span class="user-status ${claseEstado}">${estado}</span>
            </td>
            <td>
                <button class="btn-edit" onclick="editarUsuario('${trabajador.cedula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarUsuario('${trabajador.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${trabajadores.length}</strong> de <strong>${trabajadores.length}</strong> trabajadores`;
    }
}

// Función para renderizar tabla de conductores
function renderizarTablaConductores(conductores) {
    const cuerpoTabla = document.getElementById('cuerpoTablaConductores');
    const contadorResultados = document.getElementById('contadorResultadosConductores');
    const tablaConductores = document.getElementById('tablaConductores');
    
    if (!cuerpoTabla || !tablaConductores) {
        console.error('Elementos de la tabla no encontrados');
        return;
    }
    
    ocultarTodasLasTablas();
    tablaConductores.style.display = 'block';
    
    // Aplicar filtros
    conductores = aplicarFiltrosConductores(conductores);
    
    if (conductores.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="9" class="no-users">
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
    
    cuerpoTabla.innerHTML = '';
    
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
        
        // Estado
        const estado = conductor.activo ? 'Activo' : 'Inactivo';
        const claseEstado = conductor.activo ? 'status-active' : 'status-inactive';
        
        // Ruta asignada
        const ruta = conductor.rutaNombre || conductor.ruta || 'No asignada';
        
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
            </td>
            <td>${ruta}</td>
            <td>${diasFormateados}</td>
            <td>${turnosFormateados}</td>
            <td>
                <span class="user-status ${claseEstado}">${estado}</span>
            </td>
            <td>
                <button class="btn-edit" onclick="editarUsuario('${conductor.cedula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarConductor('${conductor.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${conductores.length}</strong> de <strong>${conductores.length}</strong> conductores`;
    }
}

// Función para renderizar tabla de todos los usuarios
function renderizarTablaTodosUsuarios(usuarios) {
    const cuerpoTabla = document.getElementById('cuerpoTablaTodosUsuarios');
    const contadorResultados = document.getElementById('contadorResultadosTodos');
    const tablaTodosUsuarios = document.getElementById('tablaTodosUsuarios');
    
    if (!cuerpoTabla || !tablaTodosUsuarios) {
        console.error('Elementos de la tabla no encontrados');
        return;
    }
    
    ocultarTodasLasTablas();
    tablaTodosUsuarios.style.display = 'block';
    
    // Aplicar filtros
    usuarios = aplicarFiltrosTodos(usuarios);
    
    if (usuarios.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6" class="no-users">
                    <i class="fas fa-users"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>Registra nuevos usuarios desde el sistema principal</p>
                </td>
            </tr>
        `;
        
        if (contadorResultados) {
            contadorResultados.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> usuarios`;
        }
        return;
    }
    
    cuerpoTabla.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        
        // Determinar icono según tipo
        let iconoTipo = 'fas fa-user';
        let claseTipo = '';
        let tipoTexto = '';
        
        if (usuario.tipo === 'estudiante') {
            iconoTipo = 'fas fa-user-graduate';
            claseTipo = 'type-estudiante';
            tipoTexto = 'Estudiante';
        } else if (usuario.tipo === 'trabajador' || usuario.tipo === 'obrero') {
            iconoTipo = 'fas fa-briefcase';
            claseTipo = 'type-obrero';
            tipoTexto = 'Trabajador';
        } else if (usuario.tipo === 'conductor') {
            iconoTipo = 'fas fa-user-tie';
            claseTipo = 'type-conductor';
            tipoTexto = 'Conductor';
        }
        
        // Estado
        const estado = usuario.activo ? 'Activo' : 'Inactivo';
        const claseEstado = usuario.activo ? 'status-active' : 'status-inactive';
        
        // Ruta elegida
        const ruta = usuario.rutaNombre || usuario.ruta || 'No asignada';
        
        // Botones de acción según tipo
        let acciones = '';
        if (usuario.tipo === 'conductor') {
            acciones = `
                <button class="btn-edit" onclick="editarUsuario('${usuario.cedula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarConductor('${usuario.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
        } else {
            acciones = `
                <button class="btn-edit" onclick="editarUsuario('${usuario.cedula}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-delete" onclick="eliminarUsuario('${usuario.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
        }
        
        fila.innerHTML = `
            <td>
                <span class="user-type ${claseTipo}">
                    <i class="${iconoTipo}"></i>
                    ${tipoTexto}
                </span>
            </td>
            <td>${usuario.cedula}</td>
            <td>
                <strong>${usuario.nombre} ${usuario.apellido}</strong>
            </td>
            <td>${ruta}</td>
            <td>
                <span class="user-status ${claseEstado}">${estado}</span>
            </td>
            <td>${acciones}</td>
        `;
        
        cuerpoTabla.appendChild(fila);
    });
    
    if (contadorResultados) {
        contadorResultados.innerHTML = `Mostrando <strong>${usuarios.length}</strong> de <strong>${todosUsuarios.length}</strong> usuarios`;
    }
}

// ========================================
// FUNCIONES AUXILIARES PARA EDICIÓN
// ========================================

// Función para capitalizar primera letra
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Cargar rutas en un select
function cargarRutasEnSelect(selectId, rutaSeleccionada = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Guardar opción actual
    const opcionesActuales = select.innerHTML;
    
    try {
        const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
        let opcionesHTML = '<option value="">Seleccione una ruta</option>';
        
        Object.keys(rutasDB).forEach(clave => {
            const ruta = rutasDB[clave];
            if (ruta.estado === 'Activa') {
                const seleccionado = (clave === rutaSeleccionada) ? 'selected' : '';
                opcionesHTML += `<option value="${clave}" ${seleccionado}>Ruta ${clave.slice(-1)} - ${ruta.nombre}</option>`;
            }
        });
        
        select.innerHTML = opcionesHTML;
        
    } catch (error) {
        console.error("Error cargando rutas:", error);
        select.innerHTML = opcionesActuales; // Restaurar opciones anteriores
    }
}

// Funciones para checkboxes en edición
function seleccionarTodosDiasEditar(checkbox) {
    const checkboxesDias = document.querySelectorAll('input[name="editarDias"]');
    checkboxesDias.forEach(checkboxDia => {
        checkboxDia.checked = checkbox.checked;
    });
}

function seleccionarTodosTurnosEditar(checkbox) {
    const checkboxesTurnos = document.querySelectorAll('input[name="editarTurnos"]');
    checkboxesTurnos.forEach(checkboxTurno => {
        checkboxTurno.checked = checkbox.checked;
    });
}

function configurarEventosCheckboxesEditar() {
    const checkboxesDias = document.querySelectorAll('input[name="editarDias"]');
    checkboxesDias.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkboxTodosDias = document.getElementById('editarTodosDias');
            if (!this.checked && checkboxTodosDias.checked) {
                checkboxTodosDias.checked = false;
            }
        });
    });
    
    const checkboxesTurnos = document.querySelectorAll('input[name="editarTurnos"]');
    checkboxesTurnos.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkboxTodosTurnos = document.getElementById('editarTodosTurnos');
            if (!this.checked && checkboxTodosTurnos.checked) {
                checkboxTodosTurnos.checked = false;
            }
        });
    });
}

// Funciones para verificar contraseñas
function verificarCoincidenciaContraseñaEstudiante() {
    const password = document.getElementById('editarEstudiantePassword').value;
    const confirmPassword = document.getElementById('editarEstudianteConfirmPassword').value;
    const mensaje = document.getElementById('editarEstudiantePasswordMatch');
    
    if (password && confirmPassword) {
        if (password === confirmPassword) {
            mensaje.className = 'password-match';
            mensaje.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
            mensaje.style.display = 'block';
        } else {
            mensaje.className = 'password-mismatch';
            mensaje.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
            mensaje.style.display = 'block';
        }
    } else {
        mensaje.style.display = 'none';
    }
}

function verificarCoincidenciaContraseñaTrabajador() {
    const password = document.getElementById('editarTrabajadorPassword').value;
    const confirmPassword = document.getElementById('editarTrabajadorConfirmPassword').value;
    const mensaje = document.getElementById('editarTrabajadorPasswordMatch');
    
    if (password && confirmPassword) {
        if (password === confirmPassword) {
            mensaje.className = 'password-match';
            mensaje.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
            mensaje.style.display = 'block';
        } else {
            mensaje.className = 'password-mismatch';
            mensaje.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
            mensaje.style.display = 'block';
        }
    } else {
        mensaje.style.display = 'none';
    }
}

function verificarCoincidenciaContraseñaConductor() {
    const password = document.getElementById('editarConductorPassword').value;
    const confirmPassword = document.getElementById('editarConductorConfirmPassword').value;
    const mensaje = document.getElementById('editarConductorPasswordMatch');
    
    if (password && confirmPassword) {
        if (password === confirmPassword) {
            mensaje.className = 'password-match';
            mensaje.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
            mensaje.style.display = 'block';
        } else {
            mensaje.className = 'password-mismatch';
            mensaje.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
            mensaje.style.display = 'block';
        }
    } else {
        mensaje.style.display = 'none';
    }
}

// ========================================
// FUNCIONES PARA GUARDAR EDICIONES
// ========================================

// Guardar edición de estudiante
function guardarEdicionEstudiante(event, usuarioId) {
    event.preventDefault();
    
    // Validar contraseñas
    const password = document.getElementById('editarEstudiantePassword').value;
    const confirmPassword = document.getElementById('editarEstudianteConfirmPassword').value;
    
    if (password && password.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (password && password !== confirmPassword) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        
        // Verificar si existe el usuario a editar
        if (!usuariosDB[usuarioId]) {
            mostrarNotificacion('Usuario no encontrado en la base de datos', 'error');
            return;
        }
        
        // Obtener datos del formulario (cédula no se edita)
        const nombre = document.getElementById('editarEstudianteNombre').value.trim();
        const carrera = document.getElementById('editarEstudianteCarrera').value.trim();
        const nombreUsuario = document.getElementById('editarEstudianteUsuario').value.trim();
        const email = document.getElementById('editarEstudianteEmail').value.trim();
        
        // Verificar si el nombre de usuario ya existe en OTRO usuario
        const cedula = usuariosDB[usuarioId].cedula; // Obtener cédula del usuario existente
        const usuarioNombreExistente = Object.entries(usuariosDB).find(([id, usuario]) => 
            usuario.nombreUsuario === nombreUsuario && id !== usuarioId
        );
        
        if (usuarioNombreExistente) {
            mostrarNotificacion('El nombre de usuario ya está en uso por otro usuario', 'error');
            return;
        }
        
        // Obtener nombre de ruta
        const rutaId = document.getElementById('editarEstudianteRuta').value;
        let rutaNombre = '';
        if (rutaId) {
            const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
            rutaNombre = rutasDB[rutaId] ? `Ruta ${rutaId.slice(-1)} - ${rutasDB[rutaId].nombre}` : '';
        }
        
        // Mantener datos existentes y actualizar solo los modificados
        usuariosDB[usuarioId] = {
            ...usuariosDB[usuarioId], // Mantener todos los datos existentes incluyendo cédula
            nombre: nombre,
            carrera: carrera,
            ruta: rutaId,
            rutaNombre: rutaNombre,
            nombreUsuario: nombreUsuario,
            password: password,
            email: email,
            fechaActualizacion: new Date().toISOString(),
            actualizadoPor: sesionAdmin ? sesionAdmin.username : 'admin'
        };
        
        // Actualizar contraseña solo si se proporcionó una nueva
        if (password) {
            usuariosDB[usuarioId].contraseña = password;
        }
        
        // Guardar en localStorage
        localStorage.setItem('unellez_users', JSON.stringify(usuariosDB));
        
        mostrarNotificacion('Estudiante actualizado exitosamente', 'success');
        
        // Volver a la tabla y actualizar
        setTimeout(() => {
            volverATablaEstudiantes();
            cargarUsuarios();
        }, 1000);
        
    } catch (error) {
        console.error('Error al guardar estudiante:', error);
        mostrarNotificacion('Error al guardar los cambios', 'error');
    }
}

// Guardar edición de trabajador
function guardarEdicionTrabajador(event, usuarioId) {
    event.preventDefault();
    
    // Validar contraseñas
    const password = document.getElementById('editarTrabajadorPassword').value;
    const confirmPassword = document.getElementById('editarTrabajadorConfirmPassword').value;
    
    if (password && password.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    if (password && password !== confirmPassword) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        return;
    }
    
    try {
        const usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        
        // Verificar si existe el usuario a editar
        if (!usuariosDB[usuarioId]) {
            mostrarNotificacion('Usuario no encontrado en la base de datos', 'error');
            return;
        }
        
        // Obtener datos del formulario
        const cedula = document.getElementById('editarTabajadorCedula').value.trim();
        const nombre = document.getElementById('editarTrabajadorNombre').value.trim();
        const condicion = document.getElementById('editarTrabajadorCondicion').value.trim();
        const cargo = document.getElementById('editarTrabajadorCargo').value.trim();
        const nombreUsuario = document.getElementById('editarTrabajadorUsuario').value.trim();
        const email = document.getElementById('editarTrabajadorEmail').value.trim();
        
        // Verificar si la cédula ya existe en OTRO usuario (no en este mismo)
        const usuarioExistente = Object.entries(usuariosDB).find(([id, usuario]) => 
            usuario.cedula === cedula && id !== usuarioId
        );
        
        if (usuarioExistente) {
            mostrarNotificacion('Ya existe otro usuario con esta cédula', 'error');
            return;
        }
        
        // Verificar si el nombre de usuario ya existe en OTRO usuario
        const usuarioNombreExistente = Object.entries(usuariosDB).find(([id, usuario]) => 
            usuario.nombreUsuario === nombreUsuario && id !== usuarioId
        );
        
        if (usuarioNombreExistente) {
            mostrarNotificacion('El nombre de usuario ya está en uso por otro usuario', 'error');
            return;
        }
        
        // Obtener nombre de ruta
        const rutaId = document.getElementById('editarEstudianteRuta').value;
        let rutaNombre = '';
        if (rutaId) {
            const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
            rutaNombre = rutasDB[rutaId] ? `Ruta ${rutaId.slice(-1)} - ${rutasDB[rutaId].nombre}` : '';
        }
        
        // Mantener datos existentes y actualizar solo los modificados
        usuariosDB[usuarioId] = {
            ...usuariosDB[usuarioId], // Mantener todos los datos existentes
            cedula: cedula,
            nombre: nombre,
            condicion: condicion,
            cargo: cargo,
            ruta: rutaId,
            rutaNombre: rutaNombre,
            nombreUsuario: nombreUsuario,
            password: password,
            email: email,
            tipo: 'trabajador',
            fechaActualizacion: new Date().toISOString(),
            actualizadoPor: sesionAdmin ? sesionAdmin.username : 'admin'
        };
        
        // Actualizar contraseña solo si se proporcionó una nueva
        if (password) {
            usuariosDB[usuarioId].contraseña = password;
        }
        
        // Guardar en localStorage (esto actualiza el usuario existente)
        localStorage.setItem('unellez_users', JSON.stringify(usuariosDB));
        
        mostrarNotificacion('Estudiante actualizado exitosamente', 'success');
        
        // Volver a la tabla y actualizar
        setTimeout(() => {
            volverATablaEstudiantes();
            cargarUsuarios();
        }, 1000);
        
    } catch (error) {
        console.error('Error al guardar estudiante:', error);
        mostrarNotificacion('Error al guardar los cambios', 'error');
    }
}

// Guardar edición de conductor
function guardarEdicionConductor(event, usuarioId) {
    event.preventDefault();
    
    // Validar días de trabajo
    const diasSeleccionados = Array.from(document.querySelectorAll('input[name="editarDias"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (diasSeleccionados.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un día de trabajo', 'error');
        return;
    }
    
    // Validar turnos
    const turnosSeleccionados = Array.from(document.querySelectorAll('input[name="editarTurnos"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (turnosSeleccionados.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un turno', 'error');
        return;
    }
    
    try {
        const usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        
        // Verificar si existe el usuario a editar
        if (!usuariosDB[usuarioId]) {
            mostrarNotificacion('Usuario no encontrado en la base de datos', 'error');
            return;
        }
        
        // Obtener datos del formulario
        const cedula = document.getElementById('editarConductorCedula').value.trim();
        const nombre = document.getElementById('editarConductorNombre').value.trim();
        const condicion = document.getElementById('editarConductorCondicion').value.trim();
        const cargo = document.getElementById('editarConductorCargo').value.trim();
        const nombreUsuario = document.getElementById('editarConductorUsuario').value.trim();
        const licencia = document.getElementById('editarConductorLicencia')?.value.trim() || '';
        const activo = document.getElementById('editarConductorActivo').value === 'true';
        
        // Verificar si la cédula ya existe en OTRO usuario
        const usuarioExistente = Object.entries(usuariosDB).find(([id, usuario]) => 
            usuario.cedula === cedula && id !== usuarioId
        );
        
        if (usuarioExistente) {
            mostrarNotificacion('Ya existe otro usuario con esta cédula', 'error');
            return;
        }
        
        // Verificar si el nombre de usuario ya existe en OTRO usuario
        const usuarioNombreExistente = Object.entries(usuariosDB).find(([id, usuario]) => 
            usuario.nombreUsuario === nombreUsuario && id !== usuarioId
        );
        
        if (usuarioNombreExistente) {
            mostrarNotificacion('El nombre de usuario ya está en uso por otro usuario', 'error');
            return;
        }
        
        // Obtener nombre de ruta
        const rutaId = document.getElementById('editarConductorRuta').value;
        let rutaNombre = '';
        if (rutaId) {
            const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
            rutaNombre = rutasDB[rutaId] ? `Ruta ${rutaId.slice(-1)} - ${rutasDB[rutaId].nombre}` : '';
        }
        
        // Mantener datos existentes y actualizar solo los modificados
        usuariosDB[usuarioId] = {
            ...usuariosDB[usuarioId],
            cedula: cedula,
            nombre: nombre,
            condicion: condicion,
            cargo: cargo,
            ruta: rutaId,
            rutaNombre: rutaNombre,
            diasTrabajo: diasSeleccionados,
            turnos: turnosSeleccionados,
            nombreUsuario: nombreUsuario,
            licencia: licencia,
            activo: activo,
            tipo: 'conductor',
            detalles: `Conductor | Ruta: ${rutaNombre}`,
            horarioDetalles: `Días: ${diasSeleccionados.join(', ')} | Turnos: ${turnosSeleccionados.join(', ')}`,
            fechaActualizacion: new Date().toISOString(),
            actualizadoPor: sesionAdmin ? sesionAdmin.username : 'admin'
        };
        
        // Obtener contraseña si se proporcionó
        const passwordInput = document.getElementById('editarConductorPassword');
        if (passwordInput && passwordInput.value) {
            const password = passwordInput.value;
            const confirmPasswordInput = document.getElementById('editarConductorConfirmPassword');
            
            if (confirmPasswordInput && password !== confirmPasswordInput.value) {
                mostrarNotificacion('Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (password.length < 6) {
                mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
                return;
            }
            
            usuariosDB[usuarioId].contraseña = password;
        }
        
        // Guardar en localStorage
        localStorage.setItem('unellez_users', JSON.stringify(usuariosDB));
        
        mostrarNotificacion('Conductor actualizado exitosamente', 'success');
        
        // Volver a la tabla y actualizar
        setTimeout(() => {
            volverATablaConductores();
            cargarUsuarios();
        }, 1000);
        
    } catch (error) {
        console.error('Error al guardar conductor:', error);
        mostrarNotificacion('Error al guardar los cambios', 'error');
    }
}

// ========================================
// FUNCIONES PARA VOLVER A LAS TABLAS
// ========================================

function volverATablaEstudiantes() {
    mostrarStats();
    ocultarFormulariosEdicion();
    document.getElementById('tablaEstudiantes').style.display = 'block';
    filtroActual = 'estudiante';
}

function volverATablaTrabajadores() {
    mostrarStats();
    ocultarFormulariosEdicion();
    document.getElementById('tablaTrabajadores').style.display = 'block';
    filtroActual = 'trabajador';
}

function volverATablaConductores() {
    mostrarStats();
    ocultarFormulariosEdicion();
    document.getElementById('tablaConductores').style.display = 'block';
    filtroActual = 'conductor';
    document.getElementById('accionesConductor').style.display = 'flex';
}

function volverATablaTodos() {
    mostrarStats();
    ocultarFormulariosEdicion();
    document.getElementById('tablaTodosUsuarios').style.display = 'block';
    filtroActual = 'todos';
}

function ocultarFormulariosEdicion() {
    const formularios = [
        'formularioEditarEstudiante',
        'formularioEditarTrabajador',
        'formularioEditarConductor'
    ];
    
    formularios.forEach(id => {
        const formulario = document.getElementById(id);
        if (formulario) {
            formulario.style.display = 'none';
        }
    });
}

// Modificar la función ocultarTodasLasTablas para que también oculte formularios
function ocultarTodasLasTablas() {
    document.getElementById('tablaEstudiantes').style.display = 'none';
    document.getElementById('tablaTrabajadores').style.display = 'none';
    document.getElementById('tablaConductores').style.display = 'none';
    document.getElementById('tablaTodosUsuarios').style.display = 'none';
    ocultarFormulariosEdicion();
}

// Función para ocultar elementos antes de mostrar formulario de edición
function ocultarTodoParaFormularioEdicion() {
    // Ocultar estadísticas
    const statsContainer = document.querySelector('.admin-stats');
    if (statsContainer) {
        statsContainer.style.display = 'none';
    }
    
    // Ocultar botón "Nuevo Conductor" (si existe)
    const accionesConductor = document.getElementById('accionesConductor');
    if (accionesConductor) {
        accionesConductor.style.display = 'none';
    }
    
    // Ocultar todas las tablas
    ocultarTodasLasTablas();
}

// Función para ocultar elementos antes de mostrar formulario de edición
function mostrarStats() {
    // Mostar estadísticas
    const statsContainer = document.querySelector('.admin-stats');
    if (statsContainer) {
        statsContainer.style.display = 'grid';
    }
    
    // Ocultar botón "Nuevo Conductor" (si existe)
    const accionesConductor = document.getElementById('accionesConductor');
    if (accionesConductor) {
        accionesConductor.style.display = 'flex';
    }
}

// Funciones de filtrado
function aplicarFiltrosEstudiantes(estudiantes) {
    let filtrados = [...estudiantes];
    
    filtrosEstudiantes.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(estudiante => {
            switch(indice) {
                case 0: // Tipo (siempre "estudiante")
                    return 'estudiante'.includes(filtro);
                case 1: // Cédula
                    return estudiante.cedula.toLowerCase().includes(filtro);
                case 2: // Nombre
                    const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`.toLowerCase();
                    return nombreCompleto.includes(filtro);
                case 3: // Carrera
                    const carrera = estudiante.carrera || 'No especificada';
                    return carrera.toLowerCase().includes(filtro);
                case 4: // Ruta
                    const ruta = estudiante.rutaNombre || estudiante.ruta || 'No asignada';
                    return ruta.toLowerCase().includes(filtro);
                case 5: // Estado
                    const estado = estudiante.activo ? 'activo' : 'inactivo';
                    return estado.includes(filtro);
                default:
                    return true;
            }
        });
    });
    
    return filtrados;
}

function aplicarFiltrosTrabajadores(trabajadores) {
    let filtrados = [...trabajadores];
    
    filtrosTrabajadores.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(trabajador => {
            switch(indice) {
                case 0: // Tipo (siempre "trabajador")
                    return 'trabajador'.includes(filtro) || 'obrero'.includes(filtro);
                case 1: // Cédula
                    return trabajador.cedula.toLowerCase().includes(filtro);
                case 2: // Nombre
                    const nombreCompleto = `${trabajador.nombre} ${trabajador.apellido}`.toLowerCase();
                    return nombreCompleto.includes(filtro);
                case 3: // Condición
                    const condicion = trabajador.condicion || 'No especificada';
                    return condicion.toLowerCase().includes(filtro);
                case 4: // Cargo
                    const cargo = trabajador.cargo || 'No especificado';
                    return cargo.toLowerCase().includes(filtro);
                case 5: // Ruta
                    const ruta = trabajador.rutaNombre || trabajador.ruta || 'No asignada';
                    return ruta.toLowerCase().includes(filtro);
                case 6: // Estado
                    const estado = trabajador.activo ? 'activo' : 'inactivo';
                    return estado.includes(filtro);
                default:
                    return true;
            }
        });
    });
    
    return filtrados;
}

function aplicarFiltrosConductores(conductores) {
    let filtrados = [...conductores];
    
    filtrosConductores.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(conductor => {
            switch(indice) {
                case 0: // Tipo (siempre "conductor")
                    return 'conductor'.includes(filtro);
                case 1: // Cédula
                    return conductor.cedula.toLowerCase().includes(filtro);
                case 2: // Nombre
                    const nombreCompleto = `${conductor.nombre} ${conductor.apellido}`.toLowerCase();
                    return nombreCompleto.includes(filtro);
                case 3: // Ruta
                    const ruta = conductor.rutaNombre || conductor.ruta || 'No asignada';
                    return ruta.toLowerCase().includes(filtro);
                case 4: // Días
                    const dias = Array.isArray(conductor.diasTrabajo) 
                        ? conductor.diasTrabajo.join(' ').toLowerCase()
                        : '';
                    return dias.includes(filtro);
                case 5: // Turno
                    const turnos = Array.isArray(conductor.turnos) 
                        ? conductor.turnos.join(' ').toLowerCase()
                        : '';
                    return turnos.includes(filtro);
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

function aplicarFiltrosTodos(usuarios) {
    let filtrados = [...usuarios];
    
    filtrosTodos.forEach((filtro, indice) => {
        if (filtro.trim() === '') return;
        
        filtrados = filtrados.filter(usuario => {
            switch(indice) {
                case 0: // Tipo
                    const tipo = usuario.tipo === 'obrero' ? 'trabajador' : usuario.tipo;
                    return tipo.includes(filtro);
                case 1: // Cédula
                    return usuario.cedula.toLowerCase().includes(filtro);
                case 2: // Nombre
                    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`.toLowerCase();
                    return nombreCompleto.includes(filtro);
                case 3: // Ruta
                    const ruta = usuario.rutaNombre || usuario.ruta || 'No asignada';
                    return ruta.toLowerCase().includes(filtro);
                case 4: // Estado
                    const estado = usuario.activo ? 'activo' : 'inactivo';
                    return estado.includes(filtro);
                default:
                    return true;
            }
        });
    });
    
    return filtrados;
}

// Filtrar usuarios por tipo
function filtrarUsuariosPorTipo(tipo) {
    console.log(`Filtrando por tipo: ${tipo}`);
    
    filtroActual = tipo;
    
    // Mostrar u ocultar el botón "Nuevo Conductor"
    const accionesConductor = document.getElementById('accionesConductor');
    if (accionesConductor) {
        if (tipo === 'conductor') {
            accionesConductor.style.display = 'flex';
        } else {
            accionesConductor.style.display = 'none';
        }
    }
    
    // Resaltar el stat seleccionado
    document.querySelectorAll('.stat-card').forEach(card => {
        if (card && card.style) {
            card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
        }
    });
    
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
    
    setTimeout(() => {
        switch(tipo) {
            case 'estudiante':
                renderizarTablaEstudiantes(estudiantes);
                break;
            case 'trabajador':
                renderizarTablaTrabajadores(trabajadores);
                break;
            case 'conductor':
                renderizarTablaConductores(conductores);
                break;
            case 'todos':
                renderizarTablaTodosUsuarios(todosUsuarios);
                break;
        }
    }, 100);
}

// Filtrar por columna en tabla de estudiantes/trabajadores
function filtrarColumna(input) {
    const indiceColumna = parseInt(input.dataset.columna);
    const valor = input.value.toLowerCase();
    
    // Determinar qué tabla está activa
    if (filtroActual === 'estudiante') {
        filtrosEstudiantes[indiceColumna] = valor;
        renderizarTablaEstudiantes(estudiantes);
    } else if (filtroActual === 'trabajador') {
        filtrosTrabajadores[indiceColumna] = valor;
        renderizarTablaTrabajadores(trabajadores);
    }
}

// Filtrar por columna en tabla de conductores
function filtrarColumnaConductor(input) {
    const indiceColumna = parseInt(input.dataset.columna);
    const valor = input.value.toLowerCase();
    
    filtrosConductores[indiceColumna] = valor;
    renderizarTablaConductores(conductores);
}

// Filtrar por columna en tabla de todos
function filtrarColumnaTodos(input) {
    const indiceColumna = parseInt(input.dataset.columna);
    const valor = input.value.toLowerCase();
    
    filtrosTodos[indiceColumna] = valor;
    renderizarTablaTodosUsuarios(todosUsuarios);
}

// Limpiar filtros de estudiantes/trabajadores
function limpiarFiltros() {
    if (filtroActual === 'estudiante') {
        filtrosEstudiantes = ['', '', '', '', '', ''];
        document.querySelectorAll('#tablaEstudiantes .filtro-columna').forEach(input => {
            if (input.tagName === 'INPUT') input.value = '';
            if (input.tagName === 'SELECT') input.value = '';
        });
        renderizarTablaEstudiantes(estudiantes);
    } else if (filtroActual === 'trabajador') {
        filtrosTrabajadores = ['', '', '', '', '', '', ''];
        document.querySelectorAll('#tablaTrabajadores .filtro-columna').forEach(input => {
            if (input.tagName === 'INPUT') input.value = '';
            if (input.tagName === 'SELECT') input.value = '';
        });
        renderizarTablaTrabajadores(trabajadores);
    }
}

// Limpiar filtros de conductores
function limpiarFiltrosConductores() {
    filtrosConductores = ['', '', '', '', '', '', '', ''];
    document.querySelectorAll('#tablaConductores .filtro-columna-conductor').forEach(input => {
        if (input.tagName === 'INPUT') input.value = '';
        if (input.tagName === 'SELECT') input.value = '';
    });
    renderizarTablaConductores(conductores);
}

// Limpiar filtros de todos los usuarios
function limpiarFiltrosTodos() {
    filtrosTodos = ['', '', '', '', ''];
    document.querySelectorAll('#tablaTodosUsuarios .filtro-columna-todos').forEach(input => {
        if (input.tagName === 'INPUT') input.value = '';
        if (input.tagName === 'SELECT') input.value = '';
    });
    renderizarTablaTodosUsuarios(todosUsuarios);
}

// Eliminar usuario
function eliminarUsuario(cedula) {
    if (!confirm(`¿Está seguro de eliminar al usuario con cédula ${cedula}?`)) {
        return;
    }
    
    eliminarUsuarioPorCedula(cedula, false);
}

// Eliminar conductor
function eliminarConductor(cedula) {
    if (!confirm(`¿Está seguro de eliminar al conductor con cédula ${cedula}?`)) {
        return;
    }
    
    eliminarUsuarioPorCedula(cedula, true);
}

// Función principal para eliminar usuario por cédula
function eliminarUsuarioPorCedula(cedula, esConductor = false) {
    console.log(`Eliminando usuario con cédula: ${cedula}, es conductor: ${esConductor}`);
    
    try {
        let usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        let encontrado = false;
        
        for (const [userId, usuario] of Object.entries(usuariosDB)) {
            if (usuario.cedula === cedula) {
                console.log('Usuario encontrado:', usuario);
                
                if (esConductor && usuario.tipo !== 'conductor') {
                    mostrarNotificacion('El usuario no es un conductor', 'error');
                    return;
                }
                
                delete usuariosDB[userId];
                encontrado = true;
                break;
            }
        }
        
        if (!encontrado) {
            mostrarNotificacion('Usuario no encontrado', 'error');
            return;
        }
        
        localStorage.setItem('unellez_users', JSON.stringify(usuariosDB));
        mostrarNotificacion(`${esConductor ? 'Conductor' : 'Usuario'} eliminado exitosamente`, 'success');
        
        setTimeout(() => {
            cargarUsuarios();
        }, 500);
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        mostrarNotificacion('Error al eliminar el usuario', 'error');
    }
}

// Función principal para editar usuario
function editarUsuario(cedula) {
    console.log(`Editando usuario con cédula: ${cedula}`);

    ocultarTodoParaFormularioEdicion();
    
    try {
        const usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        let usuarioEncontrado = null;
        let usuarioId = null;
        
        // Buscar usuario por cédula
        for (const [id, usuario] of Object.entries(usuariosDB)) {
            if (usuario.cedula === cedula) {
                usuarioEncontrado = usuario;
                usuarioId = id;
                break;
            }
        }
        
        if (!usuarioEncontrado) {
            mostrarNotificacion('Usuario no encontrado', 'error');
            return;
        }
        
        // Determinar tipo de usuario y mostrar formulario correspondiente
        const tipo = usuarioEncontrado.tipo || 'estudiante';
        
        switch(tipo) {
            case 'estudiante':
                mostrarFormularioEditarEstudiante(usuarioEncontrado, usuarioId);
                break;
            case 'trabajador':
            case 'obrero':
                mostrarFormularioEditarTrabajador(usuarioEncontrado, usuarioId);
                break;
            case 'conductor':
                mostrarFormularioEditarConductor(usuarioEncontrado, usuarioId);
                break;
            default:
                // Si es un tipo no reconocido, usar formulario de estudiante
                mostrarFormularioEditarEstudiante(usuarioEncontrado, usuarioId);
        }
        
    } catch (error) {
        console.error('Error al editar usuario:', error);
        mostrarNotificacion('Error al cargar los datos del usuario', 'error');
    }
}

// ========================================
// FORMULARIOS DE EDICIÓN
// ========================================

// Mostrar formulario para editar estudiante
function mostrarFormularioEditarEstudiante(estudiante, usuarioId) {
    // Ocultar todas las tablas y mostrar formulario
    ocultarTodoParaFormularioEdicion();
    
    // Crear o mostrar contenedor del formulario
    let formularioContainer = document.getElementById('formularioEditarEstudiante');
    
    if (!formularioContainer) {
        formularioContainer = document.createElement('div');
        formularioContainer.id = 'formularioEditarEstudiante';
        formularioContainer.className = 'formulario-editar-container';
        formularioContainer.innerHTML = `
            <div class="formulario-header">
                <h3><i class="fas fa-user-graduate"></i> Editar Estudiante</h3>
                <button type="button" class="btn btn-secondary" onclick="volverATablaEstudiantes()">
                    <i class="fas fa-arrow-left"></i> <span>Volver a la lista</span>
                </button>
            </div>
            
            <form id="formEditarEstudiante" class="formulario-editar" onsubmit="guardarEdicionEstudiante(event, '${usuarioId}')">
                <input type="hidden" id="editarEstudianteId" value="${usuarioId}">
                
                <div class="form-section">
                    <h3><i class="fas fa-info-circle"></i> Información Personal</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarEstudianteCedula">Cédula *</label>
                            <input type="text" id="editarEstudianteCedula" required 
                                placeholder="Ej: 12345678"
                                maxlength="8"
                                minlength="6"
                                pattern="[0-9]{6,8}"
                                inputmode="numeric"
                                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                                >
                            <small>6-8 dígitos numéricos (no editable)</small>
                        </div>
                        <div class="form-group">
                            <label for="editarEstudianteNombre">Nombre Completo*</label>
                            <input type="text" id="editarEstudianteNombre" required 
                                placeholder="Ej: NOMBRES APELLIDOS"
                                pattern="[A-Za-z]+" 
                                title="Solo se permiten letras"
                                maxlength="100"
                                style="background-color: #f8f9fa;"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /^[A-Za-z\s]$/.test(String.fromCharCode(event.charCode))">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarEstudianteCarrera">Carrera *</label>
                            <input type="text" id="editarEstudianteCarrera" required 
                                placeholder="Ej: Ingeniería Informática"
                                pattern="[A-Za-z]+" 
                                title="Solo se permiten letras"
                                maxlength="100"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /^[A-Za-z\s]$/.test(String.fromCharCode(event.charCode))">
                        </div>
                        <div class="form-group">
                            <label for="editarEstudianteRuta">Ruta Elegida</label>
                            <select id="editarEstudianteRuta">
                                <option value="">Seleccione una ruta</option>
                                <!-- Las rutas se cargarán dinámicamente -->
                            </select>
                            <small>Ruta de transporte asignada</small>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-user-lock"></i> Credenciales de Acceso</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarEstudianteUsuario">Nombre de Usuario *</label>
                            <input type="text" id="editarEstudianteUsuario" required 
                                placeholder="Ej: jperez2024"
                                maxlength="30">
                            <small>Para iniciar sesión en el sistema</small>
                        </div>
                        <div class="form-group">
                            <label for="editarEstudiantePassword">Contraseña *</label>
                            <div class="password-input">
                                <input type="password" id="editarEstudiantePassword" required 
                                    placeholder="Ingrese nueva contraseña">
                                <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small>Mínimo 6 caracteres</small>
                        </div>
                        <div class="form-group">
                            <label for="editarEstudianteConfirmPassword">Confirmar Contraseña *</label>
                            <div class="password-input">
                                <input type="password" id="editarEstudianteConfirmPassword" required 
                                    placeholder="Confirme la contraseña">
                                <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div id="editarEstudiantePasswordMatch" class="password-match" style="display: none;">
                            <i class="fas fa-check-circle"></i> Las contraseñas coinciden
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-user-check"></i> Estado del Usuario</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarEstudianteEmail">Correo Electrónico</label>
                            <input type="email" id="editarEstudianteEmail" 
                                placeholder="Ej: estudiante@unellez.edu.ve"
                                maxlength="50"
                                oninput="this.value = this.value.replace(/[^A-Za-z0-9@.]/g, '').toUpperCase()">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="volverATablaEstudiantes()">
                        <i class="fas fa-times"></i> <span>Cancelar</span>
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> <span>Guardar Cambios</span>
                    </button>
                </div>
            </form>
        `;
        
        document.getElementById('usuariosSection').appendChild(formularioContainer);
    }
    
    // Mostrar el formulario
    formularioContainer.style.display = 'block';
    
    // Usar setTimeout para asegurar que el DOM se haya actualizado
    setTimeout(() => {
        // Cargar datos del estudiante
        const cedulaInput = document.getElementById('editarEstudianteCedula');
        const nombreInput = document.getElementById('editarEstudianteNombre');
        const apellidoInput = document.getElementById('editarEstudianteApellido');
        const carreraInput = document.getElementById('editarEstudianteCarrera');
        const usuarioInput = document.getElementById('editarEstudianteUsuario');
        const emailInput = document.getElementById('editarEstudianteEmail');
        const activoSelect = document.getElementById('editarEstudianteActivo');
        
        // Verificar que los elementos existen antes de asignar valores
        if (cedulaInput) cedulaInput.value = estudiante.cedula || '';
        if (nombreInput) nombreInput.value = estudiante.nombre || '';
        if (apellidoInput) apellidoInput.value = estudiante.apellido || '';
        if (carreraInput) carreraInput.value = estudiante.carrera || '';
        if (usuarioInput) usuarioInput.value = estudiante.nombreUsuario || estudiante.usuario || '';
        if (emailInput) emailInput.value = estudiante.email || '';
        if (activoSelect) activoSelect.value = estudiante.activo ? 'true' : 'false';
        
        // Cargar rutas disponibles
        cargarRutasEnSelect('editarEstudianteRuta', estudiante.ruta || '');
        
        // Configurar validación de contraseñas
        const inputsPassword = ['editarEstudiantePassword', 'editarEstudianteConfirmPassword'];
        inputsPassword.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', verificarCoincidenciaContraseñaEstudiante);
            }
        });
    }, 50);
}

// Mostrar formulario para editar trabajador
function mostrarFormularioEditarTrabajador(trabajador, usuarioId) {
    ocultarTodasLasTablas();
    
    let formularioContainer = document.getElementById('formularioEditarTrabajador');
    
    if (!formularioContainer) {
        formularioContainer = document.createElement('div');
        formularioContainer.id = 'formularioEditarTrabajador';
        formularioContainer.className = 'formulario-editar-container';
        formularioContainer.innerHTML = `
            <div class="formulario-header">
                <h3><i class="fas fa-briefcase"></i> Editar Trabajador</h3>
                <button type="button" class="btn btn-secondary" onclick="volverATablaTrabajadores()">
                    <i class="fas fa-arrow-left"></i> <span>Volver a la lista</span>
                </button>
            </div>
            
            <form id="formEditarTrabajador" class="formulario-editar" onsubmit="guardarEdicionTrabajador(event, '${usuarioId}')">
                <input type="hidden" id="editarTrabajadorId" value="${usuarioId}">
                
                <div class="form-section">
                    <h3><i class="fas fa-info-circle"></i> Información Personal</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarTrabajadorCedula">Cédula *</label>
                            <input type="text" id="editarTrabajadorCedula" required 
                                placeholder="Ej: 12345678"
                                maxlength="8"
                                minlength="6"
                                pattern="[0-9]{6,8}"
                                inputmode="numeric"
                                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                               >
                            <small>6-8 dígitos numéricos (no editable)</small>
                        </div>
                        <div class="form-group">
                            <label for="editarTrabajadorNombre">Nombre Completo*</label>
                            <input type="text" id="editarTrabajadorNombre" required 
                                placeholder="NOMBRES APELLIDOS"
                                maxlength="50"
                                pattern="[A-Za-z]+"
                                title="Solo se permiten letras"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /^[A-Za-z\s]$/.test(String.fromCharCode(event.charCode))">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarTrabajadorCondicion">Condición *</label>
                            <input type="text" id="editarTrabajadorCondicion" required 
                                placeholder="Ej: Profesor de Matemáticas"
                                maxlength="50"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /[A-Za-z0-9-]/.test(String.fromCharCode(event.charCode))">
                        </div>
                        <div class="form-group">
                            <label for="editarTrabajadorCargo">Cargo *</label>
                            <input type="text" id="editarTrabajadorCargo" required 
                                placeholder="Ej: Profesor de Matemáticas"
                                maxlength="50"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /[A-Za-z0-9-]/.test(String.fromCharCode(event.charCode))">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarTrabajadorRuta">Ruta Elegida</label>
                            <select id="editarTrabajadorRuta">
                                <option value="">Seleccione una ruta</option>
                                <!-- Las rutas se cargarán dinámicamente -->
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-user-lock"></i> Credenciales de Acceso</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarTrabajadorUsuario">Nombre de Usuario *</label>
                            <input type="text" id="editarTrabajadorUsuario" required 
                                placeholder="Ej: jperez.prof"
                                maxlength="30">
                        </div>
                        <div class="form-group">
                            <label for="editarTrabajadorPassword">Contraseña *</label>
                            <div class="password-input">
                                <input type="password" id="editarTrabajadorPassword" required 
                                    placeholder="Ingrese nueva contraseña">
                                <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small>Mínimo 6 caracteres. Deje en blanco para mantener la actual</small>
                        </div>
                        <div class="form-group">
                            <label for="editarTrabajadorConfirmPassword">Confirmar Contraseña *</label>
                            <div class="password-input">
                                <input type="password" id="editarTrabajadorConfirmPassword" required 
                                    placeholder="Confirme la contraseña">
                                <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div id="editarTrabajadorPasswordMatch" class="password-match" style="display: none;">
                            <i class="fas fa-check-circle"></i> Las contraseñas coinciden
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-user-check"></i> Estado del Usuario</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarTrabajadorEmail">Correo Electronico</label>
                            <input type="email" id="editarTrabajadorEmail" 
                                placeholder="Ej: profesor@gmail.com"
                                maxlength="50"
                                oninput="this.value = this.value.replace(/[^A-Za-z0-9@.]/g, '').toUpperCase()">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="volverATablaTrabajadores()">
                        <i class="fas fa-times"></i> <span>Cancelar</span>
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> <span>Guardar Cambios</span>
                    </button>
                </div>
            </form>
        `;
        
        document.getElementById('usuariosSection').appendChild(formularioContainer);
    }
    
    formularioContainer.style.display = 'block';
    
    setTimeout(()=>{
        // Cargar datos del trabajador
        const cedula = document.getElementById('editarTrabajadorCedula');
        const nombre = document.getElementById('editarTrabajadorNombre');
        const apellido = document.getElementById('editarTrabajadorApellido');
        const condicion = document.getElementById('editarTrabajadorCondicion');
        const cargo =document.getElementById('editarTrabajadorCargo');
        const nombreUsuario = document.getElementById('editarTrabajadorUsuario');
        const email = document.getElementById('editarTrabajadorEmail');
        const status = document.getElementById('editarTrabajadorActivo');

        if (cedula) cedula.value = trabajador.cedula || '';
        if (nombre) nombre.value = trabajador.nombre || '';
        if (apellido) apellido.value = trabajador.apellido || '';
        if (condicion) condicion.value = trabajador.condicion || 'Profesor';
        if (cargo) cargo.value = trabajador.cargo || '';
        if (nombreUsuario) nombreUsuario.value = trabajador.nombreUsuario || trabajador.usuario || '';
        if (email) email.value = trabajador.email || '';
        if (status) status.value = trabajador.activo ? 'true' : 'false';
        
        cargarRutasEnSelect('editarTrabajadorRuta', trabajador.ruta || '');
        
        const inputsPassword = ['editarTrabajadorPassword', 'editarTrabajadorConfirmPassword'];
        inputsPassword.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', verificarCoincidenciaContraseñaTrabajador);
            }
        });
    }, 50);
};

// Mostrar formulario para editar conductor
function mostrarFormularioEditarConductor(conductor, usuarioId) {
    ocultarTodasLasTablas();
    document.getElementById('accionesConductor').style.display = 'none';
    
    let formularioContainer = document.getElementById('formularioEditarConductor');
    
    if (!formularioContainer) {
        formularioContainer = document.createElement('div');
        formularioContainer.id = 'formularioEditarConductor';
        formularioContainer.className = 'formulario-editar-container';
        formularioContainer.innerHTML = `
            <div class="formulario-header">
                <h3><i class="fas fa-user-tie"></i> Editar Conductor</h3>
                <button type="button" class="btn btn-secondary" onclick="volverATablaConductores()">
                    <i class="fas fa-arrow-left"></i> <span>Volver a la lista</span>
                </button>
            </div>
            
            <form id="formEditarConductor" class="formulario-editar" onsubmit="guardarEdicionConductor(event, '${usuarioId}')">
                <input type="hidden" id="editarConductorId" value="${usuarioId}">
                
                <div class="form-section">
                    <h3><i class="fas fa-info-circle"></i> Información Personal</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarConductorCedula">Cédula *</label>
                            <input type="text" id="editarConductorCedula" required 
                                placeholder="Ej: 12345678"
                                maxlength="8"
                                minlength="6"
                                pattern="[0-9]{6,8}"
                                inputmode="numeric"
                                oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                            <small>6-8 dígitos numéricos (no editable)</small>
                        </div>
                        <div class="form-group">
                            <label for="editarConductorNombre">Nombre Completo*</label>
                            <input type="text" id="editarConductorNombre" required
                            placeholder="NOMBRES APELLIDOS"
                            pattern="[A-Za-z]+"
                            maxlength="50"
                            oninput="this.value = this.value.toUpperCase()"
                            onkeypress="return /^[A-Za-z\s]$/.test(String.fromCharCode(event.charCode))">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarConductorCondicion">Condición *</label>
                            <input type="text" id="editarConductorCondicion" required 
                                placeholder="Ej: Profesor de Matemáticas"
                                maxlength="100"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /[A-Za-z0-9-]/.test(String.fromCharCode(event.charCode))">
                        </div>
                        <div class="form-group">
                            <label for="editarConductorCargo">Cargo *</label>
                            <input type="text" id="editarTrabajadorCargo" required 
                                placeholder="Ej: Profesor de Matemáticas"
                                maxlength="100"
                                oninput="this.value = this.value.toUpperCase()"
                                onkeypress="return /[A-Za-z0-9-]/.test(String.fromCharCode(event.charCode))">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarConductorRuta">Ruta Asignada *</label>
                            <select id="editarConductorRuta" required>
                                <option value="">Seleccione una ruta</option>
                                <!-- Las rutas se cargarán dinámicamente -->
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-calendar-alt"></i> Horario de Trabajo</h3>
                    
                    <div class="direct-form-group">
                        <label>Días de Trabajo *</label>
                        <div class="checkbox-group-grid">
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarDiaLunes" name="editarDias" value="lunes">
                                <label for="editarDiaLunes">Lunes</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarDiaMartes" name="editarDias" value="martes">
                                <label for="editarDiaMartes">Martes</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarDiaMiercoles" name="editarDias" value="miercoles">
                                <label for="editarDiaMiercoles">Miércoles</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarDiaJueves" name="editarDias" value="jueves">
                                <label for="editarDiaJueves">Jueves</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarDiaViernes" name="editarDias" value="viernes">
                                <label for="editarDiaViernes">Viernes</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarDiaSabado" name="editarDias" value="sabado">
                                <label for="editarDiaSabado">Sábado</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarTodosDias" onclick="seleccionarTodosDiasEditar(this)">
                                <label for="editarTodosDias">Seleccionar todos</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="direct-form-group">
                        <label>Turnos *</label>
                        <div class="checkbox-group-grid">
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarTurnoManana" name="editarTurnos" value="mañana">
                                <label for="editarTurnoManana">Mañana (6:00 AM)</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarTurnoMedioDia" name="editarTurnos" value="medio dia">
                                <label for="editarTurnoMedioDia">Medio Día (12:00 PM)</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarTurnoTarde" name="editarTurnos" value="tarde">
                                <label for="editarTurnoTarde">Tarde (6:00 PM)</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="editarTodosTurnos" onclick="seleccionarTodosTurnosEditar(this)">
                                <label for="editarTodosTurnos">Seleccionar todos</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-user-lock"></i> Credenciales de Acceso</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarConductorUsuario">Nombre de Usuario *</label>
                            <input type="text" id="editarConductorUsuario" required 
                                placeholder="Ej: crodriguez"
                                maxlength="30">
                        </div>
                        <div class="form-group">
                            <label for="editarConductorPassword">Contraseña</label>
                            <div class="password-input">
                                <input type="password" id="editarConductorPassword" 
                                    placeholder="Ingrese nueva contraseña">
                                <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <small>Deje en blanco para mantener la contraseña actual</small>
                        </div>
                        <div class="form-group">
                            <label for="editarConductorConfirmPassword">Confirmar Contraseña</label>
                            <div class="password-input">
                                <input type="password" id="editarConductorConfirmPassword" 
                                    placeholder="Confirme la contraseña">
                                <button type="button" class="toggle-password" onclick="togglePasswordVisibility(this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div id="editarConductorPasswordMatch" class="password-match" style="display: none;">
                            <i class="fas fa-check-circle"></i> Las contraseñas coinciden
                        </div>
                    </div>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-user-check"></i> Estado del Conductor</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editarConductorActivo">Estado</label>
                            <select id="editarConductorActivo">
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editarConductorLicencia">Licencia de Conducir</label>
                            <input type="text" id="editarConductorLicencia" 
                                placeholder="Ej: ABC123456"
                                maxlength="20"
                                oninput="this.value = this.value.toUpperCase()">
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="volverATablaConductores()">
                        <i class="fas fa-times"></i> <span>Cancelar</span>
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> <span>Guardar Cambios</span>
                    </button>
                </div>
            </form>
        `;
        
        document.getElementById('usuariosSection').appendChild(formularioContainer);
    }
    
    formularioContainer.style.display = 'block';
    
    setTimeout(()=>{
        // Cargar datos del conductor
        const cedula = document.getElementById('editarConductorCedula');
        const nombre = document.getElementById('editarConductorNombre');
        const apellido = document.getElementById('editarConductorApellido');
        const nombreUsuario = document.getElementById('editarConductorUsuario')
        const licencia = document.getElementById('editarConductorLicencia');
        const status = document.getElementById('editarConductorActivo');

        if (cedula) cedula.value = conductor.cedula || '';
        if (nombre) nombre.value = conductor.nombre || '';
        if (apellido) apellido.value = conductor.apellido || '';
        if (nombreUsuario) nombreUsuario.value = conductor.nombreUsuario || conductor.usuario || '';
        if (licencia) licencia.value = conductor.licencia || '';
        if (status) status.value = conductor.activo ? 'true' : 'false';
    
        // Cargar rutas
        cargarRutasEnSelect('editarConductorRuta', conductor.ruta || '');
        
        // Marcar días de trabajo
        if (Array.isArray(conductor.diasTrabajo)) {
            conductor.diasTrabajo.forEach(dia => {
                const checkbox = document.getElementById(`editarDia${capitalizeFirstLetter(dia)}`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Marcar turnos
        if (Array.isArray(conductor.turnos)) {
            conductor.turnos.forEach(turno => {
                let checkboxId = '';
                if (turno === 'mañana') checkboxId = 'editarTurnoManana';
                else if (turno === 'medio dia') checkboxId = 'editarTurnoMedioDia';
                else if (turno === 'tarde') checkboxId = 'editarTurnoTarde';
                
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Configurar eventos para checkboxes
        configurarEventosCheckboxesEditar();
        
        // Configurar validación de contraseñas
        const inputsPassword = ['editarConductorPassword', 'editarConductorConfirmPassword'];
        inputsPassword.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', verificarCoincidenciaContraseñaConductor);
            }
        });
    }, 50);
}

// ========================================
// FUNCIONES DEL MODAL DE CONDUCTOR
// ========================================

let scanner = null;
let datosUsuarioEscaneado = null;

// Abrir modal para registrar conductor
function openDirectConductorModal() {
    document.getElementById('modalDirectConductor').classList.add('active');
    resetModalSteps();
    
    datosUsuarioEscaneado = null;
    document.getElementById('directConductorForm').reset();
    
    mostrarPaso('stepScanQR');
    
    setTimeout(() => {
        iniciarEscaneoQR();
    }, 100);
}

// Cerrar modal conductor
function closeDirectConductorModal() {
    console.log("Cerrando modal registro nuevo conductor");

    const contenedorQR = document.getElementById('qr-reader');
    if (contenedorQR) {
        contenedorQR.innerHTML = '';
        console.log("✅ Contenedor QR limpiado");
    }
    
    datosUsuarioEscaneado = null;
    
    const modal = document.getElementById('modalDirectConductor');
    if (modal) {
        modal.classList.remove('active');
        console.log("✅ Modal cerrado");
    }
    
    const formulario = document.getElementById('directConductorForm');
    if (formulario) {
        formulario.reset();
    }
}

// Resetear pasos del modal
function resetModalSteps() {
    document.querySelectorAll('.modal-step').forEach(paso => {
        paso.style.display = 'none';
        paso.classList.remove('active');
    });
}

// Mostrar un paso específico
function mostrarPaso(idPaso) {
    resetModalSteps();
    const paso = document.getElementById(idPaso);
    if (paso) {
        paso.style.display = 'block';
        paso.classList.add('active');
    }
}

// Iniciar escáner QR
function iniciarEscaneoQR() {
    const configuracion = {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE
        ]
    };
    
    scanner = new Html5QrcodeScanner('qr-reader', configuracion);
    
    scanner.render(
        (textoDecodificado) => {
            console.log("QR:", textoDecodificado);
            if (scanner) scanner.clear();
            procesarDatosQR(textoDecodificado);
        },
        (error) => {
            console.log("Escaneando...", error);
        }
    );
}

// Volver al escaneo
function goBackToScan() {
    mostrarPaso('stepScanQR');
    iniciarEscaneoQR();
}

// Procesar datos del QR
async function procesarDatosQR(datosQR) {
    try {
        // Simular validación con backend
        const datosBackend = await validarQRConBackend(datosQR);
        datosUsuarioEscaneado = datosBackend;
        mostrarResumenDatos(datosBackend);
        cargarOpcionesRutas();
        generarCredencialesPorDefecto();
        mostrarPaso('stepForm');
        
    } catch (error) {
        console.error("Error procesando QR:", error);
        mostrarNotificacion('Error al procesar el código QR', 'error');
    }
}

// Simular validación con backend
async function validarQRConBackend(datosQR) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        const datosParseados = JSON.parse(datosQR);
        
        if (!datosParseados.cedula || !datosParseados.nombre) {
            throw new Error("Datos incompletos en el QR");
        }
        
        return {
            nombre: datosParseados.nombre || '',
            apellido: datosParseados.apellido || '',
            cedula: datosParseados.cedula || '',
            condicion: datosParseados.condicion || 'Conductor',
            cargo: datosParseados.cargo || 'Conductor UNELLEZ',
            tipo: 'conductor'
        };
        
    } catch (error) {
        const partes = datosQR.split('|');
        return {
            nombre: partes[0] || '',
            apellido: partes[1] || '',
            cedula: partes[2] || '',
            condicion: partes[3] || 'Conductor',
            cargo: partes[4] || 'Conductor UNELLEZ',
            tipo: 'conductor'
        };
    }
}

// Mostrar resumen de datos
function mostrarResumenDatos(datosUsuario) {
    const resumenGrid = document.getElementById('summaryGrid');
    
    if (!resumenGrid) return;
    
    resumenGrid.innerHTML = `
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-user"></i> Nombre Completo:</div>
            <div class="summary-value">${datosUsuario.nombre} ${datosUsuario.apellido}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-id-card"></i> Cédula:</div>
            <div class="summary-value">${datosUsuario.cedula}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-user-tag"></i> Condición:</div>
            <div class="summary-value">${datosUsuario.condicion}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label"><i class="fas fa-briefcase"></i> Cargo:</div>
            <div class="summary-value">${datosUsuario.cargo}</div>
        </div>
    `;
}

// Cargar opciones de rutas
function cargarOpcionesRutas() {
    const selectRuta = document.getElementById('directRuta');
    if (!selectRuta) return;
    
    selectRuta.innerHTML = '<option value="">Seleccione una ruta</option>';
    
    try {
        const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
        
        Object.keys(rutasDB).forEach(clave => {
            if (rutasDB[clave].estado === 'Activa') {
                const opcion = document.createElement('option');
                opcion.value = clave;
                opcion.textContent = `Ruta ${clave.slice(-1)} - ${rutasDB[clave].nombre}`;
                selectRuta.appendChild(opcion);
            }
        });
        
    } catch (error) {
        console.error("Error cargando rutas:", error);
    }
}

// Funciones para checkboxes
function seleccionarTodosDias(checkbox) {
    const checkboxesDias = document.querySelectorAll('input[name="dias"]');
    checkboxesDias.forEach(checkboxDia => {
        checkboxDia.checked = checkbox.checked;
    });
}

function seleccionarTodosTurnos(checkbox) {
    const checkboxesTurnos = document.querySelectorAll('input[name="turnos"]');
    checkboxesTurnos.forEach(checkboxTurno => {
        checkboxTurno.checked = checkbox.checked;
    });
}

// Validar formulario de conductor
function validarFormularioConductor() {
    const campos = [
        { id: 'directRuta', nombre: 'Ruta' },
        { id: 'directUsuario', nombre: 'Nombre de usuario' },
        { id: 'directPassword', nombre: 'Contraseña' },
        { id: 'directConfirmPassword', nombre: 'Confirmar contraseña' }
    ];
    
    for (const campo of campos) {
        const elemento = document.getElementById(campo.id);
        if (!elemento.value.trim()) {
            mostrarNotificacion(`El campo "${campo.nombre}" es requerido`, 'error');
            elemento.focus();
            return false;
        }
    }
    
    const diasSeleccionados = document.querySelectorAll('input[name="dias"]:checked');
    if (diasSeleccionados.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un día de trabajo', 'error');
        return false;
    }
    
    const turnosSeleccionados = document.querySelectorAll('input[name="turnos"]:checked');
    if (turnosSeleccionados.length === 0) {
        mostrarNotificacion('Debe seleccionar al menos un turno', 'error');
        return false;
    }
    
    const contraseña = document.getElementById('directPassword').value;
    const confirmarContraseña = document.getElementById('directConfirmPassword').value;
    
    if (contraseña !== confirmarContraseña) {
        mostrarNotificacion('Las contraseñas no coinciden', 'error');
        document.getElementById('directConfirmPassword').focus();
        return false;
    }
    
    if (contraseña.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'error');
        document.getElementById('directPassword').focus();
        return false;
    }
    
    return true;
}

// Registrar conductor
function registrarConductorDirecto(event) {
    if (event) event.preventDefault();
    
    if (!validarFormularioConductor()) {
        return;
    }
    
    const diasSeleccionados = Array.from(document.querySelectorAll('input[name="dias"]:checked'))
        .map(checkbox => checkbox.value);
    
    const turnosSeleccionados = Array.from(document.querySelectorAll('input[name="turnos"]:checked'))
        .map(checkbox => checkbox.value);
    
    const datosConductor = {
        ...datosUsuarioEscaneado,
        ruta: document.getElementById('directRuta').value,
        rutaNombre: document.getElementById('directRuta').options[document.getElementById('directRuta').selectedIndex].text,
        diasTrabajo: diasSeleccionados,
        turnos: turnosSeleccionados,
        nombreUsuario: document.getElementById('directUsuario').value.trim(),
        contraseña: document.getElementById('directPassword').value,
        activo: true,
        detalles: `Conductor | Ruta: ${document.getElementById('directRuta').options[document.getElementById('directRuta').selectedIndex].text}`,
        horarioDetalles: `Días: ${diasSeleccionados.join(', ')} | Turnos: ${turnosSeleccionados.join(', ')}`,
        fechaRegistro: new Date().toISOString(),
        registradoPor: sesionAdmin ? sesionAdmin.username : 'admin'
    };
    
    let usuariosDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    
    const cedulaExiste = Object.values(usuariosDB).find(usuario => usuario.cedula === datosConductor.cedula);
    if (cedulaExiste) {
        mostrarNotificacion('Ya existe un conductor con esta cédula', 'error');
        return;
    }
    
    const usuarioExiste = Object.values(usuariosDB).find(usuario => usuario.nombreUsuario === datosConductor.nombreUsuario);
    if (usuarioExiste) {
        mostrarNotificacion('El nombre de usuario ya está en uso', 'error');
        return;
    }
    
    const usuarioId = 'cond_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    usuariosDB[usuarioId] = datosConductor;
    
    try {
        localStorage.setItem('unellez_users', JSON.stringify(usuariosDB));
        mostrarNotificacion('Conductor registrado exitosamente', 'success');
        
        setTimeout(() => {
            closeDirectConductorModal();
            cargarUsuarios();
        }, 1000);
        
    } catch (error) {
        console.error("Error al guardar conductor:", error);
        mostrarNotificacion('Error al guardar el conductor', 'error');
    }
}

// Inicializar modal conductor
function inicializarModalConductor() {
    const formulario = document.getElementById('directConductorForm');
    if (formulario) {
        formulario.addEventListener('submit', registrarConductorDirecto);
    }
    
    // Configurar eventos para validación de contraseñas
    const inputsContraseña = ['directPassword', 'directConfirmPassword'];
    inputsContraseña.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', verificarCoincidenciaContraseña);
        }
    });
    
    // Configurar eventos para checkboxes
    configurarEventosCheckboxes();
}

// Configurar eventos de checkboxes
function configurarEventosCheckboxes() {
    const checkboxesDias = document.querySelectorAll('input[name="dias"]');
    checkboxesDias.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const checkboxTodosDias = document.getElementById('todosDias');
            if (!this.checked && checkboxTodosDias.checked) {
                checkboxTodosDias.checked = false;
            }
        });
    });
    
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
function generarCredencialesPorDefecto() {
    if (!datosUsuarioEscaneado) return;
    
    const { nombre, apellido, cedula } = datosUsuarioEscaneado;
    
    const username = `${nombre.charAt(0).toLowerCase()}${apellido.toLowerCase().replace(/\s+/g, '')}${cedula.slice(-3)}`;
    document.getElementById('directUsuario').value = username;
    
    const contraseñaTemporal = generarContraseñaTemporal();
    document.getElementById('directPassword').value = contraseñaTemporal;
    document.getElementById('directConfirmPassword').value = contraseñaTemporal;
    
    verificarCoincidenciaContraseña();
}

// Generar contraseña temporal
function generarContraseñaTemporal() {
    const longitud = 8;
    const caracteres = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let contraseña = "";
    
    for (let i = 0; i < longitud; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
        contraseña += caracteres[indiceAleatorio];
    }
    
    return contraseña;
}

// Verificar coincidencia de contraseñas
function verificarCoincidenciaContraseña() {
    const contraseña = document.getElementById('directPassword').value;
    const confirmarContraseña = document.getElementById('directConfirmPassword').value;
    const elementoMensaje = document.getElementById('passwordMatchMessage') || crearElementoMensajeContraseña();
    
    if (contraseña && confirmarContraseña) {
        if (contraseña === confirmarContraseña) {
            elementoMensaje.className = 'password-match';
            elementoMensaje.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
        } else {
            elementoMensaje.className = 'password-mismatch';
            elementoMensaje.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
        }
    }
}

// Crear elemento para mensaje de contraseña
function crearElementoMensajeContraseña() {
    const elementoMensaje = document.createElement('div');
    elementoMensaje.id = 'passwordMatchMessage';
    document.getElementById('directConfirmPassword').parentNode.appendChild(elementoMensaje);
    return elementoMensaje;
}


// Exportar variables globales para usar en otros archivos
window.sesionAdmin = sesionAdmin;
window.rutas = rutas;
window.filtrosRutas = filtrosRutas;
window.mostrarNotificacion = mostrarNotificacion;