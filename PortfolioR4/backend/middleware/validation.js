import { z } from "zod";
// React escapa el texto al mostrarlo; aquí además se rechazan límites y protocolos inválidos.
const text = (min = 0, max = 200) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine(
      (v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v),
      "Texto inválido.",
    );
const url = z
  .string()
  .max(1000)
  .refine(
    (v) => !v || /^https?:\/\/[^\s]+$/i.test(v),
    "Usá una URL http o https.",
  );
const asset = z
  .string()
  .max(1000)
  .refine(
    (v) =>
      !v ||
      /^\/uploads\/[a-f0-9-]+\.(png|jpg|webp)$/.test(v) ||
      /^https:\/\/[^\s]+$/i.test(v),
    "Archivo o URL inválidos.",
  );
const order = z.number().int().min(0).max(10000).default(0);
const common = {
  title: text(2),
  description: text(2, 6000),
  date: text(0, 40).default(""),
  display_order: order,
};
export const schemas = {
  profile: z.object({
    name: text(2, 160),
    role: text(2),
    description: text(10, 6000),
    tagline: text(0, 240),
    location: text(),
    avatar: asset,
    cv: z.union([
      url,
      z
        .string()
        .regex(
          /^\/cv\/[a-zA-Z0-9_-]+\.pdf$/,
          "Usá una ruta /cv/archivo.pdf o una URL pública.",
        ),
    ]),
    phone: text(0, 40),
    show_phone: z.boolean(),
  }),
  projects: z.object({
    ...common,
    full_description: text(0, 12000).default(""),
    image: asset,
    category: z.enum(["Frontend", "Backend", "Full Stack", "Diseño", "Otros"]),
    status: text(0, 80),
    github: url,
    demo: url,
    is_featured: z.boolean(),
    technologies: z.array(text(1, 160)).max(40),
  }),
  skills: z.object({
    name: text(1, 160),
    category: text(1, 160),
    description: text(2, 2000),
    level: z.enum(["", "Básico", "Intermedio", "Avanzado"]),
    icon: asset,
    display_order: order,
  }),
  experiences: z.object({
    ...common,
    organization: text(2),
    status: text(0, 80),
  }),
  education: z.object({
    ...common,
    organization: text(2),
    location: text(),
    status: text(0, 80),
  }),
  achievements: z.object({ ...common, icon: asset }),
  social_links: z.object({
    name: text(1, 160),
    url: url.refine(Boolean, "Ingresá una URL."),
    display_order: order,
  }),
  soft_skills: z.object({ name: text(2, 160), display_order: order }),
  contact: z.object({
    name: text(2, 120).refine(
      (v) => /[\p{L}]{2}/u.test(v),
      "Ingresá un nombre válido.",
    ),
    email: z.string().trim().email().max(254),
    subject: text(3, 160),
    message: text(10, 6000),
  }),
};
export function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success)
    throw Object.assign(
      new Error(
        result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" · "),
      ),
      { status: 400 },
    );
  return result.data;
}
export function requireAdmin(req, res, next) {
  if (!req.session.adminId)
    return res.status(401).json({ error: "Iniciá sesión para continuar." });
  next();
}
