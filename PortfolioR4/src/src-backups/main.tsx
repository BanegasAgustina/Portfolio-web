/*
 * COPIA HISTÓRICA: src/src-backups/main.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/main.tsx
 * Propósito:
 * Punto de entrada del navegador. Carga index.css y monta App dentro de #root (index.html).
 * StrictMode ayuda a detectar problemas durante el desarrollo; este archivo no consulta datos.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// Conecta React con el único nodo de montaje de index.html.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
