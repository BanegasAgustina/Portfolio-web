/*
 * Archivo: src/components/Tools.tsx
 * Propósito:
 * Ventana de herramientas. Recibe skills y muestra un filtro de categorías, iconos y descripciones.
 * La selección local permite abrir/cerrar el texto de ayuda al tocar una herramienta.
 * Usa un icono personalizado del registro o TechnologyIcon según el nombre; no consulta la API.
 */
import { useMemo, useState } from "react";
import type { RecordData } from "../types";
import TechnologyIcon from "./TechnologyIcon";

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
    () => skills.filter((skill) => String(skill.name).trim().toLowerCase() !== "postman"),
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
          (categoryOrder.indexOf(a) === -1 ? categoryOrder.length : categoryOrder.indexOf(a)) -
          (categoryOrder.indexOf(b) === -1 ? categoryOrder.length : categoryOrder.indexOf(b)) ||
          a.localeCompare(b),
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
    <>
      <div className="explorer-toolbar">
        Panel de control <b>›</b> Herramientas
      </div>
      <div className="tools-content">
        {/* Encabezado compartido con las demás ventanas; el filtro conserva su estado y sus opciones. */}
        <h2>Herramientas</h2>
        <label className="tools-filter">
          Ver por categoría{" "}
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
        <div className="tools-grid">
          {orderedSkills
            .filter((s) => category === "Todas" || s.category === category)
            .map((s) => (
              <button
                className={`tool ${selected === s.id ? "selected-tool" : ""}`}
                onClick={() =>
                  setSelected(selected === s.id ? undefined : s.id)
                }
                aria-expanded={selected === s.id}
                key={s.id}
                aria-describedby={`tip-${s.id}`}
              >
                {s.icon ? (
                  <img
                    className="technology-icon"
                    src={String(s.icon)}
                    alt=""
                  />
                ) : (
                  <TechnologyIcon name={String(s.name)} />
                )}
                <span>{String(s.name)}</span>
                {s.level && <small>{String(s.level)}</small>}
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
        {
          visibleSkills.filter(
            (s) => category === "Todas" || s.category === category,
          ).length
        }{" "}
        herramientas · Tocá o señalá un icono para conocer su uso.
      </div>
    </>
  );
}
