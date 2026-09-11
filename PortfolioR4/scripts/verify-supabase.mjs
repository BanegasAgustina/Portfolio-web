/*
 * Archivo: scripts/verify-supabase.mjs
 * Propósito:
 * Prueba de integración para un esquema con Supabase Auth, RPC is_admin y permisos RLS.
 * No representa el login vigente de Express (admins/admin_sessions). Requiere configuración externa.
 * Intenta INSERT, UPDATE, DELETE y subir/borrar una imagen real: no es una comprobación de sólo lectura.
 * No se debe ejecutar como parte de una tarea que prohíbe modificar datos.
 */
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import dotenv from "dotenv";
// Lee configuración de prueba desde .env de la raíz; no imprime sus valores.
dotenv.config({ path: new URL("../.env", import.meta.url), quiet: true });
const url = process.env.VITE_SUPABASE_URL,
  key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key)
  throw new Error(
    "Pendiente: crear Supabase y completar .env antes de verificar la conexión real.",
  );
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const publicClient = createClient(url, key, options);
// SELECT anónimo de un ID por tabla: verifica que las listas públicas sean legibles.
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
// RPC obtiene perfil público; verifica que phone no esté presente cuando show_phone está desactivado.
const profile = await publicClient.rpc("get_public_profile");
assert.equal(profile.error, null);
assert.ok(profile.data, "Importar datos");
if (!profile.data.show_phone) assert.equal("phone" in profile.data, false);
// Espera que leer profile directamente falle; el acceso público previsto es mediante RPC.
assert.ok(
  (await publicClient.from("profile").select("*")).error,
  "Perfil privado",
);
// Intenta INSERT anónimo esperando rechazo. Si los permisos fueran incorrectos, podría crear un dato real.
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
  // Inicia Supabase Auth con email/contraseña de prueba; es un flujo diferente de /api/auth/login.
  const { error } = await admin.auth.signInWithPassword({
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD,
  });
  assert.equal(error, null, "Login");
  // RPC is_admin comprueba el permiso del usuario de prueba en el esquema esperado por este script.
  assert.equal((await admin.rpc("is_admin")).data, true, "Usuario autorizado");
  // INSERT crea un proyecto temporal y recupera su ID para actualizarlo y limpiarlo más adelante.
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
  // UPDATE cambia sólo la descripción del proyecto temporal; luego SELECT público verifica persistencia.
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
  // getUser obtiene el usuario autenticado para construir una ruta de Storage bajo su ID.
  const user = (await admin.auth.getUser()).data.user;
  path = `${user.id}/verification-${crypto.randomUUID()}.png`;
  // Imagen PNG real de 1x1, independiente de los assets del diseño.
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aTfsAAAAASUVORK5CYII=",
    "base64",
  );
  // Sube el PNG temporal al bucket portfolio-images y comprueba el resultado de Storage.
  assert.equal(
    (
      await admin.storage
        .from("portfolio-images")
        .upload(path, png, { contentType: "image/png" })
    ).error,
    null,
    "Storage",
  );
  // Construye URL pública; el fetch GET posterior comprueba que la imagen sea accesible.
  const imageUrl = admin.storage.from("portfolio-images").getPublicUrl(path)
    .data.publicUrl;
  assert.equal((await fetch(imageUrl)).status, 200, "Imagen pública");
  console.log("Auth, autorización, CRUD, lectura persistente y Storage: OK");
// Intenta limpiar proyecto e imagen incluso si falla una comprobación; las aserciones también pueden interrumpir la limpieza.
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
  // Cierra la sesión de Supabase Auth de prueba; no borra la cookie admin_session de Express.
  await admin.auth.signOut();
}
