import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Las rutas se calculan desde este archivo, no desde la terminal que inicia Node.
// Así funciona tanto `npm run backend` en la raíz como `npm run dev` en backend.
export const backendRoot = fileURLToPath(new URL("../", import.meta.url));
dotenv.config({ path: path.join(backendRoot, ".env"), quiet: true });
export const uploadsDirectory = path.resolve(
  backendRoot,
  process.env.UPLOAD_DIR || "uploads",
);
export const frontendDist = path.resolve(backendRoot, "../dist");
