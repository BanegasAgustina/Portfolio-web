/*
 * COPIA HISTÓRICA: src/src-backups/components/admin/fields.ts
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/components/admin/fields.ts
 * Propósito:
 * Catálogo de formularios: Field describe una entrada y fields agrupa entradas por sección.
 * Editor utiliza key para el dato, label para el texto, type para el control y required/max para restricciones.
 * sections conecta las claves internas de Admin con los nombres visibles del menú. No ejecuta consultas.
 */
// Contrato de cada campo: key coincide con la propiedad del registro; type decide qué control renderizar.
export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "checkbox"
    | "number"
    | "image"
    | "select"
    | "list"
    | "url";
  options?: string[];
  required?: boolean;
  max?: number;
};
const title: Field = {
    key: "title",
    label: "Título",
    required: true,
    max: 200,
  },
  description: Field = {
    key: "description",
    label: "Descripción",
    type: "textarea",
    required: true,
    max: 6000,
  },
  date: Field = { key: "date", label: "Fecha o período", max: 40 },
  order: Field = {
    key: "display_order",
    label: "Orden (menor primero)",
    type: "number",
  },
  organization: Field = {
    key: "organization",
    label: "Empresa / institución",
    required: true,
    max: 200,
  },
  status: Field = { key: "status", label: "Estado", max: 80 };
// Configuración local de los formularios; las restricciones HTML orientan la edición, no son permisos de base de datos.
export const fields: Record<string, Field[]> = {
  profile: [
    { key: "name", label: "Nombre", required: true, max: 160 },
    { key: "role", label: "Rol profesional", required: true, max: 200 },
    description,
    { key: "tagline", label: "Frase personal", max: 240 },
    { key: "location", label: "Ubicación general", max: 200 },
    { key: "avatar", label: "Avatar", type: "image" },
    {
      key: "cv",
      label: "CV público: /cv/archivo.pdf o URL (revisá su privacidad)",
      type: "text",
    },
    { key: "phone", label: "Teléfono (privado si no lo activás)", max: 40 },
    {
      key: "show_phone",
      label: "Mostrar teléfono públicamente",
      type: "checkbox",
    },
  ],
  projects: [
    title,
    description,
    {
      key: "full_description",
      label: "Descripción completa",
      type: "textarea",
      max: 12000,
    },
    { key: "image", label: "Imagen del proyecto", type: "image" },
    {
      key: "technologies",
      label: "Tecnologías (separadas por comas)",
      type: "list",
    },
    {
      key: "category",
      label: "Categoría",
      type: "select",
      options: ["Frontend", "Backend", "Full Stack", "Diseño", "Otros"],
    },
    date,
    status,
    { key: "github", label: "URL de GitHub", type: "url" },
    { key: "demo", label: "URL de la demo", type: "url" },
    { key: "is_featured", label: "Proyecto destacado", type: "checkbox" },
    order,
  ],
  skills: [
    {
      key: "name",
      label: "Nombre de la herramienta",
      required: true,
      max: 160,
    },
    { key: "category", label: "Categoría", required: true, max: 160 },
    description,
    { key: "icon", label: "Icono personalizado (opcional)", type: "image" },
    {
      key: "level",
      label: "Nivel (opcional, sólo si querés configurarlo)",
      type: "select",
      options: ["", "Básico", "Intermedio", "Avanzado"],
    },
    order,
  ],
  experiences: [title, organization, description, date, status, order],
  education: [
    title,
    organization,
    description,
    { key: "location", label: "Ubicación", max: 200 },
    date,
    status,
    order,
  ],
  achievements: [
    title,
    description,
    date,
    { key: "icon", label: "Icono", type: "image" },
    order,
  ],
  social_links: [
    { key: "name", label: "Nombre de la red", required: true, max: 160 },
    { key: "url", label: "URL profesional", type: "url", required: true },
    order,
  ],
  soft_skills: [
    { key: "name", label: "Habilidad personal", required: true, max: 160 },
    order,
  ],
};
// El orden de estas claves define menú y tarjetas; cada clave de datos se usa en /admin/<clave>.
export const sections: Record<string, string> = {
  dashboard: "Panel de control",
  projects: "Proyectos",
  skills: "Herramientas",
  experiences: "Experiencia",
  education: "Educación",
  achievements: "Logros",
  profile: "Información personal",
  social_links: "Redes",
  soft_skills: "Habilidades personales",
  messages: "Mensajes",
  settings: "Configuración",
};
