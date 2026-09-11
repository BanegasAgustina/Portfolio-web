/*
 * Archivo: api/index.js
 * Propósito:
 * Entrada serverless de Vercel. Exporta la misma aplicación Express de backend/app.js.
 * vercel.json dirige las solicitudes /api/* a esta función; aquí no se duplican rutas ni consultas.
 */
import app from "../backend/app.js";

export default app;
