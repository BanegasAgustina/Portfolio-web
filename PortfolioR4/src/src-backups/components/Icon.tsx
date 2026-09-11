/*
 * COPIA HISTÓRICA: src/src-backups/components/Icon.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/components/Icon.tsx
 * Propósito:
 * Selecciona un recurso clásico local por name y lo muestra con size (32 por defecto).
 * Delega GitHub, LinkedIn, email y document a TechnologyIcon; usa una carpeta como alternativa.
 * Es un componente decorativo sin estado; el texto accesible lo aporta el componente que lo utiliza.
 */
import pc from "../assets/img/pc.ico";
import about from "../assets/img/sobre mi icon.ico";
import folder from "../assets/img/folder-icon.ico";
import contact from "../assets/img/Contacto (2).ico";
import star from "../assets/img/estrella-icon.ico";
import TechnologyIcon from "./TechnologyIcon";
const icons: Record<string, string> = {
  about,
  projects: folder,
  tools: pc,
  experience: folder,
  education: folder,
  contact,
  achievements: star,
  notes: folder,
};
// Recibe name/size y devuelve un icono local o TechnologyIcon; los nombres desconocidos usan carpeta.
export default function Icon({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  if (["GitHub", "LinkedIn", "email", "document"].includes(name))
    return <TechnologyIcon name={name} size={size} />;
  return (
    <img
      className="xp-icon"
      src={icons[name] || folder}
      width={size}
      height={size}
      alt=""
    />
  );
}
