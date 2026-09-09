import "./config/env.js";
import bcrypt from "bcryptjs";
import { db } from "./config/db.js";
// Se ejecuta manualmente para cambiar la contraseña, nunca desde el frontend.
try {
  const password = process.env.ADMIN_PASSWORD || "";
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72)
    throw new Error(
      "ADMIN_PASSWORD debe tener al menos 12 caracteres y como máximo 72 bytes UTF-8.",
    );
  const hash = await bcrypt.hash(password, 12);
  const rows = (await db.query("SELECT id FROM admins LIMIT 1"))[0];
  if (rows.length)
    await db.execute("UPDATE admins SET password_hash=? WHERE id=?", [
      hash,
      rows[0].id,
    ]);
  else await db.execute("INSERT INTO admins(password_hash) VALUES (?)", [hash]);
  await db.execute("DELETE FROM admin_sessions");
  console.log(
    "Contraseña actualizada. Las sesiones anteriores quedaron cerradas.",
  );
} finally {
  await db.end();
}
