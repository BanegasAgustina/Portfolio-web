/*
 * COPIA HISTÓRICA: src/src-backups/hooks/useDesktop.ts
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/hooks/useDesktop.ts
 * Propósito:
 * Hooks del escritorio público. useClock devuelve la hora local en formato argentino.
 * useWindowManager devuelve ventanas abiertas, minimizadas, orden visual y acciones para manejarlas.
 * Todo vive en memoria de React: no consulta la API ni guarda la distribución en localStorage.
 */
import { useCallback, useEffect, useState } from "react";
import type { WindowId } from "../types";
// Devuelve una cadena HH:MM; now guarda la hora que actualizará el intervalo.
export function useClock() {
  const [now, setNow] = useState(new Date());
  // La limpieza evita temporizadores duplicados al desmontar.
  // Inicia el reloj una sola vez por montaje y actualiza now cada segundo.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
// Devuelve acciones por WindowId; esta copia inicia con Sobre mí y Proyectos abiertos.
export function useWindowManager() {
  // windows conserva las abiertas, minimized las ocultas y stack el orden de foco (última = activa).
  const [state, setState] = useState<{
    windows: WindowId[];
    minimized: WindowId[];
    stack: WindowId[];
  }>({
    windows: ["about", "projects"],
    minimized: [],
    stack: ["projects", "about"],
  });
  // Iconos, menú y barra comparten la misma acción de abrir/restaurar.
  const open = useCallback((id: WindowId) => {
    setState((s) => ({
      windows: s.windows.includes(id) ? s.windows : [...s.windows, id],
      minimized: s.minimized.filter((w) => w !== id),
      stack: [...s.stack.filter((w) => w !== id), id],
    }));
  }, []);
  return {
    windows: state.windows,
    minimized: state.minimized,
    active: state.stack.at(-1),
    zIndex: (id: WindowId) => state.stack.indexOf(id) + 1,
    open,
    // Quita la ventana de las tres listas; al desmontarse pierde su estado interno.
    close: (id: WindowId) =>
      setState((s) => ({
        windows: s.windows.filter((w) => w !== id),
        minimized: s.minimized.filter((w) => w !== id),
        stack: s.stack.filter((w) => w !== id),
      })),
    // Oculta la ventana sin cerrarla y retira su foco; conserva su contenido montado.
    minimize: (id: WindowId) =>
      setState((s) => ({
        ...s,
        minimized: [...new Set([...s.minimized, id])],
        stack: s.stack.filter((w) => w !== id),
      })),
    // Lleva una ventana al frente; devuelve el mismo estado si ya era la activa.
    focus: (id: WindowId) =>
      setState((s) =>
        s.stack.at(-1) === id
          ? s
          : { ...s, stack: [...s.stack.filter((w) => w !== id), id] },
      ),
  };
}
