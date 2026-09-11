/*
 * Archivo: src/App.tsx
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
import "./Desktop.css";
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
