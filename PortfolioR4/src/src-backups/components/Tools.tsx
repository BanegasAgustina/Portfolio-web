import { useMemo, useState } from "react";
import type { RecordData } from "../types";
const marks: Record<string, string> = {
  HTML: "〈/〉",
  CSS: "#",
  JavaScript: "JS",
  React: "⚛",
  "Node.js": "⬡",
  Express: "ex",
  Vite: "ϟ",
  MySQL: "SQL",
  SQL: "≡",
  Supabase: "ϟ",
  Git: "⑂",
  GitHub: "⌘",
  "Visual Studio Code": "〈〉",
  Postman: "↗",
  Figma: "◉",
  Canva: "C",
  Windows: "⊞",
  "Linux básico": "L",
  XAMPP: "X",
};
export default function Tools({ skills }: { skills: RecordData[] }) {
  const [category, setCategory] = useState("Todas");
  const categories = useMemo(
    () => Array.from(new Set(skills.map((s) => String(s.category)))),
    [skills],
  );
  return (
    <>
      <div className="explorer-toolbar">
        Panel de control <b>›</b> Herramientas
      </div>
      <div className="tools-layout">
        <aside>
          <h3>Ver por categoría</h3>
          <button
            className={category === "Todas" ? "selected" : ""}
            onClick={() => setCategory("Todas")}
          >
            Todas las herramientas
          </button>
          {categories.map((c) => (
            <button
              className={category === c ? "selected" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </aside>
        <div className="tools-content">
          <h2>Mi caja de herramientas</h2>
          <p>Tecnologías y recursos con los que aprendo y construyo.</p>
          {categories
            .filter((c) => category === "Todas" || category === c)
            .map((c) => (
              <section key={c}>
                <h3 className="category-title">{c}</h3>
                <div className="tools-grid">
                  {skills
                    .filter((s) => s.category === c)
                    .map((s, i) => (
                      <button
                        className="tool"
                        key={s.id}
                        aria-describedby={`tip-${s.id}`}
                      >
                        <span className={`tool-symbol color-${i % 6}`}>
                          {s.icon ? (
                            <img src={String(s.icon)} alt="" />
                          ) : (
                            marks[String(s.name)] || String(s.name).slice(0, 2)
                          )}
                        </span>
                        <span>{String(s.name)}</span>
                        {s.level && <small>{String(s.level)}</small>}
                        <span
                          className="xp-tooltip"
                          id={`tip-${s.id}`}
                          role="tooltip"
                        >
                          {String(s.description)}
                        </span>
                      </button>
                    ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </>
  );
}
