import { readFile, writeFile, mkdir } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const data = JSON.parse(
  await readFile(new URL("supabase/data.json", root), "utf8"),
);
export function toSql(content) {
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
    if (table !== "profile")
      sql += `select setval(pg_get_serial_sequence('public.${table}','id'), greatest(coalesce((select max(id) from public.${table}),0),1), (select count(*) > 0 from public.${table}));\n`;
  }
  return sql + "commit;\n";
}
await mkdir(new URL("supabase/", root), { recursive: true });
await writeFile(new URL("supabase/seed.sql", root), toSql(data));
console.log("Semilla pública generada sin datos privados.");
