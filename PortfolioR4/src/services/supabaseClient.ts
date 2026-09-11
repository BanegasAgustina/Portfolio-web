/*
 * Archivo: src/services/supabaseClient.ts
 * Propósito:
 * Configura el cliente público de Supabase usado por services/api para leer el portfolio.
 * Comprueba las variables VITE_ antes de crearlo y guarda un error si falta configuración.
 * No es el login actual del administrador: ese login usa la API y la cookie admin_session.
 */
import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
let configurationError = "";
// Valida configuración local, sin conectarse aún. Decodificar el JWT comprueba el rol declarado, no su firma.
try {
  if (!url || !key)
    throw new Error(
      "Falta configurar Supabase: completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env y reiniciá la aplicación.",
    );
  if (new URL(url).protocol !== "https:")
    throw new Error("Usá la URL HTTPS de tu proyecto de Supabase.");
  if (key.startsWith("sb_secret_"))
    throw new Error(
      "La clave del frontend debe ser pública (anon/publishable), nunca secreta.",
    );
  if (key.split(".").length === 3) {
    const payload = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.role !== "anon")
      throw new Error("Usá la clave pública anon de Supabase en el frontend.");
  }
} catch (error) {
  configurationError =
    error instanceof Error
      ? error.message
      : "Configuración de Supabase inválida.";
}
// Crea una sola instancia pública si la configuración es válida; de lo contrario exporta null.
export const supabase = !configurationError
  ? createClient(url!, key!, {
      // Estas opciones permiten al SDK persistir/renovar tokens de Supabase Auth si se usa ese flujo.
      // El administrador vigente no lo usa: restaura su cookie consultando /api/auth/me.
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
// Devuelve el cliente listo o lanza el error de configuración para que Desktop lo pueda mostrar.
export function getSupabase() {
  if (!supabase) throw new Error(configurationError);
  return supabase;
}
