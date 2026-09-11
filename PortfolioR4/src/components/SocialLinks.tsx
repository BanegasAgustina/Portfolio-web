/*
 * Archivo: src/components/SocialLinks.tsx
 * Propósito:
 * Lista reutilizable de redes. Recibe links con id, name y url, y devuelve enlaces con Icon.
 * Cada enlace abre otra pestaña; no tiene estado, efectos ni consultas propias.
 */
import type { RecordData } from "../types";
import Icon from "./Icon";
// Recibe links y devuelve un enlace por registro, sin estados ni efectos.
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
