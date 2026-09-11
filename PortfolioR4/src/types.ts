/*
 * Archivo: src/types.ts
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
  social_links: RecordData[];
  soft_skills: RecordData[];
};
export type WindowId =
  | "about"
  | "projects"
  | "tools"
  | "skills"
  | "experience"
  | "education"
  | "contact"
  | "notes";
