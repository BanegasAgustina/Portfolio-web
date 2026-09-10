import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { uploadsDirectory } from "../config/env.js";
// Punto de sustitución para almacenamiento externo: debe devolver la URL pública de la imagen.
export async function storeImage(buffer, extension) {
  const directory = uploadsDirectory;
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), buffer);
  return `/uploads/${filename}`;
}
