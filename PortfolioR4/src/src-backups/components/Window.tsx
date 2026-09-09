import { useId, useState, type ReactNode } from "react";
import Icon from "./Icon";
export default function Window({
  title,
  icon,
  children,
  className = "",
  active = true,
  onClose,
  onMinimize,
  onFocus,
}: {
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
}) {
  const [maximized, setMaximized] = useState(false),
    heading = useId();
  return (
    <section
      id={`window-${icon}`}
      tabIndex={-1}
      aria-labelledby={heading}
      onPointerDown={onFocus}
      onFocus={onFocus}
      className={`xp-window ${className} ${active ? "active" : ""} ${maximized ? "maximized" : ""}`}
    >
      <header className="titlebar">
        <span id={heading}>
          <Icon name={icon} size={19} />
          {title}
        </span>
        <div className="window-actions">
          {onMinimize && (
            <button aria-label={`Minimizar ${title}`} onClick={onMinimize}>
              _
            </button>
          )}
          <button
            aria-label={`${maximized ? "Restaurar" : "Maximizar"} ${title}`}
            onClick={() => setMaximized((v) => !v)}
          >
            □
          </button>
          {onClose && (
            <button
              className="close"
              aria-label={`Cerrar ${title}`}
              onClick={onClose}
            >
              ×
            </button>
          )}
        </div>
      </header>
      <div className="window-body">{children}</div>
    </section>
  );
}
