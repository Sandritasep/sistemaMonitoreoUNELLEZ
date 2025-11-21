

//barra lateral
const tabItems = document.querySelectorAll('.tab-item');
const tituloRuta = document.querySelector('.titulo-ruta');

let tempToken = null;

// Cerrar modal de login
function closeLoginModal() {
    document.getElementById('modalLogin').classList.remove('active');
}

// Mostrar información de registro
function showRegistrationInfo() {
    document.getElementById('modalRegistroInfo').classList.add('active');
    closeLoginModal();
}

// Cerrar información de registro
function closeRegistroInfo() {
    document.getElementById('modalRegistroInfo').classList.remove('active');
}

// Abrir modal de login
function openLoginModal() {
    document.getElementById('modalLogin').classList.add('active');
}

//------------------------------------------------------


//mapa
var map = L.map('mapa', {
    zoomControl: false,
    attributionControl: false
}).setView([8.616212, -70.241993], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);