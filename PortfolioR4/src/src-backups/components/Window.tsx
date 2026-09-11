/*
 * COPIA HISTÓRICA: src/src-backups/components/Window.tsx
 * No se importa desde src/main.tsx y está excluida de TypeScript y ESLint.
 * Los comentarios describen esta copia; no implica que sus pantallas/rutas existan en la versión activa.
 */
/*
 * Archivo: src/src-backups/components/Window.tsx
 * Propósito:
 * Contenedor visual XP reutilizable. Recibe title, icon y children; className personaliza su aspecto.
 * active, zIndex y hidden vienen del padre; onFocus, onClose y onMinimize notifican acciones al padre.
 * Gestiona maximización, arrastre y animaciones de salida en estado local; no consulta datos.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Icon from "./Icon";
// Recibe contenido, identidad, estado visual y callbacks; devuelve el marco y la barra de una ventana XP.
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
  // maximized controla tamaño completo y heading enlaza el título con aria-labelledby.
  const [maximized, setMaximized] = useState(false),
    heading = useId();
  // element apunta a la ventana; drag conserva puntero y desplazamiento; timer permite cancelar la salida pendiente.
  const element = useRef<HTMLElement>(null);
  const drag = useRef<{ pointer: number; x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // position conserva coordenadas de arrastre; null deja la ubicación inicial a CSS.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  // leaving elige la clase de animación de cerrar o minimizar; vacío significa sin salida pendiente.
  const [leaving, setLeaving] = useState("");
  // Registra limpieza al desmontar para cancelar el temporizador de salida y no ejecutar callbacks tardíos.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  // Recibe clase de animación y callback; espera su duración antes de notificar cerrar/minimizar.
  // Con movimiento reducido ejecuta sin demora; evita iniciar otra salida si ya hay una en curso.
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
          // Inicia el arrastre sólo desde la barra y en escritorio; recuerda dónde se agarró la ventana.
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
          // Limita las coordenadas al espacio del padre para que el arrastre no saque la ventana del escritorio.
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
