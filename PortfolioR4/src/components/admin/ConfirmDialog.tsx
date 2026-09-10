import { useEffect, useRef } from "react";
export default function ConfirmDialog({
  onCancel,
  onConfirm,
  busy,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  busy: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  // El diálogo nativo limita el foco y permite cancelar con Escape.
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
