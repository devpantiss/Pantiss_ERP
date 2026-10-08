import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Landmark,
  PieChart,
  ReceiptIndianRupee,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";
import { areaTotals, financeAreas, formatCurrency, portfolioTotals, type FinanceArea, type FinanceProject, type FinanceStatus } from "./data";
import { ProjectExpenditureLedger } from "./ProjectExpenditureLedger";
import { AnimatedNumber } from "./AnimatedNumber";
import { MonthlyFinanceRow } from "./MonthlyFinanceRow";

/** Read onboarded project data (tranches) from localStorage */
function readOnboardedTranches() {
  try {
    const raw = localStorage.getItem("pantiss-project-onboarding-draft-v2");
    if (!raw) return null;
    const obj: Record<string, unknown> = JSON.parse(raw);
    const budget = parseFloat(String(obj.budget)) || 0;
    const tranches = Array.isArray(obj.tranches) ? obj.tranches as Array<{ percentage: number; tentativeDate: string }> : [];
    return { budget, tranches, name: String(obj.name || "") };
  } catch { return null; }
}

/** Formats a lakh value mid-animation — keeps the ₹ prefix and Cr/L suffix stable */
function fmtLakh(n: number, precise = false): string {
  return formatCurrency(n, precise);
}
/** Formats a percentage mid-animation (rounds to nearest integer) */
function fmtPct(n: number): string {
  return `${Math.round(n)}%`;
}

const statusStyles: Record<FinanceStatus, string> = {
  "On track": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Watch: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Action required": "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function FinanceDashboard({ areaId }: { areaId?: string }) {
  const area = financeAreas.find((item) => item.id === areaId);
  return area ? <AreaFinanceDashboard area={area} /> : <PortfolioFinanceDashboard />;
}

function PortfolioFinanceDashboard() {
  const navigate = useNavigate();
  const utilization = Math.round(portfolioTotals.spent / portfolioTotals.approved * 100);
  const releaseRate = Math.round(portfolioTotals.released / portfolioTotals.approved * 100);
  const allProjects = financeAreas.flatMap((area) => area.projects);
  const statusCounts = {
    onTrack: allProjects.filter((project) => project.status === "On track").length,
    watch: allProjects.filter((project) => project.status === "Watch").length,
    action: allProjects.filter((project) => project.status === "Action required").length,
  };
  const onTrackShare = Math.round(statusCounts.onTrack / allProjects.length * 100);
  const watchShare = Math.round((statusCounts.onTrack + statusCounts.watch) / allProjects.length * 100);
  return (
    <div className="space-y-6">
      <section aria-label="Taxation monitoring" className="grid gap-3 sm:grid-cols-3">
        {[{ key: "gst", label: "GST filing", detail: "Update returns & upload acknowledgements" }, { key: "itc", label: "Input tax credit tracking", detail: "Review claimed and proposed credits" }, { key: "tds", label: "TDS filing (total)", detail: "Monitor totals & record completed filings" }].map((item) => <button key={item.key} type="button" onClick={() => navigate(`/finance/taxation?view=${item.key}`)} className="focus-ring rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-4 text-left shadow-[var(--shadow-card)] transition hover:bg-[var(--surface-soft)]"><span className="text-sm font-semibold text-[var(--brand-primary)]">{item.label} →</span><span className="mt-2 block text-xs text-[var(--text-muted)]">{item.detail}</span></button>)}
      </section>
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white shadow-[0_28px_80px_rgba(5,150,105,.18)] sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-12 top-8 size-40 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <CircleDollarSign size={13} /> Finance portfolio control
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Every rupee, from grant to impact.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">
              Organization-wide visibility into approved budgets, fund releases, verified expenditure, commitments, advances and financial compliance across all thematic portfolios.
            </p>
          </div>
          <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-black/15 p-4 backdrop-blur">
            <div className="flex items-end justify-between">
              <span className="text-[10px] text-white/60">Portfolio utilization</span>
              <span className="text-2xl font-semibold">
                <AnimatedNumber value={utilization} formatter={fmtPct} duration={1400} />
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-emerald-300" style={{ width: `${utilization}%` }} />
            </div>
            <div className="mt-3 flex justify-between text-[9px] text-white/50">
              <span><AnimatedNumber value={portfolioTotals.spent} formatter={(n) => `${fmtLakh(n)} spent`} duration={1400} /></span>
              <span><AnimatedNumber value={portfolioTotals.approved} formatter={(n) => `${fmtLakh(n)} approved`} duration={1400} /></span>
            </div>
          </div>
        </div>
      </section>

      {/* Row 1: Cumulative financials */}
      <section aria-labelledby="cumulative-financials-heading">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
          <div>
            <h3 id="cumulative-financials-heading" className="text-base font-semibold text-[var(--text)]">
              Cumulative financials
            </h3>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">
              Consolidated liquid reserves, institutional investments, and obligations
            </p>
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
            Treasury & Reserves
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: Total Balance (clickable -> /finance/banking) */}
          <motion.article
            role="button"
            tabIndex={0}
            onClick={() => navigate("/finance/banking")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/finance/banking");
              }
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="group relative cursor-pointer rounded-2xl border border-emerald-500/30 bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 focus-ring"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Landmark size={18} />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                Banking <ArrowUpRight size={11} />
              </span>
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--text)]">
              <AnimatedNumber value={3845} formatter={(n) => `₹${(n / 100).toFixed(2)} Cr`} duration={1300} delay={40} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Balance
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              Across 4 institutional bank accounts · Click to view Banking ledger
            </p>
          </motion.article>

          {/* Card 2: Total Investments (clickable -> /finance/investments) */}
          <motion.article
            role="button"
            tabIndex={0}
            onClick={() => navigate("/finance/investments")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/finance/investments");
              }
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="group relative cursor-pointer rounded-2xl border border-blue-500/30 bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 focus-ring"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <TrendingUp size={18} />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Investments <ArrowUpRight size={11} />
              </span>
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--text)]">
              <AnimatedNumber value={427} formatter={(n) => `₹${(n / 100).toFixed(2)} Cr`} duration={1300} delay={80} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Investments
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              Fixed deposits (₹2.85 Cr) & liquid mutual funds (₹1.42 Cr) · Click to view portfolio
            </p>
          </motion.article>

          {/* Card 3: Total Liabilities */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-emerald-500/25"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
                <Banknote size={18} />
              </span>
              <span className="size-2 rounded-full bg-purple-500/70" />
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--text)]">
              <AnimatedNumber value={portfolioTotals.committed} formatter={fmtLakh} duration={1300} delay={120} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Liabilities
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              Approved purchase orders, contractor retentions & statutory payables
            </p>
          </motion.article>
        </div>
      </section>

      {/* Row 2: Annual Financials */}
      <section aria-labelledby="annual-financials-heading">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
          <div>
            <h3 id="annual-financials-heading" className="text-base font-semibold text-[var(--text)]">
              Annual Financials
            </h3>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">
              FY 2026–27 budgetary sanctions, fund receipts, expenditure, and corpus
            </p>
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
            FY 2026–27 Performance
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Card 1: Total Sanctions */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-emerald-500/25"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileCheck2 size={18} />
              </span>
              <span className="size-2 rounded-full bg-emerald-500/70" />
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--text)]">
              <AnimatedNumber value={portfolioTotals.approved} formatter={fmtLakh} duration={1300} delay={160} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Sanctions
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              {portfolioTotals.projects} approved projects across 7 thematic areas
            </p>
          </motion.article>

          {/* Card 2: Total Received */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.20 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-emerald-500/25"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
                <WalletCards size={18} />
              </span>
              <span className="size-2 rounded-full bg-blue-500/70" />
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--text)]">
              <AnimatedNumber value={portfolioTotals.released} formatter={fmtLakh} duration={1300} delay={200} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Received
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              {releaseRate}% of sanctioned donor allocations received in bank
            </p>
          </motion.article>

          {/* Card 3: Total Expenditure */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-emerald-500/25"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                <ReceiptIndianRupee size={18} />
              </span>
              <span className="size-2 rounded-full bg-amber-500/70" />
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              <AnimatedNumber value={portfolioTotals.spent} formatter={fmtLakh} duration={1300} delay={240} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Expenditure
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              {utilization}% verified portfolio utilization against sanctioned funds
            </p>
          </motion.article>

          {/* Card 4: Total Corpus */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-emerald-500/25"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
                <CircleDollarSign size={18} />
              </span>
              <span className="size-2 rounded-full bg-teal-500/70" />
            </div>
            <p className="mt-5 text-2xl font-bold tracking-tight text-[var(--text)]">
              <AnimatedNumber value={560} formatter={(n) => `₹${(n / 100).toFixed(2)} Cr`} duration={1300} delay={280} />
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--text)]">
              Total Corpus
            </p>
            <p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">
              Unrestricted core endowment and capital foundation reserves
            </p>
          </motion.article>
        </div>
      </section>

      {/* Tranche Fund Allocation Section */}
      <TrancheAllocationSection />

      {/* Row 3: Compliance Completeness + Highlights */}
      <section aria-labelledby="compliance-highlights-heading" className="grid items-stretch gap-5 xl:grid-cols-[1fr_1.4fr]">

        {/* Left: Compliance Completeness Card */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="flex flex-col justify-between rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 id="compliance-highlights-heading" className="text-base font-semibold text-[var(--text)]">
                Compliance Completeness
              </h3>
              <p className="mt-1 text-xs text-[var(--text-subtle)]">
                Regulatory & internal control adherence across all active projects
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={10} /> Live
            </span>
          </div>

          {/* Donut Score — compact, centred */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="relative grid size-36 place-items-center rounded-full"
              style={{ background: `conic-gradient(#10b981 0 88%, #f59e0b 88% 94%, #ef4444 94% 100%)` }}
            >
              <div className="grid size-24 place-items-center rounded-full bg-[var(--module-bg)] text-center">
                <span>
                  <span className="block text-2xl font-semibold text-emerald-600 dark:text-emerald-400">88%</span>
                  <span className="text-[9px] text-[var(--text-subtle)]">overall</span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-[10px]">
              {[
                { label: "Compliant", color: "bg-emerald-500", val: 88 },
                { label: "At risk",   color: "bg-amber-500",   val: 6  },
                { label: "Overdue",   color: "bg-red-500",     val: 6  },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", item.color)} />
                  <span className="text-[var(--text-muted)]">{item.label}</span>
                  <span className="font-semibold text-[var(--text)]">
                    <AnimatedNumber value={item.val} formatter={fmtPct} duration={1000} delay={400} />
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Control checklist — fills remaining height */}
          <div className="space-y-2.5">
            {[
              { label: "Bank reconciliation statements", done: true,  pct: 100 },
              { label: "Voucher & supporting documents",  done: true,  pct: 93  },
              { label: "Advance settlement compliance",   done: false, pct: 72  },
              { label: "Statutory TDS / GST filings",     done: true,  pct: 100 },
              { label: "Donor utilisation certificates",  done: false, pct: 61  },
              { label: "Audit action-taken reports",      done: true,  pct: 88  },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    {item.done
                      ? <CheckCircle2 size={11} className="text-emerald-500" />
                      : <AlertTriangle size={11} className="text-amber-500" />}
                    {item.label}
                  </span>
                  <span className={cn("font-semibold",
                    item.pct >= 90 ? "text-emerald-600 dark:text-emerald-400"
                    : item.pct >= 70 ? "text-amber-600"
                    : "text-red-500")}>
                    <AnimatedNumber value={item.pct} formatter={fmtPct} duration={900} delay={500} />
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--border)]">
                  <div
                    className={cn("h-full rounded-full transition-all",
                      item.pct >= 90 ? "bg-emerald-500"
                      : item.pct >= 70 ? "bg-amber-400"
                      : "bg-red-500")}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.article>

        {/* Right: Highlights / Notifications Panel */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="flex max-h-[520px] flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]"
        >
          {/* Panel header */}
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">Highlights</h3>
              <p className="mt-0.5 text-xs text-[var(--text-subtle)]">Recent activity, alerts & reminders across all finance modules</p>
            </div>
            <span className="relative grid size-8 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">
              <WalletCards size={15} />
              <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-[var(--module-bg)]" />
            </span>
          </div>

          {/* Notification list — scrollable, fills height between header and footer */}
          <div
            className="min-h-0 flex-1 divide-y divide-[var(--border)] overflow-y-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
          >
            {[
              {
                icon: AlertTriangle,
                color: "text-red-500",
                bg: "bg-red-500/10",
                title: "Advance overdue — Project MNRE-027",
                body: "₹3.2 L advance unsettled for 48 days. Settlement vouchers not received from Odisha field office.",
                time: "2 hrs ago",
                tag: "Action Required",
                tagColor: "bg-red-500/10 text-red-600 dark:text-red-400",
              },
              {
                icon: ShieldCheck,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                title: "TDS return filing due in 3 days",
                body: "Q2 FY26-27 TDS filing deadline — 7 Oct 2026. Ensure challan payments are completed before filing.",
                time: "5 hrs ago",
                tag: "Compliance",
                tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              },
              {
                icon: TrendingUp,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                title: "FD maturity — SBI/FD/389102948",
                body: "Fixed Deposit of ₹1.00 Cr matures on 15 Dec 2026. Renewal instructions required from Finance Head.",
                time: "Today, 9:30 AM",
                tag: "Investments",
                tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              },
              {
                icon: FileCheck2,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                title: "Payment voucher awaiting approval",
                body: "₹18.6 L vendor payment to M/s EduBuild Infra Pvt. Ltd. pending Level-2 finance approval since 26 Sep.",
                time: "Yesterday",
                tag: "Approvals",
                tagColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              },
              {
                icon: CheckCircle2,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                title: "Donor utilisation certificate submitted",
                body: "UC for UNICEF grant (Project WASH-041) submitted successfully. ₹42.8 L utilisation confirmed.",
                time: "28 Sep",
                tag: "Completed",
                tagColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              },
              {
                icon: AlertTriangle,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                title: "Budget variance exceeds 15% — NHM-014",
                body: "Travel & accommodation line exceeds sanctioned budget by ₹1.1 L. Re-appropriation request pending.",
                time: "27 Sep",
                tag: "Budget",
                tagColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
              },
              {
                icon: WalletCards,
                color: "text-teal-500",
                bg: "bg-teal-500/10",
                title: "Salary disbursed for September 2026",
                body: "Payroll of ₹74.2 L disbursed to 284 employees across 7 field offices. No exceptions flagged.",
                time: "26 Sep",
                tag: "Salary",
                tagColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
              },
            ].map((notif, idx) => {
              const Icon = notif.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--surface-soft)] sm:px-6"
                >
                  <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl", notif.bg, notif.color)}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold text-[var(--text)]">{notif.title}</p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold", notif.tagColor)}>
                        {notif.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-4 text-[var(--text-subtle)]">{notif.body}</p>
                    <p className="mt-1.5 text-[9px] text-[var(--text-muted)]">{notif.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer — navigates to Alerts page */}
          <div className="shrink-0 border-t border-[var(--border)] px-5 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => navigate("/finance/alerts")}
              className="focus-ring group inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-center text-[10px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
            >
              View all alerts & notifications
              <ArrowUpRight size={11} className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </button>
          </div>
        </motion.article>
      </section>

    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">Thematic financial scorecards</h3>
          <p className="mt-1 text-xs text-[var(--text-subtle)]">Select a thematic area to review every project and transaction-level control</p>
        </div>
        <span className="w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[10px] text-emerald-600 dark:text-emerald-400">
          FY 2026–27 · Updated 03 Aug
        </span>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {financeAreas.map((area) => {
          const totals = areaTotals(area);
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => navigate(`/finance/${area.id}`)}
              className="focus-ring group rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-[0_16px_38px_rgba(5,150,105,.09)]"
            >
              <div className="flex items-start justify-between">
                <span className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl text-white" style={{ background: area.color }}>
                    <Building2 size={17} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[var(--text)]">{area.name}</span>
                    <span className="mt-1 block text-[9px] text-[var(--text-subtle)]">{area.projects.length} active projects</span>
                  </span>
                </span>
                <ArrowUpRight size={15} className="text-[var(--text-subtle)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: "Approved", value: totals.approved },
                  { label: "Released", value: totals.released, target: totals.approved },
                  { label: "Spent", value: totals.spent },
                  { label: "Available", value: totals.available },
                ].map((metric) => (
                  <span key={metric.label} className="rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-3">
                    <span className="block text-sm font-semibold text-[var(--text)]">
                      <AnimatedNumber value={metric.value} formatter={fmtLakh} duration={1100} />{metric.target !== undefined && <span className="mt-1 block text-xs font-normal text-[var(--text-muted)]">/ {fmtLakh(metric.target)}</span>}
                    </span>
                    <span className="mt-1 block text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">{metric.label}{metric.target !== undefined && <span className="mt-1 block normal-case tracking-normal">Achieved / Target</span>}</span>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full" style={{ width: `${totals.utilization}%`, background: area.color }} />
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                  <AnimatedNumber value={totals.utilization} formatter={fmtPct} duration={1100} /> utilized
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  </div>
  );
}

function TrancheAllocationSection() {
  const data = useMemo(readOnboardedTranches, []);
  if (!data || !data.budget || !data.tranches.length) return null;

  const formatINR = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      aria-labelledby="tranche-allocation-heading"
      className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center mb-5">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
            <PieChart size={18} />
          </span>
          <div>
            <h3 id="tranche-allocation-heading" className="text-base font-semibold text-[var(--text)]">
              Tranche Fund Allocation
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
              {data.name} · {data.tranches.length} tranche{data.tranches.length > 1 ? "s" : ""} · 50% Corpus + 50% Operations per tranche
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 text-center">
            <p className="text-[9px] font-semibold text-emerald-600">Total Corpus</p>
            <p className="text-sm font-bold text-emerald-600">{formatINR(data.budget * 0.5)}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.06] px-4 py-2 text-center">
            <p className="text-[9px] font-semibold text-blue-600">Total Operations</p>
            <p className="text-sm font-bold text-blue-600">{formatINR(data.budget * 0.5)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.tranches.map((tranche, index) => {
          const pct = Number(tranche.percentage) || 0;
          const trancheVal = data.budget * (pct / 100);
          const corpus = trancheVal * 0.5;
          const ops = trancheVal * 0.5;

          let daysUntil: number | null = null;
          let dueSoon = false;
          let overdue = false;
          if (tranche.tentativeDate) {
            const due = new Date(tranche.tentativeDate);
            due.setHours(0, 0, 0, 0);
            daysUntil = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            dueSoon = daysUntil <= 14 && daysUntil >= 0;
            overdue = daysUntil < 0;
          }

          return (
            <div
              key={index}
              className={`rounded-2xl border p-4 ${
                overdue
                  ? "border-red-500/30 bg-red-500/[0.04]"
                  : dueSoon
                  ? "border-amber-500/30 bg-amber-500/[0.04]"
                  : "border-[var(--border)] bg-[var(--surface-soft)]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="grid size-6 place-items-center rounded-full bg-[var(--finance-accent-soft)] text-[10px] font-bold text-[var(--finance-accent)]">
                  {index + 1}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                  overdue ? "bg-red-500/10 text-red-600" : dueSoon ? "bg-amber-500/10 text-amber-600" : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                }`}>
                  {overdue
                    ? `${Math.abs(daysUntil!)}d overdue`
                    : dueSoon
                    ? `Due in ${daysUntil}d`
                    : tranche.tentativeDate || "No date"}
                </span>
              </div>
              <p className="text-lg font-bold text-[var(--text)]">{pct}%</p>
              <p className="text-[10px] text-[var(--text-muted)] mb-3">of {formatINR(data.budget)}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-emerald-500/[0.06] px-2.5 py-1.5">
                  <span className="text-[9px] font-medium text-emerald-600">Corpus (50%)</span>
                  <span className="text-[10px] font-bold text-emerald-600">{formatINR(corpus)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-blue-500/[0.06] px-2.5 py-1.5">
                  <span className="text-[9px] font-medium text-blue-600">Operations (50%)</span>
                  <span className="text-[10px] font-bold text-blue-600">{formatINR(ops)}</span>
                </div>
              </div>
              {overdue && (
                <p className="mt-2 text-[9px] text-red-600 font-semibold">⚠ Invoice not raised by tentative date</p>
              )}
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function AreaFinanceDashboard({ area }: { area: FinanceArea }) {

  const navigate = useNavigate();
  const totals = areaTotals(area);
  const [selectedProject, setSelectedProject] = useState<FinanceProject | null>(null);
  const sortedProjects = useMemo(() => [...area.projects].sort((a, b) => b.approved - a.approved), [area.projects]);

  return <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
    <button type="button" onClick={() => navigate("/finance/dashboard")} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"><ArrowLeft size={16} />Back to overall finances</button>
    <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white shadow-[0_28px_80px_rgba(5,150,105,.18)] sm:p-8"><div className="absolute -right-20 -top-24 size-72 rounded-full border border-white/10" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><span className="size-1.5 rounded-full" style={{ background: area.color }} />Thematic finance dashboard</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{area.name}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Project-wise budget control, fund-flow visibility, verified expenditure, commitments and compliance exceptions.</p></div><div className="rounded-2xl border border-white/15 bg-black/15 p-4 backdrop-blur"><div className="flex items-end justify-between gap-12"><span className="text-[10px] text-white/60">Budget utilized</span><span className="text-2xl font-semibold"><AnimatedNumber value={totals.utilization} formatter={fmtPct} duration={1300} /></span></div><div className="mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${totals.utilization}%` }} /></div></div></div></section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: "Approved budget", rawValue: totals.approved, fmt: fmtLakh, note: `${area.projects.length} projects`, icon: Landmark },
      { label: "Funds released", rawValue: totals.released, target: totals.approved, fmt: fmtLakh, note: "Achieved / Target · Approved budget", icon: WalletCards },
      { label: "Verified expenditure", rawValue: totals.spent, fmt: fmtLakh, note: `${totals.utilization}% utilization`, icon: ReceiptIndianRupee },
      { label: "Contribution to corpus", rawValue: totals.released * 0.5, fmt: fmtLakh, note: "Estimated · 50% of released funds", icon: CircleDollarSign },
      { label: "Available balance", rawValue: totals.available, fmt: fmtLakh, note: "Net of commitments", icon: Banknote },
      { label: "Pending advances", rawValue: totals.pendingAdvances, fmt: fmtLakh, note: "Settlement evidence due", icon: Clock3 },
      { label: "Action required", rawValue: totals.atRisk, fmt: (n: number) => String(Math.round(n)), note: "Projects outside threshold", icon: AlertTriangle },
      { label: "Voucher compliance", rawValue: 93, fmt: fmtPct, note: "Complete supporting records", icon: ShieldCheck },
    ].map((item) => { const Icon = item.icon; return <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Icon size={18} /></span><p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]"><AnimatedNumber value={item.rawValue} formatter={item.fmt} duration={1200} />{item.target !== undefined && <span className="ml-1 inline-block text-base font-medium text-[var(--text-muted)]">/ {item.fmt(item.target)}</span>}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-[10px] text-[var(--text-subtle)]">{item.note}</p></article>; })}</section>

    <MonthlyFinanceRow key={area.id} area={area} />

    <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]"><div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-end sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Project-wise financial details</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Approved, released, spent, estimated corpus contributions and unsettled amounts for every {area.name} project</p></div><span className="text-[10px] text-[var(--text-subtle)]">Open a ledger for component-wise expenditure and its audit trail</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left"><thead><tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[9px] uppercase tracking-[0.12em] text-[var(--text-subtle)]"><th className="px-6 py-4 font-semibold">Project</th><th className="px-4 py-4 font-semibold">Approved</th><th className="px-4 py-4 font-semibold">Released</th><th className="px-4 py-4 font-semibold">Spent</th><th className="px-4 py-4 font-semibold">Corpus</th><th className="px-4 py-4 font-semibold">Available</th><th className="px-4 py-4 font-semibold">Advances</th><th className="px-4 py-4 font-semibold">Utilization</th><th className="px-4 py-4 font-semibold">Status</th><th className="px-6 py-4 text-right font-semibold">Action</th></tr></thead><tbody>{sortedProjects.map((project) => { const available = Math.max(0, project.approved - project.spent - project.committed); return <tr key={project.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-soft)]"><td className="px-6 py-4"><p className="text-xs font-semibold text-[var(--text)]">{project.name}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{project.id} · {project.donor} · {project.location}</p></td><td className="px-4 py-4 text-xs font-medium text-[var(--text)]">{formatCurrency(project.approved)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.released)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.spent)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.released * 0.5)}<span className="mt-1 block text-[9px] text-[var(--text-subtle)]">Estimated · 50% of released</span></td><td className="px-4 py-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(available)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.pendingAdvances)}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.utilization}%` }} /></div><span className="text-[10px] font-semibold text-[var(--text-muted)]">{project.utilization}%</span></div></td><td className="px-4 py-4"><span className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold", statusStyles[project.status])}>{project.status}</span></td><td className="px-6 py-4 text-right"><button type="button" onClick={() => setSelectedProject(project)} className="focus-ring rounded-lg px-3 py-2 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">View ledger</button></td></tr>; })}</tbody></table></div></section>
    <ProjectFinanceSheet project={selectedProject} onClose={() => setSelectedProject(null)} />
  </motion.div>;
}

function ProjectFinanceSheet({ project, onClose }: { project: FinanceProject | null; onClose: () => void }) {
  return <Overlay open={Boolean(project)} onClose={onClose} variant="panel" size="2xl" label="Project expenditure ledger" title={project?.name ?? ""} description={project ? `${project.id} · ${project.donor} · ${project.location}` : ""}>
    {project && <ProjectExpenditureLedger key={project.id} project={project} />}
  </Overlay>;
}
