import { ArrowLeft, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Brand } from "./Brand";
import { IconButton } from "../ui/IconButton";
import { useTheme } from "../../hooks/useTheme";

export function TopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const canGoBack = location.pathname !== "/";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-40 px-5 pt-4 sm:px-8"
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-12 max-w-[1120px] items-center justify-between border-b border-[var(--border)] bg-[var(--nav-bg)] px-1"
      >
        <div className="flex min-w-0 items-center gap-3">
          {canGoBack && (
            <>
              <IconButton label="Back to workspaces" onClick={() => navigate("/")}>
                <ArrowLeft size={17} strokeWidth={1.8} />
              </IconButton>
              <span className="hidden h-5 w-px bg-[var(--border)] sm:block" />
            </>
          )}
          <Brand compact={canGoBack} />
          {canGoBack && (
            <span className="hidden text-xs font-medium text-[var(--text-subtle)] sm:inline">
              / Workspace
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <IconButton
            label={`Switch to ${isDark ? "light" : "dark"} theme`}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </IconButton>
          <button
            className="focus-ring group ml-1 flex items-center rounded-xl p-1 transition-colors hover:bg-[var(--surface-soft)]"
            aria-label="Open user profile"
          >
            <span className="grid size-8 place-items-center rounded-[10px] bg-gradient-to-br from-violet-500 to-blue-500 text-[10px] font-semibold text-white shadow-lg shadow-blue-500/10">
              AK
            </span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
