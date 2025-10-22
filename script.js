const btnOpen_iniciar = document.querySelector(".abrir-modal");
const modal = document.querySelector(".modal-completo");
const btn_cerrarM = document.querySelector(".modal-close");
const cedulaIn = document.getElementById("cedula");
const validarBtn = document.getElementById("btn-validar");
const mensajeDiv = document.getElementById("mensaje");
const url = "https://arse.unellez.edu.ve/arse/portal/consulta_estudiantes.php"

//abrir ventana modal
btnOpen_iniciar.addEventListener("click", function(){
    modal.classList.add("active");
});

//enter para activar modal
document.addEventListener("keydown", function(event) {
    if(event.key === "Enter"){
        modal.classList.add("active");
    }
});

//esc para desactivar modal
document.addEventListener("keydown", function(event){
    if (event.key === "Escape"){
        limpiarForm();
        modal.classList.remove("active");
    }
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
        mensajeError("Debe ingresar su cedula", "error");
        limpiarForm();
    } else if (cedulaa.length < 6 || cedulaa.length > 8){
        mensajeError("La cedula debe contener entre 6 a 8 digitos", "error");
    }
};

//limpiar formulario
function limpiarForm(){
    cedulaIn.value = "";
    tipoCedula.value = "V";
    mensajeDiv.style.display = "block";
};

//mensaje de error
function mensajeError(text, type){
    mensajeDiv.textContent = text;
    mensajeDiv.className = "mensaje" + type;
    mensajeDiv.style.display ="block";
};