// ==========================================
// 1. BASE DE DATOS DE CLIENTES
// ==========================================
// Fácil de expandir agregando nuevos objetos aquí.
const BASE_CLIENTES = [
    // CLIENTES BUENOS (Mínimo 4 para asegurar variedad al elegir 3)
    { id: 1, imagen: '../iconos/shawarma/ppl/pp1.png', tipo: 'bueno', dificultad: 'obvia', 
      preguntas: [{ id: 1, texto: "¿Cómo estás hoy?", respuesta: "Muy bien, salí de la escuela y tengo hambre." }],
      mensajesError: { siFueAtendido: "¡Gracias, está delicioso!", siFueDenunciado: "Oh no, el cliente solo quería comer. Ten cuidado, juzgar mal también afecta." }
    },
    { id: 2, imagen: '../iconos/shawarma/ppl/pp2.png', tipo: 'bueno', dificultad: 'sutil', 
      preguntas: [{ id: 1, texto: "¿Vienes solo?", respuesta: "Sí, mi mamá me espera en el auto de enfrente." }],
      mensajesError: { siFueAtendido: "¡Qué rico, gracias!", siFueDenunciado: "Te precipitaste. No había indicios de riesgo reales." }
    },
    { id: 3, imagen: '../iconos/shawarma/ppl/pp1.png', tipo: 'bueno', dificultad: 'obvia', 
      preguntas: [{ id: 1, texto: "¿Qué tal el día?", respuesta: "Normal, jugando fútbol con mis amigos." }],
      mensajesError: { siFueAtendido: "¡Gracias maestro!", siFueDenunciado: "Esa persona no representaba un peligro. Observa mejor." }
    },
    { id: 4, imagen: '../iconos/shawarma/ppl/pp2.png', tipo: 'bueno', dificultad: 'sutil', 
      preguntas: [{ id: 1, texto: "¿Mucho calor hoy?", respuesta: "Sí, uf. Vine corriendo desde mi casa." }],
      mensajesError: { siFueAtendido: "Justo lo que necesitaba.", siFueDenunciado: "Una falsa alarma. Evalúa con calma las respuestas." }
    },
    // CLIENTES MALOS (Comportamiento sospechoso de violencia/acoso. Mínimo 8 para elegir 7)
    { id: 5, imagen: '../iconos/shawarma/ppl/pp1.png', tipo: 'malo', dificultad: 'obvia', 
      preguntas: [{ id: 1, texto: "¿A quién esperas?", respuesta: "A un niño que conocí por internet, le dije que le daría regalos." }],
      mensajesError: { siFueAtendido: "Atendiste a alguien peligroso. Identificar estas señales a tiempo protege a los demás.", siFueDenunciado: "¡Bien hecho! Citar a menores por internet ofreciendo regalos es una señal de grooming." }
    },
    { id: 6, imagen: '../iconos/shawarma/ppl/pp2.png', tipo: 'malo', dificultad: 'sutil', 
      preguntas: [{ id: 1, texto: "¿Llevas prisa?", respuesta: "Sí, estoy siguiendo a ese grupo de estudiantes, quiero tomarles unas fotos sin que me vean." }],
      mensajesError: { siFueAtendido: "Ignoraste una señal clave. Tomar fotos a menores a escondidas es acoso.", siFueDenunciado: "¡Excelente! Has prevenido una situación de acoso." }
    },
    // Nota: Agrega los clientes malos restantes (hasta tener 8 o más en total en la DB) siguiendo esta misma estructura.
    { id: 7, imagen: '../iconos/shawarma/ppl/pp1.png', tipo: 'malo', dificultad: 'obvia', preguntas: [{ id: 1, texto: "¿Te ayudo con algo?", respuesta: "No, solo observo a qué hora salen los niños solos del colegio." }], mensajesError: { siFueAtendido: "Vigilar los horarios de menores solos es una alerta grave.", siFueDenunciado: "¡Muy bien! Actuaste frente a una conducta muy sospechosa." } },
    { id: 8, imagen: '../iconos/shawarma/ppl/pp2.png', tipo: 'malo', dificultad: 'sutil', preguntas: [{ id: 1, texto: "¿Busca a alguien?", respuesta: "Sí, le envié mensajes a una niña pidiéndole fotos, vengo a ver si llegó." }], mensajesError: { siFueAtendido: "Pedir fotos a menores es violencia digital.", siFueDenunciado: "¡Correcto! Bloquear y reportar este acoso es fundamental." } },
    { id: 9, imagen: '../iconos/shawarma/ppl/pp1.png', tipo: 'malo', dificultad: 'obvia', preguntas: [{ id: 1, texto: "¿Todo bien?", respuesta: "Sí, le dije a un niño que si no viene conmigo lastimaré a su perro." }], mensajesError: { siFueAtendido: "El chantaje y las amenazas son formas de coerción.", siFueDenunciado: "¡Gran trabajo! Denunciar estas amenazas salva vidas." } },
    { id: 10, imagen: '../iconos/shawarma/ppl/pp2.png', tipo: 'malo', dificultad: 'sutil', preguntas: [{ id: 1, texto: "¿Para llevar?", respuesta: "Sí, para un chico de secundaria. Le dije que no le cuente a sus padres de nuestra amistad." }], mensajesError: { siFueAtendido: "Exigir secretos a un menor sobre amistades adultas es manipulación.", siFueDenunciado: "¡Detectaste la manipulación! Los secretos entre adultos y niños son alertas." } },
    { id: 11, imagen: '../iconos/shawarma/ppl/pp1.png', tipo: 'malo', dificultad: 'obvia', preguntas: [{ id: 1, texto: "¿Disfrutando la tarde?", respuesta: "Buscando niños para invitarlos a mi camioneta." }], mensajesError: { siFueAtendido: "Dejaste pasar un intento de sustracción.", siFueDenunciado: "¡Denuncia rápida! Salvaste a alguien de un peligro inminente." } },
];

// ==========================================
// 2. VARIABLES GLOBALES Y ESTADO
// ==========================================
let estadoJuego = 'intro'; // intro, jugando, cliente_entrando, cliente_activo, cliente_saliendo, victoria, derrota
let vidas = 3;
let clientesPartida = [];
let clienteActualIndex = 0;
let pasoIngrediente = 0; // 0: nada, 1: tortilla, 2: salsa, 3: verdura, 4: carne

// Referencias del DOM
const DOM = {
    introScreen: document.getElementById('intro-screen'),
    btnJugar: document.getElementById('btn-jugar'),
    logo: document.getElementById('logo'),
    gameUi: document.getElementById('game-ui'),
    clientImg: document.getElementById('client-img'),
    dialogueBubble: document.getElementById('dialogue-bubble'),
    questionsContainer: document.getElementById('questions-container'),
    btnDenunciar: document.getElementById('btn-denunciar'),
    gate: document.getElementById('gate'),
    livesContainer: document.getElementById('lives-container'),
    prepTable: document.getElementById('preparation-table'),
    tableArea: document.getElementById('table-area'),
    finalShawarma: document.getElementById('final-shawarma'),
    damageOverlay: document.getElementById('damage-overlay'),
    messageOverlay: document.getElementById('message-overlay'),
    msgTitle: document.getElementById('message-title'),
    msgText: document.getElementById('message-text'),
    btnNext: document.getElementById('btn-next'),
    btnRestart: document.getElementById('btn-restart'),
    btnMenu: document.getElementById('btn-menu'),
    draggables: document.querySelectorAll('.draggable-ing')
};

// ==========================================
// 3. INICIALIZACIÓN
// ==========================================
DOM.btnJugar.addEventListener('click', iniciarTransicionIntro);
DOM.btnNext.addEventListener('click', continuarDespuesMensaje);
DOM.btnRestart.addEventListener('click', () => location.reload());
DOM.btnDenunciar.addEventListener('click', manejarDenuncia);
DOM.tableArea.addEventListener('click', generarShawarmaFinal);

function iniciarTransicionIntro() {
    DOM.logo.classList.add('slide-up');
    DOM.btnJugar.classList.add('slide-down');
    DOM.introScreen.classList.add('fade-out');
    
    setTimeout(() => {
        DOM.introScreen.classList.add('hidden');
        DOM.gameUi.classList.remove('hidden');
        iniciarPartida();
    }, 1000);
}

function iniciarPartida() {
    vidas = 3;
    clienteActualIndex = 0;
    actualizarVidas();
    generarMazoClientes();
    siguienteCliente();
}

function generarMazoClientes() {
    // Filtrar, mezclar y tomar 3 buenos y 7 malos
    let buenos = BASE_CLIENTES.filter(c => c.tipo === 'bueno').sort(() => 0.5 - Math.random()).slice(0, 3);
    let malos = BASE_CLIENTES.filter(c => c.tipo === 'malo').sort(() => 0.5 - Math.random()).slice(0, 7);
    
    // Unir y mezclar la partida
    clientesPartida = [...buenos, ...malos].sort(() => 0.5 - Math.random());
}

function actualizarVidas() {
    DOM.livesContainer.innerHTML = '';
    for(let i=0; i<vidas; i++) {
        let heart = document.createElement('span');
        heart.className = 'heart';
        heart.innerText = '❤️';
        DOM.livesContainer.appendChild(heart);
    }
}

function perderVida(mensajeTexto) {
    vidas--;
    actualizarVidas();
    
    // Animación de daño
    DOM.damageOverlay.style.opacity = 1;
    setTimeout(() => DOM.damageOverlay.style.opacity = 0, 500);

    if(vidas <= 0) {
        mostrarMensaje("Fin del juego", mensajeTexto + " Te has quedado sin vidas.", true);
        estadoJuego = 'derrota';
    } else {
        mostrarMensaje("Cuidado", mensajeTexto, false);
    }
}

// ==========================================
// 4. CICLO DEL CLIENTE
// ==========================================
function siguienteCliente() {
    if (clienteActualIndex >= clientesPartida.length) {
        mostrarMensaje("¡Turno terminado!", "Has completado la jornada demostrando gran empatía y atención.", true);
        return;
    }

    estadoJuego = 'cliente_entrando';
    let cliente = clientesPartida[clienteActualIndex];
    
    // Resetear UI
    limpiarMesa();
    DOM.dialogueBubble.classList.add('hidden');
    DOM.questionsContainer.innerHTML = '';
    DOM.btnDenunciar.classList.add('hidden');
    
    // Animar entrada
    DOM.clientImg.src = cliente.imagen;
    DOM.clientImg.className = ''; // Quitar clases viejas
    setTimeout(() => {
        DOM.clientImg.classList.add('slide-in');
        setTimeout(() => {
            estadoJuego = 'cliente_activo';
            DOM.btnDenunciar.classList.remove('hidden');
            mostrarPreguntas(cliente);
        }, 1000); // Tiempo de animación CSS
    }, 50);
}

function mostrarPreguntas(cliente) {
    DOM.questionsContainer.classList.remove('hidden');
    cliente.preguntas.forEach(p => {
        let btn = document.createElement('button');
        btn.innerText = p.texto;
        btn.className = 'btn-pregunta';
        btn.onclick = () => {
            DOM.dialogueBubble.innerText = p.respuesta;
            DOM.dialogueBubble.classList.remove('hidden');
        };
        DOM.questionsContainer.appendChild(btn);
    });
}

function retirarCliente(esDenuncia) {
    estadoJuego = 'cliente_saliendo';
    DOM.btnDenunciar.classList.add('hidden');
    DOM.questionsContainer.classList.add('hidden');
    DOM.dialogueBubble.classList.add('hidden');

    if(esDenuncia) {
        // Animación Reja
        DOM.gate.classList.remove('gate-up');
        DOM.gate.classList.add('gate-down');
        setTimeout(() => {
            DOM.clientImg.classList.add('slide-out'); // Cliente se va oculto
            setTimeout(() => {
                DOM.gate.classList.remove('gate-down');
                DOM.gate.classList.add('gate-up');
                clienteActualIndex++;
                siguienteCliente();
            }, 1000);
        }, 1500);
    } else {
        // Salida normal lateral
        DOM.clientImg.classList.replace('slide-in', 'slide-out');
        setTimeout(() => {
            clienteActualIndex++;
            siguienteCliente();
        }, 1000);
    }
}

// ==========================================
// 5. SISTEMA DE SHAWARMA (DRAG & DROP)
// ==========================================
DOM.draggables.forEach(ing => {
    ing.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('tipo', e.target.dataset.type);
    });
});

DOM.tableArea.addEventListener('dragover', (e) => e.preventDefault());

DOM.tableArea.addEventListener('drop', (e) => {
    e.preventDefault();
    if (estadoJuego !== 'cliente_activo') return;
    
    const tipo = e.dataTransfer.getData('tipo');
    procesarIngrediente(tipo);
});

function procesarIngrediente(tipo) {
    // Orden lógico: tortilla(1) -> salsa(2) -> verdura(3) -> carne(4)
    if (tipo === 'tortilla' && pasoIngrediente === 0) {
        pasoIngrediente = 1;
        DOM.prepTable.src = '../iconos/shawarma/ingredientes/swtb1.png';
    } else if (tipo === 'salsa' && pasoIngrediente === 1) {
        pasoIngrediente = 2;
        DOM.prepTable.src = '../iconos/shawarma/ingredientes/swtb2.png';
    } else if (tipo === 'verdura' && pasoIngrediente === 2) {
        pasoIngrediente = 3;
        DOM.prepTable.src = '../iconos/shawarma/ingredientes/swtb3.png';
    } else if (tipo === 'carne' && pasoIngrediente === 3) {
        pasoIngrediente = 4;
        DOM.prepTable.src = '../iconos/shawarma/ingredientes/swtb4.png';
    }
}

function generarShawarmaFinal() {
    if(pasoIngrediente === 4) {
        DOM.prepTable.src = '../iconos/shawarma/ingredientes/swtb.png'; // Vacía
        DOM.finalShawarma.classList.remove('hidden');
        pasoIngrediente = 5; // Listo para entregar
    }
}

// Entregar al cliente
DOM.finalShawarma.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('item', 'shawarma');
});

DOM.clientImg.addEventListener('dragover', (e) => e.preventDefault());

DOM.clientImg.addEventListener('drop', (e) => {
    e.preventDefault();
    const item = e.dataTransfer.getData('item');
    if(item === 'shawarma' && estadoJuego === 'cliente_activo') {
        DOM.finalShawarma.classList.add('hidden');
        evaluarAtencion();
    }
});

function limpiarMesa() {
    pasoIngrediente = 0;
    DOM.prepTable.src = '../iconos/shawarma/ingredientes/swtb.png';
    DOM.finalShawarma.classList.add('hidden');
}

// ==========================================
// 6. LÓGICA DE DECISIONES Y MENSAJES
// ==========================================
function evaluarAtencion() {
    let cliente = clientesPartida[clienteActualIndex];
    if(cliente.tipo === 'bueno') {
        // Correcto
        DOM.dialogueBubble.innerText = cliente.mensajesError.siFueAtendido;
        DOM.dialogueBubble.classList.remove('hidden');
        setTimeout(() => retirarCliente(false), 2000);
    } else {
        // Incorrecto (Atendió a un malo)
        perderVida(cliente.mensajesError.siFueAtendido);
        // El cliente se va después de cerrar el modal de perder vida
    }
}

function manejarDenuncia() {
    if(estadoJuego !== 'cliente_activo') return;
    
    let cliente = clientesPartida[clienteActualIndex];
    if(cliente.tipo === 'malo') {
        // Correcto
        mostrarMensaje("¡Acción Preventiva!", cliente.mensajesError.siFueDenunciado, false);
        // La reja baja después del mensaje
    } else {
        // Incorrecto (Denunció a un bueno)
        perderVida(cliente.mensajesError.siFueDenunciado);
    }
}

function mostrarMensaje(titulo, texto, esFinDeJuego) {
    estadoJuego = 'error'; // Pausa la interacción de juego
    DOM.msgTitle.innerText = titulo;
    DOM.msgText.innerText = texto;
    DOM.messageOverlay.classList.remove('hidden');
    
    if(esFinDeJuego) {
        DOM.btnNext.classList.add('hidden');
        DOM.btnRestart.classList.remove('hidden');
        DOM.btnMenu.classList.remove('hidden');
    } else {
        DOM.btnNext.classList.remove('hidden');
        DOM.btnRestart.classList.add('hidden');
        DOM.btnMenu.classList.add('hidden');
    }
}

function continuarDespuesMensaje() {
    DOM.messageOverlay.classList.add('hidden');
    let cliente = clientesPartida[clienteActualIndex];
    
    // Si se denunció a un malo exitosamente, o si perdimos vida, el cliente se va.
    if(cliente.tipo === 'malo' && DOM.msgTitle.innerText === "¡Acción Preventiva!") {
        retirarCliente(true);
    } else {
        retirarCliente(false);
    }
}