/*
 * COPIA HISTÓRICA: src/src-backups/components/admin/Editor.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/components/admin/Editor.tsx
 * Propósito:
 * Formulario reutilizable del administrador. entity elige fields y record aporta valores iniciales.
 * busy viene de Admin; onSave recibe el objeto normalizado y onCancel vuelve a la vista anterior.
 * Mantiene una copia editable y errores locales. Sube imágenes por la API, pero delega guardar el registro al padre.
 */
import { useState, type FormEvent } from "react";
import type { RecordData } from "../../types";
import { api } from "../../services/api";
import { fields } from "./fields";
// Recibe entity/record/busy y callbacks; devuelve controles definidos por fields y acciones de guardar/cancelar.
export default function Editor({
  entity,
  record,
  busy,
  onSave,
  onCancel,
}: {
  entity: string;
  record: RecordData;
  busy: boolean;
  onSave: (value: RecordData) => Promise<void>;
  onCancel: () => void;
}) {
  // value es la copia editable. Completa campos ausentes según su tipo, sin alterar record.
  // uploading bloquea guardar durante una subida y error muestra fallos de subida o guardado.
  const [value, setValue] = useState<RecordData>(() =>
      Object.fromEntries(
        fields[entity].map((f) => [
          f.key,
          record[f.key] ??
            (f.type === "checkbox"
              ? false
              : f.type === "number"
                ? 0
                : f.type === "select"
                  ? f.options![0]
                  : f.type === "list"
                    ? []
                    : ""),
        ]),
      ),
    ),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  // Recibe clave y valor; reemplaza sólo esa propiedad de la copia local, sin consultar la base.
  const update = (key: string, v: RecordData[string]) =>
    setValue((prev) => ({ ...prev, [key]: v }));
  // Recibe la clave del campo de imagen y un archivo opcional; rechaza más de 5 MB.
  // POST /admin/upload envía FormData y recibe { url }; esa URL se guarda en value, aún no en el registro.
  async function upload(key: string, file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen supera 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const result = await api<{ url: string }>("/admin/upload", {
        method: "POST",
        body,
      });
      update(key, result.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }
  // Recibe el evento de envío; normaliza checks y listas separadas por comas antes de esperar onSave.
  // Admin elige POST/PUT y la URL; si falla, el formulario mantiene los datos y muestra el error.
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const normalized = { ...value };
      for (const f of fields[entity]) {
        if (f.type === "checkbox") normalized[f.key] = Boolean(value[f.key]);
        if (f.type === "list")
          normalized[f.key] = Array.isArray(value[f.key])
            ? value[f.key]
            : String(value[f.key])
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
      }
      await onSave(normalized);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <form className="editor-form" onSubmit={submit}>
      {fields[entity].map((f) => (
        <label
          key={f.key}
          className={`${f.type === "textarea" || f.type === "image" ? "wide" : ""} ${f.type === "checkbox" ? "check" : ""}`}
        >
          {f.label}
          {f.type === "textarea" ? (
            <textarea
              rows={4}
              value={String(value[f.key])}
              required={f.required}
              maxLength={f.max}
              onChange={(e) => update(f.key, e.target.value)}
            />
          ) : f.type === "checkbox" ? (
            <input
              type="checkbox"
              checked={!!value[f.key]}
              onChange={(e) => update(f.key, e.target.checked)}
            />
          ) : f.type === "select" ? (
            <select
              value={String(value[f.key])}
              onChange={(e) => update(f.key, e.target.value)}
            >
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o || "Sin nivel configurado"}
                </option>
              ))}
            </select>
          ) : f.type === "image" ? (
            <>
              <input
                aria-label={`${f.label}: URL`}
                value={String(value[f.key])}
                placeholder="URL https o imagen subida"
                onChange={(e) => update(f.key, e.target.value)}
              />
              <input
                aria-label={`${f.label}: subir archivo`}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy || uploading}
                onChange={(e) => void upload(f.key, e.target.files?.[0])}
              />
              <span className="hint">
                JPG, PNG o WEBP · máximo 5 MB.{" "}
                {uploading ? "Subiendo imagen..." : ""}
              </span>
              {value[f.key] && (
                <img
                  src={String(value[f.key])}
                  alt="Vista previa"
                  style={{
                    maxHeight: 140,
                    objectFit: "contain",
                    alignSelf: "start",
                  }}
                />
              )}
            </>
          ) : (
            <input
              type={
                f.type === "number"
                  ? "number"
                  : f.type === "url"
                    ? "url"
                    : "text"
              }
              value={
                Array.isArray(value[f.key])
                  ? (value[f.key] as string[]).join(", ")
                  : String(value[f.key])
              }
              required={f.required}
              min={f.type === "number" ? 0 : undefined}
              max={f.type === "number" ? 10000 : undefined}
              maxLength={f.max || 1000}
              onChange={(e) =>
                update(
                  f.key,
                  f.type === "number" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          )}
        </label>
      ))}
      {error && (
        <p className="wide error" role="alert">
          {error}
        </p>
      )}
      <div className="editor-actions">
        <button className="primary" disabled={busy || uploading}>
          {busy ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" disabled={busy || uploading} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
