// Función para abrir el modal de login
function openLoginModal() {
    const modal = document.getElementById('modalLogin');
    modal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Función para cerrar el modal de login
function closeLoginModal() {
    const modal = document.getElementById('modalLogin');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Función para mostrar información de registro
function showRegistrationInfo() {
    // Primero cerrar el modal de login
    closeLoginModal();
    
    // Luego abrir el modal de información después de un pequeño delay
    setTimeout(() => {
        const modalInfo = document.getElementById('modalRegistroInfo');
        modalInfo.classList.add('active');
        document.body.classList.add('modal-open');
    }, 300);
}

// Función para cerrar información de registro
function closeRegistroInfo() {
    const modalInfo = document.getElementById('modalRegistroInfo');
    modalInfo.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Volver a mostrar el modal de login después de un pequeño delay
    setTimeout(() => {
        openLoginModal();
    }, 300);
}

// Cerrar modal al hacer click fuera del contenido
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        if (event.target === modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (!modalContent.contains(event.target)) {
                modal.classList.remove('active');
                document.body.classList.remove('modal-open');
                
                // Si se cierra el modal de registro, volver al login
                if (modal.id === 'modalRegistroInfo') {
                    setTimeout(() => {
                        openLoginModal();
                    }, 300);
                }
            }
        }
    });
});

// Cerrar modal con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.classList.remove('modal-open');
            
            // Si se cierra el modal de registro, volver al login
            if (activeModal.id === 'modalRegistroInfo') {
                setTimeout(() => {
                    openLoginModal();
                }, 300);
            }
        }
    }
});

// Manejar el envío del formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // Aquí iría la lógica de autenticación
            console.log('Formulario de login enviado');
            // Simular login exitoso
            // closeLoginModal();
            // document.getElementById('mainContainer').classList.add('active');
        });
    }
});