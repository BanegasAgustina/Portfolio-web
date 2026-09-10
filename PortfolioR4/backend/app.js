import "./config/env.js";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { frontendDist } from "./config/env.js";
import { api } from "./routes/api.js";
const app = express();
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
const supabaseOrigin = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).origin
  : null;
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
app.use(express.json({ limit: "100kb" }));
app.use("/api", (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    (!process.env.FRONTEND_URL ||
      req.get("origin") !== process.env.FRONTEND_URL)
  )
    return res.status(403).json({ error: "Origen no permitido." });
  next();
});
app.use("/api", api);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "Ruta no encontrada." }),
);
app.use(express.static(frontendDist));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.join(frontendDist, "index.html")),
);
app.use((error, _req, res, _next) =>
  res
    .status(error.status || 503)
    .json({
      error: error.status
        ? error.message
        : "Servicio no disponible. Intentá nuevamente.",
    }),
);
if (!process.env.VERCEL)
  app.listen(
    Number(process.env.PORT || 3001),
    process.env.HOST ||
      (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"),
    () => console.log("Servidor opcional del portfolio iniciado."),
  );

export default app;
