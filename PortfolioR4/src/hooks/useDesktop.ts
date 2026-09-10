import { useCallback, useEffect, useState } from "react";
import type { WindowId } from "../types";
export function useClock() {
  const [now, setNow] = useState(new Date());
  // La limpieza evita temporizadores duplicados al desmontar.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function useWindowManager() {
  const [state, setState] = useState<{
    windows: WindowId[];
    minimized: WindowId[];
    stack: WindowId[];
  }>({
    windows: [],
    minimized: [],
    stack: [],
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
    close: (id: WindowId) =>
      setState((s) => ({
        windows: s.windows.filter((w) => w !== id),
        minimized: s.minimized.filter((w) => w !== id),
        stack: s.stack.filter((w) => w !== id),
      })),
    minimize: (id: WindowId) =>
      setState((s) => ({
        ...s,
        minimized: [...new Set([...s.minimized, id])],
        stack: s.stack.filter((w) => w !== id),
      })),
    focus: (id: WindowId) =>
      setState((s) =>
        s.stack.at(-1) === id
          ? s
          : { ...s, stack: [...s.stack.filter((w) => w !== id), id] },
      ),
  };
}
