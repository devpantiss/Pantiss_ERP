import { Check, ChevronDown, Download, Eye, FileBarChart, FileImage, FileText, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { projects, reportTemplates } from "./data";
import { cn } from "../../utils/cn";

const reportIcons = { mpr: FileBarChart, qpr: FileBarChart, commencement: FileText, "coffee-table": FileImage, photobook: FileImage };

export function ReportsView() {
  const [selectedId, setSelectedId] = useState("mpr");
  const [projectId, setProjectId] = useState(projects[0].id);
  const [period, setPeriod] = useState("July 2026");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const selected = reportTemplates.find((report) => report.id === selectedId) ?? reportTemplates[0];
  const project = projects.find((item) => item.id === projectId) ?? projects[0];

  useEffect(() => setGenerated(false), [selectedId, projectId, period]);

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 900);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-500">Report library</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">Generate program reports</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Choose a template, configure the scope and preview the output before export.</p></div><span className="flex w-fit items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-3 py-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"><Check size={13} />Data synced 6 minutes ago</span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {reportTemplates.map((report) => {
            const Icon = reportIcons[report.id as keyof typeof reportIcons];
            const active = selected.id === report.id;
            return <button key={report.id} type="button" onClick={() => setSelectedId(report.id)} className={cn("focus-ring rounded-2xl border p-4 text-left transition-all", active ? "border-red-500/30 bg-red-500/[0.07] shadow-[0_12px_30px_rgba(220,38,38,.08)]" : "border-[var(--border)] hover:bg-[var(--surface-soft)]")}><span className={cn("grid size-9 place-items-center rounded-xl", active ? "bg-red-600 text-white" : "bg-[var(--surface-strong)] text-[var(--text-muted)]")}><Icon size={17} /></span><span className="mt-4 block text-xs font-semibold text-[var(--text)]">{report.name}</span><span className="mt-1 block text-[9px] text-[var(--text-subtle)]">{report.cadence}</span></button>;
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="h-fit rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><Sparkles size={18} /></span><div><h3 className="text-sm font-semibold text-[var(--text)]">Report setup</h3><p className="text-[10px] text-[var(--text-subtle)]">Configure your output</p></div></div>
          <div className="mt-6 space-y-5">
            <label className="block"><span className="mb-2 block text-[10px] font-semibold text-[var(--text-muted)]">Project</span><span className="relative block"><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="focus-ring h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 pr-9 text-xs text-[var(--text)] outline-none">{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /></span></label>
            <label className="block"><span className="mb-2 block text-[10px] font-semibold text-[var(--text-muted)]">Reporting period</span><span className="relative block"><select value={period} onChange={(event) => setPeriod(event.target.value)} className="focus-ring h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 pr-9 text-xs text-[var(--text)] outline-none"><option>July 2026</option><option>Q2 · 2026–27</option><option>FY 2025–26</option><option>Project inception</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /></span></label>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="text-[10px] font-semibold text-[var(--text)]">Include in report</p>{["Indicator performance", "Financial summary", "Risk register", "Field photographs"].map((item, index) => <label key={item} className="mt-3 flex items-center gap-2 text-[10px] text-[var(--text-muted)]"><input type="checkbox" defaultChecked={index < 3} className="size-3.5 accent-red-600" />{item}</label>)}</div>
            <button type="button" onClick={generate} disabled={generating} className="focus-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-600/15 transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-70">{generating ? <><LoaderCircle size={15} className="animate-spin" />Generating…</> : generated ? <><RefreshCw size={15} />Regenerate report</> : <><Sparkles size={15} />Generate report</>}</button>
          </div>
          <div className="mt-5 border-t border-[var(--border)] pt-4 text-[9px] leading-4 text-[var(--text-subtle)]">Last generated {selected.lastGenerated} · Approx. {selected.pages} pages</div>
        </aside>

        <article className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-red-500/10 text-red-500"><Eye size={16} /></span><div><h3 className="text-xs font-semibold text-[var(--text)]">Document preview</h3><p className="text-[9px] text-[var(--text-subtle)]">{selected.name} · {period}</p></div></div><button type="button" className="focus-ring inline-flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-[10px] font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-soft)]"><Download size={14} />Export PDF</button></div>
          <div className="bg-[var(--surface-soft)] p-4 sm:p-7">
            <div className="mx-auto min-h-[720px] max-w-[680px] rounded-sm bg-white p-7 text-slate-900 shadow-[0_18px_60px_rgba(0,0,0,.12)] sm:p-10">
              <div className="flex items-start justify-between border-b border-slate-200 pb-6"><img src="/pantiss-logo.png" alt="Pantiss" className="h-11 w-auto object-contain" /><div className="text-right"><p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-red-600">Monitoring & Evaluation</p><p className="mt-1 text-[9px] text-slate-400">Generated 03 Aug 2026</p></div></div>
              <div className="py-10"><span className="rounded-full bg-red-50 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-red-600">{selected.cadence} report</span><h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{selected.name}</h2><p className="mt-3 text-sm font-medium text-slate-600">{project.name}</p><p className="mt-1 text-xs text-slate-400">Reporting period · {period}</p><p className="mt-7 max-w-xl text-xs leading-5 text-slate-500">{selected.description}</p></div>
              <div className="grid grid-cols-3 gap-3 border-y border-slate-200 py-6">{[{ label: "Outputs achieved", value: `${project.progress}%` }, { label: "Verified reach", value: project.beneficiaries }, { label: "Grant utilized", value: project.spent }].map((item) => <div key={item.label}><p className="text-xl font-bold text-slate-900">{item.value}</p><p className="mt-1 text-[9px] uppercase tracking-wide text-slate-400">{item.label}</p></div>)}</div>
              <div className="mt-8"><div className="flex items-center justify-between"><h3 className="text-xs font-bold text-slate-800">Verified achievement against outcome indicators</h3><span className="text-[9px] text-slate-400">Current reporting period</span></div><div className="mt-5 flex h-32 items-end gap-3">{[48, 67, 59, 82, 74, 91, project.progress].map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t bg-gradient-to-t from-red-700 to-rose-400" style={{ height: `${value}%` }} /><span className="text-[8px] text-slate-400">W{index + 1}</span></div>)}</div></div>
              <div className="mt-10 rounded-lg bg-slate-50 p-5"><p className="text-[10px] font-bold text-slate-800">M&E observation</p><p className="mt-2 text-[10px] leading-5 text-slate-500">{project.outcome} Available evidence indicates that implementation remains aligned with the approved results framework; the next field verification will validate outcome sustainability.</p></div>
              {generated && <div className="mt-8 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[9px] font-medium text-emerald-700"><Check size={13} />Preview regenerated with the latest synchronized data.</div>}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
