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
  const [windows, setWindows] = useState<WindowId[]>(["about", "projects"]);
  const [minimized, setMinimized] = useState<WindowId[]>([]);
  const [active, setActive] = useState<WindowId>("about");
  // Iconos, menú y barra comparten la misma acción de abrir/restaurar.
  const open = useCallback((id: WindowId) => {
    setWindows((v) => (v.includes(id) ? v : [...v, id]));
    setMinimized((v) => v.filter((w) => w !== id));
    setActive(id);
  }, []);
  return {
    windows,
    minimized,
    active,
    open,
    close: (id: WindowId) => setWindows((v) => v.filter((w) => w !== id)),
    minimize: (id: WindowId) => setMinimized((v) => [...v, id]),
    focus: setActive,
  };
}
