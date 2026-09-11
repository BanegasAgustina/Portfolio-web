/*
 * Archivo: src/pages/Admin.tsx
 * Propósito:
 * Pantalla de administración, sin props. Usa api/send para hablar con Express, no con Supabase directamente.
 * Comprueba la sesión, muestra el login o las secciones y coordina carga, edición y eliminación.
 * Editor construye los formularios con fields; ConfirmDialog solicita confirmar una eliminación.
 * Los callbacks actualizan el estado local después de recibir la respuesta del backend.
 */
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import waving from "../assets/img/icono saludando.png";
import Window from "../components/Window";
import AdminIcon from "../components/admin/AdminIcon";
import "./Admin.css";
// Formulario y confirmación reutilizables; fields vincula las claves de las secciones con sus controles.
import Editor from "../components/admin/Editor";
import ConfirmDialog from "../components/admin/ConfirmDialog";
import { sections } from "../components/admin/fields";
import { api, send } from "../services/api";
import type { RecordData } from "../types";
import { useTheme } from "../context/theme";
// Sin props. Alterna comprobación de sesión, login y panel según auth; las mutaciones las autoriza el backend.
export default function Admin() {
  // auth: null mientras comprueba, false para login y true para panel; notice informa resultados.
  // busy bloquea acciones durante operaciones; section elige la vista y rows guarda sus registros.
  // editing: null sin formulario, {} al crear o registro al editar; remove guarda el ID a confirmar.
  // loading/loadError describen la lectura; revision fuerza recarga; selectedMessage abre un mensaje.
  const [auth, setAuth] = useState<boolean | null>(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [section, setSection] = useState("dashboard"),
    [rows, setRows] = useState<RecordData[]>([]),
    [editing, setEditing] = useState<RecordData | null>(null),
    [remove, setRemove] = useState<number | null>(null),
    [loading, setLoading] = useState(false),
    [revision, setRevision] = useState(0),
    [selectedMessage, setSelectedMessage] = useState<RecordData | null>(null),
    [loadError, setLoadError] = useState("");
  const theme = useTheme();
  // Al montar, GET /auth/me consulta la cookie de sesión; si falla, vuelve al login.
  // El indicador cancelled evita escribir estado después de desmontar.
  useEffect(() => {
    let cancelled = false;
    const refresh = () =>
      api<{ authenticated: boolean }>("/auth/me")
        .then((v) => {
          if (!cancelled) {
            setAuth(v.authenticated);
            if (!v.authenticated) {
              setRows([]);
              setEditing(null);
              setSelectedMessage(null);
            }
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setNotice(e.message);
            setAuth(false);
          }
        });
    void refresh();
    return () => {
      cancelled = true;
    };
  }, []);
  // Vuelve a cargar cuando cambia auth, section o revision. Panel y configuración no necesitan registros.
  // El perfil es un objeto único y abre directamente Editor; otras secciones reciben listas.
  useEffect(() => {
    if (!auth || ["dashboard", "settings"].includes(section)) return;
    let cancelled = false;
    // GET /admin/<sección>: Express consulta la tabla correspondiente y devuelve los registros.
    api<RecordData[] | RecordData>(`/admin/${section}`)
      .then((v) => {
        if (!cancelled) {
          setRows(Array.isArray(v) ? v : [v]);
          if (section === "profile") setEditing(v as RecordData);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setLoadError(e.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [auth, section, revision]);
  // Recibe la clave de sección; limpia selección/errores y dispara una recarga sin cambiar la URL /admin.
  function navigate(next: string) {
    setSection(next);
    setEditing(null);
    setSelectedMessage(null);
    setRows([]);
    setLoadError("");
    setLoading(!["dashboard", "settings"].includes(next));
    setRevision((v) => v + 1);
  }
  // Recibe el submit del formulario. POST /auth/login envía la contraseña; Express valida y emite la cookie.
  // Al resolver, muestra el panel; el navegador conserva la cookie HttpOnly, no el estado auth de React.
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    try {
      await api("/auth/login", send("POST", { password }));
      setAuth(true);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  // POST /auth/logout solicita cerrar la sesión; si responde bien, limpia registros y vuelve al login.
  async function logout() {
    setBusy(true);
    try {
      await api("/auth/logout", send("POST"));
      setAuth(false);
      setNotice("");
      setSection("dashboard");
      setRows([]);
      setEditing(null);
      setSelectedMessage(null);
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  // Recibe los campos normalizados de Editor. POST crea; PUT edita un ID o el perfil único.
  // Al completar, cierra el editor y aumenta revision para leer lo guardado; propaga fallos a Editor.
  async function save(data: RecordData) {
    setBusy(true);
    try {
      await api(
        `/admin/${section}${section === "profile" ? "" : editing?.id ? `/${editing.id}` : ""}`,
        send(section === "profile" || editing?.id ? "PUT" : "POST", data),
      );
      setNotice(
        "✓ Cambios guardados. Ya están disponibles en el portfolio público.",
      );
      setEditing(null);
      setRevision((v) => v + 1);
    } finally {
      setBusy(false);
    }
  }
  // Usa el ID pendiente en remove y envía DELETE; al completar limpia selección y vuelve a cargar.
  // La API actual rechaza DELETE de mensajes con 404 aunque la interfaz ofrezca el botón.
  async function deleteRow() {
    setBusy(true);
    try {
      await api(`/admin/${section}/${remove}`, send("DELETE"));
      setRemove(null);
      setNotice("✓ Elemento eliminado.");
      setSelectedMessage(null);
      setRevision((v) => v + 1);
    } catch (e) {
      setNotice((e as Error).message);
      setRemove(null);
    } finally {
      setBusy(false);
    }
  }
  // Recibe un mensaje, lo muestra y envía PUT si no estaba leído; el backend fija is_read=true.
  async function readMessage(row: RecordData) {
    setSelectedMessage(row);
    if (!row.is_read)
      try {
        await api(`/admin/messages/${row.id}`, send("PUT"));
        setRevision((v) => v + 1);
      } catch (e) {
        setNotice((e as Error).message);
      }
  }
  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-brand">
          <img className="admin-avatar" src={waving} alt="Agustina saludando" />
          <h1>Administración del Portfolio</h1>
        </div>
        <Link to="/">← Volver al escritorio</Link>
      </header>
      {auth === null ? (
        <Window title="Administración del Portfolio" icon="tools">
          <p className="content-pad">Comprobando sesión...</p>
        </Window>
      ) : !auth ? (
        <Window title="Iniciar sesión" icon="tools" className="login-window">
          <form className="login-form" onSubmit={login}>
            <div className="login-intro">
              <AdminIcon name="dashboard" size={40} />
              <p>
                Iniciá sesión para acceder a la administración del portfolio.
              </p>
            </div>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={128}
              />
            </label>
            {notice && (
              <p className="error" role="alert">
                {notice}
              </p>
            )}
            <div className="login-actions">
              <button type="submit" className="primary" disabled={busy}>
                {busy ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
              <Link to="/" className="cancel-link">
                Cancelar
              </Link>
            </div>
          </form>
        </Window>
      ) : (
        <Window
          title="Panel de control — Administrador del Portfolio"
          icon="tools"
        >
          <div className="admin-shell">
            <nav className="admin-nav" aria-label="Secciones de administración">
              {Object.entries(sections).map(([key, label]) => (
                <button
                  key={key}
                  className={section === key ? "selected" : ""}
                  aria-current={section === key ? "page" : undefined}
                  onClick={() => navigate(key)}
                >
                  <AdminIcon name={key} />
                  <span>{label}</span>
                </button>
              ))}
              <button disabled={busy} onClick={() => void logout()}>
                <AdminIcon name="logout" />
                <span>Cerrar sesión</span>
              </button>
            </nav>
            <div className="admin-main">
              {notice && (
                <div className="notification" role="status">
                  {notice}
                  <button
                    aria-label="Cerrar notificación"
                    onClick={() => setNotice("")}
                  >
                    ×
                  </button>
                </div>
              )}
              <header>
                <h2>{sections[section]}</h2>
                {!["dashboard", "settings", "messages", "profile"].includes(
                  section,
                ) &&
                  !editing && (
                    <button className="primary" onClick={() => setEditing({})}>
                      + Agregar
                    </button>
                  )}
              </header>
              {section === "dashboard" ? (
                <>
                  <p>Todo tu contenido, en un solo lugar.</p>
                  <div className="dashboard-cards">
                    {Object.entries(sections)
                      .filter(
                        ([key]) => !["dashboard", "settings"].includes(key),
                      )
                      .map(([key, label]) => (
                        <button key={key} onClick={() => navigate(key)}>
                          <AdminIcon name={key} size={40} />
                          {label}
                        </button>
                      ))}
                  </div>
                </>
              ) : section === "settings" ? (
                <div>
                  <p>Personalizá la apariencia de este navegador.</p>
                  <button onClick={theme.toggle}>
                    {theme.dark ? "☀ Activar XP Light" : "☾ Activar XP Dark"}
                  </button>
                  <p className="hint">
                    La preferencia se guarda en este dispositivo. El teléfono se
                    activa únicamente desde Información personal.
                  </p>
                </div>
              ) : loading ? (
                <p role="status">Abriendo carpeta...</p>
              ) : loadError ? (
                <div className="error" role="alert">
                  <p>{loadError}</p>
                  <button onClick={() => navigate(section)}>Reintentar</button>
                </div>
              ) : editing ? (
                <Editor
                  key={`${section}-${editing.id || "new"}-${revision}`}
                  entity={section}
                  record={editing}
                  busy={busy}
                  onSave={save}
                  onCancel={() => {
                    setEditing(null);
                    if (section === "profile") navigate("dashboard");
                  }}
                />
              ) : selectedMessage ? (
                <article>
                  <button onClick={() => setSelectedMessage(null)}>
                    ← Volver a mensajes
                  </button>
                  <h3 style={{ marginTop: 20 }}>
                    {String(selectedMessage.subject)}
                  </h3>
                  <p>
                    {String(selectedMessage.name)} ·{" "}
                    {String(selectedMessage.email)}
                  </p>
                  <p className="message-body">
                    {String(selectedMessage.message)}
                  </p>
                  <button onClick={() => setRemove(selectedMessage.id!)}>
                    Eliminar mensaje
                  </button>
                </article>
              ) : (
                <div className="admin-list">
                  {rows.length ? (
                    rows.map((row) => (
                      <article className="admin-row" key={row.id}>
                        <div>
                          <strong>
                            {String(row.title || row.name || row.subject)}
                          </strong>
                          <small>
                            {section === "messages"
                              ? `${row.is_read ? "Leído" : "Nuevo"} · ${row.email}`
                              : String(
                                  row.category ||
                                    row.organization ||
                                    row.url ||
                                    "",
                                )}
                          </small>
                        </div>
                        <div className="row-actions">
                          <button
                            onClick={() =>
                              section === "messages"
                                ? void readMessage(row)
                                : setEditing(row)
                            }
                          >
                            {section === "messages" ? "Leer" : "Editar"}
                          </button>
                          <button onClick={() => setRemove(row.id!)}>
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p>
                      Esta carpeta está vacía.
                      {section === "messages"
                        ? " Los mensajes del formulario aparecerán acá."
                        : " Agregá el primer elemento cuando esté listo."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </Window>
      )}
      {remove !== null && (
        <ConfirmDialog
          busy={busy}
          onCancel={() => setRemove(null)}
          onConfirm={() => void deleteRow()}
        />
      )}
    </main>
  );
}
