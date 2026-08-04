import {
  ArrowUpRight,
  Award,
  BookOpenCheck,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Download,
  Search,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  employeeStudyData,
  studyReportPeriods,
  thematicAreas,
  type EmployeeStudyRecord,
  type StudyRating,
} from "./data";
import { cn } from "../../utils/cn";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared helpers
   ───────────────────────────────────────────────────────────────────────────── */

const ratingStyles: Record<StudyRating, string> = {
  Excellent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Good: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Needs Improvement": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Critical: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-500";
  if (score >= 70) return "text-blue-500";
  if (score >= 55) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 85) return "bg-emerald-500/10";
  if (score >= 70) return "bg-blue-500/10";
  if (score >= 55) return "bg-amber-500/10";
  return "bg-red-500/10";
}

/* ─────────────────────────────────────────────────────────────────────────────
   Root view — switches between area selector and performance dashboard
   ───────────────────────────────────────────────────────────────────────────── */

export function EmployeeStudyReportView() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  if (selectedArea) {
    return (
      <PerformanceDashboard
        areaName={selectedArea}
        onBack={() => {
          setSelectedArea(null);
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }}
      />
    );
  }

  return <ThematicAreaSelector onSelect={(name) => { setSelectedArea(name); window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Phase 1 — Thematic Area Selector
   ───────────────────────────────────────────────────────────────────────────── */

function ThematicAreaSelector({ onSelect }: { onSelect: (areaName: string) => void }) {
  /* Compute summary for each area from the latest period */
  const areaSummaries = useMemo(() => {
    return thematicAreas.map((area) => {
      const periodData = employeeStudyData[area.name];
      const latest = periodData?.[0];
      const employees = latest?.employees ?? [];
      const count = employees.length;
      const avgKpi = count ? Math.round(employees.reduce((s, e) => s + Math.round((e.kpisCompleted / e.kpisTarget) * 100), 0) / count) : 0;
      const avgScore = count ? Math.round(employees.reduce((s, e) => s + e.evidenceScore, 0) / count) : 0;
      const excellentCount = employees.filter((e) => e.overallRating === "Excellent").length;
      return { ...area, employeeCount: count, avgKpi, avgScore, excellentCount };
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-[28px] border border-red-500/15 bg-gradient-to-br from-red-700 via-red-600 to-rose-500 p-6 text-white shadow-[0_24px_70px_rgba(220,38,38,.18)] sm:p-8">
        <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/10" aria-hidden />
        <div className="absolute -right-4 -top-10 size-44 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
              <BookOpenCheck size={13} />
              Study report
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Employee study report</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              Select a division or thematic area to view individual employee performance data, KPI achievement, field verification and evidence-quality trends.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-black/10 px-4 py-3 backdrop-blur">
            <span className="grid size-9 place-items-center rounded-xl bg-white/15"><UsersRound size={18} /></span>
            <span>
              <span className="block text-lg font-semibold">{areaSummaries.reduce((s, a) => s + a.employeeCount, 0)}</span>
              <span className="block text-[10px] text-white/60">Reporting officers</span>
            </span>
          </div>
        </div>
      </section>

      {/* Area cards heading */}
      <div>
        <h3 className="text-base font-semibold text-[var(--text)]">Select a thematic area</h3>
        <p className="mt-1 text-xs text-[var(--text-subtle)]">Click on a division to view its employee performance dashboard</p>
      </div>

      {/* Area cards grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {areaSummaries.map((area, index) => (
          <motion.button
            key={area.name}
            type="button"
            onClick={() => onSelect(area.name)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="focus-ring group rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-red-500/25 hover:shadow-[0_16px_40px_rgba(220,38,38,.1)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="size-2.5 rounded-full" style={{ background: area.color }} />
                <span className="text-sm font-semibold text-[var(--text)]">{area.name}</span>
              </div>
              <ArrowUpRight size={15} className="text-[var(--text-subtle)] opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <p className="text-xl font-semibold text-[var(--text)]">{area.employeeCount}</p>
                <p className="mt-1 text-[9px] text-[var(--text-subtle)]">Employees</p>
              </div>
              <div>
                <p className="text-xl font-semibold text-[var(--text)]">{area.avgKpi}%</p>
                <p className="mt-1 text-[9px] text-[var(--text-subtle)]">Avg KPI</p>
              </div>
              <div>
                <p className={cn("text-xl font-semibold", scoreColor(area.avgScore))}>{area.avgScore}</p>
                <p className="mt-1 text-[9px] text-[var(--text-subtle)]">Evidence score</p>
              </div>
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <div className="h-full rounded-full transition-all" style={{ width: `${area.avgKpi}%`, background: area.color }} />
            </div>

            <div className="mt-4 flex items-center justify-between text-[9px] text-[var(--text-subtle)]">
              <span>{area.projects} projects</span>
              <span>{area.excellentCount ? `${area.excellentCount} excellent` : "No top ratings"}</span>
            </div>
          </motion.button>
        ))}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Phase 2 — Performance Dashboard
   ───────────────────────────────────────────────────────────────────────────── */

function PerformanceDashboard({ areaName, onBack }: { areaName: string; onBack: () => void }) {
  const [period, setPeriod] = useState(studyReportPeriods[0]);
  const [query, setQuery] = useState("");

  const area = thematicAreas.find((a) => a.name === areaName)!;
  const allPeriods = useMemo(() => employeeStudyData[areaName] ?? [], [areaName]);
  const currentPeriod = useMemo(() => allPeriods.find((p) => p.period === period), [allPeriods, period]);
  const employees = useMemo(() => currentPeriod?.employees ?? [], [currentPeriod]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return employees;
    return employees.filter((e) => `${e.name} ${e.role} ${e.id}`.toLowerCase().includes(search));
  }, [query, employees]);

  /* ── Summary KPIs ── */
  const count = employees.length;
  const avgKpi = count ? Math.round(employees.reduce((s, e) => s + Math.round((e.kpisCompleted / e.kpisTarget) * 100), 0) / count) : 0;
  const avgEvidence = count ? Math.round(employees.reduce((s, e) => s + e.evidenceScore, 0) / count) : 0;
  const avgActivities = count ? Math.round(employees.reduce((s, e) => s + Math.round((e.activitiesCompleted / e.activitiesPlanned) * 100), 0) / count) : 0;

  /* ── Trend data (avg KPI per month, chronological order) ── */
  const trend = useMemo(() => {
    return [...allPeriods].reverse().map((p) => {
      const n = p.employees.length;
      const avg = n ? Math.round(p.employees.reduce((s, e) => s + Math.round((e.kpisCompleted / e.kpisTarget) * 100), 0) / n) : 0;
      return { month: p.period.split(" ")[0].slice(0, 3), avg };
    });
  }, [allPeriods]);

  const kpiCards = [
    { label: "M&E accountable staff", value: String(count), note: `Active in ${area.name}`, icon: UsersRound },
    { label: "Learner-outcome KPIs met", value: `${avgKpi}%`, note: "Enrollment-to-retention milestones", icon: Target },
    { label: "Monitoring actions closed", value: `${avgActivities}%`, note: `${employees.reduce((s, e) => s + e.fieldDays, 0)} center / field days`, icon: ClipboardList },
    { label: "Evidence completeness", value: `${avgEvidence}%`, note: avgEvidence >= 80 ? "Above data-quality threshold" : "Below data-quality threshold", icon: Award },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      {/* Back */}
      <button type="button" onClick={onBack} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]">
        <ChevronLeft size={16} />Back to all areas
      </button>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] border border-red-500/15 bg-gradient-to-br from-red-800 via-red-600 to-rose-500 p-6 text-white shadow-[0_24px_70px_rgba(220,38,38,.18)] sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" aria-hidden />
        <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em]">
              <span className="size-1.5 rounded-full" style={{ background: area.color }} />
              Employee study report
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{area.name}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
              Accountability for learner-outcome milestones, center monitoring visits, safeguarding and evidence quality across reporting periods.
            </p>
          </div>
          <div className="min-w-44 rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur">
            <div className="flex items-end justify-between">
              <span className="text-[10px] text-white/60">Outcome KPI delivery</span>
              <span className="text-2xl font-semibold">{avgKpi}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white" style={{ width: `${avgKpi}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* KPI summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article key={item.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
              <span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><Icon size={18} /></span>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p>
              <p className="mt-3 text-[10px] text-[var(--text-subtle)]">{item.note}</p>
            </motion.article>
          );
        })}
      </section>

      {/* Trend + table row */}
      <section className="grid gap-5 xl:grid-cols-[minmax(320px,.45fr)_minmax(0,1fr)]">
        {/* Trend chart */}
        <article className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">Outcome KPI trend</h3>
              <p className="mt-1 text-xs text-[var(--text-subtle)]">Average skilling milestone delivery over time</p>
            </div>
            <span className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-500">
              <TrendingUp size={12} />
              {trend.length >= 2 ? `${trend[trend.length - 1].avg - trend[0].avg > 0 ? "+" : ""}${trend[trend.length - 1].avg - trend[0].avg}%` : "—"}
            </span>
          </div>
          <div className="mt-8 flex h-48 items-end gap-2.5">
            {trend.map((item, index) => (
              <div key={index} className="flex h-full flex-1 flex-col justify-end gap-2">
                <span className="text-center text-[9px] font-semibold text-[var(--text-subtle)]">{item.avg}%</span>
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    item.month === period.split(" ")[0].slice(0, 3) ? "bg-gradient-to-t from-red-700 to-rose-400" : "bg-gradient-to-t from-red-700/50 to-rose-400/50",
                  )}
                  style={{ height: `${Math.max(8, item.avg)}%` }}
                />
                <span className="text-center text-[9px] text-[var(--text-subtle)]">{item.month}</span>
              </div>
            ))}
          </div>
        </article>

        {/* Employee table card */}
        <article className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
          {/* Table header controls */}
          <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">{area.name} team performance</h3>
              <p className="mt-1 text-xs text-[var(--text-subtle)]">Learner outcomes, center-monitoring actions and evidence quality by accountable employee</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Period filter */}
              <label className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="focus-ring h-10 appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-8 text-xs text-[var(--text-muted)] outline-none"
                >
                  {studyReportPeriods.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              </label>
              {/* Search */}
              <label className="relative min-w-0 flex-1 sm:w-48 sm:flex-none">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search employees"
                  className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
                />
              </label>
              {/* Export */}
              <button type="button" className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]">
                <Download size={14} />Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">
                  <th className="px-6 py-4 font-semibold">Employee</th>
                  <th className="px-5 py-4 font-semibold">Outcome KPIs met</th>
                  <th className="px-5 py-4 font-semibold">Actions closed</th>
                  <th className="px-5 py-4 font-semibold">Center / field days</th>
                  <th className="px-5 py-4 font-semibold">Capacity building</th>
                  <th className="px-5 py-4 font-semibold">Evidence completeness</th>
                  <th className="px-6 py-4 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center text-xs text-[var(--text-subtle)]">No employees match your search.</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${avgKpi}%` }} />
              </div>
              <span className="text-[10px] text-[var(--text-subtle)]">
                Learner-outcome KPI delivery: <strong className="text-[var(--text)]">{avgKpi}%</strong>
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-subtle)]">
              Showing <strong className="text-[var(--text)]">{filtered.length}</strong> of {employees.length} employees · {period}
            </span>
          </div>
        </article>
      </section>

      {/* Rating distribution */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <h3 className="text-base font-semibold text-[var(--text)]">Rating distribution · {period}</h3>
        <p className="mt-1 text-xs text-[var(--text-subtle)]">Overall performance ratings for {area.name} team members</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(["Excellent", "Good", "Needs Improvement", "Critical"] as StudyRating[]).map((rating) => {
            const rCount = employees.filter((e) => e.overallRating === rating).length;
            const pct = count ? Math.round((rCount / count) * 100) : 0;
            return (
              <div key={rating} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <div className="flex items-center justify-between">
                  <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold", ratingStyles[rating])}>{rating}</span>
                  <span className="text-lg font-semibold text-[var(--text)]">{rCount}</span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-2 text-[9px] text-[var(--text-subtle)]">{pct}% of team</p>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Employee row component
   ───────────────────────────────────────────────────────────────────────────── */

function EmployeeRow({ employee }: { employee: EmployeeStudyRecord }) {
  const kpiPct = Math.round((employee.kpisCompleted / employee.kpisTarget) * 100);
  const actPct = Math.round((employee.activitiesCompleted / employee.activitiesPlanned) * 100);

  return (
    <tr className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-soft)]">
      {/* Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-[10px] font-semibold text-red-600 dark:text-red-400">
            {employee.initials}
          </span>
          <span>
            <span className="block text-xs font-semibold text-[var(--text)]">{employee.name}</span>
            <span className="mt-0.5 block text-[9px] text-[var(--text-subtle)]">{employee.role} · {employee.id}</span>
          </span>
        </div>
      </td>
      {/* KPIs */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400" style={{ width: `${kpiPct}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">{employee.kpisCompleted}/{employee.kpisTarget}</span>
        </div>
      </td>
      {/* Activities */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" style={{ width: `${actPct}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">{employee.activitiesCompleted}/{employee.activitiesPlanned}</span>
        </div>
      </td>
      {/* Field days */}
      <td className="px-5 py-4 text-xs font-medium text-[var(--text)]">{employee.fieldDays} days</td>
      {/* Training */}
      <td className="px-5 py-4 text-xs font-medium text-[var(--text)]">{employee.trainingHours} hrs</td>
      {/* Evidence */}
      <td className="px-5 py-4">
        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", scoreBg(employee.evidenceScore), scoreColor(employee.evidenceScore))}>
          {employee.evidenceScore}
        </span>
      </td>
      {/* Rating */}
      <td className="px-6 py-4">
        <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold", ratingStyles[employee.overallRating])}>
          {employee.overallRating}
        </span>
      </td>
    </tr>
  );
}
