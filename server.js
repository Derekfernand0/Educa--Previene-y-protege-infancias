require("dotenv").config();

// server.js
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const multer = require("multer");
const session = require("express-session");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const app = express();

// === VARIABLES DE ENTORNO ===
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";

const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER;


// ===== Rate limit: para frenar intentos de fuerza bruta =====
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 10,                  // máx 10 intentos por IP en ese tiempo
  message: { error: "Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde." }
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5,                   // máx 5 registros nuevos por IP en 1 hora
  message: { error: "Demasiadas cuentas creadas desde esta IP. Intenta más tarde." }
});

// --- sesiones ---
app.use(session({
  secret: process.env.SESSION_SECRET || "kiva-dev-secret",
  resave:false,
  saveUninitialized:false,
  cookie:{ secure:false } // en producción, true + https
}));

// --- static ---
app.use(express.static(path.join(__dirname, "public")));
// Para servir las fotos de avatar
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// --- subida de avatar ---
const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, "uploads", "avatars"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    const safeName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  }
});

const upload = multer({
  storage: avatarStorage,
  limits:{ fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter(req, file, cb){
    const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
    if (!allowed.includes(file.mimetype)){
      return cb(new Error("Solo se permiten imágenes JPG, PNG, WEBP o GIF."));
    }
    cb(null, true);
  }
});


// --- helpers de usuarios ---
const USERS_FILE = path.join(__dirname, "data", "users.json");

async function loadUsers(){
  try{
    const txt = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(txt);
  }catch{
    return [];
  }
}


// ===== Foro: helpers de hilos y config =====
const THREADS_FILE       = path.join(__dirname, "data", "threads.json");
const FORUM_CONFIG_FILE  = path.join(__dirname, "data", "forumConfig.json");

async function loadThreads(){
  try{
    const txt = await fs.readFile(THREADS_FILE, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

async function saveThreads(threads){
  await fs.writeFile(THREADS_FILE, JSON.stringify(threads, null, 2), "utf8");
}

async function loadForumConfig(){
  try{
    const txt = await fs.readFile(FORUM_CONFIG_FILE, "utf8");
    const cfg = JSON.parse(txt);
    return {
      closed: !!cfg.closed,
      message: cfg.message || "El foro está en mantenimiento temporal 💛"
    };
  }catch{
    return {
      closed:false,
      message:"El foro está en mantenimiento temporal 💛"
    };
  }
}

async function saveForumConfig(cfg){
  await fs.writeFile(
    FORUM_CONFIG_FILE,
    JSON.stringify({
      closed: !!cfg.closed,
      message: cfg.message || "El foro está en mantenimiento temporal 💛"
    }, null, 2),
    "utf8"
  );
}


async function saveUsers(users){
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

async function requireAdmin(req, res, next){
  try{
    const users = await loadUsers();
    const u = users.find(x => x.id === req.session.userId);
    if (!u || !u.isAdmin){
      return res.status(403).json({ error:"No autorizado (solo moderación)." });
    }
    req.currentUser = u;
    next();
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Error de servidor." });
  }
}

function isUserBanned(u){
  if (!u) return false;
  if (u.bannedForever) return true;
  if (u.bannedUntil && u.bannedUntil > Date.now()) return true;
  return false;
}


function publicUser(u){
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    alias: u.alias,
    avatarPath: u.avatarPath || null,
    verified: !!u.verified,
    isAdmin: !!u.isAdmin,
    bannedForever: !!u.bannedForever,
    bannedUntil: u.bannedUntil || null
  };
}



// --- verificación por código en memoria ---
const verificationCodes = {}; // { email: { code, userId, expiresAt } }

// --- nodemailer ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "kiva.proyecto@gmail.com",        // ej: "kiva.proyecto@gmail.com"
    pass: "qsyu eyes hgkl wsuf"  // el código de 16 caracteres
  }
});


// --- API /api/me ---
app.get("/api/me", async (req,res) => {
  const users = await loadUsers();
  const u = users.find(x => x.id === req.session.userId);
  if (!u) return res.status(401).json({ user:null });
  res.json({ user: publicUser(u) });
});


// --- SIGNUP con foto + código de verificación ---
app.post("/api/signup", signupLimiter, upload.single("avatar"), async (req,res) => {
  try{
    const { email, firstName, lastName, password, alias } = req.body;

    // Validación básica
    if (!email || !firstName || !lastName || !password){
      return res.status(400).json({ error:"Faltan campos obligatorios." });
    }

    const users = await loadUsers();

    // Correo en minúsculas para evitar duplicados
    const emailLower = String(email).trim().toLowerCase();

    // Correo único
    if (users.some(u => (u.email || "").toLowerCase() === emailLower)){
      return res.status(400).json({ error:"Ese correo ya está registrado." });
    }

    // Hash seguro (bcrypt)
    const passwordHash = await bcrypt.hash(password, 12);

    // Guardar avatar si se subió uno
    const avatarPath = req.file
      ? "/uploads/avatars/" + path.basename(req.file.path)
      : null;

    // Crear ID seguro
    const id = "u_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2);

    // Generar código de verificación (6 dígitos)
    const verifyCode = Math.floor(100000 + Math.random()*900000).toString();
    const verifyExpire = Date.now() + 1000 * 60 * 15; // 15 minutos

    // Crear usuario
    const newUser = {
      id,
      email: emailLower,
      firstName:  firstName.trim(),
      lastName:   (lastName || "").trim(),
      alias:      alias && alias.trim() ? alias.trim() : null,
      avatarPath: avatarPath,
      passwordHash,
      verified: false,
      verifyCode,
      verifyExpire,
      isAdmin: false,
      bannedForever: false,
      bannedUntil: null,
      createdAt: Date.now()
    };

    users.push(newUser);
    await saveUsers(users);

    // Enviar correo (si ya configuraste nodemailer)
    try{
      await transporter.sendMail({
        from: MAIL_FROM,
        to: emailLower,
        subject: "Código de verificación — KIVA",
        html: `
          <h2>Hola ${newUser.firstName} 💛</h2>
          <p>Tu código para verificar tu cuenta es:</p>
          <h1>${verifyCode}</h1>
          <p>Este código expirará en 15 minutos.</p>
        `
      });
    }catch(err){
      console.error("Error enviando correo:", err);
    }

    res.status(201).json({
      ok:true,
      user: publicUser(newUser),
      message:"Cuenta creada. Revisa tu correo para verificarla."
    });

  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo crear la cuenta." });
  }
});


// --- VERIFICAR EMAIL ---
app.post("/api/verify-email", async (req,res) => {
  try{
    const { email, code } = req.body;
    if (!email || !code){
      return res.status(400).json({ error:"Faltan datos para verificar." });
    }
    const emailLower = email.toLowerCase();
    const record = verificationCodes[emailLower];
    if (!record){
      return res.status(400).json({ error:"No hay código pendiente para ese correo." });
    }
    if (record.expiresAt < Date.now()){
      delete verificationCodes[emailLower];
      return res.status(400).json({ error:"El código ha expirado, vuelve a registrarte." });
    }
    if (record.code !== code.trim()){
      return res.status(400).json({ error:"El código no es correcto." });
    }

    const users = await loadUsers();
    const u = users.find(x => x.id === record.userId);
    if (!u){
      return res.status(400).json({ error:"Usuario no encontrado." });
    }

    u.verified = true;
    await saveUsers(users);
    delete verificationCodes[emailLower];

    // iniciar sesión
    req.session.userId = u.id;

    res.json({ user: publicUser(u) });

  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Error al verificar el correo." });
  }
});

// LOGIN con bcrypt + rate limit
app.post("/api/login", loginLimiter, async (req, res) => {
  try{
    const { login, password } = req.body;
    if (!login || !password){
      return res.status(400).json({ error:"Faltan datos." });
    }

    const loginLower = String(login).trim().toLowerCase();
    const users = await loadUsers();

    // buscar por email, alias o nombre completo
    const user = users.find(u => {
      const email  = (u.email || "").toLowerCase();
      const alias  = (u.alias || "").toLowerCase();
      const full   = ((u.firstName || "") + " " + (u.lastName || "")).trim().toLowerCase();
      return email === loginLower || alias === loginLower || full === loginLower;
    });

    if (!user){
      return res.status(400).json({ error:"Usuario o contraseña incorrectos." });
    }

    // usuario baneado
    if (isUserBanned && isUserBanned(user)){
      return res.status(403).json({
        error:"Tu cuenta está suspendida y no puede iniciar sesión."
      });
    }

    // comprobar contraseña: soporte para cuentas viejas con password plano
    let ok = false;

    if (user.passwordHash){
      // caso nuevo (encriptado)
      ok = await bcrypt.compare(password, user.passwordHash);
    } else if (user.password){
      // caso antiguo (texto plano): solo por compatibilidad
      if (user.password === password){
        ok = true;
        // migrar a hash
        user.passwordHash = await bcrypt.hash(password, 12);
        delete user.password;
        await saveUsers(users);
      }
    }

    if (!ok){
      return res.status(400).json({ error:"Usuario o contraseña incorrectos." });
    }

    // login correcto
    req.session.userId = user.id;
    res.json({ user: publicUser(user) });

  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo iniciar sesión." });
  }
});


// --- LOGOUT ---
app.post("/api/logout", (req,res) => {
  req.session.destroy(() => {
    res.json({ ok:true });
  });
});

// ===== API Foro =====

// Obtener todos los hilos (incluye respuestas)
app.get("/api/threads", async (req, res) => {
  try{
    const threads = await loadThreads();
    // ordenar del más nuevo al más viejo
    threads.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ threads });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudieron cargar los mensajes." });
  }
});

// Crear un nuevo hilo raíz
app.post("/api/threads", async (req, res) => {
  try{
    const { text } = req.body;
    if (!text || !text.trim()){
      return res.status(400).json({ error:"El mensaje está vacío." });
    }

    // comprobar si el foro está cerrado
    const forumCfg = await loadForumConfig();
    if (forumCfg.closed){
      return res.status(503).json({ error: forumCfg.message });
    }

    const threads = await loadThreads();

    // usuario actual (si hay sesión)
    const users = await loadUsers();
    const user  = users.find(u => u.id === req.session.userId);

    // si tiene cuenta y está baneado, no puede publicar
    if (user && isUserBanned(user)){
      return res.status(403).json({
        error:"Tu cuenta está suspendida y no puede publicar en el foro."
      });
    }

    let alias      = "Anónimo";
    let avatarPath = null;
    let userId     = null;
    let isAnon     = true;

    if (user){
      userId     = user.id;
      avatarPath = user.avatarPath || null;
      alias      = (user.alias && user.alias.trim())
        ? user.alias.trim()
        : `${user.firstName} ${user.lastName}`.trim() || "Usuario";
      isAnon     = false; // si tiene cuenta se muestra con su alias/nombre
    }

    const thread = {
      id:        "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2),
      text:      text.trim(),
      userId,
      alias,
      avatarPath,
      isAnon,
      likes:     0,
      likedBy:   [],       // ids de usuarios que dieron like
      createdAt: Date.now(),
      replies:   []
    };

    threads.push(thread);
    await saveThreads(threads);

    res.status(201).json({ thread });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo guardar el mensaje." });
  }
});

// Añadir respuesta a un hilo
app.post("/api/threads/:id/replies", async (req, res) => {
  try{
    const { text } = req.body;
    if (!text || !text.trim()){
      return res.status(400).json({ error:"La respuesta está vacía." });
    }

    const threads = await loadThreads();
    const thread  = threads.find(t => t.id === req.params.id);
    if (!thread){
      return res.status(404).json({ error:"Hilo no encontrado." });
    }

    // comprobar si el foro está cerrado
    const forumCfg = await loadForumConfig();
    if (forumCfg.closed){
      return res.status(503).json({ error: forumCfg.message });
    }

    // usuario actual (si hay sesión)
    const users = await loadUsers();
    const user  = users.find(u => u.id === req.session.userId);

    // si tiene cuenta y está baneado, no puede responder
    if (user && isUserBanned(user)){
      return res.status(403).json({
        error:"Tu cuenta está suspendida y no puede responder en el foro."
      });
    }

    let alias      = "Anónimo";
    let avatarPath = null;
    let userId     = null;
    let isAnon     = true;

    if (user){
      userId     = user.id;
      avatarPath = user.avatarPath || null;
      alias      = (user.alias && user.alias.trim())
        ? user.alias.trim()
        : `${user.firstName} ${user.lastName}`.trim() || "Usuario";
      isAnon     = false;
    }

    const reply = {
      id:        "r_" + Date.now().toString(36) + Math.random().toString(36).slice(2),
      text:      text.trim(),
      userId,
      alias,
      avatarPath,
      isAnon,
      createdAt: Date.now()
    };

    thread.replies = thread.replies || [];
    thread.replies.push(reply);

    await saveThreads(threads);

    res.status(201).json({ thread });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo guardar la respuesta." });
  }
});

// Dar like a un hilo (solo con cuenta)
app.post("/api/threads/:id/like", async (req, res) => {
  try{
    const userId = req.session.userId;
    if (!userId){
      return res.status(401).json({ error:"Necesitas una cuenta para dar like." });
    }

    // cargar usuario para revisar ban
    const users = await loadUsers();
    const user  = users.find(u => u.id === userId);
    if (!user){
      return res.status(401).json({ error:"No se encontró la cuenta." });
    }

    // si está baneado, no puede dar like
    if (isUserBanned(user)){
      return res.status(403).json({
        error:"Tu cuenta está suspendida y no puede dar like."
      });
    }

    // respetar cierre del foro también para likes
    const forumCfg = await loadForumConfig();
    if (forumCfg.closed){
      return res.status(503).json({ error: forumCfg.message });
    }

    const threads = await loadThreads();
    const thread  = threads.find(t => t.id === req.params.id);
    if (!thread){
      return res.status(404).json({ error:"Hilo no encontrado." });
    }

    thread.likedBy = thread.likedBy || [];
    thread.likes   = thread.likes || 0;

    if (!thread.likedBy.includes(userId)){
      thread.likedBy.push(userId);
      thread.likes++;
      await saveThreads(threads);
    }

    res.json({ thread });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo registrar el like." });
  }
});


// ===== Rutas de moderación (solo admin) =====

// Listar usuarios (resumen)
app.get("/api/admin/users", requireAdmin, async (req,res) => {
  try{
    const users = await loadUsers();
    const list = users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      alias: u.alias,
      avatarPath: u.avatarPath || null,
      isAdmin: !!u.isAdmin,
      bannedForever: !!u.bannedForever,
      bannedUntil: u.bannedUntil || null,
      createdAt: u.createdAt || null
    }));
    res.json({ users: list });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudieron cargar los usuarios." });
  }
});

// Ban temporal: body { minutes }
app.post("/api/admin/users/:id/ban-temp", requireAdmin, async (req,res) => {
  try{
    const { minutes } = req.body;
    const mins = Number(minutes || 0);
    if (!mins || mins <= 0){
      return res.status(400).json({ error:"Minutos inválidos." });
    }
    const users = await loadUsers();
    const u = users.find(x => x.id === req.params.id);
    if (!u) return res.status(404).json({ error:"Usuario no encontrado." });

    u.bannedForever = false;
    u.bannedUntil = Date.now() + mins * 60 * 1000;

    await saveUsers(users);
    res.json({ user: publicUser(u) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo aplicar el ban temporal." });
  }
});

// Ban permanente
app.post("/api/admin/users/:id/ban-perm", requireAdmin, async (req,res) => {
  try{
    const users = await loadUsers();
    const u = users.find(x => x.id === req.params.id);
    if (!u) return res.status(404).json({ error:"Usuario no encontrado." });

    u.bannedForever = true;
    u.bannedUntil = null;

    await saveUsers(users);
    res.json({ user: publicUser(u) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo aplicar el ban permanente." });
  }
});

// Quitar ban
app.post("/api/admin/users/:id/unban", requireAdmin, async (req,res) => {
  try{
    const users = await loadUsers();
    const u = users.find(x => x.id === req.params.id);
    if (!u) return res.status(404).json({ error:"Usuario no encontrado." });

    u.bannedForever = false;
    u.bannedUntil = null;

    await saveUsers(users);
    res.json({ user: publicUser(u) });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo quitar el ban." });
  }
});

// Listar hilos
app.get("/api/admin/threads", requireAdmin, async (req,res) => {
  try{
    const threads = await loadThreads();
    threads.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ threads });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudieron cargar los hilos." });
  }
});

// Borrar hilo completo
app.delete("/api/admin/threads/:id", requireAdmin, async (req,res) => {
  try{
    const threads = await loadThreads();
    const before = threads.length;
    const filtered = threads.filter(t => t.id !== req.params.id);
    if (filtered.length === before){
      return res.status(404).json({ error:"Hilo no encontrado." });
    }
    await saveThreads(filtered);
    res.json({ ok:true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo borrar el hilo." });
  }
});

// Borrar comentario específico (respuesta)
app.delete("/api/admin/threads/:threadId/replies/:replyId", requireAdmin, async (req,res) => {
  try{
    const threads = await loadThreads();
    const t = threads.find(x => x.id === req.params.threadId);
    if (!t){
      return res.status(404).json({ error:"Hilo no encontrado." });
    }

    const before = (t.replies || []).length;
    t.replies = (t.replies || []).filter(r => r.id !== req.params.replyId);
    if (t.replies.length === before){
      return res.status(404).json({ error:"Comentario no encontrado." });
    }

    await saveThreads(threads);
    res.json({ thread: t });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo borrar el comentario." });
  }
});

// Borrar TODOS los hilos (requiere confirmación)
app.delete("/api/admin/threads", requireAdmin, async (req,res) => {
  try{
    const { confirm } = req.body;
    if (!confirm){
      return res.status(400).json({ error:"Falta confirmación." });
    }
    await saveThreads([]);
    res.json({ ok:true });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudieron borrar todos los hilos." });
  }
});

// Estado del foro (abierto/cerrado)
app.get("/api/admin/forum-config", requireAdmin, async (req,res) => {
  try{
    const cfg = await loadForumConfig();
    res.json(cfg);
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo obtener la config del foro." });
  }
});

app.post("/api/admin/forum-config", requireAdmin, async (req,res) => {
  try{
    const { closed, message } = req.body;
    const cfg = {
      closed: !!closed,
      message: message || "El foro está en mantenimiento temporal 💛"
    };
    await saveForumConfig(cfg);
    res.json(cfg);
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"No se pudo actualizar la config del foro." });
  }
});

app.use((err, req, res, next) => {
  // Errores de upload (multer)
  if (err && err.name === "MulterError"){
    if (err.code === "LIMIT_FILE_SIZE"){
      return res.status(400).json({ error:"La imagen es demasiado grande (máx. 8 MB)." });
    }
    return res.status(400).json({ error:"Error al subir la imagen." });
  }

  if (err){
    console.error(err);
    return res.status(500).json({ error:"Error interno del servidor." });
  }

  next();
});


// --- iniciar servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor escuchando en puerto", PORT);
});
