import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, Eye, EyeOff, WandSparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import type { ModuleItem } from "../../types/modules";
import { demoAccounts, type AuthUser } from "../../app/auth-context";
import { useAuth } from "../../hooks/useAuth";

interface LoginDialogProps {
  module: ModuleItem;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
}

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function LoginDialog({ module, onClose, onSuccess }: LoginDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, logout } = useAuth();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const Icon = module.icon;
  const moduleDemoAccount = demoAccounts.find((account) => account.moduleId === module.id);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    window.setTimeout(() => {
      const authenticatedUser = login(userId, password, remember);
      setSubmitting(false);
      if (!authenticatedUser) {
        setError("The user ID or password is incorrect. Contact your administrator if you need access.");
        return;
      }
      if (authenticatedUser.moduleId !== module.id) {
        logout();
        setError(`This account is assigned to ${authenticatedUser.roleLabel} access and cannot open ${module.title}.`);
        return;
      }
      onSuccess?.(authenticatedUser);
    }, 450);
  };

  const fillModuleCredentials = () => {
    if (!moduleDemoAccount) return;
    setUserId(moduleDemoAccount.id);
    setPassword(moduleDemoAccount.password);
    setError("");
    setShowPassword(false);
    emailRef.current?.focus();
  };

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
      className="zoho-login-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Video background */}
      <div className="zoho-login-bg" aria-hidden>
        <video
          className="zoho-login-video"
          autoPlay
          loop
          muted
          playsInline
          src="/bg.mp4"
        />
        <div className="zoho-login-video-overlay" />
      </div>

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="zoho-login-card"
      >
        {/* ─── Close button (top-right) ─── */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close login"
          className="zoho-login-close"
        >
          <X size={18} />
        </button>

        {/* ═══════════════════════════════════════════ */}
        {/*  LEFT PANEL — Login Form                    */}
        {/* ═══════════════════════════════════════════ */}
        <div className="zoho-login-form-panel">
          {/* Brand logo */}
          <div className="zoho-login-brand">
            <img
              src="/pantiss-logo.png"
              alt="Pantiss — Group of Non-Profits"
              className="zoho-login-brand-logo"
              draggable={false}
            />
          </div>

          {/* Heading */}
          <h2 id={titleId} className="zoho-login-heading">Sign in</h2>
          <p id={descriptionId} className="zoho-login-subheading">
            to access <strong>{module.title}</strong>
          </p>

          {moduleDemoAccount && (
            <button
              type="button"
              onClick={fillModuleCredentials}
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-500/[0.12] dark:text-red-400"
            >
              <WandSparkles size={14} />
              Autofill {moduleDemoAccount.roleLabel} demo credentials
            </button>
          )}

          {/* Form */}
          <form className="zoho-login-form" onSubmit={handleSubmit}>
            <div className="zoho-field-group">
              <label htmlFor="zoho-email" className="zoho-field-label">
                User ID
              </label>
              <input
                ref={emailRef}
                id="zoho-email"
                type="text"
                name="userId"
                autoComplete="username"
                required
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Enter your Pantiss user ID"
                className="zoho-field-input"
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="zoho-field-group">
              <label htmlFor="zoho-password" className="zoho-field-label">
                Password
              </label>
              <div className="zoho-password-wrapper">
                <input
                  id="zoho-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="zoho-field-input"
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="zoho-password-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="zoho-remember-row">
              <label className="zoho-remember-label">
                <input type="checkbox" name="remember" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="zoho-checkbox" />
                Remember me
              </label>
              <button type="button" className="zoho-forgot-link">
                Forgot password?
              </button>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5 text-[11px] leading-4 text-red-600 dark:text-red-400">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="zoho-login-submit"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="zoho-login-footer">Access is limited to authorized Pantiss roles.</p>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*  RIGHT PANEL — Promo / Branding             */}
        {/* ═══════════════════════════════════════════ */}
        <div className="zoho-login-promo-panel">
          <div className="zoho-promo-content">
            {/* Module icon hero */}
            <div className="zoho-promo-illustration">
              <div className={`zoho-promo-icon-ring bg-gradient-to-br ${module.accent}`}>
                <Icon size={40} strokeWidth={1.3} color="white" />
              </div>
              <div className="zoho-promo-orbit zoho-promo-orbit--1" />
              <div className="zoho-promo-orbit zoho-promo-orbit--2" />
            </div>

            <h3 className="zoho-promo-title">{module.title}</h3>
            <p className="zoho-promo-description">{module.description}</p>

            <button type="button" className="zoho-promo-cta">
              Learn more
            </button>

            {/* Slide dots */}
            <div className="zoho-promo-dots" aria-hidden>
              <span className="zoho-promo-dot zoho-promo-dot--active" />
              <span className="zoho-promo-dot" />
              <span className="zoho-promo-dot" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
