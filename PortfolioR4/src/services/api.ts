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
export async function isAdministrator() {
  const client = getSupabase();
  const { data: session } = await client.auth.getSession();
  if (!session.session) return false;
  const { data: user, error: userError } = await client.auth.getUser();
  check(userError);
  if (!user.user) return false;
  const { data, error } = await client.rpc("is_admin");
  check(error);
  return data === true;
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
async function upload(body: FormData) {
  const file = body.get("image");
  if (!(file instanceof File)) throw new Error("Seleccioná una imagen.");
  if (file.size > 5 * 1024 * 1024 || !file.size)
    throw new Error("La imagen debe pesar entre 1 byte y 5 MB.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = new TextDecoder().decode(bytes);
  const extension =
    bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
      ? "png"
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        ? "jpg"
        : ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP"
          ? "webp"
          : null;
  const mime = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
  if (!extension || file.type !== mime[extension])
    throw new Error("El contenido debe ser una imagen JPG, PNG o WEBP válida.");
  const client = getSupabase();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  check(authError);
  if (!user) throw new Error("Iniciá sesión para subir imágenes.");
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage
    .from("portfolio-images")
    .upload(path, file, { contentType: mime[extension], upsert: false });
  check(error);
  return {
    url: client.storage.from("portfolio-images").getPublicUrl(path).data
      .publicUrl,
  };
}
// Conserva la interfaz de los componentes existentes, pero ejecuta Supabase directamente.
// La autorización efectiva de cada operación está en RLS, no en este adaptador.
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const client = getSupabase();
  const method = options.method || "GET";
  const body = typeof options.body === "string" ? JSON.parse(options.body) : {};
  let result: unknown;
  if (path === "/portfolio") result = await portfolio();
  else if (path === "/auth/me")
    result = { authenticated: await isAdministrator() };
  else if (path === "/auth/login") {
    const { error } = await client.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    check(error);
    if (!(await isAdministrator())) {
      await client.auth.signOut();
      throw new Error(
        "Esta cuenta no está autorizada para administrar el portfolio.",
      );
    }
    result = { authenticated: true };
  } else if (path === "/auth/logout") {
    const { error } = await client.auth.signOut();
    check(error);
    result = { ok: true };
  } else if (path === "/admin/upload" && options.body instanceof FormData) {
    result = await upload(options.body);
  } else if (path === "/admin/profile") {
    if (method === "GET") {
      const { data, error } = await client
        .from("profile")
        .select("*")
        .eq("id", 1)
        .single();
      check(error);
      result = data;
    } else {
      const { data, error } = await client.rpc("save_profile", {
        record: body,
      });
      check(error);
      result = data;
      window.dispatchEvent(new Event("portfolio-content-changed"));
    }
  } else {
    const match = path.match(/^\/admin\/([a-z_]+)(?:\/(\d+))?$/);
    if (!match || ![...tables, "messages"].includes(match[1]))
      throw new Error("Recurso no disponible.");
    const table = match[1] === "messages" ? "contact_messages" : match[1];
    const id = match[2] ? Number(match[2]) : undefined;
    if (method === "GET") {
      if (table === "contact_messages") {
        const { data, error } = await client
          .from(table)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500);
        check(error);
        result = data;
      } else result = await list(table);
    } else if (method === "POST" && table !== "contact_messages") {
      const { data, error } = await client
        .from(table)
        .insert(body)
        .select("id")
        .single();
      check(error);
      result = data;
    } else if (method === "PUT" && id) {
      const { data, error } = await client
        .from(table)
        .update(table === "contact_messages" ? { is_read: true } : body)
        .eq("id", id)
        .select("id")
        .single();
      check(error);
      result = data;
    } else if (method === "DELETE" && id) {
      const { data, error } = await client
        .from(table)
        .delete()
        .eq("id", id)
        .select("id")
        .single();
      check(error);
      result = data;
    } else throw new Error("Operación no disponible.");
    if (method !== "GET")
      window.dispatchEvent(new Event("portfolio-content-changed"));
  }
  return result as T;
}
export const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});
