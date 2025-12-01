// Variables globales para admin
let temporalLinks = JSON.parse(localStorage.getItem('unellez_temporal_links')) || {};
let adminSession = JSON.parse(localStorage.getItem('admin_session')) || null;

// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Si hay sesión activa, mostrar contenido admin
    if (adminSession && adminSession.loggedIn) {
        showAdminContent();
        initializeAdminPanel();
    } else {
        // Mostrar login modal
        showLoginModal();
    }
});

// Mostrar modal de login
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// Mostrar contenido admin
// Mostrar contenido admin
function showAdminContent() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('adminContent').style.display = 'block';
    
    // Mostrar nombre del admin
    if (adminSession && adminSession.username) {
        document.getElementById('adminName').textContent = adminSession.username;
    }
    
    // Cargar datos iniciales
    loadUsers();
    loadRoutes();
    updateStats();
}

// Función de login
function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    // Credenciales hardcodeadas para demo
    const adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Crear sesión
        adminSession = {
            loggedIn: true,
            username: username,
            loginTime: Date.now()
        };
        
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        
        // Mostrar notificación de éxito
        showNotification('¡Inicio de sesión exitoso!', 'success');
        
        // Esperar un momento antes de mostrar el contenido
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
    
    // Verificar y limpiar enlaces expirados cada minuto
    setInterval(cleanExpiredLinks, 60000);
    
    // Configurar autofocus en login
    setTimeout(() => {
        const adminUsername = document.getElementById('adminUsername');
        if (adminUsername) adminUsername.focus();
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
    const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    const usersList = document.getElementById('usersList');
    
    usersList.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</div>';
    
    setTimeout(() => {
        if (Object.keys(usersDB).length === 0) {
            usersList.innerHTML = '<div class="user-item"><p>No hay usuarios registrados</p></div>';
            updateStats();
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
                        <p><strong>Detalles:</strong> ${user.detalles}</p>
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
        
        updateStats();
    }, 500);
}

// Actualizar estadísticas
function updateStats() {
    const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    const users = Object.values(usersDB);
    
    // Contar por tipo
    const estudiantes = users.filter(u => u.tipo === 'estudiante').length;
    const conductores = users.filter(u => u.tipo === 'conductor').length;
    const obreros = users.filter(u => u.tipo === 'obrero').length;
    
    // Actualizar contadores
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('estudiantesCount').textContent = estudiantes;
    document.getElementById('conductoresCount').textContent = conductores;
    document.getElementById('obrerosCount').textContent = obreros;
}

// Cargar rutas
function loadRoutes() {
    const routesDB = JSON.parse(localStorage.getItem('unellez_routes')) || {
        ruta1: { nombre: "Ciudad Varyna", activa: true, capacidad: 40 },
        ruta2: { nombre: "Redoma Industrial", activa: true, capacidad: 35 },
        ruta3: { nombre: "Raúl Leoni", activa: true, capacidad: 45 },
        ruta4: { nombre: "Juan Pablo", activa: true, capacidad: 30 }
    };
    
    // Guardar rutas si no existen
    localStorage.setItem('unellez_routes', JSON.stringify(routesDB));
    
    const routesList = document.getElementById('routesList');
    routesList.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando rutas...</div>';
    
    setTimeout(() => {
        routesList.innerHTML = '';
        
        // Calcular capacidad total
        let totalCapacity = 0;
        
        Object.keys(routesDB).forEach(routeKey => {
            const route = routesDB[routeKey];
            totalCapacity += route.capacidad || 0;
            
            const routeItem = document.createElement('div');
            routeItem.className = 'route-item';
            
            routeItem.innerHTML = `
                <div class="route-info">
                    <h4><i class="fas fa-route"></i> ${routeKey.toUpperCase()} - ${route.nombre}</h4>
                    <p><strong>Capacidad:</strong> ${route.capacidad} pasajeros</p>
                    <p><strong>Estado:</strong> ${route.activa ? 'Activa' : 'Inactiva'}</p>
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
        document.getElementById('totalRoutes').textContent = Object.keys(routesDB).length;
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
    const routesDB = JSON.parse(localStorage.getItem('unellez_routes')) || {};
    const routeSelect = document.getElementById('userRuta');
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
        password: null, // Se establecerá en el registro
        username: null  // Se establecerá en el registro
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
    const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
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
    localStorage.setItem('unellez_temporal_links', JSON.stringify(temporalLinks));
    
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
    linkInput.setSelectionRange(0, 99999); // Para dispositivos móviles
    
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
        localStorage.setItem('unellez_temporal_links', JSON.stringify(temporalLinks));
    }
}

// Cerrar sesión admin
function logoutAdmin() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
        localStorage.removeItem('admin_session');
        showNotification('Sesión cerrada exitosamente', 'success');
        
        setTimeout(() => {
            showLoginModal();
        }, 1000);
    }
}

// Mostrar notificación
function showNotification(message, type) {
    // Crear notificación visual
    const notification = document.createElement('div');
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

// Añadir estilos CSS para animaciones
const style = document.createElement('style');
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