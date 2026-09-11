/*
 * Archivo: src/pages/Desktop.tsx
 * Propósito:
 * Pantalla pública, sin props. Obtiene Portfolio desde services/api y reparte sus datos entre ventanas XP.
 * useWindowManager coordina ventanas; useClock muestra la hora y useTheme cambia la apariencia.
 * Projects, Tools, Skills, Contact y SocialLinks reciben las listas ya cargadas.
 * Perfil, experiencia, educación y notas se dibujan en este mismo archivo.
 */
import { useEffect, useState } from "react";
import waving from "../assets/img/icono saludando.png";
import schoolLogo from "../assets/img/Logo escuela.png";
import companyLogo from "../assets/img/Logo_Nucleo_rojo-blanco.png";
import avatar from "../assets/img/avatar-seccion-sobre mi.png";
// Acceso a datos, tipos y hooks: separan la carga del contenido de su presentación XP.
import { api } from "../services/api";
import type { Portfolio, WindowId } from "../types";
import { useClock, useWindowManager } from "../hooks/useDesktop";
import { useTheme } from "../context/theme";
import Window from "../components/Window";
import Icon from "../components/Icon";
import Projects from "../components/Projects";
import Skills from "../components/Skills";
import Tools from "../components/Tools";
import Contact from "../components/Contact";
import SocialLinks from "../components/SocialLinks";
const titles: Record<WindowId, string> = {
  about: "Sobre mí",
  projects: "Mis proyectos",
  tools: "Herramientas",
  skills: "Habilidades",
  experience: "Experiencia",
  education: "Educación",
  contact: "Contacto",
  notes: "Bloc de notas",
};
// Sin props: carga el portfolio y devuelve accesos, ventanas, aviso de estado y barra de tareas.
export default function Desktop() {
  // data conserva la última carga correcta; error explica un fallo y attempt permite reintentar.
  // more muestra u oculta el recorrido ampliado del perfil.
  const [data, setData] = useState<Portfolio | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0),
    [more, setMore] = useState(false);
  const manager = useWindowManager(),
    clock = useClock(),
    theme = useTheme();
  // Cancelar la actualización evita escribir sobre un componente desmontado.
  // Carga al montar y al cambiar attempt; vuelve a leer al recuperar foco o recibir portfolio-content-changed.
  // La limpieza retira listeners y descarta respuestas tardías; no cancela la petición de red.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      // La ruta lógica /portfolio se resuelve con lecturas públicas de Supabase, no con GET a Express.
      api<Portfolio>("/portfolio")
        .then((v) => {
          if (!cancelled) {
            setData(v);
            setError("");
          }
        })
        .catch((e) => {
          if (!cancelled) setError(e.message);
        });
    void load();
    window.addEventListener("focus", load);
    window.addEventListener("portfolio-content-changed", load);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", load);
      window.removeEventListener("portfolio-content-changed", load);
    };
  }, [attempt]);
  // Recibe el identificador de ventana, la abre/restaura y mueve el foco cuando React termina de dibujar.
  const open = (id: WindowId) => {
    manager.open(id);
    // Esperamos el próximo dibujo de React para enfocar la ventana recién abierta.
    requestAnimationFrame(() => {
      const element = document.getElementById(`window-${id}`);
      element?.focus({ preventScroll: true });
    });
  };
  return (
    <main className="desktop">
      <a className="skip-link" href="#workspace">
        Ir al contenido
      </a>
      <div className="desktop-brand">
        <img className="desktop-mascot" src={waving} alt="Agustina saludando" />
        <span>
          Agustina <span className="brand-light">Portfolio</span>
        </span>
      </div>
      <nav className="desktop-icons" aria-label="Accesos directos">
        {(
          [
            "about",
            "projects",
            "tools",
            "skills",
            "experience",
            "education",
            "contact",
          ] as WindowId[]
        ).map((id) => (
          <button key={id} onClick={() => open(id)}>
            <Icon name={id} size={44} />
            <span>{titles[id]}</span>
          </button>
        ))}
      </nav>
      {data && error && (
        <div className="refresh-error" role="alert">
          No se pudo actualizar el contenido. Mostrando la última carga
          correcta.{" "}
          <button onClick={() => setAttempt((v) => v + 1)}>Reintentar</button>
        </div>
      )}
      <div className="workspace" id="workspace" tabIndex={-1}>
        {!data ? (
          <Window title="Mi portfolio" icon="about">
            <div className="loading content-pad" role="status">
              <Icon name="about" size={56} />
              <h2>
                {error
                  ? "No pudimos abrir el portfolio"
                  : "Preparando tu visita..."}
              </h2>
              <p>{error || "Abriendo las carpetas de Agustina."}</p>
              {error && (
                <button
                  onClick={() => {
                    setError("");
                    setAttempt((v) => v + 1);
                  }}
                >
                  Reintentar
                </button>
              )}
            </div>
          </Window>
        ) : (
          <>
            {manager.windows.map((id) => (
              <Window
                key={id}
                title={titles[id]}
                icon={id}
                className={`window-${id}`}
                active={manager.active === id}
                zIndex={manager.zIndex(id)}
                hidden={manager.minimized.includes(id)}
                onFocus={() => manager.focus(id)}
                onClose={() => manager.close(id)}
                onMinimize={() => manager.minimize(id)}
              >
                {id === "about" && (
                  <>
                    <div className="property-tabs">
                      <span className="selected">General</span>
                      <button onClick={() => setMore((v) => !v)}>
                        Mi recorrido
                      </button>
                    </div>
                    <div className="about-intro">
                      <div className="avatar-scene">
                        <img
                          src={String(data.profile.avatar || avatar)}
                          alt="Avatar ilustrado de Agustina programando en su escritorio"
                        />
                        <span className="avatar-caption">¡Hola, mundo!</span>
                      </div>
                      <div className="about-text">
                        <span className="eyebrow">
                          BIENVENIDO A MI ESCRITORIO
                        </span>
                        <h1>
                          {String(data.profile.name)}
                          <span className="name-dot">.</span>
                        </h1>
                        <p className="role">{String(data.profile.role)}</p>
                        <p className="location">
                          ⌖ {String(data.profile.location)}
                        </p>
                      </div>
                    </div>
                    <div className="about-description">
                      <p>{String(data.profile.description)}</p>
                      <div className="hero-actions">
                        <button
                          className="primary"
                          onClick={() => open("projects")}
                        >
                          <Icon name="projects" size={20} />
                          Explorar proyectos
                        </button>
                        <button onClick={() => open("contact")}>
                          Hablemos ↗
                        </button>
                        <button
                          className="text-button"
                          onClick={() => setMore((v) => !v)}
                        >
                          {more ? "Ver menos" : "Conoceme más"}
                        </button>
                      </div>
                      {more && (
                        <div className="more-about">
                          <h3>Aprender también es parte del camino</h3>
                          <p>
                            {data.education
                              .map((e) => `${e.description} ${e.organization}`)
                              .join(" ")}
                          </p>
                          <div className="tags">
                            {data.soft_skills.map((s) => (
                              <span key={s.id}>{String(s.name)}</span>
                            ))}
                          </div>
                          {data.profile.cv && (
                            <a
                              href={String(data.profile.cv)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver CV ↗
                            </a>
                          )}
                          {!!data.profile.show_phone && data.profile.phone && (
                            <p>Teléfono: {String(data.profile.phone)}</p>
                          )}
                        </div>
                      )}
                      <SocialLinks links={data.social_links} />
                    </div>
                    <div className="statusbar">
                      <span className="green-dot" />
                      Aprendiendo y construyendo <span>Portfolio personal</span>
                    </div>
                  </>
                )}
                {id === "projects" && <Projects projects={data.projects} />}
                {id === "skills" && (
                  <Skills skills={data.skills} personal={data.soft_skills} />
                )}
                {id === "tools" && <Tools skills={data.skills} />}
                {id === "contact" && (
                  <Contact
                    links={data.social_links}
                    cv={String(data.profile.cv || "")}
                  />
                )}
                {(["experience", "education"] as WindowId[]).includes(id) && (
                  <>
                    <div className="explorer-toolbar">
                      Mis documentos <b>›</b> {titles[id]}
                    </div>
                    <div className="content-pad">
                      <span className="eyebrow">MI RECORRIDO</span>
                      <h2>{titles[id]}</h2>
                      {(id === "experience"
                        ? data.experiences
                        : data.education
                      ).map((item) => (
                        // Conserva todos los datos; la ficha separa el logo del texto para distribuirlos según el ancho disponible.
                        <article
                          className="timeline-item record-panel"
                          key={item.id}
                        >
                          {((id === "education" &&
                            /Amancio|EEST|Técnica.*5/i.test(
                              String(item.organization),
                            )) ||
                            (id === "experience" &&
                              /Grupo N[uú]cleo/i.test(
                                String(item.organization),
                              ))) && (
                            <img
                              className={`organization-logo ${id}`}
                              src={
                                id === "education" ? schoolLogo : companyLogo
                              }
                              alt={`Logo de ${item.organization}`}
                            />
                          )}
                          <div className="record-details">
                            <span className="badge">
                              {String(item.status || item.date || "")}
                            </span>
                            {item.icon && (
                              <img
                                src={String(item.icon)}
                                alt=""
                                width={32}
                                height={32}
                              />
                            )}
                            <h3>{String(item.title)}</h3>
                            <h4>{String(item.organization || "")}</h4>
                            <p>{String(item.description)}</p>
                            <small>
                              {String(item.location || "")}{" "}
                              {String(item.date || "")}
                            </small>
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
                {id === "notes" && (
                  <div className="notepad">
                    <p>Archivo · Edición · Formato</p>
                    <textarea
                      aria-label="Bloc de notas personal de esta visita"
                      defaultValue="¡Hola! Este espacio es para tus ideas. Estas notas duran mientras la ventana esté abierta."
                    />
                  </div>
                )}
              </Window>
            ))}
          </>
        )}
      </div>
      <aside className="desktop-note">
        <p>¡Abrí las carpetas o explorá el portfolio!</p>
        <span>:)</span>
      </aside>
      <footer className="taskbar">
        <div className="task-buttons">
          {manager.windows.map((id) => (
            <button
              key={id}
              aria-label={titles[id]}
              className={
                manager.active === id && !manager.minimized.includes(id)
                  ? "current"
                  : ""
              }
              onClick={() =>
                manager.minimized.includes(id) || manager.active !== id
                  ? open(id)
                  : manager.minimize(id)
              }
            >
              <Icon name={id} size={19} />
              <span>{titles[id]}</span>
            </button>
          ))}
        </div>
        <div className="system-tray">
          <button
            onClick={theme.toggle}
            aria-label={
              theme.dark ? "Activar modo claro" : "Activar modo oscuro"
            }
          >
            {theme.dark ? "☀" : "☾"}
          </button>
          <span>ES</span>
          <span aria-hidden="true">◉</span>
          <time>{clock}</time>
        </div>
      </footer>
    </main>
  );
}
