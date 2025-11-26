// Manejo de la recuperación de datos por email
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar en el paso 1
    showStep1();
});

function showStep1() {
    hideAllSteps();
    document.getElementById('step1').classList.remove('hidden');
    updateProgress(1);
}

function showEmailForm() {
    hideAllSteps();
    document.getElementById('step2').classList.remove('hidden');
    updateProgress(2);
    
    // Enfocar el input de email
    setTimeout(() => {
        document.getElementById('userEmail').focus();
    }, 300);
}

function showStep2() {
    hideAllSteps();
    document.getElementById('step2').classList.remove('hidden');
    updateProgress(2);
}

function showSuccess(email) {
    hideAllSteps();
    document.getElementById('step3').classList.remove('hidden');
    document.getElementById('userEmailText').textContent = email;
    updateProgress(3);
}

function showError(email) {
    hideAllSteps();
    document.getElementById('stepError').classList.remove('hidden');
    document.getElementById('errorEmailText').textContent = email;
}

function hideAllSteps() {
    const steps = document.querySelectorAll('.recovery-step');
    steps.forEach(step => {
        step.classList.add('hidden');
    });
}

function updateProgress(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((stepElement, index) => {
        // Remover todas las clases
        stepElement.classList.remove('active', 'completed');
        
        // Aplicar clases según el paso actual
        if (index + 1 < step) {
            stepElement.classList.add('completed');
        } else if (index + 1 === step) {
            stepElement.classList.add('active');
        }
    });
}

function handleEmailSubmit(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('userEmail');
    const submitBtn = document.getElementById('submitBtn');
    const email = emailInput.value.trim();
    
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
    // Mostrar estado de carga
    button.innerHTML = '<i class="fas fa-spinner"></i> Enviando...';
    button.classList.add('loading');
    button.disabled = true;
    
    // Simular delay de red (2 segundos)
    setTimeout(() => {
        // En un caso real, aquí verificarías si el email existe en tu base de datos
        const emailExists = checkIfEmailExists(email); // Función simulada
        
        if (emailExists) {
            showSuccess(email);
        } else {
            showError(email);
        }
        
        // Restaurar botón
        button.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Enlace de Recuperación';
        button.classList.remove('loading');
        button.disabled = false;
    }, 2000);
}

// Función simulada para verificar si el email existe
// En producción, esto sería una llamada a tu backend
function checkIfEmailExists(email) {
    // Simulación: aceptar algunos emails de prueba
    const validDomains = ['unellez.edu.ve', 'gmail.com', 'hotmail.com', 'yahoo.com'];
    const domain = email.split('@')[1];
    return validDomains.includes(domain);
    
    // En producción, reemplazar con:
    // return await api.checkEmailExists(email);
}