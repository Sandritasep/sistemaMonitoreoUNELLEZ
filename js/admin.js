// Variables globales para administración
let sesionAdmin = JSON.parse(localStorage.getItem('admin_session')) || null;

// Variables para las tablas
let todosUsuarios = [];
let estudiantes = [];
let trabajadores = [];
let conductores = [];
let filtroActual = 'todos';
let filtrosEstudiantes = ['', '', '', '', '', ''];
let filtrosTrabajadores = ['', '', '', '', '', '', ''];
let filtrosConductores = ['', '', '', '', '', '', ''];
let filtrosTodos = ['', '', '', '', ''];

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, verificando sesión...');
    
    if (sesionAdmin && sesionAdmin.loggedIn) {
        mostrarContenidoAdmin();
        inicializarPanelAdmin();
    } else {
        mostrarModalLogin();
    }
});

// Mostrar modal de login
function mostrarModalLogin() {
    console.log('Mostrando modal de login...');
    document.getElementById('loginModal').classList.add('active');
    document.body.classList.remove('admin-logged-in');
    document.getElementById('loginForm').reset();
    
    setTimeout(() => {
        document.getElementById('adminUsername').focus();
    }, 300);
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

// Alternar visibilidad de contraseña
function togglePasswordVisibility(buttonElement) {
    console.log('togglePasswordVisibility llamado:', buttonElement);
    
    let passwordInput, toggleButton;
    
    if (buttonElement && buttonElement.classList.contains('toggle-password')) {
        // Llamado desde formulario de conductor (se pasó 'this')
        toggleButton = buttonElement;
        passwordInput = toggleButton.previousElementSibling; // El input está antes del botón
    } else {
        // Llamado desde login admin (sin parámetros)
        passwordInput = document.getElementById('adminPassword');
        const toggleButtonContainer = document.querySelector('.toggle-password');
        toggleButton = toggleButtonContainer ? toggleButtonContainer.querySelector('i') : null;
    }
    
    if (!passwordInput) {
        console.error('No se pudo encontrar el input de contraseña');
        return;
    }
    
    let icon = toggleButton;
    if (toggleButton && toggleButton.tagName === 'BUTTON') {
        icon = toggleButton.querySelector('i');
    }
    
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

// Inicializar panel admin
function inicializarPanelAdmin() {
    console.log('Inicializando panel admin...');
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            adminLogin();
        });
    }
    
    inicializarModalConductor();
    
    setTimeout(() => {
        cargarUsuarios();
        cargarRutas();
        actualizarEstadisticas();
    }, 300);
    
    setTimeout(() => {
        const adminUsername = document.getElementById('adminUsername');
        if (adminUsername && !sesionAdmin) {
            adminUsername.focus();
        }
    }, 100);
}

// Mostrar sección
function mostrarSeccion(seccion) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const seccionObjetivo = document.getElementById(seccion + 'Section');
    if (seccionObjetivo) {
        seccionObjetivo.classList.add('active');
    }
}

// Ocultar todas las tablas
function ocultarTodasLasTablas() {
    document.getElementById('tablaEstudiantes').style.display = 'none';
    document.getElementById('tablaTrabajadores').style.display = 'none';
    document.getElementById('tablaConductores').style.display = 'none';
    document.getElementById('tablaTodosUsuarios').style.display = 'none';
}

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
                <td colspan="9" class="no-users"> <!-- Cambiado de 10 a 9 columnas -->
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
                <button class="btn-edit" onclick="editarConductor('${conductor.cedula}')">
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
                <button class="btn-edit" onclick="editarConductor('${usuario.cedula}')">
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
                case 6: // Estado (antes era 7, ahora es 6)
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

// Filtrar por columna en tabla de estudiantes
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

// Editar usuario (placeholder)
function editarUsuario(cedula) {
    mostrarNotificacion(`Editar usuario ${cedula} - Funcionalidad en desarrollo`, 'info');
}

// Editar conductor (placeholder)
function editarConductor(cedula) {
    mostrarNotificacion(`Editar conductor ${cedula} - Funcionalidad en desarrollo`, 'info');
}

// Cargar rutas
function cargarRutas() {
    console.log('Cargando rutas...');
    
    let rutasDB;
    try {
        rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
    } catch (error) {
        console.error('Error al cargar rutas:', error);
        rutasDB = {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
    }
    
    try {
        localStorage.setItem('unellez_routes', JSON.stringify(rutasDB));
    } catch (error) {
        console.error('Error al guardar rutas:', error);
    }
    
    const listaRutas = document.getElementById('listaRutas');
    if (!listaRutas) return;
    
    listaRutas.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando rutas...</div>';
    
    setTimeout(() => {
        listaRutas.innerHTML = '';
        
        let capacidadTotal = 0;
        let rutasActivas = 0;
        
        Object.keys(rutasDB).forEach(claveRuta => {
            const ruta = rutasDB[claveRuta];
            capacidadTotal += ruta.capacidad || 0;
            if (ruta.activa) rutasActivas++;
            
            const elementoRuta = document.createElement('div');
            elementoRuta.className = 'route-item';
            
            elementoRuta.innerHTML = `
                <div class="route-info">
                    <h4 style="color: #1a2a6c;"><i class="fas fa-route" style="color: #1a2a6c;"></i> ${claveRuta.toUpperCase()} - ${ruta.nombre}</h4>
                    <p style="color:#666;"><strong>unidad:</strong> ${ruta.capacidad} pasajeros</p>
                    <p style="color:#666;"><strong>Estado:</strong> ${ruta.activa ? 'Activa' : 'Inactiva'}</p>
                </div>
                <div class="route-actions">
                    <button class="btn btn-small" onclick="editarRuta('${claveRuta}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            `;
            
            listaRutas.appendChild(elementoRuta);
        });
        
        // Actualizar estadísticas de rutas
        document.getElementById('totalRutas').textContent = rutasActivas;
        document.getElementById('totalCapacidad').textContent = capacidadTotal;
        
        // Cargar rutas en los selects de las tablas
        cargarRutasEnSelects(rutasDB);
    }, 500);
}

// Cargar rutas en los selects de filtro
function cargarRutasEnSelects(rutasDB) {
    const selectsRutas = document.querySelectorAll('select.filtro-columna[data-columna="4"], select.filtro-columna[data-columna="5"], select.filtro-columna-conductor[data-columna="3"], select.filtro-columna-todos[data-columna="3"]');
    
    selectsRutas.forEach(select => {
        // Limpiar opciones existentes (excepto la primera)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Agregar opciones de rutas
        Object.keys(rutasDB).forEach(claveRuta => {
            const ruta = rutasDB[claveRuta];
            if (ruta.activa) {
                const opcion = document.createElement('option');
                opcion.value = ruta.nombre;
                opcion.textContent = ruta.nombre;
                select.appendChild(opcion);
            }
        });
    });
}

// Abrir formulario de ruta (placeholder)
function abrirFormularioRuta() {
    mostrarNotificacion('Funcionalidad de edición de rutas - En desarrollo', 'info');
}

// Cerrar sesión admin
function cerrarSesionAdmin() {
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
        background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#1a2a6c'};
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
function editarRuta(claveRuta) {
    mostrarNotificacion(`Editar ruta ${claveRuta} - Funcionalidad en desarrollo`, 'info');
}

// ========================================
// FUNCIONES DEL MODAL DE CONDUCTOR (sin cambios importantes)
// ========================================

let escanerQR = null;
let escanerQRActivo = false;
let datosUsuarioEscaneado = null;
let scanner = null;

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
    
    escanerQRActivo = false;
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

// Detener escáner QR
function stopQRScanner() {
    console.log("🛑 Intentando detener scanner...");
    
    if (scanner) {
        console.log("🔍 Scanner encontrado, limpiando...");
        scanner.clear().then(() => {
            escanerQRActivo = false;
            scanner = null;
            console.log("✅ Scanner detenido correctamente");
        }).catch(err => {
            console.warn("⚠️ Advertencia al limpiar scanner:", err);
            escanerQRActivo = false;
            scanner = null;
        });
    } else {
        console.log("ℹ️ No hay scanner activo para detener");
        escanerQRActivo = false;
    }
    
    if (escanerQR) {
        escanerQR.stop().then(() => {
            escanerQR.clear();
            escanerQR = null;
        }).catch(err => {
            console.warn("Error al detener html5QrCode:", err);
        });
    }
}

// Volver al escaneo
function goBackToScan() {
    mostrarPaso('stepScanQR');
    iniciarEscaneoQR();
}

// Procesar datos del QR
async function procesarDatosQR(datosQR) {
    try {
        validarQRConBackend(datosQR).then(datosBackend => {
            datosUsuarioEscaneado = datosBackend;
            mostrarResumenDatos(datosBackend);
            cargarOpcionesRutas();
            generarCredencialesPorDefecto();
            mostrarPaso('stepForm');
        }).catch(error => {
            console.error("Error del backend:", error);
            mostrarNotificacion('Error al validar datos con el sistema', 'error');
        });
        
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
    
    selectRuta.innerHTML = '<option value="">Seleccione una ruta</option>';
    
    try {
        const rutasDB = JSON.parse(localStorage.getItem('unellez_routes')) || {
            ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
            ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
            ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
            ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
        };
        
        Object.keys(rutasDB).forEach(clave => {
            if (rutasDB[clave].activa) {
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

function actualizarEstadoUnidad(idUnidad, nuevoEstado) {
    try {
        console.log(`Actualizando unidad ${idUnidad} a estado: ${nuevoEstado}`);
    } catch (error) {
        console.error("Error actualizando estado de unidad:", error);
    }
}

function inicializarModalConductor() {
    const formulario = document.getElementById('directConductorForm');
    if (formulario) {
        formulario.addEventListener('submit', registrarConductorDirecto);
    }
    
    const inputsContraseña = ['directPassword', 'directConfirmPassword'];
    inputsContraseña.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', verificarCoincidenciaContraseña);
        }
    });
    
    configurarEventosCheckboxes();
}

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

function crearElementoMensajeContraseña() {
    const elementoMensaje = document.createElement('div');
    elementoMensaje.id = 'passwordMatchMessage';
    document.getElementById('directConfirmPassword').parentNode.appendChild(elementoMensaje);
    return elementoMensaje;
}