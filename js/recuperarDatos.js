// Manejo de la recuperación de datos por email
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada - Inicializando recuperación de datos');
    
    // Inicializar en el paso 1
    showStep1();
    
    // Agregar event listeners a los formularios
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmit);
    }
    
    // Agregar event listener al botón de opción de email
    const optionCard = document.querySelector('.option-card');
    if (optionCard) {
        optionCard.addEventListener('click', showEmailForm);
    }
});

function showStep1() {
    console.log('Mostrando paso 1');
    hideAllSteps();
    document.getElementById('step1').classList.remove('hidden');
    updateProgress(1);
}

function showEmailForm() {
    console.log('Mostrando formulario de email');
    hideAllSteps();
    document.getElementById('step2').classList.remove('hidden');
    updateProgress(2);
    
    // Enfocar el input de email después de un pequeño delay
    setTimeout(() => {
        const emailInput = document.getElementById('userEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }, 300);
}

function showStep2() {
    console.log('Mostrando paso 2');
    hideAllSteps();
    document.getElementById('step2').classList.remove('hidden');
    updateProgress(2);
}

function showSuccess(email) {
    console.log('Mostrando éxito para:', email);
    hideAllSteps();
    document.getElementById('step3').classList.remove('hidden');
    document.getElementById('userEmailText').textContent = email;
    updateProgress(3);
}

function showError(email) {
    console.log('Mostrando error para:', email);
    hideAllSteps();
    document.getElementById('stepError').classList.remove('hidden');
    document.getElementById('errorEmailText').textContent = email;
}

function hideAllSteps() {
    console.log('Ocultando todos los pasos');
    const steps = document.querySelectorAll('.recovery-step');
    steps.forEach(step => {
        step.classList.add('hidden');
    });
}

function updateProgress(step) {
    console.log('Actualizando progreso al paso:', step);
    const steps = document.querySelectorAll('.step');
    
    steps.forEach((stepElement, index) => {
        // Remover todas las clases
        stepElement.classList.remove('active', 'completed');
        
        // Aplicar clases según el paso actual
        const stepNumber = index + 1;
        
        if (stepNumber < step) {
            // Pasos completados
            stepElement.classList.add('completed');
            // Cambiar el número por un checkmark
            const numberElement = stepElement.querySelector('.step-number');
            if (numberElement) {
                numberElement.innerHTML = '<i class="fas fa-check"></i>';
            }
        } else if (stepNumber === step) {
            // Paso actual
            stepElement.classList.add('active');
            // Asegurar que muestre el número
            const numberElement = stepElement.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = stepNumber;
            }
        } else {
            // Pasos futuros
            // Asegurar que muestre el número
            const numberElement = stepElement.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = stepNumber;
            }
        }
    });
}

function handleEmailSubmit(event) {
    event.preventDefault();
    console.log('Formulario de email enviado');
    
    const emailInput = document.getElementById('userEmail');
    const submitBtn = document.getElementById('submitBtn');
    const email = emailInput.value.trim();
    
    console.log('Email ingresado:', email);
    
    // Validar email básico
    if (!isValidEmail(email)) {
        alert('Por favor, ingrese un correo electrónico válido.');
        emailInput.focus();
        return;
    }
    
    // Simular envío (en producción aquí iría la llamada a tu API)
    simulateEmailSend(email, submitBtn);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function simulateEmailSend(email, button) {
    console.log('Simulando envío de email a:', email);
    
    // Mostrar estado de carga
    button.innerHTML = '<i class="fas fa-spinner"></i> Enviando...';
    button.classList.add('loading');
    button.disabled = true;
    
    // Simular delay de red (2 segundos)
    setTimeout(() => {
        console.log('Simulación completada');
        
        // En un caso real, aquí verificarías si el email existe en tu base de datos
        const emailExists = checkIfEmailExists(email);
        
        if (emailExists) {
            console.log('Email existe, mostrando éxito');
            showSuccess(email);
        } else {
            console.log('Email no existe, mostrando error');
            showError(email);
        }
        
        // Restaurar botón
        button.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Enlace de Recuperación';
        button.classList.remove('loading');
        button.disabled = false;
    }, 2000);
}

// Función simulada para verificar si el email existe
function checkIfEmailExists(email) {
    console.log('Verificando si email existe:', email);
    
    // Simulación: aceptar algunos emails de prueba
    const validDomains = ['unellez.edu.ve', 'gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1];
    const exists = validDomains.includes(domain);
    
    console.log('Dominio:', domain, 'Existe:', exists);
    return exists;
}

// Funciones globales para acceso desde HTML
window.showStep1 = showStep1;
window.showEmailForm = showEmailForm;
window.showStep2 = showStep2;
window.handleEmailSubmit = handleEmailSubmit;