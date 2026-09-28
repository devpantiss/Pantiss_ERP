import { ArrowUpRight, CalendarRange, ChevronDown, MapPin, Search, Target, UserRound, UsersRound, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "./data";
import { cn } from "../../utils/cn";
import { ProjectOnboarding } from "../projects/ProjectOnboarding";

const statusStyles = {
  "On track": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "At risk": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Completed: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
};

export function ProjectsView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All thematic areas");
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const areas = ["All thematic areas", ...new Set(projects.map((project) => project.area))];
  const filtered = useMemo(() => projects.filter((project) => {
    const matchesArea = area === "All thematic areas" || project.area === area;
    const search = query.trim().toLowerCase();
    return matchesArea && (!search || `${project.name} ${project.id} ${project.location}`.toLowerCase().includes(search));
  }), [area, query]);
  const selected = projects.find((project) => project.id === selectedId) ?? filtered[0] ?? projects[0];

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6 lg:flex-row lg:items-center">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">Project portfolio</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">Choose a project to inspect</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Review delivery progress, funding and the latest reported outcome.</p></div>
        <div className="flex flex-wrap gap-2">
          <ProjectOnboarding areas={areas.slice(1)} />
          <label className="relative min-w-0 flex-1 sm:w-64 sm:flex-none"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" className="focus-ring h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none" /></label>
          <label className="relative"><select value={area} onChange={(event) => setArea(event.target.value)} className="focus-ring h-11 appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-3 pr-9 text-xs text-[var(--text-muted)] outline-none">{areas.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /></label>
        </div>
      </section>

      <section className="grid min-h-[620px] gap-5 xl:grid-cols-[minmax(290px,.72fr)_minmax(0,1.28fr)]">
        <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4"><span className="text-xs font-semibold text-[var(--text)]">{filtered.length} projects</span><span className="text-[10px] text-[var(--text-subtle)]">Updated today</span></div>
          <div className="max-h-[700px] space-y-1 overflow-y-auto p-2">
            {filtered.map((project) => (
              <button key={project.id} type="button" onClick={() => setSelectedId(project.id)} className={cn("focus-ring w-full rounded-2xl border p-4 text-left transition-all", selected.id === project.id ? "border-red-500/25 bg-red-500/[0.07]" : "border-transparent hover:bg-[var(--surface-soft)]")}>
                <div className="flex items-start justify-between gap-3"><span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">{project.id}</span><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", statusStyles[project.status])}>{project.status}</span></div>
                <h3 className="mt-2 text-sm font-semibold leading-5 text-[var(--text)]">{project.name}</h3><p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[var(--text-subtle)]"><MapPin size={11} />{project.location}</p>
                <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400" style={{ width: `${project.progress}%` }} /></div><span className="text-[10px] font-semibold text-[var(--text-muted)]">{project.progress}%</span></div>
              </button>
            ))}
            {filtered.length === 0 && <div className="px-4 py-14 text-center text-xs text-[var(--text-subtle)]">No projects match your filters.</div>}
          </div>
        </div>

        <article className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
          <div className="relative overflow-hidden border-b border-[var(--border)] p-6 sm:p-7"><div className="absolute right-0 top-0 size-48 rounded-full bg-red-500/10 blur-3xl" /><div className="relative"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">{selected.area}</span><span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", statusStyles[selected.status])}>{selected.status}</span></div><h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.035em] text-[var(--text)] sm:text-3xl">{selected.name}</h2><p className="mt-2 text-xs text-[var(--text-subtle)]">{selected.id} · {selected.location}</p></div></div>
          <div className="p-6 sm:p-7">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[{ label: "Responsible programme manager", value: selected.manager, icon: UserRound }, { label: "Implementation period", value: selected.period, icon: CalendarRange }, { label: "Verified beneficiaries", value: selected.beneficiaries, icon: UsersRound }, { label: "Monitored grant allocation", value: selected.budget, icon: Wallet }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><Icon size={16} className="text-red-500" /><p className="mt-4 text-[9px] uppercase tracking-wide text-[var(--text-subtle)]">{item.label}</p><p className="mt-1 text-xs font-semibold text-[var(--text)]">{item.value}</p></div>; })}
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--text)]">Logframe output achievement</span><span className="text-xl font-semibold text-red-500">{selected.progress}%</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-red-700 via-red-500 to-rose-400" style={{ width: `${selected.progress}%` }} /></div><div className="mt-4 flex justify-between text-[10px] text-[var(--text-subtle)]"><span>Baseline</span><span>End-line target</span></div></div>
              <div className="rounded-2xl border border-[var(--border)] p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--text)]">Verified grant utilization</span><span className="text-[10px] text-[var(--text-subtle)]">Expenditure {selected.spent}</span></div><div className="mt-5 flex items-end gap-2"><span className="text-2xl font-semibold text-[var(--text)]">{selected.spent}</span><span className="pb-1 text-[10px] text-[var(--text-subtle)]">of {selected.budget}</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full w-[68%] rounded-full bg-emerald-500" /></div></div>
            </div>
            <div className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[0.06] p-5"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-500"><Target size={17} /></span><div><p className="text-xs font-semibold text-[var(--text)]">Latest verified outcome evidence</p><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{selected.outcome}</p></div></div></div>
            <div className="mt-6 flex justify-end"><button type="button" onClick={() => navigate(`/monitoring-evaluation/projects/${selected.id}`)} className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-semibold text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700">Open full project record<ArrowUpRight size={15} /></button></div>
          </div>
        </article>
      </section>
    </div>
  );
}
