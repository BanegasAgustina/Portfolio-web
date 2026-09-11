/*
 * Archivo: src/main.tsx
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
