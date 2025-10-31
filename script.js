const modal = document.querySelector(".modal-completo");
const cedulaIn = document.getElementById("cedula");
const validarBtn = document.getElementById("btn-validar");
const mensajeDiv = document.getElementById("mensaje");
const tipoCedula = document.getElementById("Nacionalidad");

//para el modal de exito
const modalSuccess = document.getElementById("modal-success");
const checkmark = modalSuccess.querySelector(".checkmark");

//para el modal formulario de rutas
const modal_Rutas = document.querySelector(".modal-rutas-completo");
const btnRuta = document.querySelector(".btn-ruta");
// para el selector de rutas
const selectorRutas = document.getElementById('rutas');
const divDescripcion = document.getElementById('descripcionRutas');
const descripcionInicial = selectorRutas.options[0].getAttribute('data-descripcion');
divDescripcion.textContent = descripcionInicial;

//para la barra lateral
const tabItems = document.querySelectorAll('.tab-item');
const tituloRuta = document.querySelector('.titulo-ruta');

//inicia con el modal
//modal.classList.add("active");

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
btnRuta.addEventListener('click', () => {
    modal_Rutas.classList.remove("active");
})

//boton validar cedula
validarBtn.addEventListener("click", () => {
    validarCedula();
    limpiarForm();
});

//validar con enter
cedulaIn.addEventListener("keydown", (e) => {
    if (e.key === "Enter"){
        validarCedula();
    }
});

//solo numeros
cedulaIn.addEventListener('input', () => {
    cedulaIn.value = cedulaIn.value.replace(/[^0-9]/g, '');
});

//validar cedula
function validarCedula(){
    const cedulaa = cedulaIn.value.trim();

    if (cedulaa == ""){
        limpiarForm();
        mensajeE("Debe ingresar su cedula", "error");
        return;
    } else if (cedulaa.length < 6 || cedulaa.length > 8){
        limpiarForm();
        mensajeE("Su cedula debe contener entre 6 a 8 digitos", "error");
        return;
    }

    modal.classList.remove("active");
    checkmark.classList.remove('animate-checkmark');

    // Añadir la clase que activa la animación
    void checkmark.offsetWidth; 
    checkmark.classList.add('animate-checkmark');
    modalSuccess.classList.add("active");

    setTimeout(() => {
        modalSuccess.classList.remove("active"); 
        limpiarForm(); 
        modal_Rutas.classList.add('active') 
    }, 1500);  
};

//modal selector de rutas
modal_Rutas.addEventListener("click", (e) => {
    if (e.target === modal_Rutas){
        modal_Rutas.classList.remove("active");
    }
});

//limpiar formulario login
function limpiarForm(){
    cedulaIn.value = "";
    tipoCedula.value = "V";
    mensajeDiv.style.display = "none";
    mensajeDiv.className = "caja-mensaje";
    mensajeDiv.textContent = "";
};

//mensaje de error
function mensajeE(text, type){
    mensajeDiv.textContent = text;
    mensajeDiv.className = "caja-mensaje " + type;
    mensajeDiv.style.display ="block";
};

//mapa
var map = L.map('mapa', {
    zoomControl: false,
    attributionControl: false
}).setView([8.616212, -70.241993], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);