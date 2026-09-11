/*
 * Archivo: src/components/Skills.tsx
 * Propósito:
 * Ventana de habilidades. Recibe skills (herramientas) y personal (habilidades personales).
 * Agrupa las descripciones técnicas por categoría y muestra personal como etiquetas.
 * No tiene estado ni efectos: cambia cuando Desktop le entrega otras props.
 */
import type { RecordData } from "../types";
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
        {categories.map((category) => (
          <section className="timeline-item" key={category}>
            <h3>{category}</h3>
            <ul>
              {skills
                .filter((s) => s.category === category)
                .map((s) => (
                  <li key={s.id}>{String(s.description)}</li>
                ))}
            </ul>
          </section>
        ))}
        <h3>Habilidades personales</h3>
        <div className="tags">
          {personal.map((s) => (
            <span key={s.id}>{String(s.name)}</span>
          ))}
        </div>
      </div>
    </>
  );
}
