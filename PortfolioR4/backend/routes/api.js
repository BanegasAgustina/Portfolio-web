/*
 * Archivo: backend/routes/api.js
 * Propósito:
 * Endpoints del backend, montados normalmente bajo /api por app.js.
 * Incluye salud, contacto público, login por contraseña, consulta/cierre de sesión y administración.
 * requireAdmin protege /admin; getServerSupabase ejecuta consultas con la clave privada del servidor.
 * Los cuerpos del CRUD se reciben desde Editor; contactSchema valida específicamente los mensajes públicos.
 */
import { Router } from "express";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import multer from "multer";
import { contactSchema } from "../middleware/validation.js";
import { getServerSupabase } from "../config/supabase.js";
import {
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
} from "../middleware/adminAuth.js";
export const api = Router();
// Multer mantiene el archivo temporalmente en memoria; la ruta validará además sus bytes y tipo MIME.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
// Lista de tablas aceptadas por el CRUD genérico; profile tiene rutas separadas por ser un registro único.
const adminTables = [
  "projects",
  "skills",
  "experiences",
  "education",
  "social_links",
  "soft_skills",
  "contact_messages",
];
// Recibe el nombre usado por la interfaz; traduce messages al nombre real contact_messages.
function resolveTable(name) {
  return name === "messages" ? "contact_messages" : name;
}
// GET /api/health — no recibe body. Lee como máximo un ID de projects para comprobar conexión.
// Devuelve { status: "ok", database: "supabase" } o propaga el error.
api.get("/health", async (_req, res) => {
  const { error } = await getServerSupabase()
    .from("projects")
    .select("id")
    .limit(1);
  if (error) throw new Error("Supabase no respondió correctamente.");
  res.json({ status: "ok", database: "supabase" });
});
// Conserva el endpoint y su protección contra abuso; RLS no permite insertar mensajes públicamente.
// POST /api/contact — público. Recibe { name, email, subject, message }; valida con Zod.
// Limita a cinco solicitudes por 15 minutos por cliente según express-rate-limit. Inserta contact_messages y devuelve 201 { ok: true }.
api.post(
  "/contact",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Revisá los datos del mensaje." });
    // INSERT guarda sólo los campos aceptados por contactSchema; el cliente público no realiza esta escritura.
    const { error } = await getServerSupabase()
      .from("contact_messages")
      .insert(parsed.data);
    if (error) throw new Error("No se pudo guardar el mensaje.");
    res.status(201).json({ ok: true });
  },
);

// POST /api/auth/login — recibe { password }, compara bcrypt con admins.id=1 y crea la sesión.
// Devuelve { authenticated: true } más cookie; 400 para formato, 401 para clave incorrecta o error de servicio.
// El límite es de diez solicitudes por 15 minutos. No autentica mediante Supabase Auth.
api.post("/auth/login", rateLimit({ windowMs: 15 * 60000, limit: 10 }), async (req, res) => {
  console.log("[LOGIN] 1 request received");
  const password = req.body?.password;
  console.log("[LOGIN] 2 body parsed", {
    hasPassword: Boolean(password),
    passwordType: typeof password,
  });
  if (typeof password !== "string" || !password || password.length > 128)
    return res.status(400).json({ error: "Ingresá una contraseña válida." });
  let stage = "supabase";
  try {
    console.log("[LOGIN] 3 getting Supabase client");
    const supabase = getServerSupabase();
    console.log("[LOGIN] 4 querying admins");
    // SELECT obtiene el hash privado del único administrador esperado; nunca devuelve ese hash al navegador.
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, password_hash")
      .eq("id", 1)
      .single();
    console.log("[LOGIN] 5 admin query result", {
      hasAdmin: Boolean(admin),
      hasHash: Boolean(admin?.password_hash),
      hasError: Boolean(error),
      errorCode: error?.code,
    });
    if (error) throw error;
    if (!admin || typeof admin.password_hash !== "string")
      return res
        .status(503)
        .json({ error: "El administrador no está configurado." });
    console.log("[LOGIN] 6 before bcrypt");
    stage = "bcrypt";
    // Compara la contraseña recibida con el hash; no necesita desencriptar ni guardar la contraseña enviada.
    const valid = await bcrypt.compare(password, admin.password_hash);
    console.log("[LOGIN] 7 bcrypt result", { validPassword: valid });
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas." });
    console.log("[LOGIN] 8 password validated");
    stage = "session";
    await createAdminSession(res, admin.id);
    console.log("[LOGIN] 11 login completed");
    return res.json({ authenticated: true });
  } catch (error) {
    console.error("Admin login failed:", {
      stage,
      message: error?.message,
      name: error?.name,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack,
    });
    throw error;
  }
});

// GET /api/auth/me — sin body. Lee admin_session y consulta su expires_at.
// Devuelve { authenticated: boolean }; no renueva ni crea la sesión.
api.get("/auth/me", async (req, res) => {
  const sessionId = req.get("cookie")?.match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1];
  if (!sessionId) return res.json({ authenticated: false });
  const { data, error } = await getServerSupabase()
    .from("admin_sessions")
    .select("expires_at")
    .eq("session_id", sessionId)
    .maybeSingle();
  return res.json({ authenticated: !error && !!data && Number(data.expires_at) >= Date.now() });
});

// POST /api/auth/logout — usa la cookie, solicita borrar la sesión y devuelve { ok: true }.
// No requiere body ni pasar requireAdmin para permitir cerrar una sesión ya vencida.
api.post("/auth/logout", async (req, res) => {
  await destroyAdminSession(req, res);
  res.json({ ok: true });
});

// Todas las rutas /admin declaradas debajo pasan primero por la comprobación de cookie/sesión.
api.use("/admin", requireAdmin);

// GET /api/admin/profile — protegido. Devuelve el registro completo de profile con id=1.
api.get("/admin/profile", async (_req, res) => {
  const { data, error } = await getServerSupabase()
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  res.json(data);
});

// PUT /api/admin/profile — protegido. Recibe los campos editados en req.body.
// Actualiza profile.id=1 y devuelve el registro completo; no crea un perfil nuevo.
api.put("/admin/profile", async (req, res) => {
  const { data, error } = await getServerSupabase()
    .from("profile")
    .update(req.body)
    .eq("id", 1)
    .select("*")
    .single();
  if (error) throw error;
  res.json(data);
});

// POST /api/admin/upload — protegido. Recibe multipart/form-data con el archivo image (máximo 5 MB).
// Comprueba PNG/JPEG/WEBP, sube al bucket portfolio-images y devuelve { url } pública. No actualiza el registro del formulario.
api.post("/admin/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Seleccioná una imagen." });
  // No confía sólo en extensión o MIME: contrasta bytes iniciales; WEBP exige RIFF y WEBP en posiciones concretas.
  const signatures = [
    ["png", "image/png", [137, 80, 78, 71, 13, 10, 26, 10]],
    ["jpg", "image/jpeg", [255, 216, 255]],
    ["webp", "image/webp", "RIFF"],
  ];
  const match = signatures.find(([extension, mime, signature]) => {
    if (req.file.mimetype !== mime) return false;
    if (extension === "webp")
      return req.file.buffer.toString("ascii", 0, 4) === signature &&
        req.file.buffer.toString("ascii", 8, 12) === "WEBP";
    return signature.every((byte, index) => req.file.buffer[index] === byte);
  });
  if (!match) return res.status(400).json({ error: "El contenido debe ser una imagen JPG, PNG o WEBP válida." });
  // Nombre aleatorio evita colisiones; upsert:false impide reemplazar un objeto existente.
  const path = `admin/${crypto.randomUUID()}.${match[0]}`;
  // Storage guarda bytes en el bucket, no en una tabla de registros del portfolio.
  const { error } = await getServerSupabase()
    .storage.from("portfolio-images")
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (error) throw error;
  // getPublicUrl construye la URL del objeto; su acceso depende de la configuración pública del bucket.
  res.json({ url: getServerSupabase().storage.from("portfolio-images").getPublicUrl(path).data.publicUrl });
});

// GET /api/admin/:table — protegido. Recibe la sección por URL y devuelve una lista.
// messages apunta a contact_messages: hasta 500 mensajes recientes; las demás tablas se ordenan por display_order e id.
api.get("/admin/:table", async (req, res) => {
  const table = resolveTable(req.params.table);
  if (!adminTables.includes(table))
    return res.status(404).json({ error: "Recurso no disponible." });
  let query = getServerSupabase().from(table).select("*");
  if (table === "contact_messages")
    query = query.order("created_at", { ascending: false }).limit(500);
  else query = query.order("display_order").order("id");
  const { data, error } = await query;
  if (error) throw error;
  res.json(data || []);
});

// POST /api/admin/:table — protegido. Recibe los campos del registro en req.body y la sección por URL.
// INSERT crea en una tabla admitida y devuelve 201 { id }. No permite crear mensajes por esta ruta.
api.post("/admin/:table", async (req, res) => {
  const table = resolveTable(req.params.table);
  if (!adminTables.includes(table) || table === "contact_messages")
    return res.status(404).json({ error: "Recurso no disponible." });
  const { data, error } = await getServerSupabase()
    .from(table)
    .insert(req.body)
    .select("id")
    .single();
  if (error) throw error;
  res.status(201).json(data);
});

// PUT /api/admin/:table/:id — protegido. Recibe sección, ID y campos a editar; devuelve { id }.
// UPDATE filtra por ID; para messages ignora el body y sólo fija is_read=true.
api.put("/admin/:table/:id", async (req, res) => {
  const table = resolveTable(req.params.table);
  if (!adminTables.includes(table))
    return res.status(404).json({ error: "Recurso no disponible." });
  // Los mensajes tienen una operación especial de lectura; el resto envía los campos recibidos a Supabase.
  const changes = table === "contact_messages" ? { is_read: true } : req.body;
  const { data, error } = await getServerSupabase()
    .from(table)
    .update(changes)
    .eq("id", Number(req.params.id))
    .select("id")
    .single();
  if (error) throw error;
  res.json(data);
});

// DELETE /api/admin/:table/:id — protegido. Recibe sección e ID, sin body, y devuelve { id } eliminado.
// Rechaza contact_messages (incluido su alias messages) con 404: documenta la restricción actual, no la modifica.
api.delete("/admin/:table/:id", async (req, res) => {
  const table = resolveTable(req.params.table);
  if (!adminTables.includes(table) || table === "contact_messages")
    return res.status(404).json({ error: "Recurso no disponible." });
  const { data, error } = await getServerSupabase()
    .from(table)
    .delete()
    .eq("id", Number(req.params.id))
    .select("id")
    .single();
  if (error) throw error;
  res.json(data);
});
