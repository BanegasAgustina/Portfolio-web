/*
 * Archivo: src/components/TechnologyIcon.tsx
 * Propósito:
 * Dibuja el icono decorativo de una tecnología a partir de name y size (28 por defecto).
 * brands asocia nombres a SVG locales y colores; el resto se dibuja con SVG dentro del componente.
 * No descarga logos desde servicios externos ni mantiene estado.
 */
import type { CSSProperties } from "react";
const brands: Record<string, [string, string]> = {
  HTML: ["html5", "#e34f26"],
  CSS: ["css", "#663399"],
  JavaScript: ["javascript", "#b59a00"],
  React: ["react", "#087ea4"],
  "Node.js": ["nodedotjs", "#43853d"],
  Express: ["express", "#5e6876"],
  Vite: ["vite", "#8050d8"],
  MySQL: ["mysql", "#00758f"],
  Supabase: ["supabase", "#269866"],
  Git: ["git", "#f05032"],
  GitHub: ["github", "#596578"],
  Figma: ["figma", "#a259ff"],
  Canva: ["canva", "#00a6b5"],
  XAMPP: ["xampp", "#fb7a24"],
  "Linux básico": ["linux", "#dba900"],
  "Google Drive": ["googledrive", "#248652"],
};
const glyphs: Record<string, [string, string]> = {
  "C++": ["C++", "#00599c"],
  Java: ["J", "#5382a1"],
  Bootstrap: ["B", "#7952b3"],
  ChatGPT: ["GPT", "#10a37f"],
  Claude: ["AI", "#c15f3c"],
  CapCut: ["CC", "#111827"],
  "Microsoft Word": ["W", "#2b579a"],
  "Microsoft Excel": ["X", "#217346"],
  "Microsoft PowerPoint": ["P", "#d24726"],
  "Microsoft Outlook": ["O", "#0072c6"],
  "Microsoft OneNote": ["N", "#7719aa"],
  "Microsoft Teams": ["T", "#6264a7"],
  "Microsoft Access": ["A", "#a4373a"],
  "Google Docs": ["D", "#4285f4"],
  "Google Sheets": ["S", "#0f9d58"],
  "Google Slides": ["S", "#f4b400"],
  "Google Forms": ["F", "#673ab7"],
  Gmail: ["M", "#ea4335"],
  "Google Meet": ["M", "#00897b"],
  "Google Calendar": ["31", "#4285f4"],
};
// Recibe name/size y devuelve una máscara local o un dibujo SVG de respaldo.
export default function TechnologyIcon({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) {
  // Si hay marca conocida, usa el SVG público como máscara con su color; el resto pasa al dibujo alternativo.
  const brand = brands[name];
  if (brand)
    return (
      <span
        aria-hidden="true"
        className="technology-icon"
        style={
          {
            width: size,
            height: size,
            backgroundColor: brand[1],
            mask: `url(/technology-icons/${brand[0]}.svg) center / contain no-repeat`,
          } as CSSProperties
        }
      />
    );
  const glyph = glyphs[name];
  if (glyph)
    return (
      <svg
        className="technology-icon"
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 32 32"
      >
        <rect width="32" height="32" rx="6" fill={glyph[1]} />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill="white"
          fontSize={glyph[0].length > 2 ? "8" : "15"}
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
        >
          {glyph[0]}
        </text>
      </svg>
    );
  return (
    <svg
      className="technology-icon"
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {name === "LinkedIn" ? (
        <>
          <rect
            x="2"
            y="2"
            width="28"
            height="28"
            rx="3"
            fill="#0a66c2"
            stroke="none"
          />
          <path
            d="M9 13v11m6 0V13m0 5c0-7 8-7 8 0v6"
            stroke="white"
            strokeWidth="3"
          />
          <circle cx="9" cy="8" r="1.8" fill="white" stroke="none" />
        </>
      ) : name === "Visual Studio Code" ? (
        <path
          d="m23 2 7 3v22l-7 3L9 19l-5 4-3-2 7-5-7-5 3-2 5 4Zm0 7-10 7 10 7Z"
          fill="#168acb"
          stroke="none"
        />
      ) : name === "Windows" ? (
        <path
          d="M2 6 14 4v11H2Zm14-2 14-2v13H16ZM2 17h12v11L2 26Zm14 0h14v13l-14-2Z"
          fill="#1780cc"
          stroke="none"
        />
      ) : name === "SQL" ? (
        <g stroke="#427da2">
          <ellipse cx="16" cy="7" rx="11" ry="4" fill="#bce1ee" />
          <path d="M5 7v18c0 5 22 5 22 0V7M5 16c0 5 22 5 22 0" />
        </g>
      ) : /correo|email/i.test(name) ? (
        <g stroke="#3b6da7">
          <rect x="3" y="6" width="26" height="20" rx="2" fill="#e6effb" />
          <path d="m3 7 13 11L29 7M3 26l9-11m17 11-9-11" />
        </g>
      ) : /Word|Excel|PowerPoint|document/.test(name) ? (
        <>
          <path d="M9 2h15l5 5v23H9Z" fill="#edf3ff" stroke="#6b829b" />
          <path d="M23 2v7h6M17 14h8m-8 5h8m-8 5h8" stroke="#809cb4" />
          <rect
            x="2"
            y="9"
            width="16"
            height="17"
            rx="1"
            fill={
              name.includes("Excel")
                ? "#217346"
                : name.includes("PowerPoint")
                  ? "#c34b2d"
                  : "#2257a4"
            }
            stroke="none"
          />
          <text
            x="10"
            y="22"
            textAnchor="middle"
            fill="white"
            stroke="none"
            fontSize="12"
            fontFamily="Arial"
            fontWeight="bold"
          >
            {name.includes("Excel")
              ? "X"
              : name.includes("PowerPoint")
                ? "P"
                : name.includes("Word")
                  ? "W"
                  : "↓"}
          </text>
        </>
      ) : /navegación/i.test(name) ? (
        <g stroke="#2679bb">
          <circle cx="16" cy="16" r="13" fill="#e0f3fb" />
          <ellipse cx="16" cy="16" rx="6" ry="13" />
          <path d="M3 16h26M6 8h20M6 24h20" />
        </g>
      ) : /Inteligencia/i.test(name) ? (
        <g stroke="#7b55b7">
          <rect x="7" y="7" width="18" height="18" rx="3" fill="#eee7fa" />
          <path d="M12 1v6m8-6v6M12 25v6m8-6v6M1 12h6m-6 8h6m18-8h6m-6 8h6" />
          <circle cx="16" cy="16" r="4" />
        </g>
      ) : (
        <g stroke="#50769b">
          <rect x="3" y="3" width="26" height="19" rx="2" fill="#cde7f7" />
          <path d="M11 29h10m-5-7v7M8 10l5 5 9-8" />
        </g>
      )}
    </svg>
  );
}
