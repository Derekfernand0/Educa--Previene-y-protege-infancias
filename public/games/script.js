const questions = [
{
question: "Si alguien te pide un secreto que te incomoda, ¿qué haces?",
options: [
"Guardarlo porque es adulto",
"Contarlo a alguien de confianza",
"No decir nada nunca"
],
correct: 1
},
{
question: "Alguien pide fotos personales por internet.",
options: [
"Enviar para que no moleste",
"Bloquear y avisar",
"Seguir hablando"
],
correct: 1
},
{
question: "Un abrazo te hace sentir incómodo/a.",
options: [
"Decir NO y contarlo",
"Aguantarte",
"Reír para evitar problema"
],
correct: 0
}
];

let current = 0;
let playerScore = 0;
let botScores = [0,0,0];
let waterLevel = 0;

const playerTower = document.getElementById("playerTower");
const botTowers = [
document.getElementById("bot1Tower"),
document.getElementById("bot2Tower"),
document.getElementById("bot3Tower")
];
const water = document.getElementById("water");

const emojis = ["😎","🤖","👾","🔥","🧠","😺","👽"];
document.getElementById("bot1Profile").textContent = randomEmoji();
document.getElementById("bot2Profile").textContent = randomEmoji();
document.getElementById("bot3Profile").textContent = randomEmoji();

function randomEmoji(){
return emojis[Math.floor(Math.random()*emojis.length)];
}

function loadQuestion(){
let q = questions[current];
document.getElementById("question").textContent = q.question;
document.querySelectorAll(".options button").forEach((btn,i)=>{
btn.textContent = q.options[i];
});
}

function selectAnswer(index){
let q = questions[current];

if(index === q.correct){
playerScore++;
}

playerTower.style.height = (playerScore*40)+"px";

// Bots
botScores = botScores.map((score,i)=>{
let choice = Math.random()<0.6 ? q.correct : Math.floor(Math.random()*3);
if(choice === q.correct) score++;
botTowers[i].style.height = (score*40)+"px";
return score;
});

// Subir agua
waterLevel += 30;
water.style.height = waterLevel+"px";

checkLose();
nextRound();
}

function nextRound(){
current++;
if(current >= questions.length){
current = 0;
}
loadQuestion();
}

function checkLose(){
if(waterLevel > playerScore*40){
alert("🌊 El agua te alcanzó. Sigue aprendiendo 💛");
location.reload();
}
}

function toggleCanvas(){
let panel = document.getElementById("canvasPanel");
if(panel.style.right === "0px"){
panel.style.right = "-250px";
}else{
panel.style.right = "0px";
}
}

// DIBUJO
const drawCanvas = document.getElementById("drawCanvas");
const ctx = drawCanvas.getContext("2d");
let drawing=false;

drawCanvas.addEventListener("mousedown",()=>drawing=true);
drawCanvas.addEventListener("mouseup",()=>drawing=false);
drawCanvas.addEventListener("mousemove",draw);

function draw(e){
if(!drawing) return;
ctx.lineWidth=3;
ctx.lineCap="round";
ctx.strokeStyle="black";
ctx.lineTo(e.offsetX,e.offsetY);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(e.offsetX,e.offsetY);
}

function clearCanvas(){
ctx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
}

setInterval(()=>{
const profileCanvas = document.getElementById("profileCanvas");
const pctx = profileCanvas.getContext("2d");
pctx.clearRect(0,0,60,60);
pctx.drawImage(drawCanvas,0,0,60,60);
},1000);

loadQuestion();
