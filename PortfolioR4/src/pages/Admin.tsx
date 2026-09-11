import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import waving from "../assets/img/icono saludando.png";
import Window from "../components/Window";
import AdminIcon from "../components/admin/AdminIcon";
import "./Admin.css";
import Editor from "../components/admin/Editor";
import ConfirmDialog from "../components/admin/ConfirmDialog";
import { sections } from "../components/admin/fields";
import { api, send } from "../services/api";
import type { RecordData } from "../types";
import { useTheme } from "../context/theme";
export default function Admin() {
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
  useEffect(() => {
    if (!auth || ["dashboard", "settings"].includes(section)) return;
    let cancelled = false;
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
  function navigate(next: string) {
    setSection(next);
    setEditing(null);
    setSelectedMessage(null);
    setRows([]);
    setLoadError("");
    setLoading(!["dashboard", "settings"].includes(next));
    setRevision((v) => v + 1);
  }
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
