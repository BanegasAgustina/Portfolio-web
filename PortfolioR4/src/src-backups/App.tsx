/*
 * COPIA HISTÓRICA: src/src-backups/App.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/App.tsx
 * Propósito:
 * Define las pantallas con React Router y comparte ThemeProvider con ambas.
 * / muestra Desktop; /admin muestra Admin, que consulta la sesión antes de mostrar el panel.
 * La URL /admin puede abrirse sin sesión: la protección real de sus operaciones está en Express.
 * Las rutas desconocidas muestran un enlace al escritorio. Importa los estilos de la aplicación.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import Desktop from "./pages/Desktop";
import Admin from "./pages/Admin";
import "./App.css";
// Devuelve el árbol de rutas dentro del proveedor; no recibe props ni conserva datos de negocio.
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Desktop />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="*"
            element={
              <main className="not-found">
                <h1>No encontramos esa carpeta.</h1>
                <a href="/">Volver al escritorio</a>
              </main>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
