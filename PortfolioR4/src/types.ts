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
  | "notes";
