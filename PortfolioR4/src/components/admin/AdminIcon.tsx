import { useId, type ReactNode } from "react";
import Icon from "../Icon";
import star from "../../assets/img/estrella-icon.ico";

// Iconos exclusivos del administrador: conservan los recursos originales y
// completan las categorías con pequeños dibujos biselados de estilo clásico.
export default function AdminIcon({
  name,
  size = 28,
}: {
  name: string;
  size?: number;
}) {
  const id = useId();
  const metal = `url(#${id}-metal)`;
  const blue = `url(#${id}-blue)`;
  const gold = `url(#${id}-gold)`;
  if (name === "projects") return <Icon name="projects" size={size} />;
  if (name === "soft_skills")
    return (
      <img className="xp-icon" src={star} width={size} height={size} alt="" />
    );

  const drawings: Record<string, ReactNode> = {
    profile: (
      <>
        <rect
          x="2"
          y="5"
          width="28"
          height="23"
          rx="2"
          fill={metal}
          stroke="#536783"
        />
        <path d="M3 6h26v5H3z" fill={blue} />
        <circle cx="10" cy="16" r="4" fill="#f3c79b" stroke="#ad7950" />
        <path d="M4 26v-3c0-5 12-5 12 0v3z" fill={blue} stroke="#536783" />
        <path d="M19 16h7m-7 4h7m-7 4h5" stroke="#647995" strokeWidth="1.5" />
        <path d="M7 14c0-5 7-5 7 0l-4-1z" fill="#97613d" />
      </>
    ),
    dashboard: (
      <>
        <path d="M12 23h8v4h5v3H7v-3h5z" fill={metal} stroke="#536783" />
        <rect
          x="3"
          y="3"
          width="26"
          height="21"
          rx="2"
          fill={metal}
          stroke="#536783"
        />
        <path d="M6 6h20v14H6z" fill={blue} stroke="#24446e" />
        <path d="m8 17 6-9h9" fill="none" stroke="#b8eaff" strokeWidth="2" />
        <path d="M23 22h3" stroke="#389844" />
      </>
    ),
    skills: (
      <>
        <path d="M11 11V7h10v4" fill="none" stroke="#5d6673" strokeWidth="3" />
        <rect
          x="3"
          y="11"
          width="26"
          height="18"
          rx="2"
          fill={gold}
          stroke="#865522"
        />
        <path d="M3 17h26M7 12v16M25 12v16" stroke="#9a6329" />
        <path
          d="m10 25 12-13c5 1 8-5 5-8l-3 4-3-2 2-4c-5-1-8 4-6 7L6 22z"
          fill={metal}
          stroke="#536783"
        />
        <circle cx="9" cy="22" r="1" fill="#536783" />
      </>
    ),
    experiences: (
      <>
        <path d="M11 10V5h10v5" fill="none" stroke="#76451e" strokeWidth="3" />
        <rect
          x="3"
          y="10"
          width="26"
          height="19"
          rx="2"
          fill={gold}
          stroke="#784921"
        />
        <path d="M4 11h24v9H4z" fill="#ba7935" stroke="#784921" />
        <path d="M6 12h20" stroke="#ffe0a0" />
        <rect
          x="14"
          y="17"
          width="4"
          height="6"
          rx="1"
          fill={metal}
          stroke="#784921"
        />
      </>
    ),
    education: (
      <>
        <path d="m5 5 19-2 4 3v22L8 30l-3-3z" fill={blue} stroke="#24446e" />
        <path d="m9 7 16-2v21L9 28z" fill="#fff9df" stroke="#78849b" />
        <path d="M5 6v20l4 2V7z" fill="#326ec1" />
        <path d="m12 11 10-1m-10 5 10-1m-10 5 7-1" stroke="#858d9a" />
        <path d="m20 23 4-1v8l-2-2-2 2z" fill="#df4a35" stroke="#9f3526" />
      </>
    ),
    social_links: (
      <>
        <circle cx="16" cy="16" r="13" fill={blue} stroke="#234c84" />
        <path
          d="m7 7 6-2 2 4-4 4-5-1-2 4 4 3 5-1 3 4-3 6m8-23-2 6 6 3 3-1-1 7-5 4-3-5 1-5"
          fill="#75bf58"
          stroke="#438746"
        />
        <ellipse
          cx="16"
          cy="16"
          rx="6"
          ry="13"
          fill="none"
          stroke="#dcf4ff"
          opacity=".5"
        />
        <path d="M4 12h24M4 21h24" stroke="#dcf4ff" opacity=".5" />
      </>
    ),
    messages: (
      <>
        <rect
          x="3"
          y="7"
          width="26"
          height="20"
          rx="1"
          fill={gold}
          stroke="#9a742b"
        />
        <path d="m4 25 10-10h4l10 10" fill="#fff3c2" stroke="#b89a51" />
        <path d="m4 8 12 11L28 8" fill="#fffbe7" stroke="#b89a51" />
        <path d="M5 6h22" stroke="#fff" />
      </>
    ),
    settings: (
      <>
        <path
          d="m13 3 6 0 1 5 4-2 4 4-2 4 4 1v6l-5 1 2 4-5 3-3-3-2 4-6-1v-5l-4 1-3-5 4-3-4-3 3-5 4 1z"
          fill={metal}
          stroke="#536783"
        />
        <circle cx="16" cy="17" r="7" fill={blue} stroke="#536783" />
        <circle cx="16" cy="17" r="3" fill="#e8f3ff" stroke="#536783" />
      </>
    ),
    logout: (
      <>
        <rect
          x="4"
          y="3"
          width="24"
          height="26"
          rx="4"
          fill="#c93e28"
          stroke="#87251e"
        />
        <path d="M7 6h18v8H7z" fill="#f68665" />
        <path
          d="M16 7v10m-5-6a8 8 0 1 0 10 0"
          fill="none"
          stroke="#fff8ec"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ),
  };
  return (
    <svg
      className="xp-icon"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-metal`} x2=".8" y2="1">
          <stop stopColor="#fff" />
          <stop offset=".45" stopColor="#d5e1ee" />
          <stop offset="1" stopColor="#8196af" />
        </linearGradient>
        <linearGradient id={`${id}-blue`} x2=".8" y2="1">
          <stop stopColor="#b4edff" />
          <stop offset=".4" stopColor="#4aa4e9" />
          <stop offset="1" stopColor="#2255b4" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x2=".5" y2="1">
          <stop stopColor="#fff3bb" />
          <stop offset=".5" stopColor="#edc56c" />
          <stop offset="1" stopColor="#bb802f" />
        </linearGradient>
      </defs>
      {drawings[name] || drawings.dashboard}
    </svg>
  );
}
