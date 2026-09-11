/*
 * Archivo: backend/app.js
 * Propósito:
 * Crea y exporta Express para atender /api y servir dist cuando se ejecuta como servidor local.
 * Carga el entorno antes de configurar Helmet, JSON, control de origen y rutas.
 * En Vercel api/index.js reutiliza esta app sin abrir un puerto; los errores terminan en el middleware final.
 */
// Este import se ejecuta primero para que las siguientes configuraciones puedan leer process.env.
import "./config/env.js";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { frontendDist } from "./config/env.js";
import { api } from "./routes/api.js";
const app = express();
// Sólo confía en un proxy si el entorno lo indica; afecta protocolo/IP usados por cookies y rate limit.
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
const supabaseOrigin = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).origin
  : null;
// Helmet añade cabeceras de seguridad. connect-src permite el mismo origen y el proyecto Supabase configurado.
// En producción también se solicita actualizar recursos inseguros a HTTPS mediante CSP.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "https:", "data:"],
        "connect-src": ["'self'", ...(supabaseOrigin ? [supabaseOrigin] : [])],
        "upgrade-insecure-requests":
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
// Parsea cuerpos JSON con límite de 100 KB; las imágenes se procesan aparte con Multer.
app.use(express.json({ limit: "100kb" }));
// Control de origen para escrituras: compara Origin con FRONTEND_URL o el propio servidor.
// No es un middleware CORS que habilite lecturas desde cualquier origen; el frontend usa rutas relativas.
app.use("/api", (req, res, next) => {
  const origin = req.get("origin");
  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  const allowedOrigins = [process.env.FRONTEND_URL, requestOrigin].filter(
    Boolean,
  );
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    origin &&
    !allowedOrigins.includes(origin)
  )
    return res.status(403).json({ error: "Origen no permitido." });
  next();
});
// Monta los endpoints del router. El prefijo /api no se repite dentro de routes/api.js.
app.use("/api", api);
// Vercel puede entregar la ruta sin el prefijo /api a la función serverless.
app.use(api);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "Ruta no encontrada." }),
);
// Sirve el build de Vite y luego index.html para rutas de interfaz, que resolverá React Router.
app.use(express.static(frontendDist));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.join(frontendDist, "index.html")),
);
// Último middleware: registra el fallo y devuelve JSON genérico; Express deriva aquí errores de rutas async.
app.use((error, req, res, _next) => {
  console.error("API error:", {
    method: req.method,
    path: req.path,
    message: error?.message,
    code: error?.code,
    status: error?.status,
  });
  const status = error.status || 500;
  res.status(status).json({
    error:
      status === 503
        ? "Servicio no disponible. Intentá nuevamente."
        : "No se pudo completar la operación.",
  });
});
// En ejecución local abre el puerto configurado (3001 por defecto); Vercel invoca la app exportada.
if (!process.env.VERCEL)
  app.listen(
    Number(process.env.PORT || 3001),
    process.env.HOST ||
      (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"),
    () => console.log("Servidor opcional del portfolio iniciado."),
  );

export default app;
