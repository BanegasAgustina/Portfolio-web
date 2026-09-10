import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
let configurationError = "";
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
export const supabase = !configurationError
  ? createClient(url!, key!, {
      // Sólo tokens de sesión: la contraseña nunca se guarda por la aplicación.
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
export function getSupabase() {
  if (!supabase) throw new Error(configurationError);
  return supabase;
}
