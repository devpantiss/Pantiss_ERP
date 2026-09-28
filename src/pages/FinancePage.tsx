import { useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BadgeIndianRupee,
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Coins,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { FinanceDashboard } from "../features/finance/FinanceDashboard";
import {
  BudgetsView,
  PaymentsView,
  ProcurementApprovalsView,
  CombinedApprovalsView
} from "../features/finance/FinanceOperationsViews";
import { BankingView } from "../features/finance/BankingView";
import { VendorManagementView } from "../features/finance/VendorManagementView";
import { SalaryView } from "../features/finance/SalaryView";
import { ReimbursementView } from "../features/finance/ReimbursementView";
import { TaxationView } from "../features/finance/TaxationView";
import { AuditTrailsView } from "../features/finance/AuditTrailsView";
import { ProjectsView } from "../features/finance/ProjectsView";
import { InvestmentsView } from "../features/finance/InvestmentsView";
import { AlertsView } from "../features/finance/AlertsView";
import { financeAreas } from "../features/finance/data";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

const validSections = [
  "dashboard",
  "budget",
  "budgets",
  "banking",
  "investments",
  "investment",
  "vendor-management",
  "vendors",
  "procurement",
  "salary",
  "reimbursement",
  "payments",
  "taxation",
  "audit-trails",
  "audit",
  "projects",
  "approvals",
  "alerts"
];

export default function FinancePage() {
  const { areaId } = useParams();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || user.moduleId !== "finance") return <Navigate to="/modules/core-operations" replace />;

  const isValidSection = areaId ? validSections.includes(areaId) : true;
  const isFinanceArea = areaId ? financeAreas.some((area) => area.id === areaId) : false;

  if (areaId && !isValidSection && !isFinanceArea) {
    return <Navigate to="/finance/dashboard" replace />;
  }

  const activeArea = isFinanceArea ? financeAreas.find((area) => area.id === areaId) : undefined;
  
  // Normalized section name
  const section = areaId === "budgets"
    ? "budget"
    : areaId === "vendors"
    ? "vendor-management"
    : areaId === "audit"
    ? "audit-trails"
    : areaId === "investment"
    ? "investments"
    : areaId || "dashboard";

  const closeMobileAndNavigate = (to: string) => {
    navigate(to);
    setMobileOpen(false);
  };

  const signOut = () => {
    logout();
    navigate("/modules/core-operations", { replace: true });
  };

  const pageTitle = activeArea
    ? `${activeArea.name} finances`
    : section === "budget"
    ? "Budget planning & allocations"
    : section === "banking"
    ? "Banking & treasury operations"
    : section === "investments"
    ? "Investments & Treasury Portfolio"
    : section === "vendor-management"
    ? "Vendor directory & contracts"
    : section === "procurement"
    ? "Procurement & requisitions"
    : section === "salary"
    ? "Salary register & payroll rollout"
    : section === "reimbursement"
    ? "Staff expense claims & advances"
    : section === "payments"
    ? "Disbursement & payment desk"
    : section === "taxation"
    ? "Statutory taxation & GST / TDS"
    : section === "audit-trails"
    ? "Project-wise employee invoice audit trail"
    : section === "projects"
    ? "Project finances & grant utilization"
    : section === "approvals"
    ? "Financial approvals queue"
    : section === "alerts"
    ? "Alerts & notifications"
    : "Overall finance dashboard";

  const isCurrent = (key: string) => {
    if (activeArea) return false;
    return section === key;
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-20 items-center border-b border-[var(--border)]",
          collapsed ? "justify-center px-3" : "px-5"
        )}
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="focus-ring flex items-center gap-3 rounded-xl"
        >
          <img src="/pantiss-mark.png" alt="" className="size-10 rounded-xl object-contain" />
          {!collapsed && (
            <span className="text-left">
              <span className="block text-sm font-semibold text-[var(--text)]">Pantiss ERP</span>
              <span className="block text-[10px] text-[var(--text-subtle)]">Finance Division</span>
            </span>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Finance workspace">
        <p
          className={cn(
            "mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]",
            collapsed && "sr-only"
          )}
        >
          Finance Workspace
        </p>

        {/* 1) Dashboard (which is the overall finances) */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("dashboard")}
          icon={<LayoutDashboard size={17} />}
          label="Dashboard"
          onClick={() => closeMobileAndNavigate("/finance/dashboard")}
        />

        {/* 2) Budget */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("budget")}
          icon={<WalletCards size={17} />}
          label="Budget"
          onClick={() => closeMobileAndNavigate("/finance/budget")}
        />

        {/* 3) Banking */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("banking")}
          icon={<Landmark size={17} />}
          label="Banking"
          onClick={() => closeMobileAndNavigate("/finance/banking")}
        />

        {/* 4) Vendor Management */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("vendor-management")}
          icon={<Users size={17} />}
          label="Vendor Management"
          onClick={() => closeMobileAndNavigate("/finance/vendor-management")}
        />

        {/* 5) Procurement */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("procurement")}
          icon={<ShoppingCart size={17} />}
          label="Procurement"
          onClick={() => closeMobileAndNavigate("/finance/procurement")}
        />

        {/* 6) Salary */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("salary")}
          icon={<Coins size={17} />}
          label="Salary"
          onClick={() => closeMobileAndNavigate("/finance/salary")}
        />

        {/* 7) Reimbursement */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("reimbursement")}
          icon={<Receipt size={17} />}
          label="Reimbursement"
          onClick={() => closeMobileAndNavigate("/finance/reimbursement")}
        />

        {/* 8) Payments */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("payments")}
          icon={<BadgeIndianRupee size={17} />}
          label="Payments"
          onClick={() => closeMobileAndNavigate("/finance/payments")}
        />

        {/* 9) Taxation */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("taxation")}
          icon={<Scale size={17} />}
          label="Taxation"
          onClick={() => closeMobileAndNavigate("/finance/taxation")}
        />

        {/* 10) Audit Trails */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("audit-trails")}
          icon={<ShieldCheck size={17} />}
          label="Audit Trails"
          onClick={() => closeMobileAndNavigate("/finance/audit-trails")}
        />

        {/* 11) Projects */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("projects")}
          icon={<FolderKanban size={17} />}
          label="Projects"
          onClick={() => closeMobileAndNavigate("/finance/projects")}
        />

        {/* 12) Approvals */}
        <NavButton
          collapsed={collapsed}
          active={isCurrent("approvals")}
          icon={<CheckCheck size={17} />}
          label="Approvals"
          onClick={() => closeMobileAndNavigate("/finance/approvals")}
        />
      </nav>

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
          <p className="truncate text-[10px] font-semibold text-[var(--text)]">{user.name}</p>
          <p className="mt-1 text-[9px] text-emerald-600 dark:text-emerald-400">{user.roleLabel}</p>
        </div>
      )}

      <div className="border-t border-[var(--border)] p-3">
        <button
          type="button"
          onClick={signOut}
          className={cn(
            "focus-ring flex h-10 w-full items-center rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]",
            collapsed ? "justify-center" : "gap-3 px-3"
          )}
        >
          <LogOut size={16} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="focus-ring fixed left-4 top-4 z-40 grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text)] shadow-lg lg:hidden"
        aria-label="Open finance navigation"
      >
        <Menu size={19} />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[var(--border)] bg-[var(--module-bg)] transition-[width] duration-300 lg:block",
          collapsed ? "w-[80px]" : "w-[260px]"
        )}
      >
        {sidebar}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="focus-ring absolute -right-3 top-24 grid size-7 place-items-center rounded-full border border-[var(--border)] bg-[var(--module-bg)] text-[var(--text-muted)] shadow-md hover:text-[var(--text)]"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMobileOpen(false);
          }}
        >
          <aside className="h-full w-[280px] bg-[var(--module-bg)] shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute left-[230px] top-5 grid size-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)]"
            >
              <X size={17} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300",
          collapsed ? "lg:pl-[80px]" : "lg:pl-[260px]"
        )}
      >
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/88 px-4 backdrop-blur-2xl sm:px-7 lg:px-8">
          <div className="min-w-0 pl-12 lg:pl-0">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
              Finance Division · FY 2026–27
            </p>
            <h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-xl">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <label className="relative hidden md:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="search"
                placeholder="Search financial records"
                className="focus-ring h-10 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </label>

            <button
              type="button"
              onClick={toggleTheme}
              className="focus-ring grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]"
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              onClick={() => navigate("/finance/alerts")}
              className="focus-ring relative grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]"
              aria-label="Finance alerts"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500 ring-2 ring-[var(--background)]" />
            </button>

            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-400 text-white shadow-sm">
              <CircleDollarSign size={18} />
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {activeArea ? (
            <FinanceDashboard areaId={activeArea.id} />
          ) : section === "budget" ? (
            <BudgetsView />
          ) : section === "banking" ? (
            <BankingView />
          ) : section === "investments" ? (
            <InvestmentsView />
          ) : section === "vendor-management" ? (
            <VendorManagementView />
          ) : section === "procurement" ? (
            <ProcurementApprovalsView />
          ) : section === "salary" ? (
            <SalaryView />
          ) : section === "reimbursement" ? (
            <ReimbursementView />
          ) : section === "payments" ? (
            <PaymentsView />
          ) : section === "taxation" ? (
            <TaxationView />
          ) : section === "audit-trails" ? (
            <AuditTrailsView />
          ) : section === "projects" ? (
            <ProjectsView />
          ) : section === "approvals" ? (
            <CombinedApprovalsView />
          ) : section === "alerts" ? (
            <AlertsView />
          ) : (
            <FinanceDashboard />
          )}
        </main>
      </div>
    </div>
  );
}

function NavButton({
  collapsed,
  active,
  icon,
  label,
  onClick
}: {
  collapsed: boolean;
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        "focus-ring flex h-10 w-full items-center rounded-xl text-xs transition-colors",
        collapsed ? "justify-center" : "gap-3 px-3",
        active
          ? "bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400 shadow-sm"
          : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
      )}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}
