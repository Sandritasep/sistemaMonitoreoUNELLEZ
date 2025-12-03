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
    initializeConductorModal();
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

// Limpiar todos los filtros
function clearFilters() {
    currentFilter = 'all';
    columnFilters = ['', '', '', ''];
    
    // Limpiar inputs de filtros de columna
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
    stopQRScanner();
    document.getElementById('modalDirectConductor').classList.remove('active');
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
    // Limpiar contenedor
    const qrReaderDiv = document.getElementById('qr-reader');
    qrReaderDiv.innerHTML = '';
    
    // Configuración del escáner - CON LA CÁMARA ACTIVADA
    const config = {
        qrbox: { 
            width: 250, 
            height: 250 
        },
        fps: 10,
        rememberLastUsedCamera: true, // Recordar la última cámara usada
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        // ESTO ES CLAVE: Incluir ambos tipos de escaneo
        supportedScanTypes: [
            Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE
        ],
        // Configuración para que inicie automáticamente
        showPermissionButtonIfSupported: false, // Ocultar botón de permiso
        // Opciones de video (para mejor control de la cámara)
        videoConstraints: {
            facingMode: "environment", // Cámara trasera por defecto
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
        }
    };
    
    // Crear instancia del escáner
    scanner = new Html5QrcodeScanner('qr-reader', config);
    
    // Función cuando se detecta un QR
    const onScanSuccess = (decodedText, decodedResult) => {
        console.log("QR escaneado:", decodedText);
        
        // Detener el escáner inmediatamente
        if (scanner) {
            scanner.clear();
            qrScannerActive = false;
        }
        
        // Procesar los datos
        processQRData(decodedText);
    };
    
    // Función de error
    const onScanError = (error) => {
        // Ignorar errores comunes
        if (error && !error.toString().includes("NotFoundException")) {
            console.warn("Error en escáner QR:", error);
            
            // Si hay error de cámara, sugerir usar el botón de archivo
            if (error.toString().includes("NotAllowedError") || 
                error.toString().includes("Permission")) {
                console.log("Permiso de cámara denegado. Use 'Scan an Image File'.");
            }
        }
    };
    
    // Renderizar el escáner
    try {
        scanner.render(onScanSuccess, onScanError);
        qrScannerActive = true;
        console.log("Escáner iniciado con cámara activa y botón de archivo");
        
        // Verificar que todo esté funcionando
        setTimeout(() => {
            // Verificar que el botón de archivo esté presente
            const fileButtons = document.querySelectorAll('button, input[type="file"]');
            let hasFileButton = false;
            
            fileButtons.forEach(btn => {
                if (btn.textContent.includes('Image') || 
                    btn.textContent.includes('File') ||
                    btn.type === 'file') {
                    hasFileButton = true;
                    console.log("✅ Botón de archivo detectado");
                }
            });
            
            if (!hasFileButton) {
                console.warn("⚠️ Botón de archivo no encontrado");
                // Puedes agregar manualmente si es necesario
                addManualFileButton();
            }
        }, 500);
        
    } catch (err) {
        console.error("Error al iniciar escáner:", err);
        
        // Si falla la cámara, ofrecer usar archivo directamente
        if (err.toString().includes("camera") || 
            err.toString().includes("NotAllowed")) {
            showNotification('Cámara no disponible. Use "Scan an Image File"', 'warning');
            // Aún así renderizar el escáner (el botón de archivo debería funcionar)
            scanner = new Html5QrcodeScanner('qr-reader', {
                qrbox: { width: 250, height: 250 },
                fps: 10,
                supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_FILE] // Solo archivo
            });
            scanner.render(onScanSuccess, onScanError);
        }
    }
}

// Detener escáner QR
function stopQRScanner() {
    if (scanner) {
        scanner.clear().then(() => {
            qrScannerActive = false;
            console.log("Escáner detenido y limpiado");
        }).catch(err => {
            console.error("Error al detener escáner:", err);
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

// Mostrar resumen de datos
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
