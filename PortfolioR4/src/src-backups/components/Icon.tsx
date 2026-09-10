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
