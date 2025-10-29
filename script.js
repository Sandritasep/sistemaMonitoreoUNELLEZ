const modal = document.querySelector(".modal-completo");
const cedulaIn = document.getElementById("cedula");
const validarBtn = document.getElementById("btn-validar");
const mensajeDiv = document.getElementById("mensaje");
const tipoCedula = document.getElementById("Nacionalidad");
const url_validacion_BCKEND = "http://localhost/sistema/validar_cedula.php";
//para el nuevo modal
const modalSuccess = document.getElementById("modal-success");
const checkmark = modalSuccess.querySelector(".checkmark");

//inicia con el modal
modal.classList.add("active");

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

    // Enviar datos al PHP
    fetch(url_validacion_BCKEND,{
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlenconded',
        },
        body: `cedula=${cedula}&nacionalidad=${nacionalidad}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.valido){
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
        } else {
            mensajeE(data.mensaje || "Cédula inválida", "error");
        }
    })
    .catch(error => {
        mensajeE("Error de conexion", "Error");
        console.error('Error:',error);
    });
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

var map = L.map('mapa').setView([8.616212, -70.241993], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);