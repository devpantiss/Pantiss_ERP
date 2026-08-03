import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileBarChart,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";
import type { MESection } from "../../app/auth-context";

const navigation: Array<{ section: MESection; to: string; label: string; shortLabel?: string; icon: typeof BarChart3 }> = [
  { section: "dashboard", to: "/monitoring-evaluation/dashboard", label: "Dashboard", icon: BarChart3 },
  { section: "projects", to: "/monitoring-evaluation/projects", label: "Projects", icon: BriefcaseBusiness },
  { section: "reports", to: "/monitoring-evaluation/reports", label: "Reports", icon: FileBarChart },
  { section: "employee-status", to: "/monitoring-evaluation/employee-status", label: "Employee monthly status", shortLabel: "Employee status", icon: ClipboardCheck },
];

interface WorkspaceSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: () => void;
  onMobileOpen: () => void;
  onMobileClose: () => void;
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const permittedNavigation = navigation.filter((item) => user?.allowedSections.includes(item.section));
  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate("/modules/core-operations", { replace: true });
  };

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-20 items-center border-b border-[var(--border)]", collapsed ? "justify-center px-3" : "px-5")}>
        <Link to="/" className="focus-ring flex items-center gap-3 rounded-xl" aria-label="Pantiss home">
          <img src="/pantiss-mark.png" alt="" className="size-10 shrink-0 rounded-xl object-contain" />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block text-sm font-semibold tracking-[-0.02em] text-[var(--text)]">Pantiss ERP</span>
              <span className="block truncate text-[10px] text-[var(--text-subtle)]">Monitoring & Evaluation</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5" aria-label="Monitoring and evaluation">
        {!collapsed && <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">Workspace</p>}
        {permittedNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              aria-label={collapsed ? item.label : undefined}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "focus-ring group relative flex h-11 items-center rounded-xl text-sm transition-colors",
                collapsed ? "justify-center px-2" : "gap-3 px-3",
                isActive
                  ? "bg-red-500/10 font-medium text-red-600 dark:text-red-400"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]",
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.span layoutId="me-active-nav" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-red-500" />}
                  <Icon size={18} strokeWidth={1.7} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.shortLabel ?? item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && user && (
        <div className="mx-3 mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
          <p className="truncate text-[10px] font-semibold text-[var(--text)]">{user.name}</p>
          <p className="mt-1 text-[9px] text-red-500">{user.roleLabel}</p>
        </div>
      )}

      <div className="border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className={cn("focus-ring flex h-11 items-center rounded-xl text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]", collapsed ? "justify-center" : "gap-3 px-3")}
          title={collapsed ? "Exit workspace" : undefined}
        >
          <LogOut size={18} strokeWidth={1.7} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  );
}

export function WorkspaceSidebar({ collapsed, mobileOpen, onCollapse, onMobileOpen, onMobileClose }: WorkspaceSidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onMobileOpen}
        className="focus-ring fixed left-4 top-4 z-40 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text)] shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--border)] bg-[var(--module-bg)]/95 backdrop-blur-2xl transition-[width] duration-300 lg:block",
          collapsed ? "w-[84px]" : "w-[248px]",
        )}
      >
        <SidebarContent collapsed={collapsed} />
        <button
          type="button"
          onClick={onCollapse}
          className="focus-ring absolute -right-3 top-24 grid size-7 place-items-center rounded-full border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text-subtle)] shadow-md transition-colors hover:text-[var(--text)]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[60] w-[280px] border-r border-[var(--border)] bg-[var(--module-bg)] shadow-2xl lg:hidden"
            >
              <button type="button" onClick={onMobileClose} className="focus-ring absolute right-3 top-5 z-10 grid size-9 place-items-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--surface-soft)]" aria-label="Close navigation">
                <X size={18} />
              </button>
              <SidebarContent collapsed={false} onNavigate={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
