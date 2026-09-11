/*
 * Archivo: src/services/api.ts
 * Propósito:
 * Puerta de entrada a los datos para las pantallas. /portfolio combina lecturas públicas de Supabase.
 * /auth/* y /admin* se envían por fetch a Express bajo /api, con la cookie del mismo origen.
 * Exporta api (promesa de datos) y send (opciones HTTP); transforma fallos en errores legibles.
 */
import { getSupabase } from "./supabaseClient";
import type { Portfolio, RecordData } from "../types";

const tables = [
  "projects",
  "skills",
  "experiences",
  "education",
  "social_links",
  "soft_skills",
] as const;
// Recibe un error de Supabase o null; lanza Error sólo si la operación falló.
function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
// Recibe ruta relativa y opciones HTTP; devuelve JSON o rechaza la promesa con un mensaje del backend.
async function serverApi<T>(path: string, options: RequestInit): Promise<T> {
  // GET lee por defecto; send aporta POST/PUT/DELETE. same-origin envía la cookie de sesión.
  // Con FormData no fija Content-Type: el navegador añade el separador necesario para subir el archivo.
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers:
      options.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response
    .json()
    .catch(() => ({ error: "El servidor no respondió correctamente." }));
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la operación.");
  return data as T;
}
// Recibe nombre de tabla y devuelve registros por display_order e id; en proyectos prioriza destacados.
async function list(table: string): Promise<RecordData[]> {
  const query = getSupabase().from(table).select("*");
  if (table === "projects") query.order("is_featured", { ascending: false });
  const { data, error } = await query.order("display_order").order("id");
  check(error);
  return data || [];
}
// Devuelve Portfolio combinando en paralelo seis listas y la función SQL del perfil público.
async function portfolio(): Promise<Portfolio> {
  const client = getSupabase();
  const [{ data: profile, error }, entries] = await Promise.all([
    // RPC llama a get_public_profile en Supabase: su definición SQL no está incluida en este repositorio.
    client.rpc("get_public_profile"),
    Promise.all(tables.map(async (table) => [table, await list(table)])),
  ]);
  check(error);
  if (!profile)
    throw new Error(
      "El portfolio todavía no tiene datos. Importá la semilla en Supabase.",
    );
  return { profile, ...Object.fromEntries(entries) } as Portfolio;
}
// Decide el transporte según la ruta: lectura pública con Supabase y administración con Express.
// RLS regula el cliente público; requireAdmin protege las operaciones privadas del backend.
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (path.startsWith("/auth/") || path.startsWith("/admin"))
    return serverApi<T>(path, options);
  if (path === "/portfolio") return portfolio() as Promise<T>;
  throw new Error("Recurso no disponible.");
}
// Recibe método y datos opcionales; devuelve RequestInit con JSON. No realiza la petición por sí sola.
export const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});
