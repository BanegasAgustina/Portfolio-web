import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { storeImage } from "../services/storage.js";
import { db } from "../config/db.js";
import { entities, list, save } from "../services/content.js";
import { schemas, parse, requireAdmin } from "../middleware/validation.js";
export const api = Router();
const limit = (max, minutes) =>
  rateLimit({
    windowMs: minutes * 60000,
    limit: max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Demasiados intentos. Volvé a intentar en unos minutos.",
    },
  });
api.get("/health", async (req, res) => {
  await db.query("SELECT 1");
  res.json({ status: "ok" });
});
api.get("/portfolio", async (req, res) => {
  const profile = (await db.query("SELECT * FROM profile WHERE id=1"))[0][0];
  if (!profile)
    return res
      .status(503)
      .json({ error: "El portfolio todavía no está configurado." });
  // El teléfono oculto nunca sale de la API pública.
  if (!profile.show_phone) delete profile.phone;
  const content = Object.fromEntries(
    await Promise.all(entities.map(async (e) => [e, await list(e)])),
  );
  res.json({ ...content, profile });
});
api.get("/projects/:id", async (req, res) => {
  const row = (await list("projects")).find(
    (p) => p.id === Number(req.params.id),
  );
  if (!row) return res.status(404).json({ error: "Proyecto no encontrado." });
  res.json(row);
});
api.get("/auth/me", (req, res) =>
  res.json({ authenticated: !!req.session.adminId }),
);
api.post("/auth/login", limit(8, 15), async (req, res) => {
  const password = req.body.password;
  if (typeof password !== "string" || password.length > 128)
    return res.status(400).json({ error: "Contraseña inválida." });
  const admins = (
    await db.query("SELECT id,password_hash FROM admins LIMIT 1")
  )[0];
  if (
    !admins.length ||
    !(await bcrypt.compare(password, admins[0].password_hash))
  )
    return res
      .status(401)
      .json({ error: "Contraseña incorrecta o administrador no configurado." });
  // Regenerar evita fijación de sesión; la cookie no es accesible desde JavaScript.
  req.session.regenerate((error) => {
    if (error)
      return res.status(500).json({ error: "No se pudo iniciar sesión." });
    req.session.adminId = admins[0].id;
    req.session.save((error) =>
      error
        ? res.status(500).json({ error: "No se pudo guardar la sesión." })
        : res.json({ authenticated: true }),
    );
  });
});
api.post("/auth/logout", requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("portfolio.sid");
    res.json({ ok: true });
  });
});
api.post("/contact", limit(5, 15), async (req, res) => {
  const data = parse(schemas.contact, req.body);
  await db.execute(
    "INSERT INTO contact_messages(name,email,subject,message) VALUES (?,?,?,?)",
    Object.values(data),
  );
  res.status(201).json({ ok: true });
});
api.get("/admin/profile", requireAdmin, async (req, res) =>
  res.json((await db.query("SELECT * FROM profile WHERE id=1"))[0][0]),
);
api.put("/admin/profile", requireAdmin, async (req, res) =>
  res.json(await save("profile", parse(schemas.profile, req.body), 1)),
);
api.get("/admin/messages", requireAdmin, async (req, res) =>
  res.json(
    (
      await db.query(
        "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 500",
      )
    )[0],
  ),
);
api.put("/admin/messages/:id", requireAdmin, async (req, res) => {
  await db.execute("UPDATE contact_messages SET is_read=TRUE WHERE id=?", [
    req.params.id,
  ]);
  res.json({ ok: true });
});
api.delete("/admin/messages/:id", requireAdmin, async (req, res) => {
  await db.execute("DELETE FROM contact_messages WHERE id=?", [req.params.id]);
  res.json({ ok: true });
});
for (const entity of entities) {
  api.get(`/${entity}`, async (req, res) => res.json(await list(entity)));
  api.get(`/admin/${entity}`, requireAdmin, async (req, res) =>
    res.json(await list(entity)),
  );
  api.post(`/admin/${entity}`, requireAdmin, async (req, res) =>
    res.status(201).json(await save(entity, parse(schemas[entity], req.body))),
  );
  api.put(`/admin/${entity}/:id`, requireAdmin, async (req, res) =>
    res.json(
      await save(
        entity,
        parse(schemas[entity], req.body),
        Number(req.params.id),
      ),
    ),
  );
  api.delete(`/admin/${entity}/:id`, requireAdmin, async (req, res) => {
    const [result] = await db.execute(`DELETE FROM ${entity} WHERE id=?`, [
      req.params.id,
    ]);
    if (!result.affectedRows)
      return res.status(404).json({ error: "El elemento ya no existe." });
    res.json({ ok: true });
  });
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    cb(
      null,
      ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype) &&
        /\.(png|jpe?g|webp)$/i.test(file.originalname),
    ),
});
api.post(
  "/admin/upload",
  requireAdmin,
  upload.single("image"),
  async (req, res) => {
    const file = req.file;
    if (!file)
      return res
        .status(400)
        .json({ error: "Seleccioná un JPG, PNG o WEBP de hasta 5 MB." });
    const b = file.buffer;
    const ext = b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      ? "png"
      : b[0] === 255 && b[1] === 216 && b[2] === 255
        ? "jpg"
        : b.toString("ascii", 0, 4) === "RIFF" &&
            b.toString("ascii", 8, 12) === "WEBP"
          ? "webp"
          : null;
    if (
      !ext ||
      file.mimetype !==
        { png: "image/png", jpg: "image/jpeg", webp: "image/webp" }[ext]
    )
      return res
        .status(400)
        .json({ error: "El contenido no coincide con una imagen válida." });
    res.status(201).json({ url: await storeImage(b, ext) });
  },
);
