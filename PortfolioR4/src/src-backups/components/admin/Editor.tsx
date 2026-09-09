import { useState, type FormEvent } from "react";
import type { RecordData } from "../../types";
import { api } from "../../services/api";
import { fields } from "./fields";
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
  const update = (key: string, v: RecordData[string]) =>
    setValue((prev) => ({ ...prev, [key]: v }));
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
