/*
 * Archivo: src/context/theme.ts
 * Propósito:
 * Contrato compartido del tema: dark indica modo oscuro y toggle permite alternarlo.
 * useTheme lee el contexto del ThemeProvider más cercano; no almacena la preferencia por sí mismo.
 */
import { createContext, useContext } from "react";
// Valores de respaldo si se lee el contexto fuera del proveedor; App sí lo proporciona.
export const ThemeContext = createContext({ dark: false, toggle: () => {} });
// Devuelve { dark, toggle } para que cualquier descendiente de ThemeProvider use el mismo tema.
export const useTheme = () => useContext(ThemeContext);
