const baseDePreguntas = [
    { p: "¿Qué significan las siglas KIVA?", r: ["Kids International Video Association", "Kid’s Integrity, Voz y Apoyo", "Kids In Veracruz Association"], c: 1 },
    { p: "¿Cuál es el mensaje de la sección 'Aprende'?", r: ["Jugar videojuegos", "Que el abuso es tu culpa", "Conocer tu cuerpo y derechos"], c: 2 },
    { p: "¿Es verdad que el abuso solo pasa con desconocidos?", r: ["Sí, siempre son extraños.", "No, puede ser alguien cercano.", "Sí, la familia siempre protege."], c: 1 },
    { p: "¿Qué debes hacer si alguien te confía que ha sido lastimado?", r: ["Escuchar, creer y buscar ayuda.", "Ignorarlo.", "Decirle que es mentira."], c: 0 },
    { p: "¿Qué define la página como 'Consentimiento'?", r: ["Decir sí por un regalo.", "No hay consentimiento si hay miedo o presión.", "Quedarse callado."], c: 1 },
    { p: "Si estás en peligro inmediato en México, ¿a qué número llamas?", r: ["089", "911", "112"], c: 1 },
    { p: "¿Cuál es el primer paso antes de denunciar?", r: ["Comprar una cámara.", "Guardar silencio.", "Buscar seguridad en un adulto de confianza."], c: 2 },
    { p: "¿Qué institución ofrece apoyo por WhatsApp?", r: ["Consejo Ciudadano / Contacto Joven", "La policía de tránsito", "El hospital"], c: 0 },
    { p: "¿Quién puede denunciar un abuso contra un menor?", r: ["Solo abogados", "Cualquier persona", "Solo la víctima mayor de edad"], c: 1 },
    { p: "¿Qué es la Carpeta de Investigación?", r: ["Registro que identifica tu caso", "Un cuaderno de la escuela", "Una lista de tareas"], c: 0 },
    { p: "¿Qué debes hacer con las pruebas digitales?", r: ["Borrarlas", "No borrarlas y entregarlas", "Cambiarlas"], c: 1 },
    { p: "¿Es necesario tener 'pruebas perfectas' para denunciar?", r: ["Sí, si no no te creen", "No, la autoridad debe investigar", "Solo si es un desconocido"], c: 1 },
    { p: "¿Qué número se usa para denuncia anónima?", r: ["089", "911", "060"], c: 0 },
    { p: "¿Cuál es una señal de alerta de abuso?", r: ["Sacar buenas notas", "Cambios de ánimo o evitar lugares", "Hacer deporte"], c: 1 },
    { p: "¿Qué es una Medida de Protección?", r: ["Que el agresor no se acerque", "Que el niño no salga", "Una multa pequeña"], c: 0 },
    { p: "¿Qué se recomienda llevar al denunciar?", r: ["Juguetes", "Identificación y pruebas", "Ropa nueva"], c: 1 },
    { p: "¿Cómo debe ser el trato al niño en la Fiscalía?", r: ["Rápido", "Muchos interrogatorios", "Con paciencia y pausas"], c: 2 },
    { p: "¿Cuál es un mito sobre contar lo que pasó?", r: ["Que 'rompe familias'", "Que ayuda a protegerte", "Que no es tu culpa"], c: 0 },
    { p: "¿Quién es una opción INSEGURA para pedir ayuda?", r: ["Maestro", "Psicóloga", "Desconocido en internet"], c: 2 },
    { p: "¿Qué costo tiene denunciar?", r: ["Es gratuito", "Depende de las pruebas", "Es una cuota fija"], c: 0 },
    { p: "¿Para qué sirven los informes psicológicos?", r: ["Para ver si miente", "Demostrar el daño emocional", "Dar medicinas"], c: 1 },
    { p: "¿Puedes ir acompañado a denunciar?", r: ["No, solo", "Sí, con un adulto de confianza", "Solo si el juez quiere"], c: 1 },
    { p: "¿Qué pasa si te falta un documento al denunciar?", r: ["Deben recibirte y orientarte", "Te mandan a casa", "Se cancela todo"], c: 0 },
    { p: "¿Cuál es el objetivo de 'Reflexiones' en KIVA?", r: ["Matemáticas", "Expresarse y fortalecer el entorno", "Ver noticias"], c: 1 },
    { p: "¿Qué sentimiento es normal al buscar ayuda?", r: ["Culpa", "Miedo o confusión, pero eres valiente", "Diversión"], c: 1 },
    { p: "¿Qué debe hacer un testigo de abuso?", r: ["Nada", "Reportar lo que sabe", "Investigar por su cuenta"], c: 1 },
    { p: "¿Qué significa 'el silencio no es consentimiento'?", r: ["No decir 'no' no es aceptar", "Hay que estar callado", "Callar es decir sí"], c: 0 },
    { p: "¿A quién contactar en la SEP por acoso?", r: ["Solo al director", "Consejeros Especializados", "Policía vial"], c: 1 },
    { p: "¿Fase donde la policía busca videos y testigos?", r: ["Investigación", "Sentencia", "Registro"], c: 0 },
    { p: "¿Qué derecho fundamental protege KIVA?", r: ["Tener juguetes", "Vivir sin violencia", "Internet libre"], c: 1 },
    { p: "¿Es el abuso culpa de la víctima?", r: ["A veces", "Nunca es culpa del niño", "Solo si no avisó"], c: 1 },
    { p: "¿Qué es una red de apoyo?", r: ["Gente de confianza que te ayuda", "Una red de pescar", "Una red social"], c: 0 },
    { p: "¿Debes guardar un secreto que te hace sentir mal?", r: ["Sí", "No, cuéntalo a un adulto", "Solo si te lo piden"], c: 1 },
    { p: "¿Qué es el maltrato emocional?", r: ["Gritos y humillaciones", "Un abrazo", "Hacer la tarea"], c: 0 },
    { p: "¿A quién pertenece tu cuerpo?", r: ["A tus padres", "A ti mismo", "Al gobierno"], c: 1 },
    { p: "¿Qué es un 'secreto sucio'?", r: ["Sobre una sorpresa", "Uno que da miedo o incomodidad", "Uno que no entiendes"], c: 1 },
    { p: "¿Cómo puedes ayudar a un amigo?", r: ["Diciéndole miedoso", "Acompañándolo a hablar", "Contándolo en redes"], c: 1 },
    { p: "¿Qué es la prevención?", r: ["Actuar antes de que algo pase", "Castigar", "Llorar después"], c: 0 },
    { p: "¿Dónde encontrar información en KIVA?", r: ["Ayuda y Aprende", "Solo juegos", "En ninguna parte"], c: 0 },
    { p: "¿El abuso puede ocurrir en internet?", r: ["No", "Sí, ciberacoso o grooming", "Solo en la calle"], c: 1 },
    { p: "¿Qué es el grooming?", r: ["Un juego", "Engaño de un adulto por internet", "Hacer amigos"], c: 1 },
    { p: "¿Qué significa ser resiliente?", r: ["Rendirse", "Superar dificultades", "No sentir nada"], c: 1 },
    { p: "¿Es importante conocer tus derechos?", r: ["No mucho", "Sí, para protegerte", "Solo para adultos"], c: 1 },
    { p: "¿Qué partes de tu cuerpo son privadas?", r: ["Solo la cara", "Las que cubre el traje de baño", "Ninguna"], c: 1 },
    { p: "¿Qué es un contacto físico incómodo?", r: ["Un choque de manos", "Cualquiera que te haga sentir mal", "Un abrazo de mamá"], c: 1 },
    { p: "¿A quién le puedes decir 'NO'?", r: ["A nadie", "A cualquier persona que te incomode", "Solo a niños"], c: 1 },
    { p: "¿Qué es la línea de ayuda Contacto Joven?", r: ["Apoyo emocional por WhatsApp", "Venta de juegos", "Red social"], c: 0 },
    { p: "¿Qué es el autocuidado?", r: ["Acciones para proteger tu bienestar", "Comer dulces", "Dormir todo el día"], c: 0 },
    { p: "¿Por qué es importante hablar?", r: ["Para meter en problemas", "Para romper el silencio y sanar", "Para ser famoso"], c: 1 },
    { p: "¿KIVA es un lugar seguro?", r: ["Sí, para aprender y saber pedir ayuda", "No", "Es solo para adultos"], c: 0 }
];
/* --- VARIABLES DE CONTROL --- */
let preguntasJuego = [];
let indicePregunta = 0;
let puntosTotales = 0;
let tiempo = 10;
let intervaloTiempo;
let juegoActivo = false;

let bloquesJugador = 0;
let bloquesAgua = 0;
const ALTO_BLOQUE = 41; 

// --- CONFIGURACIÓN DE PUNTOS ---
const multiplicadorPuntos = 1; // Aquí puedes cambiar el valor en el futuro (ej. 2 o 3)
// ------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const btnInicio = document.getElementById('btnInicio');
    const btnInst = document.getElementById('btnInstrucciones');
    const modalInst = document.getElementById('modalInstrucciones');
    const btnCerrarInst = document.getElementById('btnCerrarInst');
    
    // Iniciar Juego
    btnInicio.addEventListener('click', () => {
        document.querySelector('.titulo-juego').classList.add('fade-up');
        btnInicio.classList.add('fade-down');
        document.getElementById('bgBlur').style.filter = "blur(0px)";

        setTimeout(() => {
            document.getElementById('uiStart').style.display = 'none';
            document.getElementById('uiJuego').style.display = 'block';
            iniciarLogicaJuego();
        }, 800);
    });

    // Abrir Instrucciones
    btnInst.onclick = () => {
        modalInst.style.display = 'flex';
    };

    // Cerrar Instrucciones
    btnCerrarInst.onclick = () => {
        modalInst.style.display = 'none';
    };

    // Cerrar modal si se hace clic fuera
    window.onclick = (event) => {
        if (event.target == modalInst) {
            modalInst.style.display = 'none';
        }
    };
});

function iniciarLogicaJuego() {
    juegoActivo = true;
    // Seleccionamos 30 preguntas al azar de la baseDePreguntas
    preguntasJuego = [...baseDePreguntas].sort(() => Math.random() - 0.5).slice(0, 30);
    
    indicePregunta = 0;
    puntosTotales = 0;
    bloquesAgua = 0;
    bloquesJugador = 0;
    
    document.getElementById('platformStack').innerHTML = '';
    
    // El jugador inicia con 3 bloques de ventaja sobre el agua
    agregarBloquesVisuales(3); 
    actualizarPosiciones();
    mostrarPregunta();
}

function mostrarPregunta() {
    if (!juegoActivo) return;
    if (indicePregunta >= 30) {
        finalizarJuego(true);
        return;
    }

    const data = preguntasJuego[indicePregunta];
    document.getElementById('textoPregunta').innerText = data.p;
    document.getElementById('numPregunta').innerText = indicePregunta + 1;
    
    const contenedor = document.getElementById('contenedorOpciones');
    contenedor.innerHTML = '';
    
    data.r.forEach((opcion, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn-opcion';
        btn.innerText = opcion;
        btn.onclick = () => verificarRespuesta(i);
        contenedor.appendChild(btn);
    });

    resetTimer();
}

function resetTimer() {
    clearInterval(intervaloTiempo);
    tiempo = 10;
    actualizarBarraUI();
    intervaloTiempo = setInterval(() => {
        tiempo--;
        actualizarBarraUI();
        if (tiempo <= 0) {
            clearInterval(intervaloTiempo);
            verificarRespuesta(-1);
        }
    }, 1000);
}

function actualizarBarraUI() {
    document.getElementById('timerBar').style.width = (tiempo * 10) + "%";
}

function verificarRespuesta(indiceSeleccionado) {
    if (!juegoActivo) return;
    clearInterval(intervaloTiempo);
    
    const correcta = preguntasJuego[indicePregunta].c;

    if (indiceSeleccionado === correcta) {
        // Lógica corregida: Segundos restantes multiplicados por el valor definido
        let gananciaFinal = tiempo * multiplicadorPuntos;
        
        // Mínimo 1 bloque si acertó justo a tiempo
        if (gananciaFinal <= 0) gananciaFinal = 1;

        puntosTotales += gananciaFinal;
        agregarBloquesVisuales(gananciaFinal);
    }

    // El agua sube 5 bloques en cada turno sin falta
    bloquesAgua += 5;

    actualizarPosiciones();

    // CONDICIÓN DE DERROTA: Agua supera al Jugador
    if (bloquesAgua > bloquesJugador) {
        finalizarJuego(false);
        return;
    }

    if (juegoActivo) {
        indicePregunta++;
        // Actualizamos los textos de puntajes
        document.getElementById('puntosTotales').innerText = bloquesJugador;
        document.getElementById('puntosAgua').innerText = bloquesAgua;
        setTimeout(mostrarPregunta, 800);
    }
}

function agregarBloquesVisuales(cantidad) {
    const stack = document.getElementById('platformStack');
    const colores = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8'];
    
    for (let i = 0; i < cantidad; i++) {
        const b = document.createElement('div');
        b.className = 'bloque';
        b.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
        stack.appendChild(b);
        bloquesJugador++;
    }
}

function actualizarPosiciones() {
    // Actualizar texto del indicador derecho
    document.getElementById('puntosAgua').innerText = bloquesAgua;

    // Ajustar altura del contenedor de agua
    const ocean = document.getElementById('oceanContainer');
    ocean.style.height = (bloquesAgua * ALTO_BLOQUE) + "px";

    // Mover el contenedor "World" para seguir al jugador (Efecto Cámara)
    const world = document.getElementById('world');
    const alturaTotalJugador = bloquesJugador * ALTO_BLOQUE; 
    const puntoVista = window.innerHeight * 0.4; 
    const offset = alturaTotalJugador - puntoVista;

    if (offset > 0) {
        world.style.transform = `translateY(${offset}px)`;
    } else {
        world.style.transform = `translateY(0px)`;
    }
}

function finalizarJuego(victoria) {
    juegoActivo = false;
    clearInterval(intervaloTiempo);
    document.getElementById('uiJuego').style.display = 'none';
    const modal = document.getElementById('uiGameOver');
    if(modal) {
        modal.style.display = 'flex';
        const tituloFin = document.getElementById('gameResultTitle');
        if (victoria) {
            tituloFin.innerText = "¡FELICIDADES, TE SALVASTE!";
            tituloFin.style.color = "#2ed573";
        } else {
            tituloFin.innerText = "¡TE HAS AHOGADO!";
            tituloFin.style.color = "#ff4757";
        }
    }
}