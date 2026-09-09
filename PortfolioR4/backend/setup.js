import "./config/env.js";
import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { db } from "./config/db.js";
import { save } from "./services/content.js";
const initial = JSON.parse(
  await readFile(new URL("./data/initial.json", import.meta.url), "utf8"),
);
try {
  // El esquema y la semilla se ejecutan por separado para evitar reemplazar contenido editado.
  const schema = await readFile(
    new URL("./database/schema.sql", import.meta.url),
    "utf8",
  );
  for (const statement of schema.split(";").filter((s) => s.trim()))
    await db.query(statement);
  if (!(await db.query("SELECT id FROM profile LIMIT 1"))[0].length) {
    await db.execute(
      `INSERT INTO profile(id,${Object.keys(initial.profile).join(",")}) VALUES (1,${Object.keys(
        initial.profile,
      )
        .map(() => "?")
        .join(",")})`,
      Object.values(initial.profile),
    );
    for (const entity of ["experiences", "education", "social_links"])
      for (const record of initial[entity]) await save(entity, record);
    for (const [i, name] of initial.soft_skills.entries())
      await save("soft_skills", { name, display_order: i });
    for (const [i, [name, category, description]] of initial.skills.entries())
      await save("skills", {
        name,
        category,
        description,
        level: "",
        icon: "",
        display_order: i,
      });
  }
  if (process.env.ADMIN_PASSWORD) {
    if (
      process.env.ADMIN_PASSWORD.length < 12 ||
      Buffer.byteLength(process.env.ADMIN_PASSWORD, "utf8") > 72
    )
      throw new Error("ADMIN_PASSWORD debe tener entre 12 y 72 caracteres.");
    if (!(await db.query("SELECT id FROM admins LIMIT 1"))[0].length)
      await db.execute("INSERT INTO admins(password_hash) VALUES (?)", [
        await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      ]);
  }
  console.log("Base inicializada. No se sobrescribieron datos existentes.");
} finally {
  await db.end();
}
