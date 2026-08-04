import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OverlayVariant = "panel" | "modal" | "fullscreen";
type OverlaySize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface OverlayProps {
  /** Controls open/close state — drives AnimatePresence. */
  open: boolean;
  /** Called when the overlay should close (Escape, backdrop click, close btn). */
  onClose: () => void;
  /** Overlay presentation style. */
  variant?: OverlayVariant;
  /** Max-width token — translates to CSS class. Defaults by variant. */
  size?: OverlaySize;
  /** Overlay title shown in the sticky header. */
  title?: string;
  /** Small label rendered above the title (e.g. category tag). */
  label?: string;
  /** Color accent for the label text. */
  labelColor?: string;
  /** Optional description below the title. */
  description?: string;
  /** Extra elements rendered inside the header (right side). */
  headerActions?: ReactNode;
  /** If true, hides the default close (X) button. */
  hideCloseButton?: boolean;
  /** Content rendered below the header. */
  children: ReactNode;
  /** Optional footer pinned to the bottom (sticky). */
  footer?: ReactNode;
  /** z-index layer — use higher values for stacked overlays. */
  zIndex?: number;
  /** aria-labelledby override (auto-generated if omitted). */
  ariaLabelledBy?: string;
}

/* ------------------------------------------------------------------ */
/*  Focusable selector                                                 */
/* ------------------------------------------------------------------ */

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ */
/*  Size map                                                           */
/* ------------------------------------------------------------------ */

const sizeClass: Record<OverlaySize, string> = {
  sm: "zo-overlay--sm",
  md: "zo-overlay--md",
  lg: "zo-overlay--lg",
  xl: "zo-overlay--xl",
  "2xl": "zo-overlay--2xl",
  full: "zo-overlay--full",
};

const defaultSize: Record<OverlayVariant, OverlaySize> = {
  panel: "lg",
  modal: "lg",
  fullscreen: "full",
};

/* ------------------------------------------------------------------ */
/*  Animation presets                                                   */
/* ------------------------------------------------------------------ */

const panelMotion = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring" as const, stiffness: 340, damping: 34 },
};

const modalMotion = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring" as const, stiffness: 340, damping: 34 },
};

const fullscreenMotion = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "spring" as const, stiffness: 340, damping: 34 },
};

const motionPreset = {
  panel: panelMotion,
  modal: modalMotion,
  fullscreen: fullscreenMotion,
};

const backdropMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.22 },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Overlay({
  open,
  onClose,
  variant = "modal",
  size,
  title,
  label,
  labelColor,
  description,
  headerActions,
  hideCloseButton = false,
  children,
  footer,
  zIndex = 60,
  ariaLabelledBy,
}: OverlayProps) {
  const autoTitleId = useId();
  const titleId = ariaLabelledBy ?? autoTitleId;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const resolvedSize = size ?? defaultSize[variant];
  const motion_ = motionPreset[variant];

  /* ── Body scroll lock ── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ── Keyboard: Escape + Focus trap ── */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !surfaceRef.current) return;
      const els = Array.from(
        surfaceRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  /* ── Auto-focus surface on open ── */
  useEffect(() => {
    if (!open || !surfaceRef.current) return;
    const firstFocusable = surfaceRef.current.querySelector<HTMLElement>(FOCUSABLE);
    if (firstFocusable) firstFocusable.focus();
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="zo-backdrop"
          style={{ zIndex }}
          data-variant={variant}
          {...backdropMotion}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={surfaceRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`zo-surface zo-surface--${variant} ${sizeClass[resolvedSize]}`}
            {...motion_}
          >
            {/* ── Header ── */}
            {(title || !hideCloseButton || headerActions) && (
              <header className="zo-header">
                <div className="zo-header__text">
                  {label && (
                    <p
                      className="zo-header__label"
                      style={labelColor ? { color: labelColor } : undefined}
                    >
                      {label}
                    </p>
                  )}
                  {title && (
                    <h2 id={titleId} className="zo-header__title">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="zo-header__description">{description}</p>
                  )}
                </div>
                <div className="zo-header__actions">
                  {headerActions}
                  {!hideCloseButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="zo-close focus-ring"
                      aria-label="Close"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </header>
            )}

            {/* ── Body ── */}
            <div className="zo-body">{children}</div>

            {/* ── Footer ── */}
            {footer && <footer className="zo-footer">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
