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
  const dashboardGroups = [
    {
      title: "Available balance",
      description: "Liquid reserves, investments and current obligations",
      items: [
        { label: "Total fixed deposits", value: "₹2.85 Cr", note: "Across 6 active deposits · 7.2% avg. yield", icon: Landmark },
        { label: "Total mutual funds", value: "₹1.42 Cr", note: "Current market value · +8.4% YTD", icon: TrendingUp },
        { label: "Total liabilities", value: formatCurrency(portfolioTotals.committed), note: "Approved payables and commitments", icon: Banknote },
      ],
    },
    {
      title: "Financial stats",
      description: "Portfolio allocation and expenditure performance",
      items: [
        { label: "Approved portfolio", value: formatCurrency(portfolioTotals.approved), note: `${portfolioTotals.projects} projects · 7 thematic areas`, icon: Landmark },
        { label: "Funds released", value: formatCurrency(portfolioTotals.released), note: `${releaseRate}% of approved budget`, icon: WalletCards },
        { label: "Verified expenditure", value: formatCurrency(portfolioTotals.spent), note: `${utilization}% portfolio utilization`, icon: ReceiptIndianRupee },
      ],
    },
    {
      title: "Projects requiring action",
      description: `${portfolioTotals.atRisk} projects currently need a finance response`,
      items: [
        { label: "Compliance completeness", value: "94%", note: "Vouchers and supporting records verified", icon: ShieldCheck },
        { label: "Released", value: formatCurrency(portfolioTotals.released), note: `${releaseRate}% released across active projects`, icon: CheckCircle2 },
        { label: "Corpus", value: "₹4.27 Cr", note: "Fixed deposits and mutual funds combined", icon: CircleDollarSign },
      ],
    },
  ];

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white shadow-[0_28px_80px_rgba(5,150,105,.18)] sm:p-8">
      <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
      <div className="absolute right-12 top-8 size-40 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><CircleDollarSign size={13} />Finance portfolio control</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Every rupee, from grant to impact.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Organization-wide visibility into approved budgets, fund releases, verified expenditure, commitments, advances and financial compliance across all thematic portfolios.</p></div>
        <div className="w-full max-w-xs rounded-2xl border border-white/15 bg-black/15 p-4 backdrop-blur"><div className="flex items-end justify-between"><span className="text-[10px] text-white/60">Portfolio utilization</span><span className="text-2xl font-semibold">{utilization}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${utilization}%` }} /></div><div className="mt-3 flex justify-between text-[9px] text-white/50"><span>{formatCurrency(portfolioTotals.spent)} spent</span><span>{formatCurrency(portfolioTotals.approved)} approved</span></div></div>
      </div>
    </section>

    {dashboardGroups.map((group, groupIndex) => <section key={group.title} aria-labelledby={`finance-group-${groupIndex}`}><div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-end"><div><h3 id={`finance-group-${groupIndex}`} className="text-base font-semibold text-[var(--text)]">{group.title}</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">{group.description}</p></div><span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Live portfolio view</span></div><div className="grid gap-4 md:grid-cols-3">{group.items.map((item, itemIndex) => { const Icon = item.icon; return <motion.article key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (groupIndex * 3 + itemIndex) * .04 }} className="group rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-emerald-500/25"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Icon size={18} /></span><span className="size-2 rounded-full bg-emerald-500/70" /></div><p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-[10px] leading-4 text-[var(--text-subtle)]">{item.note}</p></motion.article>; })}</div></section>)}

    <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Thematic expenditure profile</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Verified expenditure against approved allocation</p></div><div className="mt-7 space-y-5">{financeAreas.map((area) => { const totals = areaTotals(area); return <button key={area.id} type="button" onClick={() => navigate(`/finance/${area.id}`)} className="focus-ring group block w-full text-left"><div className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-2 font-medium text-[var(--text)]"><span className="size-2 rounded-full" style={{ background: area.color }} />{area.name}</span><span className="text-[var(--text-subtle)]">{formatCurrency(totals.spent)} / {formatCurrency(totals.approved)} <b className="ml-2 text-[var(--text)]">{totals.utilization}%</b></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full transition-all group-hover:brightness-110" style={{ width: `${totals.utilization}%`, background: area.color }} /></div></button>; })}</div></article>
      <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Control status</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Latest finance review across {allProjects.length} projects</p></div><div className="mx-auto mt-7 grid size-40 place-items-center rounded-full" style={{ background: `conic-gradient(#10b981 0 ${onTrackShare}%, #f59e0b ${onTrackShare}% ${watchShare}%, #ef4444 ${watchShare}% 100%)` }}><div className="grid size-28 place-items-center rounded-full bg-[var(--module-bg)] text-center"><span><span className="block text-3xl font-semibold text-[var(--text)]">{allProjects.length}</span><span className="text-[10px] text-[var(--text-subtle)]">projects</span></span></div></div><div className="mt-7 grid grid-cols-3 gap-2 text-center">{[{ label: "On track", value: statusCounts.onTrack, color: "bg-emerald-500" }, { label: "Watch", value: statusCounts.watch, color: "bg-amber-500" }, { label: "Action", value: statusCounts.action, color: "bg-red-500" }].map((item) => <div key={item.label}><span className={cn("mx-auto mb-2 block size-1.5 rounded-full", item.color)} /><span className="block text-sm font-semibold text-[var(--text)]">{item.value}</span><span className="text-[9px] text-[var(--text-subtle)]">{item.label}</span></div>)}</div></article>
    </section>

    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-base font-semibold text-[var(--text)]">Thematic financial scorecards</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Select a thematic area to review every project and transaction-level control</p></div><span className="w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[10px] text-emerald-600 dark:text-emerald-400">FY 2026–27 · Updated 03 Aug</span></div><div className="mt-6 grid gap-4 lg:grid-cols-2">{financeAreas.map((area) => { const totals = areaTotals(area); return <button key={area.id} type="button" onClick={() => navigate(`/finance/${area.id}`)} className="focus-ring group rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-[0_16px_38px_rgba(5,150,105,.09)]"><div className="flex items-start justify-between"><span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl text-white" style={{ background: area.color }}><Building2 size={17} /></span><span><span className="block text-sm font-semibold text-[var(--text)]">{area.name}</span><span className="mt-1 block text-[9px] text-[var(--text-subtle)]">{area.projects.length} active projects</span></span></span><ArrowUpRight size={15} className="text-[var(--text-subtle)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ label: "Approved", value: formatCurrency(totals.approved) }, { label: "Released", value: formatCurrency(totals.released) }, { label: "Spent", value: formatCurrency(totals.spent) }, { label: "Available", value: formatCurrency(totals.available) }].map((metric) => <span key={metric.label} className="rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-3"><span className="block text-sm font-semibold text-[var(--text)]">{metric.value}</span><span className="mt-1 block text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">{metric.label}</span></span>)}</div><div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full" style={{ width: `${totals.utilization}%`, background: area.color }} /></div><span className="text-[10px] font-semibold text-[var(--text-muted)]">{totals.utilization}% utilized</span></div></button>; })}</div></section>
  </div>;
}

function AreaFinanceDashboard({ area }: { area: FinanceArea }) {
  const navigate = useNavigate();
  const totals = areaTotals(area);
  const [selectedProject, setSelectedProject] = useState<FinanceProject | null>(null);
  const sortedProjects = useMemo(() => [...area.projects].sort((a, b) => b.approved - a.approved), [area.projects]);

  return <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
    <button type="button" onClick={() => navigate("/finance/dashboard")} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"><ArrowLeft size={16} />Back to overall finances</button>
    <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white shadow-[0_28px_80px_rgba(5,150,105,.18)] sm:p-8"><div className="absolute -right-20 -top-24 size-72 rounded-full border border-white/10" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><span className="size-1.5 rounded-full" style={{ background: area.color }} />Thematic finance dashboard</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{area.name}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Project-wise budget control, fund-flow visibility, verified expenditure, commitments and compliance exceptions.</p></div><div className="rounded-2xl border border-white/15 bg-black/15 p-4 backdrop-blur"><div className="flex items-end justify-between gap-12"><span className="text-[10px] text-white/60">Budget utilized</span><span className="text-2xl font-semibold">{totals.utilization}%</span></div><div className="mt-3 h-1.5 w-56 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${totals.utilization}%` }} /></div></div></div></section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Approved budget", value: formatCurrency(totals.approved), note: `${area.projects.length} projects`, icon: Landmark }, { label: "Funds released", value: formatCurrency(totals.released), note: `${Math.round(totals.released / totals.approved * 100)}% release rate`, icon: WalletCards }, { label: "Verified expenditure", value: formatCurrency(totals.spent), note: `${totals.utilization}% utilization`, icon: ReceiptIndianRupee }, { label: "Committed", value: formatCurrency(totals.committed), note: "POs and signed contracts", icon: FileCheck2 }, { label: "Available balance", value: formatCurrency(totals.available), note: "Net of commitments", icon: Banknote }, { label: "Pending advances", value: formatCurrency(totals.pendingAdvances), note: "Settlement evidence due", icon: Clock3 }, { label: "Action required", value: String(totals.atRisk), note: "Projects outside threshold", icon: AlertTriangle }, { label: "Voucher compliance", value: "93%", note: "Complete supporting records", icon: ShieldCheck }].map((item) => { const Icon = item.icon; return <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Icon size={18} /></span><p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-[10px] text-[var(--text-subtle)]">{item.note}</p></article>; })}</section>

    <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]"><div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:items-end sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Project-wise financial details</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Approved, released, spent, committed and unsettled amounts for every {area.name} project</p></div><span className="text-[10px] text-[var(--text-subtle)]">Click a project for its finance control sheet</span></div><div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left"><thead><tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[9px] uppercase tracking-[0.12em] text-[var(--text-subtle)]"><th className="px-6 py-4 font-semibold">Project</th><th className="px-4 py-4 font-semibold">Approved</th><th className="px-4 py-4 font-semibold">Released</th><th className="px-4 py-4 font-semibold">Spent</th><th className="px-4 py-4 font-semibold">Committed</th><th className="px-4 py-4 font-semibold">Available</th><th className="px-4 py-4 font-semibold">Advances</th><th className="px-4 py-4 font-semibold">Utilization</th><th className="px-4 py-4 font-semibold">Status</th><th className="px-6 py-4 text-right font-semibold">Action</th></tr></thead><tbody>{sortedProjects.map((project) => { const available = Math.max(0, project.approved - project.spent - project.committed); return <tr key={project.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-soft)]"><td className="px-6 py-4"><p className="text-xs font-semibold text-[var(--text)]">{project.name}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{project.id} · {project.donor} · {project.location}</p></td><td className="px-4 py-4 text-xs font-medium text-[var(--text)]">{formatCurrency(project.approved)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.released)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.spent)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.committed)}</td><td className="px-4 py-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(available)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(project.pendingAdvances)}</td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${project.utilization}%` }} /></div><span className="text-[10px] font-semibold text-[var(--text-muted)]">{project.utilization}%</span></div></td><td className="px-4 py-4"><span className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold", statusStyles[project.status])}>{project.status}</span></td><td className="px-6 py-4 text-right"><button type="button" onClick={() => setSelectedProject(project)} className="focus-ring rounded-lg px-3 py-2 text-[10px] font-semibold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400">View ledger</button></td></tr>; })}</tbody></table></div></section>
    <ProjectFinanceSheet project={selectedProject} onClose={() => setSelectedProject(null)} />
  </motion.div>;
}

function ProjectFinanceSheet({ project, onClose }: { project: FinanceProject | null; onClose: () => void }) {
  const available = project ? Math.max(0, project.approved - project.spent - project.committed) : 0;
  const checks = project ? [
    { label: "Bank reconciliation", ok: true },
    { label: "Voucher documentation", ok: project.status !== "Action required" },
    { label: "Advance settlement", ok: project.pendingAdvances < project.approved * .02 },
    { label: "Budget variance reviewed", ok: true },
  ] : [];
  return (
    <Overlay
      open={Boolean(project)}
      onClose={onClose}
      variant="panel"
      size="md"
      label="Project finance control sheet"
      labelColor="var(--brand-primary)"
      title={project?.name ?? ""}
      description={project ? `${project.id} · ${project.donor} · ${project.location}` : ""}
    >
      {project && <>
        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Approved", value: formatCurrency(project.approved, true) }, { label: "Released", value: formatCurrency(project.released, true) }, { label: "Verified spend", value: formatCurrency(project.spent, true) }, { label: "Committed", value: formatCurrency(project.committed, true) }, { label: "Available", value: formatCurrency(available, true) }, { label: "Pending advances", value: formatCurrency(project.pendingAdvances, true) }].map((item) => <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="text-[9px] uppercase tracking-wide text-[var(--text-subtle)]">{item.label}</p><p className="mt-2 text-lg font-semibold text-[var(--text)]">{item.value}</p></div>)}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-end justify-between"><span><span className="block text-[9px] uppercase tracking-[0.16em] text-slate-500">Budget utilization</span><span className="mt-2 block text-3xl font-semibold text-emerald-300">{project.utilization}%</span></span><TrendingUp size={22} className="text-emerald-300" /></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${project.utilization}%` }} /></div>
            <div className="mt-6"><h3 className="text-xs font-semibold">Control checks</h3><div className="mt-3 space-y-2">{checks.map((check) => <div key={check.label} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-3 text-[10px]"><span className="text-slate-300">{check.label}</span><span className={cn("flex items-center gap-1.5 font-semibold", check.ok ? "text-emerald-300" : "text-amber-300")}>{check.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}{check.ok ? "Complete" : "Follow-up"}</span></div>)}</div></div>
          </div>
          <div className="mt-6 rounded-2xl border border-[var(--border)] p-5">
            <h3 className="text-xs font-semibold text-[var(--text)]">Latest accounting position</h3>
            <div className="mt-4 space-y-3 text-[10px]">{[{ label: "Last voucher posted", value: project.lastVoucherDate }, { label: "Next finance review", value: "08 Aug 2026" }, { label: "Reporting currency", value: "INR" }, { label: "Cost-center status", value: project.status }].map((item) => <div key={item.label} className="flex justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"><span className="text-[var(--text-subtle)]">{item.label}</span><span className="font-medium text-[var(--text)]">{item.value}</span></div>)}</div>
          </div>
        </div>
      </>}
    </Overlay>
  );
}
