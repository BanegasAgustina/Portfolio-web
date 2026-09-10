import type { RecordData } from "../types";
import Icon from "./Icon";
export default function SocialLinks({ links }: { links: RecordData[] }) {
  return (
    <div className="social-links">
      {links.map((link) => (
        <a
          key={link.id}
          href={String(link.url)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name={String(link.name)} size={22} />
          {String(link.name)}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
