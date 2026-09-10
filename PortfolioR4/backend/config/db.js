import "./env.js";
import mysql from "mysql2/promise";
import { readFileSync } from "node:fs";
// El pool reutiliza conexiones. Los valores SQL siempre se envían por parámetros.
export const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "agustina_portfolio",
  connectionLimit: 8,
  charset: "utf8mb4",
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: true,
          ...(process.env.DB_CA_CERT
            ? { ca: readFileSync(process.env.DB_CA_CERT, "utf8") }
            : {}),
        }
      : undefined,
});
