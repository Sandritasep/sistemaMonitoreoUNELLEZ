//MODAL INICIO
const modal = document.querySelector(".modal-completo");
const fuera = document.querySelector(".modal-overlay-oscuro")
const cerrar_qr = document.querySelector(".cerrar-qr");

//MODAL EXITO
const modalSuccess = document.getElementById("modal-success");
const checkmark = modalSuccess.querySelector(".checkmark");

//MODAL ERROR
const modalError = document.querySelector(".modal-err");
const rellenoIcono = document.getElementById('rellenoIconoError');

//MODAL RUTAS
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

let tempToken = null;

//MODAL INICIO
function inicio(){
    modal.classList.add("active");
    
    setTimeout(() => {
        modal.classList.remove("active");
        iniciarScanner();
    }, 1500);
};

cerrar_qr.addEventListener('click', () => {
    modal_Qr.classList.remove('active');
});

//SUCCESS
function activarSuccess(){
    activarCheck();
    modalSuccess.classList.add('active');
    setTimeout(() => {
        cerrarSuccess();
    },1500);
};

//ACTIVAR el checkmark
function activarCheck(){
    checkmark.classList.remove('animate-checkmark');
    void checkmark.offsetWidth; 
    checkmark.classList.add('animate-checkmark');
    modalSuccess.classList.add("active");
};

function cerrarSuccess(){
    modalSuccess.classList.remove('active');
};

//ACTIVAR ERROR
function activarError(){

    modalError.classList.add('active');

    rellenoIcono.classList.remove('activo');
    void rellenoIcono.offsetWidth; 
    rellenoIcono.classList.add('activo');
};

function cerrarError(){
    modalError.classList.remove('active');
};

// Abrir modal de login
function openLoginModal() {
    inicio();
};

//RUTA
function activarRuta(){
    modal_Rutas.classList.add('active');
};

function cerrarRuta(){
    modal_Rutas.classList.remove('active');
};

//evento boton ruta
btnRuta.addEventListener('click', () => {
    enviarRutaSeleccionada();
});

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

//ENVIAR RUTA SELECCIONADA
function enviarRutaSeleccionada() {
    const sessionToken = tempToken;
    
    if (!sessionToken) {
        alert("Error: La sesión de escaneo ha expirado o no se inició. Intente escanear de nuevo.");
        cerrarRuta();
        iniciarScanner();
        return;
    }
    
    // Obtener la ruta elegida
    const selectorRutas = document.getElementById('rutas');
    const rutaSeleccionada = selectorRutas.options[selectorRutas.selectedIndex].value;

    console.log(`Enviando C.I. ${sessionToken} y ruta ${rutaSeleccionada} para guardado final.`);

    // SEGUNDO POST: Guarda la cédula y la ruta en la BBDD
    fetch('http://127.0.0.1:5000/select-route', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            cedula: sessionToken,
            ruta_elegida: rutaSeleccionada
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('La solicitud falló con estado: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos guardados con exito:', data.message);
        
        if (data.success) {
            // Limpieza y reinicio
            tempToken = null; // Limpiar la cédula temporal
            cerrarRuta();
            activarSuccess();

        } else {
            alert("Error al guardar la ruta: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error de conexión al guardar la ruta:', error);
        alert('Error de conexión con el servidor al intentar guardar la ruta.');
        cerrarRuta();
    });
}


//------------------------------------------------------
//------------------------------------------------------

//MODAL QR
const modal_Qr = document.querySelector(".modal-qr");


const scanner = new Html5QrcodeScanner('reader', {
    qrbox: {
        width: 250,
        height: 250,
    },
    fps : 20,
});

function errorDeLectura(err) {
    console.warn("Error de Lectura/Decodificación:", err);
    
    scanner.clear().then(() => {
        modal_Qr.classList.remove("active");
        activarError(); 

        setTimeout(() => {
            cerrarError(); 
            setTimeout(() => {
                iniciarScanner(); 
            }, 500); 
        }, 1500);

    }).catch((clearErr) => {
        console.error("Error al limpiar escáner en errorDeLectura:", clearErr);
        // Flujo de emergencia si el clear falla
        modal_Qr.classList.remove("active");
        activarError(); 
        setTimeout(() => { 
            cerrarError(); 
            iniciarScanner(); 
        }, 2000);
    });
};

function advertenciaDeInicializacion(err) {
    console.warn("Fallo ", err);
};

function exito(result){
    console.log("QR Escaneado con éxito:", result);
    scanner.clear(); 

    // 1. Enviar el resultado al servidor Python
    fetch('http://127.0.0.1:5000/scan-result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            qr_result: result 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('La solicitud falló con estado: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Validación del servidor Python:', data.message);

        const readerElement = document.getElementById('reader');
        if (readerElement) readerElement.remove();

        if (data.access === "GRANTED") {
            // ÉXITO: Guardamos la cédula y abrimos el modal de ruta
            tempToken = data.cedula; 

            modal_Qr.classList.remove("active");
            activarCheck(); // Muestra el modal success
            
            setTimeout(() => {
                cerrarSuccess(); 
                activarRuta(); 
            }, 2500);

        } else if (data.access === "DENIED") {
            // DENEGADO: Muestra el modal de error y reinicia escaneo
            modal_Qr.classList.remove("active");
            activarError();
            
            setTimeout(() => {
                cerrarError(); 
                iniciarScanner(); 
            }, 1500);
            
        } else {
            // ERROR: Algo falló en Selenium
            alert("Error de procesamiento interno en el servidor: " + data.message);
            iniciarScanner();
        }
    })
    .catch((error) => {
        console.error('Error de conexión o de red:', error);
        alert('Error de conexión con el servidor Python. Asegúrese de que esté activo en el puerto 5000.');
        
        const readerElement = document.getElementById('reader');
        if (readerElement) readerElement.remove();
        iniciarScanner();
    });
};

function iniciarScanner(){
    const readerElement = document.getElementById('reader');
    if (readerElement) readerElement.remove();

    const qrContainer = modal_Qr.querySelector('.modal-container-qr');
    if (qrContainer) {
        const newReader = document.createElement('div');
        newReader.id = 'reader';
        const resultElement = document.getElementById('result');
        qrContainer.insertBefore(newReader, resultElement); 
    }
    
    modal_Qr.classList.add('active');
    
    scanner.render(exito, advertenciaDeInicializacion); 
};

//------------------------------------------------------


//mapa
var map = L.map('mapa', {
    zoomControl: false,
    attributionControl: false
}).setView([8.616212, -70.241993], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);


inicio();