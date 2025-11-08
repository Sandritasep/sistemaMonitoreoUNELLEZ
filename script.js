//modal bienvenida
const modal = document.querySelector(".modal-completo");
const fuera = document.querySelector(".modal-overlay-oscuro")

//modal de exito
const modalSuccess = document.getElementById("modal-success");
const checkmark = modalSuccess.querySelector(".checkmark");

//modal formulario de rutas
const modal_Rutas = document.querySelector(".modal-rutas-completo");
const btnRuta = document.querySelector(".btn-ruta");

//selector de rutas
const selectorRutas = document.getElementById('rutas');
const divDescripcion = document.getElementById('descripcionRutas');
const descripcionInicial = selectorRutas.options[0].getAttribute('data-descripcion');
divDescripcion.textContent = descripcionInicial;

//barra lateral
const tabItems = document.querySelectorAll('.tab-item');
const tituloRuta = document.querySelector('.titulo-ruta');

function cambiarRuta(event) {
    tabItems.forEach(item => {
        item.classList.remove('active');
    });

    event.currentTarget.classList.add('active');
    const nuevoTitulo = event.currentTarget.textContent;
    tituloRuta.textContent = nuevoTitulo;

    // **(Aquí iría tu lógica existente para cambiar el mapa o la ruta)**
    // const rutaSeleccionada = event.currentTarget.dataset.route;
    // cargarMapa(rutaSeleccionada); 
};
tabItems.forEach(item => {
    item.addEventListener('click', cambiarRuta);
});

// Opcional: Establecer un título inicial y la pestaña 'active' por defecto
/*if (tabItems.length > 0) {
    tabItems[0].classList.add('active'); // Activa el primer elemento
    tituloRuta.textContent = tabItems[0].textContent; // Establece el título inicial
}*/

//para cambiar las rutas en el select
selectorRutas.addEventListener('change', function() {
    const opcionSeleccionada = selectorRutas.options[selectorRutas.selectedIndex];
    const descripcion = opcionSeleccionada.getAttribute('data-descripcion');

    divDescripcion.innerHTML = '';
    if (descripcion) {
            divDescripcion.textContent = descripcion;
    } else {
        // Un valor de fallback en caso de que la opción no tenga el atributo
        divDescripcion.textContent = "No hay descripción disponible para esta ruta.";
    }
});

//cerrar el modal rutas con el boton (por ahora)
// btnRuta.addEventListener('click', () => {
//     modal_Rutas.classList.remove("active");
// })

function btnRutaaaa(){
    modal_Rutas.classList.remove('active');
}


//modal selector de rutas modal
modal_Rutas.addEventListener("click", (e) => {
    if (e.target === modal_Rutas){
        modal_Rutas.classList.remove("active");
    }
});


//validar cedula
function validarCedula(){
    modal.classList.remove("active");
    checkmark.classList.remove('animate-checkmark');

    // Añadir la clase que activa la animación
    void checkmark.offsetWidth; 
    checkmark.classList.add('animate-checkmark');
    modalSuccess.classList.add("active");

    setTimeout(() => {
        modalSuccess.classList.remove("active");
        
    }, 1500);  
};

//inicia con el modal
setTimeout(() => {
    modal.classList.remove("active");
    modal_Qr.classList.add("active");


    //modal_Rutas.classList.add('active');
}, 1500)
modal.classList.add("active");

//mapa
var map = L.map('mapa', {
    zoomControl: false,
    attributionControl: false
}).setView([8.616212, -70.241993], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);