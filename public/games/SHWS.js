// ==============================
// CONSTANTES Y DATOS
// ==============================

const FRASES_AGRADECIMIENTO = [
    "¡Muchas gracias! Se ve delicioso.", "Gracias, justo lo que quería.", "¡Qué buen servicio!",
    "Gracias por tu amabilidad.", "Está perfecto, gracias.", "¡Qué rico! Gracias por atenderme.",
    "Aprecio mucho tu atención.", "Gracias por escucharme.", "Se nota que lo hiciste con cuidado.",
    "¡Excelente trabajo!", "Gracias, me voy muy satisfecho.", "Qué bien preparado está.",
    "Gracias por tu paciencia.", "¡Muy amable de tu parte!", "Así da gusto venir.",
    "Gracias por el buen trato.", "Se ve increíble, gracias.", "Me voy contento, gracias.",
    "Qué atención tan respetuosa.", "Gracias por hacer bien tu trabajo.", "Todo en orden, gracias.",
    "Me encantó el servicio.", "Gracias por atenderme tan bien.", "¡Perfecto, gracias!",
    "Qué buen lugar tienes.", "Gracias por tu responsabilidad.", "Se nota tu dedicación.",
    "Muy profesional de tu parte.", "Gracias por el respeto.", "Volvería sin dudarlo, gracias."
];

const MENSAJES_ACIERTO = [
    "Tomaste una decisión responsable.", "Detectaste señales importantes.", "Escuchar con atención marca la diferencia.",
    "Proteger a otros es un acto valiente.", "Supiste identificar una respuesta preocupante.", "Buena intuición.",
    "Elegiste con cuidado.", "Observaste más allá de las apariencias.", "Notaste detalles importantes.",
    "Actuar a tiempo puede ayudar mucho.", "Pensaste antes de actuar, excelente.", "Reconocer señales es una habilidad importante.",
    "Tomaste en serio las respuestas dudosas.", "Muy bien, no ignoraste las señales.", "Elegiste proteger antes que arriesgar.",
    "Decidir con información es clave.", "Prestaste atención a lo que se dijo.", "Supiste diferenciar lo correcto.",
    "Eso demuestra responsabilidad.", "Gran trabajo identificando conductas sospechosas."
];

const MENSAJES_ERROR = [
    "A veces las señales son sutiles. Intenta escuchar con más atención.", "Algunas respuestas pueden parecer normales, pero esconden algo más.",
    "No siempre es fácil notar las señales.", "Presta atención a cómo se habla sobre los límites.",
    "Los secretos entre adultos y niños pueden ser una señal de alerta.", "Minimizar sentimientos puede ser importante.",
    "Cuando alguien duda sobre respetar límites, es buena idea observar mejor.", "Las respuestas ambiguas pueden indicar algo preocupante.",
    "Confía en tu intuición la próxima vez.", "Escuchar cómo se habla del respeto es clave.", "No todas las señales son obvias.",
    "Recuerda: los límites deben respetarse siempre.", "Si alguien justifica secretos, puede ser una advertencia.",
    "Las emociones de los niños deben tomarse en serio.", "Prestar atención a pequeños detalles ayuda mucho.",
    "Observar el tono también es importante.", "No ignores respuestas que minimizan sentimientos.",
    "Algunas actitudes pueden parecer inofensivas, pero no lo son.", "Equivocarse también es parte de aprender.",
    "Intenta analizar cada respuesta con calma."
];

const MENSAJE_VICTORIA = `¡Excelente trabajo!\n\nLograste atender correctamente a las personas responsables y supiste identificar respuestas que podían ser preocupantes.\n\nEscuchar con atención, respetar los límites y tomar en serio lo que alguien siente son acciones que ayudan a crear entornos más seguros.\n\nSaber reconocer señales es una habilidad muy importante. Sigue practicando y confiando en tu criterio.`;

const MENSAJE_GAMEOVER = `Se terminaron las vidas.\n\nA veces no es fácil identificar señales, especialmente cuando son sutiles.\n\nLo importante es aprender: los límites deben respetarse, los secretos entre adultos y niños pueden ser una alerta, y los sentimientos siempre deben tomarse en serio.\n\nPuedes intentarlo nuevamente. Aprender también es parte del proceso.`;

// Arreglo EXACTO de Clientes (3 buenos, 7 malos)
const CLIENTES = [
    {
        id: 1,
        imagen: "../iconos/shawarma/ppl/pp1.png",
        tipo: "bueno",
        dificultad: "facil",
        personalidad: "Amable, respetuoso de los límites",
        preguntas: [
            { texto: "¿Viene a comer con su familia?", respuestaBuena: "Sí, siempre les pregunto qué desean comer antes de pedir." },
            { texto: "¿Le pongo salsa picante?", respuestaBuena: "Solo a mi mitad, a mi hijo no le gusta y hay que respetar sus gustos." },
            { texto: "Se ve que tiene buen humor hoy.", respuestaBuena: "Sí, pasamos una tarde tranquila, escuchando cómo les fue en la escuela." }
        ],
        mensajeError: "Castigaste a alguien que mostraba respeto por la autonomía y los gustos de los demás.",
        mensajeAcierto: ""
    },
    {
        id: 2,
        imagen: "../iconos/shawarma/ppl/pp2.png",
        tipo: "malo",
        dificultad: "sutil",
        personalidad: "Amistoso pero hace preguntas demasiado personales",
        preguntas: [
            { texto: "¿Qué tal su día?", respuestaMala: "Bien, estuve platicando con unos niños del parque. Me gusta saber todo de ellos." },
            { texto: "¿Desea llevar algo extra?", respuestaMala: "Sí, unos dulces. Son perfectos para ganarme la confianza rápida." },
            { texto: "Parece que le gustan los niños.", respuestaMala: "Claro, prefiero estar con ellos, los adultos hacen demasiadas preguntas." },
            { texto: "¿Es para llevar?", respuestaMala: "Sí, los llevaré al parque a ver a quién me encuentro hoy." }
        ],
        mensajeError: "Debes tener cuidado. Buscar cercanía rápida y excesiva confianza con niños desconocidos es una alerta.",
        mensajeAcierto: "Bien hecho. Detectaste a alguien que busca cercanía inapropiada."
    },
    {
        id: 3,
        imagen: "../iconos/shawarma/ppl/pp3.png",
        tipo: "malo",
        dificultad: "facil",
        personalidad: "Actitud autoritaria, exige obediencia sin cuestionar",
        preguntas: [
            { texto: "¿Quiere que lo corte a la mitad?", respuestaMala: "No, que se lo coman entero. Aquí se hace lo que yo digo y punto." },
            { texto: "El niño parece cansado.", respuestaMala: "No importa si está cansado, tiene que aprender a obedecer sin quejarse." },
            { texto: "¿Le pongo todos los vegetales?", respuestaMala: "Ponle de todo, si no le gusta no es mi problema, se lo traga igual." }
        ],
        mensajeError: "Ignoraste señales de autoritarismo extremo que invalida las necesidades básicas.",
        mensajeAcierto: "Excelente. El autoritarismo extremo que ignora los límites personales es una alerta."
    },
    {
        id: 4,
        imagen: "../iconos/shawarma/ppl/pp4.png",
        tipo: "bueno",
        dificultad: "sutil",
        personalidad: "Paciente, valora la comunicación",
        preguntas: [
            { texto: "Hay un poco de fila, disculpe.", respuestaBuena: "No hay problema, aprovechamos para platicar de nuestro día." },
            { texto: "¿Seguro que solo quiere uno?", respuestaBuena: "Sí, mi sobrino me dijo que ya no tenía hambre, y hay que escuchar su cuerpo." },
            { texto: "¿Quiere servilletas extra?", respuestaBuena: "Por favor. Siempre es bueno prevenir accidentes." }
        ],
        mensajeError: "Te equivocaste. Esta persona demostró paciencia y respeto por las decisiones de los demás.",
        mensajeAcierto: ""
    },
    {
        id: 5,
        imagen: "../iconos/shawarma/ppl/pp5.png",
        tipo: "malo",
        dificultad: "sutil",
        personalidad: "Regala cosas en secreto, pide no contar",
        preguntas: [
            { texto: "¿Lo empaco para regalo?", respuestaMala: "Sí, pero es un secreto. Será nuestro pequeño secreto, no le digas a sus papás." },
            { texto: "¿Desea el ticket?", respuestaMala: "No, no quiero que quede registro. Es una sorpresa que solo nosotros compartimos." },
            { texto: "Son 10 monedas.", respuestaMala: "Toma el cambio. Y recuerda, no viste a nadie, esto queda entre nosotros." }
        ],
        mensajeError: "Los secretos, especialmente cuando excluyen a los padres o cuidadores, son una gran señal de alerta.",
        mensajeAcierto: "Muy bien. Identificaste que pedir secretos a los niños es un comportamiento manipulador."
    },
    {
        id: 6,
        imagen: "../iconos/shawarma/ppl/pp6.png",
        tipo: "malo",
        dificultad: "facil",
        personalidad: "Invalida las emociones de los demás",
        preguntas: [
            { texto: "¿Por qué llora el pequeño?", respuestaMala: "Llora por tonterías, siempre exagera. No hay que hacerle caso." },
            { texto: "¿Le doy un vaso de agua?", respuestaMala: "No, que se aguante. Tiene que hacerse fuerte desde pequeño." },
            { texto: "Tal vez no le gusta la cebolla.", respuestaMala: "Sus sentimientos no importan, debe comer lo que se le da sin opinar." }
        ],
        mensajeError: "Minimizar o invalidar constantemente las emociones es una forma de violencia psicológica.",
        mensajeAcierto: "Correcto. Invalidar las emociones es una señal clara de falta de empatía y riesgo."
    },
    {
        id: 7,
        imagen: "../iconos/shawarma/ppl/pp7.png",
        tipo: "bueno",
        dificultad: "facil",
        personalidad: "Empático, respeta el espacio personal",
        preguntas: [
            { texto: "Disculpe el ruido del local.", respuestaBuena: "No te preocupes. Le pregunté a mi hijo si le molestaba y dijo que está bien." },
            { texto: "¿Les sirvo en la mesa?", respuestaBuena: "Sí, por favor. Así podemos tener nuestro espacio tranquilos." },
            { texto: "¿Quiere que se lo entregue en la mano al niño?", respuestaBuena: "Mejor ponlo en el plato, él decidirá cuándo comerlo." }
        ],
        mensajeError: "El respeto por el espacio y la opinión de los demás es una conducta sana, no debiste sospechar.",
        mensajeAcierto: ""
    },
    {
        id: 8,
        imagen: "../iconos/shawarma/ppl/pp8.png",
        tipo: "malo",
        dificultad: "sutil",
        personalidad: "Excesivamente cariñoso físicamente sin permiso",
        preguntas: [
            { texto: "¿Van a comer aquí?", respuestaMala: "Sí, me encanta sentarlos en mis piernas y abrazarlos aunque no quieran." },
            { texto: "Parecen incómodos.", respuestaMala: "Solo se hacen los difíciles, en el fondo les encanta que los apriete." },
            { texto: "¿Quiere espacio extra?", respuestaMala: "Para nada, me gusta estar lo más pegado posible a ellos todo el tiempo." },
            { texto: "Aquí tiene su pedido.", respuestaMala: "Ven, dame un beso como agradecimiento, ándale, no seas tímido." }
        ],
        mensajeError: "El contacto físico forzado, incluso disfrazado de cariño, es una grave violación de los límites.",
        mensajeAcierto: "Bien hecho. Forzar el contacto físico es una clara señal de alerta que detectaste a tiempo."
    },
    {
        id: 9,
        imagen: "../iconos/shawarma/ppl/pp9.png",
        tipo: "malo",
        dificultad: "facil",
        personalidad: "Amenaza con consecuencias exageradas",
        preguntas: [
            { texto: "¿Se les ofrece algo más?", respuestaMala: "No, si piden algo más los voy a dejar abandonados aquí." },
            { texto: "Tenga cuidado, está caliente.", respuestaMala: "Si se queman es su culpa, y ya verán cómo les va en la casa." },
            { texto: "Que disfruten su comida.", respuestaMala: "Más les vale comer rápido o no vuelven a ver la luz del sol." }
        ],
        mensajeError: "Las amenazas desproporcionadas buscan infundir miedo, una alerta importante que dejaste pasar.",
        mensajeAcierto: "Excelente. Reconociste que las amenazas exageradas son una señal de abuso y control."
    },
    {
        id: 10,
        imagen: "../iconos/shawarma/ppl/pp10.png",
        tipo: "malo",
        dificultad: "sutil",
        personalidad: "Manipulador emocional",
        preguntas: [
            { texto: "¿Es todo su pedido?", respuestaMala: "Sí, a ver si así por fin me agradecen algo, después de todo lo que sufro." },
            { texto: "¿Se sienten bien?", respuestaMala: "No sé ellos, pero si me quisieran de verdad se portarían mucho mejor." },
            { texto: "Tardará unos minutos.", respuestaMala: "Está bien. Siempre tengo que esperar, total, a nadie le importo." },
            { texto: "Aquí está su comida.", respuestaMala: "A ver si con esto me demuestras que me quieres, porque últimamente no lo parece." }
        ],
        mensajeError: "La manipulación emocional constante busca generar culpa y control en la otra persona.",
        mensajeAcierto: "Correcto. La manipulación emocional y el chantaje son conductas que deben encender las alarmas."
    }
];

// ==============================
// VARIABLES DE ESTADO
// ==============================

let estadoJuego = "intro"; 
let vidas = 3;
let clientesCola = [];
let clienteActual = null;
let pasosShawarma = 0; 
let shawarmaListoParaServir = false;
let elementoArrastrado = null;

// ==============================
// REFERENCIAS DOM
// ==============================
const DOM = {
    modales: {
        intro: document.getElementById('pantalla-intro'),
        evaluacion: document.getElementById('pantalla-evaluacion'),
        final: document.getElementById('pantalla-final'),
        instrucciones: document.getElementById('modal-instrucciones')
    },
    ui: {
        vidas: document.getElementById('contenedor-vidas'),
        btnSalir: document.getElementById('btn-salir'),
        btnInstrucciones: document.getElementById('btn-instrucciones'),
        btnCerrarInstrucciones: document.getElementById('btn-cerrar-instrucciones'),
        overlayError: document.getElementById('overlay-error'),
        overlayFeedback: document.getElementById('overlay-feedback')
    },
    juego: {
        btnJugar: document.getElementById('btn-jugar'),
        logoIntro: document.getElementById('logo-intro'),
        imagenCliente: document.getElementById('imagen-cliente'),
        globoDialogo: document.getElementById('globo-dialogo'),
        textoDialogo: document.getElementById('texto-dialogo'),
        panelPreguntas: document.getElementById('panel-preguntas'),
        contenedorPreguntasFlotante: document.getElementById('panel-preguntas-flotante'), 
        botonRojo: document.getElementById('boton-rojo'),
        reja: document.getElementById('reja-seguridad'),
        mesa: document.getElementById('mesa-preparacion'),
        baseShawarma: document.getElementById('base-shawarma'),
        shawarmaListo: document.getElementById('shawarma-listo'),
        ingredientes: document.querySelectorAll('.ingrediente')
    },
    evaluacion: {
        titulo: document.getElementById('titulo-evaluacion'),
        mensaje: document.getElementById('mensaje-evaluacion'),
        btnContinuar: document.getElementById('btn-continuar')
    },
    final: {
        titulo: document.getElementById('titulo-final'),
        mensaje: document.getElementById('mensaje-final'),
        btnReiniciar: document.getElementById('btn-reiniciar'),
        btnVolverMenu: document.getElementById('btn-volver-menu')
    }
};

// ==============================
// INICIALIZACIÓN Y ANIMACIÓN DE INICIO
// ==============================

// ANIMACIÓN AL DARLE A JUGAR
DOM.juego.btnJugar.addEventListener('click', () => {
    // Activa la animación hacia arriba del logo y hacia abajo del botón
    DOM.juego.logoIntro.classList.add('anim-logo-arriba');
    DOM.juego.btnJugar.classList.add('anim-boton-abajo');
    
    // Esperamos 800ms a que termine la animación para empezar el juego
    setTimeout(() => {
        DOM.modales.intro.classList.remove('activa');
        iniciarJuego();
    }, 800);
});

function iniciarJuego() {
    estadoJuego = "clienteEntrando";
    vidas = 3;
    actualizarVidasUI();
    clientesCola = mezclarArreglo([...CLIENTES]); 
    siguienteCliente();
}

function mostrarModal(modalElement) {
    modalElement.classList.remove('oculto');
    // Pequeño delay para asegurar que la clase se aplique con animación
    setTimeout(() => modalElement.classList.add('activa'), 10);
}

function ocultarModal(modalElement) {
    modalElement.classList.remove('activa');
    setTimeout(() => modalElement.classList.add('oculto'), 500); // Espera que termine el fade out
}

function actualizarVidasUI() {
    DOM.ui.vidas.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const corazon = document.createElement('div');
        corazon.classList.add('corazon');
        if (i >= vidas) corazon.classList.add('perdido');
        DOM.ui.vidas.appendChild(corazon);
    }
}

function mezclarArreglo(arreglo) {
    for (let i = arreglo.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arreglo[i], arreglo[j]] = [arreglo[j], arreglo[i]];
    }
    return arreglo;
}

function obtenerElementoAleatorio(arreglo) {
    return arreglo[Math.floor(Math.random() * arreglo.length)];
}

// ==============================
// LÓGICA DE CLIENTES Y ANIMACIONES
// ==============================

function siguienteCliente() {
    if (vidas <= 0) {
        finalizarJuego("gameOver");
        return;
    }

    if (clientesCola.length === 0) {
        finalizarJuego("victoria");
        return;
    }

    clienteActual = clientesCola.pop();
    estadoJuego = "clienteEntrando";
    
    reiniciarMesa();
    DOM.juego.panelPreguntas.innerHTML = '';
    DOM.juego.globoDialogo.classList.add('oculto');
    DOM.juego.reja.classList.add('oculto');
    DOM.juego.reja.style.animation = 'none';
    DOM.juego.botonRojo.classList.add('oculto');
    DOM.juego.contenedorPreguntasFlotante.classList.add('oculto'); 

    // --- Animación de Entrada Suave ---
    DOM.juego.imagenCliente.src = clienteActual.imagen;
    DOM.juego.imagenCliente.classList.remove('oculto');
    
    // Lo posicionamos fuera de la pantalla a la derecha
    DOM.juego.imagenCliente.style.transform = "translateX(100vw)";
    
    // Forzamos un reflow para que el navegador registre la posición fuera de pantalla
    void DOM.juego.imagenCliente.offsetWidth;
    
    // Lo deslizamos al centro suavemente
    DOM.juego.imagenCliente.style.transform = "translateX(0)";

    // Esperamos 800ms a que termine de caminar
    setTimeout(() => {
        estadoJuego = "atendiendo";
        DOM.juego.botonRojo.classList.remove('oculto');
        DOM.juego.contenedorPreguntasFlotante.classList.remove('oculto'); 
        cargarPreguntas();
    }, 800);
}

function cargarPreguntas() {
    DOM.juego.panelPreguntas.innerHTML = '';
    clienteActual.preguntas.forEach(p => {
        const btn = document.createElement('button');
        btn.classList.add('btn-pregunta');
        btn.textContent = p.texto;
        btn.onclick = () => mostrarRespuesta(p);
        DOM.juego.panelPreguntas.appendChild(btn);
    });
}

function mostrarRespuesta(preguntaObj) {
    if (estadoJuego !== "atendiendo") return;
    const respuesta = clienteActual.tipo === "bueno" ? preguntaObj.respuestaBuena : preguntaObj.respuestaMala;
    DOM.juego.textoDialogo.textContent = respuesta;
    DOM.juego.globoDialogo.classList.remove('oculto');
}

// ==============================
// MECÁNICA DEL SHAWARMA
// ==============================

function reiniciarMesa() {
    pasosShawarma = 0;
    shawarmaListoParaServir = false;
    DOM.juego.baseShawarma.src = "../iconos/shawarma/ingredientes/swtbl.png";
    DOM.juego.baseShawarma.classList.remove('oculto');
    DOM.juego.shawarmaListo.classList.add('oculto');
    DOM.juego.shawarmaListo.style.transform = 'translate(0px, 0px)';
    
    DOM.juego.ingredientes.forEach(ing => {
        ing.classList.remove('usado');
        ing.style.transform = 'translate(0px, 0px)';
    });
}

function procesarIngrediente(idIngrediente) {
    if (shawarmaListoParaServir || estadoJuego !== "atendiendo") return false;

    if (parseInt(idIngrediente) === pasosShawarma + 1) {
        pasosShawarma++;
        if (pasosShawarma === 1) DOM.juego.baseShawarma.src = "../iconos/shawarma/ingredientes/swtb1.png";
        if (pasosShawarma === 2) DOM.juego.baseShawarma.src = "../iconos/shawarma/ingredientes/swtb2.png";
        if (pasosShawarma === 3) DOM.juego.baseShawarma.src = "../iconos/shawarma/ingredientes/swtb3.png";
        if (pasosShawarma >= 4) DOM.juego.baseShawarma.src = "../iconos/shawarma/ingredientes/swtb4.png";

        return true; 
    }
    return false; 
}

DOM.juego.mesa.addEventListener('click', () => {
    if (pasosShawarma === 4 && !shawarmaListoParaServir && estadoJuego === "atendiendo") {
        DOM.juego.baseShawarma.classList.add('oculto');
        DOM.juego.shawarmaListo.style.transform = 'translate(0px, 0px)';
        DOM.juego.shawarmaListo.classList.remove('oculto');
        shawarmaListoParaServir = true;
    }
});

function mostrarBorde(tipo) {
    DOM.ui.overlayFeedback.classList.remove('oculto', 'borde-verde', 'borde-rojo');
    DOM.ui.overlayFeedback.classList.add(tipo); // 'borde-verde' o 'borde-rojo'
    
    // Quitar el borde despues de 2 segundos
    setTimeout(() => {
        DOM.ui.overlayFeedback.classList.add('oculto');
        DOM.ui.overlayFeedback.classList.remove('borde-verde', 'borde-rojo');
    }, 2000);
}

function entregarShawarma() {
    if (estadoJuego !== "atendiendo") return;
    
    estadoJuego = "evaluando";
    DOM.juego.botonRojo.classList.add('oculto');
    DOM.juego.shawarmaListo.classList.add('oculto');

    if (clienteActual.tipo === "bueno") {
        mostrarBorde('borde-verde'); // Feedback positivo
        DOM.juego.textoDialogo.textContent = obtenerElementoAleatorio(FRASES_AGRADECIMIENTO);
        DOM.juego.globoDialogo.classList.remove('oculto');
        setTimeout(() => despedirCliente(true), 2500); // 2.5s para leer y ver la animacion
    } else {
        mostrarBorde('borde-rojo'); // Feedback negativo
        perderVida("Atendiste a alguien que mostraba señales de alerta. " + clienteActual.mensajeError);
    }
}

// ==============================
// BOTÓN ROJO
// ==============================

DOM.juego.botonRojo.addEventListener('click', () => {
    if (estadoJuego !== "atendiendo") return;
    
    estadoJuego = "evaluando";
    DOM.juego.botonRojo.classList.add('oculto');
    
    DOM.juego.reja.classList.remove('oculto');
    DOM.juego.reja.style.animation = "rejaCierra 0.4s forwards ease-in";

    setTimeout(() => {
        if (clienteActual.tipo === "malo") {
            mostrarEvaluacion("¡Bien Hecho!", obtenerElementoAleatorio(MENSAJES_ACIERTO) + " " + clienteActual.mensajeAcierto);
        } else {
            perderVida("Te apresuraste. " + clienteActual.mensajeError + " " + obtenerElementoAleatorio(MENSAJES_ERROR));
        }
    }, 1000);
});

// ==============================
// EVALUACIÓN Y VIDAS
// ==============================

function perderVida(mensaje) {
    vidas--;
    actualizarVidasUI();
    
    // Flash rojo rápido
    DOM.ui.overlayError.classList.remove('oculto');
    DOM.ui.overlayError.style.opacity = '1';
    setTimeout(() => {
        DOM.ui.overlayError.style.opacity = '0';
        setTimeout(() => DOM.ui.overlayError.classList.add('oculto'), 300);
    }, 300);

    mostrarEvaluacion("¡Cuidado!", mensaje);
}

function mostrarEvaluacion(titulo, mensaje) {
    DOM.evaluacion.titulo.textContent = titulo;
    DOM.evaluacion.mensaje.textContent = mensaje;
    mostrarModal(DOM.modales.evaluacion); // Esto soluciona la pantalla negra
}

DOM.evaluacion.btnContinuar.addEventListener('click', () => {
    ocultarModal(DOM.modales.evaluacion);
    
    if (vidas <= 0) {
        finalizarJuego("gameOver");
    } else {
        despedirCliente(false); 
    }
});

function despedirCliente(fueExito) {
    estadoJuego = "clienteSaliendo";
    DOM.juego.globoDialogo.classList.add('oculto');
    
    // --- Animación de Salida Suave ---
    // Desliza al personaje hacia la izquierda
    DOM.juego.imagenCliente.style.transform = "translateX(-100vw)";
    
    // Esperamos 800ms a que termine de caminar para traer al siguiente
    setTimeout(() => {
        siguienteCliente();
    }, 800);
}

function finalizarJuego(resultado) {
    estadoJuego = resultado;
    
    if (resultado === "victoria") {
        DOM.final.titulo.textContent = "¡Misión Cumplida!";
        DOM.final.mensaje.innerText = MENSAJE_VICTORIA;
    } else {
        DOM.final.titulo.textContent = "Fin del Juego";
        DOM.final.mensaje.innerText = MENSAJE_GAMEOVER;
    }
    
    mostrarModal(DOM.modales.final);
}

// ==============================
// DRAG AND DROP
// ==============================
// (Dejo el Drag and Drop sin cambios, funciona perfecto)

let posInicial = { x: 0, y: 0 };
let posActual = { x: 0, y: 0 };

function iniciarArrastre(e) {
    if (estadoJuego !== "atendiendo") return;
    const target = e.target;
    if (target.classList.contains('usado')) return;
    if (target.classList.contains('arrastrable')) {
        elementoArrastrado = target;
        const event = e.type.includes('mouse') ? e : e.touches[0];
        posInicial = { x: event.clientX - posActual.x, y: event.clientY - posActual.y };
        elementoArrastrado.style.zIndex = "100";
        elementoArrastrado.style.transition = "none";
        if (e.type.includes('touch')) e.preventDefault();
    }
}

function arrastrar(e) {
    if (!elementoArrastrado) return;
    const event = e.type.includes('mouse') ? e : e.touches[0];
    posActual = { x: event.clientX - posInicial.x, y: event.clientY - posInicial.y };
    elementoArrastrado.style.transform = `translate(${posActual.x}px, ${posActual.y}px)`;
    if (e.type.includes('touch')) e.preventDefault(); 
}

function finalizarArrastre(e) {
    if (!elementoArrastrado) return;
    const target = elementoArrastrado;
    elementoArrastrado = null;
    target.style.zIndex = "60";
    target.style.transition = "transform 0.3s ease";

    const rectObj = target.getBoundingClientRect();
    
    if (target.id === 'shawarma-listo') {
        const rectCliente = DOM.juego.imagenCliente.getBoundingClientRect();
        if (colisionan(rectObj, rectCliente)) {
            entregarShawarma();
        } else {
            target.style.transform = `translate(0px, 0px)`;
        }
    } else {
        const rectMesa = DOM.juego.mesa.getBoundingClientRect();
        if (colisionan(rectObj, rectMesa)) {
            const exito = procesarIngrediente(target.getAttribute('data-id'));
            if (exito) target.classList.add('usado');
        }
        target.style.transform = `translate(0px, 0px)`;
    }
    posActual = { x: 0, y: 0 };
}

function colisionan(rect1, rect2) {
    return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}

document.addEventListener('mousedown', iniciarArrastre, { passive: false });
document.addEventListener('mousemove', arrastrar, { passive: false });
document.addEventListener('mouseup', finalizarArrastre);
document.addEventListener('touchstart', iniciarArrastre, { passive: false });
document.addEventListener('touchmove', arrastrar, { passive: false });
document.addEventListener('touchend', finalizarArrastre);

// ==============================
// EVENTOS BOTONES UI (Instrucciones Arregladas)
// ==============================

// Mostrar y ocultar botón de interrogación 
DOM.ui.btnInstrucciones.addEventListener('click', () => {
    mostrarModal(DOM.modales.instrucciones);
});

DOM.ui.btnCerrarInstrucciones.addEventListener('click', () => {
    ocultarModal(DOM.modales.instrucciones);
});

DOM.ui.btnSalir.addEventListener('click', () => {
    window.location.href = '../secciones/explora.html';
});

DOM.final.btnReiniciar.addEventListener('click', () => {
    ocultarModal(DOM.modales.final);
    iniciarJuego();
});

DOM.final.btnVolverMenu.addEventListener('click', () => {
    window.location.href = '../secciones/explora.html';
});