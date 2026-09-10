import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Icon from "./Icon";
export default function Window({
  title,
  icon,
  children,
  className = "",
  active = true,
  zIndex,
  hidden = false,
  onClose,
  onMinimize,
  onFocus,
}: {
  title: string;
  icon: string;
  children: ReactNode;
  className?: string;
  active?: boolean;
  zIndex?: number;
  hidden?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
}) {
  const [maximized, setMaximized] = useState(false),
    heading = useId();
  const element = useRef<HTMLElement>(null);
  const drag = useRef<{ pointer: number; x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [leaving, setLeaving] = useState("");
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function leave(kind: string, action?: () => void) {
    if (leaving) return;
    setLeaving(kind);
    timer.current = setTimeout(
      () => {
        setLeaving("");
        action?.();
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 160,
    );
  }
  return (
    <section
      ref={element}
      id={`window-${icon}`}
      tabIndex={-1}
      hidden={hidden}
      style={
        {
          zIndex,
          ...(position
            ? { "--drag-x": `${position.x}px`, "--drag-y": `${position.y}px` }
            : {}),
        } as CSSProperties
      }
      aria-labelledby={heading}
      onPointerDown={onFocus}
      onFocus={onFocus}
      className={`xp-window ${className} ${position ? "moved" : ""} ${leaving} ${active ? "active" : ""} ${maximized ? "maximized" : ""}`}
    >
      <header
        className="titlebar"
        onPointerDown={(e) => {
          if (
            maximized ||
            e.button !== 0 ||
            (e.target as HTMLElement).closest("button") ||
            window.matchMedia("(max-width: 900px)").matches
          )
            return;
          const rect = element.current!.getBoundingClientRect();
          drag.current = {
            pointer: e.pointerId,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (!drag.current || drag.current.pointer !== e.pointerId) return;
          const node = element.current!;
          const bounds = node.parentElement!.getBoundingClientRect();
          setPosition({
            x: Math.max(
              0,
              Math.min(
                e.clientX - bounds.left - drag.current.x,
                bounds.width - node.offsetWidth,
              ),
            ),
            y: Math.max(
              0,
              Math.min(
                e.clientY - bounds.top - drag.current.y,
                bounds.height - node.offsetHeight,
              ),
            ),
          });
        }}
        onPointerUp={(e) => {
          drag.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <span id={heading}>
          <Icon name={icon} size={19} />
          {title}
        </span>
        <div className="window-actions">
          {onMinimize && (
            <button
              aria-label={`Minimizar ${title}`}
              onClick={() => leave("minimizing", onMinimize)}
            >
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
              onClick={() => leave("closing", onClose)}
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
