import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu, Moon, Sun, X, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { cn } from "../../utils/cn";

interface DashboardLayoutProps {
  workspaceNote?: string;
  title: string;
  workspace: string;
  userName: string;
  roleLabel: string;
  initials: string;
  navigation: { label: string; to: string; icon: LucideIcon }[];
  onSignOut: () => void;
  children: ReactNode;
}

/** Shared dashboard shell, using the Finance and M&E workspace dimensions. */
export function DashboardLayout({ workspaceNote = "Read-only monitoring · Demo", title, workspace, userName, roleLabel, initials, navigation, onSignOut, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (mobileOpen) dialog?.showModal();
    else dialog?.close();
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  const sidebar = (compact: boolean) => <div className="flex h-full flex-col">
    <div className={cn("flex h-20 shrink-0 items-center border-b border-[var(--border)]", compact ? "justify-center px-3" : "px-5")}>
      <Link to="/" aria-label="Pantiss home" className="focus-ring flex items-center gap-3 rounded-xl">
        <img src="/pantiss-mark.png" alt="" className="size-10 shrink-0 rounded-xl object-contain" />
        {!compact && <span><span className="block text-sm font-semibold text-[var(--text)]">Pantiss ERP</span><span className="block text-[10px] text-[var(--text-muted)]">{workspace}</span></span>}
      </Link>
    </div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label={workspace}>
      {!compact && <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Workspace</p>}
      {navigation.map(({ label, to, icon: Icon }) => {
        const active = `${location.pathname}${location.hash}` === to;
        return <Link key={to} to={to} onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} aria-label={compact ? label : undefined} title={compact ? label : undefined}
          className={cn("focus-ring flex min-h-11 items-center rounded-xl text-xs transition-colors", compact ? "justify-center" : "gap-3 px-3", active ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-primary)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]")}>
          <Icon size={18} className="shrink-0" />{!compact && label}
        </Link>;
      })}
    </nav>
    {!compact && <div className="mx-3 mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3"><p className="text-xs font-semibold text-[var(--text)]">{userName}</p><p className="mt-1 text-[10px] text-[var(--brand-primary)]">{roleLabel}</p><p className="mt-2 text-[10px] text-[var(--text-muted)]">{workspaceNote}</p></div>}
    <div className="border-t border-[var(--border)] p-3"><button type="button" onClick={onSignOut} aria-label={compact ? "Sign out" : undefined} title={compact ? "Sign out" : undefined} className={cn("focus-ring flex min-h-11 w-full items-center rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]", compact ? "justify-center" : "gap-3 px-3")}><LogOut size={17} />{!compact && "Sign out"}</button></div>
  </div>;

  return <div className="min-h-screen bg-[var(--background)]">
    <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen} className="focus-ring fixed left-4 top-4 z-40 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text)] lg:hidden"><Menu size={19} /></button>
    <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-[var(--module-bg)] transition-[width] duration-300 motion-reduce:transition-none lg:block", collapsed ? "w-[80px]" : "w-[260px]")}>
      {sidebar(collapsed)}
      <button type="button" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} className="focus-ring absolute -right-3 top-24 grid size-7 place-items-center rounded-full border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text-muted)] shadow-md">{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>
    </aside>
    <dialog ref={dialogRef} onClose={() => setMobileOpen(false)} onClick={event => { if (event.target === event.currentTarget) setMobileOpen(false); }} aria-label={`${workspace} navigation`} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(300px,90vw)] max-w-none border-0 bg-[var(--module-bg)] p-0 text-[var(--text)] backdrop:bg-[var(--visual-muted)] backdrop:backdrop-blur-sm">
      <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" className="focus-ring absolute right-2 top-6 grid size-8 place-items-center rounded-lg bg-[var(--module-bg)]"><X size={17} /></button>
      {mobileOpen && sidebar(false)}
    </dialog>
    <div className={cn("min-h-screen transition-[padding] duration-300 motion-reduce:transition-none", collapsed ? "lg:pl-[80px]" : "lg:pl-[260px]")}>
      <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/88 px-4 backdrop-blur-2xl sm:px-7 lg:px-8">
        <div className="min-w-0 pl-12 lg:pl-0"><p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">{workspace}</p><h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-xl">{title}</h1></div>
        <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={toggleTheme} aria-label={`Switch to ${isDark ? "light" : "dark"} theme`} className="focus-ring grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">{isDark ? <Sun size={17} /> : <Moon size={17} />}</button><span title={roleLabel} className="grid size-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[10px] font-semibold text-[var(--brand-primary)]">{initials}</span></div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
