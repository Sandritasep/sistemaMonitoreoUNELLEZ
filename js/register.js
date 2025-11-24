// ===============================================
// === VARIABLES GLOBALES ===
// ===============================================
let temporalUserData = null;
let tempToken = null; 
let isFirstTime = true;
let mostrandoErrorActualmente = false;  // Flag para evitar múltiples errores
let registroCompletado = false;  // Flag para evitar reiniciar flujo después del registro

// Referencias a los modales y elementos
const modalQR = document.getElementById('modal-qr');
const modalSuccessQR = document.getElementById('modal-success');
const modalRutas = document.getElementById('modal-rutas');
const modalRegistro = document.getElementById('modal-registro');
const modalErrorGeneral = document.getElementById('modal-error'); 
const modalSuccessFinal = document.getElementById('modalSuccess');

// Contenedores del modal QR para manejar el mensaje de espera
const qrContainer = modalQR.querySelector('.modal-container-qr');
const qrReaderDiv = document.getElementById('reader');
const qrTitle = modalQR.querySelector('.header-qr');

// ===============================================
// === INSTANCIA DEL ESCÁNER QR ===
// ===============================================
const scanner = new Html5QrcodeScanner('reader', {
    qrbox: { 
        width: 250, 
        height: 250 
    },
    fps: 20,
    rememberLastUsedCamera: false,
});

// ===============================================
// === MANEJO DE MODALES (UNIFICADO) ===
// ===============================================

/** Muestra un modal, ocultando todos los demás */
function showModal(modalElement) {
     // Si el registro está completado, no permitir cambiar modales excepto el de éxito
    if (registroCompletado && modalElement && modalElement.id !== 'modalSuccess') {
        console.log("🔒 Registro completado - bloqueando cambio de modal");
        return;
    }

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
}

function activarErrorGeneral() {
    if (modalErrorGeneral) {
        showModal(modalErrorGeneral);
    }
}

function activarRuta() {
    showUserPreview(); 
    showModal(modalRutas);
}

// Ir al login (y finalizar el flujo de modales)
function goToLogin() {
    console.log('🔗 Redirigiendo a login...');

    // Limpiar datos temporales
    temporalUserData = null;
    tempToken = null;
    registroCompletado = false;  // Resetear el flag

    showModal(null);

    // Redirigir al index.html solo cuando el usuario haga clic
    window.location.href = 'index.html';
}

// ===============================================
// ============ MOSTRAR INFORMACIÓN  =============
// ===============================================

function mostrarInformacionInicial() {
    // Si el registro ya está completo, no reiniciar el flujo
    if (registroCompletado) {
        console.log("Registro completado, no reiniciando flujo");
        return;
    }
    
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
            background: rgba(0, 0, 0, 0.7);
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
    console.log("Cerrando info y mostrando scanner...");

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
    if (qrReaderDiv) qrReaderDiv.style.display = 'block';
    
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

    // Agregar clase de espera al contenedor QR
    if (qrContainer) {
        qrContainer.classList.add('waiting');
    }

    if (qrTitle) qrTitle.style.display = 'none';
    if (qrReaderDiv) qrReaderDiv.style.display = 'none';

    const resultElement = document.getElementById('result');
    if (resultElement) resultElement.style.display = 'none';
    
    const instructions = document.querySelector('.scanner-instructions');
    if (instructions) instructions.style.display = 'none';

    // También ocultar los botones del dashboard del scanner
    const dashboardSection = document.getElementById('reader__dashboard_section');
    if (dashboardSection) dashboardSection.style.display = 'none';

    // Insertar el mensaje de espera (si no existe)
    let waitingMessage = document.getElementById('waiting-message');
    if (!waitingMessage) {
        waitingMessage = document.createElement('div');
        waitingMessage.id = 'waiting-message';
        waitingMessage.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="loading-spinner"></div>
                <h3>Analizando carnet...</h3>
                <p>Esto tomará unos segundos mientras consultamos el estado de su inscripción.</p>
            </div>
        `;
        
        qrContainer.appendChild(waitingMessage); 
    }
    waitingMessage.style.display = 'flex';
}

function hideWaitingMessage() {
    const waitingMessage = document.getElementById('waiting-message');
    if (waitingMessage) {
        waitingMessage.style.display = 'none';
    }

    // REMOVER la clase waiting del contenedor QR
    if (qrContainer) {
        qrContainer.classList.remove('waiting');
    }
       
    if (qrTitle) qrTitle.style.display = 'flex';
    if (qrReaderDiv) qrReaderDiv.style.display = 'block';

    const instructions = document.querySelector('.scanner-instructions');
    if (instructions) instructions.style.display = 'block';

    const dashboardSection = document.getElementById('reader__dashboard_section');
    if (dashboardSection) dashboardSection.style.display = 'block';
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
        return;
    }

    const rutaSeleccionada = document.getElementById('rutas').value;
    
    if (!rutaSeleccionada || rutaSeleccionada === "") {
        alert('Por favor, seleccione una ruta válida antes de continuar.');
        return;
    }

    showWaitingMessage(); 
    
    fetch('http://127.0.0.1:5000/select-route', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            cedula: cedulaToken,
            ruta_elegida: rutaSeleccionada,
            tipo: temporalUserData.tipo // Enviar el tipo al servidor
        })
    })
    .then(response => {
        hideWaitingMessage(); 

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
            showErrorGeneral("Error al guardar la ruta: " + data.message);
        }
    })
    .catch(error => {
        hideWaitingMessage();
        console.error('Error de conexión al guardar la ruta:', error);
        showErrorGeneral('Error de conexión con el servidor al intentar guardar la ruta.');
    });
    
}

if (btnRuta) {
    btnRuta.addEventListener('click', enviarRutaSeleccionada);
}

// ===============================================
// ================ REGISTRO FINAL ===============
// ===============================================

function enviarRegistroFinal(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    const cedulaToken = tempToken;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const email = document.getElementById('regEmail').value;

    console.log("📤 Enviando registro final:", { username, email, cedulaToken });

    // Validaciones básicas
    if (!username || !password || !email) {
        mostrarErrorEnRegistro("Por favor complete todos los campos requeridos.");
        return;
    }

    // Validar formato del email
    if (!validateEmail()) {
        return;
    }

    if (!validatePassword()) {
        return;
    }

    if (!validatePasswordMatch()) {
        return;
    }

    console.log("🔄 Procesando registro final...");

    fetch('http://127.0.0.1:5000/complete-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cedula: cedulaToken,
            user_name: username,
            password: password,
            email: email,
            tipo: temporalUserData.tipo // Enviar el tipo al servidor
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log("✅ Registro completado exitosamente");

            if (temporalUserData) {
                temporalUserData.username = username;
                temporalUserData.email = email;
                temporalUserData.rutaSeleccionada = temporalUserData.rutaSeleccionada || 'N/A';
            }

            const registerForm = document.getElementById('registerForm');
            if (registerForm) {
                registerForm.reset();
            }

            showRegistrationSuccess();
            
        } else {
            mostrarErrorEnRegistro("Error al completar el registro: " + (data.message || "Error desconocido"));
        }
    })
    .catch(error => {
        console.error('Error en registro final:', error);
        mostrarErrorEnRegistro('Error de conexión con el servidor al intentar completar el registro.');
    });
}

function mostrarErrorEnRegistro(message) {
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
        
        const form = document.getElementById('registerForm');
        if (form) {
            form.insertBefore(errorElement, form.firstChild);
        } else {
            const modalContent = modalRegistro.querySelector('.modal-content');
            if (modalContent) {
                modalContent.insertBefore(errorElement, modalContent.firstChild);
            }
        }
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    showModal(modalRegistro);
    
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
    console.log("✅ QR Escaneado con éxito:", result);

    // Detener scanner inmediatamente y MOSTRAR "ANALIZANDO CARNET" 
    stopScanner();
    showWaitingMessage();

    // Procesar el QR directamente
    processQRScan(result);
}

function processQRScan(result) {
    console.log("🔄 Procesando escaneo QR...");

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
        if (!response.ok) {
            throw new Error(`La solicitud falló con estado: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideWaitingMessage();

        // CORRECCIÓN: Manejar ambos tipos de usuarios
        if (data.userData) {
            if (data.tipo === 'estudiante') {
                const carrera = data.userData.carrera;
                const esActivo = carrera && carrera !== 'N/A' && carrera.trim() !== '';

                temporalUserData = {
                    ...data.userData,
                    estudianteActivo: esActivo,
                    carrera: esActivo ? data.userData.carrera : 'INACTIVO',
                    tipo: data.tipo,
                    nombres: data.userData.nombres || [],
                    rutaSeleccionada: 'No seleccionada'
                };
            } else if (data.tipo === 'trabajador') {
                temporalUserData = {
                    ...data.userData,
                    tipo: data.tipo,
                    // Para trabajadores, crear un array de nombres para compatibilidad
                    nombres: data.userData.nombre_completo ? [data.userData.nombre_completo] : ['N/A'],
                    rutaSeleccionada: 'No seleccionada'
                };
            }

            tempToken = data.cedula; 
        }

        console.log("Datos temporales:", temporalUserData);
        console.log("Tipo de usuario:", data.tipo);

        if (data.access === "GRANTED" && temporalUserData) {
            activarCheck();

            setTimeout(() => {
                cerrarSuccess();
                showModal(null);
                setTimeout(() => {
                    activarRuta();
                }, 100);
            }, 2500);

        } else if (data.access === "DENIED") {
            showErrorGeneral(data.message || "Acceso denegado o error de validación.");
        } else {
            showErrorGeneral("Error de procesamiento interno en el servidor.");
        }
    })
    .catch((error) => {
        // ✅ OCULTAR EL MENSAJE DE "ANALIZANDO CARNET" ANTES DE MOSTRAR EL ERROR
        hideWaitingMessage();
        
        let errorMessage = 'Error de conexión con el servidor. ';
        
        if (error.message.includes('Timeout')) {
            errorMessage += 'El servidor no respondió en el tiempo esperado.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'No se pudo conectar al servidor. Verifique que esté encendido.';
        } else {
            errorMessage += error.message;
        }
        
        showErrorGeneral(errorMessage);
    });
}

function closeErrorModal() {
    cerrarErrorGeneral();
}

function errorDeLectura(err) {
    console.warn("Error de Lectura/Decodificación:", err);
    
    scanner.clear().catch((clearErr) => {
        console.error("Error al limpiar escáner en errorDeLectura:", clearErr);
    });
}

function iniciarScanner() {
    console.log('iniciando scanner...');

    const infoContent = document.getElementById('info-inicial');
    if (infoContent) {
        infoContent.style.display = 'none';
    }

    iniciarScannerLimpio();
}

// ===============================================
// === FUNCIONES MEJORADAS DEL SCANNER ===========
// ===============================================

function iniciarScannerLimpio() {
    console.log('🔄 Iniciando scanner limpio...');
    
    stopScanner();
    hideWaitingMessage();
    
    // ✅ RESTAURAR TODOS LOS ELEMENTOS DEL SCANNER
    if (qrTitle) {
        qrTitle.style.display = 'flex';
        const tituloScanner = qrTitle.querySelector('.titulo-scanner');
        if (tituloScanner) {
            tituloScanner.textContent = 'Escanee su Carnet';
        }
    }
    
    if (qrReaderDiv) {
        qrReaderDiv.style.display = 'block';
        qrReaderDiv.innerHTML = ''; // Limpiar completamente
    }

    const instructions = document.querySelector('.scanner-instructions');
    if (instructions) instructions.style.display = 'block';

    const dashboardSection = document.getElementById('reader__dashboard_section');
    if (dashboardSection) dashboardSection.style.display = 'block';

    // ✅ MOSTRAR EL MODAL QR
    showModal(modalQR);
    
    try {
        scanner.clear().then(() => {
            console.log("✅ Scanner limpiado exitosamente");
            
            // Pequeño delay antes de renderizar
            setTimeout(() => {
                try {
                    scanner.render(exito, advertenciaDeInicializacion);
                    console.log("✅ Scanner reiniciado correctamente");
                } catch (renderError) {
                    console.error('❌ Error al renderizar scanner:', renderError);
                    showErrorGeneral('Error al iniciar la cámara. Por favor, recargue la página.');
                }
            }, 300);
            
        }).catch(clearError => {
            console.warn("⚠️ Error al limpiar scanner anterior:", clearError);
            // Intentar de todos modos
            setTimeout(() => {
                try {
                    scanner.render(exito, advertenciaDeInicializacion);
                    console.log("✅ Scanner reiniciado después de error");
                } catch (renderError) {
                    console.error('❌ Error crítico:', renderError);
                    showErrorGeneral('Error crítico con la cámara. Recargue la página.');
                }
            }, 300);
        });
    } catch (error) {
        console.error('❌ Error crítico al reiniciar:', error);
        showErrorGeneral('Error crítico. Recargue la página por favor.');
    }
}

function stopScanner() {
    console.log("Deteniendo scanner...");
    try {
        scanner.clear().then(() => {
            console.log("Scanner limpiado exitosamente");
        }).catch(err => {
            console.warn("Advertencia al limpiar scanner:", err);
        });
    } catch (error) {
        console.error("Error al detener scanner:", error);
    }
    
    if (qrReaderDiv) {
        qrReaderDiv.style.display = 'none';
    }

    hideWaitingMessage();
}

// ===============================================
// === MANEJO DE ERRORES MEJORADO ================
// ===============================================

function showErrorGeneral(message) {
     // Si el registro está completado, ignorar errores
    if (registroCompletado) {
        console.log("🔒 Registro completado - ignorando error:", message);
        return;
    }

     console.log('🔴 Mostrando error general:', message);
     
     // Marcar que estamos mostrando un error
     mostrandoErrorActualmente = true;
     
     // ✅ ASEGURARSE DE OCULTAR EL MENSAJE DE ESPERA
     hideWaitingMessage();
     stopScanner();

     if (!modalErrorGeneral) {
         alert(message);
         mostrandoErrorActualmente = false;
         reiniciarScannerDesdeCero();
         return;
     }

     const errorMessageElement = document.getElementById('errorMessageGeneral');
     if (errorMessageElement) {
         errorMessageElement.textContent = message; 
     } 

     activarErrorGeneral();

      // SOLO programar regreso si el registro NO está completado
    if (!registroCompletado) {
        console.log("⏰ Programando regreso al escáner en 3 segundos...");
        setTimeout(() => {
            console.log("🔄 Regresando automáticamente al escáner...");
            mostrandoErrorActualmente = false;
            cerrarErrorGeneralYReiniciar();
        }, 3000);
    }
}

function cerrarErrorGeneralYReiniciar() {
     console.log('🔄 CERRANDO ERROR Y REINICIANDO SCANNER...');
     
     // Detener scanner primero
     try {
         scanner.clear().catch(err => {});
     } catch(e) {}
     
     // Ocultar TODOS los modales
     document.querySelectorAll('.modal-base').forEach(m => m.classList.remove('active'));
     
     // Limpiar estado de espera COMPLETAMENTE
     hideWaitingMessage();
     
     // REMOVER la clase waiting y el elemento waiting-message del DOM
     if (qrContainer) {
         qrContainer.classList.remove('waiting');
         const waitingMsg = qrContainer.querySelector('#waiting-message');
         if (waitingMsg) {
             waitingMsg.remove();
         }
     }
     
     // Restaurar elementos del scanner sin llamar showModal
     if (qrTitle) qrTitle.style.display = 'flex';
     if (qrReaderDiv) {
         qrReaderDiv.style.display = 'block';
         qrReaderDiv.innerHTML = '';
     }
     
     const resultElement = document.getElementById('result');
     if (resultElement) {
         resultElement.style.display = 'none';
         resultElement.textContent = '';
     }
     
     const instructions = document.querySelector('.scanner-instructions');
     if (instructions) instructions.style.display = 'block';
     
     const dashboardSection = document.getElementById('reader__dashboard_section');
     if (dashboardSection) dashboardSection.style.display = 'block';
     
     // Mostrar el modal QR nuevamente
     if (modalQR) {
         modalQR.classList.add('active');
     }
     
     // Reiniciar el scanner
     setTimeout(() => {
         try {
             scanner.render(exito, advertenciaDeInicializacion);
             console.log('✅ Scanner reiniciado');
         } catch (error) {
             console.error('Error:', error);
         }
     }, 500);
}

function cerrarErrorGeneral() {
     cerrarErrorGeneralYReiniciar();
}

// ===============================================
// === USER PREVIEW ==============================
// ===============================================

// ===============================================
// === USER PREVIEW ==============================
// ===============================================

function showUserPreview() {
    const previewContent = document.getElementById('previewContent');
    if (!temporalUserData) {
        previewContent.innerHTML = '<p>Datos temporales no cargados.</p>';
        return;
    }

    // CORRECCIÓN: Manejar nombres de forma segura para ambos tipos
    let nombreCompleto = 'N/A';
    if (temporalUserData.tipo === 'estudiante' && temporalUserData.nombres) {
        nombreCompleto = Array.isArray(temporalUserData.nombres) 
            ? temporalUserData.nombres.join(' ').toUpperCase()
            : String(temporalUserData.nombres).toUpperCase();
    } else if (temporalUserData.tipo === 'trabajador' && temporalUserData.nombre_completo) {
        nombreCompleto = temporalUserData.nombre_completo.toUpperCase();
    }

    // Determinar el color según el tipo de usuario
    const userTypeColor = temporalUserData.tipo === 'trabajador' ? '#ff9800' : '#2196f3';
    const userTypeClass = temporalUserData.tipo === 'trabajador' ? 'user-type-trabajador' : 'user-type-estudiante';

    let previewHTML = `
        <div class="user-info-item">
            <span class="user-info-label">Tipo de Usuario:</span>
            <span class="user-info-value ${userTypeClass}">
                <strong>${getUserTypeDisplay(temporalUserData.tipo)}</strong>
            </span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Nombre Completo:</span>
            <span class="user-info-value">${nombreCompleto}</span>
        </div>
        <div class="user-info-item">
            <span class="user-info-label">Cédula:</span>
            <span class="user-info-value">${temporalUserData.cedula || 'N/A'}</span>
        </div>
    `;
    
    // Mostrar fecha de nacimiento y edad solo para estudiantes
    if (temporalUserData.tipo === 'estudiante') {
        previewHTML += `
            <div class="user-info-item">
                <span class="user-info-label">Fecha de Nacimiento:</span>
                <span class="user-info-value">${formatDate(temporalUserData.fechaNac)}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Edad:</span>
                <span class="user-info-value">${calcularEdad(temporalUserData.fechaNac)}</span>
            </div>
        `;
    }
    
    // Información específica por tipo de usuario
    if (temporalUserData.tipo === 'estudiante') {
        previewHTML += `
            <div class="user-info-item">
                <span class="user-info-label">Carrera:</span>
                <span class="user-info-value">${temporalUserData.carrera || 'N/A'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Estado:</span>
                <span class="user-info-value" style="color: ${temporalUserData.estudianteActivo ? '#28a745' : '#dc3545'}; font-weight: bold;">
                    ${temporalUserData.estudianteActivo ? 'ACTIVO' : 'INACTIVO'}
                </span>
            </div>
        `;
    } else if (temporalUserData.tipo === 'trabajador') {
        previewHTML += `
            <div class="user-info-item">
                <span class="user-info-label">Condición:</span>
                <span class="user-info-value">${temporalUserData.condicion || 'N/A'}</span>
            </div>
            <div class="user-info-item">
                <span class="user-info-label">Cargo:</span>
                <span class="user-info-value">${temporalUserData.cargo || 'N/A'}</span>
            </div>
        `;
    }
    
    previewContent.innerHTML = previewHTML;
    
    // Aplicar estilos CSS para los colores
    const style = document.createElement('style');
    style.textContent = `
        .user-type-trabajador {
            color: #ff9800 !important;
            font-weight: bold;
        }
        .user-type-estudiante {
            color: #2196f3 !important;
            font-weight: bold;
        }
    `;
    if (!document.querySelector('#user-type-styles')) {
        style.id = 'user-type-styles';
        document.head.appendChild(style);
    }
}

// ===============================================
// ===  FUNCIONES PRINCIPALES  ===
// ===============================================

function showRegistrationSuccess() {
    console.log("🔵 MOSTRANDO MODAL DE ÉXITO - Datos completos:", temporalUserData);

    const modalSuccessFinal = document.getElementById('modalSuccess');
    if (!modalSuccessFinal) {
        console.error('❌ Modal de éxito no encontrado');
        return;
    }

    registroCompletado = true;

    stopScanner();
    
    // Cerrar todos los otros modales PRIMERO
    document.querySelectorAll('.modal-base').forEach(m => {
        if (m.id !== 'modalSuccess') {
            m.classList.remove('active');
        }
    });
    
    const userSummary = document.getElementById('userSummary');
    
    if (!temporalUserData) {
        console.error('❌ temporalUserData no definido');
        userSummary.innerHTML = '<p>Error al cargar los datos del usuario.</p>';
        return;
    }

    // CORRECCIÓN: Manejar nombres de forma segura
    let nombreCompleto = 'N/A';
    if (temporalUserData.tipo === 'estudiante' && temporalUserData.nombres) {
        nombreCompleto = Array.isArray(temporalUserData.nombres) 
            ? temporalUserData.nombres.join(' ').toUpperCase()
            : String(temporalUserData.nombres).toUpperCase();
    } else if (temporalUserData.tipo === 'trabajador' && temporalUserData.nombre_completo) {
        nombreCompleto = temporalUserData.nombre_completo.toUpperCase();
    }
    
    userSummary.innerHTML = `
        <h4>Resumen de su cuenta:</h4>
        <p><strong>Usuario:</strong> ${temporalUserData.username || 'No definido'}</p>
        <p><strong>Email:</strong> ${temporalUserData.email || 'No definido'}</p>
        <p><strong>Nombre:</strong> ${nombreCompleto}</p>
        <p><strong>Tipo:</strong> ${getUserTypeDisplay(temporalUserData.tipo)}</p>
        <p><strong>Ruta Seleccionada:</strong> ${temporalUserData.rutaSeleccionada || 'No seleccionada'}</p>
        <p><strong>Fecha de registro:</strong> ${new Date().toLocaleDateString()}</p>
    `;

    modalSuccessFinal.classList.add('active');
    console.log("✅ Modal de éxito MOSTRADO - clase 'active' agregada");
}

function redirigir(){
    window.location.href = "index.html";   
};

function advertenciaDeInicializacion(err) {
    console.warn("Fallo en la inicialización del QR: ", err);
    
    // Manejar errores específicos de cámara
    if (err && err.includes('NotAllowedError')) {
        showErrorGeneral('Permiso de cámara denegado. Por favor, permita el acceso a la cámara en su navegador.');
    } else if (err && err.includes('NotFoundError')) {
        showErrorGeneral('No se encontró cámara disponible en este dispositivo.');
    } else {
        showErrorGeneral('Error al acceder a la cámara: ' + err);
    }
}

function getUserTypeDisplay(tipo) {
    const types = { 
        'estudiante': 'Estudiante', 
        'trabajador': 'Trabajador',
        'conductor': 'Conductor', 
        'obrero': 'Obrero/Personal' 
    };
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

function setupRealTimeValidation() {
    const password = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('regConfirmPassword');
    const email = document.getElementById('regEmail');
    const username = document.getElementById('regUsername');

    const inputs = [password, confirmPassword, email, username];
    inputs.forEach(input => {
        if (input) {
            // Validación en tiempo real mientras escribe
            input.addEventListener('input', () => {
                limpiarErrorRegistro();
                if (input === password) validatePassword();
                if (input === confirmPassword) validatePasswordMatch();
                if (input === email) validateEmail();
            });

            // Validación al presionar Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (input === email) validateEmail();
                    if (input === password) validatePassword();
                    if (input === confirmPassword) validatePasswordMatch();
                    
                    // Mover al siguiente campo o enviar formulario
                    const form = input.closest('form');
                    const inputs = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
                    const index = inputs.indexOf(input);
                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    } else {
                        enviarRegistroFinal(e);
                    }
                }
            });

            // Mostrar ayuda al enfocar (focus)
            input.addEventListener('focus', () => {
                showInputHelp(input);
            });

            // Ocultar ayuda al perder foco (blur)
            input.addEventListener('blur', () => {
                hideInputHelp(input);
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
    const value = email.value.trim();
    
    // Validación más estricta del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
        showInputError(email, 'El correo electrónico es requerido');
        return false;
    }
    
    if (!emailRegex.test(value)) {
        showInputError(email, 'El formato del correo es inválido. Debe incluir @ y un dominio válido (ej: usuario@dominio.com)');
        return false;
    }
    
    // Validar que tenga algo después del @ y un dominio
    const parts = value.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1] || !parts[1].includes('.') || parts[1].split('.')[1].length < 2) {
        showInputError(email, 'El formato del correo es inválido. Debe incluir @ y un dominio válido (ej: usuario@dominio.com)');
        return false;
    }
    
    clearInputError(email);
    return true;
}

function validatePassword() {
    const password = document.getElementById('regPassword');
    if (!password) return true;
    const value = password.value;

    if (!value) {
        showInputError(password, 'La contraseña es requerida');
        return false;
    }

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

    if (!confirmPassword.value) {
        showInputError(confirmPassword, 'Por favor confirme su contraseña');
        return false;
    }

    if (password.value !== confirmPassword.value) {
        showInputError(confirmPassword, 'Las contraseñas no coinciden');
        return false;
    } else {
        clearInputError(confirmPassword);
        return true;
    }
}

function validateForm(username, password, confirmPassword, email) {
    let isValid = true;
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

function cancelRegistration() {
    if (confirm('¿Está seguro de que desea cancelar el registro? Perderá el progreso.')) {
        registroCompletado = false;
        goToLogin();
    }
}

function showInputError(input, message) {
    input.classList.add('input-error');
    
    // Crear o actualizar elemento de error debajo del input
    let errorElement = input.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.style.cssText = `
            display: block;
            color: #dc3545;
            font-size: 0.85em;
            margin-top: 5px;
            padding: 2px 5px;
        `;
        input.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function clearInputError(input) {
    input.classList.remove('input-error');
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function showInputHelp(input) {
    let helpElement = input.parentNode.querySelector('.help-message');
    if (!helpElement) {
        helpElement = document.createElement('span');
        helpElement.className = 'help-message';
        helpElement.style.cssText = `
            display: block;
            color: #6c757d;
            font-size: 0.8em;
            margin-top: 3px;
            padding: 2px 5px;
            font-style: italic;
        `;
        input.parentNode.appendChild(helpElement);
    }
    
    // Mensajes de ayuda específicos para cada campo
    const helpMessages = {
        'regEmail': 'Ejemplo: usuario@ejemplo.com',
        'regPassword': 'Mínimo 6 caracteres',
        'regConfirmPassword': 'Repita la misma contraseña',
        'regUsername': 'Elija un nombre de usuario único'
    };
    
    helpElement.textContent = helpMessages[input.id] || 'Complete este campo';
    helpElement.style.display = 'block';
}

function hideInputHelp(input) {
    const helpElement = input.parentNode.querySelector('.help-message');
    if (helpElement) {
        helpElement.style.display = 'none';
    }
}

// ===============================================
// === INICIALIZACIÓN DEL FLUJO DE MODALES ===
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 INICIO DEL PROCESO DE REGISTRO - VERSIÓN CORREGIDA');
    
    mostrarInformacionInicial();

    document.querySelector('.cerrar-qr').addEventListener('click', () => {
        document.getElementById('modal-qr').classList.remove('active');
    });

    document.querySelectorAll('.modal-base').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id !== 'modalSuccess') {
                    showModal(null);
                }
            }
        });
    });

    setupRealTimeValidation();
});