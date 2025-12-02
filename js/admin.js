// Variables globales para admin
let temporalLinks = JSON.parse(localStorage.getItem('unellez_temporal_links')) || {};
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
    
    // Configurar formulario de usuario
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            generateRegistrationLink();
        });
    }
    
    // Configurar formulario de login (si existe en la página)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            adminLogin();
        });
    }
    
    // Cargar datos
    loadUsers();
    loadRoutes();
    updateStats();
    
    // Verificar y limpiar enlaces expirados cada minuto
    setInterval(cleanExpiredLinks, 60000);
    
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
// Variables para la tabla
let allUsers = [];
let currentFilter = 'all';
let columnFilters = ['', '', '', ''];

// Modificar la función loadUsers para usar la tabla
function loadUsers() {
    console.log('Cargando usuarios para tabla...');
    
    try {
        const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        allUsers = Object.values(usersDB).map(user => ({
            ...user,
            id: user.cedula // Usar cédula como ID único
        }));
        
        console.log(`Se cargaron ${allUsers.length} usuarios`);
        
        // Actualizar estadísticas
        updateStats();
        
        // Renderizar tabla
        renderUsersTable(allUsers);
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        allUsers = [];
        renderUsersTable([]);
    }
}

// Función para renderizar la tabla
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="no-users">
                    <i class="fas fa-user-slash"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>Crea un nuevo usuario usando el botón "Crear Nuevo Usuario"</p>
                </td>
            </tr>
        `;
        resultsCount.innerHTML = `Mostrando <strong>0</strong> de <strong>0</strong> usuarios`;
        return;
    }
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Icono según tipo
        let tipoIcon = 'fas fa-user';
        if (user.tipo === 'estudiante') tipoIcon = 'fas fa-user-graduate';
        if (user.tipo === 'conductor') tipoIcon = 'fas fa-user-tie';
        if (user.tipo === 'obrero') tipoIcon = 'fas fa-hard-hat';
        
        // Clase para el tipo
        const tipoClass = `type-${user.tipo}`;
        
        // Estado
        const estado = user.activo ? 'Activo' : 'Inactivo';
        const estadoClass = user.activo ? 'status-active' : 'status-inactive';
        
        row.innerHTML = `
            <td>
                <span class="user-type ${tipoClass}">
                    <i class="${tipoIcon}"></i>
                    ${user.tipo}
                </span>
            </td>
            <td>${user.cedula}</td>
            <td>
                <strong>${user.nombre} ${user.apellido}</strong>
                ${user.detalles ? `<br><small style="color: #666; font-size: 12px;">${user.detalles}</small>` : ''}
            </td>
            <td>
                <span class="user-status ${estadoClass}">${estado}</span>
            </td>
            <td>
                <button class="btn-delete" onclick="deleteUser('${user.cedula}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    resultsCount.innerHTML = `Mostrando <strong>${users.length}</strong> de <strong>${allUsers.length}</strong> usuarios`;
}

// Filtrar usuarios por tipo (al hacer clic en los stats)
function filterUsersByType(tipo) {
    currentFilter = tipo;
    
    // Resaltar el stat seleccionado
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    });
    
    if (tipo !== 'all') {
        const selectedCard = document.querySelector(`.stat-card[onclick*="${tipo}"]`);
        if (selectedCard) {
            selectedCard.style.boxShadow = '0 0 0 3px rgba(26, 42, 108, 0.2)';
        }
    } else {
        const totalCard = document.getElementById('total-users');
        if (totalCard) {
            totalCard.style.boxShadow = '0 0 0 3px rgba(26, 42, 108, 0.2)';
        }
    }
    
    let filteredUsers = allUsers;
    
    if (tipo !== 'all') {
        filteredUsers = allUsers.filter(user => user.tipo === tipo);
    }
    
    // Aplicar filtros de columna si existen
    filteredUsers = applyColumnFilters(filteredUsers);
    
    renderUsersTable(filteredUsers);
}

// Filtrar por columna
function filterColumn(input) {
    const columnIndex = parseInt(input.dataset.column);
    const value = input.value.toLowerCase();
    
    columnFilters[columnIndex] = value;
    
    // Aplicar todos los filtros
    applyAllFilters();
}

// Aplicar filtros de columna
function applyColumnFilters(users) {
    let filtered = [...users];
    
    columnFilters.forEach((filter, index) => {
        if (filter.trim() === '') return;
        
        filtered = filtered.filter(user => {
            switch(index) {
                case 0: // Tipo
                    return user.tipo.toLowerCase().includes(filter);
                case 1: // Cédula
                    return user.cedula.toLowerCase().includes(filter);
                case 2: // Nombre
                    const fullName = `${user.nombre} ${user.apellido}`.toLowerCase();
                    return fullName.includes(filter) || 
                           user.nombre.toLowerCase().includes(filter) || 
                           user.apellido.toLowerCase().includes(filter);
                case 3: // Estado
                    const estado = user.activo ? 'activo' : 'inactivo';
                    return estado.includes(filter);
                default:
                    return true;
            }
        });
    });
    
    return filtered;
}

// Aplicar todos los filtros (tipo + columnas)
function applyAllFilters() {
    let filteredUsers = allUsers;
    
    // Filtro por tipo
    if (currentFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.tipo === currentFilter);
    }
    
    // Filtros por columna
    filteredUsers = applyColumnFilters(filteredUsers);
    
    renderUsersTable(filteredUsers);
}

// Busqueda global
function filterTable() {
    const searchTerm = document.getElementById('globalSearch').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        applyAllFilters();
        return;
    }
    
    let filteredUsers = allUsers.filter(user => {
        return (
            user.tipo.toLowerCase().includes(searchTerm) ||
            user.cedula.toLowerCase().includes(searchTerm) ||
            user.nombre.toLowerCase().includes(searchTerm) ||
            user.apellido.toLowerCase().includes(searchTerm) ||
            `${user.nombre} ${user.apellido}`.toLowerCase().includes(searchTerm) ||
            (user.detalles && user.detalles.toLowerCase().includes(searchTerm)) ||
            (user.activo ? 'activo' : 'inactivo').includes(searchTerm)
        );
    });
    
    renderUsersTable(filteredUsers);
}

// Limpiar todos los filtros
function clearFilters() {
    currentFilter = 'all';
    columnFilters = ['', '', '', ''];
    
    // Limpiar inputs
    document.querySelectorAll('.column-filter').forEach(input => {
        if (input.tagName === 'INPUT') {
            input.value = '';
        } else if (input.tagName === 'SELECT') {
            input.value = '';
        }
    });
    
    document.getElementById('globalSearch').value = '';
    
    // Quitar resaltado de stats
    document.querySelectorAll('.stat-card').forEach(card => {
        card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    });
    
    renderUsersTable(allUsers);
}

// Actualizar estadísticas (modificada)
function updateStats() {
    if (allUsers.length === 0) {
        try {
            const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
            allUsers = Object.values(usersDB);
        } catch (error) {
            allUsers = [];
        }
    }
    
    const estudiantes = allUsers.filter(u => u.tipo === 'estudiante').length;
    const conductores = allUsers.filter(u => u.tipo === 'conductor').length;
    const obreros = allUsers.filter(u => u.tipo === 'obrero').length;
    const total = allUsers.length;
    
    document.getElementById('estudiantesCount').textContent = estudiantes;
    document.getElementById('conductoresCount').textContent = conductores;
    document.getElementById('obrerosCount').textContent = obreros; // Necesitas agregar este elemento en el HTML
    document.getElementById('totalUsers').textContent = total;
}

// Función para eliminar usuario
function deleteUser(cedula) {
    if (!confirm(`¿Está seguro de eliminar al usuario con cédula ${cedula}?`)) {
        return;
    }
    
    try {
        const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        let deleted = false;
        
        // Buscar y eliminar usuario por cédula
        Object.keys(usersDB).forEach(key => {
            if (usersDB[key].cedula === cedula) {
                delete usersDB[key];
                deleted = true;
            }
        });
        
        if (deleted) {
            localStorage.setItem('unellez_users', JSON.stringify(usersDB));
            showNotification('Usuario eliminado correctamente', 'success');
            
            // Recargar la tabla
            setTimeout(() => {
                loadUsers();
            }, 500);
        } else {
            showNotification('No se encontró el usuario', 'error');
        }
        
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        showNotification('Error al eliminar el usuario', 'error');
    }
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

// Abrir formulario de usuario
function openUserForm() {
    document.getElementById('modalUserForm').classList.add('active');
    document.getElementById('userForm').reset();
    toggleUserFields();
}

// Cerrar formulario de usuario
function closeUserForm() {
    document.getElementById('modalUserForm').classList.remove('active');
}

// Alternar campos según tipo de usuario
function toggleUserFields() {
    const tipo = document.getElementById('userTipo').value;
    
    // Ocultar todos los campos específicos
    document.querySelectorAll('.user-fields').forEach(field => {
        field.style.display = 'none';
    });
    
    // Mostrar campos según tipo
    if (tipo) {
        const fieldElement = document.getElementById(tipo + 'Fields');
        if (fieldElement) {
            fieldElement.style.display = 'block';
        }
        
        // Si es conductor, cargar rutas disponibles
        if (tipo === 'conductor') {
            loadRouteOptions();
        }
    }
}

// Cargar opciones de ruta para conductores
function loadRouteOptions() {
    let routesDB;
    try {
        routesDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
    } catch (error) {
        routesDB = {};
    }
    
    const routeSelect = document.getElementById('userRuta');
    if (!routeSelect) return;
    
    routeSelect.innerHTML = '<option value="">Seleccione ruta</option>';
    
    Object.keys(routesDB).forEach(routeKey => {
        if (routesDB[routeKey].activa) {
            const option = document.createElement('option');
            option.value = routeKey;
            option.textContent = `${routeKey.toUpperCase()} - ${routesDB[routeKey].nombre}`;
            routeSelect.appendChild(option);
        }
    });
}

// Calcular edad
function calcularEdad() {
    const fechaNac = new Date(document.getElementById('userFechaNac').value);
    if (isNaN(fechaNac.getTime())) return;
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    
    document.getElementById('userEdad').value = edad + ' años';
}

// Generar enlace de registro
function generateRegistrationLink() {
    const formData = new FormData(document.getElementById('userForm'));
    const userData = {
        tipo: formData.get('userTipo'),
        nombre: formData.get('userNombre'),
        apellido: formData.get('userApellido'),
        cedula: formData.get('userCedula'),
        fechaNac: formData.get('userFechaNac'),
        edad: document.getElementById('userEdad').value,
        activo: true,
        password: null,
        username: null
    };
    
    // Validaciones básicas
    if (!userData.nombre || !userData.apellido || !userData.cedula) {
        showNotification('Por favor complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Agregar campos específicos según tipo
    if (userData.tipo === 'estudiante') {
        userData.carrera = formData.get('userCarrera');
        userData.estudianteActivo = formData.get('userActivo') === 'on';
        userData.detalles = `Carrera: ${userData.carrera} | Estudiante ${userData.estudianteActivo ? 'Activo' : 'Inactivo'}`;
        
        if (!userData.carrera) {
            showNotification('Por favor seleccione una carrera para el estudiante', 'error');
            return;
        }
    } else if (userData.tipo === 'conductor') {
        userData.ruta = formData.get('userRuta');
        userData.detalles = `Conductor | Ruta: ${userData.ruta}`;
        
        if (!userData.ruta) {
            showNotification('Por favor seleccione una ruta para el conductor', 'error');
            return;
        }
    } else if (userData.tipo === 'obrero') {
        userData.detalles = 'Obrero UNELLEZ';
    }
    
    // Verificar si la cédula ya existe
    let usersDB;
    try {
        usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    } catch (error) {
        usersDB = {};
    }
    
    const existingUser = Object.values(usersDB).find(user => user.cedula === userData.cedula);
    
    if (existingUser) {
        showNotification('Ya existe un usuario con esta cédula', 'error');
        return;
    }
    
    // Generar ID único y enlace temporal
    const linkId = 'link_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const expirationTime = Date.now() + (60 * 60 * 1000); // 1 hora
    
    temporalLinks[linkId] = {
        userData: userData,
        expiration: expirationTime,
        used: false
    };
    
    // Guardar en localStorage
    try {
        localStorage.setItem('unellez_temporal_links', JSON.stringify(temporalLinks));
    } catch (error) {
        showNotification('Error al guardar el enlace temporal', 'error');
        return;
    }
    
    // Generar URL de registro
    const registrationUrl = `${window.location.origin}${window.location.pathname.replace('admin.html', 'register.html')}?token=${linkId}`;
    
    // Mostrar enlace generado
    document.getElementById('generatedLink').value = registrationUrl;
    document.getElementById('modalLinkGenerated').classList.add('active');
    closeUserForm();
}

// Copiar enlace al portapapeles
function copyLink() {
    const linkInput = document.getElementById('generatedLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Enlace copiado al portapapeles', 'success');
    } catch (err) {
        console.error('Error al copiar:', err);
        showNotification('Error al copiar el enlace', 'error');
    }
}

// Cerrar modal de enlace
function closeLinkModal() {
    document.getElementById('modalLinkGenerated').classList.remove('active');
    loadUsers(); // Recargar lista de usuarios
}

// Limpiar enlaces expirados
function cleanExpiredLinks() {
    const now = Date.now();
    let updated = false;
    
    Object.keys(temporalLinks).forEach(linkId => {
        if (temporalLinks[linkId].expiration < now) {
            delete temporalLinks[linkId];
            updated = true;
        }
    });
    
    if (updated) {
        try {
            localStorage.setItem('unellez_temporal_links', JSON.stringify(temporalLinks));
        } catch (error) {
            console.error('Error al limpiar enlaces expirados:', error);
        }
    }
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