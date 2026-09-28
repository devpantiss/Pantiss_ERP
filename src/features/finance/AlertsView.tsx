import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  FileCheck2,
  Search,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";

type AlertCategory = "Action Required" | "Compliance" | "Approvals" | "Investments" | "Budget" | "Salary" | "Completed";

interface FinanceAlert {
  id: string;
  icon: typeof AlertTriangle;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  date: string;
  category: AlertCategory;
  unread: boolean;
}

const ALL_ALERTS: FinanceAlert[] = [
  { id:"alert-001", icon:AlertTriangle, iconColor:"text-red-500",    iconBg:"bg-red-500/10",    title:"Advance overdue — Project MNRE-027",           body:"₹3.2 L advance unsettled for 48 days. Settlement vouchers not received from Odisha field office. Immediate action required from project accountant.", time:"2 hrs ago",     date:"28 Sep 2026", category:"Action Required", unread:true  },
  { id:"alert-002", icon:ShieldCheck,   iconColor:"text-amber-500",  iconBg:"bg-amber-500/10",  title:"TDS return filing due in 3 days",               body:"Q2 FY26-27 TDS return filing deadline — 7 Oct 2026. Challan payments must be completed before filing. Contact: CA Ramesh Mehta.",               time:"5 hrs ago",     date:"28 Sep 2026", category:"Compliance",      unread:true  },
  { id:"alert-003", icon:FileCheck2,    iconColor:"text-blue-500",   iconBg:"bg-blue-500/10",   title:"Payment voucher awaiting Level-2 approval",     body:"₹18.6 L vendor payment to M/s EduBuild Infra Pvt. Ltd. for construction milestone 3 — pending Level-2 finance approval since 26 Sep 2026.",      time:"Yesterday",     date:"27 Sep 2026", category:"Approvals",       unread:true  },
  { id:"alert-004", icon:TrendingUp,    iconColor:"text-emerald-500",iconBg:"bg-emerald-500/10",title:"FD maturity — SBI/FD/389102948",                body:"Fixed Deposit of ₹1.00 Cr with State Bank of India matures on 15 Dec 2026. Renewal or liquidation instructions required from Finance Head.",       time:"Today, 9:30 AM",date:"28 Sep 2026", category:"Investments",     unread:false },
  { id:"alert-005", icon:AlertTriangle, iconColor:"text-amber-500",  iconBg:"bg-amber-500/10",  title:"Budget variance exceeds 15% — NHM-014",         body:"Travel & accommodation line has exceeded the sanctioned budget by ₹1.1 L. A formal re-appropriation request is pending approval from Programme Director.", time:"27 Sep",      date:"27 Sep 2026", category:"Budget",          unread:true  },
  { id:"alert-006", icon:CheckCircle2,  iconColor:"text-emerald-500",iconBg:"bg-emerald-500/10",title:"Donor UC submitted — WASH-041",                 body:"Utilisation certificate for UNICEF grant (Project WASH-041) submitted successfully. ₹42.8 L utilisation confirmed and acknowledged.",               time:"28 Sep",        date:"28 Sep 2026", category:"Completed",       unread:false },
  { id:"alert-007", icon:WalletCards,   iconColor:"text-teal-500",   iconBg:"bg-teal-500/10",   title:"Salary disbursed — September 2026",             body:"Payroll of ₹74.2 L disbursed to 284 employees across 7 field offices. No exceptions or failed transactions flagged.",                               time:"26 Sep",        date:"26 Sep 2026", category:"Salary",          unread:false },
  { id:"alert-008", icon:ShieldCheck,   iconColor:"text-amber-500",  iconBg:"bg-amber-500/10",  title:"GST Return GSTR-3B due — October 2026",         body:"Monthly GSTR-3B return for October 2026 is due by 20 Oct 2026. Ensure all purchase invoices are reconciled in GSTR-2B before filing.",              time:"25 Sep",        date:"25 Sep 2026", category:"Compliance",      unread:false },
  { id:"alert-009", icon:FileCheck2,    iconColor:"text-blue-500",   iconBg:"bg-blue-500/10",   title:"Procurement approval — IT Equipment (₹8.4 L)", body:"Purchase request for IT equipment (laptops and accessories) submitted by Admin team. Awaiting Finance Manager approval before PO issuance.",          time:"24 Sep",        date:"24 Sep 2026", category:"Approvals",       unread:false },
  { id:"alert-010", icon:AlertTriangle, iconColor:"text-red-500",    iconBg:"bg-red-500/10",    title:"Unsettled advance — Rajan Pillai",              body:"Travel advance of ₹48,000 issued to Rajan Pillai (Accounts Executive) on 5 Aug 2026 remains unsettled after 54 days. HR and Finance action required.", time:"22 Sep",      date:"22 Sep 2026", category:"Action Required", unread:false },
  { id:"alert-011", icon:TrendingUp,    iconColor:"text-blue-500",   iconBg:"bg-blue-500/10",   title:"MF NAV update — HDFC Overnight Fund",           body:"HDFC Overnight Fund Direct Plan NAV updated to ₹372.24. Current portfolio value: ₹48.2 L (investment: ₹45 L). XIRR: 7.1%.",                        time:"20 Sep",        date:"20 Sep 2026", category:"Investments",     unread:false },
  { id:"alert-012", icon:CheckCircle2,  iconColor:"text-emerald-500",iconBg:"bg-emerald-500/10",title:"Bank reconciliation completed — Canara Bank",   body:"Monthly bank reconciliation for Canara Bank A/C 7320100028471 completed and certified. Zero unreconciled items as of 30 Aug 2026.",                  time:"18 Sep",        date:"18 Sep 2026", category:"Completed",       unread:false },
];

const FILTERS: { label: string; value: AlertCategory | "All" }[] = [
  { label: "All",             value: "All"             },
  { label: "Action Required", value: "Action Required" },
  { label: "Compliance",      value: "Compliance"      },
  { label: "Approvals",       value: "Approvals"       },
  { label: "Investments",     value: "Investments"     },
  { label: "Budget",          value: "Budget"          },
  { label: "Salary",          value: "Salary"          },
  { label: "Completed",       value: "Completed"       },
];

const tagColors: Record<AlertCategory, string> = {
  "Action Required": "bg-red-500/10 text-red-600 dark:text-red-400",
  "Compliance":      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Approvals":       "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Investments":     "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Budget":          "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Salary":          "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "Completed":       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function AlertsView() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<AlertCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<FinanceAlert[]>(ALL_ALERTS);

  const unreadCount = alerts.filter((a) => a.unread).length;

  const filtered = useMemo(() => alerts.filter((a) => {
    const matchCat = activeFilter === "All" || a.category === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q);
    return matchCat && matchSearch;
  }), [alerts, activeFilter, search]);

  const markAllRead = () => setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <button type="button" onClick={() => navigate("/finance/dashboard")} className="focus-ring inline-flex items-center gap-1 font-medium hover:text-[var(--text)] transition-colors">
            <ChevronLeft size={14} /> Finance Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-[var(--text)]">Alerts &amp; Notifications</span>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-all shadow-sm">
            <CheckCircle2 size={13} className="text-emerald-500" /> Mark all as read
          </button>
        )}
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-amber-950 to-red-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Bell size={13} /> Finance Alerts &amp; Notifications
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Alerts &amp; Highlights</h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Real-time alerts on advances, compliance deadlines, approval queues, investment events, and budget exceptions across all active finance modules.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {unreadCount > 0 && (
              <span className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
                <span className="block text-2xl font-bold">{unreadCount}</span>
                <span className="text-[10px] text-white/70">unread</span>
              </span>
            )}
            <span className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur">
              <span className="block text-2xl font-bold">{alerts.length}</span>
              <span className="text-[10px] text-white/70">total</span>
            </span>
          </div>
        </div>
      </section>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const count = f.value === "All" ? alerts.length : alerts.filter((a) => a.category === f.value).length;
            return (
              <button key={f.value} type="button" onClick={() => setActiveFilter(f.value)} className={cn(
                "focus-ring inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[10px] font-semibold transition-all",
                activeFilter === f.value
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "border-[var(--border)] bg-[var(--module-bg)] text-[var(--text-muted)] hover:border-[var(--text-subtle)] hover:text-[var(--text)]"
              )}>
                {f.label}
                <span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-bold", activeFilter === f.value ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-[var(--border)] text-[var(--text-muted)]")}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-60">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="search" placeholder="Search alerts…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-xl border border-[var(--border)] bg-[var(--module-bg)] pl-8 pr-3 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30" />
        </div>
      </div>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] py-20 text-center">
          <Bell size={36} className="text-[var(--text-subtle)]" />
          <p className="text-sm font-semibold text-[var(--text)]">No alerts found</p>
          <p className="text-xs text-[var(--text-subtle)]">Try adjusting your filter or search query</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)] sm:px-6">
            <span>Type</span><span>Alert</span><span className="text-right">Date</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.id} className={cn("group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-soft)] sm:px-6", alert.unread && "bg-[var(--surface-soft)]")}>
                  <div className="flex shrink-0 flex-col items-center gap-1.5 pt-0.5">
                    {alert.unread && <span className="size-1.5 rounded-full bg-amber-500" />}
                    {!alert.unread && <span className="size-1.5" />}
                    <span className={cn("grid size-9 place-items-center rounded-xl", alert.iconBg, alert.iconColor)}><Icon size={15} /></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={cn("text-xs text-[var(--text)]", alert.unread ? "font-bold" : "font-semibold")}>{alert.title}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-[8px] font-semibold", tagColors[alert.category])}>{alert.category}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[9px] text-[var(--text-muted)]">{alert.date}</span>
                        <button type="button" onClick={() => dismiss(alert.id)} title="Dismiss" className="focus-ring grid size-6 place-items-center rounded-lg text-[var(--text-muted)] opacity-0 transition hover:bg-[var(--border)] hover:text-[var(--text)] group-hover:opacity-100">
                          <X size={11} />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-[1.6] text-[var(--text-subtle)]">{alert.body}</p>
                    <p className="mt-1.5 text-[9px] text-[var(--text-muted)]">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
