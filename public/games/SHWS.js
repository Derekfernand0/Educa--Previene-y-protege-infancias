const CLIENTES_DB = [
    {
        id: "pp1", tipo: "bueno", imagen: "../iconos/shawarma/ppl/pp1.png",
        preguntas: [
            { q: "¿Cómo estás hoy?", a: "Un poco cansado, pero con mucha hambre." },
            { q: "¿Qué tal el trabajo?", a: "Mucho movimiento hoy, por fin salí de mi turno." },
            { q: "¿Para llevar?", a: "Sí, por favor, me espera mi esposa en casa." }
        ],
        error: "Este hombre solo tenía hambre tras un largo día de trabajo."
    },
    {
        id: "pp2", tipo: "bueno", imagen: "../iconos/shawarma/ppl/pp2.png",
        preguntas: [
            { q: "¿Vienes de la escuela?", a: "No, acabo de salir de mi clase de yoga." },
            { q: "¿Te gusta el picante?", a: "Un poco está bien, me gusta el sabor fuerte." },
            { q: "¿Vives por aquí?", a: "Sí, a tres cuadras, soy vecina del barrio hace años." }
        ],
        error: "Era una vecina del barrio. No había nada sospechoso en ella."
    },
    {
        id: "pp3", tipo: "malo", imagen: "../iconos/shawarma/ppl/pp3.png",
        preguntas: [
            { q: "¿Esperas a alguien?", a: "A un niño... me dijo por chat que vendría a esta hora." },
            { q: "¿Lo conoces de antes?", a: "No en persona, pero hablamos mucho por el juego de cubos." },
            { q: "¿Saben sus padres?", a: "No, es un secreto entre nosotros dos." }
        ],
        exito: "¡Bien hecho! Citar menores por chats de juegos es una alerta clara de Grooming.",
        error: "Atendiste a alguien que estaba captando a un menor por internet. ¡Cuidado!"
    },
    {
        id: "pp4", tipo: "bueno", imagen: "../iconos/shawarma/ppl/pp4.png",
        preguntas: [
            { q: "¿Algún ingrediente extra?", a: "Ponle mucha cebolla, me encanta." },
            { q: "¿Día pesado?", a: "Un poco, pero el clima está excelente para caminar." },
            { q: "¿Mucho trabajo?", a: "Por suerte sí, el negocio de carpintería va bien." }
        ],
        error: "El carpintero del barrio solo quería cenar. No era una amenaza."
    },
    {
        id: "pp5", tipo: "malo", imagen: "../iconos/shawarma/ppl/pp5.png",
        preguntas: [
            { q: "¿Buscas alguna dirección?", a: "No, solo espero a que los niños salgan del colegio de enfrente." },
            { q: "¿Vienes por tu hijo?", a: "No tengo hijos, solo me gusta observar a qué hora caminan solos." },
            { q: "¿Vives cerca?", a: "No, vengo de otro distrito solo para esto." }
        ],
        exito: "¡Correcto! Vigilar horarios de menores sin motivo es una conducta de alto riesgo.",
        error: "Ese sujeto estaba vigilando a menores que caminan solos. ¡Debiste reportarlo!"
    },
    {
        id: "pp6", tipo: "bueno", imagen: "../iconos/shawarma/ppl/pp6.png",
        preguntas: [
            { q: "¿Qué tal el día?", a: "Muy productivo, acabo de terminar mi turno en la biblioteca." },
            { q: "¿Te gusta el shawarma?", a: "Es mi comida favorita desde que era niña." },
            { q: "¿Vas a casa?", a: "Sí, a ver una película con mis amigas." }
        ],
        error: "Era una bibliotecaria joven. No cometió ninguna falta."
    },
    {
        id: "pp7", tipo: "malo", imagen: "../iconos/shawarma/ppl/pp7.png",
        preguntas: [
            { q: "¿A quién esperas?", a: "A una chica, le dije que si venía conmigo le daría un pase VIP para el concierto." },
            { q: "¿Eres promotor?", a: "Algo así, prefiero hablar con ellas cuando no hay adultos cerca." },
            { q: "¿Tienes oficina?", a: "No, prefiero hacer mis 'negocios' aquí en la calle." }
        ],
        exito: "¡Excelente! Ofrecer regalos costosos a menores a cambio de ir a lugares solos es captación.",
        error: "Esa mujer estaba usando carnadas para atraer adolescentes. ¡Peligro!"
    },
    {
        id: "pp8", tipo: "bueno", imagen: "../iconos/shawarma/ppl/pp8.png",
        preguntas: [
            { q: "¿Cómo está, señor?", a: "Muy bien, disfrutando de mi jubilación." },
            { q: "¿Mucho calor?", a: "Para nada, el viento está refrescante hoy." },
            { q: "¿Va para su casa?", a: "Sí, a alimentar a mis gatitos." }
        ],
        error: "El anciano solo disfrutaba de su tarde. Mal reporte."
    },
    {
        id: "pp9", tipo: "malo", imagen: "../iconos/shawarma/ppl/pp9.png",
        preguntas: [
            { q: "¿Buscas a alguien?", a: "A mi sobrina... o eso le dije al guardia para que me dejara pasar." },
            { q: "¿No es tu sobrina?", a: "Es una amiga de internet, pero si digo eso no me dejan verla." },
            { q: "¿Qué vas a hacer?", a: "Llevarla a dar una vuelta en mi auto sin que sus padres se enteren." }
        ],
        exito: "¡Muy bien! Mentir sobre el parentesco para sacar a un menor de su entorno es señal de secuestro.",
        error: "Esa persona intentaba engañar a una menor para subirla a un auto. ¡Muy peligroso!"
    }
];

let vidas = 3;
let mazo = [];
let clienteActual = null;
let pasoPrep = 0;
let clientesAtendidosCount = 0;
let estado = "intro";

const UI = {
    clientImg: document.getElementById('client-img'),
    qList: document.getElementById('questions-list'),
    qPanel: document.getElementById('questions-panel'),
    bubble: document.getElementById('speech-bubble'),
    table: document.getElementById('main-table'),
    shawarma: document.getElementById('final-shawarma'),
    gate: document.getElementById('gate'),
    lives: document.getElementById('lives-container'),
    count: document.getElementById('clients-count'),
    overlay: document.getElementById('msg-overlay'),
    msgTit: document.getElementById('msg-title'),
    msgTxt: document.getElementById('msg-text'),
    btnCont: document.getElementById('btn-continuar'),
    btnRein: document.getElementById('btn-reiniciar'),
    flash: document.getElementById('damage-flash')
};

// INICIO
document.getElementById('btn-jugar').onclick = () => {
    document.getElementById('intro-screen').classList.add('hidden');
    document.getElementById('game-interface').classList.remove('hidden');
    
    // Preparar mazo: 3 buenos y 6 malos (para completar 9 o repetir hasta 10)
    let buenos = CLIENTES_DB.filter(c => c.tipo === "bueno").sort(() => Math.random() - 0.5).slice(0, 3);
    let malos = CLIENTES_DB.filter(c => c.tipo === "malo").sort(() => Math.random() - 0.5).slice(0, 7);
    mazo = [...buenos, ...malos].sort(() => Math.random() - 0.5);
    
    actualizarVidas();
    proximoCliente();
};

function proximoCliente() {
    if(clientesAtendidosCount >= 10 || mazo.length === 0) {
        finalizarJuego("¡VICTORIA!", "Has completado tu turno protegiendo a los menores de la zona con éxito.", true);
        return;
    }

    limpiarEscena();
    clienteActual = mazo.pop();
    UI.clientImg.src = clienteActual.imagen;
    UI.clientImg.classList.add('active');
    
    // Generar preguntas
    UI.qList.innerHTML = "";
    clienteActual.preguntas.forEach(p => {
        let btn = document.createElement('button');
        btn.className = "btn-q";
        btn.innerText = p.q;
        btn.onclick = () => {
            UI.bubble.innerText = p.a;
            UI.bubble.classList.remove('hidden');
        };
        UI.qList.appendChild(btn);
    });

    UI.qPanel.classList.remove('hidden');
    estado = "activo";
}

function limpiarEscena() {
    pasoPrep = 0;
    UI.table.src = "../iconos/shawarma/ingredientes/swtb.png";
    UI.shawarma.classList.add('hidden');
    UI.bubble.classList.add('hidden');
    UI.qPanel.classList.add('hidden');
    UI.clientImg.classList.remove('active');
}

// DRAG AND DROP
document.querySelectorAll('.ing').forEach(i => {
    i.ondragstart = (e) => e.dataTransfer.setData("ing", e.target.dataset.type);
});

UI.table.parentElement.ondragover = (e) => e.preventDefault();
UI.table.parentElement.ondrop = (e) => {
    const orden = ["tortilla", "salsa", "verdura", "carne"];
    if(e.dataTransfer.getData("ing") === orden[pasoPrep]) {
        pasoPrep++;
        UI.table.src = `../iconos/shawarma/ingredientes/swtb${pasoPrep}.png`;
        if(pasoPrep === 4) UI.shawarma.classList.remove('hidden');
    }
};

UI.shawarma.ondragstart = (e) => e.dataTransfer.setData("item", "wrap");
UI.clientImg.ondragover = (e) => e.preventDefault();
UI.clientImg.ondrop = (e) => {
    if(e.dataTransfer.getData("item") === "wrap" && estado === "activo") {
        if(clienteActual.tipo === "malo") {
            quitarVida(clienteActual.error);
        } else {
            exito("¡Gracias! Buen servicio.");
        }
    }
};

// BOTON DENUNCIA
document.getElementById('btn-denunciar').onclick = () => {
    if(estado !== "activo") return;
    if(clienteActual.tipo === "malo") {
        UI.gate.classList.replace('gate-up', 'gate-down');
        setTimeout(() => {
            exito(clienteActual.exito);
            UI.gate.classList.replace('gate-down', 'gate-up');
        }, 800);
    } else {
        quitarVida(clienteActual.error);
    }
};

function quitarVida(txt) {
    vidas--;
    actualizarVidas();
    UI.flash.style.opacity = 1;
    setTimeout(() => UI.flash.style.opacity = 0, 300);
    if(vidas > 0) popUp("¡Cuidado!", txt, false);
}

function exito(txt) {
    clientesAtendidosCount++;
    UI.count.innerText = clientesAtendidosCount;
    popUp("Buen trabajo", txt, false);
}

function popUp(tit, txt, fin) {
    estado = "pausa";
    UI.msgTit.innerText = tit;
    UI.msgTxt.innerText = txt;
    UI.overlay.classList.remove('hidden');
    if(fin) {
        UI.btnCont.classList.add('hidden');
        UI.btnRein.classList.remove('hidden');
    }
}

UI.btnCont.onclick = () => {
    UI.overlay.classList.add('hidden');
    proximoCliente();
};

UI.btnRein.onclick = () => location.reload();

function actualizarVidas() {
    UI.lives.innerHTML = "❤️".repeat(vidas);
    if(vidas <= 0) finalizarJuego("PARTIDA TERMINADA", "No lograste identificar las amenazas a tiempo.", true);
}

function finalizarJuego(tit, txt) {
    popUp(tit, txt, true);
}