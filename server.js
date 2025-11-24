// server.js
const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const bcrypt = require("bcryptjs");
const multer = require("multer");
const session = require("express-session");
const nodemailer = require("nodemailer");

const app = express();

// --- sesiones ---
app.use(session({
  secret: process.env.SESSION_SECRET || "kiva-dev-secret",
  resave:false,
  saveUninitialized:false,
  cookie:{ secure:false } // en producción, true + https
}));

// --- static ---
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// --- subida de avatar ---
const upload = multer({
  dest: path.join(__dirname, "uploads", "avatars"),
  limits:{ fileSize: 2 * 1024 * 1024 } // 2 MB
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

async function saveUsers(users){
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function publicUser(u){
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    alias: u.alias,
    avatarPath: u.avatarPath || null,
    verified: u.verified
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
app.post("/api/signup", upload.single("avatar"), async (req,res) => {
  try{
    const { email, firstName, lastName, password, alias } = req.body;

    if (!email || !firstName || !lastName || !password){
      return res.status(400).json({ error:"Faltan campos obligatorios." });
    }

    const users = await loadUsers();

    // correo único
    const emailLower = email.toLowerCase();
    if (users.some(u => u.email.toLowerCase() === emailLower)){
      return res.status(400).json({ error:"Ese correo ya está registrado." });
    }

    const hash = await bcrypt.hash(password, 10);

    const avatarPath = req.file
      ? "/uploads/avatars/" + path.basename(req.file.path)
      : null;

    const id = "u_" + Date.now().toString(36);

    const newUser = {
      id,
      email: emailLower,
      firstName: firstName.trim(),
      lastName:  (lastName || "").trim(),
      alias:     (alias || "").trim() || null,
      passwordHash: hash,
      avatarPath,
      verified:false,
      createdAt: Date.now()
    };

    users.push(newUser);
    await saveUsers(users);

    // generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[emailLower] = {
      code,
      userId: id,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 min
    };

    // enviar correo (en desarrollo puedes solo console.log)
// enviar correo con el código
try {
  await transporter.sendMail({
    from: "KIVA <TU_CORREO_GMAIL_AQUI>",   // opcional, solo para que se vea bonito
    to: emailLower,
    subject: "Código de verificación KIVA",
    text: `Tu código de verificación es: ${code}`,
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p>`
  });
  console.log("Código de verificación enviado a", emailLower, "=>", code);
} catch (err) {
  console.error("Error al enviar el correo:", err);
  return res.status(500).json({ error:"No se pudo enviar el correo de verificación." });
}


    res.json({ needsVerification:true });

  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Error al crear la cuenta." });
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

// --- LOGIN (solo usuarios verificados) ---
app.post("/api/login", async (req,res) => {
  try{
    const { login, password } = req.body;
    const users = await loadUsers();

    const loginLower = login.toLowerCase();
    const u = users.find(user =>
      user.email.toLowerCase() === loginLower ||
      (user.alias && user.alias.toLowerCase() === loginLower)
    );

    if (!u){
      return res.status(400).json({ error:"Usuario o contraseña incorrectos." });
    }
    if (!u.verified){
      return res.status(400).json({ error:"Tu correo aún no está verificado." });
    }

    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok){
      return res.status(400).json({ error:"Usuario o contraseña incorrectos." });
    }

    req.session.userId = u.id;
    res.json({ user: publicUser(u) });

  }catch(err){
    console.error(err);
    res.status(500).json({ error:"Error al iniciar sesión." });
  }
});

// --- LOGOUT ---
app.post("/api/logout", (req,res) => {
  req.session.destroy(() => {
    res.json({ ok:true });
  });
});

// --- iniciar servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("KIVA server escuchando en http://localhost:" + PORT);
});
