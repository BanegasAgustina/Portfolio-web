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
function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
async function serverApi<T>(path: string, options: RequestInit): Promise<T> {
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
async function list(table: string): Promise<RecordData[]> {
  const query = getSupabase().from(table).select("*");
  if (table === "projects") query.order("is_featured", { ascending: false });
  const { data, error } = await query.order("display_order").order("id");
  check(error);
  return data || [];
}
async function portfolio(): Promise<Portfolio> {
  const client = getSupabase();
  const [{ data: profile, error }, entries] = await Promise.all([
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
// Conserva la interfaz de los componentes existentes, pero ejecuta Supabase directamente.
// La autorización efectiva de cada operación está en RLS, no en este adaptador.
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (path.startsWith("/auth/") || path.startsWith("/admin"))
    return serverApi<T>(path, options);
  if (path === "/portfolio") return portfolio() as Promise<T>;
  throw new Error("Recurso no disponible.");
}
export const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});
