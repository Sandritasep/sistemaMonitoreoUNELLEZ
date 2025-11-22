// ===============================================
// === VARIABLES GLOBALES ===
// ===============================================
let temporalUserData = null;
let tempToken = null; 
let isFirstTime = true; 

// Referencias a los modales y elementos
const modalQR = document.getElementById('modal-qr');
const modalSuccessQR = document.getElementById('modal-success');
const modalRutas = document.getElementById('modal-rutas');
const modalRegistro = document.getElementById('modal-registro');
const modalErrorGeneral = document.getElementById('modal-error'); 
const mainFooter = document.getElementById('main-footer');

// Contenedores del modal QR para manejar el mensaje de espera
const qrContainer = modalQR.querySelector('.modal-container-qr');
const qrReaderDiv = document.getElementById('reader');
const qrTitle = modalQR.querySelector('.header-qr');

// ===============================================
// === INSTANCIA DEL ESCÁNER QR ===
// ===============================================
const scanner = new Html5QrcodeScanner('reader', {
    qrbox: { width: 250, height: 250 },
    fps: 20,
    rememberLastUsedCamera: false,
});

// ===============================================
// === MANEJO DE MODALES (UNIFICADO) ===
// ===============================================

/** Muestra un modal, ocultando todos los demás */
function showModal(modalElement) {
    document.querySelectorAll('.modal-base').forEach(m => {
        m.classList.remove('active');
    });

    if (modalElement) {
        modalElement.classList.add('active');
    }
}

// Funciones de activación/cierre
function activarCheck() {
    showModal(modalSuccessQR);
    const checkmark = modalSuccessQR.querySelector('.checkmark');
    if (checkmark) {
        checkmark.classList.add('animate-checkmark');
    }
}
function cerrarSuccess() { 
    const checkmark = modalSuccessQR.querySelector('.checkmark');
    if (checkmark) {
        checkmark.classList.remove('animate-checkmark');
    }
    showModal(null); 
}

function activarErrorGeneral() {
    if (modalErrorGeneral) {
        showModal(modalErrorGeneral);
    };
};

function cerrarErrorGeneral() {
    showModal(null);
    setTimeout(() => {
        mostrarInformacionInicial();
    }, 5000);
}

function activarRuta() {
    showUserPreview(); 
    showModal(modalRutas);
}

// Ir al login (y finalizar el flujo de modales)
function goToLogin() {
    scanner.clear().catch(err => console.error("Error al limpiar escáner en goToLogin:", err));
    showModal(null);
    mainFooter.style.display = 'block';
    document.body.style.overflow = 'auto';
    window.location.href = 'index.html';
}

// ===============================================
// ============ MOSTRAR INFORMACIÓN  =============
// ===============================================

function mostrarInformacionInicial() {
    // Ocultar elementos normales del scanner
    if (qrTitle) qrTitle.style.display = 'none';
    if (qrReaderDiv) qrReaderDiv.style.display = 'none';
    const resultElement = document.getElementById('result');
    if (resultElement) resultElement.style.display = 'none';

    // Ocultar el contenedor original del scanner temporalmente
    const modalContainer = modalQR.querySelector('.modal-container-qr');
    if (modalContainer) modalContainer.style.display = 'none';

    // Crear y mostrar el contenido de información
    let infoContent = document.getElementById('info-inicial');
    if (!infoContent) {
        infoContent = document.createElement('div');
        infoContent.id = 'info-inicial';
        infoContent.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        infoContent.innerHTML = `
            <div class="info-modal-content" style="
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                padding: 50px 40px;
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                border: 1px solid #e9ecef;
                max-width: 450px;
                width: 90%;
                text-align: center;
                transform: translateY(-30px);
                opacity: 0;
                animation: modalAppear 0.6s ease-out forwards;
            ">
                <div class="info-icon" style="
                    font-size: 5em; 
                    color: #17a2b8; 
                    margin-bottom: 25px;
                    animation: pulse 2s infinite ease-in-out;
                ">
                    <i class="fas fa-info-circle"></i>
                </div>
                <h2 style="
                    color: #2c3e50; 
                    margin-bottom: 20px;
                    font-size: 1.8em;
                    font-weight: 700;
                    line-height: 1.3;
                ">Información Importante</h2>
                <p style="
                    color: #555; 
                    font-size: 1.2em; 
                    line-height: 1.6; 
                    margin-bottom: 35px;
                    padding: 0 5px;
                ">
                    Para registrarse debe escanear su carnet proporcionado por la UNELLEZ
                </p>
                <button class="btn-ok" onclick="cerrarInfoYMostrarScanner()" 
                        style="
                            padding: 16px 40px; 
                            font-size: 1.2em; 
                            font-weight: 600;
                            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                            color: white; 
                            border: none; 
                            border-radius: 10px; 
                            cursor: pointer;
                            transition: all 0.3s ease;
                            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
                            display: inline-flex;
                            align-items: center;
                            gap: 10px;
                        "
                        onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(40, 167, 69, 0.5)';"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 20px rgba(40, 167, 69, 0.4)';">
                    <i class="fas fa-check"></i> Comenzar Escaneo
                </button>
            </div>
            
            <style>
                @keyframes modalAppear {
                    0% {
                        transform: translateY(-30px) scale(0.9);
                        opacity: 0;
                    }
                    60% {
                        transform: translateY(10px) scale(1.02);
                        opacity: 0.9;
                    }
                    100% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                }
                
                @keyframes pulse {
                    0% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 5px rgba(23, 162, 184, 0.3));
                    }
                    50% {
                        transform: scale(1.08);
                        filter: drop-shadow(0 0 15px rgba(23, 162, 184, 0.5));
                    }
                    100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 5px rgba(23, 162, 184, 0.3));
                    }
                }
            </style>
        `;
        
        // Agregar al body en lugar del contenedor del modal
        document.body.appendChild(infoContent);
    }
    
    infoContent.style.display = 'flex';
}

function cerrarInfoYMostrarScanner() {
    // Ocultar el contenido de información
    const infoContent = document.getElementById('info-inicial');
    if (infoContent) {
        infoContent.style.display = 'none';
    }

    // Mostrar nuevamente el contenedor del scanner
    const modalContainer = modalQR.querySelector('.modal-container-qr');
    if (modalContainer) modalContainer.style.display = 'block';

    // Mostrar elementos normales del scanner
    if (qrTitle) qrTitle.style.display = 'flex';
    
    // Iniciar el scanner
    iniciarScanner();
    
    // Marcar que ya no es la primera vez
    isFirstTime = false;
}

function cerrarInfoYMostrarScanner() {
    // Ocultar el contenido de información
    const infoContent = document.getElementById('info-inicial');
    if (infoContent) {
        infoContent.style.display = 'none';
    }

     // Restaurar estilos normales del contenedor del modal
    qrContainer.style.display = 'block';
    qrContainer.style.alignItems = 'normal';
    qrContainer.style.justifyContent = 'normal';
    qrContainer.style.minHeight = 'auto';

    // Mostrar elementos normales del scanner
    if (qrTitle) qrTitle.style.display = 'flex';
    
    // Iniciar el scanner
    iniciarScanner();
    
    // Marcar que ya no es la primera vez
    isFirstTime = false;
}

// ===============================================
// === MENSAJE DE ESPERA EN MODAL QR ===
// ===============================================

function showWaitingMessage() {
    showModal(modalQR);
    if (qrTitle) qrTitle.style.display = 'none';

    if (qrReaderDiv) qrReaderDiv.style.display = 'none';
    const resultElement = document.getElementById('result');
    if (resultElement) resultElement.style.display = 'none';

    // 3. Insertar el mensaje de espera (si no existe)
    let waitingMessage = document.getElementById('waiting-message');
    if (!waitingMessage) {
        waitingMessage = document.createElement('div');
        waitingMessage.id = 'waiting-message';
        waitingMessage.innerHTML = `
            <div class="loading-spinner"></div>
            <h3>Analizando carnet...</h3>
            <p>Esto tomará unos segundos mientras consultamos el estado de su inscripción.</p>
        `;

        waitingMessage.style.textAlign = 'center';
        waitingMessage.style.padding = '30px';
        waitingMessage.style.fontSize = '1.1em';
        
        qrContainer.appendChild(waitingMessage); 
    }
    waitingMessage.style.display = 'block';
}

function hideWaitingMessage() {
    const waitingMessage = document.getElementById('waiting-message');
    if (waitingMessage) {
        waitingMessage.style.display = 'none';
        qrTitle.style.display = 'flex';
    }
}

// ===============================================
// ================ RUTAS ========================
// ===============================================

const btnRuta = document.querySelector(".btn-ruta");
const selectorRutas = document.getElementById('rutas');
const divDescripcion = document.getElementById('descripcionRutas');

if (selectorRutas && divDescripcion) {
    const descripcionInicial = selectorRutas.options[0].getAttribute('data-descripcion');
    if (descripcionInicial) {
        divDescripcion.textContent = descripcionInicial;
    }
    selectorRutas.addEventListener('change', function() {
        const opcionSeleccionada = selectorRutas.options[selectorRutas.selectedIndex];
        const descripcion = opcionSeleccionada.getAttribute('data-descripcion');
        divDescripcion.innerHTML = '';
        if (descripcion) {
            divDescripcion.textContent = descripcion;
        } else {
            divDescripcion.textContent = "No hay descripción disponible para esta ruta.";
        }
    });
}

function enviarRutaSeleccionada() {
    const cedulaToken = tempToken; 

    if (!cedulaToken) {
        showErrorGeneral("Error: La sesión de escaneo ha expirado o no se inició. Intente escanear de nuevo.");
        iniciarScanner();
        return;
    }

    const rutaSeleccionada = document.getElementById('rutas').value;
    
    if (!rutaSeleccionada || rutaSeleccionada === "") {
        alert('Por favor, seleccione una ruta válida antes de continuar.');
        return;
    }

    // *** AGREGAR ESTO PARA DEPURACIÓN ***
    console.log("Datos a enviar al backend:", { 
        cedula: cedulaToken,
        ruta_elegida: rutaSeleccionada
    });

    showModal(modalQR);
    showWaitingMessage(); 
    
    fetch('http://127.0.0.1:5000/select-route', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            cedula: cedulaToken,
            ruta_elegida: rutaSeleccionada
        })
    })
    .then(response => {
        hideWaitingMessage(); 
        showModal(null); 
        if (!response.ok) {
            throw new Error('La solicitud falló con estado: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            if (temporalUserData){
                temporalUserData.rutaSeleccionada = rutaSeleccionada;
            }
        
            showModal(modalRegistro);

        } else {
            // Se usa la función de error general
            showErrorGeneral("Error al guardar la ruta: " + data.message);
        }
    })
    .catch(error => {
        hideWaitingMessage();
        showModal(null); 
        console.error('Error de conexión al guardar la ruta:', error);
        // Se usa la función de error general
        showErrorGeneral('Error de conexión con el servidor al intentar guardar la ruta.');
    });
}

if (btnRuta) {
    btnRuta.addEventListener('click', enviarRutaSeleccionada);
}


function enviarRegistroFinal() {
    const cedulaToken = tempToken;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    // Validaciones básicas
    if (!username || !password || !email) {
        mostrarErrorEnRegistro("Por favor complete todos los campos requeridos.");
        return;
    }

    fetch('http://127.0.0.1:5000/complete-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cedula: cedulaToken,
            user_name: username,
            password: password,
            email: email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Mostrar preview con data.preview
            showUserPreview(data.preview);
            showRegistrationSuccess()
            goToLogin();
        } else {
            mostrarErrorEnRegistro("Error al completar el registro: " + data.message);
        }
    })
    .catch(error => {
        mostrarErrorEnRegistro('Error de conexión con el servidor al intentar completar el registro.', error);
    });
}

function mostrarErrorEnRegistro(message) {
    // Crear o mostrar un elemento de error dentro del modal de registro
    let errorElement = document.getElementById('registro-error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'registro-error-message';
        errorElement.style.color = '#dc3545';
        errorElement.style.padding = '10px';
        errorElement.style.margin = '10px 0';
        errorElement.style.border = '1px solid #dc3545';
        errorElement.style.borderRadius = '5px';
        errorElement.style.backgroundColor = '#f8d7da';
        errorElement.style.textAlign = 'center';
        
        // Insertar el mensaje de error al inicio del formulario
        const form = document.getElementById('registerForm');
        if (form) {
            form.insertBefore(errorElement, form.firstChild);
        } else {
            // Si no hay form, insertarlo en el modal de registro
            const modalContent = modalRegistro.querySelector('.modal-content');
            if (modalContent) {
                modalContent.insertBefore(errorElement, modalContent.firstChild);
            }
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Mantener el modal de registro abierto
    showModal(modalRegistro);
    
    // Opcional: auto-ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function limpiarErrorRegistro() {
    const errorElement = document.getElementById('registro-error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}


// ===============================================
// ================ ESCÁNER QR ===================
// ===============================================

function exito(result) {
    console.log("QR Escaneado con éxito:", result);
    scanner.clear();
    if (qrReaderDiv) qrReaderDiv.style.display = 'none';

    showWaitingMessage(); 
    
    fetch('http://127.0.0.1:5000/scan-result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            qr_result: result
        })
    })
    .then(response => {
        hideWaitingMessage(); 
        if (!response.ok) {
            throw new Error(`La solicitud falló con estado: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {

        if (data.userData) {
            const carrera = data.userData.carrera;
            const esActivo = carrera && carrera !== 'N/A' && carrera.trim() !== '';

            temporalUserData = {
                ...data.userData,
                estudianteActivo: esActivo,
                carrera: esActivo ? data.userData.carrera : 'INACTIVO',
                tipo: 'estudiante' 
            };

            tempToken = data.cedula; 
        }


        if (data.access === "GRANTED" && temporalUserData && temporalUserData.estudianteActivo) {
            
            activarCheck();

            setTimeout(() => {
                cerrarSuccess(); 
                activarRuta();
            }, 2500);

        } else if (data.access === "GRANTED" && temporalUserData && !temporalUserData.estudianteActivo) {
            activarCheck(); 

            setTimeout(() => {
                cerrarSuccess();
                activarRuta(); 
            }, 2500);

        } else if (data.access === "DENIED") {
            showErrorGeneral(data.message || "Acceso denegado o error de validación.");

        } else {
            showErrorGeneral("Error de procesamiento interno en el servidor: " + (data.message || "Respuesta incompleta."));

        }
    })
    .catch((error) => {
        hideWaitingMessage();

        console.error('Error de conexión o de red:', error);

        showErrorGeneral('Error de conexión con el servidor. Verifique su conexión a internet e intente nuevamente.');
        
    });
}

function closeErrorModal() {
    cerrarErrorGeneral();
    iniciarScanner();
}

function errorDeLectura(err) {
    console.warn("Error de Lectura/Decodificación:", err);
    
    scanner.clear().then(() => {
        showModal(null); 
        showErrorGeneral("Error al escanear el código. Intente de nuevo."); 

        setTimeout(() => {
            cerrarErrorGeneral(); 
            setTimeout(() => {
                iniciarScanner(); 
            }, 500); 
        }, 1500);

    }).catch((clearErr) => {
        console.error("Error al limpiar escáner en errorDeLectura:", clearErr);
        showModal(null);
        showErrorGeneral("Error interno del escáner."); 
        setTimeout(() => { 
            cerrarErrorGeneral(); 
            iniciarScanner(); 
        }, 2000);
    });
};

function iniciarScanner() {
    // 1. Aseguramos que el mensaje de información inicial esté oculto
    const infoContent = document.getElementById('info-inicial');
    if (infoContent) {
        infoContent.style.display = 'none';
    }

    hideWaitingMessage();

    let readerElement = document.getElementById('reader');
    if (!readerElement) {
        const qrContainer = modalQR.querySelector('.modal-container-qr');
        if (qrContainer) {
            readerElement = document.createElement('div');
            readerElement.id = 'reader';
            const resultElement = document.getElementById('result'); 
            qrContainer.insertBefore(readerElement, resultElement); 
        }
    }

    if (readerElement) readerElement.style.display = 'block';
    const resultElement = document.getElementById('result');
    if (resultElement) resultElement.style.display = 'block';

    if (qrTitle) qrTitle.style.display = 'flex';
    
    showModal(modalQR);
    scanner.render(exito, advertenciaDeInicializacion);
}


// ===============================================
// === USER PREVIEW (Muestra solo 'carrera' si es estudiante) ===
// ===============================================

function showUserPreview() {
    const previewContent = document.getElementById('previewContent');
    if (!temporalUserData) {
        previewContent.innerHTML = '<p>Datos temporales no cargados.</p>';
        return;
    }
    
    let previewHTML = `
        <div class="user-info-item">
            <span class="user-info-label">Tipo de Usuario:</span>
            <span class="user-info-value">
                <strong>${getUserTypeDisplay(temporalUserData.tipo)}</strong>
            </span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Nombre Completo:</span>
            <span class="user-info-value">${temporalUserData.nombres}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Cédula:</span>
            <span class="user-info-value">${temporalUserData.cedula}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Fecha de Nacimiento:</span>
            <span class="user-info-value">${formatDate(temporalUserData.fechaNac)}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Edad:</span>
            <span class="user-info-value">${calcularEdad(temporalUserData.fechaNac)}</span>
        </div>
    `;
    
    if (temporalUserData.tipo === 'estudiante') {
        previewHTML += `
            <div class="user-info-item">
                <span class="user-info-label">Carrera:</span>
                <span class="user-info-value">${temporalUserData.carrera}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Estado:</span>
                <span class="user-info-value" style="color: ${temporalUserData.estudianteActivo ? '#28a745' : '#dc3545'}; font-weight: bold;">
                    ${temporalUserData.estudianteActivo ? 'ACTIVO' : 'INACTIVO'}
                </span>
            </div>
        `;
    } 
    
    previewContent.innerHTML = previewHTML;
}

// ===============================================
// ===  FUNCIONES PRINCIPALES  ===
// ===============================================

function redirigir(){
    window.location.href = "index.html";   
};

function advertenciaDeInicializacion(err) {
    console.warn("Fallo en la inicialización del QR: ", err);
}

function getUserTypeDisplay(tipo) {
    const types = { 'estudiante': 'Estudiante', 'conductor': 'Conductor', 'obrero': 'Obrero/Personal' };
    return types[tipo] || tipo;
}

function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'No especificada';
    let date;
    if (dateString.includes('-')) {
        date = new Date(dateString);
    } else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        date = new Date(parts[2], parts[1] - 1, parts[0]); 
    } else {
        return dateString;
    }
    
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES');
}

function calcularEdad(fechaNac) {
    if (!fechaNac || fechaNac === 'N/A') return 'No calculable';
    
    let nacimiento;
    if (fechaNac.includes('-')) {
        nacimiento = new Date(fechaNac);
    } else if (fechaNac.includes('/')) {
        const parts = fechaNac.split('/');
        nacimiento = new Date(parts[2], parts[1] - 1, parts[0]); 
    } else {
        return 'No calculable';
    }

    if (isNaN(nacimiento.getTime())) return 'No calculable';

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad + ' años';
}

function showErrorGeneral(message) {

    if (!modalErrorGeneral) {
        console.error('Modal de error no encontrado en el DOM');
        alert(message); // Fallback si el modal no existe
        return;
    }

    const errorMessageElement = document.getElementById('errorMessageGeneral');
    const errorIcon = modalErrorGeneral.querySelector('.error-icon i');

    if (errorIcon) {
        errorIcon.style.color = '#dc3545';
        errorIcon.style.fontSize = '4em';
    }

    if (errorMessageElement) {
        errorMessageElement.textContent = message; 
    } 
    activarErrorGeneral();

    setTimeout(() => {
        cerrarErrorGeneral();
        iniciarScanner(); // Reiniciar scanner después del error
    }, 3000);
}

function setupRealTimeValidation() {
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    const email = document.getElementById('regEmail');
    const username = document.getElementById('regUsername');

    // Limpiar errores cuando el usuario empiece a escribir
    const inputs = [password, confirmPassword, email, username];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                limpiarErrorRegistro();
                // Las validaciones existentes...
                if (input === password) validatePassword();
                if (input === confirmPassword) validatePasswordMatch();
                if (input === email) validateEmail();
            });
        }
    });

    if(password) password.addEventListener('input', validatePassword);
    if(confirmPassword) confirmPassword.addEventListener('input', validatePasswordMatch);
    if(email) email.addEventListener('input', validateEmail);
}

function validateEmail() {
    const email = document.getElementById('regEmail');
    if (!email) return true;
    const value = email.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
        showInputError(email, 'El formato del correo es inválido');
        return false;
    } else {
        clearInputError(email);
        return true;
    }
}

function validatePassword() {
    const password = document.getElementById('regPassword');
    if (!password) return true;
    const value = password.value;

    if (value.length < 6) {
        showInputError(password, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    } else {
        clearInputError(password);
        return true;
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    if (!password || !confirmPassword) return true;

    if (confirmPassword.value && password.value !== confirmPassword.value) {
        showInputError(confirmPassword, 'Las contraseñas no coinciden');
        return false;
    } else {
        clearInputError(confirmPassword);
        return true;
    }
}

function validateForm(username, password, confirmPassword, email) {
    let isValid = true;
    // Las validaciones del formulario de registro se mantienen, usando showErrorGeneral si es necesario
    return isValid;
}

function completeRegistration() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const email = document.getElementById('regEmail').value;

    if (!validateForm(username, password, confirmPassword, email)) {
        return;
    }

    const usersDB = JSON.parse(localStorage.getItem('unellez_users')) || {};
    const userKey = `${temporalUserData.tipo}_${username}`;

    if (usersDB[userKey]) {
        showErrorGeneral('El nombre de usuario ya está en uso. Por favor elija otro.');
        return;
    }

    temporalUserData.password = password;
    temporalUserData.username = username;
    temporalUserData.email = email;
    temporalUserData.fechaRegistro = new Date().toISOString();

    usersDB[userKey] = temporalUserData;
    localStorage.setItem('unellez_users', JSON.stringify(usersDB));

    showRegistrationSuccess();
}

function showRegistrationSuccess() {
    // Asumiendo que tienes un modal con ID modalSuccess
    const modalSuccessFinal = document.getElementById('modalSuccess');
    if (!modalSuccessFinal) {
        alert("¡Registro Exitoso! (Falta modalSuccess en el HTML)");
        goToLogin();
        return;
    }
    showModal(modalSuccessFinal);

    const userSummary = document.getElementById('userSummary');
    userSummary.innerHTML = `
        <h4>Resumen de su cuenta:</h4>
        <p><strong>Usuario:</strong> ${temporalUserData.username}</p>
        <p><strong>Email:</strong> ${temporalUserData.email}</p>
        <p><strong>Nombre:</strong> ${temporalUserData.nombreCompleto}</p>
        <p><strong>Tipo:</strong> ${getUserTypeDisplay(temporalUserData.tipo)}</p>
        <p><strong>Ruta Seleccionada:</strong> ${temporalUserData.rutaSeleccionada || 'N/A'}</p>
        <p><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString()}</p>
    `;

    mainFooter.style.display = 'block';
}

function cancelRegistration() {
    if (confirm('¿Está seguro de que desea cancelar el registro? Perderá el progreso.')) {
        goToLogin();
    }
}

function showInputError(input, message) {
    input.classList.add('input-error');
    let errorElement = input.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        input.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearInputError(input) {
    input.classList.remove('input-error');
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// ===============================================
// === INICIALIZACIÓN DEL FLUJO DE MODALES ===
// ===============================================

document.addEventListener('DOMContentLoaded', function() {

    console.log('inicio del proceso de registro')
    
    mostrarInformacionInicial();

    document.querySelector('.cerrar-qr').addEventListener('click', () => {
        document.getElementById('modal-qr').classList.remove('active');
    });

    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        completeRegistration();
    });

    setupRealTimeValidation();
});