import "./env.js";
import { createClient } from "@supabase/supabase-js";
// Este cliente es sólo para el endpoint opcional de contacto. Nunca se importa en React.
export function getServerSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY)
    throw Object.assign(
      new Error("El servicio de contacto todavía no está configurado."),
      { status: 503 },
    );
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
