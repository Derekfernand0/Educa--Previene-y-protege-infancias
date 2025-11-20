/* Helpers */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

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
  const a=e.target.closest(".snav-link");
  if(!a) return;
  e.preventDefault();
  const hash=(a.dataset.target || (a.getAttribute("href")||"").replace(/^.*#/, "")).trim();
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
  const game=$("#memoria"); if(!game) return;
  const grid=$(".memory-grid",game), info=$(".memory-info",game), desc=$(".memory-desc",game), reset=$("[data-game='memoria']",game);
  const pics=[
    {key:"apoyo",src:"https://openmoji.org/data/color/svg/1F91D.svg",label:"Apoyo",desc:"Pedir y ofrecer compañía segura.",front:"#FFD9C8"},
    {key:"escucha",src:"https://openmoji.org/data/color/svg/1F442.svg",label:"Escucha",desc:"Escuchar sin juicios.",front:"#E5D6FF"},
    {key:"confianza",src:"https://openmoji.org/data/color/svg/1F91E.svg",label:"Confianza",desc:"Elegir a quién contarle.",front:"#CFEAFF"},
    {key:"limites",src:"https://openmoji.org/data/color/svg/270B.svg",label:"Límites",desc:"Decir alto y cuidar tu espacio.",front:"#FFF4B8"},
    {key:"valentia",src:"https://openmoji.org/data/color/svg/1F3C6.svg",label:"Valentía",desc:"Hablar aunque cueste.",front:"#FFD6E7"},
    {key:"cuidado",src:"https://openmoji.org/data/color/svg/2764.svg",label:"Cuidado",desc:"Hábitos que te protegen.",front:"#FFD9C8"},
    {key:"red",src:"https://openmoji.org/data/color/svg/1F465.svg",label:"Red",desc:"Familia, escuela y servicios.",front:"#B0D8FF"},
    {key:"respeto",src:"https://openmoji.org/data/color/svg/1F44D.svg",label:"Respeto",desc:"Toda relación debe tenerlo.",front:"#FEE6A8"}
  ];
  let first=null, lock=false, found=0, moves=0;
  const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a;};

  const hasAdjacentPair = (arr) => {
    for(let i=0;i<arr.length-1;i++){
      if(arr[i].key===arr[i+1].key) return true;
    }
    return false;
  };

  function buildDeck(){
    const base=pics.flatMap(p=>[p,p]);
    let deck=shuffle(base.slice());
    let attempts=0;
    while(hasAdjacentPair(deck) && attempts<80){
      deck=shuffle(base.slice());
      attempts++;
    }
    return deck;
  }

  function init(){
    grid.innerHTML="";
    desc.textContent="";
    first=null;
    lock=false;
    found=0;
    moves=0;
    update();
    const deck=buildDeck();
    deck.forEach(p=>{
      const card=document.createElement("button");
      card.className="cardm";
      card.dataset.k=p.key;
      const inner=document.createElement("div");
      inner.className="cardm-inner";
      const front=document.createElement("div");
      front.className="cardm-face cardm-front";
      front.textContent=p.label;
      front.style.background=p.front;
      const back=document.createElement("div");
      back.className="cardm-face cardm-back";
      const img=document.createElement("img");
      img.src=p.src;
      img.alt=p.label;
      back.appendChild(img);
      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      card.addEventListener("click",()=>click(card,p));
      grid.appendChild(card);
    });
  }

  function click(c,p){
    if(lock||c.classList.contains("solved")||c===first) return;
    reveal(c);
    if(!first){
      first=c;
    } else {
      lock=true;
      moves++;
      if(first.dataset.k===c.dataset.k){
        first.classList.add("solved");
        c.classList.add("solved");
        const got=pics.find(x=>x.key===c.dataset.k);
        first=null;
        lock=false;
        found++;
        desc.textContent=got?got.desc:"";
        if(found===pics.length){
          info.textContent=`Completado en ${moves} movimientos.`;
          celebrate();
        } else update();
      } else {
        first.classList.add("shake");
        c.classList.add("shake");
        setTimeout(()=>{
          hide(c);
          hide(first);
          first.classList.remove("shake");
          c.classList.remove("shake");
          first=null;
          lock=false;
          update();
        },850);
      }
    }
  }
  const update=()=> info.textContent=`Pares: ${found} / ${pics.length} · Movimientos: ${moves}`;
  const reveal=el=> el.classList.add("revealed");
  const hide=el=> el.classList.remove("revealed");
  reset.addEventListener("click",init); init();
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
  {name:"Emergencias 911 (MX)",type:"Teléfono",value:"911",desc:"Peligro inmediato."},
  {name:"Línea de la Vida (MX)",type:"Teléfono",value:"800 911 2000",desc:"Orientación 24/7."},
  {name:"LOCATEL CDMX (MX)",type:"Teléfono",value:"55 5658 1111",desc:"Canalización (CDMX)."},
  {name:"Consejo Ciudadano (CDMX)",type:"Web",value:"https://consejociudadanomx.org/servicios/apoyo-psicologico-626ffa1400068",desc:"Apoyo 24/7; también WhatsApp."}
];

const HELP_VERACRUZ=[
  {name:"Emergencias 911 (Veracruz)",type:"Teléfono",value:"911",desc:"Peligro inmediato en cualquier municipio de Veracruz."},
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
