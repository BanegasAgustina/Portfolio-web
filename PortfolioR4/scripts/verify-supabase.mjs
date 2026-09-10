import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url), quiet: true });
const url = process.env.VITE_SUPABASE_URL,
  key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key)
  throw new Error(
    "Pendiente: crear Supabase y completar .env antes de verificar la conexión real.",
  );
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const publicClient = createClient(url, key, options);
for (const table of [
  "projects",
  "skills",
  "experiences",
  "education",
  "social_links",
  "soft_skills",
]) {
  const { error } = await publicClient.from(table).select("id").limit(1);
  assert.equal(error, null, `Lectura de ${table}`);
}
const profile = await publicClient.rpc("get_public_profile");
assert.equal(profile.error, null);
assert.ok(profile.data, "Importar datos");
if (!profile.data.show_phone) assert.equal("phone" in profile.data, false);
assert.ok(
  (await publicClient.from("profile").select("*")).error,
  "Perfil privado",
);
assert.ok(
  (await publicClient.from("soft_skills").insert({ name: "Prueba anónima" }))
    .error,
  "Escritura pública bloqueada",
);
console.log("Lectura pública y bloqueo anónimo: OK");
if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD)
  throw new Error(
    "Falta TEST_ADMIN_EMAIL y TEST_ADMIN_PASSWORD para comprobar Auth, CRUD y Storage. Configurarlas temporalmente en la terminal, nunca con prefijo VITE_.",
  );
const admin = createClient(url, key, options);
let id, path;
try {
  const { error } = await admin.auth.signInWithPassword({
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
  });
  assert.equal(error, null, "Login");
  assert.equal((await admin.rpc("is_admin")).data, true, "Usuario autorizado");
  const created = await admin
    .from("projects")
    .insert({
      title: "Prueba temporal de Supabase",
      description: "Registro temporal para verificar persistencia.",
      category: "Otros",
      technologies: ["React"],
    })
    .select("id")
    .single();
  assert.equal(created.error, null);
  id = created.data.id;
  const updated = await admin
    .from("projects")
    .update({ description: "Persistencia verificada." })
    .eq("id", id);
  assert.equal(updated.error, null);
  assert.equal(
    (
      await publicClient
        .from("projects")
        .select("description")
        .eq("id", id)
        .single()
    ).data.description,
    "Persistencia verificada.",
  );
  const user = (await admin.auth.getUser()).data.user;
  path = `${user.id}/verification-${crypto.randomUUID()}.png`;
  // Imagen PNG real de 1x1, independiente de los assets del diseño.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aTfsAAAAASUVORK5CYII=",
    "base64",
  );
  assert.equal(
    (
      await admin.storage
        .from("portfolio-images")
        .upload(path, png, { contentType: "image/png" })
    ).error,
    null,
    "Storage",
  );
  const imageUrl = admin.storage.from("portfolio-images").getPublicUrl(path)
    .data.publicUrl;
  assert.equal((await fetch(imageUrl)).status, 200, "Imagen pública");
  console.log("Auth, autorización, CRUD, lectura persistente y Storage: OK");
} finally {
  if (id)
    assert.equal(
      (await admin.from("projects").delete().eq("id", id)).error,
      null,
      "Eliminar registro de prueba",
    );
  if (path)
    assert.equal(
      (await admin.storage.from("portfolio-images").remove([path])).error,
      null,
      "Eliminar imagen de prueba",
    );
  await admin.auth.signOut();
}
