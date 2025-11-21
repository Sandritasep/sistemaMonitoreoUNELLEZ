// Variables globales para admin
let temporalLinks = JSON.parse(localStorage.getItem('unellez_temporal_links')) || {};
let adminSession = JSON.parse(localStorage.getItem('admin_session')) || null;

// Inicialización del panel admin
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el admin está logueado
    if (!adminSession || !adminSession.loggedIn) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    loadUsers();
    loadRoutes();
    
    // Configurar formulario de usuario
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
        generateRegistrationLink();
    });
    
    // Verificar y limpiar enlaces expirados cada minuto
    setInterval(cleanExpiredLinks, 60000);
});

// Función de login para admin (debe estar en admin-login.html)
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // Credenciales hardcodeadas para demo (en producción usar base de datos segura)
    const adminCredentials = {
        username: 'admin',
        password: 'admin123'
    };
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
        adminSession = {
            loggedIn: true,
            username: username,
            loginTime: Date.now()
        };
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        window.location.href = 'admin.html';
    } else {
        alert('Credenciales incorrectas');
    }
}

// Mostrar sección
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(section + 'Section').classList.add('active');
}

// Cargar usuarios
function loadUsers() {
    const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    const usersList = document.getElementById('usersList');
    
    usersList.innerHTML = '';
    
    if (Object.keys(usersDB).length === 0) {
        usersList.innerHTML = '<div class="user-item"><p>No hay usuarios registrados</p></div>';
        return;
    }
    
    Object.keys(usersDB).forEach(userKey => {
        const user = usersDB[userKey];
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        userItem.innerHTML = `
            <div class="user-info">
                <h4>${user.nombre} ${user.apellido}</h4>
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
    routesList.innerHTML = '';
    
    Object.keys(routesDB).forEach(routeKey => {
        const route = routesDB[routeKey];
        const routeItem = document.createElement('div');
        routeItem.className = 'route-item';
        
        routeItem.innerHTML = `
            <div class="route-info">
                <h4>${routeKey.toUpperCase()} - ${route.nombre}</h4>
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
}

// Abrir formulario de ruta
function openRouteForm() {
    alert('Funcionalidad de edición de rutas - En desarrollo');
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
        document.getElementById(tipo + 'Fields').style.display = 'block';
        
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
        alert('Por favor complete todos los campos obligatorios');
        return;
    }
    
    // Agregar campos específicos según tipo
    if (userData.tipo === 'estudiante') {
        userData.carrera = formData.get('userCarrera');
        userData.estudianteActivo = formData.get('userActivo') === 'on';
        userData.detalles = `Carrera: ${userData.carrera} | Estudiante ${userData.estudianteActivo ? 'Activo' : 'Inactivo'}`;
        
        if (!userData.carrera) {
            alert('Por favor seleccione una carrera para el estudiante');
            return;
        }
    } else if (userData.tipo === 'conductor') {
        userData.ruta = formData.get('userRuta');
        userData.detalles = `Conductor | Ruta: ${userData.ruta}`;
        
        if (!userData.ruta) {
            alert('Por favor seleccione una ruta para el conductor');
            return;
        }
    } else if (userData.tipo === 'obrero') {
        userData.detalles = 'Obrero UNELLEZ';
    }
    
    // Verificar si la cédula ya existe
    const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    const existingUser = Object.values(usersDB).find(user => user.cedula === userData.cedula);
    
    if (existingUser) {
        alert('Ya existe un usuario con esta cédula');
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
    document.execCommand('copy');
    showNotification('Enlace copiado al portapapeles', 'success');
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
    localStorage.removeItem('admin_session');
    window.location.href = 'admin-login.html';
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
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

 // Verificar si el admin está logueado
    document.addEventListener('DOMContentLoaded', function() {
        const adminSession = JSON.parse(localStorage.getItem('admin_session'));
        if (!adminSession || !adminSession.loggedIn) {
            window.location.href = 'admin-login.html';
        }
    });