import { useState } from "react";
import fallbackIcon from "../assets/img/carpetaherramientas.ico";

// This map resolves artwork only. The tool list and categories always come from skills.
const logos: Record<string, string> = {
  html: "html5",
  html5: "html5",
  css: "css3",
  css3: "css3",
  javascript: "javascript",
  typescript: "typescript",
  react: "react",
  "node.js": "nodejs",
  nodejs: "nodejs",
  express: "express",
  "express.js": "express",
  vite: "vitejs",
  bootstrap: "bootstrap",
  mysql: "mysql",
  postgresql: "postgresql",
  postgres: "postgresql",
  supabase: "supabase",
  git: "git",
  github: "github",
  "c++": "cplusplus",
  java: "java",
  "visual studio code": "vscode",
  vscode: "vscode",
  "vs code": "vscode",
  figma: "figma",
  canva: "canva",
  xampp: "xampp",
  linux: "linux",
  "linux básico": "linux",
  windows: "windows11",
  "microsoft office": "microsoftoffice",
  office: "microsoftoffice",
  "microsoft 365": "microsoftoffice",
  "microsoft word": "microsoftword",
  word: "microsoftword",
  "microsoft excel": "microsoftexcel",
  excel: "microsoftexcel",
  "microsoft powerpoint": "microsoftpowerpoint",
  powerpoint: "microsoftpowerpoint",
  "microsoft outlook": "microsoftoutlook",
  outlook: "microsoftoutlook",
  "microsoft onenote": "microsoftonenote",
  onenote: "microsoftonenote",
  "microsoft teams": "microsoftteams",
  teams: "microsoftteams",
  "microsoft access": "microsoftaccess",
  access: "microsoftaccess",
  "google drive": "googledrive",
  "google docs": "googledocs",
  "google sheets": "googlesheets",
  "google slides": "googleslides",
  "google forms": "googleforms",
  gmail: "gmail",
  "google meet": "googlemeet",
  "google calendar": "googlecalendar",
  google: "google",
  chatgpt: "openai",
  claude: "claude",
  capcut: "capcut",
};

export default function ToolLogo({
  name,
  icon,
}: {
  name: string;
  icon?: string;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const brand = logos[name.trim().toLowerCase()];
  // Unknown records may provide a local asset; remote URLs are not loaded at runtime.
  const localIcon =
    icon?.startsWith("/") && !icon.startsWith("//") && !icon.includes("\\")
      ? icon
      : undefined;
  const source = brand
    ? `/icons/tools/${brand}.${brand === "capcut" ? "png" : "svg"}`
    : localIcon;
  const fallback = !source || failedSource === source;
  return (
    <img
      className="tool-logo"
      src={fallback ? fallbackIcon : source}
      alt={fallback ? `${name} (icono genérico)` : name}
      width={40}
      height={40}
      loading="lazy"
      onError={fallback ? undefined : () => setFailedSource(source)}
    />
  );
}
