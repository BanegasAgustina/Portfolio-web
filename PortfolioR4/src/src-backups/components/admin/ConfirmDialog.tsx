/*
 * COPIA HISTÓRICA: src/src-backups/components/admin/ConfirmDialog.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/components/admin/ConfirmDialog.tsx
 * Propósito:
 * Diálogo nativo que recibe busy, onCancel y onConfirm. No elimina registros por sí mismo.
 * Se abre al montarse; conserva el foco dentro del modal y permite cancelar con Escape si no está ocupado.
 * Admin decide cuándo montarlo y ejecuta la petición DELETE al confirmar.
 */
import { useEffect, useRef } from "react";
// Recibe busy y callbacks; devuelve un modal que delega la decisión al padre.
export default function ConfirmDialog({
  onCancel,
  onConfirm,
  busy,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  // Referencia al elemento nativo para abrir/cerrar el modal; no necesita estado adicional.
  const dialog = useRef<HTMLDialogElement>(null);
  // El diálogo nativo limita el foco y permite cancelar con Escape.
  // Se ejecuta una vez por montaje: showModal bloquea el fondo y close limpia al desmontar.
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      className="confirm-dialog"
      aria-labelledby="confirm-delete-title"
      ref={dialog}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h3 id="confirm-delete-title">Confirmar eliminación</h3>
      <div>
        <p>¿Está seguro de que desea eliminar este elemento?</p>
        <footer>
          <button autoFocus disabled={busy} onClick={onCancel}>
            Cancelar
          </button>
          <button disabled={busy} onClick={onConfirm}>
            {busy ? "Eliminando..." : "Eliminar"}
          </button>
        </footer>
      </div>
    </dialog>
  );
}
