const btnOpen_iniciar = document.querySelector(".abrir-modal");
const open_modal = document.querySelector(".modal-completo");
const btn_cerrarM = document.querySelector(".modal-close");


btnOpen_iniciar.addEventListener("click", function(){
    open_modal.classList.add("active");
});

btn_cerrarM.addEventListener("click", function(){
    open_modal.classList.remove("active");
});
