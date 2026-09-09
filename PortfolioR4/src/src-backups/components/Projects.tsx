import { useMemo, useState } from "react";
import type { RecordData } from "../types";
import Icon from "./Icon";
export default function Projects({ projects }: { projects: RecordData[] }) {
  const [category, setCategory] = useState("Todos"),
    [search, setSearch] = useState(""),
    [detail, setDetail] = useState<RecordData | null>(null);
  // Memoriza el resultado de filtros; nunca consulta servicios externos como GitHub.
  const visible = useMemo(
    () =>
      projects.filter(
        (p) =>
          (category === "Todos" || p.category === category) &&
          `${p.title} ${p.description} ${(p.technologies as string[]).join(" ")}`
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
      ),
    [projects, category, search],
  );
  return (
    <>
      <div className="explorer-toolbar">
        📂{" "}
        <span>
          Mis documentos <b>›</b> Mis proyectos
        </span>
      </div>
      <div className="project-header">
        <div>
          <span className="eyebrow">HECHO CON CURIOSIDAD</span>
          <h2>Mis proyectos</h2>
          <p>Ideas que se convierten en soluciones.</p>
        </div>
        <Icon name="projects" size={54} />
      </div>
      <div className="project-controls">
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar un proyecto..."
            aria-label="Buscar proyectos"
          />
        </label>
        <select
          aria-label="Categoría de proyectos"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {[
            "Todos",
            "Frontend",
            "Backend",
            "Full Stack",
            "Diseño",
            "Otros",
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {detail ? (
        <article className="project-detail">
          <button onClick={() => setDetail(null)}>
            ← Volver a los proyectos
          </button>
          <h2>{String(detail.title)}</h2>
          {detail.image && (
            <img src={String(detail.image)} alt={`Vista de ${detail.title}`} />
          )}
          <p>{String(detail.full_description || detail.description)}</p>
          <p>
            {String(detail.date)} · {String(detail.status)}
          </p>
          <div className="tags">
            {(detail.technologies as string[]).map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <ProjectLinks project={detail} />
        </article>
      ) : visible.length ? (
        <div className="project-grid">
          {visible.map((p) => (
            <article className="project-card" key={p.id}>
              {p.image ? (
                <img
                  src={String(p.image)}
                  alt={`Vista de ${p.title}`}
                  loading="lazy"
                />
              ) : (
                <div className="project-placeholder">
                  <Icon name="projects" size={64} />
                </div>
              )}
              <div className="project-card-body">
                <small>
                  {String(p.category)} {p.is_featured ? "· ★ Destacado" : ""}
                </small>
                <h3>{String(p.title)}</h3>
                <p>{String(p.description)}</p>
                <div className="tags">
                  {(p.technologies as string[]).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <button onClick={() => setDetail(p)}>Más información →</button>
                <ProjectLinks project={p} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-projects">
          <Icon name="projects" size={66} />
          <h3>
            {projects.length
              ? "No encontramos coincidencias"
              : "Esta carpeta está lista para nuevas ideas"}
          </h3>
          <p>
            {projects.length
              ? "Probá con otra búsqueda o categoría."
              : "Todavía no hay proyectos publicados. Pronto vas a poder explorar mi trabajo acá."}
          </p>
          {projects.length > 0 && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("Todos");
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
      <div className="statusbar">
        {visible.length} proyectos <span>Mi portfolio / Mis proyectos</span>
      </div>
    </>
  );
}
function ProjectLinks({ project }: { project: RecordData }) {
  return (
    <div className="project-links">
      {project.demo && (
        <a
          href={String(project.demo)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver proyecto ↗
        </a>
      )}
      {project.github && (
        <a
          href={String(project.github)}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      )}
    </div>
  );
}
