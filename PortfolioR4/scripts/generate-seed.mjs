/*
 * Archivo: scripts/generate-seed.mjs
 * Propósito:
 * Herramienta de generación local: lee supabase/data.json y escribe supabase/seed.sql.
 * No ejecuta el SQL ni se conecta a Supabase. La carpeta y el JSON de entrada no están en este checkout.
 * El contenido de entrada debe revisarse: la lista admitida incluye profile y contact_messages, y no filtra sus campos.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = new URL("../", import.meta.url);
// Carga el JSON de entrada al ejecutar o importar el módulo; fallará si ese archivo no existe.
const data = JSON.parse(
  await readFile(new URL("supabase/data.json", root), "utf8"),
);
// Recibe un mapa tabla→registros y devuelve SQL en una transacción; no ejecuta instrucciones en la base.
export function toSql(content) {
  // Convierte null, booleanos, números, listas y texto a literales SQL; duplica comillas simples del texto.
  const literal = (v) =>
    v === null
      ? "null"
      : typeof v === "boolean"
        ? String(v)
        : typeof v === "number"
          ? String(v)
          : Array.isArray(v)
            ? `ARRAY[${v.map(literal).join(",")}]::text[]`
            : "'" + String(v).replaceAll("'", "''") + "'";
  let sql =
    "-- Datos preservados. Ejecutar después de schema.sql; no reemplaza IDs existentes.\nbegin;\n";
  // Recorre sólo tablas admitidas. ON CONFLICT(id) DO NOTHING conserva registros con IDs existentes.
  for (const [table, rows] of Object.entries(content)) {
    if (
      ![
        "profile",
        "projects",
        "skills",
        "experiences",
        "education",
        "social_links",
        "soft_skills",
        "contact_messages",
      ].includes(table)
    )
      continue;
    for (const row of Array.isArray(rows) ? rows : [rows]) {
      const fields = Object.keys(row);
      sql += `insert into public.${table} (${fields.join(",")}) values (${fields.map((k) => literal(row[k])).join(",")}) on conflict(id) do nothing;\n`;
    }
    // Ajusta la secuencia del ID al máximo importado para que futuras altas no reutilicen IDs.
    if (table !== "profile")
      sql += `select setval(pg_get_serial_sequence('public.${table}','id'), greatest(coalesce((select max(id) from public.${table}),0),1), (select count(*) > 0 from public.${table}));\n`;
  }
  return sql + "commit;\n";
}
// Crea la carpeta de salida si falta y escribe el archivo SQL; este paso sólo cambia archivos locales.
await mkdir(new URL("supabase/", root), { recursive: true });
await writeFile(new URL("supabase/seed.sql", root), toSql(data));
console.log("Semilla pública generada sin datos privados.");
