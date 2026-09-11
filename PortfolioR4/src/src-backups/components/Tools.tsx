/*
 * COPIA HISTÓRICA: src/src-backups/components/Tools.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/components/Tools.tsx
 * Propósito:
 * Ventana de herramientas. Recibe skills y muestra un filtro de categorías, iconos y descripciones.
 * La selección local permite abrir/cerrar el texto de ayuda al tocar una herramienta.
 * Usa un icono personalizado del registro o TechnologyIcon según el nombre; no consulta la API.
 */
import { useMemo, useState } from "react";
import type { RecordData } from "../types";
import TechnologyIcon from "./TechnologyIcon";
// Recibe skills y devuelve herramientas filtradas; sus eventos cambian categoría y selección local.
export default function Tools({ skills }: { skills: RecordData[] }) {
  // category guarda el filtro; selected guarda el ID cuya ayuda está abierta (undefined cierra la selección).
  const [category, setCategory] = useState("Todas");
  const [selected, setSelected] = useState<number | undefined>();
  // Recalcula las categorías sin duplicados sólo cuando cambia la lista recibida.
  const categories = useMemo(
    () => Array.from(new Set(skills.map((s) => String(s.category)))),
    [skills],
  );
  return (
    <>
      <div className="explorer-toolbar">
        Panel de control <b>›</b> Herramientas
      </div>
      <div className="tools-content">
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
          {skills
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
          skills.filter((s) => category === "Todas" || s.category === category)
            .length
        }{" "}
        herramientas · Tocá o señalá un icono para conocer su uso.
      </div>
    </>
  );
}
