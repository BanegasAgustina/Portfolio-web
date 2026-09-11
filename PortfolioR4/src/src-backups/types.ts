/*
 * COPIA HISTÓRICA: src/src-backups/types.ts
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/types.ts
 * Propósito:
 * Describe los datos que comparten servicios y componentes; no crea tablas ni valida respuestas.
 * RecordData representa un registro flexible; Portfolio agrupa el perfil y las listas públicas.
 * WindowId limita los identificadores admitidos por el administrador de ventanas.
 */
export type RecordData = {
  id?: number;
  [key: string]: string | number | boolean | string[] | undefined;
};
export type Portfolio = {
  profile: RecordData;
  projects: RecordData[];
  skills: RecordData[];
  experiences: RecordData[];
  education: RecordData[];
  achievements: RecordData[];
  social_links: RecordData[];
  soft_skills: RecordData[];
};
export type WindowId =
  | "about"
  | "projects"
  | "tools"
  | "experience"
  | "education"
  | "contact"
  | "achievements"
  | "notes"
  | "recycle";
