import { Router } from "express";
import rateLimit from "express-rate-limit";
import { contactSchema } from "../middleware/validation.js";
import { getServerSupabase } from "../config/supabase.js";
export const api = Router();
api.get("/health", async (_req, res) => {
  const { error } = await getServerSupabase()
    .from("projects")
    .select("id")
    .limit(1);
  if (error) throw new Error("Supabase no respondió correctamente.");
  res.json({ status: "ok", database: "supabase" });
});
// Conserva el endpoint y su protección contra abuso; RLS no permite insertar mensajes públicamente.
api.post(
  "/contact",
  rateLimit({
    windowMs: 15 * 60000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Revisá los datos del mensaje." });
    const { error } = await getServerSupabase()
      .from("contact_messages")
      .insert(parsed.data);
    if (error) throw new Error("No se pudo guardar el mensaje.");
    res.status(201).json({ ok: true });
  },
);
