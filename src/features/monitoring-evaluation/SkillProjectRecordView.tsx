import {
  ArrowLeft,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  GraduationCap,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import type { MonitoringProject } from "./data";
import { skillCenters, skillEvidence, skillProjectTeam, type SkillCandidate, type SkillCenter } from "./skillProjectData";

const centerTabs = [
  { id: "enrollment", label: "Enrollment", icon: FileCheck2 },
  { id: "training", label: "Training detail", icon: BookOpen },
  { id: "placements", label: "Placements", icon: BriefcaseBusiness },
  { id: "kit", label: "Kit distribution", icon: PackageCheck },
  { id: "insurance", label: "Insurance", icon: ShieldCheck },
] as const;

type CenterTab = typeof centerTabs[number]["id"];
type DetailModal = "placement" | "exposure" | null;
interface RosterFilters {
  batch: string;
  status: string;
  jobRole: string;
  company: string;
  verification: string;
  docs: string;
}

const emptyFilters: RosterFilters = { batch: "", status: "", jobRole: "", company: "", verification: "", docs: "" };

export function SkillProjectRecordView({ project, centerId }: { project: MonitoringProject; centerId?: string }) {
  const center = skillCenters.find((item) => item.id === centerId);
  return center
    ? <SkillCenterDashboard project={project} center={center} />
    : <SkillProjectOverview project={project} />;
}

function SkillProjectOverview({ project }: { project: MonitoringProject }) {
  const navigate = useNavigate();
  const totalBatches = skillCenters.reduce((sum, center) => sum + center.batches, 0);
  const totalLearners = skillCenters.reduce((sum, center) => sum + center.learners, 0);
  const completion = Math.round(skillCenters.reduce((sum, center) => sum + center.completion, 0) / skillCenters.length);
  const certification = Math.round(skillCenters.reduce((sum, center) => sum + center.certification, 0) / skillCenters.length);
  const placement = Math.round(skillCenters.reduce((sum, center) => sum + center.placement, 0) / skillCenters.length);
  const retention = Math.round(skillCenters.reduce((sum, center) => sum + center.retention, 0) / skillCenters.length);

  return (
    <div className="space-y-6 text-white">
      <EnterpriseIntro />

      <EnterprisePanel className="p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div><button type="button" onClick={() => navigate("/monitoring-evaluation/projects")} className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm text-slate-400 transition hover:text-white"><ArrowLeft size={16} />Back to portfolio</button><h2 className="mt-6 text-3xl font-semibold tracking-[-0.035em]">{project.name}</h2><p className="mt-2 text-sm text-slate-400">NSDC · {project.period}</p></div>
          <span className="w-fit rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300">M&E data completeness: 92%</span>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[{ label: "Learners enrolled", value: totalLearners.toLocaleString("en-IN"), caption: `${totalBatches} active batches`, tone: "text-red-300" }, { label: "Training completion", value: `${completion}%`, caption: "Completed prescribed hours", tone: "text-red-300" }, { label: "Certification success", value: `${certification}%`, caption: "Of candidates assessed", tone: "text-red-300" }, { label: "Placement rate", value: `${placement}%`, caption: "Verified within 90 days", tone: "text-emerald-300" }, { label: "90-day retention", value: `${retention}%`, caption: "Employment outcome sustained", tone: "text-emerald-300" }, { label: "Training centers", value: skillCenters.length, caption: "Monitored delivery locations", tone: "text-red-300" }].map((item) => <div key={item.label} className="rounded-[20px] border border-white/10 bg-black/25 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p><p className={cn("mt-3 text-3xl font-semibold", item.tone)}>{item.value}</p><p className="mt-1 text-xs text-slate-500">{item.caption}</p></div>)}
        </div>
      </EnterprisePanel>

      <EnterprisePanel className="p-6 lg:p-7">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300">Project governance</p><h2 className="mt-3 text-2xl font-semibold">Admin / Project Incharge</h2><p className="mt-2 text-sm text-slate-400">Project incharge and employees associated with this project.</p></div><div className="flex gap-2">{[{ label: "Employees", value: skillProjectTeam.length + 1 }, { label: "Active", value: skillProjectTeam.length + 1 }, { label: "Centers", value: skillCenters.length }].map((item) => <div key={item.label} className="min-w-20 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right"><p className="text-[9px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p><p className="mt-1 text-sm font-semibold">{item.value}</p></div>)}</div></div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[.72fr_1.28fr]">
          <div className="rounded-2xl border border-red-500/25 bg-red-950/25 p-5"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-xl border border-red-400/30 bg-red-500/15 text-sm font-semibold text-red-200">RS</span><div><p className="text-sm font-semibold">Rakesh Swain</p><p className="mt-1 text-xs font-medium text-red-200">Project Admin</p><p className="mt-2 text-xs text-slate-500">PNT-EMP-0007</p></div></div><div className="mt-5 space-y-3 rounded-xl border border-white/10 bg-black/20 p-4 text-xs"><div className="flex justify-between gap-4"><span className="text-slate-500">Email</span><span className="text-slate-200">rakesh.swain@pantiss.org</span></div><div className="flex justify-between gap-4"><span className="text-slate-500">Phone</span><span className="text-slate-200">+91 98765 43216</span></div><div className="flex justify-between gap-4"><span className="text-slate-500">Status</span><span className="text-emerald-300">Active</span></div></div></div>
          <div className="overflow-hidden rounded-2xl border border-white/10"><div className="grid grid-cols-[1.2fr_.9fr_.45fr] bg-slate-900 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"><span>Employee</span><span>Role</span><span>Status</span></div>{skillProjectTeam.map((member) => <div key={member.id} className="grid grid-cols-[1.2fr_.9fr_.45fr] items-center border-t border-white/10 px-4 py-3"><span className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-xs font-semibold text-slate-300">{member.initials}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold">{member.name}</span><span className="mt-0.5 block text-[10px] text-slate-500">{member.id}</span></span></span><span className="text-xs text-slate-300">{member.role}</span><span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-300">{member.status}</span></div>)}</div>
        </div>
      </EnterprisePanel>

      <EnterprisePanel className="p-6 lg:p-7">
        <h2 className="text-2xl font-semibold">Centers</h2><p className="mt-2 text-sm text-slate-400">Choose a center to open its operating dashboard.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[980px] text-left"><thead><tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.16em] text-slate-500"><th className="px-4 py-3 font-semibold">Center</th><th className="px-4 py-3 font-semibold">Enrolled</th><th className="px-4 py-3 font-semibold">Attendance</th><th className="px-4 py-3 font-semibold">Completion</th><th className="px-4 py-3 font-semibold">Certification</th><th className="px-4 py-3 font-semibold">Placement</th><th className="px-4 py-3 font-semibold">90-day retention</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Action</th></tr></thead><tbody>{skillCenters.map((center) => <tr key={center.id} className="border-t border-white/10"><td className="px-4 py-4"><p className="text-sm font-semibold">{center.name}</p><p className="mt-1 text-xs text-slate-500">{center.batches} active batches · {center.district}</p></td><td className="px-4 py-4 text-sm text-slate-300">{center.learners}</td><td className="px-4 py-4 text-sm text-slate-300">{center.attendance}%</td><td className="px-4 py-4 text-sm text-slate-300">{center.completion}%</td><td className="px-4 py-4 text-sm text-slate-300">{center.certification}%</td><td className="px-4 py-4 text-sm text-slate-300">{center.placement}%</td><td className="px-4 py-4 text-sm text-slate-300">{center.retention}%</td><td className="px-4 py-4"><span className={cn("rounded-full px-2 py-1 text-[10px] font-medium", center.health === "Healthy" ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300")}>{center.health}</span></td><td className="px-4 py-4 text-right"><button type="button" onClick={() => navigate(`/monitoring-evaluation/projects/${project.id}/centers/${center.id}`)} className="focus-ring inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600">Open<ChevronRight size={14} /></button></td></tr>)}</tbody></table></div>
      </EnterprisePanel>
    </div>
  );
}

function SkillCenterDashboard({ project, center }: { project: MonitoringProject; center: SkillCenter }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CenterTab>("training");
  const [search, setSearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [detailModal, setDetailModal] = useState<DetailModal>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<SkillCandidate | null>(null);
  const [filters, setFilters] = useState<RosterFilters>(emptyFilters);
  const batches = useMemo(() => [...new Set(center.candidates.map((candidate) => candidate.batch))], [center.candidates]);
  const filteredCandidates = useMemo(() => center.candidates.filter((candidate) => {
    const searchable = `${candidate.name} ${candidate.id} ${candidate.jobRole} ${candidate.employer} ${candidate.batch}`.toLowerCase();
    const status = getCandidateFilterStatus(candidate, activeTab);
    const verification = candidate.placement === "Placed" ? "Verified" : "Pending";
    const docs = candidate.placement === "Placed" ? "Available" : "Pending";
    return searchable.includes(search.toLowerCase())
      && (!filters.batch || candidate.batch === filters.batch)
      && (!filters.status || status === filters.status)
      && (!filters.jobRole || candidate.jobRole === filters.jobRole)
      && (!filters.company || candidate.employer === filters.company)
      && (!filters.verification || verification === filters.verification)
      && (!filters.docs || docs === filters.docs);
  }), [activeTab, center.candidates, filters, search]);
  const filteredEvidence = skillEvidence.filter((item) => galleryFilter === "All" || item.category === galleryFilter);

  return (
    <div className="space-y-6 text-white">
      <EnterpriseIntro />
      <EnterprisePanel className="p-6 lg:p-7">
        <button type="button" onClick={() => navigate(`/monitoring-evaluation/projects/${project.id}`)} className="focus-ring inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={16} />Back to project</button>
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300">Center operating dashboard</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">{center.name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-slate-400"><MapPin size={14} />{center.district}, Odisha · {project.name}</p></div><span className={cn("w-fit rounded-full border px-3 py-1.5 text-xs font-semibold", center.health === "Healthy" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300")}>Center health: {center.health}</span></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Learners enrolled", value: center.learners, note: `${center.batches} active batches · ${center.womenShare}% women` }, { label: "Average attendance", value: `${center.attendance}%`, note: "Target: ≥80% per learner" }, { label: "Training completion", value: `${center.completion}%`, note: "Prescribed hours completed" }, { label: "Certification success", value: `${center.certification}%`, note: "Of candidates assessed" }, { label: "Placement rate", value: `${center.placement}%`, note: "Verified within 90 days" }, { label: "90-day retention", value: `${center.retention}%`, note: "Employment outcome sustained" }, { label: "Women participation", value: `${center.womenShare}%`, note: "Share of total enrollment" }, { label: "Evidence completeness", value: `${center.evidence}%`, note: "Candidate records validated" }].map((item) => <div key={item.label} className="rounded-[18px] border border-white/10 bg-black/25 p-4"><p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{item.label}</p><p className="mt-2 text-2xl font-semibold text-red-300">{item.value}</p><p className="mt-1 text-xs text-slate-500">{item.note}</p></div>)}</div>
      </EnterprisePanel>

      <EnterprisePanel className="p-5 lg:p-7">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start"><div><h2 className="text-2xl font-semibold">Candidate-level M&E roster</h2><p className="mt-2 text-sm text-slate-400">Trace enrollment, training, assessment and employment evidence across {center.batches} active batches</p></div><div className="flex gap-2">{[{ label: "Assessment due", value: center.candidates.filter((c) => c.status === "Assessment Due").length }, { label: "Placed", value: center.candidates.filter((c) => c.placement === "Placed").length }, { label: "Attendance risk", value: center.candidates.filter((c) => c.durationReceived / c.durationTotal < .72).length }].map((item) => <div key={item.label} className="min-w-20 rounded-xl border border-white/10 px-3 py-2 text-right"><p className="text-[9px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p><p className="mt-1 text-sm font-semibold">{item.value}</p></div>)}</div></div>
        <div className="mt-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center"><div className="flex flex-wrap gap-2"><label className="relative"><MapPin size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-300" /><select value={center.id} onChange={(event) => navigate(`/monitoring-evaluation/projects/${project.id}/centers/${event.target.value}`)} aria-label="Select center" className="focus-ring h-10 appearance-none rounded-xl border border-red-400/20 bg-red-500/10 pl-9 pr-9 text-xs text-white"><option value={center.id}>{center.district}</option>{skillCenters.filter((item) => item.id !== center.id).map((item) => <option key={item.id} value={item.id} className="bg-slate-950">{item.district}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></label><label className="relative"><GraduationCap size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-red-300" /><select value={filters.batch} onChange={(event) => setFilters((current) => ({ ...current, batch: event.target.value }))} aria-label="Select batch" className="focus-ring h-10 appearance-none rounded-xl border border-red-400/20 bg-red-500/10 pl-9 pr-9 text-xs text-white"><option value="" className="bg-slate-950">All active batches</option>{batches.map((batch) => <option key={batch} value={batch} className="bg-slate-950">{batch}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" /></label></div><div className="flex flex-wrap gap-2">{centerTabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} type="button" onClick={() => { setActiveTab(tab.id); setFilters((current) => ({ ...emptyFilters, batch: current.batch })); }} className={cn("focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition", activeTab === tab.id ? "border-red-400/35 bg-red-500/15 text-red-200" : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white")}><Icon size={14} />{tab.label}</button>; })}</div></div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10"><RosterToolbar tab={activeTab} search={search} onSearch={setSearch} rowCount={filteredCandidates.length} candidates={center.candidates} filters={filters} onFilters={setFilters} project={project} center={center} exportCandidates={filteredCandidates} /><CandidateTable candidates={filteredCandidates} tab={activeTab} project={project} center={center} onViewCandidate={setSelectedCandidate} /></div>
      </EnterprisePanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <PlacementDriveCard center={center} onView={() => setDetailModal("placement")} />
        <ExposureVisitCard center={center} onView={() => setDetailModal("exposure")} />
      </div>

      <EnterprisePanel className="p-5 lg:p-7"><div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold text-red-200"><Sparkles size={13} />Project gallery</span><h2 className="mt-4 text-2xl font-semibold">Report evidence gallery</h2><p className="mt-2 text-sm text-slate-400">{project.name} · {center.name}</p></div><div className="flex flex-wrap gap-2">{["All", "Enrollment", "Training", "Placements", "Compliance"].map((filter) => <button key={filter} type="button" onClick={() => setGalleryFilter(filter)} className={cn("focus-ring rounded-full border px-3 py-2 text-xs font-medium", galleryFilter === filter ? "border-red-500 bg-red-500 text-white" : "border-white/10 bg-white/[0.04] text-slate-400")}>{filter}</button>)}</div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{filteredEvidence.map((item) => <article key={item.title} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-900"><img src={item.image} alt={item.alt} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.035]" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" /><span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur">{item.category}</span><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-4 pt-12"><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-[10px] text-slate-300">{item.stage} · {item.date}</p></div></article>)}</div></EnterprisePanel>
      {detailModal && <DocumentDetailModal type={detailModal} center={center} onClose={() => setDetailModal(null)} />}
      {selectedCandidate && <CandidateDetailModal candidate={selectedCandidate} project={project} center={center} onClose={() => setSelectedCandidate(null)} />}
    </div>
  );
}

function RosterToolbar({ tab, search, onSearch, rowCount, candidates, filters, onFilters, project, center, exportCandidates }: { tab: CenterTab; search: string; onSearch: (value: string) => void; rowCount: number; candidates: SkillCandidate[]; filters: RosterFilters; onFilters: Dispatch<SetStateAction<RosterFilters>>; project: MonitoringProject; center: SkillCenter; exportCandidates: SkillCandidate[] }) {
  const placeholders: Record<CenterTab, string> = { enrollment: "Search enrollment candidates…", training: "Search training candidates…", placements: "Search placements…", kit: "Search kit distribution…", insurance: "Search insurance records…" };
  const unique = (values: string[]) => [...new Set(values)];
  const selects: { key: keyof RosterFilters; label: string; options: string[] }[] = tab === "placements"
    ? [{ key: "company", label: "Company", options: unique(candidates.map((candidate) => candidate.employer)) }, { key: "verification", label: "Verification", options: ["Verified", "Pending"] }, { key: "docs", label: "Docs", options: ["Available", "Pending"] }]
    : tab === "kit" ? [{ key: "status", label: "Status", options: ["Partial", "Complete"] }]
      : tab === "insurance" ? [{ key: "status", label: "Status", options: ["Expiring soon", "Pending"] }]
        : [{ key: "status", label: "Status", options: unique(candidates.map((candidate) => getCandidateFilterStatus(candidate, tab))) }, { key: "jobRole", label: "Job role", options: unique(candidates.map((candidate) => candidate.jobRole)) }];
  const updateFilter = (key: keyof RosterFilters, value: string) => onFilters((current) => ({ ...current, [key]: value }));
  const clear = () => { onSearch(""); onFilters(emptyFilters); };
  return <div className="flex flex-col gap-3 border-b border-white/10 bg-slate-900 p-3 xl:flex-row xl:items-center"><label className="relative min-w-64 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholders[tab]} className="focus-ring h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600" /></label><div className="flex flex-wrap gap-2">{selects.map((filter) => <label key={filter.key} className="relative"><select value={filters[filter.key]} onChange={(event) => updateFilter(filter.key, event.target.value)} aria-label={filter.label} className="focus-ring h-10 appearance-none rounded-xl border border-white/10 bg-white/[0.03] pl-3 pr-8 text-xs text-slate-300"><option value="" className="bg-slate-950">{filter.label}</option>{filter.options.map((option) => <option key={option} value={option} className="bg-slate-950">{option}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" /></label>)}<button type="button" onClick={() => exportRosterPdf(exportCandidates, tab, project, center)} disabled={!rowCount} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 text-xs font-semibold text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"><FileText size={14} />Export PDF</button><button type="button" onClick={() => exportRosterCsv(exportCandidates, tab, project, center)} disabled={!rowCount} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"><FileText size={14} />Export Excel</button></div><span className="whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">{rowCount} rows</span><button type="button" onClick={clear} className="focus-ring h-9 rounded-xl border border-white/10 px-3 text-[10px] text-slate-400">Clear</button></div>;
}

function CandidateTable({ candidates, tab, project, center, onViewCandidate }: { candidates: SkillCandidate[]; tab: CenterTab; project: MonitoringProject; center: SkillCenter; onViewCandidate: (candidate: SkillCandidate) => void }) {
  const headers: Record<CenterTab, string[]> = {
    enrollment: ["Candidate", "Project / Center", "Job role", "Aadhaar", "DOB / Gender", "Qualification", "Experience", "Documents", "Submitted", "Status", "Action"],
    training: ["Name", "Project", "Center", "Batch", "Job role", "Duration received", "Theory hours", "Practical hours"],
    placements: ["Student name", "Project", "Center", "Batch", "Company", "Designation", "Salary", "Joining date", "Offer letter", "M1", "M2", "M3", "Bank stmt", "Status"],
    kit: ["Student", "Project", "Center", "Batch", "Safety kit", "Shoes", "Uniform", "Training kit", "Proof image", "Status"],
    insurance: ["Student", "Project", "Batch", "Provider", "Policy no.", "Coverage", "Start", "End", "Nominee", "Status"],
  };
  const minWidth = tab === "enrollment" || tab === "placements" ? "min-w-[1700px]" : tab === "kit" || tab === "insurance" ? "min-w-[1350px]" : "min-w-[1120px]";
  return <div className="overflow-x-auto"><table className={cn("w-full text-left", minWidth)}><thead><tr className="bg-black/20 text-[9px] uppercase tracking-[0.15em] text-slate-500">{headers[tab].map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 font-semibold">{header}</th>)}</tr></thead><tbody>{candidates.length ? candidates.map((candidate) => <tr key={candidate.id} className="border-t border-white/10 text-xs"><CandidateCells candidate={candidate} tab={tab} project={project} center={center} onViewCandidate={onViewCandidate} /></tr>) : <tr><td colSpan={headers[tab].length} className="px-5 py-16 text-center text-sm text-slate-500">No candidates match the selected filters.</td></tr>}</tbody></table></div>;
}

function CandidateCells({ candidate, tab, project, center, onViewCandidate }: { candidate: SkillCandidate; tab: CenterTab; project: MonitoringProject; center: SkillCenter; onViewCandidate: (candidate: SkillCandidate) => void }) {
  const sequence = Number(candidate.id.split("-").at(-1) ?? 0);
  const name = <td className="px-4 py-4"><p className="font-semibold">{candidate.name}</p><p className="mt-1 text-[10px] text-slate-500">{candidate.id}</p></td>;
  const batch = <span className="rounded-full border border-red-400/25 bg-red-500/10 px-2 py-1 text-[10px] text-red-200">{candidate.batch}</span>;
  const issue = (issued: boolean) => <span className={cn("inline-flex items-center gap-1.5", issued ? "text-emerald-300" : "text-slate-400")}><span className={cn("size-1.5 rounded-full", issued ? "bg-emerald-400" : "bg-slate-500")} />{issued ? "Issued" : "Pending"}</span>;
  if (tab === "training") return <>{name}<td className="px-4 py-4 text-slate-300">{project.name}</td><td className="px-4 py-4"><p className="text-slate-300">{center.name}</p><p className="mt-1 text-[10px] text-slate-500">{center.district}</p></td><td className="px-4 py-4">{batch}</td><td className="px-4 py-4 text-slate-300">{candidate.jobRole}</td><td className="px-4 py-4"><p>{candidate.durationReceived} days</p><p className="mt-1 text-[10px] text-slate-500">of {candidate.durationTotal} days total</p><div className="mt-2 h-1 w-20 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ width: `${candidate.durationReceived / candidate.durationTotal * 100}%` }} /></div></td><td className="px-4 py-4"><span className="rounded-full bg-sky-500/10 px-2 py-1 text-sky-300">{candidate.theoryHours} hrs</span></td><td className="px-4 py-4"><span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-300">{candidate.practicalHours} hrs</span></td></>;
  if (tab === "placements") return <>{name}<td className="px-4 py-4 text-slate-300">{project.name}</td><td className="px-4 py-4"><p className="text-slate-300">{center.name}</p><p className="mt-1 text-[10px] text-slate-500">{center.district}</p></td><td className="px-4 py-4">{batch}</td><td className="px-4 py-4 font-medium text-slate-200">{candidate.employer}</td><td className="px-4 py-4 text-slate-300">{candidate.designation}</td><td className="px-4 py-4 font-semibold text-emerald-300">{candidate.salary}<span className="mt-1 block text-[9px] font-normal text-slate-500">/month</span></td><td className="px-4 py-4 text-slate-300">{candidate.joiningDate}</td>{["Offer", "M1", "M2", "M3", "Bank"].map((doc, index) => <td key={doc} className="px-4 py-4"><button type="button" onClick={() => downloadCandidateDocument(candidate, doc)} className={cn("focus-ring rounded-full border px-2 py-1 text-[9px]", candidate.placement === "Placed" && index < 3 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.04] text-slate-500")}><Eye size={10} className="mr-1 inline" />{doc}</button></td>)}<td className="px-4 py-4"><span className={cn("inline-flex items-center gap-1.5", candidate.placement === "Placed" ? "text-emerald-300" : "text-amber-300")}><span className="size-1.5 rounded-full bg-current" />{candidate.placement === "Placed" ? "Verified" : "Pending"}</span></td></>;
  if (tab === "enrollment") return <>{name}<td className="px-4 py-4"><p className="font-medium text-slate-200">{project.name}</p><p className="mt-1 text-[10px] text-slate-500">{center.name}</p><div className="mt-2">{batch}</div></td><td className="px-4 py-4"><span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[10px] text-slate-200">{candidate.jobRole}</span></td><td className="px-4 py-4 text-slate-300">{candidate.aadhaar}</td><td className="px-4 py-4"><p className="text-slate-300">{candidate.dateOfBirth}</p><p className="mt-1 text-[10px] text-slate-500">{candidate.gender}</p></td><td className="px-4 py-4"><p>{candidate.qualification}</p><p className="mt-1 text-[10px] text-slate-500">Electrical · CBSE Board</p></td><td className="px-4 py-4"><p>{candidate.experience}</p><p className="mt-1 text-[10px] text-slate-500">Employed: {sequence % 2 ? "No" : "Yes"}</p></td><td className="px-4 py-4"><div className="grid grid-cols-2 gap-1">{["Aadhaar", "Qualification", "Experience", "Operator"].map((doc) => <button type="button" onClick={() => downloadCandidateDocument(candidate, doc)} key={doc} className="focus-ring rounded-md border border-white/10 px-2 py-1 text-left text-[9px] text-slate-500 hover:text-slate-200"><FileText size={9} className="mr-1 inline" />{doc}</button>)}</div></td><td className="px-4 py-4 text-slate-300">{candidate.submitted}</td><td className="px-4 py-4"><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-semibold uppercase text-amber-300">{candidate.status === "Certified" ? "Assessed" : "In training"}</span></td><td className="px-4 py-4"><button type="button" onClick={() => onViewCandidate(candidate)} className="focus-ring inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] text-slate-300"><Eye size={11} />View</button></td></>;
  if (tab === "kit") { const complete = sequence % 4 === 0; return <>{name}<td className="px-4 py-4 text-slate-300">{project.name}</td><td className="px-4 py-4 text-slate-300">{center.district}</td><td className="px-4 py-4">{batch}</td><td className="px-4 py-4">{issue(complete || sequence % 2 === 0)}</td><td className="px-4 py-4">{issue(complete || sequence % 2 !== 0)}</td><td className="px-4 py-4">{issue(true)}</td><td className="px-4 py-4">{issue(complete || sequence % 3 !== 1)}</td><td className="px-4 py-4 text-[10px] text-slate-500">{complete ? "Uploaded" : "Not uploaded"}</td><td className="px-4 py-4"><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", complete ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300")}>{complete ? "Complete" : "Partial"}</span></td></>; }
  return <>{name}<td className="px-4 py-4 text-slate-300">{project.name}<span className="mt-1 block text-[10px] text-slate-500">{center.district}</span></td><td className="px-4 py-4">{batch}</td><td className="px-4 py-4 font-medium text-slate-200">{candidate.insuranceProvider}</td><td className="px-4 py-4 text-slate-300">{candidate.policyNumber}</td><td className="px-4 py-4 text-slate-300">{candidate.coverage}</td><td className="px-4 py-4 text-slate-300">{candidate.insuranceStart}</td><td className="px-4 py-4 text-slate-300">{candidate.insuranceEnd}</td><td className="px-4 py-4 text-slate-300">{candidate.nominee}</td><td className="px-4 py-4"><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", candidate.policyNumber === "Pending" ? "bg-slate-500/10 text-slate-400" : "bg-amber-500/10 text-amber-300")}>{candidate.policyNumber === "Pending" ? "Pending" : "Expiring soon"}</span></td></>;
}

function getCandidateFilterStatus(candidate: SkillCandidate, tab: CenterTab) {
  const sequence = Number(candidate.id.split("-").at(-1) ?? 0);
  if (tab === "enrollment") return candidate.status === "Certified" ? "Assessed" : "In training";
  if (tab === "training") return candidate.status;
  if (tab === "placements") return candidate.placement === "Placed" ? "Verified" : "Pending";
  if (tab === "kit") return sequence % 4 === 0 ? "Complete" : "Partial";
  return candidate.policyNumber === "Pending" ? "Pending" : "Expiring soon";
}

function getRosterRows(candidates: SkillCandidate[], tab: CenterTab, project: MonitoringProject, center: SkillCenter): string[][] {
  const common = (candidate: SkillCandidate) => [candidate.id, candidate.name, project.name, center.name, candidate.batch, candidate.jobRole];
  const headers: Record<CenterTab, string[]> = {
    enrollment: ["Candidate ID", "Name", "Project", "Center", "Batch", "Job Role", "Aadhaar", "DOB", "Gender", "Qualification", "Experience", "Submitted", "Status"],
    training: ["Candidate ID", "Name", "Project", "Center", "Batch", "Job Role", "Days Received", "Total Days", "Theory Hours", "Practical Hours", "Status"],
    placements: ["Candidate ID", "Name", "Project", "Center", "Batch", "Job Role", "Company", "Designation", "Salary", "Joining Date", "Verification"],
    kit: ["Candidate ID", "Name", "Project", "Center", "Batch", "Job Role", "Kit Status"],
    insurance: ["Candidate ID", "Name", "Project", "Center", "Batch", "Job Role", "Provider", "Policy Number", "Coverage", "Start", "End", "Nominee", "Status"],
  };
  const rows = candidates.map((candidate) => {
    if (tab === "enrollment") return [...common(candidate), candidate.aadhaar, candidate.dateOfBirth, candidate.gender, candidate.qualification, candidate.experience, candidate.submitted, getCandidateFilterStatus(candidate, tab)];
    if (tab === "training") return [...common(candidate), String(candidate.durationReceived), String(candidate.durationTotal), String(candidate.theoryHours), String(candidate.practicalHours), candidate.status];
    if (tab === "placements") return [...common(candidate), candidate.employer, candidate.designation, candidate.salary, candidate.joiningDate, getCandidateFilterStatus(candidate, tab)];
    if (tab === "kit") return [...common(candidate), getCandidateFilterStatus(candidate, tab)];
    return [...common(candidate), candidate.insuranceProvider, candidate.policyNumber, candidate.coverage, candidate.insuranceStart, candidate.insuranceEnd, candidate.nominee, getCandidateFilterStatus(candidate, tab)];
  });
  return [headers[tab], ...rows];
}

function exportRosterCsv(candidates: SkillCandidate[], tab: CenterTab, project: MonitoringProject, center: SkillCenter) {
  const csv = getRosterRows(candidates, tab, project, center).map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadText(`${center.id}-${tab}-roster.csv`, csv, "text/csv;charset=utf-8");
}

function exportRosterPdf(candidates: SkillCandidate[], tab: CenterTab, project: MonitoringProject, center: SkillCenter) {
  const [headers, ...rows] = getRosterRows(candidates, tab, project, center);
  const popup = window.open("", "_blank", "width=1200,height=800");
  if (!popup) return;
  popup.opener = null;
  const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  popup.document.write(`<!doctype html><html><head><title>${escape(center.name)} roster</title><style>body{font:12px Arial,sans-serif;color:#111;padding:28px}h1{font-size:22px;margin:0}p{color:#555}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #ddd;padding:7px;text-align:left}th{background:#991b1b;color:#fff}@media print{body{padding:0}}</style></head><body><h1>${escape(center.name)}</h1><p>${escape(project.name)} · ${escape(tab)} · ${candidates.length} filtered records</p><table><thead><tr>${headers.map((header) => `<th>${escape(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}

function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCandidateDocument(candidate: SkillCandidate, documentName: string) {
  downloadText(`${candidate.id}-${documentName.toLowerCase().replaceAll(" ", "-")}.txt`, `${documentName}\nCandidate: ${candidate.name}\nCandidate ID: ${candidate.id}\nStatus: Verified\nPantiss Foundation`);
}

function PlacementDriveCard({ center, onView }: { center: SkillCenter; onView: () => void }) {
  return <EnterprisePanel className="p-6"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-300"><BriefcaseBusiness size={19} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300">Placement operations</p><h3 className="mt-2 text-xl font-semibold">Placement drives</h3><p className="mt-1 text-xs text-slate-400">Drive-wise employer, batch, participation and selection details.</p></div></div><div className="mt-5 overflow-x-auto"><div className="min-w-[700px] overflow-hidden rounded-xl border border-white/10"><div className="grid grid-cols-[1.2fr_.9fr_.7fr_.8fr_.65fr_.8fr] bg-white/[0.03] px-4 py-3 text-[9px] uppercase tracking-[0.14em] text-slate-500"><span>Drive</span><span>Batch / Trade</span><span>Date</span><span>Participation</span><span>Status</span><span className="text-right">Documents</span></div><div className="grid grid-cols-[1.2fr_.9fr_.7fr_.8fr_.65fr_.8fr] items-center px-4 py-4 text-xs"><span><span className="block font-semibold">JSW Steel Hiring Drive</span><span className="mt-1 block text-[10px] text-slate-500">Officer: Pooja Patel</span></span><span className="text-slate-300">{center.candidates[0].batch}<span className="mt-1 block text-[10px] text-slate-500">Training</span></span><span className="text-slate-300">28 Jul 2026</span><span><span className="block text-cyan-300">18 attended</span><span className="mt-1 block text-emerald-300">7 selected</span></span><span><span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-[9px] text-cyan-300">Scheduled</span></span><span className="text-right"><button type="button" onClick={onView} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[10px] font-semibold text-red-200"><FileText size={12} />View details</button></span></div></div></div></EnterprisePanel>;
}

function ExposureVisitCard({ center, onView }: { center: SkillCenter; onView: () => void }) {
  return <EnterprisePanel className="p-6"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-300"><MapPin size={19} /></span><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300">Training exposure</p><h3 className="mt-2 text-xl font-semibold">Exposure visits</h3><p className="mt-1 text-xs text-slate-400">Industry visit, trainer, attendance, proof and notes summary.</p></div></div><div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/60 p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold">Tata Steel</p><p className="mt-1 text-xs text-slate-500">Tata Steel unit, {center.district}</p></div><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">Submitted</span></div><div className="mt-5 grid gap-4 text-[10px] sm:grid-cols-4"><span><span className="block uppercase tracking-wide text-slate-500">Trainer</span><span className="mt-1 block text-slate-200">Anita Patel</span></span><span><span className="block uppercase tracking-wide text-slate-500">Batch / Trade</span><span className="mt-1 block text-slate-200">{center.candidates[0].batch} / training</span></span><span><span className="block uppercase tracking-wide text-slate-500">Visit date</span><span className="mt-1 block text-slate-200">22 Jul 2026</span></span><span><span className="block uppercase tracking-wide text-slate-500">Attendance</span><span className="mt-1 block text-cyan-300">24/26</span></span></div><div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><p className="max-w-lg text-xs leading-5 text-slate-400">Students observed training workflows, safety practices and site-readiness expectations.</p><button type="button" onClick={onView} className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[10px] font-semibold text-red-200"><FileText size={12} />View details</button></div></div></EnterprisePanel>;
}

function CandidateDetailModal({ candidate, project, center, onClose }: { candidate: SkillCandidate; project: MonitoringProject; center: SkillCenter; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose]);
  const fields = [["Candidate ID", candidate.id], ["Phone", candidate.phone], ["Aadhaar", candidate.aadhaar], ["Date of birth", candidate.dateOfBirth], ["Gender", candidate.gender], ["Qualification", candidate.qualification], ["Experience", candidate.experience], ["Job role", candidate.jobRole], ["Batch", candidate.batch], ["Mobilizer", candidate.mobilizer], ["Training status", candidate.status], ["Placement stage", candidate.placement]];
  const profile = `Pantiss Foundation — Candidate Record\n\n${fields.map(([label, value]) => `${label}: ${value}`).join("\n")}\nProject: ${project.name}\nCenter: ${center.name}`;
  return createPortal(<div className="zo-projects-backdrop fixed inset-0 z-[110] grid place-items-center p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="candidate-modal-title" className="zo-projects-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto"><header className="zo-projects-header flex items-center justify-between px-6 py-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-red-300">Candidate enrollment record</p><h2 id="candidate-modal-title" className="mt-2 text-xl font-semibold">{candidate.name}</h2></div><button type="button" onClick={onClose} aria-label="Close candidate record" className="focus-ring grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white"><X size={20} /></button></header><div className="p-6"><div className="rounded-2xl border border-red-400/20 bg-red-500/[0.07] p-4"><p className="text-sm font-semibold">{project.name}</p><p className="mt-1 text-xs text-slate-400">{center.name} · {candidate.batch}</p></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt><dd className="mt-1.5 text-xs font-medium text-slate-200">{value}</dd></div>)}</dl><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="focus-ring rounded-xl border border-white/10 px-4 py-2.5 text-xs text-slate-300">Close</button><button type="button" onClick={() => downloadText(`${candidate.id}-candidate-record.txt`, profile)} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700"><FileText size={14} />Download record</button></div></div></section></div>, document.body);
}

function DocumentDetailModal({ type, center, onClose }: { type: Exclude<DetailModal, null>; center: SkillCenter; onClose: () => void }) {
  const documents = type === "placement" ? ["Employer Invitation", "Candidate Attendance Sheet", "Selection List"] : ["Visit Approval", "Attendance Sheet", "Visit Photographs"];
  const [activeDocument, setActiveDocument] = useState(documents[1]);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [onClose]);
  const title = type === "placement" ? "JSW Steel Hiring Drive" : "Tata Steel Exposure Visit";
  const subtitle = type === "placement" ? `${center.candidates[0].batch} · JSW Steel` : `${center.candidates[0].batch} · Tata Steel, ${center.district}`;
  return createPortal(<div className="zo-projects-backdrop fixed inset-0 z-[100] flex justify-end" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="document-modal-title" className="zo-projects-surface zo-projects-panel h-full w-full max-w-[900px] overflow-y-auto"><header className="zo-projects-header sticky top-0 z-10 flex items-center justify-between px-6 py-5"><h2 id="document-modal-title" className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label="Close details" className="focus-ring grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white"><X size={20} /></button></header><div className="p-6 lg:p-8"><div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300">Pantiss verified document review</p><h3 className="mt-4 text-lg font-semibold">{type === "placement" ? "Placement Drive" : "Exposure Visit"}</h3><p className="mt-1 text-sm text-slate-400">{subtitle}</p></div><div className="mt-7 flex overflow-x-auto border-b border-white/10">{documents.map((documentName) => <button key={documentName} type="button" onClick={() => setActiveDocument(documentName)} className={cn("focus-ring relative flex min-w-max flex-1 items-center justify-center gap-2 px-4 py-4 text-xs font-semibold", activeDocument === documentName ? "text-red-300" : "text-slate-500")}><FileText size={16} />{documentName}{activeDocument === documentName && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-500 to-violet-400" />}</button>)}</div><div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="text-lg font-semibold">{activeDocument}</h3><p className="mt-1 text-xs text-slate-500">{activeDocument.toLowerCase().replaceAll(" ", "-")}.jpg · Uploaded 28 Jul 2026</p></div><button type="button" onClick={() => downloadText(`${center.id}-${activeDocument.toLowerCase().replaceAll(" ", "-")}.txt`, `${activeDocument}\n${subtitle}\nUploaded: 28 Jul 2026\nStatus: Verified`)} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-semibold text-slate-200"><ExternalLink size={15} />Open file</button></div><div className="mt-5 grid min-h-[420px] place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#020817] p-8"><DocumentPreview type={type} documentName={activeDocument} center={center} /></div></div></section></div>, document.body);
}

function DocumentPreview({ type, documentName, center }: { type: Exclude<DetailModal, null>; documentName: string; center: SkillCenter }) {
  const evidenceImage = type === "placement" ? "/images/skill-development/placement-drive.jpg" : "/images/skill-development/industry-exposure.jpg";
  const evidenceAlt = type === "placement" ? "Candidate participating in a placement interview" : "Trainees attending an industrial exposure visit";
  const details = type === "placement" ? [["Batch / Trade", center.candidates[0].batch], ["Candidates", "18 attended"], ["Employer", "JSW Steel"], ["Selected", "7 candidates"]] : [["Center", center.name], ["Attendance", "24 / 26"], ["Trainer", "Anita Patel"], ["Visit site", `Tata Steel, ${center.district}`]];
  return <div className="w-full max-w-2xl rounded-xl border border-slate-300/20 bg-slate-100 p-6 text-slate-900 shadow-2xl"><div className="flex items-start justify-between border-b border-slate-300 pb-5"><div className="flex items-center gap-3"><img src="/pantiss-mark.png" alt="" className="size-10 object-contain" /><div><p className="text-xs font-bold uppercase tracking-wider text-red-700">Pantiss Foundation</p><p className="mt-1 text-[10px] text-slate-500">PMKVY 4.0 Odisha Skills</p></div></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-semibold text-emerald-700">Verified</span></div><h4 className="mt-6 text-center text-xl font-bold">{documentName}</h4><p className="mt-2 text-center text-xs text-slate-500">{type === "placement" ? "JSW Steel Hiring Drive · 28 July 2026" : "Tata Steel Exposure Visit · 22 July 2026"}</p><figure className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-900"><img src={evidenceImage} alt={evidenceAlt} className="aspect-[4/3] w-full object-cover" /><figcaption className="bg-slate-900 px-4 py-3 text-[10px] text-slate-300">Geo-tagged project evidence · {center.district}, Odisha</figcaption></figure><div className="mt-5 grid grid-cols-2 gap-3">{details.map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-3"><p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>)}</div><div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center"><UserCheck size={22} className="text-red-600" /><span><span className="block text-xs font-semibold">Authenticated field record</span><span className="mt-1 block text-[10px] text-slate-500">Document preview for monitoring and verification</span></span></div><div className="mt-8 flex justify-between border-t border-slate-200 pt-4 text-[9px] text-slate-400"><span>PNT/M&E/2026/{center.id.toUpperCase()}</span><span>Generated by Pantiss ERP</span></div></div>;
}

function EnterpriseIntro() {
  return <EnterprisePanel className="p-6 lg:p-8"><span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-200"><BriefcaseBusiness size={13} />Enterprise project dashboard</span><h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl">Project details, simplified for operating decisions.</h1><p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">Move from portfolio health to project execution to center-level delivery without losing context.</p></EnterprisePanel>;
}

function EnterprisePanel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(127,29,29,.28),transparent_34%),linear-gradient(145deg,#111112,#09090a)] shadow-[0_24px_70px_rgba(0,0,0,.2)]", className)}>{children}</section>;
}
