import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const backendRoot = fileURLToPath(new URL("../", import.meta.url));
dotenv.config({ path: path.join(backendRoot, ".env"), quiet: true });
export const frontendDist = path.resolve(backendRoot, "../dist");
