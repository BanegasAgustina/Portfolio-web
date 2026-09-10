import crypto from "node:crypto";
import { getServerSupabase } from "../config/supabase.js";

const cookieName = "admin_session";
const sessionDuration = 8 * 60 * 60 * 1000;

function getSessionId(req) {
  const cookies = req.get("cookie")?.split(";") || [];
  const session = cookies.find((cookie) =>
    cookie.trim().startsWith(`${cookieName}=`),
  );
  return session?.trim().slice(cookieName.length + 1) || "";
}

export async function createAdminSession(res, adminId) {
  const sessionId = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + sessionDuration;
  const { error } = await getServerSupabase().from("admin_sessions").insert({
    session_id: sessionId,
    expires_at: expiresAt,
    data: JSON.stringify({ adminId }),
  });
  if (error) throw new Error("No se pudo iniciar la sesión.");
  res.cookie(cookieName, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionDuration,
    path: "/",
  });
}

export async function destroyAdminSession(req, res) {
  const sessionId = getSessionId(req);
  if (sessionId) {
    await getServerSupabase()
      .from("admin_sessions")
      .delete()
      .eq("session_id", sessionId);
  }
  res.clearCookie(cookieName, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function requireAdmin(req, res, next) {
  const sessionId = getSessionId(req);
  if (!sessionId) return res.status(401).json({ error: "No autorizado." });
  const { data, error } = await getServerSupabase()
    .from("admin_sessions")
    .select("expires_at, data")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error || !data || Number(data.expires_at) < Date.now()) {
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

