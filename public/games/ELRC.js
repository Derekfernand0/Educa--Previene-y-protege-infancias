// --- BASE DE PREGUNTAS (30 Rondas) ---
const bancoPreguntas = [
    { pregunta: "¿Si alguien me pega debo decírselo a mi Mamá, Papá o Tutor?", opciones: ["Sí", "No"], correcta: 0 },
    { pregunta: "¿Mi cuerpo es solo mío y nadie debe tocarlo si no quiero?", opciones: ["Falso", "Verdadero"], correcta: 1 },
    { pregunta: "¿Los secretos que me hacen sentir triste o asustado se deben guardar?", opciones: ["Sí", "No"], correcta: 1 },
    { pregunta: "Si un adulto me pide fotos sin ropa, ¿qué debo hacer?", opciones: ["Enviarlas para no enojarlo", "Contarle a un adulto de confianza"], correcta: 1 },
    { pregunta: "¿Es culpa mía si alguien mayor me hace daño?", opciones: ["Nunca es tu culpa", "A veces sí"], correcta: 0 },
    { pregunta: "Si alguien me hace sentir incómodo con sus palabras, ¿tengo derecho a alejarme?", opciones: ["Sí", "No, por respeto"], correcta: 0 },
    { pregunta: "¿A quién debo acudir si alguien me amenaza por internet?", opciones: ["A mis padres o maestros", "A nadie, yo lo arreglo"], correcta: 0 },
    { pregunta: "Las sorpresas para cumpleaños están bien, pero los secretos sobre tocarme son malos.", opciones: ["Cierto", "Falso"], correcta: 0 },
    { pregunta: "Si alguien me dice 'no le digas a tus padres o habrá problemas', ¿qué debo hacer?", opciones: ["Callar", "Contarlo inmediatamente"], correcta: 1 },
    { pregunta: "¿Estoy obligado a dar abrazos o besos a familiares si no quiero?", opciones: ["Sí, es mala educación", "No, puedo decir que no"], correcta: 1 },
    { pregunta: "Si un adulto que conozco me pide ir a un lugar a solas sin avisar a mis padres:", opciones: ["Digo que NO y aviso a mis padres", "Voy si me promete un regalo"], correcta: 0 },
    { pregunta: "¿Las partes de mi cuerpo que cubre el traje de baño son privadas?", opciones: ["Solo en público", "Sí, siempre son privadas"], correcta: 1 },
    { pregunta: "Si alguien me toca y me hace sentir mal, debo:", opciones: ["Gritar, correr y contarlo", "Esconderme por vergüenza"], correcta: 0 },
    { pregunta: "Nadie debe pedirme que toque sus partes íntimas.", opciones: ["Verdadero", "Falso"], correcta: 0 },
    { pregunta: "¿Debo aceptar solicitudes de amistad de extraños en redes sociales?", opciones: ["No, es peligroso", "Sí, para tener amigos"], correcta: 0 },
    { pregunta: "Si me siento en peligro con una persona, mi instinto es importante y debo alejarme.", opciones: ["Verdadero", "Falso"], correcta: 0 },
    { pregunta: "Un 'adulto de confianza' es:", opciones: ["Alguien que me respeta y me escucha", "Cualquiera que me dé dulces"], correcta: 0 },
    { pregunta: "Si le cuento a un adulto de confianza sobre un abuso y no me cree, ¿qué hago?", opciones: ["Me rindo", "Le cuento a otro adulto hasta que me escuchen"], correcta: 1 },
    { pregunta: "¿Alguien tiene derecho a tomarme fotografías en el baño o cuando me cambio?", opciones: ["No, jamás", "Sí, si es de la familia"], correcta: 0 },
    { pregunta: "Si me regalan algo a cambio de guardar un 'secreto especial', eso es:", opciones: ["Un soborno, debo contarlo", "Un premio por ser bueno"], correcta: 0 },
    { pregunta: "¿Debo usar mi nombre real completo, dirección o escuela en juegos online públicos?", opciones: ["Sí, para que me encuentren", "No, debo proteger mi identidad"], correcta: 1 },
    { pregunta: "Mi opinión y cómo me siento son importantes.", opciones: ["Verdadero", "Falso"], correcta: 0 },
    { pregunta: "Si alguien me muestra imágenes de personas sin ropa en su celular, debo:", opciones: ["Contárselo a mis padres", "Quedarme mirando"], correcta: 0 },
    { pregunta: "El respeto a los demás significa que también debo respetar sus cuerpos y límites.", opciones: ["Verdadero", "Falso"], correcta: 0 },
    { pregunta: "Si alguien lastima a mi amigo y me pide no decir nada, la mejor forma de ayudar a mi amigo es:", opciones: ["Guardar el secreto", "Avisar a un adulto"], correcta: 1 },
    { pregunta: "Nadie debe pedirme que me quite la ropa en una videollamada.", opciones: ["Verdadero", "Falso"], correcta: 0 },
    { pregunta: "Está bien decir 'No' incluso a las personas que quiero si me piden algo que me incomoda.", opciones: ["Cierto", "Falso"], correcta: 0 },
    { pregunta: "Si estoy solo en casa y alguien desconocido llama a la puerta:", opciones: ["Abro para ver quién es", "No abro la puerta"], correcta: 1 },
    { pregunta: "Las reglas de seguridad sobre mi cuerpo sirven para:", opciones: ["Protegerme y cuidarme", "Aburrirme"], correcta: 0 },
    { pregunta: "¿Amas y respetas tu cuerpo?", opciones: ["¡Sí, mucho!", "No lo sé"], correcta: 0 }
];

// --- VARIABLES DE ESTADO ---
let vidas = 5;
let rondaActual = 0;
let tiempoRestante = 15;
let temporizador;
let bloqueado = false; // Evita clics múltiples durante animaciones

// --- REFERENCIAS AL DOM ---
const domFondo = document.getElementById('fondo-juego');
const domPantallaInicial = document.getElementById('pantalla-inicial');
const domTitulo = document.getElementById('titulo-imagen');
const domBtnIniciar = document.getElementById('btn-iniciar');
const domInterfazJuego = document.getElementById('interfaz-juego');
const domCorazones = document.getElementById('contenedor-corazones');
const domTextoTiempo = document.querySelector('#temporizador span');
const domTextoPregunta = document.getElementById('texto-pregunta');
const domOpciones = [document.getElementById('texto-opcion-0'), document.getElementById('texto-opcion-1')];
const domImgPuertas = [document.getElementById('img-puerta-0'), document.getElementById('img-puerta-1')];
const domContenedorPuertas = document.getElementById('contenedor-puertas');
const domEfectoPantalla = document.getElementById('efecto-pantalla');
const domPantallaFin = document.getElementById('pantalla-fin');
const domMensajeFin = document.getElementById('mensaje-fin');

// --- EVENTOS INICIALES ---
document.getElementById('btn-iniciar').addEventListener('click', transicionInicio);
document.getElementById('btn-instrucciones').addEventListener('click', () => abrirModal(true));

// --- FUNCIONES DEL JUEGO ---

function transicionInicio() {
    // Animación de salida de la pantalla de inicio
    domFondo.classList.remove('fondo-borroso');
    domTitulo.classList.add('mover-arriba');
    domBtnIniciar.classList.add('mover-abajo');

    // Esperar a que termine la animación para mostrar el juego
    setTimeout(() => {
        domPantallaInicial.classList.add('oculto');
        domInterfazJuego.classList.remove('oculto');
        iniciarJuego();
    }, 1000);
}

function iniciarJuego() {
    vidas = 5;
    rondaActual = 0;
    actualizarCorazones();
    domPantallaFin.classList.add('oculto');
    cargarRonda();
}

function cargarRonda() {
    if (vidas <= 0) return finalizarJuego(false);
    if (rondaActual >= bancoPreguntas.length) return finalizarJuego(true);

    bloqueado = false;
    const preguntaActual = bancoPreguntas[rondaActual];
    
    // Asignar textos
    domTextoPregunta.innerText = preguntaActual.pregunta;
    domOpciones[0].innerText = preguntaActual.opciones[0];
    domOpciones[1].innerText = preguntaActual.opciones[1];

    // Resetear imágenes de puertas (por si venimos de la animación de abrir)
    domImgPuertas[0].src = "../iconos/puerta.png";
    domImgPuertas[1].src = "../iconos/puerta.png";

    // Animación de aparición
    domContenedorPuertas.classList.remove('avanzar-animacion');
    domContenedorPuertas.classList.add('aparecer-animacion');
    
    iniciarTemporizador();
}

function iniciarTemporizador() {
    clearInterval(temporizador);
    tiempoRestante = 15;
    domTextoTiempo.innerText = tiempoRestante;

    temporizador = setInterval(() => {
        tiempoRestante--;
        domTextoTiempo.innerText = tiempoRestante;
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            procesarRespuesta(-1); // -1 significa que se acabó el tiempo
        }
    }, 1000);
}

function elegirPuerta(indice) {
    if (bloqueado) return;
    bloqueado = true;
    clearInterval(temporizador);
    procesarRespuesta(indice);
}

function procesarRespuesta(indiceSeleccionado) {
    const preguntaActual = bancoPreguntas[rondaActual];
    let esCorrecto = false;

    if (indiceSeleccionado === preguntaActual.correcta) {
        esCorrecto = true;
        vidas = Math.min(vidas + 1, 5);
        mostrarEfecto('brillo-verde');
    } else {
        vidas -= 1;
        mostrarEfecto('brillo-rojo');
    }

    actualizarCorazones();

    if (indiceSeleccionado !== -1) {
        // Cambiar imagen a puerta abierta
        domImgPuertas[indiceSeleccionado].src = "../iconos/Pabierta.png";
        
        // Retraso para ver la puerta abierta antes de avanzar
        setTimeout(() => {
            animarTransicionRonda();
        }, 600);
    } else {
        // Si fue por tiempo, avanzar directo
        animarTransicionRonda();
    }
}

function animarTransicionRonda() {
    if (vidas <= 0) {
        return finalizarJuego(false);
    }
    
    // Animación visual simulando que el jugador avanza
    domContenedorPuertas.classList.remove('aparecer-animacion');
    domContenedorPuertas.classList.add('avanzar-animacion');

    // Esperar a que la animación termine para cargar la nueva pregunta
    setTimeout(() => {
        rondaActual++;
        cargarRonda();
    }, 1000);
}

function actualizarCorazones() {
    let corazonesHTML = "";
    for (let i = 0; i < 5; i++) {
        if (i < vidas) {
            corazonesHTML += "❤️";
        } else {
            corazonesHTML += "🖤"; // Corazón vacío
        }
    }
    domCorazones.innerHTML = corazonesHTML;
}

function mostrarEfecto(clase) {
    domEfectoPantalla.className = ""; // Limpiar clases previas
    domEfectoPantalla.classList.add(clase);
    setTimeout(() => {
        domEfectoPantalla.classList.remove(clase);
    }, 800);
}

function finalizarJuego(victoria) {
    clearInterval(temporizador);
    domInterfazJuego.classList.add('oculto');
    domPantallaFin.classList.remove('oculto');
    
    if (victoria) {
        domMensajeFin.innerText = "¡Felicidades! Has completado el juego y aprendido mucho sobre seguridad.";
    } else {
        domMensajeFin.innerText = "Te quedaste sin vidas. ¡Recuerda siempre cuidarte y confiar en adultos seguros! Inténtalo de nuevo.";
    }
}

function reiniciarJuego() {
    iniciarJuego();
    domInterfazJuego.classList.remove('oculto');
}

function abrirModal(abrir) {
    const modal = document.getElementById('modal-instrucciones');
    if (abrir) {
        modal.classList.remove('oculto');
    } else {
        modal.classList.add('oculto');
    }
}

function cerrarModal() {
    abrirModal(false);
}