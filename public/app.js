
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
/* Navegación + fondo por sección */
/* ===== MANEJO DEL MENÚ LATERAL ===== */
const backdrop = document.getElementById("navBackdrop");
const sidenav  = document.getElementById("sidenav");
const navOpenBtn = document.getElementById("navOpen");
const navCloseBtn = document.getElementById("navClose");

// Función para abrir
if (navOpenBtn) {
  navOpenBtn.addEventListener("click", () => {
    sidenav.classList.add("open");
    backdrop.hidden = false;
    document.documentElement.style.overflow = "hidden"; // Evita scroll al estar abierto
  });
}

// Función para cerrar
function closeNav() {
  if (sidenav) sidenav.classList.remove("open");
  if (backdrop) backdrop.hidden = true;
  document.documentElement.style.overflow = "";
}

if (navCloseBtn) navCloseBtn.addEventListener("click", closeNav);
if (backdrop) backdrop.addEventListener("click", closeNav);

// Cerrar menú si se hace clic en un enlace
document.querySelectorAll('.snav-link').forEach(link => {
  link.addEventListener('click', closeNav);
});

/* Carrusel portada (botones + arrastre/ swipe) */

/* ===== Dial Emocionómetro ===== */
(() => {
  const wrap = $("#emociono"); 
  if (!wrap) return;

  const range = $("#emoRange", wrap),
        label = $(".emo-label", wrap),      // aquí pondremos el MENSAJE
        knob  = $("#dialKnob", wrap),
        emoji = $("#dialEmoji", wrap);

  // agrandamos un poquito la bolita
  if (knob) knob.setAttribute("r", "14");

  // Estados con mensaje y color (verde → amarillo → rojo)
  const states = [
    {
      max: 20,
      name: "Feliz",
      emoji: "😊",
      message: "Qué bueno que estás feliz. Sigue adelante inspirando alegría a las demás personas.",
      color: "#16a34a" // verde
    },
    {
      max: 45,
      name: "Tranquila/o",
      emoji: "🙂",
      message: "Sentirte tranquila/o te ayuda a disfrutar tu día y tomar decisiones con calma.",
      color: "#22c55e" // verde clarito
    },
    {
      max: 70,
      name: "Inquieta/o",
      emoji: "😕",
      message: "Está bien sentirte inquieta/o. Hablar con alguien de confianza puede ayudarte a ordenar lo que sientes.",
      color: "#eab308" // amarillo
    },
    {
      max: 85,
      name: "Triste",
      emoji: "😔",
      message: "Sentir tristeza es válido. Buscar apoyo puede hacer que ese peso se sienta más ligero.",
      color: "#f97316" // naranja
    },
    {
      max: 100,
      name: "Enojada/o",
      emoji: "😠",
      message: "No está mal sentirse enojada/o, pero es importante cuidar cómo expresas ese enojo para que no se salga de control.",
      color: "#dc2626" // rojo
    }
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

    if (label){
      // Mensaje personalizado + color según emoción
      label.textContent = s.message;
      label.style.color = s.color;
    }

    if (emoji){
      emoji.textContent = s.emoji;
    }
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
    const ringInner = R - 10;
    const ringOuter = R + 10;

    const touchingRing = (y <= cy) && distCenter >= ringInner && distCenter <= ringOuter;
    const touchingKnob = distKnob <= 20;

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
  const game = $("#mensaje");
  if (!game) return;

  const box   = $(".chips", game),
        out   = $(".msg-out", game),
        reset = $("[data-game='mensaje']", game);

  const pieces = ["Hablar","con","alguien","de","confianza","es","valentía"];
  const goal   = pieces.join(" ");

  let dragEl = null;
  const chipColors = ["#FFD6E7","#FFF4B8","#E5D6FF","#FFD9C8","#CFEAFF","#FFE6F2"];

  const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function init(){
    box.innerHTML = "";
    out.textContent = "";

    shuffle(pieces.map((t, i) => ({ t, i }))).forEach(o => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = o.t;
      b.dataset.idx = o.i;
      b.draggable = true;
      b.style.background = chipColors[o.i % chipColors.length];
      box.appendChild(b);
    });
  }

  box.addEventListener("pointerdown", e => {
    const el = e.target.closest(".chip");
    if (!el) return;
    e.preventDefault();
    dragEl = el;
    el.classList.add("dragging");
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up, { once: true });
  });

  function move(e){
    if (!dragEl) return;
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(".chip");
    if (over && over !== dragEl){
      const r    = over.getBoundingClientRect();
      const next = (e.clientX - r.left) > (r.width / 2);
      if (next && over.nextSibling) box.insertBefore(dragEl, over.nextSibling);
      else if (!next) box.insertBefore(dragEl, over);
    }
  }

  function up(){
    if (!dragEl) return;
    dragEl.classList.remove("dragging");
    dragEl = null;
    document.removeEventListener("pointermove", move);
    check();
  }

  function check(){
    // 👇 ESTA LÍNEA ES LA IMPORTANTE
    const cur = [...$$(".chip", box)].map(e => e.textContent).join(" ");
    out.textContent = (cur === goal)
      ? "Mensaje listo. Pedir ayuda es un acto de valentía."
      : "";
    if (cur === goal) celebrate();
  }

  reset.addEventListener("click", init);
  init();
})();


/* ===== Semáforo de las sensaciones ===== */
(() => {
  const wrap = $("semaforo");
  if (!wrap) return;

  const cardsContainer = $(".traffic-cards", wrap);
  const zones          = $$(".traffic-zone", wrap);
  const msg            = $(".traffic-msg", wrap);
  const reset          = $("[data-game='semaforo']", wrap);

  // Cada situación con su color "más correcto"
  const scenarios = [
    { id: "abrazo", emoji: "🤗", text: "Abrazo cariñoso",        correct: "green"  },
    { id: "gritos", emoji: "😣", text: "Gritos fuertes",         correct: "red"    },
    { id: "secreto",emoji: "🤫", text: "Secreto que incomoda",   correct: "yellow" },
    { id: "ayuda",  emoji: "🧑‍🏫", text: "Persona adulta que ayuda", correct: "green"  },
    { id: "foto",   emoji: "📸", text: "Piden foto rara",        correct: "red"    },
    { id: "juego",  emoji: "🎮", text: "Juego respetuoso",       correct: "green"  }
  ];

  const scenariosById = Object.fromEntries(scenarios.map(s => [s.id, s]));

  // Mensajes por combinación (situación + color)
  // tone: "good" (acertó), "warn" (duda/alerta), "bad" (no seguro)
  const explanations = {
    abrazo: {
      green: {
        text: "Un abrazo cariñoso que tú quieres recibir suele sentirse seguro y bonito.",
        tone: "good"
      },
      yellow: {
        text: "Si un abrazo te hace dudar o te incomoda, aunque digan que es cariñoso, vale la pena escuchar esa sensación.",
        tone: "warn"
      },
      red: {
        text: "Si te obligan a dar un abrazo o tocan tu cuerpo sin permiso, no es seguro aunque lo llamen cariñoso.",
        tone: "bad"
      }
    },
    gritos: {
      green: {
        text: "Los gritos fuertes casi nunca se sienten seguros. Tal vez este color no le queda a esta situación.",
        tone: "bad"
      },
      yellow: {
        text: "Si alguien grita y te hace sentir incómoda/o, es una señal de alerta. Puedes pedir que bajen la voz o alejarte.",
        tone: "warn"
      },
      red: {
        text: "Cuando hay gritos que asustan o lastiman, es una señal clara de que la situación no es segura.",
        tone: "bad"
      }
    },
    secreto: {
      green: {
        text: "Un secreto que incomoda no debe estar en verde. Los secretos que duelen se cuentan, no se guardan.",
        tone: "bad"
      },
      yellow: {
        text: "Si un secreto te incomoda o no estás segura/o, es una señal para hablar con alguien de confianza.",
        tone: "warn"
      },
      red: {
        text: "Si el secreto da miedo, vergüenza o te hace sentir en peligro, es una situación no segura. Contarlo es importante.",
        tone: "bad"
      }
    },
    ayuda: {
      green: {
        text: "Una persona adulta que escucha, respeta y cuida normalmente está en la zona segura.",
        tone: "good"
      },
      yellow: {
        text: "Si una persona adulta dice que ayuda pero te hace dudar o te incomoda, puedes buscar a otra persona de confianza.",
        tone: "warn"
      },
      red: {
        text: "Si una persona adulta lastima, amenaza o no respeta tus límites, no es segura aunque diga que ayuda.",
        tone: "bad"
      }
    },
    foto: {
      green: {
        text: "Pedir una 'foto rara' o de partes privadas nunca es una situación segura, aunque parezca un juego.",
        tone: "bad"
      },
      yellow: {
        text: "Si te confunde que pidan una foto rara, esa duda es una alerta. Puedes decir que no y pedir ayuda.",
        tone: "warn"
      },
      red: {
        text: "Cuando piden fotos raras o íntimas, es una situación no segura. Tienes derecho a decir que no y contarlo.",
        tone: "bad"
      }
    },
    juego: {
      green: {
        text: "Un juego respetuoso, donde todas las personas están de acuerdo y nadie se siente mal, suele ser seguro.",
        tone: "good"
      },
      yellow: {
        text: "Si en el juego empiezas a sentirte incómoda/o, excluida/o o presionada/o, es momento de poner atención.",
        tone: "warn"
      },
      red: {
        text: "Si en el juego te lastiman, insultan o te obligan a hacer cosas que no quieres, deja de ser seguro.",
        tone: "bad"
      }
    }
  };

  const toneColor = {
    good: "#15803d",  // verde
    warn: "#eab308",  // amarillo
    bad:  "#b91c1c"   // rojo
  };

  let placements = {};

  function setMessage(text, tone) {
    if (!msg) return;
    msg.textContent = text || "";
    msg.style.color = toneColor[tone] || "var(--ink)";
  }

  function createCards() {
    cardsContainer.innerHTML = "";
    placements = {};
    setMessage("", null);

    // limpiar cartas que hayan quedado dentro de las zonas
    zones.forEach(z => {
      $$(".traffic-card", z).forEach(c => c.remove());
    });

    scenarios.forEach(s => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "traffic-card";
      card.draggable = true;
      card.dataset.sid = s.id;
      card.innerHTML = `
        <span class="emoji">${s.emoji}</span>
        <span class="text">${s.text}</span>
      `.trim();

      card.addEventListener("dragstart", e => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", s.id);
        setTimeout(() => card.classList.add("dragging"), 0);
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
      });

      cardsContainer.appendChild(card);
    });
  }

  function handleDrop(sid, zoneKey) {
    const scenario = scenariosById[sid];
    if (!scenario) return;

    placements[sid] = zoneKey;

    const exp = explanations[sid]?.[zoneKey];
    if (exp) {
      setMessage(exp.text, exp.tone);
    } else {
      const ok = zoneKey === scenario.correct;
      setMessage(
        ok
          ? "Esta situación se parece a algo seguro."
          : "Parece que este color no encaja del todo con cómo se siente esta situación.",
        ok ? "good" : "bad"
      );
    }

    // Si todas están en el color correcto, celebramos
    const allPlaced  = scenarios.every(s => placements[s.id]);
    const allCorrect = scenarios.every(s => placements[s.id] === s.correct);

    if (allCorrect) {
      setMessage(
        "¡Lo hiciste muy bien! Clasificaste todas las situaciones según cómo se sienten.",
        "good"
      );
      if (typeof celebrate === "function") {
        celebrate();
      }
    } else if (allPlaced) {
      // Todas colocadas pero no todas correctas: pista suave
      setMessage(
        (msg.textContent || "") +
          " Revisa si alguna situación podría ir mejor en otro color.",
        "warn"
      );
    }
  }

  zones.forEach(zone => {
    const zoneKey = zone.dataset.zone;

    zone.addEventListener("dragover", e => {
      e.preventDefault();
    });

    zone.addEventListener("drop", e => {
      e.preventDefault();
      const sid = e.dataTransfer.getData("text/plain");
      if (!sid) return;

      // Buscar la carta en cualquier parte del juego
      const card = wrap.querySelector(`.traffic-card[data-sid="${sid}"]`);
      if (!card) return;

      zone.appendChild(card);
      handleDrop(sid, zoneKey);
    });
  });

  reset.addEventListener("click", () => {
    createCards();
  });

  createCards();
})();


/* ===== Carrusel Aprende ===== */
(() => {
  const car = $("#carousel");
  if (!car) return;

  const track  = $(".car-track", car);
  const slides = $$(".slide", car);
  if (!track || !slides.length) return;

  let idx = 0;

  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
  };

  const prevBtn = $(".car-btn.prev", car) || $(".prev", car);
  const nextBtn = $(".car-btn.next", car) || $(".next", car);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => go(idx - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => go(idx + 1));
  }
})();


/* ===== Ayuda y Reflexiones (poblar) ===== */
const HELP_MX = [
  {name:"Línea de la Vida (MX)",type:"Teléfono",value:"800 911 2000",desc:"Orientación 24/7."},
  {name:"LOCATEL CDMX (MX)",type:"Teléfono",value:"55 5658 1111",desc:"Canalización (CDMX)."},
  {name:"Consejo Ciudadano (CDMX)",type:"Web",value:"https://consejociudadanomx.org/servicios/apoyo-psicologico-626ffa1400068",desc:"Apoyo 24/7; también WhatsApp."}
];

const HELP_VERACRUZ = [
  {name:"Denuncia anónima 089 (Veracruz)",type:"Teléfono",value:"089",desc:"Para reportar delitos o violencia de forma anónima."},
  {name:"DIF Veracruz – Denuncias de maltrato",type:"Web",value:"https://www.difver.gob.mx/denuncias-maltrato/",desc:"Reporta maltrato a niñas, niños y adolescentes."},
  {name:"Alerta de Violencia de Género Veracruz (AVGM)",type:"Web",value:"https://www.veracruz.gob.mx/avgm/",desc:"Información y recursos estatales para mujeres y niñas."}
];

const HELP_TIERRA_BLANCA = [
  {
    name:"Lic. Karla Arcos Báez",
    type:"WhatsApp",
    value:"+52 1 229 160 2485",
    desc:"Atención psicológica por WhatsApp para Tierra Blanca."
  },
  {
    name:"Lic. Cynthia Ivette Velázquez Bustos",
    type:"WhatsApp",
    value:"+52 1 274 106 1663",
    desc:"Atención jurídica por WhatsApp para Tierra Blanca."
  }
];

(() => {
  function render(list, mount){
    if(!mount) return;
    mount.innerHTML = "";

    list.forEach(c => {
      const el = document.createElement("div");
      el.className = "help-card";

      let href = "";
      const cleanNumber = c.value.replace(/\D+/g, "");

      if (c.type === "Web") {
        href = c.value;
      } else if (c.type === "WhatsApp") {
        // Abre chat de WhatsApp con ese número
        href = `https://wa.me/${cleanNumber}`;
      } else {
        // Teléfono normal
        href = `tel:${c.value.replace(/\s+/g,"")}`;
      }

      // 💬 contenido según el tipo
      let linkHtml = "";

      if (c.type === "WhatsApp") {
        // Botón con logo de WhatsApp y sin mostrar el número
        linkHtml = `
          <a class="call whatsapp-link" target="_blank" rel="noopener" href="${href}">
            <img src="whatsapp.svg" alt="Abrir chat de WhatsApp" class="whatsapp-icon">
            <span>Hablar por WhatsApp</span>
          </a>
        `;
      } else {
        // Teléfono o web: se mantiene el texto que ya tenías
        linkHtml = `
          <a class="call" target="_blank" rel="noopener" href="${href}">
            <strong>${c.value}</strong>
          </a>
        `;
      }

      el.innerHTML = `
        <h4>${c.name}</h4>
        <p class="muted">${c.desc}</p>
        ${linkHtml}
      `;

      mount.appendChild(el);
    });
  }

  // Orden de render: Tierra Blanca, Veracruz, México
  render(HELP_TIERRA_BLANCA, $("#helpGridTierraBlanca"));
  render(HELP_VERACRUZ, $("#helpGridVeracruz"));
  render(HELP_MX, $("#helpGridMX"));
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

    chips.forEach(chip => {
      chip.classList.toggle("is-active", chip.dataset.step === stepStr);
    });

    if (progressLabel){
      progressLabel.textContent = `Paso ${step} de ${total}`;
    }
    if (progressFill){
      const pct = (step / total) * 100;
      progressFill.style.width = `${pct}%`;
    }

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
    const hint = $(".trust-hint", step1);          // 👈 importante: class="trust-hint"
    const resetBtn = $(".trust-reset", step1);
    const confettiLayer = $(".confetti-layer", step1);

    const okCards = trustCards.filter(c => (c.dataset.type || "").trim() === "ok");
    const totalOk = okCards.length;
    let okTouched = 0;

    function showMessage(type){
      if (!hint) return;

      if (type === "ok"){
        hint.textContent = "Es una buena opción para pedir ayuda. Busca a personas adultas de confianza que puedan protegerte. 💛";
        hint.style.color = "#15803d"; // verde
      } else if (type === "warn"){
        hint.textContent = "Mejor no contarle a personas desconocidas o que no te den confianza. Busca a alguien adulto que sepas que quiere cuidarte. 🌱";
        hint.style.color = "#b91c1c"; // rojo
      } else if (type === "win"){
        hint.textContent = "¡Lo hiciste muy bien! Elegiste buenas opciones para pedir ayuda. 🎉";
        hint.style.color = "#0f766e"; // turquesa
      } else{
        hint.textContent = "";
        hint.style.color = "";
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

      setTimeout(() => {
        if (confettiLayer) confettiLayer.innerHTML = "";
      }, 1800);
    }

    function resetTrustGame(){
      okTouched = 0;
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
        if (card.dataset.hit === "1") return;

        const type = (card.dataset.type || "warn").trim();

        if (type === "ok"){
          card.dataset.hit = "1";
          okTouched++;

          card.classList.add("selected","ok","gone");
          showMessage("ok");

          setTimeout(() => {
            card.style.display = "none";
          }, 360);

          if (okTouched === totalOk){
            showMessage("win");
            triggerConfetti();
          }
        } else {
          card.classList.add("selected","warn","shake");
          showMessage("warn");

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

  const toastBox      = document.getElementById("kivaToast");

  let currentUser = null;

  function showToast(message){
    if (!toastBox) return;
    toastBox.textContent = message;
    toastBox.classList.add("is-visible");
    clearTimeout(toastBox._hideTimer);
    toastBox._hideTimer = setTimeout(() => {
      toastBox.classList.remove("is-visible");
    }, 3200);
  }


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

    // Cambiar texto del botón del foro según haya sesión o no
    if (openAuthBtn){
      if (currentUser){
        openAuthBtn.classList.add("is-logged");
        openAuthBtn.innerHTML = `
          <span>Cerrar sesión</span>
          <span class="sf-account-dot"></span>
        `;
      }else{
        openAuthBtn.classList.remove("is-logged");
        openAuthBtn.innerHTML = `
          <span>Iniciar sesión / Crear cuenta</span>
          <span class="sf-account-dot"></span>
        `;
      }
    }

    window.kivaAuth = window.kivaAuth || {};
    window.kivaAuth.user = currentUser;

    const ev = new CustomEvent("kiva:user-changed",{ detail:{ user: currentUser }});
    document.dispatchEvent(ev);
  }


  openAuthBtn?.addEventListener("click", async () => {
    // Si ya hay sesión, este botón ahora sirve para cerrar sesión
    if (currentUser){
      try{
        await apiPost("/api/logout",{});
      }catch{}
      setUser(null);
      if (authStatusMsg) authStatusMsg.textContent = "Sesión cerrada.";
      showToast("Cerraste sesión.");
    }else{
      // Si no hay sesión, abre el modal en modo login
      openModal("login");
    }
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
      showToast("Inicio de sesión correcto 💛");
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

      if (data.needsVerification || data.ok){
        if (authStatusMsg){
          authStatusMsg.textContent =
            data.message || "Te enviamos un código a tu correo. Revísalo 💛";
        }
        if (authVerifyBlock){
          authVerifyBlock.classList.remove("is-hidden");
        }
        showToast("Te enviamos un código a tu correo 💌");
        // NO llamamos a setUser todavía: esperamos a que verifique el código
      }else if (data.user){
        setUser(data.user);
        if (authStatusMsg) authStatusMsg.textContent = "Cuenta creada y sesión iniciada 💛";
        showToast("Cuenta creada y sesión iniciada 💛");
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
        showToast("Correo verificado y sesión iniciada 💛");
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
    showToast("Cerraste sesión.");
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

/* ===== Chat: Detecta el Engaño (Versión Inteligente sin Repeticiones) ===== */
(() => {
  const wrap = document.getElementById("chatGame");
  if (!wrap) return;

  const screen = document.getElementById("chatScreen");
  const optsDiv = document.getElementById("chatOptions");
  const feedback = document.getElementById("chatFeedback");
  const resetBtn = document.getElementById("resetChat");

  // Escenarios de chat (8 situaciones)
  const scenariosData = [
    { 
      id: 1,
      sender: "Desconocido", 
      text: "Hola, vi tu perfil y me caíste súper bien. ¿Tienes fotos? 😉",
      options: [
        { text: "¡Claro! ¿Quién eres?", safe: false, reply: "⛔ ¡Alto! Nunca envíes fotos a desconocidos. Pueden usarlas para hacerte daño." },
        { text: "No te conozco, bloquear.", safe: true, reply: "✅ ¡Excelente! Bloquear es lo más seguro." }
      ]
    },
    { 
      id: 2,
      sender: "GamerPro_99", 
      text: "Oye, te regalo 1000 monedas para el juego. Solo pásame tu contraseña para depositarlas. 🎮",
      options: [
        { text: "¡Gracias! Aquí está...", safe: false, reply: "⛔ ¡Peligro! Nunca des tu contraseña. Te robarán la cuenta." },
        { text: "Nadie pide contraseñas para regalar cosas. Reportar.", safe: true, reply: "✅ ¡Muy bien! Identificaste una estafa (Phishing)." }
      ]
    },
    { 
      id: 3,
      sender: "Amigo_Misterioso", 
      text: "Vamos a vernos en el parque, pero es NUESTRO SECRETO 🤫. No le digas a tus papás.",
      options: [
        { text: "Bueno, pero rápido.", safe: false, reply: "⛔ ¡Alerta Roja! Los secretos que te piden ocultar a tus padres son peligrosos." },
        { text: "No guardo secretos malos. Le diré a mi mamá.", safe: true, reply: "✅ ¡Perfecto! Cuéntaselo a un adulto de confianza inmediatamente." }
      ]
    },
    { 
      id: 4,
      sender: "Perfil_Sin_Foto", 
      text: "¿A qué escuela vas? Creo que te he visto a la salida. 🏫",
      options: [
        { text: "Voy a la escuela [Nombre].", safe: false, reply: "⛔ ¡Cuidado! Nunca des datos de tu ubicación o rutina a extraños." },
        { text: "¿Quién eres? No doy esa información.", safe: true, reply: "✅ ¡Bien hecho! Protege tus datos personales siempre." }
      ]
    },
    { 
      id: 5,
      sender: "Anónimo", 
      text: "Si no haces lo que te digo, voy a subir tus fotos y todos se burlarán de ti. 😠",
      options: [
        { text: "Por favor no lo hagas, haré lo que sea.", safe: false, reply: "⛔ No cedas al chantaje. Eso les da más poder. Pide ayuda adulta urgente." },
        { text: "No tengo miedo. Voy a avisar a un adulto.", safe: true, reply: "✅ ¡Valiente! Ante amenazas, no respondas y busca ayuda." }
      ]
    },
    { 
      id: 6,
      sender: "Agencia_Talentos", 
      text: "¡Hola! Tienes cara de modelo. Mándanos una foto de cuerpo completo para contratarte. 📸",
      options: [
        { text: "¡Wow! ¿En serio? Ahí va.", safe: false, reply: "⛔ ¡Es una trampa común! Los adultos no buscan niños modelos por chat privado." },
        { text: "No creo en esto. Adiós.", safe: true, reply: "✅ ¡Inteligente! Si fuera real, hablarían con tus padres, no contigo en secreto." }
      ]
    },
    { 
      id: 7,
      sender: "Usuario_X", 
      text: "Mi cámara no funciona, pero prende la tuya para que nos conozcamos mejor. 📹",
      options: [
        { text: "Está bien, la prendo un rato.", safe: false, reply: "⛔ ¡Riesgo! No enciendas tu cámara para desconocidos. Podrían grabarte." },
        { text: "No. No hago videollamadas con extraños.", safe: true, reply: "✅ ¡Exacto! Tu privacidad en video es muy importante." }
      ]
    },
    { 
      id: 8,
      sender: "Lobo_Solitario", 
      text: "Tus papás no te entienden como yo. Yo soy el único que te escucha de verdad. 🐺",
      options: [
        { text: "Sí, tienes razón. Ellos son malos.", safe: false, reply: "⛔ ¡Cuidado! Alguien que te pone en contra de tu familia te quiere aislar." },
        { text: "Eso no es cierto. Me voy de este chat.", safe: true, reply: "✅ ¡Muy bien! Detectaste una manipulación. Aléjate de esa persona." }
      ]
    }
  ];

  let currentScenario = null;
  let availableIndices = [];

  function refillBag() {
    availableIndices = scenariosData.map((_, index) => index);
  }

  refillBag();

  function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.textContent = text;
    screen.appendChild(div);
    screen.scrollTop = screen.scrollHeight;
  }

  function playScenario() {
    optsDiv.style.display = "none";
    setTimeout(() => {
      addMsg(currentScenario.text, "receive");
      setTimeout(() => {
        showOptions();
      }, 1200);
    }, 600);
  }

  function showOptions() {
    optsDiv.style.display = "flex";
    optsDiv.innerHTML = "";

    const shuffledOptions = currentScenario.options.slice().sort(() => Math.random() - 0.5);

    shuffledOptions.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "btn-opt";
      btn.textContent = opt.text;
      btn.onclick = () => checkAnswer(opt);
      optsDiv.appendChild(btn);
    });
  }

  function checkAnswer(opt) {
    addMsg(opt.text, "sent");
    optsDiv.style.display = "none";

    feedback.textContent = opt.reply;
    feedback.style.color = opt.safe ? "#2ecc71" : "#e74c3c";

    setTimeout(() => {
      if (opt.safe) {
        addMsg("🛡️ Has tomado la decisión segura.", "receive");
      } else {
        addMsg("⚠️ Situación de riesgo. Bloqueando usuario...", "receive");
      }
    }, 600);
  }

  function reset() {
    screen.innerHTML = "";
    feedback.textContent = "";

    if (availableIndices.length === 0) {
      refillBag();
    }

    const randomIndexPosition = Math.floor(Math.random() * availableIndices.length);
    const scenarioIndex = availableIndices[randomIndexPosition];

    availableIndices.splice(randomIndexPosition, 1);
    currentScenario = scenariosData[scenarioIndex];

    playScenario();
  }

  if (resetBtn) resetBtn.addEventListener("click", reset);
  reset();
})();

/* --- Utilidad genérica Drag & Drop (Touch + Mouse) --- */
function initDragGame(containerId, items, onDrop) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pool = container.querySelector(".draggables-pool");
  const zones = container.querySelectorAll(".drop-zone");
  const feedback = container.querySelector(".feedback-msg");
  const resetBtn = container.querySelector(".reset-btn");

  let completed = 0;

  function createItems() {
    if (!pool) return;
    pool.innerHTML = "";
    completed = 0;
    if (feedback) {
      feedback.textContent = "";
      feedback.style.color = "";
    }

    const shuffled = items.slice().sort(() => Math.random() - 0.5);

    shuffled.forEach(item => {
      const el = document.createElement("div");
      el.className = "drag-item";
      el.textContent = item.label;
      el.dataset.target = item.target;

      el.addEventListener("mousedown", startDrag);
      el.addEventListener("touchstart", startDrag, { passive: false });

      pool.appendChild(el);
    });
  }

  let currentDrag = null;
  let startX = 0;
  let startY = 0;
  let originalX = 0;
  let originalY = 0;

  function startDrag(e) {
    if (!(e.target instanceof HTMLElement)) return;
    const el = e.target;
    if (el.classList.contains("correct")) return;

    e.preventDefault();
    currentDrag = el;

    const evt = e.type.includes("touch") ? e.touches[0] : e;
    const rect = el.getBoundingClientRect();

    startX = evt.clientX;
    startY = evt.clientY;
    originalX = rect.left;
    originalY = rect.top;

    el.style.position = "fixed";
    el.style.zIndex = "1000";
    el.style.left = originalX + "px";
    el.style.top = originalY + "px";
    el.style.width = rect.width + "px";

    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  }

  function moveDrag(e) {
    if (!currentDrag) return;
    e.preventDefault();
    const evt = e.type.includes("touch") ? e.touches[0] : e;
    const dx = evt.clientX - startX;
    const dy = evt.clientY - startY;
    currentDrag.style.transform = "translate(" + dx + "px, " + dy + "px)";
  }

  function endDrag(e) {
    if (!currentDrag) return;

    document.removeEventListener("mousemove", moveDrag);
    document.removeEventListener("touchmove", moveDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchend", endDrag);

    const rect = currentDrag.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    let droppedZone = null;
    zones.forEach(z => {
      const zRect = z.getBoundingClientRect();
      if (
        center.x >= zRect.left &&
        center.x <= zRect.right &&
        center.y >= zRect.top &&
        center.y <= zRect.bottom
      ) {
        droppedZone = z;
      }
    });

    currentDrag.style.position = "";
    currentDrag.style.zIndex = "";
    currentDrag.style.left = "";
    currentDrag.style.top = "";
    currentDrag.style.width = "";
    currentDrag.style.transform = "";

    if (droppedZone) {
      const itemType = currentDrag.dataset.target;
      const zoneType = droppedZone.dataset.type;

      if (onDrop(itemType, zoneType, currentDrag, feedback)) {
        droppedZone.classList.add("active");
        setTimeout(() => droppedZone.classList.remove("active"), 200);
        completed++;
        if (completed === items.length) {
          if (typeof celebrate === "function") celebrate();
          if (feedback) {
            feedback.textContent = "¡Excelente! Has clasificado todo correctamente.";
            feedback.style.color = "var(--ring)";
          }
        }
      }
    }

    currentDrag = null;
  }

  if (resetBtn) resetBtn.addEventListener("click", createItems);
  createItems();
}

/* --- 🙅‍♀️ Juego: Mi cuerpo, mis reglas --- */
(() => {
  const container = document.getElementById("misReglas");
  if (!container) return;

  const items = [
    { label: "🤗 Abrazo que quiero", target: "ok" },
    { label: "👙 Tocar bajo ropa", target: "bad" },
    { label: "🤐 Guardar secreto malo", target: "bad" },
    { label: "🩺 Doctor con mamá", target: "ok" },
    { label: "📸 Fotos sin ropa", target: "bad" },
    { label: "✋ Decir NO", target: "ok" }
  ];

  initDragGame("misReglas", items, (itemType, zoneType, el, feedback) => {
    if (!feedback) return itemType === zoneType;

    if (itemType === zoneType) {
      el.classList.add("correct");
      feedback.textContent = "¡Correcto! Tú decides sobre tu cuerpo.";
      feedback.style.color = "var(--ring)";
      return true;
    } else {
      el.classList.add("wrong");
      setTimeout(() => el.classList.remove("wrong"), 500);
      feedback.textContent = "Ups. Recuerda: si te incomoda, NO está permitido.";
      feedback.style.color = "#e11d48";
      return false;
    }
  });
})();

/* --- 🏠 Juego: Mapa de Lugares Seguros --- */
(() => {
  const container = document.getElementById("lugaresSeguros");
  if (!container) return;

  const touchAreas = container.querySelectorAll(".map-touch-area");

  const states = [
    { type: "safe", icon: "✅", label: "Seguro" },
    { type: "warn", icon: "❓", label: "Precaución" },
    { type: "bad",  icon: "⛔", label: "No seguro" }
  ];

  const placeStates = {};

  touchAreas.forEach(area => {
    const placeKey = area.dataset.place;
    placeStates[placeKey] = -1;

    area.addEventListener("click", () => {
      const indicatorId = "ind-" + placeKey;
      const indicatorEl = document.getElementById(indicatorId);
      if (!indicatorEl) return;

      placeStates[placeKey] = (placeStates[placeKey] + 1) % states.length;
      const currentState = states[placeStates[placeKey]];

      indicatorEl.innerHTML =
        "<span class=\"map-ind-icon\">" + currentState.icon + "</span>" +
        "<span class=\"map-ind-label\">" + currentState.label + "</span>";

      indicatorEl.classList.remove("safe", "warn", "bad");
      indicatorEl.classList.add(currentState.type);

      indicatorEl.classList.remove("show");
      void indicatorEl.offsetWidth;
      indicatorEl.classList.add("show");
    });
  });
})();

/* --- 🎤 Juego: Rompe el silencio --- */
(() => {
  const container = document.getElementById("storyContainer");
  const resetBtn = document.getElementById("resetStory");
  if (!container) return;

  const charEl = container.querySelector(".story-char");
  const textEl = container.querySelector(".story-text");
  const actions = container.querySelector(".story-actions");

  const scenes = {
    start: {
      emoji: "😰",
      t: "Alex tiene un secreto que le hace sentir mal y le da miedo contar. ¿Qué debe hacer?",
      opts: [
        { l: "Guardarlo para siempre", next: "bad1" },
        { l: "Buscar a un adulto de confianza", next: "step2" }
      ]
    },
    bad1: {
      emoji: "😔",
      t: "El secreto pesa mucho y Alex se siente solo. El silencio protege a quien le hizo daño.",
      opts: [
        { l: "Intentar hablar de nuevo", next: "step2" }
      ]
    },
    step2: {
      emoji: "🤔",
      t: "Alex decide hablar. ¿A quién debería elegir?",
      opts: [
        { l: "A un desconocido en internet", next: "bad2" },
        { l: "A su maestra o su abuela", next: "step3" }
      ]
    },
    bad2: {
      emoji: "🚫",
      t: "¡Cuidado! En internet no sabes quién está realmente. Mejor alguien real.",
      opts: [
        { l: "Elegir a alguien de la familia/escuela", next: "step3" }
      ]
    },
    step3: {
      emoji: "🗣️",
      t: "Está frente a su abuela pero tiene miedo. ¿Cómo lo dice?",
      opts: [
        { l: "'Tengo miedo de decirte algo...'", next: "end" },
        { l: "Escribirlo en un papel", next: "end" }
      ]
    },
    end: {
      emoji: "😭",
      t: "¡Alex lo contó! Su abuela lo abrazó y le dijo: 'Te creo, no es tu culpa'. Alex ya no carga el secreto solo.",
      opts: []
    }
  };

  function render(key) {
    const s = scenes[key];
    if (!s) return;
    if (charEl) charEl.textContent = s.emoji;
    if (textEl) textEl.textContent = s.t;
    if (!actions) return;

    actions.innerHTML = "";
    if (s.opts.length > 0) {
      s.opts.forEach(o => {
        const btn = document.createElement("button");
        btn.className = "btn story-btn";
        btn.textContent = o.l;
        btn.onclick = () => render(o.next);
        actions.appendChild(btn);
      });
    } else {
      if (typeof celebrate === "function") celebrate();
      if (resetBtn) resetBtn.classList.remove("hidden");
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      resetBtn.classList.add("hidden");
      render("start");
    });
  }

  render("start");
})();


//Semáforo de Prevención
(() => {
  const wrap = $("#semaforo"); if (!wrap) return;
  
  const card = $("#semCard", wrap);
  const scoreEl = $("#semScore", wrap);
  const startBtn = $("#startSemBtn", wrap);
  const feedback = $("#semFeedback", wrap);
  const buttons = $$(".sem-btn", wrap);

  // 1. LISTA AMPLIADA DE SITUACIONES
  // green = Seguro, yellow = Alerta/Incómodo (Límites), red = Peligro
  const allLevels = [
    // --- VERDE (Seguro / Confianza) ---
    { t: "Abrazo de mamá o papá cuando tú quieres", e: "🤗", c: "green" },
    { t: "La doctora te revisa con tu mamá presente", e: "👩‍⚕️", c: "green" },
    { t: "Jugar y reír con tus amigos en el recreo", e: "⚽", c: "green" },
    { t: "Tu abuela te da la mano para cruzar la calle", e: "👵", c: "green" },
    { t: "Chocar las manos con tu mejor amigo", e: "🙏", c: "green" },
    { t: "Decir 'NO' a algo que no te gusta", e: "🛑", c: "green" }, // Decir no es seguro y sano
    { t: "Tu tío te lee un cuento en la sala", e: "📖", c: "green" },
    { t: "Bañarte tú solito/a con la puerta cerrada", e: "🚿", c: "green" },

    // --- AMARILLO (Alerta / Incomodidad / Límites) ---
    { t: "Un familiar te pide beso y tú NO quieres", e: "💋", c: "yellow" },
    { t: "Alguien te hace cosquillas y no para", e: "😖", c: "yellow" },
    { t: "Un amigo te empuja jugando y te duele", e: "😣", c: "yellow" },
    { t: "Sientes 'mariposas malas' en la panza", e: "🦋", c: "yellow" },
    { t: "Alguien te dice 'qué bonito cuerpo tienes'", e: "👀", c: "yellow" },
    { t: "Te obligan a saludar de beso a una visita", e: "😒", c: "yellow" },

    // --- ROJO (Peligro / Pedir Ayuda Urgente) ---
    { t: "Un desconocido te ofrece dulces o regalos", e: "🍬", c: "red" },
    { t: "Alguien te pide guardar un secreto 'malo'", e: "🤫", c: "red" },
    { t: "Te piden que te quites la ropa para una foto", e: "📸", c: "red" },
    { t: "Un extraño te invita a subir a su coche", e: "🚗", c: "red" },
    { t: "Alguien toca tus partes privadas", e: "👙", c: "red" },
    { t: "Te amenazan si cuentas lo que pasó", e: "😠", c: "red" },
    { t: "Un desconocido te contacta por internet", e: "💻", c: "red" }
  ];

  let deck = []; // Aquí guardaremos las cartas barajadas
  let score = 0;
  let isPlaying = false;
  let currentItem = null;

  // Función para barajar (Shuffle)
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function getNextCardFromDeck() {
    // Si la baraja está vacía, la llenamos y barajamos de nuevo
    if (deck.length === 0) {
      deck = [...allLevels]; // Copia nueva
      shuffle(deck);
    }
    return deck.pop(); // Sacamos la última carta
  }

  function showFeedback(isCorrect) {
    feedback.className = "sem-feedback"; // reset
    if (isCorrect) {
      feedback.textContent = "¡BIEN! 👍";
      feedback.classList.add("correct");
      score += 10;
    } else {
      feedback.textContent = "OOPS ✋";
      feedback.classList.add("wrong");
      // No bajamos puntos, solo no sumamos, para animar a seguir
    }
    scoreEl.textContent = score;

    // Ocultar feedback y pasar a la siguiente
    setTimeout(() => {
      feedback.className = "sem-feedback";
      nextCard();
    }, 900); // Un poco más de tiempo para leer
  }

  function nextCard() {
    // Animación visual de "pop"
    card.classList.remove("pop");
    void card.offsetWidth; // forzar reflow
    card.classList.add("pop");

    // Obtener siguiente carta de la baraja (sin repetir inmediato)
    currentItem = getNextCardFromDeck();

    // Renderizar
    card.querySelector(".sem-emoji").textContent = currentItem.e;
    card.querySelector(".sem-text").textContent = currentItem.t;
  }

  function startGame() {
    score = 0;
    scoreEl.textContent = "0";
    isPlaying = true;
    startBtn.textContent = "Reiniciar Juego";
    
    // Reiniciamos la baraja al empezar juego nuevo
    deck = [...allLevels]; 
    shuffle(deck);
    
    // Habilitar botones
    buttons.forEach(b => {
      b.disabled = false;
      b.style.opacity = "1";
    });
    
    nextCard();
  }

  // Listeners botones de colores
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!isPlaying) {
        startGame(); 
        return;
      }
      const userColor = btn.dataset.color;
      
      // Lógica flexible:
      // Si es YELLOW, a veces puede confundirse con RED o GREEN según contexto.
      // Aquí validamos estricto, pero podrías hacerlo más suave.
      const isCorrect = (userColor === currentItem.c);
      
      showFeedback(isCorrect);
    });
  });

  startBtn.addEventListener("click", startGame);
})();

/* ===== Semáforo del Cuerpo Visual (Interactivo) ===== */
(() => {
  const container = document.getElementById("semaforo-body");
  if (!container) return;

  const dots = container.querySelectorAll(".body-dot");
  const feedback = document.getElementById("bodyFeedback");
  const wrapper = container.querySelector(".body-image-wrapper");

  function activateDot(selectedDot) {
    dots.forEach(d => d.classList.remove("active"));
    selectedDot.classList.add("active");

    const msg = selectedDot.dataset.msg;
    const isRed = selectedDot.classList.contains("red");
    const isYellow = selectedDot.classList.contains("yellow");
    const isGreen = selectedDot.classList.contains("green");

    if (!feedback) return;

    feedback.className = "body-feedback";
    void feedback.offsetWidth;

    if (isRed) feedback.classList.add("is-red");
    else if (isYellow) feedback.classList.add("is-yellow");
    else if (isGreen) feedback.classList.add("is-green");

    feedback.style.opacity = "0";
    feedback.textContent = msg;

    setTimeout(() => {
      feedback.style.opacity = "1";
    }, 50);
  }

  dots.forEach(dot => {
    dot.addEventListener("click", e => {
      e.stopPropagation();
      activateDot(dot);
    });
  });

  if (wrapper && feedback) {
    wrapper.addEventListener("click", e => {
      if (e.target === wrapper || e.target.classList.contains("body-bg")) {
        dots.forEach(d => d.classList.remove("active"));
        feedback.className = "body-feedback";
        feedback.textContent = "👆 Toca los puntos de colores en el dibujo.";
      }
    });
  }
})();

/* =========================================
   KIVA ARCADE - Control de pestañas
   ========================================= */
function playGame(gameId) {
  const tabs = document.querySelectorAll(".arcade-tab");
  const games = document.querySelectorAll(".arcade-game");

  tabs.forEach(t => t.classList.remove("active"));
  games.forEach(g => g.classList.remove("active"));

  tabs.forEach(btn => {
    const attr = btn.getAttribute("onclick") || "";
    if (attr.includes(gameId)) {
      btn.classList.add("active");
    }
  });

  const gameEl = document.getElementById(gameId);
  if (gameEl) gameEl.classList.add("active");
}

/* ===== LÓGICA DEL CÍRCULO DE CONFIANZA ===== */
const trustData = [
  { id: "t1", text: "Dar un abrazo", group: "family", icon: "🤗" },
  { id: "t2", text: "Contar un secreto", group: "family", icon: "💬" },
  { id: "t3", text: "Jugar en el parque", group: "friends", icon: "⚽" },
  { id: "t4", text: "Prestar juguetes", group: "friends", icon: "🧸" },
  { id: "t5", text: "Saludar de lejos", group: "community", icon: "👋" },
  { id: "t6", text: "Pedir ayuda si me pierdo", group: "community", icon: "👮" },
  { id: "t7", text: "No abrir la puerta", group: "strangers", icon: "🚪" },
  { id: "t8", text: "No aceptar regalos", group: "strangers", icon: "🍬" },
  { id: "t9", text: "Decir mi nombre", group: "family", icon: "🗣️" }
];

let draggedItem = null;
let touchClone = null;

function initTrustGame() {
  const pool = document.getElementById("trustPool");
  const cols = document.querySelectorAll(".trust-drop-zone");
  const feedback = document.getElementById("trustFeedback");
  if (!pool || !feedback) return;

  pool.innerHTML = "";
  cols.forEach(col => (col.innerHTML = ""));

  feedback.textContent = "Selecciona una ficha y arrástrala a su lugar.";
  feedback.style.color = "var(--ink)";

  const shuffled = trustData.slice().sort(() => Math.random() - 0.5);

  shuffled.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("trust-item");
    div.setAttribute("draggable", "true");
    div.dataset.group = item.group;
    div.innerHTML = "<span style=\"font-size:1.2rem\">" +
      item.icon +
      "</span><br>" +
      item.text;

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragend", handleDragEnd);

    div.addEventListener("touchstart", handleTouchStart, { passive: false });
    div.addEventListener("touchmove", handleTouchMove, { passive: false });
    div.addEventListener("touchend", handleTouchEnd);

    pool.appendChild(div);
  });
}

function handleDragStart(e) {
  draggedItem = this;
  this.style.opacity = "0.5";
}

function handleDragEnd() {
  draggedItem = null;
  this.style.opacity = "1";
  document.querySelectorAll(".trust-col").forEach(col => {
    col.classList.remove("active-drop");
  });
}

document.querySelectorAll(".trust-col").forEach(col => {
  col.addEventListener("dragover", e => {
    e.preventDefault();
    col.classList.add("active-drop");
  });

  col.addEventListener("dragleave", () => {
    col.classList.remove("active-drop");
  });

  col.addEventListener("drop", e => {
    e.preventDefault();
    col.classList.remove("active-drop");
    const targetGroup = col.dataset.group;
    const zone = col.querySelector(".trust-drop-zone");
    if (draggedItem && zone) {
      validateDrop(draggedItem, targetGroup, zone);
    }
  });
});

function handleTouchStart(e) {
  draggedItem = this;
  const touch = e.touches[0];

  touchClone = this.cloneNode(true);
  touchClone.style.position = "fixed";
  touchClone.style.width = this.offsetWidth + "px";
  touchClone.style.opacity = "0.8";
  touchClone.style.zIndex = "1000";
  touchClone.style.pointerEvents = "none";

  updateTouchPosition(touch);
  document.body.appendChild(touchClone);

  this.style.opacity = "0.4";
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchClone) return;
  updateTouchPosition(e.touches[0]);
}

function updateTouchPosition(touch) {
  if (!touchClone) return;
  touchClone.style.left = touch.clientX - touchClone.offsetWidth / 2 + "px";
  touchClone.style.top = touch.clientY - touchClone.offsetHeight / 2 + "px";
}

function handleTouchEnd(e) {
  if (touchClone) {
    touchClone.remove();
    touchClone = null;
  }
  this.style.opacity = "1";

  const touch = e.changedTouches[0];
  this.style.display = "none";
  const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
  this.style.display = "block";

  const col = elemBelow ? elemBelow.closest(".trust-col") : null;
  if (col) {
    const targetGroup = col.dataset.group;
    const zone = col.querySelector(".trust-drop-zone");
    if (zone) {
      validateDrop(this, targetGroup, zone);
    }
  }
  draggedItem = null;
}

function validateDrop(item, targetGroup, dropZone) {
  const itemGroup = item.dataset.group;
  const feedback = document.getElementById("trustFeedback");
  if (!feedback) return;

  if (itemGroup === targetGroup) {
    item.classList.add("correct");
    item.draggable = false;
    dropZone.appendChild(item);

    feedback.textContent = "¡Muy bien! Esa es la zona correcta.";
    feedback.style.color = "#16a34a";

    const pool = document.getElementById("trustPool");
    if (pool && pool.children.length === 0) {
      feedback.textContent = "¡Felicidades! Has completado tu círculo de seguridad.";
      if (typeof celebrate === "function") celebrate();
    }
  } else {
    item.classList.add("wrong");
    feedback.textContent = "Mmm, creo que esa acción no va con esa persona.";
    feedback.style.color = "#dc2626";
    setTimeout(() => item.classList.remove("wrong"), 500);
  }
}

/* ======================================================
   JUEGO: ROMPE EL SILENCIO (Lógica Mejorada)
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Verificamos si el juego existe en esta página para evitar errores
    const storyContainer = document.getElementById('storyContainer');
    if (!storyContainer) return; // Si no estamos en explora.html, no hace nada.

    // 2. Base de datos de situaciones (Historias)
    const stories = [
        {
            text: "Alex tiene un secreto que le hace sentir mal y le da miedo contarlo. ¿Qué debe hacer?",
            char: "😰",
            options: [
                { 
                    text: "Guardarlo para siempre", 
                    correct: false, 
                    feedback: "Guardar secretos malos nos hace daño por dentro. Es mejor soltar esa carga." 
                },
                { 
                    text: "Buscar a un adulto de confianza", 
                    correct: true, 
                    feedback: "¡Muy bien! Hablar con alguien de confianza es el primer paso para estar seguro." 
                }
            ]
        },
        {
            text: "Alguien en internet le pide a Sami que le mande una foto 'secreta' sin ropa. Dice que son amigos.",
            char: "📱",
            options: [
                { 
                    text: "Bloquear y avisar a sus padres", 
                    correct: true, 
                    feedback: "¡Exacto! Nunca envíes fotos privadas. Bloquear y contar es lo más seguro." 
                },
                { 
                    text: "Mandarla solo una vez", 
                    correct: false, 
                    feedback: "¡No! Una vez que envías una foto, pierdes el control de ella. Nunca lo hagas." 
                }
            ]
        },
        {
            text: "El entrenador le dice a Dani: 'Este es nuestro juego especial, no se lo digas a tu mamá'.",
            char: "⚽",
            options: [
                { 
                    text: "Guardar el secreto", 
                    correct: false, 
                    feedback: "Cuidado: Los adultos no deben pedirte guardar secretos sobre tu cuerpo o juegos extraños." 
                },
                { 
                    text: "Correr y contárselo a mamá", 
                    correct: true, 
                    feedback: "¡Correcto! Los secretos que te hacen sentir incómodo no se guardan. ¡Cuéntalo!" 
                }
            ]
        },
        {
            text: "Un tío le pide a Leo que se siente en sus piernas, pero a Leo no le gusta. ¿Qué hace?",
            char: "🛋️",
            options: [
                { 
                    text: "Aguantarse por educación", 
                    correct: false, 
                    feedback: "No. Nadie debe tocarte u obligarte a estar cerca si no quieres, aunque sea familia." 
                },
                { 
                    text: "Decir 'NO quiero' y alejarse", 
                    correct: true, 
                    feedback: "¡Bien hecho! Tu cuerpo es tuyo y puedes decir NO a cualquier familiar sin miedo." 
                }
            ]
        }
    ];

    // 3. Variables de control
    let currentStoryIdx = 0;
    const storyText = document.getElementById('storyText');
    const storyChar = document.getElementById('storyChar');
    const storyActions = document.getElementById('storyActions');
    const storyResult = document.getElementById('storyResult');
    const nextBtn = document.getElementById('nextStoryBtn');

    // 4. Función para cargar una historia
    function loadStory(idx) {
        const story = stories[idx];
        
        // Actualizar textos
        storyText.textContent = story.text;
        storyChar.textContent = story.char;
        
        // Limpiar estado anterior
        storyResult.textContent = "";
        storyActions.innerHTML = ""; // Borra los botones viejos
        nextBtn.style.display = "none"; // Oculta botón siguiente

        // Crear botones nuevos
        story.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "btn story-btn"; // Clase base (asegúrate de tenerla en CSS o usa btn genérico)
            btn.textContent = opt.text;
            
            // Estilos base para resetear colores si se reinicia
            btn.style.backgroundColor = ""; 
            btn.style.color = "";
            btn.style.border = "1px solid #ccc";
            btn.style.margin = "5px";

            // Lógica al hacer click
            btn.onclick = () => {
                // 1. Mostrar feedback
                storyResult.textContent = opt.feedback;
                
                // 2. Cambiar color según acierto o error
                if (opt.correct) {
                    // VERDE (Correcto)
                    btn.style.backgroundColor = "#2ecc71"; 
                    btn.style.borderColor = "#27ae60";
                    btn.style.color = "#fff";
                    storyResult.style.color = "#27ae60";
                } else {
                    // ROJO (Incorrecto)
                    btn.style.backgroundColor = "#e74c3c"; 
                    btn.style.borderColor = "#c0392b";
                    btn.style.color = "#fff";
                    storyResult.style.color = "#c0392b";
                }

                // 3. Deshabilitar todos los botones para que no cambien la respuesta
                const allButtons = storyActions.querySelectorAll('button');
                allButtons.forEach(b => b.disabled = true);

                // 4. Mostrar botón de siguiente
                nextBtn.style.display = "inline-block";
            };

            storyActions.appendChild(btn);
        });
    }

    // 5. Evento del botón "Siguiente"
    if (nextBtn) {
        nextBtn.onclick = () => {
            currentStoryIdx++;
            // Si llegamos al final, volvemos al principio
            if (currentStoryIdx >= stories.length) {
                currentStoryIdx = 0;
            }
            loadStory(currentStoryIdx);
        };
    }

    // 6. Iniciar el juego
    loadStory(0);
});

document.addEventListener("DOMContentLoaded", initTrustGame);
