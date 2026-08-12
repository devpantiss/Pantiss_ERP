import { useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BadgeIndianRupee, Bell, CheckCheck, ChevronLeft, ChevronRight, CircleDollarSign, LayoutDashboard, LogOut, Menu, Moon, Search, Sun, WalletCards, X } from "lucide-react";
import { FinanceDashboard } from "../features/finance/FinanceDashboard";
import { FinanceOperationsView, type FinanceOperationsSection } from "../features/finance/FinanceOperationsViews";
import { financeAreas } from "../features/finance/data";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

const operationsSections: FinanceOperationsSection[] = ["budgets", "approvals", "payments"];

export default function FinancePage() {
  const { areaId } = useParams();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || user.moduleId !== "finance") return <Navigate to="/modules/core-operations" replace />;
  const isOperationsSection = operationsSections.includes(areaId as FinanceOperationsSection);
  if (areaId && areaId !== "dashboard" && !isOperationsSection && !financeAreas.some((area) => area.id === areaId)) return <Navigate to="/finance/dashboard" replace />;

  const activeArea = financeAreas.find((area) => area.id === areaId);
  const activeOperationsSection = isOperationsSection ? areaId as FinanceOperationsSection : undefined;
  const closeMobileAndNavigate = (to: string) => { navigate(to); setMobileOpen(false); };
  const signOut = () => { logout(); navigate("/modules/core-operations", { replace: true }); };
  const pageTitle = activeArea
    ? `${activeArea.name} finances`
    : activeOperationsSection === "budgets" ? "Budgets"
      : activeOperationsSection === "approvals" ? "Approvals"
        : activeOperationsSection === "payments" ? "Payments" : "Overall finance dashboard";

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-20 items-center border-b border-[var(--border)]", collapsed ? "justify-center px-3" : "px-5")}>
        <button type="button" onClick={() => navigate("/")} className="focus-ring flex items-center gap-3 rounded-xl">
          <img src="/pantiss-mark.png" alt="" className="size-10 rounded-xl object-contain" />
          {!collapsed && <span className="text-left"><span className="block text-sm font-semibold text-[var(--text)]">Pantiss ERP</span><span className="block text-[10px] text-[var(--text-subtle)]">Finance Division</span></span>}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Finance workspace">
        <p className={cn("mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]", collapsed && "sr-only")}>Finance workspace</p>
        <NavButton collapsed={collapsed} active={!activeArea && !activeOperationsSection} icon={<LayoutDashboard size={18} />} label="Overall finances" onClick={() => closeMobileAndNavigate("/finance/dashboard")} />
        <NavButton collapsed={collapsed} active={activeOperationsSection === "budgets"} icon={<WalletCards size={18} />} label="Budgets" onClick={() => closeMobileAndNavigate("/finance/budgets")} />
        <NavButton collapsed={collapsed} active={activeOperationsSection === "approvals"} icon={<CheckCheck size={18} />} label="Approvals" onClick={() => closeMobileAndNavigate("/finance/approvals")} />
        <NavButton collapsed={collapsed} active={activeOperationsSection === "payments"} icon={<BadgeIndianRupee size={18} />} label="Payments" onClick={() => closeMobileAndNavigate("/finance/payments")} />
      </nav>
      {!collapsed && <div className="mx-3 mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3"><p className="truncate text-[10px] font-semibold text-[var(--text)]">{user.name}</p><p className="mt-1 text-[9px] text-emerald-600 dark:text-emerald-400">{user.roleLabel}</p></div>}
      <div className="border-t border-[var(--border)] p-3"><button type="button" onClick={signOut} className={cn("focus-ring flex h-11 w-full items-center rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--surface-soft)]", collapsed ? "justify-center" : "gap-3 px-3")}><LogOut size={18} />{!collapsed && "Sign out"}</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <button type="button" onClick={() => setMobileOpen(true)} className="focus-ring fixed left-4 top-4 z-40 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text)] shadow-lg lg:hidden" aria-label="Open finance navigation"><Menu size={19} /></button>
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-[var(--module-bg)] transition-[width] duration-300 lg:block", collapsed ? "w-[84px]" : "w-[248px]")}>{sidebar}<button type="button" onClick={() => setCollapsed((value) => !value)} className="focus-ring absolute -right-3 top-24 grid size-7 place-items-center rounded-full border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text-muted)] shadow-md" aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button></aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm lg:hidden" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><aside className="h-full w-[280px] bg-[var(--module-bg)] shadow-2xl"><button type="button" onClick={() => setMobileOpen(false)} className="absolute left-[230px] top-5 grid size-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)]"><X size={17} /></button>{sidebar}</aside></div>}
      <div className={cn("min-h-screen transition-[padding] duration-300", collapsed ? "lg:pl-[84px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/88 px-4 backdrop-blur-2xl sm:px-7 lg:px-8">
          <div className="min-w-0 pl-12 lg:pl-0"><p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Finance division · FY 2026–27</p><h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-xl">{pageTitle}</h1></div>
          <div className="flex items-center gap-2"><label className="relative hidden md:block"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /><input type="search" placeholder="Search financial records" className="focus-ring h-10 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none" /></label><button type="button" onClick={toggleTheme} className="focus-ring grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]" aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}>{isDark ? <Sun size={17} /> : <Moon size={17} />}</button><button type="button" className="focus-ring relative grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]" aria-label="Finance alerts"><Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500 ring-2 ring-[var(--background)]" /></button><span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-400 text-white"><CircleDollarSign size={18} /></span></div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">{activeOperationsSection ? <FinanceOperationsView section={activeOperationsSection} /> : <FinanceDashboard areaId={areaId === "dashboard" ? undefined : areaId} />}</main>
      </div>
    </div>
  );
}

function NavButton({ collapsed, active, icon, label, onClick }: { collapsed: boolean; active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} title={collapsed ? label : undefined} className={cn("focus-ring flex h-11 w-full items-center rounded-xl text-sm transition-colors", collapsed ? "justify-center" : "gap-3 px-3", active ? "bg-emerald-500/10 font-medium text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]")}>{icon}{!collapsed && label}</button>;
}
