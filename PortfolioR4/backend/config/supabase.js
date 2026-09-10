import "./env.js";
import { createClient } from "@supabase/supabase-js";
// Este cliente es sólo para el endpoint opcional de contacto. Nunca se importa en React.
export function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  console.log("Supabase config:", {
    hasUrl: Boolean(url),
    urlStart: url?.slice(0, 25),
    hasSecretKey: Boolean(key),
    // Never log any part of a secret key.
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
