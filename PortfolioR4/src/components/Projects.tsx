/*
 * Archivo: src/components/Projects.tsx
 * Propósito:
 * Explorador público de proyectos. Recibe projects (registros ya cargados por Desktop).
 * Filtra en memoria por categoría y búsqueda, abre un detalle y muestra enlaces externos.
 * ProjectCard presenta cada registro y ProjectLinks reutiliza los enlaces de demo y GitHub.
 */
import { useMemo, useState } from "react";
import type { RecordData } from "../types";
import Icon from "./Icon";
import "./Projects.css";
// Recibe projects y devuelve filtros, tarjetas o detalle; no modifica los registros originales.
export default function Projects({ projects }: { projects: RecordData[] }) {
  // category y search filtran la lista; detail guarda el registro cuya ficha está abierta.
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
    <div className="projects-browser">
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
          <div className="project-detail-layout">
            <div className="project-detail-info">
              <ProjectCategory project={detail} />
              <h2>{String(detail.title)}</h2>
              <p className="project-description">
                {String(detail.full_description || detail.description)}
              </p>
              <ProjectStatus status={detail.status} />
              {detail.date && (
                <p className="project-date">{String(detail.date)}</p>
              )}
              <h3 className="project-tech-title">Tecnologías</h3>
              <div className="tags">
                {(detail.technologies as string[]).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <ProjectLinks project={detail} />
            </div>
            <div className="project-detail-preview">
              <div className="project-preview-caption">Vista del proyecto</div>
              <ProjectImage project={detail} />
            </div>
          </div>
        </article>
      ) : visible.length ? (
        <div className="project-grid">
          {visible.map((p) => (
            <ProjectCard key={p.id} p={p} onSelect={setDetail} />
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
        <span role="status">
          {visible.length} {visible.length === 1 ? "proyecto" : "proyectos"}
        </span>
        <span>Mi portfolio › Mis proyectos</span>
      </div>
    </div>
  );
}
// Recibe project y devuelve sólo los enlaces disponibles; no consulta GitHub ni la demo.
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

// Recibe p y onSelect; dibuja un resumen y entrega p al padre cuando se pide más información.
function ProjectCard({
  p,
  onSelect,
}: {
  p: RecordData;
  onSelect: (project: RecordData) => void;
}) {
  return (
    <article className="project-card">
      <ProjectImage project={p} />
      <div className="project-card-body">
        <ProjectCategory project={p} />
        <h3>{String(p.title)}</h3>
        <p className="project-description">{String(p.description)}</p>
        <ProjectStatus status={p.status} />
        <h4 className="project-tech-title">Tecnologías</h4>
        <div className="tags">
          {(p.technologies as string[]).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="project-card-actions">
          <button onClick={() => onSelect(p)}>Más información →</button>
          <ProjectLinks project={p} />
        </div>
      </div>
    </article>
  );
}

// Presentación compartida entre la ficha y el detalle; conserva los valores del registro.
function ProjectCategory({ project }: { project: RecordData }) {
  return (
    <div className="project-category">
      <span>{String(project.category || "")}</span>
      {project.is_featured && (
        <span className="project-featured">★ Destacado</span>
      )}
    </div>
  );
}
function ProjectStatus({ status }: { status: RecordData[string] }) {
  if (!status) return null;
  return (
    <p className="project-status" data-status={String(status)}>
      <span aria-hidden="true" />
      {String(status)}
    </p>
  );
}
function ProjectImage({ project }: { project: RecordData }) {
  return project.image ? (
    <img
      className="project-image"
      src={String(project.image)}
      alt={`Vista de ${project.title}`}
      loading="lazy"
    />
  ) : (
    <div className="project-placeholder">
      <Icon name="projects" size={80} />
      <span>Una idea, hecha proyecto</span>
    </div>
  );
}
