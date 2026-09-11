/*
 * Archivo: src/components/Skills.tsx
 * Propósito:
 * Ventana de habilidades. Recibe skills (herramientas) y personal (habilidades personales).
 * Agrupa las descripciones técnicas por categoría y muestra personal como etiquetas.
 * No tiene estado ni efectos: cambia cuando Desktop le entrega otras props.
 */
import type { RecordData } from "../types";
// Reutiliza los dibujos locales; no agrega dependencias ni peticiones de iconos.
import TechnologyIcon from "./TechnologyIcon";

// Elige un icono decorativo por categoría sin modificar sus nombres ni sus habilidades.
function categoryIcon(category: string) {
  if (/base|datos|sql/i.test(category)) return "SQL";
  if (/version|git/i.test(category)) return "Git";
  if (/sistema|linux|windows/i.test(category)) return "Windows";
  if (/diseño|diseno|figma/i.test(category)) return "Figma";
  if (/ofimática|ofimatica|office|productividad/i.test(category))
    return "document";
  if (/web|desarrollo|programación|programacion/i.test(category))
    return "navegación";
  return category;
}
// Recibe dos listas y devuelve grupos técnicos y etiquetas personales, sin efectos.
export default function Skills({
  skills,
  personal,
}: {
  skills: RecordData[];
  personal: RecordData[];
}) {
  const categories = [...new Set(skills.map((s) => String(s.category)))];
  return (
    <>
      <div className="explorer-toolbar">
        Mis documentos <b>›</b> Habilidades
      </div>
      <div className="content-pad">
        <h2>Habilidades</h2>
        <p>Capacidades aplicadas en mis estudios y proyectos.</p>
        {/* La grilla cambia según el ancho de la ventana; se mantienen todas las descripciones originales. */}
        <div className="skills-panels">
          {categories.map((category) => (
            <section className="skill-panel" key={category}>
              <h3>
                <TechnologyIcon name={categoryIcon(category)} size={24} />
                <span>{category}</span>
              </h3>
              <ul>
                {skills
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <li key={s.id}>{String(s.description)}</li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
        <section className="personal-skills-panel">
          <h3>Habilidades personales</h3>
          <div className="tags">
            {personal.map((s) => (
              <span key={s.id}>{String(s.name)}</span>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
