/*
 * Archivo: src/components/Tools.tsx
 * Propósito:
 * Ventana de herramientas. Recibe skills y muestra un filtro de categorías, iconos y descripciones.
 * La selección local permite abrir/cerrar el texto de ayuda al tocar una herramienta.
 * Usa ToolLogo para mostrar archivos locales; no consulta ni modifica la API.
 */
import { useMemo, useState } from "react";
import type { RecordData } from "../types";
import ToolLogo from "./ToolLogo";
import Icon from "./Icon";
import "./Tools.css";

const categoryOrder = [
  "Desarrollo web",
  "Lenguajes de programación",
  "Bases de datos",
  "Control de versiones",
  "Sistemas",
  "Microsoft Office",
  "Google",
  "Diseño",
  "Edición",
  "Inteligencia Artificial",
  "Soporte técnico",
];

// Recibe skills y devuelve herramientas filtradas; sus eventos cambian categoría y selección local.
export default function Tools({ skills }: { skills: RecordData[] }) {
  const visibleSkills = useMemo(
    () =>
      skills.filter(
        (skill) => String(skill.name).trim().toLowerCase() !== "postman",
      ),
    [skills],
  );
  // category guarda el filtro; selected guarda el ID cuya ayuda está abierta (undefined cierra la selección).
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<number | undefined>();
  // Recalcula las categorías sin duplicados sólo cuando cambia la lista recibida.
  const categories = useMemo(
    () =>
      Array.from(new Set(visibleSkills.map((s) => String(s.category)))).sort(
        (a, b) =>
          (categoryOrder.indexOf(a) === -1
            ? categoryOrder.length
            : categoryOrder.indexOf(a)) -
            (categoryOrder.indexOf(b) === -1
              ? categoryOrder.length
              : categoryOrder.indexOf(b)) || a.localeCompare(b),
      ),
    [visibleSkills],
  );
  const orderedSkills = useMemo(
    () =>
      [...visibleSkills].sort(
        (a, b) =>
          Number(a.display_order || 0) - Number(b.display_order || 0) ||
          String(a.category).localeCompare(String(b.category)) ||
          String(a.name).localeCompare(String(b.name)),
      ),
    [visibleSkills],
  );
  return (
    <div className="tools-browser">
      <div className="explorer-toolbar">
        Panel de control <b>›</b> Herramientas
      </div>
      <div className="tools-content">
        <header className="tools-header">
          <div>
            <span className="tools-eyebrow">MI CAJA DE HERRAMIENTAS</span>
            <h2>Herramientas</h2>
            <p>
              Tecnologías, plataformas y herramientas que forman parte de mi
              flujo de trabajo.
            </p>
          </div>
          <Icon name="tools" size={56} />
        </header>
        <label className="tools-filter">
          Ver por categoría
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Todas</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <div className="tools-grid" key={category}>
          {orderedSkills
            .filter((s) => category === "Todas" || s.category === category)
            .map((s) => (
              <button
                className={`tool ${selected === s.id ? "selected-tool" : ""}`}
                onClick={() =>
                  setSelected(selected === s.id ? undefined : s.id)
                }
                aria-label={String(s.name)}
                aria-expanded={selected === s.id}
                key={s.id}
                aria-describedby={`tip-${s.id}`}
              >
                <span className="tool-logo-wrapper">
                  <ToolLogo
                    name={String(s.name)}
                    icon={s.icon ? String(s.icon) : undefined}
                  />
                </span>
                <span className="tool-info">
                  <span className="tool-name">{String(s.name)}</span>
                  <span className="tool-category">{String(s.category)}</span>
                  {s.level && (
                    <small className="tool-level">{String(s.level)}</small>
                  )}
                </span>
                <span className="xp-tooltip" id={`tip-${s.id}`} role="tooltip">
                  <strong>{String(s.category)}</strong>
                  <br />
                  {String(s.description)}
                </span>
              </button>
            ))}
        </div>
      </div>
      <div className="statusbar">
        <span role="status">
          {
            visibleSkills.filter(
              (s) => category === "Todas" || s.category === category,
            ).length
          }{" "}
          herramientas
        </span>
        <span>Tocá o señalá una herramienta para conocer su uso.</span>
      </div>
    </div>
  );
}
