const modal = document.querySelector(".modal-completo");
const cedulaIn = document.getElementById("cedula");
const validarBtn = document.getElementById("btn-validar");
const mensajeDiv = document.getElementById("mensaje");
const tipoCedula = document.getElementById("Nacionalidad");
const url_validacion_BCKEND = "http://localhost/sistema/validar_cedula.php";

//para el modal de exito
const modalSuccess = document.getElementById("modal-success");
const checkmark = modalSuccess.querySelector(".checkmark");

//para el modal formulario de rutas
const modal_Rutas = document.querySelector(".modal-rutas-completo");
// para el selector de rutas
const selectorRutas = document.getElementById('rutas');
const divDescripcion = document.getElementById('descripcionRutas');
const descripcionInicial = selectorRutas.options[0].getAttribute('data-descripcion');
divDescripcion.textContent = descripcionInicial;

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

//inicia con el modal
//modal.classList.add("active");

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