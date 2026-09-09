import "./config/env.js";
import express from "express";
import session from "express-session";
import { SQLSessionStore } from "./config/sessionStore.js";
import helmet from "helmet";
import path from "node:path";
import { frontendDist, uploadsDirectory } from "./config/env.js";
import { api } from "./routes/api.js";
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
  throw new Error(
    "Configurá SESSION_SECRET con al menos 32 caracteres en .env.",
  );
const app = express();
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "https:", "data:"],
        "upgrade-insecure-requests":
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);
const origin = process.env.FRONTEND_URL || "http://localhost:5173";
// API y frontend comparten origen mediante proxy. Bloqueamos escrituras de otros sitios (CSRF).
app.use("/api", (req, res, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.get("origin") !== origin
  )
    return res.status(403).json({ error: "Origen no permitido." });
  next();
});
app.use(express.json({ limit: "100kb" }));
app.use(
  session({
    name: "portfolio.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLSessionStore(),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 3600000,
    },
  }),
);
app.use("/api", api);
app.use("/api", (req, res) =>
  res.status(404).json({ error: "Ruta no encontrada." }),
);
app.use(
  "/uploads",
  express.static(uploadsDirectory, {
    setHeaders: (res) => res.set("X-Content-Type-Options", "nosniff"),
  }),
);
app.use(express.static(frontendDist));
app.get("/{*path}", (req, res) =>
  res.sendFile(path.join(frontendDist, "index.html")),
);
// Los errores de infraestructura no revelan contraseñas, SQL ni stack traces al cliente.
app.use((error, req, res, _next) => {
  console.error(error.code || error.message);
  res
    .status(error.status || (error.code === "LIMIT_FILE_SIZE" ? 400 : 503))
    .json({
      error: error.status
        ? error.message
        : error.code === "LIMIT_FILE_SIZE"
          ? "La imagen supera 5 MB."
          : "No se pudo completar la operación. Revisá la conexión e intentá nuevamente.",
    });
});
app.listen(
  Number(process.env.PORT || 3001),
  process.env.HOST ||
    (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"),
  () =>
    console.log(
      `API del portfolio: http://localhost:${process.env.PORT || 3001}`,
    ),
);
