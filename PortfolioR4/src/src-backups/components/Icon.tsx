import pc from "../assets/img/pc.ico";
import about from "../assets/img/sobre mi icon.ico";
import folder from "../assets/img/folder-icon.ico";
import contact from "../assets/img/Contacto (2).ico";
import star from "../assets/img/estrella-icon.ico";
import recycle from "../assets/img/Empty Recycle Bin.ico";
const icons: Record<string, string> = {
  about,
  projects: folder,
  tools: pc,
  experience: folder,
  education: folder,
  contact,
  achievements: star,
  recycle,
  notes: folder,
};
export default function Icon({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  if (name === "GitHub" || name === "LinkedIn")
    return (
      <span
        className={`social-icon ${name}`}
        style={{ width: size, height: size, fontSize: size * 0.48 }}
        aria-hidden="true"
      >
        {name === "GitHub" ? "⌘" : "in"}
      </span>
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
