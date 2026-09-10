import "./env.js";
import { createClient } from "@supabase/supabase-js";
// Este cliente es sólo para el endpoint opcional de contacto. Nunca se importa en React.
export function getServerSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw Object.assign(
      new Error("Falta configurar la conexión privada con Supabase."),
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
