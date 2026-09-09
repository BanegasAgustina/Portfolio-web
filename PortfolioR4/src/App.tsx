import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import Desktop from "./pages/Desktop";
import Admin from "./pages/Admin";
import "./App.css";
import "./Desktop.css";
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
