// Configuración de Datos de Clientes
const CUSTOMERS_DATA = [
    { id: 1, type: 'good', img: '../iconos/shawarma/ppl/pp1.png', questions: ["¿Me das un shawarma?", "¿Tienes comida?", "¡Tengo hambre!"] },
    { id: 2, type: 'good', img: '../iconos/shawarma/ppl/pp2.png', questions: ["El mejor sitio de la ciudad", "Ponle de todo", "¿Me atiendes?"] },
    { id: 3, type: 'good', img: '../iconos/shawarma/ppl/pp3.png', questions: ["Hola, uno para llevar", "Qué bien huele", "Buenas tardes"] },
    { id: 4, type: 'bad', img: '../iconos/shawarma/ppl/pp4.png', questions: ["Dame el dinero de la caja", "Vengo a clausurar esto", "No me gusta tu cara"] },
    { id: 5, type: 'bad', img: '../iconos/shawarma/ppl/pp5.png', questions: ["¡Esto es un asalto!", "Vengo a por problemas", "¡Fuera de aquí!"] },
    { id: 6, type: 'bad', img: '../iconos/shawarma/ppl/pp6.png', questions: ["¿Me das veneno?", "¿Aceptas billetes falsos?", "Voy a ensuciar todo"] },
    { id: 7, type: 'bad', img: '../iconos/shawarma/ppl/pp7.png', questions: ["¡Qué asco de sitio!", "No me mires así", "¿Quieres pelear?"] },
    { id: 8, type: 'bad', img: '../iconos/shawarma/ppl/pp8.png', questions: ["Llama a la policía, me da igual", "Dame un shawarma... gratis", "Hueles raro"] },
    { id: 9, type: 'bad', img: '../iconos/shawarma/ppl/pp9.png', questions: ["¡PUM!", "Me llevaré todo sin pagar", "¿Dónde está el jefe?"] },
    { id: 10, type: 'bad', img: '../iconos/shawarma/ppl/pp10.png', questions: ["¡Rápido o te arrepentirás!", "Soy peligroso", "Abre la caja"] }
];

// Estado del Juego
let gameState = {
    lives: 3,
    score: 0,
    currentCustomer: null,
    prepStep: 0, // 0 a 4
    attended: [],
    isGameOver: false
};

// Elementos del DOM
const dom = {
    customerImg: document.getElementById('customer-img'),
    dialogueBox: document.getElementById('dialogue-box'),
    dialogueText: document.getElementById('dialogue-text'),
    tableImg: document.getElementById('table-img'),
    livesContainer: document.getElementById('lives-container'),
    scoreDisplay: document.getElementById('score-display'),
    overlay: document.getElementById('overlay'),
    btnStart: document.getElementById('btn-start'),
    modalTitle: document.getElementById('modal-title'),
    modalDesc: document.getElementById('modal-desc')
};

// Inicialización
function init() {
    updateUI();
    dom.btnStart.addEventListener('click', startGame);
    
    // Eventos de ingredientes
    document.querySelectorAll('.ing-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleIngredient(e.target.dataset.ing));
    });

    // Evento de denuncia
    document.getElementById('btn-report').addEventListener('click', handleReport);
    
    document.getElementById('btn-exit').addEventListener('click', () => location.reload());
    document.getElementById('btn-instr').addEventListener('click', () => {
        alert("Atiende a los BUENOS (haciendo el shawarma en orden) y denuncia a los MALOS (botón rojo).");
    });
}

function startGame() {
    gameState = { lives: 3, score: 0, currentCustomer: null, prepStep: 0, attended: [], isGameOver: false };
    dom.overlay.classList.add('hidden');
    nextCustomer();
}

function updateUI() {
    dom.livesContainer.innerHTML = "❤️".repeat(gameState.lives);
    dom.scoreDisplay.innerText = `Clientes: ${gameState.score}/10`;
}

function nextCustomer() {
    if (gameState.attended.length >= 10 || gameState.lives <= 0) {
        endGame();
        return;
    }

    // Reset de mesa
    gameState.prepStep = 0;
    dom.tableImg.src = `../iconos/shawarma/ingredientes/swtb.png`;

    // Selección aleatoria de cliente no repetido
    let available = CUSTOMERS_DATA.filter(c => !gameState.attended.includes(c.id));
    let randomIdx = Math.floor(Math.random() * available.length);
    gameState.currentCustomer = available[randomIdx];
    gameState.attended.push(gameState.currentCustomer.id);

    // Mostrar visualmente
    dom.customerImg.src = gameState.currentCustomer.img;
    dom.customerImg.classList.remove('hidden');
    dom.dialogueBox.classList.remove('hidden');
    
    let randomQ = Math.floor(Math.random() * gameState.currentCustomer.questions.length);
    dom.dialogueText.innerText = gameState.currentCustomer.questions[randomQ];
}

function handleIngredient(id) {
    if (!gameState.currentCustomer || gameState.isGameOver) return;

    if (gameState.currentCustomer.type === 'good') {
        const nextStep = gameState.prepStep + 1;
        if (parseInt(id) === nextStep) {
            gameState.prepStep = nextStep;
            dom.tableImg.src = `../iconos/shawarma/ingredientes/swtb${nextStep}.png`;
            
            if (gameState.prepStep === 4) {
                // Shawarma terminado
                gameState.score++;
                showFeedback("¡Delicioso!", true);
            }
        } else {
            showFeedback("¡Orden incorrecto!", false);
        }
    } else {
        showFeedback("¡Es un criminal! ¡No le cocines!", false);
    }
}

function handleReport() {
    if (!gameState.currentCustomer || gameState.isGameOver) return;

    if (gameState.currentCustomer.type === 'bad') {
        gameState.score++;
        showFeedback("¡Policía avisada!", true);
    } else {
        showFeedback("¡Has denunciado a un inocente!", false);
    }
}

function showFeedback(msg, isPositive) {
    dom.dialogueText.innerText = msg;
    if (!isPositive) {
        gameState.lives--;
    }
    updateUI();
    
    setTimeout(() => {
        if (gameState.lives > 0) nextCustomer();
        else endGame();
    }, 1500);
}

function endGame() {
    gameState.isGameOver = true;
    dom.overlay.classList.remove('hidden');
    dom.modalTitle.innerText = gameState.lives > 0 ? "¡GANASTE!" : "GAME OVER";
    dom.modalDesc.innerText = `Atendiste correctamente a ${gameState.score} clientes.`;
    dom.btnStart.innerText = "REINTENTAR";
}

init();