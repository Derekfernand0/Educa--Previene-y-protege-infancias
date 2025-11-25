/* Helpers */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

/* ===== Modo oscuro / claro ===== */
const themeToggle = $("#themeToggle");

function getPreferredTheme(){
  const stored = localStorage.getItem("kiva-theme");
  if (stored === "light" || stored === "dark") return stored;

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches){
    return "dark";
  }
  return "light";
}

function applyTheme(theme){
  const mode = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = mode;

  const icon = themeToggle?.querySelector(".mode-toggle__icon");
  if (icon){
    // En oscuro mostramos ☀️ para indicar que puedes volver a claro
    icon.textContent = mode === "dark" ? "☀️" : "🌙";
  }
}

// Tema inicial (respeta preferencia guardada o sistema)
applyTheme(getPreferredTheme());

// Toggle al hacer clic
if (themeToggle){
  themeToggle.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("kiva-theme", next);
  });
}


/* Navegación + fondo por sección */
const backdrop=$("#navBackdrop"), sidenav=$("#sidenav");
$("#navOpen")?.addEventListener("click",()=>{sidenav.classList.add("open"); backdrop.hidden=false; document.documentElement.style.overflow="hidden";});
$("#navClose")?.addEventListener("click",closeNav); backdrop?.addEventListener("click",closeNav);
function closeNav(){ sidenav.classList.remove("open"); backdrop.hidden=true; document.documentElement.style.overflow=""; }
function showSection(id){
  if(!id) return;
  const t=document.getElementById(id);
  if(!t) return;
  $$(".gate-keep").forEach(s=>s.classList.add("hidden"));
  t.classList.remove("hidden");
  document.body.dataset.bg=t.dataset.bg||id;
  closeNav();
  t.setAttribute("tabindex","-1");
  t.focus({preventScroll:false});
}
document.addEventListener("click",(e)=>{
  // sirve tanto para los enlaces del menú como para cualquier cosa con data-target
  const a = e.target.closest(".snav-link, [data-target]");
  if(!a) return;

  const hash = (a.dataset.target || (a.getAttribute("href") || "").replace(/^.*#/, "")).trim();
  if(!hash) return;

  e.preventDefault();
  showSection(hash);
});

$$(".btn.cta").forEach(b=> b.addEventListener("click", ()=> showSection(b.dataset.open?.trim())));
(function initStart(){
  const start=$("#inicio")||$(".gate-keep");
  if(!start) return;
  $$(".gate-keep").forEach(s=>s.classList.add("hidden"));
  start.classList.remove("hidden");
  document.body.dataset.bg="inicio";
})();

/* Carrusel portada (botones + arrastre/ swipe) */

/* ===== Dial Emocionómetro ===== */
(() => {
  const wrap = $("#emociono"); 
  if (!wrap) return;

  const range = $("#emoRange", wrap),
        label = $(".emo-label", wrap),
        knob  = $("#dialKnob", wrap),
        emoji = $("#dialEmoji", wrap);

  // agrandamos un poquito la bolita
  if (knob) knob.setAttribute("r", "14");

  const states = [
    { max: 20,  name: "Feliz",       emoji: "😊" },
    { max: 45,  name: "Tranquila/o", emoji: "🙂" },
    { max: 70,  name: "Inquieta/o",  emoji: "😕" },
    { max: 85,  name: "Triste",      emoji: "😔" },
    { max: 100, name: "Enojada/o",   emoji: "😠" }
  ];

  // arco de 180° (de 180° a 0°) que coincide con el SVG
  function posAt(v) {
    v = Math.max(0, Math.min(100, v));
    const a  = (180 - (v * 180 / 100)) * (Math.PI / 180); // 0–100 → 180°–0°
    const R  = 70;
    const cx = 100, cy = 120;
    return {
      x: cx + R * Math.cos(a),
      y: cy - R * Math.sin(a)
    };
  }

  function update(v) {
    v = Math.max(0, Math.min(100, v));
    range.value = v;
    const p = posAt(v);
    knob.setAttribute("cx", p.x.toFixed(1));
    knob.setAttribute("cy", p.y.toFixed(1));
    const s = states.find(x => v <= x.max) || states.at(-1);
    label.textContent = `Emoción: ${s.name}`;
    emoji.textContent = s.emoji;
  }

  range.addEventListener("input", () => update(+range.value));
  $$(".dial-emojis button", wrap).forEach(b =>
    b.addEventListener("click", () => update(+b.dataset.v))
  );

  // arrastre del knob con límite de arco (0° a 180°),
  // sólo si tocas la bolita o la barra del círculo
  const svg = $(".dial-svg", wrap);
  let dragging = false;

  // convierte un punto en valor 0–100
  function valueFromPoint(x, y) {
    const dx = x - 100;
    const dy = 120 - y;
    let ang = Math.atan2(dy, dx) * (180 / Math.PI); // 0–180 en semicírculo superior

    if (ang < 0) ang = 0;
    if (ang > 180) ang = 180;

    return Math.round((180 - ang) / 180 * 100);
  }

  svg.addEventListener("pointerdown", (e) => {
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // centro del dial
    const cx = 100, cy = 120;
    const dx = x - cx;
    const dy = y - cy;
    const distCenter = Math.hypot(dx, dy);

    // posición actual de la bolita
    const kx = parseFloat(knob.getAttribute("cx"));
    const ky = parseFloat(knob.getAttribute("cy"));
    const distKnob = Math.hypot(x - kx, y - ky);

    // parámetros del aro (mismo radio que usamos en posAt)
    const R = 70;
    const ringInner = R - 10; // grosor interno
    const ringOuter = R + 10; // grosor externo

    const touchingRing = (y <= cy) && distCenter >= ringInner && distCenter <= ringOuter;
    const touchingKnob = distKnob <= 20; // tocar la bolita

    // si no toca ni la bolita ni la barra del círculo, no hacemos nada
    if (!touchingRing && !touchingKnob) return;

    dragging = true;
    svg.setPointerCapture(e.pointerId);
    update(valueFromPoint(x, y));
  });

  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    update(valueFromPoint(x, y));
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  update(+range.value || 20);
})();

/* Confeti */
const CONFETTI_COLORS=["#CFEAFF","#E5D6FF","#FFF4B8","#FFD9C8","#FFD6E7"];
function celebrate(){
  const n=120;
  for(let i=0;i<n;i++){
    const el=document.createElement("i");
    const size=6+Math.random()*10;
    const x=Math.random()*innerWidth;
    const fall=1200+Math.random()*1400;
    const rot=Math.random()*720;
    Object.assign(el.style,{
      position:"fixed",
      left:`${x}px`,
      top:`-20px`,
      width:`${size}px`,
      height:`${size}px`,
      background:CONFETTI_COLORS[(Math.random()*CONFETTI_COLORS.length)|0],
      borderRadius:Math.random()>.5?"50%":"3px",
      pointerEvents:"none",
      zIndex:99
    });
    document.body.appendChild(el);
    el.animate(
      [
        {transform:`translate(0,-20px) rotate(0deg)`,opacity:1},
        {transform:`translate(${(Math.random()-.5)*200}px, ${innerHeight+40}px) rotate(${rot}deg)`,opacity:.2}
      ],
      {duration:fall,easing:"cubic-bezier(.25,.7,.2,1)"}
    ).finished.then(()=>el.remove());
  }
}

/* ===== Rompe el muro ===== */
(() => {
  const wrap=$("#muros"); if(!wrap) return;
  const wall=$(".wall",wrap), out=$(".why",wrap), reset=$("[data-game='muros']",wrap);
  const words=[
    "Miedo","Culpa","Vergüenza","Silencio","Aislamiento","Duda","Presión",
    "Secreto","Confusión","Soledad","Amenaza","Inseguridad","Desconfianza",
    "Culpabilizar","Minimizar","Chantaje","Hostigamiento","Normalizar"
  ];
  const messages={
    Miedo:"Derribar el miedo abre la puerta a pedir ayuda.",
    Culpa:"La culpa no es tuya: quitarla permite sanar.",
    Vergüenza:"Romper la vergüenza trae apoyo.",
    Silencio:"Hablar protege; el silencio protege al agresor.",
    Aislamiento:"Conectar con apoyo es clave.",
    Duda:"Creer en ti enciende tu voz.",
    Presión:"La presión anula el consentimiento.",
    Secreto:"Si incomoda, cuéntalo.",
    Confusión:"Nombrar orienta pasos seguros.",
    Soledad:"No estás sola/o.",
    Amenaza:"Denunciar corta el ciclo.",
    Inseguridad:"Reconocer límites te cuida.",
    Desconfianza:"Elige alguien de confianza.",
    Culpabilizar:"Culpar perpetúa daño.",
    Minimizar:"Tomar en serio salva.",
    Chantaje:"Nunca es consentimiento.",
    Hostigamiento:"Identifícalo y denúncialo.",
    Normalizar:"No normalices el daño."
  };
  const pastel=["#CFEAFF","#E5D6FF","#FFF4B8","#FFD9C8","#FFD6E7"]; let broken=0, set=new Set();

  function init(){
    wall.innerHTML="";
    out.textContent="Toca cada bloque para derribarlo.";
    broken=0;
    set.clear();
    words.forEach((w,i)=>{
      const b=document.createElement("button");
      b.className="brick";
      b.textContent=w;
      b.style.background=pastel[i%pastel.length];
      b.addEventListener("click",()=>{
        if(set.has(b))return;
        set.add(b);
        b.classList.add("hit","broken-anim");
        out.textContent=messages[w]||"";
        if(++broken===words.length){
          out.textContent="Muro derribado. ¡Lo lograste!";
          celebrate();
        }
      });
      wall.appendChild(b);
    });
  }
  reset.addEventListener("click",init); init();
})();

/* ===== Memorama ===== */
(() => {
  const game = $("#memoria");
  if (!game) return;

  const grid  = $(".memory-grid", game);
  const info  = $(".memory-info", game);
  const desc  = $(".memory-desc", game);
  const reset = $("[data-game='memoria']", game);

  const pics = [
    {
      key: "apoyo",
      src: "https://openmoji.org/data/color/svg/1F91D.svg",
      label: "Apoyo",
      desc: "Pedir y ofrecer compañía segura.",
      front: "#FFD9C8"
    },
    {
      key: "escucha",
      src: "https://openmoji.org/data/color/svg/1F442.svg",
      label: "Escucha",
      desc: "Escuchar sin juicios.",
      front: "#E5D6FF"
    },
    {
      key: "confianza",
      src: "https://openmoji.org/data/color/svg/1F91E.svg",
      label: "Confianza",
      desc: "Elegir a quién contarle.",
      front: "#CFEAFF"
    },
    {
      key: "limites",
      src: "https://openmoji.org/data/color/svg/270B.svg",
      label: "Límites",
      desc: "Decir alto y cuidar tu espacio.",
      front: "#FFF4B8"
    },
    {
      key: "valentia",
      src: "https://openmoji.org/data/color/svg/1F3C6.svg",
      label: "Valentía",
      desc: "Hablar aunque cueste.",
      front: "#FFD6E7"
    },
    {
      key: "cuidado",
      src: "https://openmoji.org/data/color/svg/2764.svg",
      label: "Cuidado",
      desc: "Hábitos que te protegen.",
      front: "#FFD9C8"
    },
    {
      key: "red",
      src: "https://openmoji.org/data/color/svg/1F465.svg",
      label: "Red",
      desc: "Familia, escuela y servicios.",
      front: "#B0D8FF"
    },
    {
      key: "respeto",
      src: "https://openmoji.org/data/color/svg/1F44D.svg",
      label: "Respeto",
      desc: "Toda relación debe tenerlo.",
      front: "#FEE6A8"
    }
  ];

  let first = null;
  let lock  = false;
  let found = 0;
  let moves = 0;

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function updateInfo() {
    info.textContent = `Pares: ${found} / ${pics.length} · Movimientos: ${moves}`;
  }

  function reveal(card) {
    card.classList.add("revealed");
  }

  function hide(card) {
    card.classList.remove("revealed");
  }

  function buildCard(p) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "cardm";
  card.dataset.k = p.key;

  const inner = document.createElement("div");
  inner.className = "cardm-inner";

  /* -------------------------
     🎨 Color aleatorio bonito
     ------------------------- */
  function randomPastel() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 95%, 88%)`; // pastel suave
  }

  const randomColor = randomPastel();

  /* -------------------------
     🔙 Reverso (lo que se ve tapado)
     ------------------------- */
/* 🎨 Color pastel aleatorio para el reverso */
function randomPastel() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 95%, 90%)`; // pastel suave
}

/* 🔙 Reverso con color aleatorio */
const back = document.createElement("div");
back.className = "cardm-face cardm-back";

/* Fondo pastel aleatorio */
back.style.background = randomPastel();

const backIcon = document.createElement("span");
backIcon.textContent = "❓";
back.appendChild(backIcon);


  /* -------------------------
     🔄 Frente (imagen + palabra) 
     con fondo aleatorio 🎨
     ------------------------- */
  const front = document.createElement("div");
  front.className = "cardm-face cardm-front";

  // fondo pastel aleatorio
  front.style.background = randomColor;

  const img = document.createElement("img");
  img.src = p.src;
  img.alt = p.label;
  img.className = "cardm-img";

  const caption = document.createElement("span");
  caption.className = "cardm-label";
  caption.textContent = p.label;

  front.appendChild(img);
  front.appendChild(caption);

  // Orden de caras
  inner.appendChild(back);
  inner.appendChild(front);
  card.appendChild(inner);

  // Evento
  card.addEventListener("click", () => handleClick(card, p));

  return card;
}


  function handleClick(card, p) {
    if (lock || card.classList.contains("solved") || card === first) return;

    reveal(card);

    if (!first) {
      first = card;
      return;
    }

    moves++;

    if (first.dataset.k === card.dataset.k) {
      // ¡Par correcto!
      card.classList.add("solved");
      first.classList.add("solved");

      const base = pics.find(x => x.key === p.key) || p;
      desc.textContent = `${base.label}: ${base.desc}`;

      found++;
      first = null;
      lock = false;
      updateInfo();

      if (found === pics.length) {
        desc.textContent = "Has encontrado todos los pares. ¡Muy bien!";
        if (typeof celebrate === "function") celebrate();
      }
    } else {
      // No coinciden, se tapan otra vez
      lock = true;
      const a = first;
      const b = card;
      setTimeout(() => {
        hide(a);
        hide(b);
        first = null;
        lock = false;
        updateInfo();
      }, 850);
    }
  }

  function init() {
    grid.innerHTML = "";
    desc.textContent = "";
    first = null;
    lock  = false;
    found = 0;
    moves = 0;

    const deck = shuffle(pics.flatMap(p => [p, p]));
    deck.forEach(p => grid.appendChild(buildCard(p)));

    updateInfo();
  }

  reset.addEventListener("click", init);
  init();
})();

/* ===== Arma el mensaje ===== */
(() => {
  const game=$("#mensaje"); if(!game) return;
  const box=$(".chips",game), out=$(".msg-out",game), reset=$("[data-game='mensaje']",game);
  const pieces=["Hablar","con","alguien","de","confianza","es","valentía"]; const goal=pieces.join(" ");
  let dragEl=null; const chipColors=["#FFD6E7","#FFF4B8","#E5D6FF","#FFD9C8","#CFEAFF","#FFE6F2"];
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;};
  function init(){
    box.innerHTML="";
    out.textContent="";
    shuffle(pieces.map((t,i)=>({t,i}))).forEach(o=>{
      const b=document.createElement("button");
      b.className="chip";
      b.textContent=o.t;
      b.dataset.idx=o.i;
      b.draggable=true;
      b.style.background=chipColors[o.i%chipColors.length];
      box.appendChild(b);
    });
  }
  box.addEventListener("pointerdown", e=>{
    const el=e.target.closest(".chip"); if(!el) return;
    e.preventDefault();
    dragEl=el;
    el.classList.add("dragging");
    document.addEventListener("pointermove",move);
    document.addEventListener("pointerup",up,{once:true});
  });
  function move(e){
    if(!dragEl) return;
    const over=document.elementFromPoint(e.clientX,e.clientY)?.closest(".chip");
    if(over&&over!==dragEl){
      const r=over.getBoundingClientRect();
      const next=(e.clientX-r.left)>(r.width/2);
      if(next&&over.nextSibling) box.insertBefore(dragEl,over.nextSibling);
      else if(!next) box.insertBefore(dragEl,over);
    }
  }
  function up(){
    if(!dragEl) return;
    dragEl.classList.remove("dragging");
    dragEl=null;
    document.removeEventListener("pointermove",move);
    check();
  }
  function check(){
    const cur=[...$$(".chip",box)].map(e=>e.textContent).join(" ");
    out.textContent=(cur===goal)?"Mensaje listo. Pedir ayuda es un acto de valentía.":"";
    if(cur===goal) celebrate();
  }
  reset.addEventListener("click",init); init();
})();

/* ===== Semáforo de las sensaciones ===== */
(() => {
  const wrap=$("#semaforo"); if(!wrap) return;
  const cardsContainer=$(".traffic-cards",wrap);
  const zones=$$(".traffic-zone",wrap);
  const msg=$(".traffic-msg",wrap);
  const reset=$("[data-game='semaforo']",wrap);

  const scenarios=[
    {id:"abrazo",emoji:"🤗",text:"Abrazo cariñoso"},
    {id:"gritos",emoji:"😣",text:"Gritos fuertes"},
    {id:"secreto",emoji:"🤫",text:"Secreto que incomoda"},
    {id:"ayuda",emoji:"🧑‍🏫",text:"Persona adulta que ayuda"},
    {id:"foto",emoji:"📸",text:"Piden foto rara"},
    {id:"juego",emoji:"🎮",text:"Juego respetuoso"}
  ];

  function createCards(){
    cardsContainer.innerHTML="";
    scenarios.forEach(s=>{
      const card=document.createElement("button");
      card.type="button";
      card.className="traffic-card";
      card.draggable=true;
      card.dataset.sid=s.id;
      card.innerHTML=`<span class="emoji">${s.emoji}</span><span class="text">${s.text}</span>`;
      card.addEventListener("dragstart",e=>{
        e.dataTransfer.effectAllowed="move";
        e.dataTransfer.setData("text/plain",s.id);
        setTimeout(()=>card.classList.add("dragging"),0);
      });
      card.addEventListener("dragend",()=>{
        card.classList.remove("dragging");
      });
      cardsContainer.appendChild(card);
    });
  }

  zones.forEach(zone=>{
    zone.addEventListener("dragover",e=>{
      e.preventDefault();
    });
    zone.addEventListener("drop",e=>{
      e.preventDefault();
      const id=e.dataTransfer.getData("text/plain");
      if(!id) return;
      const card=document.querySelector(`.traffic-card[data-sid="${id}"]`);
      if(card) zone.appendChild(card);
      checkAllPlaced();
    });
  });

  function checkAllPlaced(){
    const remaining=cardsContainer.querySelectorAll(".traffic-card").length;
    if(remaining===0){
      msg.textContent="Has colocado todas las situaciones. Si algo te incomoda, puedes contarlo.";
      celebrate();
    }
  }

  function init(){
    zones.forEach(z=>{
      z.querySelectorAll(".traffic-card").forEach(c=>c.remove());
    });
    msg.textContent="";
    createCards();
  }

  reset?.addEventListener("click",init);
  init();
})();

/* ===== Carrusel Aprende ===== */
(() => {
  const car=$("#carousel"); if(!car) return;
  const track=$(".car-track",car), slides=$$(".slide",car); let idx=0;
  const go=i=>{ idx=(i+slides.length)%slides.length; track.style.transform=`translateX(-${idx*100}%)`; };
  $(".prev",car).addEventListener("click",()=>go(idx-1));
  $(".next",car).addEventListener("click",()=>go(idx+1));
})();

/* ===== Ayuda y Reflexiones (poblar) ===== */
const HELP_MX=[
  {name:"Línea de la Vida (MX)",type:"Teléfono",value:"800 911 2000",desc:"Orientación 24/7."},
  {name:"LOCATEL CDMX (MX)",type:"Teléfono",value:"55 5658 1111",desc:"Canalización (CDMX)."},
  {name:"Consejo Ciudadano (CDMX)",type:"Web",value:"https://consejociudadanomx.org/servicios/apoyo-psicologico-626ffa1400068",desc:"Apoyo 24/7; también WhatsApp."}
];

const HELP_VERACRUZ=[
  {name:"Denuncia anónima 089 (Veracruz)",type:"Teléfono",value:"089",desc:"Para reportar delitos o violencia de forma anónima."},
  {name:"DIF Veracruz – Denuncias de maltrato",type:"Web",value:"https://www.difver.gob.mx/denuncias-maltrato/",desc:"Reporta maltrato a niñas, niños y adolescentes."},
  {name:"Alerta de Violencia de Género Veracruz (AVGM)",type:"Web",value:"https://www.veracruz.gob.mx/avgm/",desc:"Información y recursos estatales para mujeres y niñas."}
];

const HELP_GLOBAL=[
  {name:"Child Helpline International",type:"Web",value:"https://www.childhelplineinternational.org/find-a-helpline/",desc:"Directorio global de líneas."},
  {name:"Befrienders Worldwide",type:"Web",value:"https://www.befrienders.org/",desc:"Apoyo emocional y crisis."},
  {name:"Find a Helpline",type:"Web",value:"https://findahelpline.com/countries/mx",desc:"Buscador por país y tema."},
  {name:"IWF Report (Global)",type:"Web",value:"https://report.iwf.org.uk/es",desc:"Reporta material de abuso infantil en línea."}
];

(() => {
  function render(list, mount){
    if(!mount) return;
    mount.innerHTML="";
    list.forEach(c=>{
      const el=document.createElement("div");
      el.className="help-card";
      const href=c.type==="Web"?c.value:`tel:${c.value.replace(/\s+/g,"")}`;
      el.innerHTML=`<h4>${c.name}</h4><p class="muted">${c.desc}</p><a class="call" target="_blank" rel="noopener" href="${href}"><strong>${c.value}</strong></a>`;
      mount.appendChild(el);
    });
  }
  render(HELP_MX,$("#helpGridMX"));
  render(HELP_VERACRUZ,$("#helpGridVeracruz"));
  render(HELP_GLOBAL,$("#helpGridGlobal"));
})();

(() => {
  const items=[
    {t:"Pedir ayuda es un plan",tag:"Plan",p:"Elige a una persona de confianza y acuerden una palabra clave."},
    {t:"Consentimiento claro",tag:"Consentimiento",p:"Si hay presión o miedo, no hay consentimiento."},
    {t:"Red en la escuela",tag:"Red",p:"Docentes y amistades pueden ser parte de tu red."},
    {t:"Cuidados en línea",tag:"Digital",p:"Configura privacidad y bloquea cuentas que incomoden."}
  ];
  const grid=$("#blogGrid"); if(!grid) return;
  items.forEach((x)=>{
    const c=document.createElement("article");
    c.className="blog-card";
    c.innerHTML=`<span class="tag">${x.tag}</span><h4>${x.t}</h4><p>${x.p}</p>`;
    grid.appendChild(c);
  });
})();

/* ===== Navegación de pasos en "Cómo denunciar" + tarjetas de confianza ===== */
const denunciaSection = $("#denuncia");

if (denunciaSection){
  const stepBlocks = $$(".denuncia-step", denunciaSection);
  const chips = $$(".denuncia-step-chip", denunciaSection);
  const progressLabel = $("#denunciaProgressLabel");
  const progressFill = $("#denunciaProgressFill");

  function setActiveStep(step){
    const total = stepBlocks.length;
    const stepStr = String(step);
    const targetBlock = stepBlocks.find(b => b.dataset.step === stepStr);
    if (!targetBlock) return;

    // Chips activas
    chips.forEach(chip => {
      chip.classList.toggle("is-active", chip.dataset.step === stepStr);
    });

    // Progreso
    if (progressLabel){
      progressLabel.textContent = `Paso ${step} de ${total}`;
    }
    if (progressFill){
      const pct = (step / total) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Scroll suave al bloque
    targetBlock.scrollIntoView({behavior:"smooth", block:"start"});
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const step = Number(chip.dataset.step || "1");
      setActiveStep(step);
    });
  });

  // 🧸 Tarjetas de confianza (Paso 1)
  const step1 = $("#denuncia-step-1");
  if (step1){
    const trustGrid = $(".trust-grid", step1);
    const trustCards = trustGrid ? $$(".trust-card", trustGrid) : [];
    const hint = $(".trust-hint", step1);
    const resetBtn = $(".trust-reset", step1);
    const confettiLayer = $(".confetti-layer", step1);

    const okCards = trustCards.filter(c => c.dataset.type === "ok");
    const totalOk = okCards.length;
    let okTouched = 0;
    let wrongTouched = false;

    function showMessage(type){
      if (!hint) return;
      if (type === "ok"){
        hint.textContent = "Es una buena opción para pedir ayuda. Busca a personas adultas de confianza que puedan protegerte. 💛";
      } else if (type === "warn"){
        hint.textContent = "Mejor no contarle a personas desconocidas o que no te den confianza. Busca a alguien adulto que sepas que quiere cuidarte. 🌱";
      } else if (type === "win"){
        hint.textContent = "¡Lo hiciste muy bien! Elegiste buenas opciones para pedir ayuda. 🎉";
      } else{
        hint.textContent = "";
      }
    }

    function triggerConfetti(){
      if (!confettiLayer) return;
      confettiLayer.innerHTML = "";
      const colors = ["#F06543","#FF7AA8","#F2B300","#4ade80","#38bdf8"];
      const pieces = 70;

      for (let i = 0; i < pieces; i++){
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 0.6}s`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confettiLayer.appendChild(piece);
      }

      // Limpiar confeti después
      setTimeout(() => {
        if (confettiLayer) confettiLayer.innerHTML = "";
      }, 1800);
    }

    function resetTrustGame(){
      okTouched = 0;
      wrongTouched = false;
      trustCards.forEach(card => {
        card.classList.remove("selected","ok","warn","gone","shake");
        card.style.display = "";
        delete card.dataset.hit;
      });
      if (resetBtn) resetBtn.hidden = true;
      showMessage("");
      if (confettiLayer) confettiLayer.innerHTML = "";
    }

    if (resetBtn){
      resetBtn.addEventListener("click", resetTrustGame);
    }

    trustCards.forEach(card => {
      card.addEventListener("click", () => {
        // Si ya "contó" como clic bueno, no repetir
        if (card.dataset.hit === "1") return;

        const type = card.dataset.type || "warn";

        if (type === "ok"){
          card.dataset.hit = "1";
          okTouched++;

          card.classList.add("selected","ok","gone");
          showMessage("ok");

          // Después de la animación, ocultar del grid
          setTimeout(() => {
            card.style.display = "none";
          }, 360);

          if (okTouched === totalOk){
            showMessage("win");
            triggerConfetti();
          }
        } else {
          wrongTouched = true;
          card.classList.add("selected","warn","shake");
          showMessage("warn");

          // quitar shake luego
          setTimeout(() => {
            card.classList.remove("shake");
          }, 260);

          if (resetBtn){
            resetBtn.hidden = false;
          }
        }
      });
    });
  }
    // 👥 Paso 2: roles (niña/niño, adulto, testigo)
  const step2 = $("#denuncia-step-2");
  if (step2){
    const roleButtons = $$(".role-toggle", step2);
    const rolePanels = $$(".role-panel", step2);

    function setRole(role){
      // Botones activos
      roleButtons.forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.role === role);
      });

      // Paneles visibles
      rolePanels.forEach(panel => {
        panel.hidden = panel.dataset.role !== role;
      });
    }

    roleButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const role = btn.dataset.role || "nino";
        setRole(role);
      });
    });

    // Rol inicial
    const firstRole = roleButtons[0]?.dataset.role || "nino";
    setRole(firstRole);
  }

    // ✅ Paso 3: checklist interactiva
  const step3 = $("#denuncia-step-3");
  if (step3){
    const pills = $$(".check-pill", step3);
    const countSpan = $("#denunciaChecklistCount");
    const total = pills.length;

    function updateChecklistCount(){
      const checked = pills.filter(p => p.classList.contains("is-checked")).length;
      if (countSpan){
        countSpan.textContent = String(checked);
      }
    }

    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        const mark = $(".check-mark", pill);

        const isChecked = pill.classList.toggle("is-checked");

        if (mark){
          mark.textContent = isChecked ? "✅" : "⚫";
        }

        updateChecklistCount();
      });
    });

    // Estado inicial
    updateChecklistCount();
  }

    // 🔁 Paso 4: stepper de proceso
  const step4 = $("#denuncia-step-4");
  if (step4){
    const nodes = $$(".flow-node", step4);
    const panels = $$(".flow-panel", step4);

    function setPhase(phase){
      const phaseStr = String(phase);

      nodes.forEach(node => {
        node.classList.toggle("is-active", node.dataset.phase === phaseStr);
      });

      panels.forEach(panel => {
        panel.hidden = panel.dataset.phase !== phaseStr;
      });
    }

    nodes.forEach(node => {
      node.addEventListener("click", () => {
        const phase = node.dataset.phase || "1";
        setPhase(phase);
      });
    });

    // Fase inicial
    setPhase(1);
  }

    // 📄 Paso 5: elementos de prueba interactivos
  const step5 = $("#denuncia-step-5");
  if (step5){
    const chips = $$(".evidence-chip", step5);
    const details = $$(".evidence-detail", step5);

    function setEvidence(key){
      chips.forEach(chip => {
        chip.classList.toggle("is-active", chip.dataset.evidence === key);
      });

      details.forEach(panel => {
        panel.hidden = panel.dataset.evidence !== key;
      });
    }

    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.evidence || "declaraciones";
        setEvidence(key);
      });
    });

    // Estado inicial
    setEvidence("declaraciones");
  }

    // ⏱️ Paso 6: línea de tiempo y emociones
  const step6 = $("#denuncia-step-6");
  if (step6){
    // Línea de tiempo
    const nodes = $$(".timeline-node", step6);
    const panels = $$(".timeline-panel", step6);

    function setStage(stage){
      const stageStr = String(stage);
      nodes.forEach(node => {
        node.classList.toggle("is-active", node.dataset.stage === stageStr);
      });
      panels.forEach(panel => {
        const isActive = panel.dataset.stage === stageStr;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      });
    }

    nodes.forEach(node => {
      node.addEventListener("click", () => {
        const stage = node.dataset.stage || "1";
        setStage(stage);
      });
    });

    setStage(1);

    // Emociones
    const emotionButtons = $$(".emotion-btn", step6);
    const emotionMsg = $(".emotion-message", step6);

    function getEmotionText(mood){
      switch (mood){
        case "miedo":
          return "Es muy comprensible sentir miedo. No tienes que pasar por esto sola/o: buscar apoyo es una forma de cuidarte.";
        case "enojo":
          return "Sentir enojo puede ser una respuesta natural ante una injusticia. Ese enojo también puede convertirse en fuerza para pedir ayuda.";
        case "confusion":
          return "Cuando pasan cosas difíciles, es normal no entender todo. Hacer preguntas y hablar con personas de confianza puede aclarar muchas dudas.";
        case "esperanza":
          return "Tener un poquito de esperanza es valioso. Cada paso para denunciar y pedir apoyo es un avance para tu seguridad y bienestar.";
        default:
          return "";
      }
    }

    emotionButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const mood = btn.dataset.mood || "";
        emotionButtons.forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (emotionMsg){
          emotionMsg.textContent = getEmotionText(mood);
        }
      });
    });
  }

    // 🎠 Paso 7: carrusel de métodos de denuncia
  const step7 = $("#denuncia-step-7");
  if (step7){
    const trackWrap = $(".method-track-wrap", step7);
    const track = $(".method-track", step7);
    const slides = track ? $$(".method-slide", track) : [];
    const prevBtn = $(".method-nav.prev", step7);
    const nextBtn = $(".method-nav.next", step7);
    const dots = $$(".method-dot", step7);
    const counter = $(".method-counter", step7);

    let currentIndex = 0;
    const total = slides.length;

    function updateCarousel(index){
      if (!track || !slides.length) return;

      if (index < 0) index = 0;
      if (index > total - 1) index = total - 1;
      currentIndex = index;

      const offset = -100 * currentIndex;
      track.style.transform = `translateX(${offset}%)`;

      // Dots
      dots.forEach(dot => {
        const i = Number(dot.dataset.index || "0");
        dot.classList.toggle("is-active", i === currentIndex);
      });

      // Contador
      if (counter){
        counter.textContent = `${currentIndex + 1} de ${total}`;
      }
    }

    if (prevBtn){
      prevBtn.addEventListener("click", () => {
        updateCarousel(currentIndex - 1);
      });
    }

    if (nextBtn){
      nextBtn.addEventListener("click", () => {
        updateCarousel(currentIndex + 1);
      });
    }

    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const i = Number(dot.dataset.index || "0");
        updateCarousel(i);
      });
    });

    // Arranque
    updateCarousel(0);
  }

    // 🌸 Paso 8: FAQs + consejos
  const step8 = $("#denuncia-step-8");
  if (step8){

    // FAqs
    const faqButtons = $$(".faq-question", step8);
    faqButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.faq;
        const answer = $(`.faq-answer[data-faq="${key}"]`, step8);
        if (!answer) return;

        const isHidden = answer.hidden;
        answer.hidden = !isHidden;
      });
    });

    // Consejos
    const chips = $$(".advice-chip", step8);
    const advicePanel = $("#advicePanel");

    function getAdvice(key){
      switch(key){
        case "respira":
          return "Respirar profundo 3 veces puede ayudarte a bajar un poquito la tensión.";
        case "apoyo":
          return "Hablar con una persona de confianza ayuda mucho a sentirte acompañada/o.";
        case "info":
          return "Anotar fechas, nombres o lo que recuerdes puede ayudarte después.";
        case "calma":
          return "Has avanzado mucho al denunciar. Date crédito y tiempo para sentir.";
        default:
          return "";
      }
    }

    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(c => c.classList.remove("is-active"));
        chip.classList.add("is-active");

        const key = chip.dataset.advice;
        advicePanel.textContent = getAdvice(key);
      });
    });
  }

  
}

/* ===== Foro: conectado al servidor ===== */
(() => {
  const foro = $("#foro");
  if (!foro) return;

  const strip        = $("#sfThreadStrip");
  const list         = $("#sfThreadList");
  const emptyMsg     = $("#sfEmpty");
  const form         = $("#sfForm");
  const input        = $("#sfText");
  const cooldownMsg  = $("#sfCooldownMsg");

  const modal        = $("#threadModal");
  const modalBackdrop= modal ? $(".thread-backdrop", modal) : null;
  const modalClose   = $("#threadCloseBtn");
  const threadScroll = $("#threadScroll");
  const replyForm    = $("#threadReplyForm");
  const replyInput   = $("#threadReplyText");

  const ANON_COOLDOWN_MS = 15000; // 15 s entre mensajes anónimos
  const LAST_ANON_KEY    = "kiva_forum_last_anon";

  let threads        = [];
  let activeThreadId = null;

  function now(){ return Date.now(); }

  function timeAgo(ts){
    const diff = Math.max(0, now() - ts);
    const s = Math.floor(diff / 1000);
    if (s < 60) return "hace unos segundos";
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    return `hace ${h} h`;
  }

  function escapeHtml(str){
    return String(str || "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");
  }

  function currentUser(){
    return (window.kivaAuth && window.kivaAuth.user) || null;
  }

  function canPostAnon(){
    const last = Number(localStorage.getItem(LAST_ANON_KEY) || "0");
    const diff = now() - last;
    if (diff >= ANON_COOLDOWN_MS) return { ok:true, wait:0 };
    return { ok:false, wait:Math.ceil((ANON_COOLDOWN_MS - diff)/1000) };
  }

  function updateCooldownLabel(){
    const user = currentUser();
    if (user){
      if (cooldownMsg){
        cooldownMsg.textContent = "Publicas con tu cuenta. Gracias por cuidar este espacio 💛";
      }
      return;
    }
    const { ok, wait } = canPostAnon();
    if (!cooldownMsg) return;
    cooldownMsg.textContent = ok
      ? "Puedes enviar un mensaje anónimo."
      : `Espera ${wait}s para enviar otro mensaje anónimo.`;
  }

  /* === Cargar hilos del servidor === */
  async function loadThreads(){
    try{
      const res  = await fetch("/api/threads", { credentials:"include" });
      const data = await res.json();
      threads = Array.isArray(data.threads) ? data.threads : [];
      render();
      updateCooldownLabel();
    }catch(err){
      console.error(err);
      if (emptyMsg){
        emptyMsg.textContent = "No se pudieron cargar los mensajes.";
      }
    }
  }

  /* === Render principal === */
  function render(){
    if (!list || !strip) return;

    const sorted = [...threads].sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (!sorted.length){
      if (emptyMsg) emptyMsg.style.display = "block";
    }else{
      if (emptyMsg) emptyMsg.style.display = "none";
    }

    // top por likes (tira de los datos actuales)
    const topLiked = [...threads]
      .filter(t => (t.likes || 0) > 0)
      .sort((a,b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 6);

    strip.innerHTML = "";
    topLiked.forEach(t => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "sf-strip-card";
      card.innerHTML = `
        <div class="sf-strip-text">${escapeHtml((t.text || "").slice(0, 40))}</div>
        <div class="sf-strip-heart">❤ ${t.likes || 0}</div>
      `;
      card.addEventListener("click", () => openThread(t.id));
      strip.appendChild(card);
    });

    list.innerHTML = "";
    sorted.forEach(t => {
      const repliesCount = (t.replies || []).length;
      const card = document.createElement("article");
      card.className = "sf-thread-card";
      card.dataset.threadId = t.id;

      const alias = t.alias || (t.isAnon ? "Anónimo" : "Usuario");
      const timeLabel = timeAgo(t.createdAt || now());
      const avatarHtml = t.avatarPath
        ? `<img src="${escapeHtml(t.avatarPath)}" alt="${escapeHtml(alias)}">`
        : `<span class="sf-avatar-placeholder">${t.isAnon ? "🌱" : "🙂"}</span>`;

      card.innerHTML = `
        <div class="sf-thread-head">
          <div class="sf-thread-avatar">
            ${avatarHtml}
          </div>
          <div class="sf-thread-meta">
            <span class="sf-thread-alias">${escapeHtml(alias)}</span>
            <span class="sf-thread-time">${timeLabel}</span>
          </div>
        </div>

        <div class="sf-thread-text">${escapeHtml(t.text || "")}</div>

        <div class="sf-thread-actions">
          <span class="sf-like-btn">
            <button type="button" class="sf-heart-btn" aria-label="Dar like">❤</button>
            <span>${t.likes || 0}</span>
          </span>
          <span class="sf-reply-count">
            💬 <span>${repliesCount}</span> respuestas
          </span>
        </div>
      `;


      card.addEventListener("click", (ev) => {
        if (ev.target.closest("button")) return;
        openThread(t.id);
      });

      const likeBtn = card.querySelector(".sf-heart-btn");
      likeBtn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const user = currentUser();
        if (!user){
          if (cooldownMsg){
            cooldownMsg.textContent = "Necesitas una cuenta para dar like 💛";
          }
          return;
        }
        try{
          const res  = await fetch(`/api/threads/${encodeURIComponent(t.id)}/like`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            credentials:"include",
            body: JSON.stringify({})
          });
          const data = await res.json();
          if (!res.ok){
            console.error(data.error);
            return;
          }
          updateThreadInLocalList(data.thread);
          render();
          if (activeThreadId === t.id){
            const updated = threads.find(x => x.id === t.id);
            if (updated) renderThread(updated);
          }
          const refreshedBtn = list.querySelector(
            `.sf-thread-card[data-thread-id="${t.id}"] .sf-heart-btn`
          );
          if (refreshedBtn){
            refreshedBtn.classList.add("is-pulsing");
            setTimeout(() => refreshedBtn.classList.remove("is-pulsing"), 450);
          }
        }catch(err){
          console.error(err);
        }
      });

      list.appendChild(card);
    });
  }

  function updateThreadInLocalList(updated){
    if (!updated) return;
    const idx = threads.findIndex(t => t.id === updated.id);
    if (idx >= 0) threads[idx] = updated;
  }

  /* === Modal hilo === */
  function openThread(id){
    const t = threads.find(x => x.id === id);
    if (!t || !modal) return;
    activeThreadId = id;
    renderThread(t);
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    if (replyInput){
      replyInput.value = "";
      replyInput.focus();
    }
  }

  function closeThread(){
    if (!modal) return;
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    activeThreadId = null;
  }

  function renderThread(t){
    if (!threadScroll) return;
    threadScroll.innerHTML = "";

    // mensaje raíz (el hilo principal)
    const rootAlias = t.alias || (t.isAnon ? "Anónimo" : "Usuario");
    const rootAvatarHtml = t.avatarPath
      ? `<img src="${escapeHtml(t.avatarPath)}" alt="${escapeHtml(rootAlias)}">`
      : `<span class="thread-avatar-placeholder">${t.isAnon ? "🌱" : "🙂"}</span>`;

    const root = document.createElement("div");
    root.className = "thread-msg";
    root.innerHTML = `
      <div class="thread-msg-head">
        <div class="thread-msg-avatar">
          ${rootAvatarHtml}
        </div>
        <div class="thread-msg-meta">
          <span class="thread-msg-alias">${escapeHtml(rootAlias)}</span>
          <span class="thread-msg-time">${timeAgo(t.createdAt || now())}</span>
        </div>
      </div>
      <div class="thread-msg-text">${escapeHtml(t.text || "")}</div>
    `;
    threadScroll.appendChild(root);

    // respuestas
    (t.replies || []).forEach(r => {
      const replyAlias = r.alias || (r.isAnon ? "Anónimo" : "Usuario");
      const replyAvatarHtml = r.avatarPath
        ? `<img src="${escapeHtml(r.avatarPath)}" alt="${escapeHtml(replyAlias)}">`
        : `<span class="thread-avatar-placeholder">${r.isAnon ? "🌱" : "🙂"}</span>`;

      const el = document.createElement("div");
      el.className = "thread-msg";
      el.innerHTML = `
        <div class="thread-msg-head">
          <div class="thread-msg-avatar">
            ${replyAvatarHtml}
          </div>
          <div class="thread-msg-meta">
            <span class="thread-msg-alias">${escapeHtml(replyAlias)}</span>
            <span class="thread-msg-time">${timeAgo(r.createdAt || now())}</span>
          </div>
        </div>
        <div class="thread-msg-text">${escapeHtml(r.text || "")}</div>
      `;
      threadScroll.appendChild(el);
    });

    threadScroll.scrollTop = threadScroll.scrollHeight;
  }


  /* === Eventos === */

  form?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const text = (input?.value || "").trim();
    if (!text) return;

    const user = currentUser();
    // anónimo si no hay usuario
    if (!user){
      const { ok, wait } = canPostAnon();
      if (!ok){
        if (cooldownMsg){
          cooldownMsg.textContent = `Espera ${wait}s para enviar otro mensaje anónimo.`;
        }
        return;
      }
      localStorage.setItem(LAST_ANON_KEY, String(now()));
    }

    try{
      const res  = await fetch("/api/threads",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok){
        console.error(data.error);
        if (cooldownMsg && data.error){
          cooldownMsg.textContent = data.error;
        }
        return;
      }
      if (input) input.value = "";
      threads.unshift(data.thread);
      render();
      updateCooldownLabel();
    }catch(err){
      console.error(err);
    }
  });

  if (modalBackdrop){
    modalBackdrop.addEventListener("click", closeThread);
  }
  if (modalClose){
    modalClose.addEventListener("click", closeThread);
  }

  replyForm?.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    if (!activeThreadId) return;
    const text = (replyInput?.value || "").trim();
    if (!text) return;

    try{
      const res  = await fetch(`/api/threads/${encodeURIComponent(activeThreadId)}/replies`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok){
        console.error(data.error);
        return;
      }
      updateThreadInLocalList(data.thread);
      const t = threads.find(x => x.id === activeThreadId);
      if (replyInput) replyInput.value = "";
      if (t){
        renderThread(t);
        render();
      }
    }catch(err){
      console.error(err);
    }
  });

  // Escuchar cambios de usuario (cuando se loguea / desloguea)
  document.addEventListener("kiva:user-changed", () => {
    updateCooldownLabel();
  });

  updateCooldownLabel();
  loadThreads();

})();


/* =====================================
   AUTENTICACIÓN: signup / login / logout
===================================== */
(() => {
  const authModal     = $("#authModal");
  if (!authModal) return;

  const authBackdrop  = $(".auth-backdrop", authModal);
  const authCloseBtn  = $("#authCloseBtn");
  const tabLogin      = $("#authTabLogin");
  const tabSignup     = $("#authTabSignup");
  const formLogin     = $("#authLoginForm");
  const formSignup    = $("#authSignupForm");
  const loginUser     = $("#loginUser");
  const loginPassword = $("#loginPassword");
  const signupFirst   = $("#signupFirstName");
  const signupLast    = $("#signupLastName");
  const signupEmail   = $("#signupEmail");
  const signupPass      = $("#signupPassword");
  const signupAlias     = $("#signupAlias");
  const signupAvatarFile= $("#signupAvatarFile");
  const loginErr        = $("#authLoginError");
  const signupErr       = $("#authSignupError");
  const authStatusMsg   = $("#authStatusMsg");

  // elementos para verificación por código
  const authVerifyBlock = $("#authVerifyBlock");
  const signupCode      = $("#signupCode");
  const btnVerifyCode   = $("#btnVerifyCode");
  const authVerifyError = $("#authVerifyError");

  const logoutBtn     = $("#authLogoutBtn");

  const openAuthBtn   = $("#sfOpenAuth");
  const userStateLbl  = $("#sfUserState");

  let currentUser = null;

  // Mostrar / ocultar contraseña (ojito sencillo, sin navegar)
  document.querySelectorAll(".auth-toggle-pass").forEach(toggle => {
    // Evita que el mousedown dispare otros manejadores raros
    toggle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();   // <- importantísimo

      const id = toggle.dataset.target;
      const input = document.getElementById(id);
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      toggle.textContent = isPassword ? "🙈" : "👁";
      return false; // por si algún handler viejo mira el retorno
    });
  });



  async function apiGet(url){
    try{
      const res  = await fetch(url,{ credentials:"include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error de servidor");
      return data;
    }catch(err){
      throw err;
    }
  }

  async function apiPost(url, body){
    try{
      const res  = await fetch(url,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body:JSON.stringify(body || {})
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error de servidor");
      return data;
    }catch(err){
      throw err;
    }
  }

  function toggleMode(mode){
    const isLogin = mode === "login";
    if (tabLogin)  tabLogin.classList.toggle("is-active", isLogin);
    if (tabSignup) tabSignup.classList.toggle("is-active", !isLogin);
    if (formLogin) formLogin.classList.toggle("is-hidden", !isLogin);
    if (formSignup) formSignup.classList.toggle("is-hidden", isLogin);
  }

  function openModal(mode="login"){
    toggleMode(mode);
    authModal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    if (loginErr)  loginErr.textContent  = "";
    if (signupErr) signupErr.textContent = "";

    if (mode === "login" && loginUser){
      loginUser.focus();
    }else if (signupFirst){
      signupFirst.focus();
    }
  }

  function closeModal(){
    authModal.hidden = true;
    document.documentElement.style.overflow = "";
  }

  function displayUserState(){
    if (!userStateLbl) return;
    if (!currentUser){
      userStateLbl.innerHTML = `Publicarás como <strong>Anónimo</strong>`;
    }else{
      const niceName = currentUser.alias && currentUser.alias.trim()
        ? currentUser.alias
        : `${currentUser.firstName} ${currentUser.lastName}`.trim();
      userStateLbl.innerHTML = `Publicarás como <strong>${niceName}</strong>`;
    }
  }

  function setUser(user){
    currentUser = user || null;
    displayUserState();

    if (logoutBtn){
      logoutBtn.hidden = !currentUser;
    }

    window.kivaAuth = window.kivaAuth || {};
    window.kivaAuth.user = currentUser;

    const ev = new CustomEvent("kiva:user-changed",{ detail:{ user: currentUser }});
    document.dispatchEvent(ev);
  }

  openAuthBtn?.addEventListener("click", () => {
    openModal(currentUser ? "login" : "signup");
  });

  authBackdrop?.addEventListener("click", closeModal);
  authCloseBtn?.addEventListener("click", closeModal);

  tabLogin?.addEventListener("click", () => toggleMode("login"));
  tabSignup?.addEventListener("click", () => toggleMode("signup"));

  formLogin?.addEventListener("submit", async e => {
    e.preventDefault();
    if (loginErr) loginErr.textContent = "";
    try{
      const data = await apiPost("/api/login",{
        login: loginUser.value,
        password: loginPassword.value
      });
      setUser(data.user);
      if (authStatusMsg) authStatusMsg.textContent = "Inicio de sesión correcto 💛";
      closeModal();
    }catch(err){
      if (loginErr) loginErr.textContent = err.message || "No se pudo iniciar sesión";
    }
  });

  formSignup?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (signupErr) signupErr.textContent = "";
    if (authVerifyError) authVerifyError.textContent = "";

    try{
      const fd = new FormData();
      fd.append("email",      signupEmail.value);
      fd.append("firstName",  signupFirst.value);
      fd.append("lastName",   signupLast.value);
      fd.append("password",   signupPass.value);
      fd.append("alias",      signupAlias.value);

      if (signupAvatarFile && signupAvatarFile.files[0]){
        fd.append("avatar", signupAvatarFile.files[0]);
      }

      const res  = await fetch("/api/signup",{
        method:"POST",
        credentials:"include",
        body: fd
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok){
        throw new Error(data.error || "No se pudo crear la cuenta");
      }

      if (data.needsVerification){
        if (authStatusMsg){
          authStatusMsg.textContent = "Te enviamos un código a tu correo. Revísalo 💛";
        }
        if (authVerifyBlock){
          authVerifyBlock.classList.remove("is-hidden");
        }
        // NO llamamos a setUser todavía: esperamos a que verifique el código
      }else if (data.user){
        setUser(data.user);
        if (authStatusMsg) authStatusMsg.textContent = "Cuenta creada y sesión iniciada 💛";
        closeModal();
      }
    }catch(err){
      if (signupErr) signupErr.textContent = err.message || "No se pudo crear la cuenta";
    }
  });

    // Verificar código enviado al correo
  btnVerifyCode?.addEventListener("click", async () => {
    if (authVerifyError) authVerifyError.textContent = "";
    try{
      const code = (signupCode?.value || "").trim();
      if (!code){
        throw new Error("Escribe el código que te llegó al correo.");
      }

      const res  = await fetch("/api/verify-email",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({
          email: signupEmail.value,
          code
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok){
        throw new Error(data.error || "Código incorrecto");
      }

      if (data.user){
        setUser(data.user);
        if (authStatusMsg) authStatusMsg.textContent = "Correo verificado y sesión iniciada 💛";
        closeModal();
      }
    }catch(err){
      if (authVerifyError) authVerifyError.textContent = err.message || "No se pudo verificar el código";
    }
  });



  logoutBtn?.addEventListener("click", async () => {
    try{
      await apiPost("/api/logout",{});
    }catch{}
    setUser(null);
    if (authStatusMsg) authStatusMsg.textContent = "Sesión cerrada.";
  });

  (async () => {
    try{
      const data = await apiGet("/api/me");
      setUser(data.user);
      if (data.user && authStatusMsg){
        authStatusMsg.textContent = "Sesión activa.";
      }
    }catch{
      setUser(null);
    }
  })();

})();
