//modal qr
const modal_Qr = document.querySelector(".modal-qr");

//modal qr prueba


const scanner = new Html5QrcodeScanner('reader', {
    qrbox: {
        width: 250,
        height: 250,
    },
    fps : 20,
});

scanner.render(exito, Errror);

function exito(result){
    checkmark.classList.remove('animate-checkmark');

    // Añadir la clase que activa la animación
    void checkmark.offsetWidth; 
    checkmark.classList.add('animate-checkmark');
    modalSuccess.classList.add("active");

    setTimeout(() => {
        modalSuccess.classList.remove("active");
        modal_Rutas.classList.add('active');
    }, 1500);
    
    // document.getElementById('result').innerHTML = `
    // <h2>Se ha escaneado exitosamente</h2>
    // <p><a href='${result}'>${result}</a></p>
    // `;

    scanner.clear();
    document.getElementById('reader').remove();

    return result
}

function Errror(err){
    console.error(err);
}