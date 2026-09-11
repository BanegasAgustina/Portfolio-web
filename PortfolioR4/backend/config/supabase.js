/*
 * Archivo: backend/config/supabase.js
 * Propósito:
 * Fábrica del cliente privado usado por rutas y middleware de Express.
 * Lee SUPABASE_URL y SUPABASE_SECRET_KEY del entorno; lanza un error 503 si falta configuración.
 * Desactiva la persistencia de Supabase Auth: la sesión del admin se gestiona en adminAuth.js.
 * Este módulo no debe importarse desde el frontend.
 */
import "./env.js";
import { createClient } from "@supabase/supabase-js";
// Lo usan contacto, login, sesiones y CRUD. La clave privada queda en el backend, nunca en React.
// Devuelve una nueva instancia del cliente del servidor o lanza 503; no crea una sesión de usuario.
export function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  console.log("Supabase config:", {
    hasUrl: Boolean(url),
    urlStart: url?.slice(0, 25),
    hasSecretKey: Boolean(key),
    // Registra sólo si hay clave configurada, nunca su contenido.
    secretConfigured: Boolean(key),
  });
  if (!url || !key)
    throw Object.assign(
      new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY."),
      { status: 503 },
    );
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
