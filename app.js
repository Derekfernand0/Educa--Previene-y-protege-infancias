/* ===========================
   Helpers & Estado
   =========================== */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const state = {
  theme: localStorage.getItem("theme") || "light",
  narrator: false,
  narratorAutoTried: false,
  route: "home"
};

/* ===========================
   Router SPA (hash #/ruta)
   =========================== */
function setRoute(r){
  state.route = r || "home";
  $$(".view").forEach(v => v.classList.toggle("active", v.dataset.route === state.route));
  $$(".topnav-item").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#/${state.route}`));
  // mover foco al contenedor para accesibilidad
  $("#app")?.focus({preventScroll:true});
}
function readRouteFromHash(){
  const m = location.hash.match(/^#\/([\w-]+)/);
  setRoute(m ? m[1] : "home");
}
addEventListener("hashchange", readRouteFromHash);
readRouteFromHash();

/* Enlaces con data-go para CTA */
document.addEventListener("click", (e)=>{
  const go = e.target.closest("[data-go]");
  if (go) { location.hash = `#/${go.dataset.go}`; }
});

/* ===========================
   Confeti (sin sonido)
   =========================== */
const CONFETTI_COLORS = ["#B7F4E0","#D8EDFF","#E9DAFF","#FFEAA6"];
const CONFETTI_SHAPES = ["square","circle","star"];

function launchConfettiRain(duration=2200, density=90){
  const start = performance.now();
  const spawn = () => {
    const now = performance.now();
    if (now - start > duration) return;
    for (let i=0; i<Math.floor(density/6); i++){ spawnPiece(); }
    requestAnimationFrame(spawn);
  };
  spawn();
}
function spawnPiece(){
  const el = document.createElement("i");
  const shape = CONFETTI_SHAPES[Math.floor(Math.random()*CONFETTI_SHAPES.length)];
  const size = 6 + Math.random()*10;
  const x = Math.random()*window.innerWidth;
  const fall = 1200 + Math.random()*1400;
  const drift = (Math.random()-.5)*120;
  const rot = Math.random()*720;

  Object.assign(el.style, {
    position:"fixed", left:`${x}px`, top:`-20px`, width:`${size}px`, height:`${size}px`,
    background: shape==="star" ? "transparent" : CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
    borderRadius: shape==="circle" ? "50%" : "3px", pointerEvents:"none", zIndex: 99,
    transform:`translateZ(0)`, willChange:"transform, opacity"
  });

  if(shape==="star"){
    el.style.background = CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)];
    el.style.clipPath = "path('M10 0 L12.9 6.5 L20 7.6 L14.9 12.1 L16.2 19 L10 15.5 L3.8 19 L5.1 12.1 0 7.6 7.1 6.5 Z')";
    el.style.width = `${size+6}px`; el.style.height = `${size+6}px`;
  }

  document.body.appendChild(el);
  el.animate(
    [{ transform:`translate(0px, -20px) rotate(0deg)`, opacity:1 },
     { transform:`translate(${(Math.random()-.5)*drift}px, ${window.innerHeight+40}px) rotate(${rot}deg)`, opacity:0.2 }],
    { duration: fall, easing:"cubic-bezier(.25,.7,.2,1)" }
  ).finished.then(()=> el.remove());
}
function celebrate(){ launchConfettiRain(2400, 110); }

/* ===========================
   Doodles de fondo
   =========================== */
(() => {
  const c = $("#bg");
  const ctx = c.getContext("2d");
  const DPR = Math.min(devicePixelRatio || 1, 2);
  let w, h, t=0;
  const palette = ["#6B5CFF","#00C2A8","#B7F4E0","#D8EDFF"];
  const icons = ["heart","shield","megaphone","star"];
  const ENABLE_DOODLES = true;

  function resize(){ w=c.width=innerWidth*DPR; h=c.height=innerHeight*DPR; c.style.width=innerWidth+"px"; c.style.height=innerHeight+"px"; }
  function ico(type, x, y, s, col){
    ctx.save(); ctx.translate(x,y); ctx.scale(s,s);
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.lineCap="round"; ctx.lineJoin="round";
    if(type==="heart"){ ctx.beginPath(); ctx.moveTo(0,8); ctx.bezierCurveTo(-10,2,-10,-6,-2,-6); ctx.bezierCurveTo(0,-6,0,-4,0,-4); ctx.bezierCurveTo(0,-4,0,-6,2,-6); ctx.bezierCurveTo(10,-6,10,2,0,8); ctx.stroke(); }
    if(type==="shield"){ ctx.beginPath(); ctx.moveTo(0,-8); ctx.lineTo(10,-3); ctx.lineTo(10,5); ctx.lineTo(0,12); ctx.lineTo(-10,5); ctx.lineTo(-10,-3); ctx.closePath(); ctx.stroke(); }
    if(type==="megaphone"){ ctx.beginPath(); ctx.moveTo(-10,-2); ctx.lineTo(6,-8); ctx.lineTo(6,8); ctx.lineTo(-10,2); ctx.closePath(); ctx.stroke(); }
    if(type==="star"){ ctx.beginPath(); for(let i=0;i<5;i++){ ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*10, Math.sin((18+i*72)*Math.PI/180)*10); ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*4, Math.sin((54+i*72)*Math.PI/180)*4); } ctx.closePath(); ctx.stroke(); }
    ctx.restore();
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    if(!ENABLE_DOODLES) return;
    const spacing = 160*(Math.max(innerWidth,800)/1200);
    for(let y=0;y<h;y+=spacing){
      for(let x=0;x<w;x+=spacing){
        const p=(x+y)/spacing;
        const s=0.9+0.2*Math.sin((t+p)*.02);
        const col=palette[(Math.floor(p)+icons.length)%palette.length];
        const id=icons[(Math.floor(p)+2)%icons.length];
        ico(id, x+8*Math.sin((t+x)*.001), y+6*Math.cos((t+y)*.0012), s, col);
      }
    }
    t+=1.05; requestAnimationFrame(step);
  }
  addEventListener("resize", resize);
  resize(); step();
})();

/* ===========================
   Topbar: tema + menú móvil + tips
   =========================== */
document.documentElement.setAttribute("data-theme", state.theme);

$("#themeBtn").addEventListener("click", ()=>{
  state.theme = state.theme==="light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("theme", state.theme);
});

const navToggle = $("#navToggle");
const topnav = $("#topnav");
navToggle.addEventListener("click", ()=> topnav.classList.toggle("open"));

// Tips dialog
const tips=$("#tips");
$("#tipsBtn").addEventListener("click", ()=> tips.showModal());
tips.addEventListener("click", (e)=>{ if(e.target===tips) tips.close(); });

/* ===========================
   Mascota: panel, seguimiento y narrador
   =========================== */
(() => {
  const dlg = $("#buddyDialog");
  const btn = $("#buddyBtn");
  const closeBtn = $("#buddyClose");
  const readBtn = $("#buddyRead");
  const tabs = $$(".bt", dlg);
  const panes = $$(".pane", dlg);

  let hoverTimer=null;
  btn.addEventListener("mousemove", (e)=>{
    const cat = $(".cat", btn);
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left+rect.width/2))/rect.width;
    const dy = (e.clientY - (rect.top+rect.height/2))/rect.height;
    cat.style.transform = `translate(${dx*3}px, ${dy*3}px)`;
    clearTimeout(hoverTimer);
    hoverTimer=setTimeout(()=> cat.style.transform="", 200);
  });

  btn.addEventListener("click", ()=> dlg.showModal());
  dlg.addEventListener("click", (e)=>{ if(e.target===dlg) dlg.close(); });

  tabs.forEach(t => t.addEventListener("click", ()=>{
    tabs.forEach(x=>x.classList.remove("active"));
    panes.forEach(p=>p.classList.add("hidden"));
    t.classList.add("active");
    $(`.pane[data-pane="${t.dataset.tab}"]`, dlg).classList.remove("hidden");
  }));

  readBtn.addEventListener("click", ()=>{
    const activePane = $(".pane:not(.hidden)", dlg);
    if(activePane) speakText(activePane.innerText, {rate:0.95, pitch:1.08});
  });

  // Globitos de tips
  const tipsMsgs = [
    "El consentimiento debe ser libre y con ganas.",
    "Si algo te incomoda, cuéntalo a una persona de confianza.",
    "En Ayuda tienes WhatsApp verificado para escribir."
  ];
  setInterval(()=>{
    if(document.hidden) return;
    const msg = tipsMsgs[Math.floor(Math.random()*tipsMsgs.length)];
    const bubble = document.createElement("div");
    bubble.className = "kiva-tip";
    bubble.textContent = msg;
    btn.appendChild(bubble);
    setTimeout(()=> bubble.remove(), 4000);
  }, 15000);
})();

/* Narrador accesible */
let speechOK = 'speechSynthesis' in window;
let synth = speechOK ? window.speechSynthesis : null;
let voice = null;

function pickSpanishFemaleVoice(){
  if(!speechOK) return null;
  const vs = synth.getVoices().filter(v => v.lang.startsWith('es-'));
  const prefs = [/Google.*es-ES/i, /Microsoft.*Elena/i, /Microsoft.*Dalia/i, /Luciana/i, /Camila/i, /Sofia/i, /Elena/i];
  for(const rx of prefs){ const f = vs.find(v => rx.test(v.name)); if(f) return f; }
  return vs[0] || null;
}
function speakText(text, opts={}){
  if(!speechOK || !text) return;
  const u = new SpeechSynthesisUtterance(text.replace(/\.\s/g, ".  "));
  voice = voice || pickSpanishFemaleVoice();
  if(voice){ u.voice = voice; u.lang = voice.lang; }
  u.pitch = opts.pitch ?? 1.08;
  u.rate  = opts.rate  ?? 0.95;
  u.volume= opts.volume?? 1.0;
  synth.cancel();
  synth.speak(u);
}
(() => {
  const narratorBtn = $("#narratorBtn");
  if (!speechOK) {
    narratorBtn.disabled = true;
    narratorBtn.title = "Narrador no soportado por tu navegador";
    return;
  }
  function guideIntro(){
    speakText("Bienvenida, bienvenido. Estás en Kiva. Usa el menú para navegar. En Explora hay juegos. En Ayuda verás contactos verificados. Toca un texto para escucharlo.");
  }
  function tryAutoStartMobile(){
    if (state.narratorAutoTried) return;
    state.narratorAutoTried = true;
    setTimeout(()=>{ if (document.visibilityState === "visible") { state.narrator = true; narratorBtn.style.outline = "2px solid var(--ring)"; guideIntro(); } }, 500);
  }
  narratorBtn.addEventListener("click", () => {
    state.narrator = !state.narrator;
    narratorBtn.style.outline = state.narrator ? "2px solid var(--ring)" : "none";
    narratorBtn.title = state.narrator ? "Narrador activado (toca un texto)" : "Activar narrador";
    if (state.narrator) guideIntro(); else synth.cancel();
  });
  window.addEventListener("touchstart", ()=>{ if (!state.narrator && !state.narratorAutoTried){ tryAutoStartMobile(); } }, {passive:true});
  if (/Mobi|Android/i.test(navigator.userAgent)) { tryAutoStartMobile(); }

  document.addEventListener("click", (e) => {
    if (!state.narrator || synth.speaking) return;
    const sel = e.target.closest('h1, h2, h3, p, .flip__front, .brick, .cap, .help-card h4, .help-card p, .topnav-item, .chip, .card, .emo-label');
    if (sel) speakText(sel.textContent.trim(), {rate:0.95, pitch:1.1});
  });
})();

/* ===========================
   Emocionómetro
   =========================== */
(() => {
  const range = $("#emoRange");
  if (!range) return;
  const label = $(".emo-label");
  const face = $(".emo-face");
  const mouth = $(".mouth", face);
  const browL = $(".brow.l", face);
  const browR = $(".brow.r", face);
  const tear = $(".tear", face);

  const states = [
    { max:20,  name:"Tranquila/o",   color:"#B7F4E0", mouth:"smile", anim:"pulse", brows:"relax" },
    { max:45,  name:"Inquieta/o",    color:"#D8EDFF", mouth:"flat",  anim:"",      brows:"raise" },
    { max:70,  name:"Tensa/o",       color:"#FFEAA6", mouth:"frown", anim:"shake", brows:"furrow" },
    { max:85,  name:"Triste",        color:"#E9DAFF", mouth:"sad",   anim:"drop",  brows:"tilt" },
    { max:100, name:"Enojada/o",     color:"#FFC8BF", mouth:"angry", anim:"shake", brows:"angry" }
  ];

  function setMouth(type){
    mouth.style.borderRadius = "0 0 20px 20px";
    mouth.style.borderTop = "none";
    mouth.style.transform = "translateX(-50%)";
    tear.style.opacity = 0;

    if(type==="smile"){ mouth.style.height="18px"; mouth.style.width="40px"; }
    if(type==="flat"){ mouth.style.height="0px"; mouth.style.width="34px"; mouth.style.borderWidth="0"; mouth.style.borderTop="3px solid #111"; mouth.style.bottom="28px"; }
    if(type==="frown"){ mouth.style.height="18px"; mouth.style.width="40px"; mouth.style.transform="translateX(-50%) rotate(180deg)"; }
    if(type==="sad"){ mouth.style.height="14px"; mouth.style.width="30px"; mouth.style.transform="translateX(-50%) rotate(180deg)"; tear.style.opacity=1; }
    if(type==="angry"){ mouth.style.height="0px"; mouth.style.width="30px"; mouth.style.borderWidth="0"; mouth.style.borderTop="4px solid #111"; mouth.style.bottom="26px"; }
  }
  function setBrows(mode){
    browL.style.transform = browR.style.transform = "none";
    if(mode==="raise"){ browL.style.transform="translateY(-2px)"; browR.style.transform="translateY(-2px)"; }
    if(mode==="furrow"){ browL.style.transform="rotate(-14deg) translateY(2px)"; browR.style.transform="rotate(14deg) translateY(2px)"; }
    if(mode==="tilt"){ browL.style.transform="rotate(-10deg)"; browR.style.transform="rotate(10deg)"; }
    if(mode==="angry"){ browL.style.transform="rotate(-24deg) translateY(2px)"; browR.style.transform="rotate(24deg) translateY(2px)"; }
  }

  function update(){
    const v = +range.value;
    const s = states.find(x=> v<=x.max) || states.at(-1);
    label.textContent = `Emoción: ${s.name}`;
    face.style.background = s.color;
    face.classList.remove("shake","pulse","drop");
    if(s.anim) face.classList.add(s.anim);
    setMouth(s.mouth);
    setBrows(s.brows);
  }
  range.addEventListener("input", update);
  update();
})();

/* ===========================
   Rompe el muro
   =========================== */
(() => {
  const gameBlock = $("#muros");
  if(!gameBlock) return;
  const wall = $(".wall", gameBlock);
  const out = $(".why", gameBlock);
  const resetBtn = $("[data-game='muros']", gameBlock);

  const words = [
    "miedo","culpa","vergüenza","silencio","aislamiento","duda",
    "presión","secreto","confusión","soledad","amenaza","inseguridad",
    "desconfianza","culpabilizar","minimizar","chantaje","hostigamiento","normalizar"
  ];
  const messages = {
    miedo:"Derribar el miedo abre la puerta a pedir ayuda.",
    culpa:"La culpa no es tuya: quitarla permite sanar.",
    vergüenza:"La vergüenza aísla; romperla trae apoyo.",
    silencio:"Hablar protege; el silencio protege al agresor.",
    aislamiento:"Conectar con apoyo es clave para cuidarte.",
    duda:"Creer en ti enciende tu voz.",
    presión:"La presión anula el consentimiento; detectarla te cuida.",
    secreto:"Si un secreto incomoda, cuéntalo a alguien seguro.",
    confusión:"Nombrar lo que pasa orienta pasos seguros.",
    soledad:"No estás sola/o; pedir apoyo crea compañía segura.",
    amenaza:"Las amenazas buscan control; denunciar corta el ciclo.",
    inseguridad:"Reconocer límites fortalece tu seguridad.",
    desconfianza:"Confiar en alguien seguro permite actuar.",
    culpabilizar:"Culpar a la víctima perpetúa daño; enfoca en proteger.",
    minimizar:"Tomar en serio salva.",
    chantaje:"El chantaje nunca es consentimiento.",
    hostigamiento:"Identificarlo y denunciarlo corta el abuso.",
    normalizar:"No normalizar el daño permite frenarlo."
  };
  const pastel = ["var(--sky)","var(--mint)","var(--lilac)","var(--banana)"];
  let broken = 0; let clickedSet = new Set();

  function initWall() {
    wall.innerHTML = '';
    out.textContent = "Toca cada bloque para derribarlo.";
    broken = 0; clickedSet.clear();

    words.forEach((w,i) => {
      const b = document.createElement("button");
      b.className = "brick";
      b.textContent = w;
      b.style.background = `var(${pastel[i % pastel.length].replace("var(","").replace(")","")})`;

      b.addEventListener("click", () => {
        if(b.classList.contains("broken-anim") || clickedSet.has(b)) return;
        clickedSet.add(b);
        b.classList.add("hit");
        setTimeout(()=> b.classList.remove("hit"), 460);
        b.classList.add("broken-anim");
        out.textContent = messages[w] || "";
        broken++;
        if(broken === words.length){
          out.textContent = "Muro derribado. Has roto barreras.";
          celebrate();
        }
      });
      wall.appendChild(b);
    });
  }
  resetBtn.addEventListener("click", initWall);
  initWall();
})();

/* ===========================
   Memorama
   =========================== */
(() => {
  const gameBlock = $("#memoria");
  if(!gameBlock) return;
  const grid = $(".memory-grid", gameBlock);
  const info = $(".memory-info", gameBlock);
  const desc = $(".memory-desc", gameBlock);
  const resetBtn = $("[data-game='memoria']", gameBlock);

  const pics = [
    { key:"apoyo",     src:"https://openmoji.org/data/color/svg/1F91D.svg", label:"Apoyo",    desc:"Apoyo: pedir y ofrecer compañía segura." },
    { key:"escucha",   src:"https://openmoji.org/data/color/svg/1F442.svg", label:"Escucha",  desc:"Escucha: atender sin juicios y con respeto." },
    { key:"confianza", src:"https://openmoji.org/data/color/svg/1F91E.svg", label:"Confianza",desc:"Confianza: elegir a quién contarle." },
    { key:"limites",   src:"https://openmoji.org/data/color/svg/270B.svg",  label:"Límites",  desc:"Límites: decir alto y cuidar tu espacio." },
    { key:"valentia",  src:"https://openmoji.org/data/color/svg/1F3C6.svg", label:"Valentía", desc:"Valentía: hablar aunque cueste." },
    { key:"cuidado",   src:"https://openmoji.org/data/color/svg/2764.svg",  label:"Cuidado",  desc:"Cuidado: hábitos que te protegen." },
    { key:"red",       src:"https://openmoji.org/data/color/svg/1F465.svg", label:"Red",      desc:"Red: familia, escuela y servicios." },
    { key:"respeto",   src:"https://openmoji.org/data/color/svg/1F44D.svg", label:"Respeto",  desc:"Respeto: toda relación debe tenerlo." }
  ];

  let first=null, lock=false, found=0, moves=0;
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

  function initMemoria() {
    grid.innerHTML = ''; desc.textContent = ''; first = null; lock = false; found = 0; moves = 0; updateInfo();
    const deck = shuffle(pics.flatMap(p=>[p,p]));
    deck.forEach(p=>{
      const card = document.createElement("button");
      card.className = "cardm"; card.dataset.k = p.key;

      const inner = document.createElement("div"); inner.className = "cardm-inner";
      const front = document.createElement("div"); front.className = "cardm-face cardm-front"; front.textContent = p.label;
      const back = document.createElement("div"); back.className = "cardm-face cardm-back";
      const img = document.createElement("img"); img.src = p.src; img.alt = p.label; back.appendChild(img);

      inner.appendChild(front); inner.appendChild(back); card.appendChild(inner);
      card.addEventListener("click", () => onCardClick(card, p));
      grid.appendChild(card);
    });
  }

  function onCardClick(c, pdata) {
    if(lock || c.classList.contains("solved") || c === first) return;
    reveal(c);
    if(!first){ first = c; }
    else {
      lock = true; moves++;
      if(first.dataset.k === c.dataset.k){
        first.classList.add("solved"); c.classList.add("solved");
        const got = pics.find(x=> x.key === c.dataset.k);
        first = null; lock = false; found += 1;
        desc.textContent = got ? got.desc : "";
        if(found === pics.length){ info.textContent = `Completado en ${moves} movimientos.`; celebrate(); } else { updateInfo(); }
      } else {
        first.classList.add("shake"); c.classList.add("shake");
        setTimeout(() => { hide(c); hide(first); first.classList.remove("shake"); c.classList.remove("shake"); first = null; lock = false; updateInfo(); }, 850);
      }
    }
  }
  function updateInfo(){ info.textContent = `Pares: ${found} / ${pics.length} · Movimientos: ${moves}`; }
  function reveal(el){ el.classList.add("revealed"); }
  function hide(el){ el.classList.remove("revealed"); }

  resetBtn.addEventListener("click", initMemoria);
  initMemoria();
})();

/* ===========================
   Arma el mensaje
   =========================== */
(() => {
  const gameBlock = $("#mensaje");
  if(!gameBlock) return;
  const box = $(".chips", gameBlock);
  const out = $(".msg-out", gameBlock);
  const resetBtn = $("[data-game='mensaje']", gameBlock);

  const pieces = ["Hablar","con","alguien","de","confianza","es","valentía"];
  const goal = pieces.join(" ");
  let dragEl = null;

  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }
  function initMensaje() {
    box.innerHTML = ''; out.textContent = ''; dragEl = null;
    shuffle(pieces.map((t,i)=>({t,i}))).forEach(obj=>{
      const b=document.createElement("button"); b.className="chip"; b.textContent=obj.t; b.dataset.idx=obj.i; box.appendChild(b);
    });
  }
  box.addEventListener("pointerdown", e => {
    dragEl = e.target.closest(".chip"); if (!dragEl) return; e.preventDefault();
    dragEl.classList.add("dragging");
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp, { once: true });
  });
  function onPointerMove(e) {
    if (!dragEl) return;
    const overEl = document.elementFromPoint(e.clientX, e.clientY)?.closest(".chip");
    if (overEl && overEl !== dragEl) {
      const r = overEl.getBoundingClientRect();
      const next = (e.clientX - r.left) > (r.width / 2);
      if (next && overEl.nextSibling) box.insertBefore(dragEl, overEl.nextSibling); else if (!next) box.insertBefore(dragEl, overEl);
    }
  }
  function onPointerUp() {
    if (!dragEl) return;
    dragEl.classList.remove("dragging"); dragEl = null;
    document.removeEventListener("pointermove", onPointerMove);
    check();
  }
  function check(){
    const cur = [...$$(".chip", box)].map(el => el.textContent).join(" ");
    if(cur === goal){ out.textContent = "Mensaje listo. Pedir ayuda es un acto de valentía."; celebrate(); } else { out.textContent = ""; }
  }
  resetBtn.addEventListener("click", initMensaje);
  initMensaje();
})();

/* ===========================
   Carrusel
   =========================== */
(() => {
  const car=$("#carousel"); if(!car) return;
  const track=$(".car-track", car), slides=$$(".slide", car);
  let idx=0; const go=(i)=>{ idx=(i+slides.length)%slides.length; track.style.transform=`translateX(-${idx*100}%)`; };
  $(".prev", car).addEventListener("click", ()=> go(idx-1));
  $(".next", car).addEventListener("click", ()=> go(idx+1));
})();

/* ===========================
   Ayuda (render + reveal)
   =========================== */
const HELP_MX = [
  { name:"Emergencias 911 (MX)", type:"Teléfono", value:"911", desc:"Para cualquier peligro inmediato." },
  { name:"Línea de la Vida (MX)", type:"Teléfono", value:"800 911 2000", desc:"Orientación en salud mental 24/7." },
  { name:"LOCATEL CDMX (MX)", type:"Teléfono", value:"55 5658 1111", desc:"Orientación y canalización (CDMX)." },
  { name:"Consejo Ciudadano (CDMX)", type:"Web", value:"https://consejociudadanomx.org/servicios/apoyo-psicologico-626ffa1400068", desc:"Apoyo 24/7; también Chat de Confianza por WhatsApp." },
  { name:"Contacto Joven (IMJUVE)", type:"Web", value:"https://www.gob.mx/imjuve/articulos/contacto-joven-red-nacional-de-atencion-juvenil-310678", desc:"Acompañamiento psicoemocional por WhatsApp." },
  { name:"DIF Municipal Tierra Blanca, Ver.", type:"Teléfono", value:"274 743 5471", desc:"Atención local. (Directorio DIF Veracruz)" }
];
const HELP_GLOBAL = [
  { name:"Child Helpline International", type:"Web", value:"https://www.childhelplineinternational.org/find-a-helpline/", desc:"Directorio global de líneas para niñas, niños y adolescentes." },
  { name:"Befrienders Worldwide", type:"Web", value:"https://www.befrienders.org/", desc:"Centros de apoyo emocional y crisis en el mundo." },
  { name:"Find a Helpline", type:"Web", value:"https://findahelpline.com/countries/mx", desc:"Buscador de líneas por país y tema." },
  { name:"IWF Report (Global)", type:"Web", value:"https://report.iwf.org.uk/es", desc:"Reporta material de abuso sexual infantil en línea." },
  { name:"CyberTipline (NCMEC)", type:"Web", value:"https://report.cybertip.org/", desc:"Reporta explotación infantil en línea (EE. UU.)." }
];

(() => {
  function render(list, mount){
    if(!mount) return;
    mount.innerHTML = "";
    list.forEach(c=>{
      const el=document.createElement("div"); el.className="help-card";
      const href=c.type==="Web" ? c.value : `tel:${c.value.replace(/\s+/g,"")}`;
      el.innerHTML = `
        <h4>${c.name}</h4>
        <p class="muted">${c.desc}</p>
        <a class="call" target="_blank" rel="noopener" href="${href}">
          <span style="display:inline-block;width:16px;height:16px;border:1px solid var(--line);border-radius:4px"></span>
          <strong>${c.value}</strong>
        </a>
      `;
      mount.appendChild(el);
    });
  }
  render(HELP_MX, $("#helpGridMX"));
  render(HELP_GLOBAL, $("#helpGridGlobal"));

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  },{threshold:0.15});
  $$(".reveal").forEach(el=> io.observe(el));
})();

/* ===========================
   Blog
   =========================== */
(() => {
  const items = [
    { t:"Pedir ayuda es un plan", p:"Elige a una persona adulta de confianza y acuerden una palabra clave para avisar si necesitas apoyo." },
    { t:"Consentimiento claro", p:"Si hay presión, chantaje o miedo, no hay consentimiento. Tu bienestar va primero." },
    { t:"Tu red en la escuela", p:"Docentes, orientación y amistades pueden ser parte de tu red. Guarda sus contactos." },
    { t:"Cuídate también en línea", p:"Configura privacidad, evita compartir datos y bloquea cuentas que incomoden." }
  ];
  const grid = $("#blogGrid"); if(!grid) return;
  items.forEach(x=>{
    const c = document.createElement("article");
    c.className = "blog-card";
    c.innerHTML = `<h4>${x.t}</h4><p>${x.p}</p>`;
    grid.appendChild(c);
  });
})();

/* ===========================
   Foro local simple
   =========================== */
(() => {
  const list = $("#forumList");
  const postBtn = $("#postBtn");
  const txt = $("#postText");
  const anon = $("#anonToggle");
  const alias = $("#alias");
  if(!list || !postBtn) return;

  function renderPost({author, text, when}){
    const el = document.createElement("article");
    el.className = "post";
    const a = author || "Anónimo";
    el.innerHTML = `
      <div class="badge">Nuevo</div>
      <div class="meta">${a} · ${new Date(when).toLocaleString()}</div>
      <div class="body">${text.replace(/</g,"&lt;")}</div>
      <div class="actions">
        <button class="like">Me sirve</button>
        <button class="reply">Responder</button>
        <button class="report">Reportar</button>
      </div>
    `;
    const like = $(".like", el);
    like.addEventListener("click", ()=> { like.textContent = like.textContent.includes("✓") ? "Me sirve" : "✓ Me sirve"; });
    const rep = $(".report", el);
    rep.addEventListener("click", ()=> alert("Gracias. Tu reporte fue enviado a moderación."));
    list.prepend(el);
  }

  postBtn.addEventListener("click", ()=>{
    const text = txt.value.trim();
    if(!text) return;
    renderPost({author: anon?.checked ? "" : alias?.value.trim(), text, when: Date.now()});
    txt.value = "";
  });
})();

// ——— FAB + Panel rápido (móvil) ———
(function(){
  const fab = document.getElementById('fabToggle');
  const panel = document.getElementById('quickPanel');
  if(!fab || !panel) return;

  const toggle = () => {
    const isOpen = panel.classList.toggle('open');
    fab.classList.toggle('open', isOpen);
    fab.setAttribute('aria-expanded', String(isOpen));
    panel.setAttribute('aria-hidden', String(!isOpen));
  };

  fab.addEventListener('click', toggle);

  // Cerrar al tocar fuera
  document.addEventListener('click', (e)=>{
    const isMobile = window.matchMedia('(max-width: 600px)').matches;
    if(!isMobile) return;
    if(!panel.classList.contains('open')) return;
    if(e.target === fab || fab.contains(e.target) || panel.contains(e.target)) return;
    panel.classList.remove('open');
    fab.classList.remove('open');
    fab.setAttribute('aria-expanded','false');
    panel.setAttribute('aria-hidden','true');
  });

  // Cerrar con Esc
  document.addEventListener('keydown',(e)=>{
    if(e.key === 'Escape' && panel.classList.contains('open')){
      panel.classList.remove('open');
      fab.classList.remove('open');
      fab.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');
    }
  });
})();



/* === FAB + Panel rápido (móvil) — versión robusta === */
(function(){
  const isMobile = () => window.matchMedia('(max-width: 600px)').matches;
  const fab   = document.getElementById('fabToggle');
  const panel = document.getElementById('quickPanel');
  if(!fab || !panel) return;

  // 1) Resolución tolerante de objetivos (IDs, titles, aria-labels)
  function findBtn(selectorFallbacks){
    for(const sel of selectorFallbacks){
      const el = document.querySelector(sel);
      if(el) return el;
    }
    return null;
  }
  const targets = {
    theme:  findBtn(['#themeBtn','button[title*="Tema"]','button[aria-label*="Tema"]']),
    tips:   findBtn(['#tipsBtn','button[title*="Tips"]','button[aria-label*="Tips"]','#tips ~ button','button[data-tips]']),
    voice:  findBtn(['#narratorBtn','button[title*="Narrador"]','button[aria-label*="Narrador"]']),
    menu:   findBtn(['#navToggle','.hamburger[aria-label]'])
  };


  // 3) Acciones: si existe el botón original → .click(); si no, ejecuta la lógica mínima equivalente
  const minimalActions = {
    theme(){
      // Lógica mínima igual a la original
      if (window.state) {
        state.theme = state.theme==="light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", state.theme);
        localStorage.setItem("theme", state.theme);
      } else {
        document.documentElement.toggleAttribute('data-theme'); // fallback
      }
    },
    tips(){
      const dlg = document.getElementById('tips');
      if (dlg && dlg.showModal) dlg.showModal();
    },
    voice(){
      // Dispara el handler original si existe el botón, si no, solo cambia el estado básico
      if (window.state) {
        state.narrator = !state.narrator;
        // Si el botón original existe, que se encargue de estilos y guía
        if (targets.voice) { try { targets.voice.click(); } catch(e){} }
      }
    },
    menu(){
      const nav = document.getElementById('topnav');
      if (nav) nav.classList.toggle('open');
    }
  };

  panel.querySelectorAll('.qp-item').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const act = btn.getAttribute('data-act');          // 'theme' | 'tips' | 'voice' | 'menu'
      const original = targets[act];

      if (original) {
        // Proxy click al botón original (funciona aunque esté oculto)
        try { original.click(); } catch(e) { /* noop */ }
      } else if (minimalActions[act]) {
        // Fallback si el original no está en el DOM
        minimalActions[act]();
      }

      // Cierra después de accionar (menos cuando es abrir menú principal)
      if (act !== 'menu') setOpen(false);
    });
  });
})();
