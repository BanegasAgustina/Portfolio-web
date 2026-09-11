/*
 * Archivo: eslint.config.js
 * Propósito:
 * Reglas de análisis estático. Aplica reglas de Node al backend y de TypeScript/React al frontend.
 * Ignora dist, archivos de ejecución, uploads y las copias src/src-backups. No modifica código al ejecutarse.
 */
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", ".runtime", "backend/uploads", "src/src-backups"]),
  {
    files: ["backend/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      // La validación rechaza explícitamente caracteres de control en el texto recibido.
      "no-control-regex": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
