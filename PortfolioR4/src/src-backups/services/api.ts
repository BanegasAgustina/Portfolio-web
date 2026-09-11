/*
 * Archivo: src/src-backups/services/api.ts
 * COPIA HISTÓRICA, no usada por la aplicación activa.
 * Envía todas las rutas a Express bajo /api y adjunta la cookie del mismo origen.
 * A diferencia de src/services/api.ts, no construye /portfolio con consultas directas a Supabase.
 */
// Centraliza las cookies de sesión y los errores para todos los formularios.
// Recibe ruta y opciones; devuelve JSON o lanza Error para que la pantalla muestre el fallo.
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // GET por defecto; send prepara POST/PUT/DELETE. FormData conserva su cabecera multipart automática.
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
    headers:
      options.body instanceof FormData
        ? options.headers
        : { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response
    .json()
    .catch(() => ({ error: "El servidor no respondió correctamente." }));
  if (!response.ok)
    throw new Error(data.error || "No se pudo completar la operación.");
  return data as T;
}
// Devuelve opciones HTTP y serializa el body; no envía ninguna solicitud por sí misma.
export const send = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});
