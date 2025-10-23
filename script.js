const btnOpen_iniciar = document.querySelector(".abrir-modal");
const modal = document.querySelector(".modal-completo");
const btn_cerrarM = document.querySelector(".modal-close");
const cedulaIn = document.getElementById("cedula");
const validarBtn = document.getElementById("btn-validar");
const mensajeDiv = document.getElementById("mensaje");
const tipoCedula = document.getElementById("Nacionalidad");
const url = "https://arse.unellez.edu.ve/arse/portal/consulta_estudiantes.php"

//para el nuevo modal
const modalSuccess = document.getElementById("modal-success");
const checkmark = modalSuccess.querySelector(".checkmark");

//abrir ventana modal
btnOpen_iniciar.addEventListener("click", function(){
    modal.classList.add("active");
});

//boton cerrar ventana
btn_cerrarM.addEventListener("click", function(){
    modal.classList.remove("active");
});

//cerrar ventana con click fuera contenido
modal.addEventListener("click", (e) => {
    if (e.target === modal){
        modal.classList.remove("active");
        limpiarForm();
    }
});

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
    //cerrar modal contenido y abrir modal exito
    modal.classList.remove("active");
    checkmark.classList.remove('animate-checkmark');

    void checkmark.offsetWidth; 
    // Añadir la clase que activa la animación
    checkmark.classList.add('animate-checkmark');

    modalSuccess.classList.add("active");

    setTimeout(() => {
        modalSuccess.classList.remove("active"); 
        limpiarForm(); 
    }, 1500);
};

//limpiar formulario
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