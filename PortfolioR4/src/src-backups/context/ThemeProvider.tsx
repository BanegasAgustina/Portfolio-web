/*
 * COPIA HISTÓRICA: src/src-backups/context/ThemeProvider.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/context/ThemeProvider.tsx
 * Propósito:
 * Recibe children y los envuelve con el tema común del portfolio y del administrador.
 * Restaura xp-theme de localStorage o usa la preferencia del sistema si no hay una guardada.
 * Al cambiar dark, actualiza data-theme del elemento html y persiste la elección en este navegador.
 */
import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./theme";
// children es el contenido de App; dark es la única preferencia global que maneja este proveedor.
export function ThemeProvider({ children }: { children: ReactNode }) {
  // La preferencia manual tiene prioridad sobre la del sistema operativo.
  const [dark, setDark] = useState(() => {
    try {
      // Lee únicamente xp-theme: no guarda contenido del portfolio ni la contraseña.
      const saved = localStorage.getItem("xp-theme");
      return saved
        ? saved === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  // Se ejecuta al montar y cada vez que cambia dark: sincroniza CSS y preferencia persistente.
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      // Recuerda light/dark para la próxima visita; si el navegador bloquea almacenamiento, el tema sigue funcionando.
      localStorage.setItem("xp-theme", dark ? "dark" : "light");
    } catch {
      /* El tema funciona también sin almacenamiento. */
    }
  }, [dark]);
  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((v) => !v) }}>
      {children}
    </ThemeContext.Provider>
  );
}
