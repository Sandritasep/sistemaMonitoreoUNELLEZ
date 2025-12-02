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
function loadUsers() {
    console.log('Cargando usuarios...');
    
    // Intentar obtener usuarios del localStorage
    let usersDB;
    try {
        usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        console.log('Usuarios encontrados:', Object.keys(usersDB).length);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        usersDB = {};
    }
    
    const usersList = document.getElementById('usersList');
    
    // Mostrar loading
    usersList.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</div>';
    
    // Usar timeout para simular carga y evitar bloqueo
    setTimeout(() => {
        if (!usersDB || Object.keys(usersDB).length === 0) {
            usersList.innerHTML = `
                <div class="user-item" style="text-align: center; padding: 2rem;">
                    <p style="color: #666;">No hay usuarios registrados</p>
                    <p style="font-size: 0.9rem; color: #888; margin-top: 0.5rem;">Crea un nuevo usuario usando el botón "Crear Nuevo Usuario"</p>
                </div>
            `;
            updateStats(usersDB);
            return;
        }
        
        usersList.innerHTML = '';
        
        Object.keys(usersDB).forEach(userKey => {
            const user = usersDB[userKey];
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            // Determinar icono según tipo
            let tipoIcon = 'fas fa-user';
            if (user.tipo === 'estudiante') tipoIcon = 'fas fa-user-graduate';
            if (user.tipo === 'conductor') tipoIcon = 'fas fa-user-tie';
            if (user.tipo === 'obrero') tipoIcon = 'fas fa-hard-hat';
            
            userItem.innerHTML = `
                <div class="user-info">
                    <h4><i class="${tipoIcon}"></i> ${user.nombre} ${user.apellido}</h4>
                    <div class="user-details">
                        <p><strong>Cédula:</strong> ${user.cedula} | <strong>Tipo:</strong> ${user.tipo}</p>
                        <p><strong>Usuario:</strong> ${user.username || 'No registrado'}</p>
                    </div>
                </div>
                <div class="user-status">
                    <span class="status-badge ${user.activo ? 'status-active' : 'status-inactive'}">
                        ${user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    ${user.username ? '<span class="status-badge status-active">Registrado</span>' : '<span class="status-badge status-inactive">Pendiente</span>'}
                </div>
            `;
            
            usersList.appendChild(userItem);
        });
        
        updateStats(usersDB);
    }, 500);
}

// Actualizar estadísticas
function updateStats(usersDB) {
    console.log('Actualizando estadísticas...');
    
    // Si no se pasa usersDB, cargarlo
    if (!usersDB) {
        try {
            usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
        } catch (error) {
            console.error('Error al cargar usuarios para estadísticas:', error);
            usersDB = {};
        }
    }
    
    const users = Object.values(usersDB);
    
    // Contar por tipo
    const estudiantes = users.filter(u => u.tipo === 'estudiante').length;
    const conductores = users.filter(u => u.tipo === 'conductor').length;
    const obreros = users.filter(u => u.tipo === 'obrero').length;
    
    console.log('Estadísticas:', { total: users.length, estudiantes, conductores, obreros });
    
    // Actualizar contadores
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('estudiantesCount').textContent = estudiantes;
    document.getElementById('conductoresCount').textContent = conductores;
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