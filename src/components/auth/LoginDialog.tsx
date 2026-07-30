import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { motion } from "framer-motion";
import type { ModuleItem } from "../../types/modules";
import { IconButton } from "../ui/IconButton";

interface LoginDialogProps {
  module: ModuleItem;
  onClose: () => void;
}

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function LoginDialog({ module, onClose }: LoginDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const Icon = module.icon;

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/60 px-4 py-8 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-[var(--module-bg)] shadow-[0_32px_100px_rgba(0,0,0,.35)]"
      >
        <div
          className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${module.accent} opacity-[0.11] blur-3xl`}
          aria-hidden
        />
        <div className="grid-pattern absolute inset-0 opacity-[0.08] [mask-image:linear-gradient(to_bottom,black,transparent_46%)]" aria-hidden />

        <div className="relative p-6 sm:p-8">
          <div className="mb-7 flex items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${module.accent} text-white shadow-lg shadow-black/10`}>
                <Icon size={22} strokeWidth={1.7} />
              </span>
              <div>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
                  Secure access
                </p>
                <h2 id={titleId} className="text-xl font-semibold tracking-[-0.035em] text-[var(--text)]">
                  Sign in to {module.title}
                </h2>
              </div>
            </div>
            <IconButton label="Close login" onClick={onClose} className="size-9 shrink-0">
              <X size={17} />
            </IconButton>
          </div>

          <p id={descriptionId} className="mb-6 text-sm leading-6 text-[var(--text-muted)]">
            Use your Pantiss account to continue to this Core Operations module.
          </p>

          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[var(--text)]">Work email</span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                autoComplete="username"
                required
                placeholder="name@pantiss.org"
                className="focus-ring h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-ghost)] hover:border-[var(--text-subtle)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[var(--text)]">Password</span>
              <span className="relative block">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="focus-ring h-12 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-soft)] px-4 pr-12 text-sm text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-ghost)] hover:border-[var(--text-subtle)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="focus-ring absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--text-subtle)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <div className="flex items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-2 text-[var(--text-muted)]">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-4 rounded border-[var(--border-strong)] accent-blue-500"
                />
                Keep me signed in
              </label>
              <button type="button" className="focus-ring rounded-md font-medium text-blue-400 hover:text-blue-300">
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              className={`focus-ring mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${module.accent} px-5 text-sm font-semibold text-white shadow-lg shadow-black/10`}
            >
              <LockKeyhole size={16} strokeWidth={1.8} />
              Sign in securely
            </motion.button>
          </form>

          <p className="mt-5 text-center text-[10px] leading-4 text-[var(--text-subtle)]">
            Access is restricted to authorized Pantiss team members.
          </p>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
