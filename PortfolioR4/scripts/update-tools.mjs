/*
 * Actualiza la tabla skills de Supabase sin duplicar herramientas.
 * Requiere SUPABASE_URL y SUPABASE_SECRET_KEY en el entorno del backend.
 * Es idempotente: se puede ejecutar varias veces sin crear registros repetidos.
 */
import dotenv from "dotenv";
dotenv.config({ path: new URL("../backend/.env", import.meta.url) });

const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  throw new Error("Configurá SUPABASE_URL y SUPABASE_SECRET_KEY antes de ejecutar este script.");
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};
const read = await fetch(`${url}/rest/v1/skills?select=*`, { headers });
if (!read.ok) throw new Error(`No se pudo leer skills (${read.status}).`);
const current = await read.json();
const normalize = (value) =>
  String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const request = async (path, options = {}) => {
  const result = await fetch(`${url}/rest/v1/${path}`, { ...options, headers });
  if (!result.ok)
    throw new Error(`Supabase rechazó ${options.method || "GET"} ${path} (${result.status}).`);
};

const categories = new Map([
  ["HTML", "Desarrollo web"], ["CSS", "Desarrollo web"], ["JavaScript", "Desarrollo web"],
  ["TypeScript", "Desarrollo web"], ["React", "Desarrollo web"], ["Node.js", "Desarrollo web"],
  ["Express", "Desarrollo web"], ["Vite", "Desarrollo web"], ["Bootstrap", "Desarrollo web"],
  ["C++", "Lenguajes de programación"], ["Java", "Lenguajes de programación"],
  ["SQL", "Bases de datos"], ["MySQL", "Bases de datos"], ["Supabase", "Bases de datos"],
  ["Git", "Control de versiones"], ["GitHub", "Control de versiones"],
  ["Linux", "Sistemas"], ["Linux básico", "Sistemas"], ["Windows", "Sistemas"],
  ["Microsoft Word", "Microsoft Office"], ["Microsoft Excel", "Microsoft Office"],
  ["Microsoft PowerPoint", "Microsoft Office"], ["Microsoft Outlook", "Microsoft Office"],
  ["Microsoft OneNote", "Microsoft Office"], ["Microsoft Teams", "Microsoft Office"],
  ["Microsoft Access", "Microsoft Office"], ["Google Drive", "Google"],
  ["Google Docs", "Google"], ["Google Sheets", "Google"], ["Google Slides", "Google"],
  ["Google Forms", "Google"], ["Gmail", "Google"], ["Google Meet", "Google"],
  ["Google Calendar", "Google"], ["Figma", "Diseño"], ["Canva", "Diseño"],
  ["CapCut", "Edición"], ["ChatGPT", "Inteligencia Artificial"], ["Claude", "Inteligencia Artificial"],
]);
const additions = [
  ["C++", "Lenguaje de programación compilado y orientado a objetos."],
  ["Java", "Lenguaje de programación multiplataforma."],
  ["Bootstrap", "Framework CSS para interfaces web responsive."],
  ["ChatGPT", "Asistente de inteligencia artificial generativa."],
  ["Claude", "Asistente de inteligencia artificial generativa."],
  ["CapCut", "Editor de video para contenido digital."],
  ["Microsoft Word", "Procesador de textos de Microsoft 365."],
  ["Microsoft Excel", "Planillas de cálculo de Microsoft 365."],
  ["Microsoft PowerPoint", "Presentaciones de Microsoft 365."],
  ["Microsoft Outlook", "Correo y calendario de Microsoft 365."],
  ["Microsoft OneNote", "Cuaderno digital de Microsoft 365."],
  ["Microsoft Teams", "Colaboración y reuniones de Microsoft 365."],
  ["Microsoft Access", "Base de datos de escritorio de Microsoft 365."],
  ["Google Drive", "Almacenamiento y organización de archivos en la nube."],
  ["Google Docs", "Procesador de textos colaborativo."],
  ["Google Sheets", "Planillas de cálculo colaborativas."],
  ["Google Slides", "Presentaciones colaborativas."],
  ["Google Forms", "Formularios y encuestas."],
  ["Gmail", "Correo electrónico de Google."],
  ["Google Meet", "Videollamadas y reuniones."],
  ["Google Calendar", "Calendario y organización de eventos."],
];
const existing = new Map(current.map((row) => [normalize(row.name), row]));

const kept = new Set();
for (const row of current) {
  const name = normalize(row.name);
  if (name === "postman" || kept.has(name))
    await request(`skills?id=eq.${row.id}`, { method: "DELETE" });
  else kept.add(name);
}
for (const [index, [name, description]] of additions.entries()) {
  const row = existing.get(normalize(name));
  const category = categories.get(name);
  if (row) {
    await request(`skills?id=eq.${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ category, display_order: (index + 1) * 10 }),
    });
  } else {
    await request("skills", {
      method: "POST",
      body: JSON.stringify({
        name, category, description, icon: null, level: null, display_order: (index + 1) * 10,
      }),
    });
  }
}

for (const row of current) {
  const category = categories.get(String(row.name));
  if (category && normalize(row.name) !== "postman")
    await request(`skills?id=eq.${row.id}`, {
      method: "PATCH",
      body: JSON.stringify({ category }),
    });
}
console.log("Herramientas actualizadas sin duplicados; Postman eliminado.");
