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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const adminTables = [
  "projects",
  "skills",
  "experiences",
  "education",
  "social_links",
  "soft_skills",
  "contact_messages",
];
function resolveTable(name) {
  return name === "messages" ? "contact_messages" : name;
}
api.get("/health", async (_req, res) => {
  const { error } = await getServerSupabase()
    .from("projects")
    .select("id")
    .limit(1);
  if (error) throw new Error("Supabase no respondió correctamente.");
  res.json({ status: "ok", database: "supabase" });
});
// Conserva el endpoint y su protección contra abuso; RLS no permite insertar mensajes públicamente.
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
    const { error } = await getServerSupabase()
      .from("contact_messages")
      .insert(parsed.data);
    if (error) throw new Error("No se pudo guardar el mensaje.");
    res.status(201).json({ ok: true });
  },
);

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

api.post("/auth/logout", async (req, res) => {
  await destroyAdminSession(req, res);
  res.json({ ok: true });
});

api.use("/admin", requireAdmin);

api.get("/admin/profile", async (_req, res) => {
  const { data, error } = await getServerSupabase()
    .from("profile")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  res.json(data);
});

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

api.post("/admin/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Seleccioná una imagen." });
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
  const path = `admin/${crypto.randomUUID()}.${match[0]}`;
  const { error } = await getServerSupabase()
    .storage.from("portfolio-images")
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (error) throw error;
  res.json({ url: getServerSupabase().storage.from("portfolio-images").getPublicUrl(path).data.publicUrl });
});

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

api.put("/admin/:table/:id", async (req, res) => {
  const table = resolveTable(req.params.table);
  if (!adminTables.includes(table))
    return res.status(404).json({ error: "Recurso no disponible." });
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
