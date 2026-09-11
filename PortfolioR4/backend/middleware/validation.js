/*
 * Archivo: backend/middleware/validation.js
 * Propósito:
 * Esquema Zod para POST /api/contact. Recibe nombre, email, asunto y mensaje.
 * Quita espacios en extremos y valida formato y longitud; la ruta utiliza safeParse para responder 400 si falla.
 * No es una validación compartida de todos los endpoints del administrador.
 */
import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(6000),
});
