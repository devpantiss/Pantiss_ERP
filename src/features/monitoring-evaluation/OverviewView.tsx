import { Activity, ArrowUpRight, Banknote, BriefcaseBusiness, CheckCircle2, ChevronLeft, MapPin, Target, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projects, thematicAreas, type ThematicAreaMetric } from "./data";

const kpis = [
  { label: "Active social-sector projects", value: "44", change: "Across 7 thematic areas", icon: BriefcaseBusiness },
  { label: "Verified beneficiaries", value: "83.2K", change: "92% records evidence-verified", icon: UsersRound },
  { label: "Outcome indicators on track", value: "72%", change: "+4.2 points this quarter", icon: Target },
  { label: "Grant utilization verified", value: "₹11.3 Cr", change: "68% of approved allocation", icon: Banknote },
];

const thematicKpiIcons = [UsersRound, CheckCircle2, Target, Activity];

export function OverviewView() {
  const [selectedArea, setSelectedArea] = useState<ThematicAreaMetric | null>(null);

  const openThematicArea = (area: ThematicAreaMetric) => {
    if (area.name !== "Skill Development") return;
    setSelectedArea(area);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  const closeThematicArea = () => {
    setSelectedArea(null);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  if (selectedArea) {
    return <ThematicAreaDashboard area={selectedArea} onBack={closeThematicArea} />;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-red-500/15 bg-gradient-to-br from-red-700 via-red-600 to-rose-500 p-6 text-white shadow-[0_24px_70px_rgba(220,38,38,.18)] sm:p-8">
        <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/10" aria-hidden />
        <div className="absolute -right-4 -top-10 size-44 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]"><Activity size={13} /> Portfolio pulse</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Impact across all thematic areas</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">A consolidated M&E view of social-development project delivery, verified reach, outcome achievement and grant utilization across Pantiss programmes.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/10 px-4 py-3 backdrop-blur">
            <span className="grid size-9 place-items-center rounded-xl bg-white/15"><CheckCircle2 size={18} /></span>
            <span><span className="block text-lg font-semibold">87%</span><span className="block text-[10px] text-white/60">Monthly data validated</span></span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Portfolio summary">
        {kpis.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article key={item.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><Icon size={18} /></span>
                <ArrowUpRight size={15} className="text-[var(--text-subtle)]" />
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
              <p className="mt-3 text-[10px] text-emerald-500">{item.change}</p>
            </motion.article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
        <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><h3 className="text-base font-semibold text-[var(--text)]">Results framework performance</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Monthly verified indicator achievement against approved logframes</p></div>
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-500">+8.4%</span>
          </div>
          <div className="mt-7 h-[220px] w-full" role="img" aria-label="Outcome performance trending upward from January to July">
            <svg viewBox="0 0 720 220" className="size-full overflow-visible" preserveAspectRatio="none">
              {[20, 70, 120, 170, 220].map((y) => <line key={y} x1="0" y1={y} x2="720" y2={y} stroke="currentColor" className="text-[var(--border)]" strokeWidth="1" />)}
              <defs><linearGradient id="outcome-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity=".26" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 177 C55 166, 70 170, 118 143 S190 153, 240 116 S320 128, 360 96 S440 112, 480 72 S565 86, 600 51 S670 64, 720 30 L720 220 L0 220 Z" fill="url(#outcome-fill)" />
              <path d="M0 177 C55 166, 70 170, 118 143 S190 153, 240 116 S320 128, 360 96 S440 112, 480 72 S565 86, 600 51 S670 64, 720 30" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 145 C90 142, 150 135, 240 124 S400 102, 480 89 S620 65, 720 54" fill="none" stroke="currentColor" className="text-[var(--text-subtle)]" opacity=".35" strokeWidth="1.5" strokeDasharray="7 8" />
            </svg>
          </div>
          <div className="mt-2 grid grid-cols-7 text-center text-[9px] uppercase tracking-wide text-[var(--text-subtle)]">{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => <span key={month}>{month}</span>)}</div>
        </article>

        <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div><h3 className="text-base font-semibold text-[var(--text)]">Implementation status</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Projects classified through the latest M&E review</p></div>
          <div className="mx-auto mt-7 grid size-40 place-items-center rounded-full" style={{ background: "conic-gradient(#22c55e 0 68%, #f59e0b 68% 87%, #e5e7eb 87% 100%)" }}>
            <div className="grid size-28 place-items-center rounded-full bg-[var(--module-bg)] text-center"><span><span className="block text-3xl font-semibold text-[var(--text)]">44</span><span className="text-[10px] text-[var(--text-subtle)]">projects</span></span></div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-2 text-center">
            {[{ label: "On track", value: "30", color: "bg-emerald-500" }, { label: "At risk", value: "8", color: "bg-amber-500" }, { label: "Complete", value: "6", color: "bg-slate-300" }].map((item) => (
              <div key={item.label}><span className={`mx-auto mb-2 block size-1.5 rounded-full ${item.color}`} /><span className="block text-sm font-semibold text-[var(--text)]">{item.value}</span><span className="text-[9px] text-[var(--text-subtle)]">{item.label}</span></div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h3 className="text-base font-semibold text-[var(--text)]">Thematic area performance</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Verified outcome progress, beneficiary reach and approved allocation</p></div><span className="w-fit rounded-xl border border-red-500/20 bg-red-500/[0.05] px-3 py-2 text-[10px] text-red-600 dark:text-red-400">Skill Development dashboard available</span></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {thematicAreas.map((area) => {
            const available = area.name === "Skill Development";
            const content = <><div className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2.5"><span className="size-2 rounded-full" style={{ background: area.color }} /><span className="truncate text-xs font-semibold text-[var(--text)]">{area.name}</span></span><span className="text-xs font-semibold text-[var(--text)]">{area.progress}%</span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full" style={{ width: `${area.progress}%`, background: area.color }} /></div><div className="mt-4 flex items-center justify-between text-[10px] text-[var(--text-subtle)]"><span>{area.projects} projects</span><span>{area.reach} verified</span><span className="flex items-center gap-1">{area.budget}{available && <ArrowUpRight size={11} className="opacity-50 transition-opacity group-hover:opacity-100" />}</span></div></>;
            return available
              ? <button type="button" key={area.name} onClick={() => openThematicArea(area)} className="focus-ring group rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-red-500/35 hover:shadow-[0_12px_30px_rgba(220,38,38,.08)]" aria-label="Open Skill Development dashboard">{content}</button>
              : <article key={area.name} aria-disabled="true" className="cursor-default rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-left opacity-65">{content}</article>;
          })}
        </div>
      </section>
    </div>
  );
}

function ThematicAreaDashboard({ area, onBack }: { area: ThematicAreaMetric; onBack: () => void }) {
  const navigate = useNavigate();
  const areaProjects = projects.filter((project) => project.area === area.name);
  const trend = [Math.max(22, area.progress - 26), area.progress - 19, area.progress - 14, area.progress - 10, area.progress - 5, area.progress];

  return (
    <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <button type="button" onClick={onBack} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]">
        <ChevronLeft size={16} />Back to overall dashboard
      </button>

      <section className="relative overflow-hidden rounded-[28px] border border-red-500/15 bg-gradient-to-br from-red-800 via-red-600 to-rose-500 p-6 text-white shadow-[0_24px_70px_rgba(220,38,38,.18)] sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]"><span className="size-1.5 rounded-full bg-white" />Thematic M&E dashboard</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{area.name}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Focused evidence view of Pantiss social-development projects, verified beneficiaries, logframe indicators and utilization within {area.name}.</p></div>
          <div className="min-w-44 rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur"><div className="flex items-end justify-between"><span className="text-[10px] text-white/60">Indicators achieved</span><span className="text-2xl font-semibold">{area.progress}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white" style={{ width: `${area.progress}%` }} /></div></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {area.kpis.map((item, index) => { const Icon = thematicKpiIcons[index]; return <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><Icon size={18} /></span><p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-[10px] text-[var(--text-subtle)]">{item.note}</p></article>; })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-start justify-between"><div><h3 className="text-base font-semibold text-[var(--text)]">Verified outcome trend</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Six-month cumulative logframe achievement</p></div><span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-500">On track</span></div>
          <div className="mt-8 flex h-56 items-end gap-3 sm:gap-5">{trend.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2"><span className="text-center text-[9px] font-semibold text-[var(--text-subtle)]">{value}%</span><div className="w-full rounded-t-lg bg-gradient-to-t from-red-700 to-rose-400 transition-all" style={{ height: `${value}%` }} /><span className="text-center text-[9px] text-[var(--text-subtle)]">{["Feb", "Mar", "Apr", "May", "Jun", "Jul"][index]}</span></div>)}</div>
        </article>
        <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><h3 className="text-base font-semibold text-[var(--text)]">{area.name} outcome indicators</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Sector-specific verified performance against approved targets</p><div className="mt-6 space-y-5">{area.indicators.map((indicator) => <div key={indicator.label}><div className="flex items-center justify-between text-xs"><span className="text-[var(--text-muted)]">{indicator.label}</span><span className="font-semibold text-[var(--text)]">{indicator.value}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400" style={{ width: `${indicator.value}%` }} /></div></div>)}</div></article>
      </section>

      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex items-end justify-between gap-4"><div><h3 className="text-base font-semibold text-[var(--text)]">Projects in {area.name}</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Current delivery portfolio for this thematic area</p></div><span className="text-[10px] text-[var(--text-subtle)]">{areaProjects.length || area.projects} active</span></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {areaProjects.length > 0 ? areaProjects.map((project) => <article key={project.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-red-500">{project.id}</p><h4 className="mt-2 text-sm font-semibold text-[var(--text)]">{project.name}</h4></div><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-500">{project.status}</span></div><p className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--text-subtle)]"><MapPin size={11} />{project.location}</p><div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400" style={{ width: `${project.progress}%` }} /></div><span className="text-[10px] font-semibold text-[var(--text-muted)]">{project.progress}%</span></div><button type="button" onClick={() => navigate(`/monitoring-evaluation/projects/${project.id}`)} className="focus-ring mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[10px] font-semibold text-red-600 transition-colors hover:bg-red-500/[0.12] dark:text-red-400">Open full project record<ArrowUpRight size={13} /></button></article>) : <div className="col-span-full rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] px-5 py-10 text-center"><BriefcaseBusiness size={22} className="mx-auto text-red-500" /><p className="mt-3 text-sm font-semibold text-[var(--text)]">{area.projects} projects in the portfolio</p><p className="mt-1 text-xs text-[var(--text-subtle)]">Project-level records are being synchronized for this thematic area.</p></div>}
        </div>
      </section>
    </motion.div>
  );
}
