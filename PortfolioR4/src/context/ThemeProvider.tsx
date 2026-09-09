import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext } from "./theme";
export function ThemeProvider({ children }: { children: ReactNode }) {
  // La preferencia manual tiene prioridad sobre la del sistema operativo.
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem("xp-theme");
      return saved
        ? saved === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
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
