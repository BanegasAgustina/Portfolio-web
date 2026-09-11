/*
 * Archivo: src/components/Icon.tsx
 * Propósito:
 * Selecciona un recurso clásico local por name y lo muestra con size (32 por defecto).
 * Delega GitHub, LinkedIn, email y document a TechnologyIcon; usa una carpeta como alternativa.
 * Es un componente decorativo sin estado; el texto accesible lo aporta el componente que lo utiliza.
 */
import pc from "../assets/img/pc.ico";
import about from "../assets/img/sobre mi icon.ico";
import folder from "../assets/img/folder-icon.ico";
import contact from "../assets/img/Contacto (2).ico";
import TechnologyIcon from "./TechnologyIcon";
const icons: Record<string, string> = {
  about,
  projects: folder,
  tools: pc,
  experience: folder,
  education: folder,
  contact,
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
  if (name === "tools")
    return (
      <svg
        className="xp-icon"
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 32 32"
      >
        <path
          d="m13.6 2.3.8 3.1a10.7 10.7 0 0 0-2.6 1.5L9 5.2 5.2 9l1.7 2.8a10.7 10.7 0 0 0-1.5 2.6l-3.1-.8v5.3l3.1-.8a10.7 10.7 0 0 0 1.5 2.6L5.2 23.5 9 27.3l2.8-1.7a10.7 10.7 0 0 0 2.6 1.5l-.8 3.1h5.3l-.8-3.1a10.7 10.7 0 0 0 2.6-1.5l2.8 1.7 3.8-3.8-1.7-2.8a10.7 10.7 0 0 0 1.5-2.6l3.1.8v-5.3l-3.1.8a10.7 10.7 0 0 0-1.5-2.6L27.3 9 23.5 5.2l-2.8 1.7a10.7 10.7 0 0 0-2.6-1.5l.8-3.1Z"
          fill="#718096"
          stroke="#26354b"
          strokeWidth="1.2"
        />
        <circle cx="16" cy="16" r="5" fill="#dce6f2" stroke="#26354b" strokeWidth="1.2" />
      </svg>
    );
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
