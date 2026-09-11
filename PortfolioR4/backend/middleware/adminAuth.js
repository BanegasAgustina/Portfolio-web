/*
 * Archivo: backend/middleware/adminAuth.js
 * Propósito:
 * Sesiones propias del administrador: token aleatorio en cookie HttpOnly y registro en admin_sessions.
 * createAdminSession inicia una sesión de ocho horas; destroyAdminSession intenta borrarla y expira la cookie.
 * requireAdmin consulta su vigencia antes de dejar pasar una operación protegida. No usa Supabase Auth.
 */
import crypto from "node:crypto";
import { getServerSupabase } from "../config/supabase.js";

const cookieName = "admin_session";
// Duración fija desde el login; leer o usar la sesión no extiende su vencimiento.
const sessionDuration = 8 * 60 * 60 * 1000;

// Recibe req de Express y devuelve el token de admin_session o cadena vacía si no existe.
function getSessionId(req) {
  const cookies = req.get("cookie")?.split(";") || [];
  const session = cookies.find((cookie) =>
    cookie.trim().startsWith(`${cookieName}=`),
  );
  return session?.trim().slice(cookieName.length + 1) || "";
}

// Recibe res y el ID del administrador; inserta token, vencimiento y adminId serializado en admin_sessions.
// Responde mediante Set-Cookie; la promesa no devuelve datos de negocio al llamador.
export async function createAdminSession(res, adminId) {
  console.log("[LOGIN] 9 before session creation");
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionDuration;
  // INSERT persiste la sesión en Supabase para que otras instancias del servidor puedan comprobarla.
  const { data, error } = await getServerSupabase()
    .from("admin_sessions")
    .insert({
    session_id: sessionId,
    expires_at: expiresAt,
    data: JSON.stringify({ adminId }),
    })
    .select("session_id");
  console.log("[LOGIN] session insert result", {
    hasData: Boolean(data),
    hasError: Boolean(error),
    errorCode: error?.code,
    errorMessage: error?.message,
  });
  if (error) {
    console.error("[LOGIN] SESSION ERROR", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
  // HttpOnly impide leer la cookie desde JavaScript; SameSite=Lax limita su envío entre sitios.
  // Secure se agrega en producción; Max-Age usa segundos, mientras expires_at se guarda en milisegundos.
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=${sessionId}; Max-Age=${sessionDuration / 1000}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
  console.log("[LOGIN] 10 session created");
}

// Recibe req/res: busca el token, intenta DELETE de esa sesión y ordena al navegador expirar la cookie.
// La implementación actual no inspecciona el error devuelto por ese DELETE.
export async function destroyAdminSession(req, res) {
  const sessionId = getSessionId(req);
  if (sessionId) {
    await getServerSupabase()
      .from("admin_sessions")
      .delete()
      .eq("session_id", sessionId);
  }
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`,
  );
}

// Middleware de /admin: recibe req/res/next y devuelve 401 si no existe una sesión vigente.
// Si es válida, añade adminId a req.admin desde el JSON guardado y continúa con next().
export async function requireAdmin(req, res, next) {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "No autorizado." });
  // SELECT busca sólo la sesión indicada por la cookie; maybeSingle permite no encontrar ninguna.
  const { data, error } = await getServerSupabase()
    .from("admin_sessions")
    .select("expires_at, data")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error || !data || Number(data.expires_at) < Date.now()) {
    // Si encontró una sesión vencida, intenta eliminarla antes de rechazar el acceso.
    if (data) {
      await getServerSupabase()
        .from("admin_sessions")
        .delete()
        .eq("session_id", sessionId);
    }
    return res.status(401).json({ error: "No autorizado." });
  }
  req.admin = JSON.parse(data.data);
  return next();
}
