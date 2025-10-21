const btnOpen_iniciar = document.querySelector(".abrir-modal");
const open_modal = document.querySelector(".modal-completo");
const btn_cerrarM = document.querySelector(".modal-close");
const cedulaIn = document.getElementById("cedula");
const tipoCedula = document.getElementById("Nacionalidad");


btnOpen_iniciar.addEventListener("click", function(){
    open_modal.classList.add("active");
});

btn_cerrarM.addEventListener("click", function(){
    limpiarForm();
    open_modal.classList.remove("active");
});

function limpiarForm(){
    cedulaIn.value = "";
    tipoCedula.value = "V";

}
