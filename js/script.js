// Función para abrir el modal
function openLoginModal() {
    const modal = document.getElementById('modalLogin');
    modal.classList.add('active');
    document.body.classList.add('modal-open'); // Bloquea scroll del body
}

// Función para cerrar el modal
function closeLoginModal() {
    const modal = document.getElementById('modalLogin');
    modal.classList.remove('active');
    document.body.classList.remove('modal-open'); // Restaura scroll del body
}

// Función para mostrar información de registro
function showRegistrationInfo() {
    const modalInfo = document.getElementById('modalRegistroInfo');
    modalInfo.classList.add('active');
    document.body.classList.add('modal-open');
}

// Función para cerrar información de registro
function closeRegistroInfo() {
    const modalInfo = document.getElementById('modalRegistroInfo');
    modalInfo.classList.remove('active');
    document.body.classList.remove('modal-open');
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
        }
    }
});