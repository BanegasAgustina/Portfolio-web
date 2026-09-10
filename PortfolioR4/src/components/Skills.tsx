import type { RecordData } from "../types";
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
