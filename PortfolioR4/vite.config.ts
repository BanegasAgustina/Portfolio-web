/*
 * Archivo: vite.config.ts
 * Propósito:
 * Configuración de Vite: habilita React para desarrollo y producción.
 * No define proxy a Express; el fetch relativo /api necesita un despliegue o servidor que atienda esa ruta.
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
export default defineConfig({ plugins: [react()] });
