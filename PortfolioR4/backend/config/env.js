/*
 * Archivo: backend/config/env.js
 * Propósito:
 * Carga backend/.env con dotenv, sin incluir valores en el código.
 * Exporta backendRoot y frontendDist para resolver rutas independientemente de dónde se inicie Node.
 * Las variables ya definidas en el entorno del proceso conservan prioridad por defecto.
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const backendRoot = fileURLToPath(new URL("../", import.meta.url));
dotenv.config({ path: path.join(backendRoot, ".env"), quiet: true });
export const frontendDist = path.resolve(backendRoot, "../dist");
