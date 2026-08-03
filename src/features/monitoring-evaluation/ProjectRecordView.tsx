import {
  ArrowLeft,
  Banknote,
  CalendarRange,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileText,
  Flag,
  MapPin,
  ShieldCheck,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { projects, thematicAreas, type MonitoringProject } from "./data";
import { SkillProjectRecordView } from "./SkillProjectRecordView";

const tabs = ["Overview", "Results & indicators", "Implementation locations", "Evidence & reports"] as const;
type ProjectTab = typeof tabs[number];

const districtNames: Record<string, string[]> = {
  "Skill Development": ["Keonjhar", "Sundargarh", "Angul", "Jajpur"],
  Livelihood: ["Koraput", "Kandhamal", "Rayagada", "Nabarangpur"],
  Entrepreneurship: ["Ranchi", "Khunti", "Gumla", "Lohardaga"],
  Nutrition: ["Purulia", "Bankura", "Jhargram", "Paschim Medinipur"],
  Health: ["Dibrugarh", "Tinsukia", "Jorhat", "Sivasagar"],
  Sanitation: ["Gaya", "Nawada", "Jamui", "Banka"],
  "Climate Change": ["Bastar", "Kanker", "Dhamtari", "Kondagaon"],
};

const evidenceDocuments = [
  { name: "Approved project proposal", type: "Governance", status: "Verified", updated: "12 Apr 2025" },
  { name: "Results framework and indicator plan", type: "M&E", status: "Verified", updated: "18 Apr 2025" },
  { name: "Baseline assessment report", type: "Evidence", status: "Verified", updated: "06 Jun 2025" },
  { name: "Latest monthly progress report", type: "Reporting", status: "Verified", updated: "28 Jul 2026" },
  { name: "Beneficiary verification register", type: "Data", status: "In review", updated: "31 Jul 2026" },
  { name: "Field monitoring visit notes", type: "Monitoring", status: "Verified", updated: "02 Aug 2026" },
];

export function ProjectRecordView({ projectId, centerId }: { projectId: string; centerId?: string }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProjectTab>("Overview");
  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-10 text-center shadow-[var(--shadow-card)]">
        <FileText size={28} className="mx-auto text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-[var(--text)]">Project record not found</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">The requested project may have been archived or moved.</p>
        <button type="button" onClick={() => navigate("/monitoring-evaluation/projects")} className="focus-ring mt-6 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white">Return to projects</button>
      </div>
    );
  }

  if (project.area === "Skill Development") {
    return <SkillProjectRecordView project={project} centerId={centerId} />;
  }

  const utilization = Math.min(100, Math.round(numberFromCurrency(project.spent) / numberFromCurrency(project.budget) * 100));
  const locations = makeLocations(project);

  return (
    <div className="space-y-5">
      <button type="button" onClick={() => navigate("/monitoring-evaluation/projects")} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"><ArrowLeft size={16} />Back to projects</button>

      <section className="enterprise-project-record relative overflow-hidden rounded-[28px] border border-red-500/15 bg-gradient-to-br from-[#281010] via-[#190d0d] to-[#111014] p-6 text-white shadow-[0_26px_80px_rgba(0,0,0,.2)] sm:p-8">
        <div className="absolute -right-20 -top-28 size-80 rounded-full bg-red-600/15 blur-3xl" />
        <div className="grid-pattern absolute inset-0 opacity-[0.07]" />
        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
          <div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200"><ClipboardCheck size={13} />Enterprise project record</span><p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300">{project.id} · {project.area}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{project.name}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">One verified record for project design, implementation progress, results, locations, expenditure and supporting M&E evidence.</p></div>
          <div className="flex flex-wrap gap-2"><span className={cn("rounded-full px-3 py-1.5 text-[10px] font-semibold", project.status === "On track" ? "bg-emerald-500/15 text-emerald-300" : project.status === "At risk" ? "bg-amber-500/15 text-amber-300" : "bg-slate-500/15 text-slate-300")}>{project.status}</span><button type="button" className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] font-semibold text-slate-200 hover:bg-white/10"><Download size={14} />Export project record</button></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Project completion", value: `${project.progress}%`, note: "Against approved work plan", icon: Target }, { label: "Verified beneficiaries", value: project.beneficiaries, note: "Deduplicated participant records", icon: UsersRound }, { label: "Grant utilization", value: `${utilization}%`, note: `${project.spent} of ${project.budget}`, icon: Banknote }, { label: "M&E evidence quality", value: "91%", note: "Documents and records validated", icon: ShieldCheck }].map((item) => { const Icon = item.icon; return <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><Icon size={18} /></span><p className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-[10px] text-[var(--text-subtle)]">{item.note}</p></article>; })}
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
        <div className="overflow-x-auto border-b border-[var(--border)] px-3 sm:px-5"><div className="flex min-w-max gap-1">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={cn("focus-ring relative px-4 py-4 text-xs font-medium transition-colors", activeTab === tab ? "text-red-600 dark:text-red-400" : "text-[var(--text-subtle)] hover:text-[var(--text)]")}>{tab}{activeTab === tab && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-red-500" />}</button>)}</div></div>
        <div className="p-5 sm:p-6 lg:p-7">
          {activeTab === "Overview" && <OverviewTab project={project} utilization={utilization} locations={locations} />}
          {activeTab === "Results & indicators" && <ResultsTab project={project} />}
          {activeTab === "Implementation locations" && <LocationsTab project={project} locations={locations} />}
          {activeTab === "Evidence & reports" && <EvidenceTab project={project} />}
        </div>
      </section>
    </div>
  );
}

function OverviewTab({ project, utilization, locations }: { project: MonitoringProject; utilization: number; locations: ReturnType<typeof makeLocations> }) {
  return <div className="space-y-6"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Thematic area", value: project.area, icon: Target }, { label: "Project manager", value: project.manager, icon: UserRound }, { label: "Implementation period", value: project.period, icon: CalendarRange }, { label: "Geographic coverage", value: project.location, icon: MapPin }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><Icon size={16} className="text-red-500" /><p className="mt-4 text-[9px] uppercase tracking-[0.12em] text-[var(--text-subtle)]">{item.label}</p><p className="mt-1 text-xs font-semibold leading-5 text-[var(--text)]">{item.value}</p></div>; })}</div><div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl border border-[var(--border)] p-5"><h3 className="text-sm font-semibold text-[var(--text)]">Project results summary</h3><p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{project.outcome}</p><div className="mt-6 space-y-5">{[{ label: "Approved work-plan completion", value: project.progress, color: "from-red-700 to-rose-400" }, { label: "Verified grant utilization", value: utilization, color: "from-emerald-600 to-emerald-400" }, { label: "Evidence completeness", value: 91, color: "from-amber-500 to-yellow-400" }].map((item) => <div key={item.label}><div className="flex justify-between text-xs"><span className="text-[var(--text-muted)]">{item.label}</span><span className="font-semibold text-[var(--text)]">{item.value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]"><div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} /></div></div>)}</div></div><div className="rounded-2xl border border-[var(--border)] p-5"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[var(--text)]">Implementation footprint</h3><span className="text-[10px] text-[var(--text-subtle)]">{locations.length} districts</span></div><div className="mt-4 space-y-2">{locations.map((location) => <div key={location.name} className="flex items-center justify-between rounded-xl bg-[var(--surface-soft)] px-3 py-3"><span><span className="block text-xs font-medium text-[var(--text)]">{location.name}</span><span className="mt-0.5 block text-[9px] text-[var(--text-subtle)]">{location.units} field units</span></span><span className="text-[10px] font-semibold text-[var(--text-muted)]">{location.progress}%</span></div>)}</div></div></div></div>;
}

function ResultsTab({ project }: { project: MonitoringProject }) {
  const area = thematicAreas.find((item) => item.name === project.area) ?? thematicAreas[0];
  return <div><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="text-base font-semibold text-[var(--text)]">Approved results framework</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Latest verified achievements against project targets</p></div><span className="w-fit rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-500">Last validated 02 Aug 2026</span></div><div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[9px] uppercase tracking-[0.12em] text-[var(--text-subtle)]"><th className="px-4 py-3 font-semibold">Outcome indicator</th><th className="px-4 py-3 font-semibold">Baseline</th><th className="px-4 py-3 font-semibold">Target</th><th className="px-4 py-3 font-semibold">Achieved</th><th className="px-4 py-3 font-semibold">Verification source</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead><tbody>{area.indicators.map((indicator, index) => <tr key={indicator.label} className="border-b border-[var(--border)] last:border-0"><td className="px-4 py-4 text-xs font-medium text-[var(--text)]">{indicator.label}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{8 + index * 3}%</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{Math.min(100, indicator.value + 9)}%</td><td className="px-4 py-4 text-xs font-semibold text-[var(--text)]">{indicator.value}%</td><td className="px-4 py-4 text-[10px] text-[var(--text-subtle)]">{["Beneficiary MIS", "Field verification", "Assessment records", "Partner report"][index]}</td><td className="px-4 py-4"><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", indicator.value >= 75 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>{indicator.value >= 75 ? "On track" : "Needs attention"}</span></td></tr>)}</tbody></table></div></div>;
}

function LocationsTab({ project, locations }: { project: MonitoringProject; locations: ReturnType<typeof makeLocations> }) {
  return <div><h3 className="text-base font-semibold text-[var(--text)]">Implementation locations</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">District-level delivery and monitoring status for {project.name}</p><div className="mt-5 grid gap-3 lg:grid-cols-2">{locations.map((location, index) => <article key={location.name} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><MapPin size={17} /></span><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-500">Operational</span></div><h4 className="mt-4 text-sm font-semibold text-[var(--text)]">{location.name} district</h4><p className="mt-1 text-[10px] text-[var(--text-subtle)]">Field coordinator · {["S. Patnaik", "R. Das", "M. Nayak", "P. Sahu"][index]}</p><div className="mt-5 grid grid-cols-3 gap-2">{[{ label: "Field units", value: location.units }, { label: "Verified reach", value: location.reach }, { label: "Progress", value: `${location.progress}%` }].map((item) => <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-3"><p className="text-sm font-semibold text-[var(--text)]">{item.value}</p><p className="mt-1 text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">{item.label}</p></div>)}</div></article>)}</div></div>;
}

function EvidenceTab({ project }: { project: MonitoringProject }) {
  return <div><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="text-base font-semibold text-[var(--text)]">Evidence and reporting repository</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Governance, M&E and implementation documents for {project.id}</p></div><span className="text-[10px] text-[var(--text-subtle)]">5 of 6 documents verified</span></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{evidenceDocuments.map((document) => <article key={document.name} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-500"><FileCheck2 size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[var(--text)]">{document.name}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{document.type} · Updated {document.updated}</p></div><span className={cn("shrink-0 rounded-full px-2 py-1 text-[8px] font-semibold", document.status === "Verified" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500")}>{document.status}</span></article>)}</div><div className="mt-5 rounded-2xl border border-red-500/15 bg-red-500/[0.05] p-5"><div className="flex items-start gap-3"><Flag size={18} className="mt-0.5 shrink-0 text-red-500" /><div><p className="text-xs font-semibold text-[var(--text)]">Next evidence milestone</p><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Quarterly outcome verification and beneficiary sample audit scheduled for 18–22 Aug 2026.</p></div></div></div></div>;
}

function numberFromCurrency(value: string) {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  return value.includes("Cr") ? amount * 100 : amount;
}

function makeLocations(project: MonitoringProject) {
  const names = districtNames[project.area] ?? ["District 1", "District 2", "District 3", "District 4"];
  const reach = Number(project.beneficiaries.replace(/[^0-9]/g, ""));
  return names.map((name, index) => ({
    name,
    units: 3 + ((project.name.length + index) % 5),
    reach: Math.round(reach * [0.31, 0.27, 0.23, 0.19][index]).toLocaleString("en-IN"),
    progress: Math.max(38, Math.min(98, project.progress + [6, 1, -4, -8][index])),
  }));
}
