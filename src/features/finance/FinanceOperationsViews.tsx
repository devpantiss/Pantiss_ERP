import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Banknote, Building2, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Coins, Copy, Download, Eye, FileText, GitCompareArrows, History, House, Landmark, Paperclip, Plane, Plus, ReceiptText, RotateCcw, Save, Scale, Search, Send, ShieldCheck, ShoppingCart, Trash2, Upload, UserRound, Utensils, WalletCards, X, Zap } from "lucide-react";
import { areaTotals, financeAreas, formatCurrency, type FinanceArea, type FinanceProject } from "./data";
import { budgetPdfFilename, createBudgetPdf, createBudgetSummaryPdf, budgetSummaryPdfFilename, type BudgetPdfData } from "./budgetPdf";
import { useSalaryRecords } from "./useSalaryRecords";
import { salaryKey, salaryMoney, payrollMonths, salaryMonthLabel, salaryDateLabel, canForwardSalary, salaryWorkflowLabel, type SalaryRecord } from "./salaryData";
import { PaymentsBrowser } from "./PaymentsBrowser";
import { paymentAmount, paymentRecordKey } from "./paymentHierarchy";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

export type FinanceOperationsSection = "budgets" | "approvals" | "payments";

export function FinanceOperationsView({ section }: { section: FinanceOperationsSection }) {
  if (section === "budgets") return <BudgetsView />;
  if (section === "payments") return <PaymentsView />;
  return <CombinedApprovalsView />;
}

interface BudgetDraft {
  id: string;
  areaId: string;
  projectId: string;
  title: string;
  fiscalYear: string;
  fundingSource: string;
  created: string;
  currency: string;
  trackingMethod: string;
  threshold: number;
  notes: string;
  lines: BudgetLine[];
  status: BudgetStatus;
  history: BudgetHistoryEntry[];
}

type BudgetStatus = "Draft" | "Pending approval" | "Changes requested" | "Approved";

interface BudgetHistoryEntry {
  action: string;
  actor: string;
  date: string;
  note?: string;
}

interface BudgetLine {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rate: number;
}

type BudgetCategory = "Personnel" | "Programme activities" | "Equipment & materials" | "Travel & field operations" | "Monitoring & evaluation" | "Administration";
const budgetCategories: BudgetCategory[] = ["Personnel", "Programme activities", "Equipment & materials", "Travel & field operations", "Monitoring & evaluation", "Administration"];
const allocationShares: Record<BudgetCategory, number> = { Personnel: .24, "Programme activities": .31, "Equipment & materials": .18, "Travel & field operations": .11, "Monitoring & evaluation": .08, Administration: .08 };
const budgetDraftStorageKey = "pantiss:finance-budget-drafts";
const budgetAutosaveStorageKey = "pantiss:finance-budget-autosave";

function useOverlayBehavior(onClose: () => void) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [onClose]);
}

function readBudgetDrafts(): BudgetDraft[] {
  try { return (JSON.parse(localStorage.getItem(budgetDraftStorageKey) ?? "[]") as BudgetDraft[]).filter((draft) => Array.isArray(draft.lines)).map((draft) => ({ ...draft, status: draft.status ?? "Draft", history: draft.history ?? [{ action: "Draft created", actor: "Finance Manager", date: draft.created }] })); }
  catch { return []; }
}

export function BudgetsView() {
  const [selectedArea, setSelectedArea] = useState<FinanceArea | null>(null);
  const [selectedProject, setSelectedProject] = useState<FinanceProject | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [drafts, setDrafts] = useState<BudgetDraft[]>(readBudgetDrafts);
  const totalApproved = financeAreas.reduce((sum, area) => sum + area.approved, 0);
  const totalSpent = financeAreas.reduce((sum, area) => sum + areaTotals(area).spent, 0);

  useEffect(() => { localStorage.setItem(budgetDraftStorageKey, JSON.stringify(drafts)); }, [drafts]);

  const openArea = (area: FinanceArea) => { setSelectedArea(area); setSelectedProject(null); window.scrollTo({ top: 0, behavior: "auto" }); };
  const openProject = (project: FinanceProject) => { setSelectedProject(project); window.scrollTo({ top: 0, behavior: "auto" }); };
  const saveDraft = (draft: BudgetDraft) => { setDrafts((current) => [draft, ...current]); const area = financeAreas.find((item) => item.id === draft.areaId) ?? null; const project = area?.projects.find((item) => item.id === draft.projectId) ?? null; setSelectedArea(area); setSelectedProject(project); setCreateOpen(false); };
  const updateDraft = (id: string, changes: Partial<BudgetDraft>) => setDrafts((current) => current.map((draft) => draft.id === id ? { ...draft, ...changes } : draft));

  if (selectedProject && selectedArea) return <ProjectBudgetDetail area={selectedArea} project={selectedProject} drafts={drafts.filter((draft) => draft.projectId === selectedProject.id)} onBack={() => setSelectedProject(null)} onCreate={() => setCreateOpen(true)} onUpdateDraft={updateDraft} createModal={createOpen ? <CreateBudgetModal initialArea={selectedArea} initialProject={selectedProject} onClose={() => setCreateOpen(false)} onSave={saveDraft} /> : null} />;
  if (selectedArea) return <AreaProjectBudgets area={selectedArea} onBack={() => setSelectedArea(null)} onProject={openProject} onCreate={() => setCreateOpen(true)} createModal={createOpen ? <CreateBudgetModal initialArea={selectedArea} onClose={() => setCreateOpen(false)} onSave={saveDraft} /> : null} />;

  return <div className="space-y-6"><section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white sm:p-8"><div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" /><div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><WalletCards size={13} />Budget control</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Portfolio budgets</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Select a thematic portfolio to review its projects, inspect detailed cost heads or create a new project budget.</p></div><button type="button" onClick={() => setCreateOpen(true)} className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-emerald-800"><Plus size={15} />Create budget</button></div></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Approved budget", value: formatCurrency(totalApproved), note: "FY 2026–27" }, { label: "Verified expenditure", value: formatCurrency(totalSpent), note: `${Math.round(totalSpent / totalApproved * 100)}% utilized` }, { label: "Budget revisions", value: String(6 + drafts.length), note: "Draft and awaiting approval" }, { label: "Unallocated reserve", value: "₹42.0 L", note: "2.7% of portfolio" }].map((item) => <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-[10px] text-[var(--text-subtle)]">{item.note}</p></article>)}</section><section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Select a thematic area</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Open its project-level budget register</p></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{financeAreas.map((area) => { const totals = areaTotals(area); return <button type="button" key={area.id} onClick={() => openArea(area)} className="focus-ring group rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-500/30"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]"><span className="size-2.5 rounded-full" style={{ background: area.color }} />{area.name}</span><ArrowUpRight size={15} className="text-[var(--text-subtle)]" /></div><div className="mt-5 grid grid-cols-2 gap-2"><span><b className="block text-lg text-[var(--text)]">{formatCurrency(totals.approved)}</b><small className="text-[9px] text-[var(--text-subtle)]">Approved</small></span><span><b className="block text-lg text-[var(--text)]">{area.projects.length}</b><small className="text-[9px] text-[var(--text-subtle)]">Projects</small></span></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full" style={{ width: `${totals.utilization}%`, background: area.color }} /></div><p className="mt-2 text-[9px] text-[var(--text-subtle)]">{totals.utilization}% utilized · {formatCurrency(totals.available)} available</p></button>; })}</div></section>{createOpen && <CreateBudgetModal onClose={() => setCreateOpen(false)} onSave={saveDraft} />}</div>;
}

function AreaProjectBudgets({ area, onBack, onProject, onCreate, createModal }: { area: FinanceArea; onBack: () => void; onProject: (project: FinanceProject) => void; onCreate: () => void; createModal: ReactNode }) {
  const totals = areaTotals(area);
  return <div className="space-y-6"><button type="button" onClick={onBack} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"><ArrowLeft size={16} />All thematic budgets</button><section className="rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Thematic project budgets</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">{area.name}</h2><p className="mt-2 text-sm text-white/60">{area.projects.length} projects · {formatCurrency(totals.approved)} approved</p></div><button type="button" onClick={onCreate} className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-emerald-800"><Plus size={15} />Create project budget</button></div></section><section className="grid gap-4 sm:grid-cols-3">{[{ label: "Approved", value: formatCurrency(totals.approved) }, { label: "Spent", value: formatCurrency(totals.spent) }, { label: "Available", value: formatCurrency(totals.available) }].map((item) => <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5"><p className="text-2xl font-semibold text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p></article>)}</section><section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]"><div className="border-b border-[var(--border)] p-5 sm:p-6"><h3 className="text-base font-semibold text-[var(--text)]">Projects</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Select a project to inspect detailed budget lines</p></div><div className="divide-y divide-[var(--border)]">{area.projects.map((project) => <button key={project.id} type="button" onClick={() => onProject(project)} className="focus-ring flex w-full flex-col gap-4 p-5 text-left hover:bg-[var(--surface-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><p className="text-xs font-semibold text-[var(--text)]">{project.name}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{project.id} · {project.donor} · {project.location}</p></div><div className="flex items-center gap-6"><span><b className="block text-sm text-[var(--text)]">{formatCurrency(project.approved)}</b><small className="text-[8px] uppercase text-[var(--text-subtle)]">Approved</small></span><span><b className="block text-sm text-[var(--text)]">{project.utilization}%</b><small className="text-[8px] uppercase text-[var(--text-subtle)]">Utilized</small></span><ArrowUpRight size={15} className="text-emerald-600" /></div></button>)}</div></section>{createModal}</div>;
}

function ProjectBudgetDetail({ area, project, drafts, onBack, onCreate, onUpdateDraft, createModal }: { area: FinanceArea; project: FinanceProject; drafts: BudgetDraft[]; onBack: () => void; onCreate: () => void; onUpdateDraft: (id: string, changes: Partial<BudgetDraft>) => void; createModal: ReactNode }) {
  const allocations = budgetCategories.map((category) => ({ category, approved: project.approved * allocationShares[category], spent: project.spent * (allocationShares[category] + (category === "Programme activities" ? .025 : category === "Administration" ? -.02 : -.001)) }));
  const available = project.approved - project.spent - project.committed;
  const [pdfPreview, setPdfPreview] = useState<BudgetPdfData | null>(null);
  const [compareDraft, setCompareDraft] = useState<BudgetDraft | null>(null);
  const approvedPdf: BudgetPdfData = {
    id: `${project.id}-BUD-01`, title: "Approved project budget - Version 1.0", status: "Approved", thematicArea: area.name,
    projectName: project.name, projectId: project.id, fundingSource: project.donor, fiscalYear: "FY 2026-27", currency: "INR - Indian Rupee",
    trackingMethod: "Based on project amount", threshold: 80, created: "02 Apr 2026", notes: "Approved annual cost plan aligned with the sanctioned project proposal and grant conditions.",
    lines: allocations.map((item) => ({ name: item.category, description: `Approved allocation for ${item.category.toLowerCase()}.`, quantity: 1, rate: item.approved })),
  };
  const draftPdf = (draft: BudgetDraft): BudgetPdfData => ({
    id: draft.id, title: draft.title, status: draft.status, thematicArea: area.name, projectName: project.name, projectId: project.id,
    fundingSource: draft.fundingSource, fiscalYear: draft.fiscalYear.replace("–", "-"), currency: draft.currency, trackingMethod: draft.trackingMethod,
    threshold: draft.threshold, created: draft.created, notes: draft.notes, lines: draft.lines,
  });
  const transitionDraft = (draft: BudgetDraft, status: BudgetStatus, action: string, note?: string) => onUpdateDraft(draft.id, { status, history: [...draft.history, { action, actor: "Finance Manager", date: "04 Aug 2026", note }] });
  return <div className="space-y-6"><button type="button" onClick={onBack} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"><ArrowLeft size={16} />{area.name} projects</button><section className="rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white sm:p-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Detailed project budget</p><h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.045em]">{project.name}</h2><p className="mt-2 text-sm text-white/60">{project.id} · {project.donor} · FY 2026–27</p></div><button type="button" onClick={onCreate} className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-emerald-800"><Plus size={15} />New budget version</button></div></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Approved", value: formatCurrency(project.approved) }, { label: "Released", value: formatCurrency(project.released) }, { label: "Spent", value: formatCurrency(project.spent) }, { label: "Available", value: formatCurrency(available) }].map((item) => <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5"><p className="text-2xl font-semibold text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p></article>)}</section><section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]"><div className="border-b border-[var(--border)] p-5 sm:p-6"><h3 className="text-base font-semibold text-[var(--text)]">Approved cost-head budget</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Allocation, expenditure and remaining balance by category</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-[var(--surface-soft)] text-[9px] uppercase tracking-wide text-[var(--text-subtle)]"><th className="px-6 py-4">Cost head</th><th className="px-4 py-4">Approved</th><th className="px-4 py-4">Spent</th><th className="px-4 py-4">Balance</th><th className="px-6 py-4">Utilization</th></tr></thead><tbody>{allocations.map((item) => { const utilization = Math.round(item.spent / item.approved * 100); return <tr key={item.category} className="border-t border-[var(--border)]"><td className="px-6 py-4 text-xs font-semibold text-[var(--text)]">{item.category}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(item.approved, true)}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{formatCurrency(item.spent, true)}</td><td className="px-4 py-4 text-xs text-emerald-600">{formatCurrency(item.approved - item.spent, true)}</td><td className="px-6 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${utilization}%` }} /></div><span className="text-[10px] text-[var(--text-muted)]">{utilization}%</span></div></td></tr>; })}</tbody></table></div></section><section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-500"><FileText size={17} /></span><div><h3 className="text-base font-semibold text-[var(--text)]">Budget documents and workflow</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Preview, compare, download and move budget versions through approval</p></div></div><div className="mt-5 space-y-3"><div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:flex-row sm:items-center sm:justify-between"><span><b className="block text-xs text-[var(--text)]">Approved budget · Version 1.0</b><small className="mt-1 block text-[9px] text-[var(--text-subtle)]">FY 2026–27 · Approved 02 Apr 2026</small></span><div className="flex items-center gap-2"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-semibold text-emerald-600">Approved</span><BudgetPdfActions data={approvedPdf} onPreview={setPdfPreview} /></div></div>{drafts.map((draft) => <BudgetDraftVersion key={draft.id} draft={draft} pdf={draftPdf(draft)} onPreview={setPdfPreview} onCompare={() => setCompareDraft(draft)} onTransition={(status, action, note) => transitionDraft(draft, status, action, note)} />)}</div></section>{createModal}{pdfPreview && <BudgetPdfPreview data={pdfPreview} onClose={() => setPdfPreview(null)} />}{compareDraft && <BudgetComparisonModal approved={approvedPdf} draft={draftPdf(compareDraft)} onClose={() => setCompareDraft(null)} />}</div>;
}

const budgetStatusStyles: Record<BudgetStatus, string> = {
  Draft: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  "Pending approval": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Changes requested": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function BudgetDraftVersion({ draft, pdf, onPreview, onCompare, onTransition }: { draft: BudgetDraft; pdf: BudgetPdfData; onPreview: (data: BudgetPdfData) => void; onCompare: () => void; onTransition: (status: BudgetStatus, action: string, note?: string) => void }) {
  const requestChanges = () => { const note = window.prompt("What needs to be revised?"); if (note?.trim()) onTransition("Changes requested", "Changes requested", note.trim()); };
  const owner = draft.status === "Pending approval" ? "Finance Approver" : draft.status === "Approved" ? "Finance Control" : "Budget Owner";
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><b className="block text-xs text-[var(--text)]">{draft.title}</b><small className="mt-1 block text-[9px] text-[var(--text-subtle)]">{draft.fiscalYear} · {draft.fundingSource} · {draft.lines.length} custom cost heads · {formatCurrency(draft.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0), true)}</small></div><div className="flex flex-wrap items-center justify-end gap-2"><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", budgetStatusStyles[draft.status])}>{draft.status}</span><button type="button" onClick={onCompare} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-2.5 text-[9px] font-semibold text-[var(--text-muted)]"><GitCompareArrows size={12} />Compare</button><BudgetPdfActions data={pdf} onPreview={onPreview} /></div></div>
    <div className="mt-4 grid gap-3 border-y border-[var(--border)] py-3 sm:grid-cols-[140px_1fr]"><div><p className="text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">Current owner</p><p className="mt-1 text-[10px] font-semibold text-[var(--text)]">{owner}</p></div><div><p className="text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">Approval timeline</p><div className="mt-2 flex flex-wrap gap-2">{draft.history.map((entry, index) => <span key={`${entry.action}-${index}`} title={entry.note} className="rounded-full border border-[var(--border)] bg-[var(--module-bg)] px-2 py-1 text-[8px] text-[var(--text-subtle)]">{entry.action} · {entry.date}</span>)}</div></div></div>
    <div className="mt-3 flex flex-wrap justify-end gap-2">{(draft.status === "Draft" || draft.status === "Changes requested") && <button type="button" onClick={() => onTransition("Pending approval", "Submitted for approval")} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white"><Send size={12} />Submit for approval</button>}{draft.status === "Pending approval" && <><button type="button" onClick={requestChanges} className="focus-ring h-9 rounded-lg border border-amber-500/25 px-3 text-[9px] font-semibold text-amber-600">Return for revision</button><button type="button" onClick={() => onTransition("Approved", "Budget approved")} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-3 text-[9px] font-semibold text-white"><CheckCircle2 size={12} />Approve budget</button></>}</div>
  </article>;
}

function BudgetComparisonModal({ approved, draft, onClose }: { approved: BudgetPdfData; draft: BudgetPdfData; onClose: () => void }) {
  useOverlayBehavior(onClose);
  const approvedMap = new Map(approved.lines.map((line) => [line.name.toLowerCase(), line]));
  const draftMap = new Map(draft.lines.map((line) => [line.name.toLowerCase(), line]));
  const names = [...new Set([...approved.lines.map((line) => line.name), ...draft.lines.map((line) => line.name)])];
  const approvedTotal = approved.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  const draftTotal = draft.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  return <div className="zo-projects-backdrop fixed inset-0 z-[65] overflow-y-auto p-4"><div className="zo-projects-surface mx-auto my-6 w-full max-w-5xl overflow-hidden"><div className="zo-projects-header flex items-start justify-between border-b border-[var(--border)] p-5 sm:p-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Version comparison</p><h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Approved budget vs {draft.title}</h2><p className="mt-1 text-xs text-[var(--text-subtle)]">Added, removed and changed cost heads are highlighted below.</p></div><button type="button" onClick={onClose} className="focus-ring grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]"><X size={15} /></button></div><div className="grid gap-3 border-b border-[var(--border)] p-5 sm:grid-cols-3 sm:p-6">{[{ label: "Approved total", value: formatCurrency(approvedTotal, true) }, { label: "Draft total", value: formatCurrency(draftTotal, true) }, { label: "Net variance", value: `${draftTotal >= approvedTotal ? "+" : "-"}${formatCurrency(Math.abs(draftTotal - approvedTotal), true)}` }].map((item) => <div key={item.label} className="rounded-xl bg-[var(--surface-soft)] p-4"><p className="text-[9px] uppercase text-[var(--text-subtle)]">{item.label}</p><p className="mt-2 text-lg font-semibold text-[var(--text)]">{item.value}</p></div>)}</div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-[var(--surface-soft)] text-[9px] uppercase tracking-wide text-[var(--text-subtle)]"><th className="px-6 py-4">Cost head</th><th className="px-4 py-4">Approved</th><th className="px-4 py-4">Draft</th><th className="px-4 py-4">Variance</th><th className="px-6 py-4">Change</th></tr></thead><tbody>{names.map((name) => { const original = approvedMap.get(name.toLowerCase()); const revised = draftMap.get(name.toLowerCase()); const originalAmount = original ? original.quantity * original.rate : 0; const revisedAmount = revised ? revised.quantity * revised.rate : 0; const change = !original ? "Added" : !revised ? "Removed" : Math.abs(revisedAmount - originalAmount) < .001 ? "Unchanged" : "Changed"; return <tr key={name} className="border-t border-[var(--border)]"><td className="px-6 py-4 text-xs font-semibold text-[var(--text)]">{name}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{original ? formatCurrency(originalAmount, true) : "—"}</td><td className="px-4 py-4 text-xs text-[var(--text-muted)]">{revised ? formatCurrency(revisedAmount, true) : "—"}</td><td className={cn("px-4 py-4 text-xs font-medium", revisedAmount - originalAmount > 0 ? "text-red-500" : "text-emerald-600")}>{revisedAmount - originalAmount >= 0 ? "+" : "-"}{formatCurrency(Math.abs(revisedAmount - originalAmount), true)}</td><td className="px-6 py-4"><span className={cn("rounded-full px-2 py-1 text-[9px] font-semibold", change === "Added" ? "bg-blue-500/10 text-blue-500" : change === "Removed" ? "bg-red-500/10 text-red-500" : change === "Changed" ? "bg-amber-500/10 text-amber-600" : "bg-slate-500/10 text-[var(--text-subtle)]")}>{change}</span></td></tr>; })}</tbody></table></div></div></div>;
}

function BudgetPdfActions({ data, onPreview }: { data: BudgetPdfData; onPreview: (data: BudgetPdfData) => void }) {
  const downloadFull = async () => (await createBudgetPdf(data)).save(budgetPdfFilename(data));
  const downloadSummary = async () => (await createBudgetSummaryPdf(data)).save(budgetSummaryPdfFilename(data));
  return (
    <span className="flex items-center gap-1">
      <button type="button" onClick={() => onPreview(data)} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-2.5 text-[9px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
        <Eye size={12} />Preview
      </button>
      <button type="button" onClick={() => void downloadSummary()} title="Download budget allocation summary (cost heads + amounts)" className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-teal-600 px-2.5 text-[9px] font-semibold text-white hover:bg-teal-700">
        <Download size={12} />Summary
      </button>
      <button type="button" onClick={() => void downloadFull()} title="Download full detailed budget report" className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 text-[9px] font-semibold text-white hover:bg-emerald-700">
        <Download size={12} />Full report
      </button>
    </span>
  );
}

function BudgetPdfPreview({ data, onClose }: { data: BudgetPdfData; onClose: () => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    void createBudgetPdf(data).then((document) => {
      objectUrl = URL.createObjectURL(document.output("blob"));
      if (cancelled) URL.revokeObjectURL(objectUrl);
      else setUrl(objectUrl);
    });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [data]);
  const download = async () => (await createBudgetPdf(data)).save(budgetPdfFilename(data));
  return <Overlay open onClose={onClose} variant="fullscreen" size="full" zIndex={70} label="Budget document" title="PDF preview" description={`${data.projectName} · ${data.fiscalYear}`} headerActions={<button type="button" onClick={() => void download()} className="focus-ring inline-flex h-9 items-center gap-2 rounded-md bg-[var(--brand-primary)] px-3 text-[10px] font-semibold text-white hover:bg-[var(--brand-hover)]"><Download size={13} />Download PDF</button>}><div className="h-full bg-[#eef1f5] p-2 sm:p-4 dark:bg-slate-950">{url ? <iframe src={url} title={`${data.title} PDF preview`} className="size-full rounded-md border border-slate-300 bg-white" /> : <div className="grid size-full place-items-center text-sm text-slate-500">Preparing PDF preview…</div>}</div></Overlay>;
}

interface BudgetFormSnapshot {
  areaId: string;
  projectId: string;
  title: string;
  fiscalYear: string;
  fundingSource: string;
  currency: string;
  trackingMethod: string;
  threshold: number;
  notes: string;
  lines: BudgetLine[];
  savedAt: string;
}

function readBudgetAutosave(): BudgetFormSnapshot | null {
  try {
    const snapshot = JSON.parse(localStorage.getItem(budgetAutosaveStorageKey) ?? "null") as BudgetFormSnapshot | null;
    return snapshot && Array.isArray(snapshot.lines) ? snapshot : null;
  } catch { return null; }
}

function CreateBudgetModal({ initialArea, initialProject, onClose, onSave }: { initialArea?: FinanceArea; initialProject?: FinanceProject; onClose: () => void; onSave: (draft: BudgetDraft) => void }) {
  const [areaId, setAreaId] = useState(initialArea?.id ?? financeAreas[0].id);
  const projects = useMemo(() => financeAreas.find((area) => area.id === areaId)?.projects ?? [], [areaId]);
  const [projectId, setProjectId] = useState(initialProject?.id ?? projects[0]?.id ?? "");
  const [title, setTitle] = useState("Annual operating budget · Version 2.0");
  const [fiscalYear, setFiscalYear] = useState("FY 2026–27");
  const [fundingSource, setFundingSource] = useState(initialProject?.donor ?? projects[0]?.donor ?? "");
  const [currency, setCurrency] = useState("INR - Indian Rupee");
  const [trackingMethod, setTrackingMethod] = useState("Based on project amount");
  const [threshold, setThreshold] = useState(80);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<BudgetLine[]>([{ id: "line-1", name: "", description: "", quantity: 1, rate: 0 }]);
  const [availableAutosave, setAvailableAutosave] = useState<BudgetFormSnapshot | null>(readBudgetAutosave);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState("");
  const initialSignature = useRef(JSON.stringify({ areaId, projectId, title, fiscalYear, fundingSource, currency, trackingMethod, threshold, notes, lines }));
  const selectedProject = projects.find((project) => project.id === projectId);
  const total = lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  const normalizedNames = lines.map((line) => line.name.trim().toLowerCase()).filter(Boolean);
  const duplicateNames = new Set(normalizedNames.filter((name, index) => normalizedNames.indexOf(name) !== index));
  const errors = [
    ...(!title.trim() ? ["Enter a budget title."] : []),
    ...(!projectId ? ["Select a project."] : []),
    ...(!fundingSource.trim() ? ["Enter a funding source."] : []),
    ...(lines.some((line) => !line.name.trim()) ? ["Every cost head needs a name."] : []),
    ...(lines.some((line) => line.quantity <= 0 || line.rate <= 0) ? ["Quantity and rate must be greater than zero."] : []),
    ...(duplicateNames.size ? ["Cost head names must be unique."] : []),
  ];
  const warnings = [
    ...(selectedProject && total > selectedProject.approved ? [`Planned cost exceeds the approved project ceiling by ${formatCurrency(total - selectedProject.approved, true)}.`] : []),
    ...(total > 0 && lines.some((line) => line.quantity * line.rate > total * .5) ? ["One cost head represents more than 50% of the total budget."] : []),
    ...(threshold < 60 ? ["The utilization alert is below the recommended 60% review point."] : []),
  ];
  const valid = errors.length === 0;

  useEffect(() => {
    const signature = JSON.stringify({ areaId, projectId, title, fiscalYear, fundingSource, currency, trackingMethod, threshold, notes, lines });
    if (signature === initialSignature.current) return;
    setDirty(true);
    const timer = window.setTimeout(() => {
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const snapshot: BudgetFormSnapshot = { areaId, projectId, title, fiscalYear, fundingSource, currency, trackingMethod, threshold, notes, lines, savedAt: stamp };
      localStorage.setItem(budgetAutosaveStorageKey, JSON.stringify(snapshot));
      setSavedAt(stamp);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [areaId, projectId, title, fiscalYear, fundingSource, currency, trackingMethod, threshold, notes, lines]);

  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);

  const closeSafely = () => { if (!dirty || window.confirm("Your draft is autosaved locally. Close the budget form?")) onClose(); };
  useOverlayBehavior(closeSafely);
  const changeArea = (value: string) => { const nextProjects = financeAreas.find((area) => area.id === value)?.projects ?? []; setAreaId(value); setProjectId(nextProjects[0]?.id ?? ""); setFundingSource(nextProjects[0]?.donor ?? ""); };
  const updateLine = (id: string, changes: Partial<BudgetLine>) => setLines((current) => current.map((line) => line.id === id ? { ...line, ...changes } : line));
  const addLine = () => setLines((current) => [...current, { id: `line-${Date.now()}`, name: "", description: "", quantity: 1, rate: 0 }]);
  const duplicateLine = (line: BudgetLine) => setLines((current) => [...current, { ...line, id: `line-${Date.now()}` }]);
  const removeLine = (id: string) => setLines((current) => current.length === 1 ? current : current.filter((line) => line.id !== id));
  const moveLine = (index: number, direction: -1 | 1) => setLines((current) => { const target = index + direction; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const loadTemplate = () => setLines([
    { id: `line-${Date.now()}-1`, name: "Project personnel", description: "Programme and finance staff allocation", quantity: 12, rate: 0.55 },
    { id: `line-${Date.now()}-2`, name: "Training delivery", description: "Venue, trainers and participant materials", quantity: 10, rate: 0.8 },
    { id: `line-${Date.now()}-3`, name: "Field travel", description: "Monitoring and community visits", quantity: 12, rate: 0.22 },
    { id: `line-${Date.now()}-4`, name: "Monitoring and evaluation", description: "Assessments, data collection and review", quantity: 1, rate: 2.4 },
    { id: `line-${Date.now()}-5`, name: "Administration", description: "Shared operational and compliance costs", quantity: 1, rate: 1.6 },
  ]);
  const restoreAutosave = () => {
    if (!availableAutosave) return;
    setAreaId(availableAutosave.areaId); setProjectId(availableAutosave.projectId); setTitle(availableAutosave.title); setFiscalYear(availableAutosave.fiscalYear);
    setFundingSource(availableAutosave.fundingSource); setCurrency(availableAutosave.currency); setTrackingMethod(availableAutosave.trackingMethod);
    setThreshold(availableAutosave.threshold); setNotes(availableAutosave.notes); setLines(availableAutosave.lines); setSavedAt(availableAutosave.savedAt); setAvailableAutosave(null);
  };
  const discardAutosave = () => { localStorage.removeItem(budgetAutosaveStorageKey); setAvailableAutosave(null); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    localStorage.removeItem(budgetAutosaveStorageKey);
    setDirty(false);
    onSave({ id: `BUD-${Date.now()}`, areaId, projectId, title: title.trim(), fiscalYear, fundingSource: fundingSource.trim(), created: "04 Aug 2026", currency, trackingMethod, threshold, notes: notes.trim(), lines, status: "Draft", history: [{ action: "Draft created", actor: "Finance Manager", date: "04 Aug 2026" }] });
  };
  const inputClass = "focus-ring h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none disabled:cursor-not-allowed disabled:opacity-60";
  const cellInput = "focus-ring h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-ghost)]";

  return <div className="zo-projects-backdrop fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) closeSafely(); }}>
    <form onSubmit={submit} className="zo-projects-surface mx-auto my-3 w-full max-w-5xl overflow-hidden">
      <div className="zo-projects-header flex items-start justify-between border-b border-[var(--border)] p-5 sm:px-7 sm:py-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">New project budget</p><h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--text)]">Create budget</h2><p className="mt-1 text-xs text-[var(--text-subtle)]">Set the project context, controls and your own Zoho Projects-style cost structure.</p></div><div className="flex items-center gap-3"><span className="hidden text-[9px] text-[var(--text-subtle)] sm:inline">{savedAt ? `Autosaved ${savedAt}` : "Autosave ready"}</span><button type="button" onClick={closeSafely} className="focus-ring grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]" aria-label="Close budget form"><X size={16} /></button></div></div>
      <div className="space-y-5 p-4 sm:p-6">
        {availableAutosave && <div className="flex flex-col justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/[0.07] p-4 sm:flex-row sm:items-center"><div><p className="text-xs font-semibold text-[var(--text)]">Continue your autosaved budget?</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Last saved at {availableAutosave.savedAt}. Restore it or begin with a clean form.</p></div><div className="flex gap-2"><button type="button" onClick={discardAutosave} className="focus-ring h-9 rounded-lg border border-[var(--border)] px-3 text-[9px] font-semibold text-[var(--text-muted)]">Discard</button><button type="button" onClick={restoreAutosave} className="focus-ring inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white"><RotateCcw size={12} />Restore draft</button></div></div>}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--module-bg)]"><div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4"><h3 className="text-xs font-semibold text-[var(--text)]">Project information</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Associate this budget with an existing portfolio and project.</p></div><div className="grid gap-5 p-5 sm:grid-cols-2"><BudgetField label="Thematic area"><select value={areaId} onChange={(event) => changeArea(event.target.value)} disabled={Boolean(initialArea)} className={inputClass}>{financeAreas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></BudgetField><BudgetField label="Project"><select value={projectId} onChange={(event) => { setProjectId(event.target.value); setFundingSource(projects.find((project) => project.id === event.target.value)?.donor ?? ""); }} disabled={Boolean(initialProject)} className={inputClass}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></BudgetField><BudgetField label="Budget title"><input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} /></BudgetField><BudgetField label="Funding source"><input value={fundingSource} onChange={(event) => setFundingSource(event.target.value)} className={inputClass} /></BudgetField></div></section>
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--module-bg)]"><div className="border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4"><h3 className="text-xs font-semibold text-[var(--text)]">Budget configuration</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Define the financial period, currency, tracking basis and alert threshold.</p></div><div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4"><BudgetField label="Financial year"><select value={fiscalYear} onChange={(event) => setFiscalYear(event.target.value)} className={inputClass}><option>FY 2026–27</option><option>FY 2027–28</option></select></BudgetField><BudgetField label="Currency"><select value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputClass}><option>INR - Indian Rupee</option><option>USD - US Dollar</option></select></BudgetField><BudgetField label="Tracking method"><select value={trackingMethod} onChange={(event) => setTrackingMethod(event.target.value)} className={inputClass}><option>Based on project amount</option><option>Based on phases</option><option>Based on cost heads</option></select></BudgetField><BudgetField label="Alert threshold"><span className="relative block"><input type="number" min="1" max="100" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} className={cn(inputClass, "pr-8")} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-subtle)]">%</span></span></BudgetField></div></section>
        {(errors.length > 0 || warnings.length > 0) && <section className="grid gap-3 sm:grid-cols-2">{errors.length > 0 && <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4"><p className="text-[10px] font-semibold text-red-500">Needs attention</p>{errors.map((error) => <p key={error} className="mt-2 text-[9px] text-[var(--text-muted)]">• {error}</p>)}</div>}{warnings.length > 0 && <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4"><p className="text-[10px] font-semibold text-amber-600">Budget checks</p>{warnings.map((warning) => <p key={warning} className="mt-2 text-[9px] text-[var(--text-muted)]">• {warning}</p>)}</div>}</section>}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--module-bg)]"><div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:flex-row sm:items-center"><div><h3 className="text-xs font-semibold text-[var(--text)]">Cost heads</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Add, duplicate and reorder custom lines. Amount = quantity × rate.</p></div><div className="flex gap-2"><button type="button" onClick={loadTemplate} className="focus-ring h-9 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-3 text-[10px] font-semibold text-[var(--text-muted)]">Load NGO template</button><button type="button" onClick={addLine} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] px-3 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"><Plus size={13} />Add cost head</button></div></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead><tr className="border-b border-[var(--border)] text-[8px] uppercase tracking-[0.12em] text-[var(--text-subtle)]"><th className="w-12 px-3 py-3 text-center">#</th><th className="px-3 py-3">Cost head</th><th className="px-3 py-3">Description</th><th className="w-24 px-3 py-3">Qty</th><th className="w-36 px-3 py-3">Rate (₹ L)</th><th className="w-32 px-3 py-3 text-right">Amount</th><th className="w-40 px-3 py-3 text-right">Actions</th></tr></thead><tbody>{lines.map((line, index) => <tr key={line.id} className="border-b border-[var(--border)] last:border-0"><td className="px-3 py-3 text-center text-[10px] text-[var(--text-subtle)]">{String(index + 1).padStart(2, "0")}</td><td className="px-3 py-3"><input value={line.name} onChange={(event) => updateLine(line.id, { name: event.target.value })} placeholder="e.g. Training venue" className={cellInput} /></td><td className="px-3 py-3"><input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} placeholder="Purpose or calculation note" className={cellInput} /></td><td className="px-3 py-3"><input type="number" min=".01" step=".01" value={line.quantity || ""} onChange={(event) => updateLine(line.id, { quantity: Number(event.target.value) })} className={cellInput} /></td><td className="px-3 py-3"><input type="number" min="0" step=".01" value={line.rate || ""} onChange={(event) => updateLine(line.id, { rate: Number(event.target.value) })} placeholder="0.00" className={cellInput} /></td><td className="px-3 py-3 text-right text-xs font-semibold text-[var(--text)]">{formatCurrency(line.quantity * line.rate, true)}</td><td className="px-3 py-3"><span className="flex justify-end gap-1"><button type="button" onClick={() => moveLine(index, -1)} disabled={index === 0} className="focus-ring grid size-8 place-items-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--surface-soft)] disabled:opacity-25" aria-label="Move cost head up"><ArrowUp size={13} /></button><button type="button" onClick={() => moveLine(index, 1)} disabled={index === lines.length - 1} className="focus-ring grid size-8 place-items-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--surface-soft)] disabled:opacity-25" aria-label="Move cost head down"><ArrowDown size={13} /></button><button type="button" onClick={() => duplicateLine(line)} className="focus-ring grid size-8 place-items-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]" aria-label="Duplicate cost head"><Copy size={13} /></button><button type="button" onClick={() => removeLine(line.id)} disabled={lines.length === 1} className="focus-ring grid size-8 place-items-center rounded-lg text-[var(--text-subtle)] hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30" aria-label="Remove cost head"><Trash2 size={13} /></button></span></td></tr>)}</tbody><tfoot><tr className="border-t border-[var(--border)] bg-emerald-500/[0.05]"><td colSpan={5} className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Total planned cost</td><td className="px-3 py-4 text-right text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(total, true)}</td><td /></tr></tfoot></table></div></section>
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5"><BudgetField label="Budget notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Add assumptions, restrictions or approval notes…" className="focus-ring w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text)] outline-none" /></BudgetField></section>
      </div>
      <div className="zo-projects-footer sticky bottom-0 flex flex-col justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:px-7"><div><p className="text-[9px] text-[var(--text-subtle)]">{lines.length} cost {lines.length === 1 ? "head" : "heads"} · Alert at {threshold}% utilization · {errors.length ? `${errors.length} issue${errors.length === 1 ? "" : "s"}` : "Ready to save"}</p><p className="mt-1 text-sm font-semibold text-[var(--text)]">Total: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(total, true)}</span></p></div><div className="flex justify-end gap-2"><button type="button" onClick={closeSafely} className="focus-ring h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)]">Cancel</button><button type="submit" disabled={!valid} className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><Save size={14} />Save as draft</button></div></div>
    </form>
  </div>;
}

function BudgetField({ label, children }: { label: string; children: ReactNode }) { return <label><span className="mb-2 block text-[10px] font-semibold text-[var(--text-muted)]">{label}</span>{children}</label>; }

type CenterExpenseType = "Rental" | "Food" | "Electricity" | "TA/DA";
type TaDaBillStatus = "Submitted" | "Verified" | "Approved" | "Query raised";

interface CenterExpenseRequest {
  id: string;
  type: CenterExpenseType;
  period: string;
  amount: number;
  submitted: string;
  documents: number;
  status: "Ready" | "Clarification";
}

interface CenterApprovalProject {
  projectId: string;
  projectName: string;
  centerId: string;
  centerName: string;
  location: string;
  requests: CenterExpenseRequest[];
}

interface TaDaEmployeeBill {
  id: string;
  centerId: string;
  month: string;
  employee: string;
  employeeId: string;
  designation: string;
  travelDate: string;
  route: string;
  purpose: string;
  claimed: number;
  eligible: number;
  status: TaDaBillStatus;
  documents: Array<{ name: string; kind: string; size: string }>;
}

const centerApprovalProjects: CenterApprovalProject[] = [
  { projectId: "FIN-SKI-01", projectName: "PMKVY 4.0 Odisha Skills", centerId: "CEN-ANG-01", centerName: "Angul Skill Development Center", location: "Angul, Odisha", requests: [
    { id: "CTR-RENT-0182", type: "Rental", period: "August 2026", amount: 1.42, submitted: "02 Aug 2026", documents: 3, status: "Ready" },
    { id: "CTR-FOOD-0181", type: "Food", period: "July 2026", amount: 0.96, submitted: "02 Aug 2026", documents: 4, status: "Ready" },
    { id: "CTR-ELEC-0178", type: "Electricity", period: "July 2026", amount: 0.28, submitted: "01 Aug 2026", documents: 2, status: "Clarification" },
    { id: "CTR-TADA-0175", type: "TA/DA", period: "July 2026", amount: 0.64, submitted: "31 Jul 2026", documents: 6, status: "Ready" },
  ] },
  { projectId: "FIN-SKI-01", projectName: "PMKVY 4.0 Odisha Skills", centerId: "CEN-BBS-02", centerName: "Bhubaneswar Technical Center", location: "Bhubaneswar, Odisha", requests: [
    { id: "CTR-RENT-0191", type: "Rental", period: "August 2026", amount: 1.62, submitted: "03 Aug 2026", documents: 3, status: "Ready" },
    { id: "CTR-FOOD-0189", type: "Food", period: "August 2026", amount: 1.08, submitted: "03 Aug 2026", documents: 5, status: "Ready" },
    { id: "CTR-ELEC-0187", type: "Electricity", period: "July 2026", amount: 0.34, submitted: "02 Aug 2026", documents: 2, status: "Ready" },
    { id: "CTR-TADA-0186", type: "TA/DA", period: "August 2026", amount: 0.78, submitted: "02 Aug 2026", documents: 8, status: "Ready" },
  ] },
  { projectId: "FIN-SKI-02", projectName: "Project Udaan", centerId: "CEN-KEO-01", centerName: "Keonjhar Skills Center", location: "Keonjhar, Odisha", requests: [
    { id: "CTR-RENT-0174", type: "Rental", period: "August 2026", amount: 1.18, submitted: "01 Aug 2026", documents: 3, status: "Ready" },
    { id: "CTR-FOOD-0171", type: "Food", period: "July 2026", amount: 0.82, submitted: "31 Jul 2026", documents: 5, status: "Clarification" },
    { id: "CTR-ELEC-0169", type: "Electricity", period: "July 2026", amount: 0.21, submitted: "30 Jul 2026", documents: 2, status: "Ready" },
    { id: "CTR-TADA-0167", type: "TA/DA", period: "July 2026", amount: 0.48, submitted: "30 Jul 2026", documents: 4, status: "Ready" },
  ] },
  { projectId: "FIN-HEA-01", projectName: "Swasthya Mobile Clinics", centerId: "CEN-DIB-01", centerName: "Dibrugarh Health Training Unit", location: "Dibrugarh, Assam", requests: [
    { id: "CTR-RENT-0168", type: "Rental", period: "August 2026", amount: 1.36, submitted: "30 Jul 2026", documents: 3, status: "Ready" },
    { id: "CTR-FOOD-0164", type: "Food", period: "July 2026", amount: 0.74, submitted: "29 Jul 2026", documents: 4, status: "Ready" },
    { id: "CTR-ELEC-0161", type: "Electricity", period: "July 2026", amount: 0.32, submitted: "29 Jul 2026", documents: 2, status: "Ready" },
    { id: "CTR-TADA-0158", type: "TA/DA", period: "July 2026", amount: 0.88, submitted: "28 Jul 2026", documents: 7, status: "Clarification" },
  ] },
  { projectId: "FIN-ENT-01", projectName: "Saksham Women Enterprise", centerId: "CEN-RAN-01", centerName: "Ranchi Enterprise Hub", location: "Ranchi, Jharkhand", requests: [
    { id: "CTR-RENT-0159", type: "Rental", period: "August 2026", amount: 1.24, submitted: "29 Jul 2026", documents: 3, status: "Ready" },
    { id: "CTR-FOOD-0156", type: "Food", period: "July 2026", amount: 0.68, submitted: "28 Jul 2026", documents: 4, status: "Ready" },
    { id: "CTR-ELEC-0153", type: "Electricity", period: "July 2026", amount: 0.24, submitted: "27 Jul 2026", documents: 2, status: "Clarification" },
    { id: "CTR-TADA-0151", type: "TA/DA", period: "July 2026", amount: 0.56, submitted: "27 Jul 2026", documents: 5, status: "Ready" },
  ] },
];

const taDaEmployeeBills: TaDaEmployeeBill[] = [
  { id: "TADA-2681", centerId: "CEN-ANG-01", month: "July 2026", employee: "Ananya Mishra", employeeId: "EMP-0142", designation: "Center Manager", travelDate: "22 Jul 2026", route: "Angul – Bhubaneswar", purpose: "Monthly project review", claimed: .18, eligible: .17, status: "Submitted", documents: [{ name: "train-ticket-2207.pdf", kind: "Travel ticket", size: "428 KB" }, { name: "hotel-invoice-2207.pdf", kind: "Accommodation", size: "612 KB" }, { name: "travel-claim-form.pdf", kind: "Signed claim", size: "284 KB" }] },
  { id: "TADA-2678", centerId: "CEN-ANG-01", month: "July 2026", employee: "Rahul Behera", employeeId: "EMP-0198", designation: "Mobilization Officer", travelDate: "18 Jul 2026", route: "Angul – Chhendipada", purpose: "Candidate mobilization camp", claimed: .12, eligible: .12, status: "Verified", documents: [{ name: "bus-tickets-july.pdf", kind: "Travel tickets", size: "318 KB" }, { name: "field-visit-approval.pdf", kind: "Tour approval", size: "196 KB" }] },
  { id: "TADA-2669", centerId: "CEN-ANG-01", month: "July 2026", employee: "Priyanka Sahu", employeeId: "EMP-0231", designation: "Placement Officer", travelDate: "11 Jul 2026", route: "Angul – Cuttack", purpose: "Employer partnership meeting", claimed: .21, eligible: .19, status: "Query raised", documents: [{ name: "cab-invoice-1107.pdf", kind: "Travel invoice", size: "355 KB" }, { name: "meeting-approval.pdf", kind: "Tour approval", size: "174 KB" }] },
  { id: "TADA-2704", centerId: "CEN-BBS-02", month: "August 2026", employee: "Sourav Das", employeeId: "EMP-0108", designation: "Technical Trainer", travelDate: "02 Aug 2026", route: "Bhubaneswar – Puri", purpose: "Industry exposure visit", claimed: .24, eligible: .24, status: "Submitted", documents: [{ name: "vehicle-hire-invoice.pdf", kind: "Travel invoice", size: "540 KB" }, { name: "visit-sanction.pdf", kind: "Tour approval", size: "205 KB" }] },
  { id: "TADA-2701", centerId: "CEN-BBS-02", month: "August 2026", employee: "Neha Pattnaik", employeeId: "EMP-0216", designation: "MIS Executive", travelDate: "01 Aug 2026", route: "Bhubaneswar – Khordha", purpose: "Center data verification", claimed: .11, eligible: .11, status: "Verified", documents: [{ name: "bus-ticket-0108.pdf", kind: "Travel ticket", size: "188 KB" }, { name: "field-order.pdf", kind: "Tour approval", size: "164 KB" }] },
  { id: "TADA-2641", centerId: "CEN-KEO-01", month: "July 2026", employee: "Manas Ranjan", employeeId: "EMP-0184", designation: "Center Coordinator", travelDate: "20 Jul 2026", route: "Keonjhar – Barbil", purpose: "Training center inspection", claimed: .16, eligible: .16, status: "Submitted", documents: [{ name: "travel-voucher.pdf", kind: "Travel voucher", size: "326 KB" }, { name: "inspection-order.pdf", kind: "Tour approval", size: "214 KB" }] },
  { id: "TADA-2618", centerId: "CEN-DIB-01", month: "July 2026", employee: "Ritika Sharma", employeeId: "EMP-0166", designation: "Programme Officer", travelDate: "15 Jul 2026", route: "Dibrugarh – Tinsukia", purpose: "Mobile clinic supervision", claimed: .26, eligible: .23, status: "Submitted", documents: [{ name: "taxi-invoice.pdf", kind: "Travel invoice", size: "462 KB" }, { name: "daily-allowance-form.pdf", kind: "DA claim", size: "248 KB" }] },
  { id: "TADA-2594", centerId: "CEN-RAN-01", month: "July 2026", employee: "Abhishek Kumar", employeeId: "EMP-0254", designation: "Enterprise Mentor", travelDate: "09 Jul 2026", route: "Ranchi – Khunti", purpose: "Entrepreneur mentoring visit", claimed: .14, eligible: .14, status: "Approved", documents: [{ name: "bus-ticket.pdf", kind: "Travel ticket", size: "182 KB" }, { name: "tour-diary.pdf", kind: "Tour diary", size: "296 KB" }] },
];

const centerExpenseMeta = {
  Rental: { icon: House, color: "text-blue-600 bg-blue-500/10" },
  Food: { icon: Utensils, color: "text-orange-600 bg-orange-500/10" },
  Electricity: { icon: Zap, color: "text-amber-600 bg-amber-500/10" },
  "TA/DA": { icon: Plane, color: "text-violet-600 bg-violet-500/10" },
} satisfies Record<CenterExpenseType, { icon: typeof House; color: string }>;

function CenterApprovalsView() {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [expenseFilter, setExpenseFilter] = useState<"All" | CenterExpenseType>("All");
  const [monthFilter, setMonthFilter] = useState("All months");
  const [reviewRequest, setReviewRequest] = useState<CenterExpenseRequest | null>(null);
  const projectOptions = [...new Map(centerApprovalProjects.map((item) => [item.projectId, { projectId: item.projectId, projectName: item.projectName }])).values()];
  const centers = centerApprovalProjects.filter((item) => item.projectId === selectedProjectId);
  const selected = centerApprovalProjects.find((item) => item.centerId === selectedCenterId) ?? null;
  const visibleRequests = selected?.requests.filter((request) => (expenseFilter === "All" || request.type === expenseFilter) && (monthFilter === "All months" || request.period === monthFilter)) ?? [];
  const allRequests = centerApprovalProjects.flatMap((project) => project.requests);
  const totalPending = allRequests.reduce((sum, request) => sum + request.amount, 0);
  const selectedTotal = selected?.requests.reduce((sum, request) => sum + request.amount, 0) ?? 0;
  const months = ["All months", ...new Set(selected?.requests.map((request) => request.period) ?? [])];

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white sm:p-8"><div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><Building2 size={13} />Project-wise center approvals</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Center operating expenses</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Review Rental, Food, Electricity and TA/DA requests for every center under its respective project.</p></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Projects with requests", value: projectOptions.length }, { label: "Operating centers", value: centerApprovalProjects.length }, { label: "Value awaiting review", value: formatCurrency(totalPending, true) }, { label: "Employee TA/DA bills", value: taDaEmployeeBills.length }].map((item) => <article key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{item.label}</p></article>)}</section>
    <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold"><span className="rounded-full bg-emerald-600 px-3 py-1.5 text-white">1 · Project</span><ChevronRight size={13} className="text-[var(--text-ghost)]" /><span className={cn("rounded-full px-3 py-1.5", selectedProjectId ? "bg-emerald-600 text-white" : "bg-[var(--surface-soft)] text-[var(--text-subtle)]")}>2 · Center</span><ChevronRight size={13} className="text-[var(--text-ghost)]" /><span className={cn("rounded-full px-3 py-1.5", selectedCenterId ? "bg-emerald-600 text-white" : "bg-[var(--surface-soft)] text-[var(--text-subtle)]")}>3 · Expense review</span></div><div className="mt-6"><h3 className="text-base font-semibold text-[var(--text)]">First, select a project</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Only centers mapped to the selected project will be shown next.</p></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{projectOptions.map((project) => { const projectCenters = centerApprovalProjects.filter((item) => item.projectId === project.projectId); const projectTotal = projectCenters.flatMap((item) => item.requests).reduce((sum, request) => sum + request.amount, 0); const active = selectedProjectId === project.projectId; return <button key={project.projectId} type="button" onClick={() => { setSelectedProjectId(project.projectId); setSelectedCenterId(""); setExpenseFilter("All"); setMonthFilter("All months"); }} className={cn("focus-ring rounded-2xl border p-4 text-left transition", active ? "border-emerald-500/40 bg-emerald-500/[0.07] shadow-sm" : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-emerald-500/25")}><div className="flex items-start justify-between"><span className={cn("grid size-9 place-items-center rounded-xl", active ? "bg-emerald-600 text-white" : "bg-[var(--module-bg)] text-[var(--text-muted)]")}><FileText size={15} /></span><span className="text-xs font-semibold text-[var(--text)]">{formatCurrency(projectTotal, true)}</span></div><p className="mt-4 text-xs font-semibold text-[var(--text)]">{project.projectName}</p><p className="mt-2 text-[9px] text-[var(--text-subtle)]">{project.projectId} · {projectCenters.length} {projectCenters.length === 1 ? "center" : "centers"}</p></button>; })}</div></section>
    {selectedProjectId && <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><h3 className="text-base font-semibold text-[var(--text)]">Now, choose a center</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Select one operating center to view its monthly expense submissions.</p><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{centers.map((center) => { const active = selectedCenterId === center.centerId; return <button key={center.centerId} type="button" onClick={() => { setSelectedCenterId(center.centerId); setExpenseFilter("All"); setMonthFilter("All months"); }} className={cn("focus-ring flex items-center gap-4 rounded-2xl border p-4 text-left transition", active ? "border-emerald-500/40 bg-emerald-500/[0.07]" : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-emerald-500/25")}><span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", active ? "bg-emerald-600 text-white" : "bg-[var(--module-bg)] text-[var(--text-muted)]")}><Building2 size={17} /></span><span><b className="block text-xs text-[var(--text)]">{center.centerName}</b><small className="mt-1 block text-[9px] text-[var(--text-subtle)]">{center.centerId} · {center.location}</small></span></button>; })}</div></section>}
    {selected && <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]"><div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 lg:flex-row lg:items-end sm:p-6"><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-600">{selected.projectId} · {selected.centerId}</p><h3 className="mt-2 text-base font-semibold text-[var(--text)]">{selected.centerName}</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">{selected.projectName} · {selected.location} · {formatCurrency(selectedTotal, true)} pending</p></div><div className="flex flex-wrap items-center gap-2"><span className="relative"><CalendarDays size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /><select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="focus-ring h-9 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] pl-8 pr-8 text-[9px] font-semibold text-[var(--text-muted)]">{months.map((month) => <option key={month}>{month}</option>)}</select></span>{(["All", "Rental", "Food", "Electricity", "TA/DA"] as const).map((type) => <button key={type} type="button" onClick={() => setExpenseFilter(type)} className={cn("focus-ring h-9 rounded-lg px-3 text-[9px] font-semibold transition", expenseFilter === type ? "bg-emerald-600 text-white" : "border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]")}>{type}</button>)}</div></div><div className="grid gap-px bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">{visibleRequests.map((request) => { const meta = centerExpenseMeta[request.type]; const Icon = meta.icon; const employeeCount = request.type === "TA/DA" ? taDaEmployeeBills.filter((bill) => bill.centerId === selected.centerId && bill.month === request.period).length : 0; return <article key={request.id} className="bg-[var(--module-bg)] p-5"><div className="flex items-start justify-between"><span className={cn("grid size-10 place-items-center rounded-xl", meta.color)}><Icon size={17} /></span><span className={cn("rounded-full px-2 py-1 text-[8px] font-semibold", request.status === "Ready" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>{request.status}</span></div><p className="mt-5 text-sm font-semibold text-[var(--text)]">{request.type}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{request.period} · {request.id}</p><p className="mt-4 text-xl font-semibold text-[var(--text)]">{formatCurrency(request.amount, true)}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{request.type === "TA/DA" ? `${employeeCount} employee claims` : `${request.documents} supporting documents`} · Submitted {request.submitted}</p><button type="button" onClick={() => setReviewRequest(request)} className="focus-ring mt-5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-emerald-700">{request.type === "TA/DA" ? "Review employee bills" : `Review ${request.type}`}</button></article>; })}{visibleRequests.length === 0 && <div className="col-span-full bg-[var(--module-bg)] p-10 text-center"><p className="text-xs font-semibold text-[var(--text)]">No expense requests found</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Change the month or expense filter.</p></div>}</div></section>}
    {reviewRequest && selected && (reviewRequest.type === "TA/DA" ? <TaDaReviewModal center={selected} request={reviewRequest} onClose={() => setReviewRequest(null)} /> : <CenterExpenseReviewOverlay center={selected} request={reviewRequest} onClose={() => setReviewRequest(null)} />)}
  </div>;
}

interface CenterBillDocument {
  name: string;
  kind: string;
  reference: string;
  uploaded: string;
  size: string;
}

function getCenterBillDocuments(type: Exclude<CenterExpenseType, "TA/DA">, request: CenterExpenseRequest): CenterBillDocument[] {
  const documents: Record<Exclude<CenterExpenseType, "TA/DA">, CenterBillDocument[]> = {
    Rental: [
      { name: `rent-invoice-${request.period.toLowerCase().replace(" ", "-")}.pdf`, kind: "Monthly rent invoice", reference: `RNT/${request.id.slice(-4)}`, uploaded: request.submitted, size: "486 KB" },
      { name: "registered-lease-agreement.pdf", kind: "Lease agreement", reference: "LEASE/2026/041", uploaded: "05 Apr 2026", size: "1.8 MB" },
      { name: "landlord-bank-and-pan.pdf", kind: "Vendor KYC and bank proof", reference: "KYC/VND/118", uploaded: "05 Apr 2026", size: "642 KB" },
    ],
    Food: [
      { name: `food-vendor-invoice-${request.period.toLowerCase().replace(" ", "-")}.pdf`, kind: "Food vendor invoice", reference: `FD/${request.id.slice(-4)}`, uploaded: request.submitted, size: "728 KB" },
      { name: "trainee-meal-attendance.xlsx", kind: "Meal attendance register", reference: "ATT/MEAL/0726", uploaded: request.submitted, size: "214 KB" },
      { name: "approved-menu-rate-card.pdf", kind: "Approved menu and rate card", reference: "RATE/FOOD/026", uploaded: "01 Jul 2026", size: "392 KB" },
      { name: "food-delivery-challans.pdf", kind: "Daily delivery challans", reference: "DC/FOOD/0726", uploaded: request.submitted, size: "1.2 MB" },
    ],
    Electricity: [
      { name: `electricity-bill-${request.period.toLowerCase().replace(" ", "-")}.pdf`, kind: "Utility bill", reference: `ELEC/${request.id.slice(-4)}`, uploaded: request.submitted, size: "364 KB" },
      { name: "meter-reading-photograph.jpg", kind: "Meter reading evidence", reference: "MTR/PHOTO/0726", uploaded: request.submitted, size: "1.1 MB" },
      { name: "previous-payment-receipt.pdf", kind: "Previous payment receipt", reference: "ELEC/PAID/0626", uploaded: "08 Jul 2026", size: "284 KB" },
    ],
  };
  return documents[type];
}

function CenterExpenseReviewOverlay({ center, request, onClose }: { center: CenterApprovalProject; request: CenterExpenseRequest; onClose: () => void }) {
  const expenseType = request.type as Exclude<CenterExpenseType, "TA/DA">;
  const documents = getCenterBillDocuments(expenseType, request);
  const [activeDocument, setActiveDocument] = useState(documents[0]);
  const [reviewStatus, setReviewStatus] = useState<"Submitted" | "Verified" | "Approved" | "Query raised">("Submitted");
  const meta = centerExpenseMeta[request.type];
  const ExpenseIcon = meta.icon;
  const vendor = request.type === "Rental" ? "Center Premises Owner" : request.type === "Food" ? "Approved Catering Partner" : "State Electricity Distribution Company";

  return <Overlay
    open
    onClose={onClose}
    variant="panel"
    size="xl"
    zIndex={75}
    label={`${request.type} bill review · ${request.period}`}
    title={`${center.centerName} — ${request.type}`}
    description={`${center.projectName} · ${request.id} · Submitted ${request.submitted}`}
    footer={<><div><p className="text-[9px] text-[var(--text-subtle)]">Review status</p><p className="mt-1 text-xs font-semibold text-[var(--text)]">{reviewStatus}</p></div><div className="flex gap-2"><button type="button" onClick={() => setReviewStatus("Query raised")} className="focus-ring h-10 rounded-md border border-amber-500/30 px-4 text-[10px] font-semibold text-amber-600">Raise query</button>{reviewStatus === "Verified" || reviewStatus === "Approved" ? <button type="button" onClick={() => { setReviewStatus("Approved"); saveCenterApproval(center, request); }} disabled={reviewStatus === "Approved"} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-[10px] font-semibold text-white disabled:opacity-60"><CheckCircle2 size={14} />{reviewStatus === "Approved" ? "Bill approved" : "Approve bill"}</button> : <button type="button" onClick={() => setReviewStatus("Verified")} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-[var(--brand-primary)] px-4 text-[10px] font-semibold text-white"><ShieldCheck size={14} />Verify documents</button>}</div></>}
  >
    <div className="border-b border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-4">{[{ label: "Submitted amount", value: formatCurrency(request.amount, true) }, { label: "Bill period", value: request.period }, { label: "Uploaded files", value: documents.length }, { label: "Current status", value: reviewStatus }].map((item) => <div key={item.label} className="rounded-md border border-[var(--border)] bg-[var(--module-bg)] p-4"><p className="text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">{item.label}</p><p className="mt-2 text-sm font-semibold text-[var(--text)]">{item.value}</p></div>)}</div></div>
    <div className="grid min-h-[calc(100vh-250px)] lg:grid-cols-[310px_1fr]"><aside className="border-b border-[var(--border)] bg-[var(--module-bg)] p-5 lg:border-b-0 lg:border-r"><div className="flex items-center gap-3"><span className={cn("grid size-10 place-items-center rounded-md", meta.color)}><ExpenseIcon size={17} /></span><div><h3 className="text-xs font-semibold text-[var(--text)]">Uploaded bills</h3><p className="mt-1 text-[8px] text-[var(--text-subtle)]">Select a file to inspect it</p></div></div><div className="mt-5 space-y-2">{documents.map((document) => <button key={document.name} type="button" onClick={() => setActiveDocument(document)} className={cn("focus-ring flex w-full items-center gap-3 rounded-md border p-3 text-left transition", activeDocument.name === document.name ? "border-[var(--brand-primary)] bg-blue-500/[0.06]" : "border-[var(--border)] bg-[var(--surface-soft)] hover:border-[var(--border-strong)]")}><span className="grid size-9 shrink-0 place-items-center rounded-md bg-red-500/10 text-red-500"><ReceiptText size={14} /></span><span className="min-w-0 flex-1"><b className="block truncate text-[9px] text-[var(--text)]">{document.kind}</b><small className="mt-1 block truncate text-[8px] text-[var(--text-subtle)]">{document.name}</small></span><Eye size={13} className="shrink-0 text-[var(--text-subtle)]" /></button>)}</div><div className="mt-6 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] p-4"><div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-600" /><p className="text-[10px] font-semibold text-[var(--text)]">Verification checklist</p></div><div className="mt-3 space-y-2 text-[9px] leading-5 text-[var(--text-muted)]"><p>✓ Bill period matches request</p><p>✓ Vendor and project mapping checked</p><p>✓ Amount agrees with supporting record</p><p>✓ Duplicate payment check completed</p></div></div></aside>
      <main className="bg-[#edf1f5] p-4 dark:bg-slate-950 sm:p-7"><div className="mx-auto max-w-2xl"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs font-semibold text-[var(--text)]">{activeDocument.kind}</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{activeDocument.name} · {activeDocument.size}</p></div><button type="button" className="focus-ring inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--module-bg)] px-3 text-[9px] font-semibold text-[var(--text-muted)]"><Download size={13} />Download</button></div><article className="min-h-[620px] border border-slate-300 bg-white p-8 text-slate-900 shadow-sm sm:p-10"><div className="flex items-start justify-between border-b border-slate-200 pb-6"><div className="flex items-center gap-3"><img src="/pantiss-mark.png" alt="" className="size-10 object-contain" /><div><p className="text-xs font-bold uppercase tracking-wide text-red-700">Pantiss Foundation</p><p className="mt-1 text-[9px] text-slate-500">Center expense verification</p></div></div><span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">Uploaded</span></div><div className="mt-8 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{activeDocument.kind}</p><h3 className="mt-3 text-2xl font-semibold">{request.type} Bill</h3><p className="mt-2 text-xs text-slate-500">{request.period}</p></div><div className="mt-9 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-slate-200 py-6 text-xs"><span><b className="block text-[9px] uppercase text-slate-400">Bill reference</b><span className="mt-2 block font-semibold">{activeDocument.reference}</span></span><span><b className="block text-[9px] uppercase text-slate-400">Vendor</b><span className="mt-2 block font-semibold">{vendor}</span></span><span><b className="block text-[9px] uppercase text-slate-400">Project</b><span className="mt-2 block font-semibold">{center.projectName}</span></span><span><b className="block text-[9px] uppercase text-slate-400">Center</b><span className="mt-2 block font-semibold">{center.centerName}</span></span></div><div className="mt-8 flex items-end justify-between rounded-md bg-slate-50 p-5"><span><span className="block text-[9px] uppercase text-slate-400">Submitted amount</span><strong className="mt-2 block text-2xl">{formatCurrency(request.amount, true)}</strong></span><span className="text-right text-[9px] leading-5 text-slate-500">Uploaded {activeDocument.uploaded}<br />{activeDocument.size}</span></div><div className="mt-12 grid grid-cols-2 gap-10 border-t border-dashed border-slate-300 pt-8 text-center text-[9px] text-slate-400"><span>Vendor authorization</span><span>Center manager certification</span></div><div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-5 text-[9px] text-slate-400"><span>{request.id}</span><span>Digitally submitted through Pantiss ERP</span></div></article></div></main></div>
  </Overlay>;
}

function TaDaReviewModal({ center, request, onClose }: { center: CenterApprovalProject; request: CenterExpenseRequest; onClose: () => void }) {
  useOverlayBehavior(onClose);
  const sourceBills = taDaEmployeeBills.filter((bill) => bill.centerId === center.centerId && bill.month === request.period);
  const [bills, setBills] = useState(sourceBills);
  const [selectedBillId, setSelectedBillId] = useState(sourceBills[0]?.id ?? "");
  const selectedBill = bills.find((bill) => bill.id === selectedBillId) ?? bills[0];
  const updateStatus = (id: string, status: TaDaBillStatus) => {
    const bill = bills.find((item) => item.id === id);
    setBills((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    if (status === "Approved" && bill) saveCenterApproval(center, request, bill);
  };
  const claimedTotal = bills.reduce((sum, bill) => sum + bill.claimed, 0);
  const eligibleTotal = bills.reduce((sum, bill) => sum + bill.eligible, 0);

  return <div className="zo-projects-backdrop fixed inset-0 z-[70] overflow-y-auto p-3 sm:p-6"><div className="zo-projects-surface mx-auto my-3 w-full max-w-7xl overflow-hidden"><div className="zo-projects-header flex items-start justify-between border-b border-[var(--border)] p-5 sm:p-6"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600">TA/DA bill verification · {request.period}</p><h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Employee travel claims</h2><p className="mt-1 text-xs text-[var(--text-subtle)]">{center.projectName} · {center.centerName}</p></div><button type="button" onClick={onClose} className="focus-ring grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]" aria-label="Close TA/DA review"><X size={15} /></button></div><div className="grid gap-3 border-b border-[var(--border)] bg-[var(--module-bg)] p-5 sm:grid-cols-4 sm:p-6">{[{ label: "Employee bills", value: bills.length }, { label: "Claimed", value: formatCurrency(claimedTotal, true) }, { label: "Eligible after check", value: formatCurrency(eligibleTotal, true) }, { label: "Approved", value: bills.filter((bill) => bill.status === "Approved").length }].map((item) => <div key={item.label} className="rounded-xl bg-[var(--surface-soft)] p-4"><p className="text-[9px] text-[var(--text-subtle)]">{item.label}</p><p className="mt-2 text-lg font-semibold text-[var(--text)]">{item.value}</p></div>)}</div><div className="grid min-h-[560px] lg:grid-cols-[1.2fr_.8fr]"><div className="overflow-x-auto border-b border-[var(--border)] lg:border-b-0 lg:border-r"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-[var(--surface-soft)] text-[8px] uppercase tracking-wide text-[var(--text-subtle)]"><th className="px-5 py-4">Employee</th><th className="px-4 py-4">Travel</th><th className="px-4 py-4">Claimed</th><th className="px-4 py-4">Status</th><th className="px-5 py-4" /></tr></thead><tbody>{bills.map((bill) => <tr key={bill.id} className={cn("border-t border-[var(--border)]", bill.id === selectedBill?.id && "bg-violet-500/[0.05]")}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-violet-500/10 text-violet-600"><UserRound size={14} /></span><span><b className="block text-xs text-[var(--text)]">{bill.employee}</b><small className="mt-1 block text-[8px] text-[var(--text-subtle)]">{bill.employeeId} · {bill.designation}</small></span></div></td><td className="px-4 py-4"><p className="text-[10px] text-[var(--text)]">{bill.route}</p><p className="mt-1 text-[8px] text-[var(--text-subtle)]">{bill.travelDate}</p></td><td className="px-4 py-4"><p className="text-xs font-semibold text-[var(--text)]">{formatCurrency(bill.claimed, true)}</p><p className="mt-1 text-[8px] text-[var(--text-subtle)]">Eligible {formatCurrency(bill.eligible, true)}</p></td><td className="px-4 py-4"><span className={cn("rounded-full px-2 py-1 text-[8px] font-semibold", bill.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : bill.status === "Verified" ? "bg-blue-500/10 text-blue-600" : bill.status === "Query raised" ? "bg-amber-500/10 text-amber-600" : "bg-slate-500/10 text-[var(--text-muted)]")}>{bill.status}</span></td><td className="px-5 py-4"><button type="button" onClick={() => setSelectedBillId(bill.id)} className="focus-ring rounded-lg border border-[var(--border)] px-3 py-2 text-[9px] font-semibold text-[var(--text-muted)]">Review bills</button></td></tr>)}</tbody></table></div><aside className="bg-[var(--module-bg)] p-5 sm:p-6">{selectedBill ? <><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-wide text-violet-600">{selectedBill.id}</p><h3 className="mt-2 text-base font-semibold text-[var(--text)]">{selectedBill.employee}</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{selectedBill.purpose}</p></div><ReceiptText size={20} className="text-violet-600" /></div><div className="mt-5 grid grid-cols-2 gap-3">{[{ label: "Route", value: selectedBill.route }, { label: "Travel date", value: selectedBill.travelDate }, { label: "Claimed", value: formatCurrency(selectedBill.claimed, true) }, { label: "Eligible", value: formatCurrency(selectedBill.eligible, true) }].map((item) => <div key={item.label} className="rounded-xl bg-[var(--surface-soft)] p-3"><p className="text-[8px] text-[var(--text-subtle)]">{item.label}</p><p className="mt-1 text-[10px] font-semibold text-[var(--text)]">{item.value}</p></div>)}</div><div className="mt-6"><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-[var(--text)]">Uploaded bills</h4><span className="text-[8px] text-[var(--text-subtle)]">{selectedBill.documents.length} files</span></div><div className="mt-3 space-y-2">{selectedBill.documents.map((document) => <button key={document.name} type="button" className="focus-ring flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-left hover:border-violet-500/30"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-500"><Paperclip size={14} /></span><span className="min-w-0 flex-1"><b className="block truncate text-[9px] text-[var(--text)]">{document.name}</b><small className="mt-1 block text-[8px] text-[var(--text-subtle)]">{document.kind} · {document.size}</small></span><Eye size={13} className="text-[var(--text-subtle)]" /></button>)}</div></div><div className="mt-6 rounded-xl border border-[var(--border)] p-4"><div className="flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-600" /><p className="text-[10px] font-semibold text-[var(--text)]">ERP verification checklist</p></div><div className="mt-3 space-y-2 text-[9px] text-[var(--text-muted)]"><p>✓ Tour approval and travel dates matched</p><p>✓ Original bill copies attached</p><p>✓ Eligibility checked against TA/DA policy</p><p>✓ Duplicate claim check completed</p></div></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => updateStatus(selectedBill.id, "Query raised")} className="focus-ring h-10 rounded-xl border border-amber-500/30 text-[9px] font-semibold text-amber-600">Raise query</button>{selectedBill.status === "Verified" || selectedBill.status === "Approved" ? <button type="button" onClick={() => updateStatus(selectedBill.id, "Approved")} disabled={selectedBill.status === "Approved"} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[9px] font-semibold text-white disabled:opacity-60"><CheckCircle2 size={13} />{selectedBill.status === "Approved" ? "Approved" : "Approve bill"}</button> : <button type="button" onClick={() => updateStatus(selectedBill.id, "Verified")} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 text-[9px] font-semibold text-white"><ShieldCheck size={13} />Verify bill</button>}</div></> : <div className="grid h-full place-items-center text-xs text-[var(--text-subtle)]">No employee bills for this month.</div>}</aside></div></div></div>;
}

type ProcurementStatus = "Quotation review" | "Approved" | "PO Created" | "PO Sent" | "Invoice Reminder Sent" | "Payment slip uploaded";

interface ProcurementQuote {
  id: string;
  vendor: string;
  amount: number;
  deliveryDays: number;
  warranty: string;
  technicalScore: number;
  gstIncluded: boolean;
  file: string;
}

interface ProcurementAuditEntry {
  action: string;
  actor: string;
  date: string;
  detail: string;
}

type PaymentStatus = "Approved" | "In progress" | "Payment slip uploaded";

interface CenterPaymentRecord {
  id: string;
  title: string;
  project: string;
  projectId: string;
  center: string;
  centerId: string;
  amount: number;
  status: PaymentStatus;
  paymentSlip?: string;
  paidOn?: string;
  reference?: string;
  audit: ProcurementAuditEntry[];
}

const centerPaymentsStorageKey = "pantiss:finance-center-payments";

function readCenterPayments(): CenterPaymentRecord[] {
  try { return JSON.parse(localStorage.getItem(centerPaymentsStorageKey) ?? "[]") as CenterPaymentRecord[]; }
  catch { return []; }
}

function saveCenterApproval(center: CenterApprovalProject, request: CenterExpenseRequest, employeeBill?: TaDaEmployeeBill) {
  const records = readCenterPayments();
  const id = employeeBill?.id ?? request.id;
  if (records.some((record) => record.id === id)) return;
  const title = employeeBill ? `TA/DA · ${employeeBill.employee}` : `${request.type} · ${request.period}`;
  const amount = employeeBill?.eligible ?? request.amount;
  const record: CenterPaymentRecord = {
    id, title, project: center.projectName, projectId: center.projectId, center: center.centerName, centerId: center.centerId, amount, status: "Approved",
    audit: [
      { action: "Request submitted", actor: "Center Manager", date: `${request.submitted} · 10:00`, detail: `${title} submitted with supporting documents.` },
      { action: "Finance approval completed", actor: "Finance Approver", date: procurementStamp(), detail: `${formatCurrency(amount, true)} approved and released to the payment queue.` },
    ],
  };
  localStorage.setItem(centerPaymentsStorageKey, JSON.stringify([...records, record]));
}

interface ProcurementRequest {
  id: string;
  title: string;
  thematicArea: string;
  project: string;
  requestedBy: string;
  department: string;
  submitted: string;
  priority: "High" | "Normal";
  quantity: string;
  specification: string;
  budgetCeiling: number;
  status: ProcurementStatus;
  selectedQuoteId?: string;
  paymentSlip?: string;
  paidOn?: string;
  reference?: string;
  purchaseOrderNo?: string;
  poCreatedAt?: string;
  poSentAt?: string;
  invoiceReminderSentAt?: string;
  quotes: ProcurementQuote[];
  audit: ProcurementAuditEntry[];
  paymentStatus?: PaymentStatus;
}

const initialProcurementRequests: ProcurementRequest[] = [
  { id: "PR-2026-448", title: "Electrical training equipment", thematicArea: "Skill Development", project: "PMKVY 4.0 Odisha Skills", requestedBy: "Ananya Mishra", department: "Training Operations", submitted: "03 Aug 2026", priority: "High", quantity: "24 equipment units", specification: "Industrial-grade electrical training kits with safety accessories, installation and trainer orientation.", budgetCeiling: 13.2, status: "Quotation review", quotes: [
    { id: "QT-448-A", vendor: "TechSkill Systems Pvt Ltd", amount: 12.6, deliveryDays: 14, warranty: "24 months", technicalScore: 94, gstIncluded: true, file: "techskill-quotation.pdf" },
    { id: "QT-448-B", vendor: "EduLab Equipment India", amount: 12.18, deliveryDays: 21, warranty: "18 months", technicalScore: 88, gstIncluded: true, file: "edulab-quotation.pdf" },
    { id: "QT-448-C", vendor: "Bharat Technical Solutions", amount: 12.92, deliveryDays: 12, warranty: "24 months", technicalScore: 91, gstIncluded: true, file: "bharat-tech-quotation.pdf" },
  ], audit: [{ action: "Request submitted", actor: "Ananya Mishra", date: "03 Aug 2026 · 10:24", detail: "Procurement request and three quotations submitted." }] },
  { id: "PR-2026-441", title: "Mobile clinic diagnostic kits", thematicArea: "Health", project: "Swasthya Mobile Clinics", requestedBy: "Ritika Sharma", department: "Health Programmes", submitted: "01 Aug 2026", priority: "High", quantity: "12 diagnostic kits", specification: "Portable diagnostic kits including BP monitor, glucometer, pulse oximeter and field carrying case.", budgetCeiling: 8.8, status: "Quotation review", quotes: [
    { id: "QT-441-A", vendor: "MediField Technologies", amount: 8.42, deliveryDays: 10, warranty: "24 months", technicalScore: 96, gstIncluded: true, file: "medifield-quotation.pdf" },
    { id: "QT-441-B", vendor: "Care Diagnostics India", amount: 8.06, deliveryDays: 18, warranty: "12 months", technicalScore: 86, gstIncluded: true, file: "care-diagnostics-quotation.pdf" },
    { id: "QT-441-C", vendor: "Aarogya Devices LLP", amount: 8.65, deliveryDays: 12, warranty: "24 months", technicalScore: 92, gstIncluded: true, file: "aarogya-devices-quotation.pdf" },
  ], audit: [{ action: "Request submitted", actor: "Ritika Sharma", date: "01 Aug 2026 · 15:40", detail: "Technical specifications and three sealed quotations uploaded." }] },
  { id: "PR-2026-436", title: "Nutrition screening equipment", thematicArea: "Nutrition", project: "Poshan Community Network", requestedBy: "Meera Nayak", department: "Nutrition", submitted: "31 Jul 2026", priority: "Normal", quantity: "18 screening sets", specification: "Digital weighing scales, stadiometers, MUAC tapes and protective transit cases.", budgetCeiling: 5.5, status: "Approved", selectedQuoteId: "QT-436-B", quotes: [
    { id: "QT-436-A", vendor: "HealthMeasure India", amount: 5.18, deliveryDays: 16, warranty: "18 months", technicalScore: 91, gstIncluded: true, file: "healthmeasure-quotation.pdf" },
    { id: "QT-436-B", vendor: "NutriTech Instruments", amount: 4.96, deliveryDays: 14, warranty: "24 months", technicalScore: 93, gstIncluded: true, file: "nutritech-quotation.pdf" },
    { id: "QT-436-C", vendor: "Community Health Supplies", amount: 5.08, deliveryDays: 20, warranty: "12 months", technicalScore: 87, gstIncluded: true, file: "community-health-quotation.pdf" },
  ], audit: [{ action: "Request submitted", actor: "Meera Nayak", date: "31 Jul 2026 · 11:12", detail: "Request created with three compliant quotations." }, { action: "Quote selected", actor: "Finance Manager", date: "02 Aug 2026 · 14:18", detail: "NutriTech Instruments selected based on price, warranty and technical score." }, { action: "Procurement approved", actor: "Finance Approver", date: "02 Aug 2026 · 14:26", detail: "Approved value ₹4.96 L within sanctioned ceiling." }] },
  { id: "PR-2026-429", title: "Water-quality testing supplies", thematicArea: "Sanitation", project: "Jal Suraksha Mission", requestedBy: "Sanjay Rout", department: "WASH", submitted: "29 Jul 2026", priority: "Normal", quantity: "30 field test packs", specification: "Field water-quality test kits, reagents, sampling bottles and calibration materials.", budgetCeiling: 4.0, status: "Payment slip uploaded", selectedQuoteId: "QT-429-A", paymentSlip: "payment-slip-PR-2026-429.pdf", quotes: [
    { id: "QT-429-A", vendor: "AquaTest Laboratories", amount: 3.72, deliveryDays: 9, warranty: "12 months", technicalScore: 95, gstIncluded: true, file: "aquatest-quotation.pdf" },
    { id: "QT-429-B", vendor: "JalTech Scientific", amount: 3.64, deliveryDays: 15, warranty: "12 months", technicalScore: 89, gstIncluded: true, file: "jaltech-quotation.pdf" },
    { id: "QT-429-C", vendor: "Enviro Field Solutions", amount: 3.88, deliveryDays: 11, warranty: "18 months", technicalScore: 92, gstIncluded: true, file: "enviro-field-quotation.pdf" },
  ], audit: [{ action: "Request submitted", actor: "Sanjay Rout", date: "29 Jul 2026 · 09:36", detail: "Three quotations and specification sheet submitted." }, { action: "Quote selected", actor: "Finance Manager", date: "30 Jul 2026 · 12:10", detail: "AquaTest Laboratories selected for technical compliance and delivery time." }, { action: "Procurement approved", actor: "Finance Approver", date: "30 Jul 2026 · 12:22", detail: "Approved for ₹3.72 L." }, { action: "Payment slip uploaded", actor: "Accounts Executive", date: "04 Aug 2026 · 16:05", detail: "payment-slip-PR-2026-429.pdf attached to request." }] },
];

const procurementStorageKey = "pantiss:finance-procurement-requests";

const VALID_PROCUREMENT_STATUSES = new Set(["Quotation review", "Approved", "PO Created", "PO Sent", "Invoice Reminder Sent", "Payment slip uploaded"]);

function migrateProcurementStatus(status: string): ProcurementStatus {
  if (VALID_PROCUREMENT_STATUSES.has(status)) return status as ProcurementStatus;
  // Legacy statuses written by buggy PaymentsView updateStatus — map back to nearest valid stage
  if (status === "In progress" || status === "Payment initiated") return "Invoice Reminder Sent";
  return "Quotation review";
}

function readProcurementRequests(): ProcurementRequest[] {
  try {
    const saved = JSON.parse(localStorage.getItem(procurementStorageKey) ?? "null") as ProcurementRequest[] | null;
    if (!saved?.length) return initialProcurementRequests;
    return saved.map((request) => ({
      ...request,
      status: migrateProcurementStatus(request.status as string),
      thematicArea: request.thematicArea ?? initialProcurementRequests.find((item) => item.id === request.id)?.thematicArea ?? "Other",
    }));
  } catch { return initialProcurementRequests; }
}

function procurementStamp() {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date()).replace(",", " ·");
}

interface UnifiedPaymentRecord {
  id: string;
  source: "Procurement" | "Center" | "Salary";
  title: string;
  project: string;
  thematicArea?: string;
  center: string;
  amount: number;
  status: PaymentStatus;
  paymentSlip?: string;
  paidOn?: string;
  reference?: string;
  payee: string;
  audit: ProcurementAuditEntry[];
  salaryKey?: string;
}

export function PaymentsView() {
  const [procurement, setProcurement] = useState(readProcurementRequests);
  const [centerPayments, setCenterPayments] = useState(readCenterPayments);
  const { records: salaryRecords, error: salaryError, savePayment } = useSalaryRecords();
  const [auditKey, setAuditKey] = useState<string | null>(null);
  const [paymentKey, setPaymentKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => { setProcurement(readProcurementRequests()); setCenterPayments(readCenterPayments()); };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const procurementPayments: UnifiedPaymentRecord[] = procurement.filter(request => request.status !== "Quotation review").map(request => {
    const quote = request.quotes.find(item => item.id === request.selectedQuoteId);
    return {
      id: request.id, source: "Procurement", title: request.title, project: request.project, thematicArea: request.thematicArea,
      center: "Central Procurement", amount: quote?.amount ?? request.budgetCeiling,
      status: request.status === "Payment slip uploaded" ? "Payment slip uploaded" : request.paymentStatus ?? (request.audit.some(event => ["Payment initiated", "Payment recorded"].includes(event.action)) ? "In progress" : "Approved"),
      paymentSlip: request.paymentSlip, paidOn: request.paidOn, reference: request.reference, payee: quote?.vendor ?? "Approved vendor", audit: request.audit,
    };
  });
  const centerRecords: UnifiedPaymentRecord[] = centerPayments.map(record => ({ ...record, source: "Center", payee: record.center }));
  const salaryPayments: UnifiedPaymentRecord[] = salaryRecords.filter(record => record.approvalStatus === "Approved" && record.forwardedAt && record.status !== "Hold").map(record => {
    const area = financeAreas.find(area => area.projects.some(project => project.id === record.projectId));
    const project = area?.projects.find(project => project.id === record.projectId);
    return {
      id: salaryKey(record), salaryKey: salaryKey(record), source: "Salary", title: `Salary · ${salaryMonthLabel(record.month)}`,
      project: project?.name ?? record.projectId, thematicArea: area?.name, center: record.location,
      amount: record.netPay / 100000, status: record.status === "Disbursed" ? "Payment slip uploaded" : "Approved",
      paymentSlip: undefined, paidOn: record.paidOn, reference: record.reference,
      payee: `${record.name} · ${record.bankName} (account ending ${record.bankAccount.slice(-4)})`,
      audit: [
        ...(record.approvedBy && record.approvedOn ? [{ action: "Salary approved", actor: record.approvedBy, date: salaryDateLabel(record.approvedOn), detail: `${salaryMoney(record.netPay)} approved for ${salaryMonthLabel(record.month)}.` }] : []),
        { action: "Forwarded for payment", actor: record.forwardedBy ?? "Not recorded", date: new Date(record.forwardedAt!).toLocaleString("en-IN"), detail: "Approved salary sent to the payment desk." },
        ...(record.status === "Disbursed" && record.paidOn ? [{ action: "Salary payment recorded", actor: "Payment desk", date: salaryDateLabel(record.paidOn), detail: `Bank reference: ${record.reference ?? "Not recorded"}.` }] : []),
      ],
    };
  });
  const records = [...procurementPayments, ...centerRecords, ...salaryPayments];
  const auditRecord = records.find(record => paymentRecordKey(record) === auditKey);
  const paymentRecord = records.find(record => paymentRecordKey(record) === paymentKey);

  const updateStatus = (record: UnifiedPaymentRecord, status: PaymentStatus, detail: string, file?: File, payment?: { paidOn: string; reference: string }) => {
    const entry = { action: status === "In progress" ? "Payment recorded" : "Payment slip uploaded", actor: "Accounts Executive", date: procurementStamp(), detail };
    if (record.source === "Procurement") {
      const updated = readProcurementRequests().map(request => request.id === record.id ? { ...request, ...payment, paymentStatus: status, status: status === "Payment slip uploaded" ? "Payment slip uploaded" as const : request.status, paymentSlip: file?.name ?? request.paymentSlip, audit: [...request.audit, entry] } : request);
      localStorage.setItem(procurementStorageKey, JSON.stringify(updated));
      setProcurement(updated);
    } else if (record.source === "Center") {
      const updated = readCenterPayments().map(item => item.id === record.id ? { ...item, ...payment, status, paymentSlip: file?.name ?? item.paymentSlip, audit: [...item.audit, entry] } : item);
      localStorage.setItem(centerPaymentsStorageKey, JSON.stringify(updated));
      setCenterPayments(updated);
    }
  };
  const upload = (key: string, file?: File) => {
    const record = records.find(record => paymentRecordKey(record) === key);
    if (!record || !file || record.source === "Salary") return;
    setError("");
    if (file.size > 10 * 1024 * 1024 || !/\.(pdf|jpe?g|png)$/i.test(file.name)) { setError("Choose a PDF, JPG or PNG payment slip smaller than 10 MB."); return; }
    try { updateStatus(record, "Payment slip uploaded", `${file.name} attached as payment evidence.`, file); }
    catch { setError("Payment slip could not be saved. Please try again."); }
  };

  return <>
    <PaymentsBrowser records={records} error={error || salaryError} onPay={setPaymentKey} onDetails={setAuditKey} onUpload={upload} />
    {auditRecord && <PaymentAuditOverlay record={auditRecord} onClose={() => setAuditKey(null)} />}
    {paymentRecord && <PaymentProcessOverlay record={paymentRecord} onClose={() => setPaymentKey(null)} onConfirm={({ detail, date, reference }) => {
      if (paymentRecord.source === "Salary" && paymentRecord.salaryKey) savePayment(paymentRecord.salaryKey, { status: "Disbursed", paidOn: date, reference });
      else updateStatus(paymentRecord, "In progress", detail, undefined, { paidOn: date, reference });
      setPaymentKey(null);
    }} />}
  </>;
}

function PaymentProcessOverlay({ record, onClose, onConfirm }: { record: UnifiedPaymentRecord; onClose: () => void; onConfirm: (payment: { detail: string; date: string; reference: string }) => void }) {
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault(); setError("");
    const parsed = new Date(`${date}T00:00:00Z`);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (!reference.trim() || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date > todayKey) { setError("Enter a valid payment date and bank reference. Future payment dates are not allowed."); return; }
    try { onConfirm({ detail: `Payment recorded on ${date}; bank reference ${reference.trim()}.`, date, reference: reference.trim() }); }
    catch (error) { setError(error instanceof Error ? error.message : "Payment could not be saved."); }
  };
  const field = "focus-ring mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--module-bg)] px-3 py-3 text-sm text-[var(--text)]";
  return <Overlay open onClose={onClose} variant="panel" size="lg" label="Payment desk" title="Record payment" description={`${record.title} · ${record.project}`} footer={<button type="submit" form="payment-process-form" className="focus-ring rounded-xl border border-[var(--salary-accent)] bg-[var(--salary-accent-soft)] px-4 py-3 text-xs font-semibold text-[var(--salary-accent)]">Save payment record</button>}>
    <form id="payment-process-form" onSubmit={submit} className="space-y-5 p-6">
      <div className="rounded-2xl bg-[var(--surface-soft)] p-5"><p className="text-sm text-[var(--text)]">{record.payee}</p><p className="mt-3 text-2xl font-semibold text-[var(--text)]">{paymentAmount(record.amount)}</p></div>
      <p className="text-xs leading-5 text-[var(--text-muted)]">Record an existing bank payment. This form does not transfer money.{record.source !== "Salary" && " Attach the payment slip after saving."}</p>
      <label className="block text-xs font-medium text-[var(--text-muted)]">Payment date<input required type="date" value={date} onChange={event => setDate(event.target.value)} className={field} /></label>
      <label className="block text-xs font-medium text-[var(--text-muted)]">Bank reference / UTR<input required maxLength={100} value={reference} onChange={event => setReference(event.target.value)} className={field} /></label>
      {error && <p role="alert" className="text-sm text-[var(--salary-warning)]">{error}</p>}
    </form>
  </Overlay>;
}

function PaymentAuditOverlay({ record, onClose }: { record: UnifiedPaymentRecord; onClose: () => void }) {
  return <Overlay open onClose={onClose} variant="panel" size="lg" label="Payment history" title={record.title} description={record.project}>
    <div className="space-y-6 p-6">
      <div><p className="text-xs text-[var(--text-muted)]">{record.payee}</p><p className="mt-2 text-2xl font-semibold text-[var(--text)]">{paymentAmount(record.amount)}</p></div>
      <dl className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--surface-soft)] p-4 text-xs">
        <div><dt className="text-[var(--text-muted)]">Payment date</dt><dd className="mt-1 text-[var(--text)]">{record.paidOn ? salaryDateLabel(record.paidOn) : "Not recorded"}</dd></div>
        <div><dt className="text-[var(--text-muted)]">Bank reference</dt><dd className="mt-1 break-all text-[var(--text)]">{record.reference ?? "Not recorded"}</dd></div>
        <div className="col-span-2"><dt className="text-[var(--text-muted)]">Payment slip</dt><dd className="mt-1 break-all text-[var(--text)]">{record.paymentSlip ?? (record.source === "Salary" ? "Bank reference recorded above" : "Not attached")}</dd></div>
      </dl>
      <section><h3 className="text-sm font-semibold text-[var(--text)]">Activity</h3><ol className="mt-4 space-y-5 border-l border-[var(--border)] pl-4">{record.audit.map((entry, index) => <li key={`${entry.action}-${index}`}><p className="text-sm font-medium text-[var(--text)]">{entry.action}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{entry.actor} · {entry.date}</p><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{entry.detail}</p></li>)}</ol></section>
    </div>
  </Overlay>;
}

export function ProcurementApprovalsView() {
  const [requests, setRequests] = useState(readProcurementRequests);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paymentWorkspace, setPaymentWorkspace] = useState(false);
  const [view, setView] = useState<"requests" | "history">("requests");
  // Drill-down state
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const selected = requests.find((r) => r.id === selectedId) ?? null;

  const updateRequest = (updated: ProcurementRequest) =>
    setRequests((curr) => curr.map((r) => (r.id === updated.id ? updated : r)));

  useEffect(() => { localStorage.setItem(procurementStorageKey, JSON.stringify(requests)); }, [requests]);

  const createPO = (req: ProcurementRequest) => {
    const poNo = `PO-${req.id.replace("PR-", "")}-${Math.floor(Math.random() * 900 + 100)}`;
    updateRequest({ ...req, status: "PO Created", purchaseOrderNo: poNo, poCreatedAt: procurementStamp(),
      audit: [...req.audit, { action: "Purchase order created", actor: "Finance Manager", date: procurementStamp(), detail: `PO ${poNo} generated for ${req.quotes.find(q => q.id === req.selectedQuoteId)?.vendor ?? "selected vendor"}.` }] });
  };

  const sendPO = (req: ProcurementRequest) => {
    updateRequest({ ...req, status: "PO Sent", poSentAt: procurementStamp(),
      audit: [...req.audit, { action: "Purchase order sent", actor: "Finance Manager", date: procurementStamp(), detail: `${req.purchaseOrderNo} dispatched to vendor via email.` }] });
  };

  const sendInvoiceReminder = (req: ProcurementRequest) => {
    updateRequest({ ...req, status: "Invoice Reminder Sent", invoiceReminderSentAt: procurementStamp(),
      audit: [...req.audit, { action: "Invoice reminder sent", actor: "Accounts Executive", date: procurementStamp(), detail: `Payment reminder sent to ${req.quotes.find(q => q.id === req.selectedQuoteId)?.vendor ?? "vendor"}.` }] });
  };

  if (paymentWorkspace) return <ProcurementPaymentWorkspace requests={requests} areaFilter="All thematic areas" projectFilter="All projects" onAreaFilter={() => {}} onProjectFilter={() => {}} onUpdate={updateRequest} onBack={() => setPaymentWorkspace(false)} />;

  const statusConfig: Record<ProcurementStatus, { label: string; pill: string; icon: string }> = {
    "Quotation review":       { label: "Quotation Review",      pill: "bg-blue-500/10 text-blue-600 dark:text-blue-400",       icon: "🔍" },
    "Approved":               { label: "Approved",              pill: "bg-amber-500/10 text-amber-600 dark:text-amber-400",     icon: "✅" },
    "PO Created":             { label: "PO Created",            pill: "bg-violet-500/10 text-violet-600 dark:text-violet-400",  icon: "📄" },
    "PO Sent":                { label: "PO Sent",               pill: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",        icon: "📨" },
    "Invoice Reminder Sent":  { label: "Invoice Reminder Sent", pill: "bg-orange-500/10 text-orange-600 dark:text-orange-400",  icon: "🔔" },
    "Payment slip uploaded":  { label: "Complete",              pill: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: "🎉" },
  };

  const summaryStats = [
    { label: "Total",   value: requests.length },
    { label: "Pending", value: requests.filter(r => r.status === "Quotation review").length },
    { label: "Active",  value: requests.filter(r => !["Quotation review", "Payment slip uploaded"].includes(r.status)).length },
    { label: "Done",    value: requests.filter(r => r.status === "Payment slip uploaded").length },
  ];

  // Build 2-level hierarchy: thematic area → project → requests
  const hierarchy = Array.from(
    requests.reduce<Map<string, Map<string, ProcurementRequest[]>>>((areaMap, req) => {
      if (!areaMap.has(req.thematicArea)) areaMap.set(req.thematicArea, new Map());
      const projMap = areaMap.get(req.thematicArea)!;
      projMap.set(req.project, [...(projMap.get(req.project) ?? []), req]);
      return areaMap;
    }, new Map()),
  );

  // Resolve current step data
  const areaProjectMap = activeArea ? (hierarchy.find(([a]) => a === activeArea)?.[1] ?? new Map<string, ProcurementRequest[]>()) : new Map<string, ProcurementRequest[]>();
  const projectItems  = activeProject ? (areaProjectMap.get(activeProject) ?? []) : [];
  const areaCol       = AREA_COLOURS[activeArea ?? ""] ?? DEFAULT_COLOUR;

  // Step indicator: 0 = areas, 1 = projects, 2 = detail
  const step = activeProject ? 2 : activeArea ? 1 : 0;

  const goToAreas    = () => { setActiveArea(null); setActiveProject(null); };
  const goToProjects = () => { setActiveProject(null); };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <ShoppingCart size={13} /> Procurement
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Procurement tracker</h2>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/70">
              Manage requests by project or review the history of all procurement requests.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {summaryStats.map(s => (
              <div key={s.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur">
                <span className="block text-xl font-bold">{s.value}</span>
                <span className="mt-0.5 block text-[9px] text-white/65">{s.label}</span>
              </div>
            ))}
            <button type="button" onClick={() => setPaymentWorkspace(true)}
              className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center backdrop-blur transition hover:bg-white/20">
              <span className="block text-xl font-bold">{requests.filter(r => r.status !== "Quotation review").length}</span>
              <span className="mt-0.5 block text-[9px] text-white/65">💳 Payments</span>
            </button>
          </div>
        </div>
      </section>

      <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-1" aria-label="Procurement views">
        {(["requests", "history"] as const).map(value => (
          <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}
            className={cn("focus-ring flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-semibold transition-colors", view === value ? "bg-[var(--surface-soft)] text-[var(--text)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]")}>
            {value === "requests" ? <ShoppingCart size={15} /> : <History size={15} />}
            {value === "requests" ? "Requests" : `History (${requests.length})`}
          </button>
        ))}
      </div>

      {view === "history" ? <ProcurementHistory requests={requests} statusConfig={statusConfig} /> : <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[10px] font-medium">
        <button type="button" onClick={goToAreas}
          className={cn("rounded-lg px-2.5 py-1.5 transition",
            step === 0 ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]")}>
          Thematic Areas
        </button>
        {step >= 1 && (
          <>
            <ChevronRight size={12} className="text-[var(--text-subtle)]" />
            <button type="button" onClick={goToProjects}
              className={cn("rounded-lg px-2.5 py-1.5 transition",
                step === 1 ? "bg-[var(--brand-primary)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]")}>
              {activeArea}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <ChevronRight size={12} className="text-[var(--text-subtle)]" />
            <span className="rounded-lg bg-[var(--brand-primary)] px-2.5 py-1.5 text-white">
              {activeProject}
            </span>
          </>
        )}
      </nav>

      {/* Step 0 — Thematic area cards */}
      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hierarchy.map(([area, projectMap]) => {
            const col = AREA_COLOURS[area] ?? DEFAULT_COLOUR;
            const allReqs = Array.from(projectMap.values()).flat();
            const done = allReqs.filter(r => r.status === "Payment slip uploaded").length;
            const totalValue = allReqs.reduce((s, r) => s + (r.quotes.find(q => q.id === r.selectedQuoteId)?.amount ?? r.budgetCeiling), 0);
            return (
              <button key={area} type="button" onClick={() => setActiveArea(area)}
                className={cn(
                  "group flex flex-col rounded-[22px] border bg-[var(--module-bg)] p-5 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-lg focus-ring",
                  col.border,
                )}>
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl text-xl font-bold", col.bg, col.text)}>
                    {area.charAt(0)}
                  </span>
                  <ChevronRight size={16} className="text-[var(--text-subtle)] transition group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[var(--text)]">{area}</h3>
                <p className="mt-1 text-[9px] text-[var(--text-subtle)]">
                  {projectMap.size} project{projectMap.size !== 1 ? "s" : ""} · {allReqs.length} requests
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1.5 flex justify-between text-[8px] text-[var(--text-subtle)]">
                      <span>{done}/{allReqs.length} complete</span>
                      <span>{allReqs.length ? Math.round((done / allReqs.length) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div className={cn("h-full rounded-full transition-all", col.dot)}
                        style={{ width: `${allReqs.length ? (done / allReqs.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  <b className={cn("block text-sm font-semibold", col.text)}>{formatCurrency(totalValue, true)}</b>
                  <small className="text-[8px] text-[var(--text-subtle)]">total procurement value</small>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1 — Project cards for selected area */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl text-lg font-bold", areaCol.bg, areaCol.text)}>
              {activeArea!.charAt(0)}
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">{activeArea}</h3>
              <p className="text-[9px] text-[var(--text-subtle)]">{areaProjectMap.size} project{areaProjectMap.size !== 1 ? "s" : ""} — select one to view requests</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from(areaProjectMap).map(([project, items]) => {
              const done = items.filter(r => r.status === "Payment slip uploaded").length;
              const totalValue = items.reduce((s, r) => s + (r.quotes.find(q => q.id === r.selectedQuoteId)?.amount ?? r.budgetCeiling), 0);
              const pending = items.filter(r => r.status === "Quotation review").length;
              return (
                <button key={project} type="button" onClick={() => setActiveProject(project)}
                  className={cn(
                    "group flex flex-col rounded-[22px] border bg-[var(--module-bg)] p-5 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-lg focus-ring",
                    areaCol.border,
                  )}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", areaCol.bg, areaCol.text)}>
                      <Landmark size={16} />
                    </span>
                    <ChevronRight size={14} className="mt-1 text-[var(--text-subtle)] transition group-hover:translate-x-0.5" />
                  </div>
                  <h4 className="mt-3 text-[11px] font-semibold text-[var(--text)]">{project}</h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[8px] text-[var(--text-subtle)]">{items.length} requests</span>
                    {pending > 0 && <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-semibold text-blue-600">{pending} pending</span>}
                    {done > 0 && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-600">{done} done</span>}
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-[8px] text-[var(--text-subtle)]">
                      <span>Progress</span>
                      <span>{items.length ? Math.round((done / items.length) * 100) : 0}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div className={cn("h-full rounded-full transition-all", areaCol.dot)}
                        style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <b className={cn("block text-sm font-semibold", areaCol.text)}>{formatCurrency(totalValue, true)}</b>
                    <small className="text-[8px] text-[var(--text-subtle)]">total value</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2 — Requests for selected project */}
      {step === 2 && (
        <ProcurementProjectDetail
          area={activeArea!}
          project={activeProject!}
          items={projectItems}
          col={areaCol}
          statusConfig={statusConfig}
          onSelect={setSelectedId}
          onCreatePO={createPO}
          onSendPO={sendPO}
          onInvoiceReminder={sendInvoiceReminder}
          onPaymentWorkspace={() => setPaymentWorkspace(true)}
        />
      )}

      </>}

      {selected && <ProcurementReviewOverlay request={selected} onUpdate={updateRequest} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

// ─── Shared colour type ───────────────────────────────────────────────────────
type AreaColour = { bg: string; text: string; border: string; dot: string };
type StatusCfg  = { label: string; pill: string; icon: string };

const AREA_COLOURS: Record<string, AreaColour> = {
  "Education":            { bg: "bg-sky-500/10",    text: "text-sky-600 dark:text-sky-400",    border: "border-sky-500/20",    dot: "bg-sky-500" },
  "Health":               { bg: "bg-rose-500/10",   text: "text-rose-600 dark:text-rose-400",   border: "border-rose-500/20",   dot: "bg-rose-500" },
  "Livelihood":           { bg: "bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20",  dot: "bg-amber-500" },
  "Research & Analytics": { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400",border: "border-violet-500/20",dot: "bg-violet-500" },
  "Governance":           { bg: "bg-teal-500/10",   text: "text-teal-600 dark:text-teal-400",   border: "border-teal-500/20",   dot: "bg-teal-500" },
};
const DEFAULT_COLOUR: AreaColour = { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" };

// ─── Step 2: Project requests ─────────────────
function ProcurementProjectDetail({
  area, project, items, col, statusConfig, onSelect, onCreatePO, onSendPO, onInvoiceReminder, onPaymentWorkspace,
}: {
  area: string;
  project: string;
  items: ProcurementRequest[];
  col: AreaColour;
  statusConfig: Record<ProcurementStatus, StatusCfg>;
  onSelect: (id: string) => void;
  onCreatePO: (req: ProcurementRequest) => void;
  onSendPO: (req: ProcurementRequest) => void;
  onInvoiceReminder: (req: ProcurementRequest) => void;
  onPaymentWorkspace: () => void;
}) {
  const totalValue = items.reduce((s, r) => s + (r.quotes.find(q => q.id === r.selectedQuoteId)?.amount ?? r.budgetCeiling), 0);
  const done = items.filter(r => r.status === "Payment slip uploaded").length;

  return (
    <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
      {/* Project header */}
      <div className={cn("border-b px-5 py-5 sm:px-6", `border-[var(--border)] bg-[var(--surface-soft)]`)}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", col.bg, col.text)}>
              <Landmark size={18} />
            </span>
            <div>
              <p className={cn("text-[9px] font-semibold uppercase tracking-wide", col.text)}>{area}</p>
              <h3 className="mt-0.5 text-base font-semibold text-[var(--text)]">{project}</h3>
              <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">
                {items.length} request{items.length !== 1 ? "s" : ""} · {done}/{items.length} complete
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="mb-1.5 flex justify-between text-[8px] text-[var(--text-subtle)]">
                <span>Progress</span>
                <span>{items.length ? Math.round((done / items.length) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--border)]">
                <div className={cn("h-full rounded-full transition-all", col.dot)}
                  style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="text-right">
              <b className="block text-lg font-semibold text-[var(--text)]">{formatCurrency(totalValue, true)}</b>
              <small className="text-[8px] text-[var(--text-subtle)]">total value</small>
            </div>
          </div>
        </div>

      </div>

        <div className="divide-y divide-[var(--border)]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <ShoppingCart size={22} className="text-[var(--text-subtle)]" />
              <p className="text-xs font-semibold text-[var(--text)]">No requests yet</p>
            </div>
          ) : items.map(req => (
            <ProcurementRequestRow
              key={req.id}
              req={req}
              statusConfig={statusConfig}
              onSelect={onSelect}
              onCreatePO={onCreatePO}
              onSendPO={onSendPO}
              onInvoiceReminder={onInvoiceReminder}
              onPaymentWorkspace={onPaymentWorkspace}
            />
          ))}
        </div>

    </div>
  );
}

// ─── Expandable request row (Requests tab) ─────────────────────────────────────
function ProcurementRequestRow({
  req, statusConfig, onSelect, onCreatePO, onSendPO, onInvoiceReminder, onPaymentWorkspace,
}: {
  req: ProcurementRequest;
  statusConfig: Record<ProcurementStatus, StatusCfg>;
  onSelect: (id: string) => void;
  onCreatePO: (req: ProcurementRequest) => void;
  onSendPO: (req: ProcurementRequest) => void;
  onInvoiceReminder: (req: ProcurementRequest) => void;
  onPaymentWorkspace: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const quote = req.quotes.find(q => q.id === req.selectedQuoteId);
  const cfg = statusConfig[req.status] ?? { label: req.status, pill: "bg-gray-500/10 text-gray-500", icon: "•" };
  const lowest = Math.min(...req.quotes.map(q => q.amount));

  return (
    <div className="transition hover:bg-[var(--surface-soft)]">
      {/* Main row */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-base">{cfg.icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-xs font-semibold text-[var(--text)]">{req.title}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-[8px] font-semibold", cfg.pill)}>{cfg.label}</span>
              {req.priority === "High" && <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[8px] font-semibold text-red-500">High</span>}
            </div>
            <p className="mt-0.5 text-[9px] text-[var(--text-subtle)]">{req.id} · {req.requestedBy} · {req.submitted}</p>
            {req.purchaseOrderNo && <p className="mt-1 text-[9px] font-semibold text-violet-600 dark:text-violet-400">PO: {req.purchaseOrderNo}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-right">
            <b className="block text-sm text-[var(--text)]">{formatCurrency(quote?.amount ?? req.budgetCeiling, true)}</b>
            <small className="text-[8px] text-[var(--text-subtle)]">{quote ? "selected" : "ceiling"}</small>
          </span>
          {req.status === "Quotation review" && (
            <button type="button" onClick={() => onSelect(req.id)}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-[10px] font-semibold text-white hover:bg-emerald-700">
              <Scale size={11} /> Review
            </button>
          )}
          {req.status === "Approved" && (
            <button type="button" onClick={() => onCreatePO(req)}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-[10px] font-semibold text-white hover:bg-violet-700">
              <FileText size={11} /> Create PO
            </button>
          )}
          {req.status === "PO Created" && (
            <button type="button" onClick={() => onSendPO(req)}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-cyan-600 px-3 text-[10px] font-semibold text-white hover:bg-cyan-700">
              <Send size={11} /> Send PO
            </button>
          )}
          {req.status === "PO Sent" && (
            <button type="button" onClick={() => onInvoiceReminder(req)}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-[10px] font-semibold text-white hover:bg-orange-600">
              <Send size={11} /> Invoice Reminder
            </button>
          )}
          {req.status === "Invoice Reminder Sent" && (
            <button type="button" onClick={onPaymentWorkspace}
              className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-[10px] font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
              <Upload size={11} /> Upload Payment
            </button>
          )}
          {req.status === "Payment slip uploaded" && (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={11} /> Complete
            </span>
          )}
          <button type="button" onClick={() => onSelect(req.id)}
            className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-subtle)] hover:text-[var(--text)]">
            <Eye size={14} />
          </button>
          {/* Expand/collapse bill + audit */}
          <button type="button" onClick={() => setExpanded(e => !e)}
            className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-subtle)] hover:text-[var(--text)]"
            aria-expanded={expanded} title={expanded ? "Hide details" : "Show bill & audit trail"}>
            <ChevronDown size={14} className={cn("transition-transform duration-200", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {/* Expandable: Bill + Audit trail */}
      {expanded && (
        <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 pb-5 pt-4 sm:px-6">
          {/* Bill / Quotation comparison */}
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600"><FileText size={13} /></span>
              <p className="text-[10px] font-semibold text-[var(--text)]">Quotations &amp; Bill</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {req.quotes.map(q => {
                const isSelected = q.id === req.selectedQuoteId;
                const isLowest = q.amount === lowest;
                return (
                  <div key={q.id} className={cn(
                    "rounded-xl border p-4 transition",
                    isSelected ? "border-emerald-500 bg-emerald-500/[0.06]" : "border-[var(--border)] bg-[var(--module-bg)]"
                  )}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-[10px] font-semibold text-[var(--text)] leading-tight">{q.vendor}</p>
                      <div className="flex flex-col gap-1 items-end shrink-0">
                        {isLowest && <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[7px] font-semibold text-blue-600">Lowest</span>}
                        {isSelected && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[7px] font-semibold text-white">Selected</span>}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[var(--text)]">{formatCurrency(q.amount, true)}</p>
                    <p className={cn("mt-0.5 text-[8px]", q.amount <= req.budgetCeiling ? "text-emerald-600" : "text-red-500")}>
                      {q.amount <= req.budgetCeiling
                        ? `${formatCurrency(req.budgetCeiling - q.amount, true)} below ceiling`
                        : `${formatCurrency(q.amount - req.budgetCeiling, true)} above ceiling`}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[8px]">
                      <div><dt className="text-[var(--text-subtle)]">Delivery</dt><dd className="font-semibold text-[var(--text)]">{q.deliveryDays}d</dd></div>
                      <div><dt className="text-[var(--text-subtle)]">Warranty</dt><dd className="font-semibold text-[var(--text)]">{q.warranty}</dd></div>
                      <div><dt className="text-[var(--text-subtle)]">Tech score</dt><dd className="font-semibold text-[var(--text)]">{q.technicalScore}/100</dd></div>
                      <div><dt className="text-[var(--text-subtle)]">GST</dt><dd className="font-semibold text-[var(--text)]">{q.gstIncluded ? "Incl." : "Extra"}</dd></div>
                    </dl>
                    <p className="mt-3 truncate text-[7px] text-[var(--text-muted)] opacity-70">{q.file}</p>
                  </div>
                );
              })}
            </div>
            {req.paymentSlip && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2.5">
                <ReceiptText size={13} className="shrink-0 text-emerald-600" />
                <p className="min-w-0 flex-1 truncate text-[9px] font-semibold text-[var(--text)]">{req.paymentSlip}</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[7px] font-semibold text-emerald-600">Payment slip</span>
              </div>
            )}
            {req.purchaseOrderNo && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/[0.05] px-3 py-2.5">
                <FileText size={13} className="shrink-0 text-violet-600" />
                <p className="text-[9px] font-semibold text-violet-600 dark:text-violet-400">Purchase Order: {req.purchaseOrderNo}</p>
              </div>
            )}
          </div>

          {/* Audit trail */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-violet-500/10 text-violet-600"><History size={13} /></span>
              <p className="text-[10px] font-semibold text-[var(--text)]">Audit Trail</p>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[7px] font-semibold text-violet-600">{req.audit.length} events</span>
            </div>
            {req.audit.length === 0 ? (
              <p className="text-[9px] text-[var(--text-subtle)]">No audit events yet.</p>
            ) : (
              <div className="relative space-y-2 pl-6 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-[var(--border)]">
                {[...req.audit].reverse().map((entry, i) => (
                  <div key={i} className="relative rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-3 before:absolute before:-left-[17px] before:top-4 before:size-2.5 before:rounded-full before:border-2 before:border-[var(--surface-soft)] before:bg-emerald-500">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-semibold text-[var(--text)]">{entry.action}</p>
                      <time className="shrink-0 rounded bg-[var(--surface-soft)] px-2 py-0.5 text-[7px] text-[var(--text-subtle)]">{entry.date}</time>
                    </div>
                    <p className="mt-1 text-[9px] text-[var(--text-muted)]">{entry.actor} · {entry.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProcurementHistory({ requests, statusConfig }: {
  requests: ProcurementRequest[];
  statusConfig: Record<ProcurementStatus, StatusCfg>;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const query = search.trim().toLowerCase();
  const visible = requests.filter(request =>
    (status === "all" || request.status === status) &&
    [request.id, request.title, request.project, request.thematicArea, request.requestedBy].some(value => value.toLowerCase().includes(query)),
  );

  return <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
    <div className="space-y-5 border-b border-[var(--border)] p-5 sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text)]">Procurement request history</h3>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">All requests across every thematic area and project, from submission through payment. Expand a request to review its quotations and recorded events.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-[var(--text-muted)]">
          <Search size={16} aria-hidden="true" />
          <input aria-label="Search procurement history" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search requests, projects or requesters" className="focus-ring min-w-0 flex-1 bg-transparent py-3 text-xs text-[var(--text)]" />
        </label>
        <select aria-label="Filter procurement history by status" value={status} onChange={event => setStatus(event.target.value)} className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--module-bg)] px-3 py-3 text-xs text-[var(--text)]">
          <option value="all">All statuses</option>
          {Object.entries(statusConfig).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
        </select>
      </div>
      <p role="status" className="text-xs text-[var(--text-subtle)]">{visible.length} of {requests.length} requests</p>
    </div>
    {visible.length ? visible.map(request => <ProcurementHistoryCard key={request.id} req={request} statusConfig={statusConfig} />) : <div className="p-12 text-center">
      <History size={24} className="mx-auto text-[var(--text-subtle)]" />
      <p className="mt-3 text-sm font-medium text-[var(--text)]">{requests.length ? "No matching requests" : "No procurement requests yet"}</p>
      <p className="mt-2 text-xs text-[var(--text-muted)]">{requests.length ? "Try another search or status filter." : "Requests will appear here when they are submitted."}</p>
      {(query || status !== "all") && <button type="button" onClick={() => { setSearch(""); setStatus("all"); }} className="focus-ring mt-4 rounded-lg border border-[var(--border)] px-4 py-2 text-xs text-[var(--text)]">Clear filters</button>}
    </div>}
  </section>;
}

// ─── Per-request history card (History tab) ────────────────────────────────────
function ProcurementHistoryCard({ req, statusConfig }: {
  req: ProcurementRequest;
  statusConfig: Record<ProcurementStatus, StatusCfg>;
}) {
  const [expanded, setExpanded] = useState(false);
  const quote = req.quotes.find(q => q.id === req.selectedQuoteId);
  const cfg = statusConfig[req.status] ?? { label: req.status, pill: "bg-gray-500/10 text-gray-500", icon: "•" };
  const lowest = Math.min(...req.quotes.map(q => q.amount));

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      {/* Request header row */}
      <button type="button" aria-expanded={expanded} aria-controls={`history-${req.id}`} onClick={() => setExpanded(e => !e)}
        className="focus-ring flex w-full items-center gap-3 p-5 text-left transition hover:bg-[var(--surface-soft)] sm:px-6">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-base">{cfg.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[11px] font-semibold text-[var(--text)]">{req.title}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[7px] font-semibold", cfg.pill)}>{cfg.label}</span>
          </div>
          <p className="mt-0.5 text-[8px] text-[var(--text-subtle)]">{req.id} · {req.requestedBy} · {req.submitted} · {req.audit.length} audit events</p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">{req.thematicArea} · {req.project}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-right">
            <b className="block text-sm text-[var(--text)]">{formatCurrency(quote?.amount ?? req.budgetCeiling, true)}</b>
            <small className="text-[8px] text-[var(--text-subtle)]">{quote ? "selected" : "ceiling"}</small>
          </span>
          <ChevronDown size={14} className={cn("text-[var(--text-subtle)] transition-transform duration-200", expanded && "rotate-180")} />
        </div>
      </button>

      {/* Expanded: bill + audit */}
      {expanded && (
        <div id={`history-${req.id}`} className="bg-[var(--surface-soft)] px-5 pb-5 pt-1 sm:px-6">
          {/* Bill: selected quote summary + all quotes */}
          <div className="mb-5 rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={13} className="text-blue-600" />
              <p className="text-[10px] font-semibold text-[var(--text)]">Bill / Quotations</p>
            </div>
            {quote ? (
              <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-2.5">
                <div>
                  <p className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">Selected vendor: {quote.vendor}</p>
                  <p className="text-[8px] text-[var(--text-subtle)] mt-0.5">{quote.id} · {quote.file}</p>
                </div>
                <p className="text-sm font-bold text-[var(--text)]">{formatCurrency(quote.amount, true)}</p>
              </div>
            ) : (
              <p className="mb-3 text-[9px] text-[var(--text-subtle)]">No quote selected yet. Budget ceiling: {formatCurrency(req.budgetCeiling, true)}</p>
            )}
            <div className="grid gap-2 sm:grid-cols-3">
              {req.quotes.map(q => {
                const isSel = q.id === req.selectedQuoteId;
                return (
                  <div key={q.id} className={cn(
                    "rounded-lg border p-3",
                    isSel ? "border-emerald-500 bg-emerald-500/[0.04]" : "border-[var(--border)]"
                  )}>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="text-[9px] font-semibold text-[var(--text)] leading-tight">{q.vendor}</p>
                      <div className="flex gap-1 shrink-0">
                        {q.amount === lowest && <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[6px] font-semibold text-blue-600">Low</span>}
                        {isSel && <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[6px] font-semibold text-white">✓</span>}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-[var(--text)]">{formatCurrency(q.amount, true)}</p>
                    <dl className="mt-1.5 grid grid-cols-2 gap-1 text-[7px]">
                      <div><dt className="text-[var(--text-subtle)]">Delivery</dt><dd className="font-medium text-[var(--text)]">{q.deliveryDays}d</dd></div>
                      <div><dt className="text-[var(--text-subtle)]">Score</dt><dd className="font-medium text-[var(--text)]">{q.technicalScore}/100</dd></div>
                    </dl>
                  </div>
                );
              })}
            </div>
            {req.purchaseOrderNo && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/[0.05] px-3 py-2">
                <FileText size={11} className="shrink-0 text-violet-600" />
                <p className="text-[8px] font-semibold text-violet-600">PO: {req.purchaseOrderNo}</p>
              </div>
            )}
            {req.paymentSlip && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.05] px-3 py-2">
                <ReceiptText size={11} className="shrink-0 text-emerald-600" />
                <p className="min-w-0 flex-1 truncate text-[8px] font-semibold text-[var(--text)]">{req.paymentSlip}</p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[7px] font-semibold text-emerald-600">Payment slip</span>
              </div>
            )}
          </div>

          {/* Full audit trail */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <History size={13} className="text-violet-600" />
              <p className="text-[10px] font-semibold text-[var(--text)]">Audit Trail</p>
              <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[7px] font-semibold text-violet-600">{req.audit.length} events</span>
            </div>
            {req.audit.length === 0 ? (
              <p className="text-[9px] text-[var(--text-subtle)]">No audit events yet.</p>
            ) : (
              <div className="relative space-y-2 pl-6 before:absolute before:bottom-2 before:left-[9px] before:top-2 before:w-px before:bg-[var(--border)]">
                {[...req.audit].reverse().map((entry, i) => (
                  <div key={i} className="relative rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-3 before:absolute before:-left-[17px] before:top-4 before:size-2.5 before:rounded-full before:border-2 before:border-[var(--surface-soft)] before:bg-violet-500">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-semibold text-[var(--text)]">{entry.action}</p>
                      <time className="shrink-0 rounded bg-[var(--surface-soft)] px-2 py-0.5 text-[7px] text-[var(--text-subtle)]">{entry.date}</time>
                    </div>
                    <p className="mt-1 text-[9px] text-[var(--text-muted)]">{entry.actor} · {entry.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



function ProcurementPaymentWorkspace({ requests, areaFilter, projectFilter, onAreaFilter, onProjectFilter, onUpdate, onBack }: { requests: ProcurementRequest[]; areaFilter: string; projectFilter: string; onAreaFilter: (value: string) => void; onProjectFilter: (value: string) => void; onUpdate: (request: ProcurementRequest) => void; onBack: () => void }) {
  const eligible = requests.filter((request) => request.status !== "Quotation review");
  const thematicAreas = ["All thematic areas", ...new Set(eligible.map((request) => request.thematicArea))];
  const projects = ["All projects", ...new Set(eligible.filter((request) => areaFilter === "All thematic areas" || request.thematicArea === areaFilter).map((request) => request.project))];
  const visible = eligible.filter((request) => (areaFilter === "All thematic areas" || request.thematicArea === areaFilter) && (projectFilter === "All projects" || request.project === projectFilter));
  const awaiting = eligible.filter((request) => request.status === "Approved");
  const uploadSlip = (request: ProcurementRequest, file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { window.alert("Payment slip must be smaller than 10 MB."); return; }
    const action = request.paymentSlip ? "Payment slip replaced" : "Payment slip uploaded";
    onUpdate({ ...request, status: "Payment slip uploaded", paymentSlip: file.name, audit: [...request.audit, { action, actor: "Accounts Executive", date: procurementStamp(), detail: `${file.name} attached after payment processing.` }] });
  };

  return <div className="space-y-6"><button type="button" onClick={onBack} className="focus-ring inline-flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"><ArrowLeft size={16} />Procurement approvals</button><section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-6 text-white sm:p-8"><div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" /><div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><Upload size={13} />Post-approval payment evidence</span><h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em]">Procurement payment slips</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Approved requests remain here until payment is processed. Accounts can return later and attach the payment proof without reopening procurement approval.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-md border border-white/15 bg-white/10 p-4"><p className="text-2xl font-semibold">{awaiting.length}</p><p className="mt-1 text-[9px] text-white/60">Awaiting payment slip</p></div><div className="rounded-md border border-white/15 bg-white/10 p-4"><p className="text-2xl font-semibold">{eligible.filter((request) => request.paymentSlip).length}</p><p className="mt-1 text-[9px] text-white/60">Evidence uploaded</p></div></div></div></section><section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Filter approved procurements</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Track payment evidence thematic-area and project wise.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><select value={areaFilter} onChange={(event) => onAreaFilter(event.target.value)} className="focus-ring h-11 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)]">{thematicAreas.map((area) => <option key={area}>{area}</option>)}</select><select value={projectFilter} onChange={(event) => onProjectFilter(event.target.value)} className="focus-ring h-11 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)]">{projects.map((project) => <option key={project}>{project}</option>)}</select></div></section><section className="grid gap-4 xl:grid-cols-2">{visible.map((request) => { const quote = request.quotes.find((item) => item.id === request.selectedQuoteId); const approval = [...request.audit].reverse().find((entry) => entry.action === "Procurement approved"); return <article key={request.id} className="rounded-[20px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className={cn("rounded-full px-2 py-1 text-[8px] font-semibold", request.paymentSlip ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>{request.paymentSlip ? "Payment evidence attached" : "Awaiting payment"}</span><span className="rounded-full bg-blue-500/10 px-2 py-1 text-[8px] font-semibold text-blue-600">{request.thematicArea}</span></div><h3 className="mt-4 text-sm font-semibold text-[var(--text)]">{request.title}</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">{request.id} · {request.project}</p></div><span className="text-right"><b className="block text-lg text-[var(--text)]">{formatCurrency(quote?.amount ?? request.budgetCeiling, true)}</b><small className="text-[8px] text-[var(--text-subtle)]">Approved amount</small></span></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-md bg-[var(--surface-soft)] p-4 text-[9px]"><span><span className="block text-[var(--text-subtle)]">Approved vendor</span><b className="mt-1 block text-[var(--text)]">{quote?.vendor ?? "—"}</b></span><span><span className="block text-[var(--text-subtle)]">Approval recorded</span><b className="mt-1 block text-[var(--text)]">{approval?.date ?? "—"}</b></span></div><label className="focus-ring mt-5 flex cursor-pointer items-center gap-4 rounded-md border border-dashed border-blue-500/35 bg-blue-500/[0.04] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-md bg-blue-500/10 text-blue-600"><Upload size={16} /></span><span className="min-w-0 flex-1"><b className="block truncate text-[10px] text-[var(--text)]">{request.paymentSlip ?? "Upload payment slip"}</b><small className="mt-1 block text-[8px] text-[var(--text-subtle)]">PDF, JPG or PNG · Maximum 10 MB</small></span><input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(event) => uploadSlip(request, event.target.files?.[0])} /></label><div className="mt-5 border-t border-[var(--border)] pt-4"><div className="flex items-center gap-2"><History size={13} className="text-violet-600" /><p className="text-[9px] font-semibold text-[var(--text)]">Latest audit activity</p></div><p className="mt-2 text-[9px] text-[var(--text-muted)]">{request.audit.at(-1)?.action} · {request.audit.at(-1)?.actor} · {request.audit.at(-1)?.date}</p></div></article>; })}{visible.length === 0 && <div className="col-span-full rounded-[20px] border border-dashed border-[var(--border)] bg-[var(--module-bg)] p-10 text-center"><p className="text-xs font-semibold text-[var(--text)]">No approved procurements found</p><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Change the thematic-area or project filter.</p></div>}</section></div>;
}

function ProcurementReviewOverlay({ request, onUpdate, onClose }: { request: ProcurementRequest; onUpdate: (request: ProcurementRequest) => void; onClose: () => void }) {
  const [previewQuote, setPreviewQuote] = useState<ProcurementQuote | null>(null);
  const selectedQuote = request.quotes.find((quote) => quote.id === request.selectedQuoteId);
  const lowestAmount = Math.min(...request.quotes.map((quote) => quote.amount));
  const selectQuote = (quote: ProcurementQuote) => { if (request.selectedQuoteId !== quote.id) onUpdate({ ...request, selectedQuoteId: quote.id, audit: [...request.audit, { action: "Quote selected", actor: "Finance Manager", date: procurementStamp(), detail: `${quote.vendor} selected at ${formatCurrency(quote.amount, true)} after comparison.` }] }); };
  const approve = () => {
    if (!selectedQuote) return;
    onUpdate({ ...request, status: "Approved", audit: [...request.audit, { action: "Procurement approved", actor: "Finance Approver", date: procurementStamp(), detail: `${selectedQuote.vendor} approved for ${formatCurrency(selectedQuote.amount, true)}.` }] });
  };
  const uploadPaymentSlip = (file: File | undefined) => {
    if (!file) return;
    onUpdate({ ...request, status: "Payment slip uploaded", paymentSlip: file.name, audit: [...request.audit, { action: "Payment slip uploaded", actor: "Accounts Executive", date: procurementStamp(), detail: `${file.name} attached after payment processing.` }] });
  };

  return <Overlay open onClose={onClose} variant="panel" size="2xl" zIndex={75} label="Procurement approval" title={request.title} description={`${request.id} · ${request.project} · Requested by ${request.requestedBy}`} footer={<><div><p className="text-[9px] text-[var(--text-subtle)]">Selected quotation</p><p className="mt-1 text-xs font-semibold text-[var(--text)]">{selectedQuote ? `${selectedQuote.vendor} · ${formatCurrency(selectedQuote.amount, true)}` : "Select one of the three quotations"}</p></div><div className="flex gap-2"><button type="button" onClick={onClose} className="focus-ring h-10 rounded-md border border-[var(--border)] px-4 text-[10px] font-semibold text-[var(--text-muted)]">Close</button><button type="button" onClick={approve} disabled={!selectedQuote || request.status !== "Quotation review"} className="focus-ring inline-flex h-10 items-center gap-2 rounded-md bg-emerald-600 px-4 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 size={14} />{request.status === "Quotation review" ? "Approve selected quotation" : "Request approved"}</button></div></>}><div className="border-b border-[var(--border)] bg-[var(--surface-soft)] p-5 sm:p-6"><div className="grid gap-3 sm:grid-cols-4">{[{ label: "Budget ceiling", value: formatCurrency(request.budgetCeiling, true) }, { label: "Quantity", value: request.quantity }, { label: "Department", value: request.department }, { label: "Status", value: request.status }].map((item) => <div key={item.label} className="rounded-md border border-[var(--border)] bg-[var(--module-bg)] p-4"><p className="text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">{item.label}</p><p className="mt-2 text-sm font-semibold text-[var(--text)]">{item.value}</p></div>)}</div><div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--module-bg)] p-4"><p className="text-[8px] uppercase tracking-wide text-[var(--text-subtle)]">Procurement specification</p><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{request.specification}</p></div></div><div className="p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-md bg-blue-500/10 text-blue-600"><Scale size={17} /></span><div><h3 className="text-sm font-semibold text-[var(--text)]">Compare three quotations</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Select the best-value compliant quotation before approval.</p></div></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{request.quotes.map((quote) => { const active = request.selectedQuoteId === quote.id; const bestPrice = quote.amount === lowestAmount; return <article key={quote.id} className={cn("relative rounded-md border p-5 transition", active ? "border-emerald-500 bg-emerald-500/[0.05] shadow-sm" : "border-[var(--border)] bg-[var(--surface-soft)]")}><div className="flex items-start justify-between gap-3"><span className="grid size-10 place-items-center rounded-md bg-[var(--module-bg)] text-[var(--text-muted)]"><FileText size={16} /></span><div className="flex gap-1">{bestPrice && <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[8px] font-semibold text-blue-600">Lowest price</span>}{active && <span className="rounded-full bg-emerald-600 px-2 py-1 text-[8px] font-semibold text-white">Selected</span>}</div></div><h4 className="mt-4 text-xs font-semibold text-[var(--text)]">{quote.vendor}</h4><p className="mt-1 text-[8px] text-[var(--text-subtle)]">{quote.id} · {quote.file}</p><p className="mt-5 text-2xl font-semibold text-[var(--text)]">{formatCurrency(quote.amount, true)}</p><p className={cn("mt-1 text-[9px]", quote.amount <= request.budgetCeiling ? "text-emerald-600" : "text-red-500")}>{quote.amount <= request.budgetCeiling ? `${formatCurrency(request.budgetCeiling - quote.amount, true)} below ceiling` : `${formatCurrency(quote.amount - request.budgetCeiling, true)} above ceiling`}</p><dl className="mt-5 grid grid-cols-2 gap-3 text-[9px]"><div><dt className="text-[var(--text-subtle)]">Delivery</dt><dd className="mt-1 font-semibold text-[var(--text)]">{quote.deliveryDays} days</dd></div><div><dt className="text-[var(--text-subtle)]">Warranty</dt><dd className="mt-1 font-semibold text-[var(--text)]">{quote.warranty}</dd></div><div><dt className="text-[var(--text-subtle)]">Technical score</dt><dd className="mt-1 font-semibold text-[var(--text)]">{quote.technicalScore}/100</dd></div><div><dt className="text-[var(--text-subtle)]">Tax</dt><dd className="mt-1 font-semibold text-[var(--text)]">{quote.gstIncluded ? "GST included" : "GST extra"}</dd></div></dl><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setPreviewQuote(quote)} className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--module-bg)] text-[9px] font-semibold text-[var(--text-muted)]"><Eye size={12} />View quote</button><button type="button" onClick={() => selectQuote(quote)} disabled={request.status !== "Quotation review"} className={cn("focus-ring h-9 rounded-md text-[9px] font-semibold disabled:opacity-40", active ? "bg-emerald-600 text-white" : "bg-[var(--brand-primary)] text-white")}>{active ? "Selected" : "Select quote"}</button></div></article>; })}</div>{request.status !== "Quotation review" && <section className="hidden"><div className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-0.5 text-emerald-600" /><div><h3 className="text-xs font-semibold text-[var(--text)]">Procurement approved</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Upload the payment slip after the approved vendor payment is processed.</p></div></div><label className="focus-ring mt-4 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-emerald-500/35 bg-[var(--module-bg)] p-6 text-center"><Upload size={20} className="text-emerald-600" /><span className="mt-3 text-[10px] font-semibold text-[var(--text)]">{request.paymentSlip ?? "Upload payment slip"}</span><span className="mt-1 text-[8px] text-[var(--text-subtle)]">PDF, JPG or PNG · Maximum 10 MB</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(event) => uploadPaymentSlip(event.target.files?.[0])} /></label>{request.paymentSlip && <div className="mt-3 flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--module-bg)] p-3"><span className="flex items-center gap-2 text-[9px] font-semibold text-[var(--text)]"><ReceiptText size={13} className="text-emerald-600" />{request.paymentSlip}</span><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-semibold text-emerald-600">Uploaded</span></div>}</section>}<section className="mt-7 border-t border-[var(--border)] pt-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-md bg-violet-500/10 text-violet-600"><History size={17} /></span><div><h3 className="text-sm font-semibold text-[var(--text)]">Audit trail</h3><p className="mt-1 text-[9px] text-[var(--text-subtle)]">Immutable record of submission, selection, approval and payment evidence.</p></div></div><div className="relative mt-5 space-y-4 pl-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-[var(--border)]">{request.audit.map((entry, index) => <article key={`${entry.action}-${index}`} className="relative rounded-md border border-[var(--border)] bg-[var(--surface-soft)] p-4 before:absolute before:-left-[20px] before:top-5 before:size-2.5 before:rounded-full before:border-2 before:border-[var(--module-bg)] before:bg-emerald-500"><div className="flex flex-col justify-between gap-1 sm:flex-row"><p className="text-[10px] font-semibold text-[var(--text)]">{entry.action}</p><p className="text-[8px] text-[var(--text-subtle)]">{entry.date}</p></div><p className="mt-1 text-[9px] text-[var(--text-muted)]">{entry.actor} · {entry.detail}</p></article>)}</div></section></div>{previewQuote && <ProcurementQuotePreview request={request} quote={previewQuote} onClose={() => setPreviewQuote(null)} />}</Overlay>;
}

function ProcurementQuotePreview({ request, quote, onClose }: { request: ProcurementRequest; quote: ProcurementQuote; onClose: () => void }) {
  return <Overlay open onClose={onClose} variant="panel" size="xl" zIndex={85} label="Uploaded vendor quotation" title={quote.vendor} description={`${quote.id} · ${quote.file}`} footer={<><p className="text-[9px] text-[var(--text-subtle)]">Submitted with {request.id}</p><button type="button" onClick={onClose} className="focus-ring h-10 rounded-md bg-[var(--brand-primary)] px-4 text-[10px] font-semibold text-white">Close quotation</button></>}><div className="min-h-full bg-[#edf1f5] p-4 dark:bg-slate-950 sm:p-7"><article className="mx-auto min-h-[760px] max-w-2xl border border-slate-300 bg-white p-8 text-slate-900 shadow-sm sm:p-10"><div className="flex items-start justify-between border-b border-slate-200 pb-6"><div><p className="text-lg font-bold">{quote.vendor}</p><p className="mt-1 text-[10px] text-slate-500">GST-registered procurement vendor</p></div><span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-700">QUOTATION</span></div><div className="mt-8 grid grid-cols-2 gap-5 text-xs"><span><b className="block text-[9px] uppercase text-slate-400">Quotation number</b><span className="mt-2 block font-semibold">{quote.id}</span></span><span><b className="block text-[9px] uppercase text-slate-400">Quotation date</b><span className="mt-2 block font-semibold">{request.submitted}</span></span><span><b className="block text-[9px] uppercase text-slate-400">Issued to</b><span className="mt-2 block font-semibold">Pantiss Foundation</span></span><span><b className="block text-[9px] uppercase text-slate-400">Project</b><span className="mt-2 block font-semibold">{request.project}</span></span></div><div className="mt-9 border border-slate-200"><div className="grid grid-cols-[1fr_110px] bg-slate-50 px-4 py-3 text-[9px] font-semibold uppercase text-slate-500"><span>Description</span><span className="text-right">Amount</span></div><div className="grid grid-cols-[1fr_110px] border-t border-slate-200 px-4 py-5 text-xs"><span><b className="block">{request.title}</b><small className="mt-2 block leading-5 text-slate-500">{request.specification}</small><small className="mt-2 block text-slate-500">Quantity: {request.quantity}</small></span><strong className="text-right">{formatCurrency(quote.amount, true)}</strong></div></div><div className="mt-6 ml-auto max-w-xs space-y-3 text-xs"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatCurrency(quote.amount / 1.18, true)}</span></div><div className="flex justify-between text-slate-500"><span>GST {quote.gstIncluded ? "(included)" : "(extra)"}</span><span>{quote.gstIncluded ? formatCurrency(quote.amount - quote.amount / 1.18, true) : "As applicable"}</span></div><div className="flex justify-between border-t border-slate-300 pt-3 text-base font-bold"><span>Total</span><span>{formatCurrency(quote.amount, true)}</span></div></div><div className="mt-10 grid grid-cols-3 gap-3">{[{ label: "Delivery", value: `${quote.deliveryDays} days` }, { label: "Warranty", value: quote.warranty }, { label: "Technical score", value: `${quote.technicalScore}/100` }].map((item) => <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 p-3"><p className="text-[8px] uppercase text-slate-400">{item.label}</p><p className="mt-2 text-xs font-semibold">{item.value}</p></div>)}</div><div className="mt-16 flex justify-between border-t border-dashed border-slate-300 pt-8 text-[9px] text-slate-400"><span>Authorized vendor signature</span><span>Valid for 30 days</span></div><div className="mt-16 flex items-center justify-between border-t border-slate-200 pt-5 text-[9px] text-slate-400"><span>{quote.file}</span><span>Uploaded through Pantiss ERP</span></div></article></div></Overlay>;
}

function SalaryApprovalDetailModal({
  record,
  onClose,
  onApprove,
  onReject,
  onForward
}: {
  record: SalaryRecord;
  onClose: () => void;
  onApprove: (record: SalaryRecord) => void;
  onReject: (record: SalaryRecord) => void;
  onForward: (record: SalaryRecord) => void;
}) {
  const isApproved = record.approvalStatus === "Approved";
  const isPendingApproval = record.approvalStatus === "Pending approval";
  const canForward = canForwardSalary(record);
  const gross = record.basicHra + record.allowance;
  const totalDeductions = record.pfDeduction + record.esiDeduction + record.tdsDeduction;

  return (
    <Overlay
      open
      onClose={onClose}
      variant="panel"
      size="xl"
      zIndex={85}
      label="Salary approval verification"
      title={`${record.name} · ${record.id}`}
      description={`${record.designation} · ${record.department} · ${salaryMonthLabel(record.month)}`}
      footer={
        <>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[var(--text-subtle)]">Workflow status:</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                record.status === "Disbursed"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : record.forwardedAt
                  ? "bg-blue-500/10 text-blue-600"
                  : isApproved
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              )}
            >
              {salaryWorkflowLabel(record)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            >
              Close
            </button>
            {isPendingApproval && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onReject(record);
                    onClose();
                  }}
                  className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-xs font-semibold text-red-600 hover:bg-red-500/20"
                >
                  <X size={14} />
                  Reject / Hold
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onApprove(record);
                    onClose();
                  }}
                  className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                >
                  <CheckCircle2 size={14} />
                  Approve salary
                </button>
              </>
            )}
            {canForward && (
              <button
                type="button"
                onClick={() => {
                  onForward(record);
                  onClose();
                }}
                className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                <Send size={14} />
                Forward for payment
              </button>
            )}
            {record.forwardedAt && record.status !== "Disbursed" && (
              <Link
                to="/finance/payments?source=Salary"
                className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl bg-[var(--surface-soft)] px-4 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]/80"
              >
                <ArrowUpRight size={14} />
                View in Payment Desk
              </Link>
            )}
          </div>
        </>
      }
    >
      <div className="space-y-6 p-5 sm:p-6">
        {/* Verification banner */}
        <div
          className={cn(
            "flex items-start gap-4 rounded-2xl border p-4 sm:p-5",
            isApproved
              ? "border-emerald-500/30 bg-emerald-500/[0.04]"
              : "border-amber-500/30 bg-amber-500/[0.04]"
          )}
        >
          <div
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              isApproved
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-amber-500/10 text-amber-600"
            )}
          >
            {isApproved ? <CheckCircle2 size={20} /> : <Clock3 size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-[var(--text)]">
              {isApproved ? "Salary Approved by Finance Department" : "Awaiting Finance Approval"}
            </h4>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {isApproved
                ? `Approved by ${record.approvedBy || "Finance Approver"} on ${record.approvedOn || "recorded date"}. ${
                    record.forwardedAt
                      ? `Forwarded to Payment Desk on ${new Date(record.forwardedAt).toLocaleDateString()}.`
                      : "Ready to be forwarded to the Payment Desk."
                  }`
                : "This monthly salary record requires authorization before it can be forwarded for disbursement."}
            </p>
          </div>
        </div>

        {/* Salary amounts overview */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Gross earnings</p>
            <p className="mt-2 text-lg font-bold text-[var(--text)]">{salaryMoney(gross)}</p>
            <p className="mt-1 text-[9px] text-[var(--text-muted)]">Basic + Special Allowance</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Total deductions</p>
            <p className="mt-2 text-lg font-bold text-red-500">-{salaryMoney(totalDeductions)}</p>
            <p className="mt-1 text-[9px] text-[var(--text-muted)]">PF + ESI + TDS</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4">
            <p className="text-[9px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Net Payable</p>
            <p className="mt-2 text-xl font-bold text-[var(--text)]">{salaryMoney(record.netPay)}</p>
            <p className="mt-1 text-[9px] text-emerald-700/80 dark:text-emerald-400/80">Authorized bank transfer amount</p>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Earnings */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-4">
            <h5 className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
              <Coins size={14} className="text-emerald-600" />
              Earnings breakdown
            </h5>
            <dl className="mt-3 divide-y divide-[var(--border)] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Basic & HRA</span>
                <span className="font-medium text-[var(--text)]">{salaryMoney(record.basicHra)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Special Allowance</span>
                <span className="font-medium text-[var(--text)]">{salaryMoney(record.allowance)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Working Days</span>
                <span className="font-medium text-[var(--text)]">{record.workingDays} days</span>
              </div>
            </dl>
          </div>

          {/* Deductions */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-4">
            <h5 className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
              <ShieldCheck size={14} className="text-amber-600" />
              Statutory deductions
            </h5>
            <dl className="mt-3 divide-y divide-[var(--border)] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Provident Fund (PF)</span>
                <span className="font-medium text-red-500">-{salaryMoney(record.pfDeduction)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">ESI</span>
                <span className="font-medium text-red-500">-{salaryMoney(record.esiDeduction)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-muted)]">Tax Deducted at Source (TDS)</span>
                <span className="font-medium text-red-500">-{salaryMoney(record.tdsDeduction)}</span>
              </div>
            </dl>
          </div>
        </div>

        {/* Banking credentials */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-4">
          <h5 className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
            <Landmark size={14} className="text-blue-600" />
            Direct deposit bank credentials
          </h5>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <span className="block text-[9px] text-[var(--text-subtle)]">Bank Name</span>
              <span className="mt-1 block font-semibold text-[var(--text)]">{record.bankName}</span>
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <span className="block text-[9px] text-[var(--text-subtle)]">Account Number</span>
              <span className="mt-1 block font-mono font-semibold text-[var(--text)]">{record.bankAccount}</span>
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <span className="block text-[9px] text-[var(--text-subtle)]">IFSC Code</span>
              <span className="mt-1 block font-mono font-semibold text-[var(--text)]">{record.ifsc}</span>
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] p-3">
              <span className="block text-[9px] text-[var(--text-subtle)]">UAN Number</span>
              <span className="mt-1 block font-mono font-semibold text-[var(--text)]">{record.uan}</span>
            </div>
          </div>
        </div>

        {/* Audit & Forwarding history */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <h5 className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
            <History size={14} className="text-violet-600" />
            Audit trail & forwarding status
          </h5>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-start justify-between rounded-xl bg-[var(--module-bg)] p-3">
              <div>
                <span className="font-semibold text-[var(--text)]">Approval Status: {record.approvalStatus}</span>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {record.approvalStatus === "Approved"
                    ? `Authorized by ${record.approvedBy || "Finance Approver"} on ${record.approvedOn || "recorded date"}`
                    : "Pending review by Finance department"}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-semibold",
                  record.approvalStatus === "Approved"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                )}
              >
                {record.approvalStatus}
              </span>
            </div>

            <div className="flex items-start justify-between rounded-xl bg-[var(--module-bg)] p-3">
              <div>
                <span className="font-semibold text-[var(--text)]">Payment Forwarding Status</span>
                <p className="text-[10px] text-[var(--text-muted)]">
                  {record.forwardedAt
                    ? `Forwarded to Payment Desk by ${record.forwardedBy || "Finance Manager"} on ${new Date(record.forwardedAt).toLocaleString()}`
                    : isApproved
                    ? "Approved and ready to be forwarded for payment"
                    : "Awaiting approval before forwarding"}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-semibold",
                  record.forwardedAt ? "bg-blue-500/10 text-blue-600" : "bg-slate-500/10 text-slate-600"
                )}
              >
                {record.forwardedAt ? "In Payment Desk" : "Not Forwarded"}
              </span>
            </div>

            {record.status === "Disbursed" && (
              <div className="flex items-start justify-between rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-3">
                <div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Payment Disbursed</span>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Paid on {record.paidOn || "recorded date"} · UTR / Bank Ref #{record.reference || "N/A"}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[8px] font-semibold text-white">
                  Paid
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function SalaryApprovalsQueueView() {
  const { records, approveSalary, rejectSalary, forwardForPayment, forwardMultiple } = useSalaryRecords();
  const { user } = useAuth();
  const [month, setMonth] = useState(payrollMonths[0]);
  const [filter, setFilter] = useState<"all" | "pending" | "ready" | "forwarded" | "disbursed">("all");
  const [deptFilter, setDeptFilter] = useState("All departments");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Month-scoped records
  const monthlyRecords = records.filter(r => r.month === month);
  const departments = ["All departments", ...new Set(monthlyRecords.map(r => r.department))];

  // Key metrics
  const totalPayroll = monthlyRecords.reduce((sum, r) => sum + r.netPay, 0);
  const pendingApproval = monthlyRecords.filter(r => r.approvalStatus === "Pending approval");
  const pendingAmount = pendingApproval.reduce((sum, r) => sum + r.netPay, 0);
  const readyToForward = monthlyRecords.filter(r => canForwardSalary(r));
  const readyAmount = readyToForward.reduce((sum, r) => sum + r.netPay, 0);
  const forwarded = monthlyRecords.filter(r => r.forwardedAt && r.status !== "Disbursed");
  const forwardedAmount = forwarded.reduce((sum, r) => sum + r.netPay, 0);
  const disbursed = monthlyRecords.filter(r => r.status === "Disbursed");
  const disbursedAmount = disbursed.reduce((sum, r) => sum + r.netPay, 0);

  // Filtered records
  const visible = monthlyRecords.filter(record => {
    if (filter === "pending" && record.approvalStatus !== "Pending approval") return false;
    if (filter === "ready" && !canForwardSalary(record)) return false;
    if (filter === "forwarded" && (!record.forwardedAt || record.status === "Disbursed")) return false;
    if (filter === "disbursed" && record.status !== "Disbursed") return false;
    if (deptFilter !== "All departments" && record.department !== deptFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return `${record.name} ${record.id} ${record.designation} ${record.department}`.toLowerCase().includes(q);
    }
    return true;
  });

  const handleApprove = (record: SalaryRecord) => {
    try {
      const approverName = user ? `${user.name} (${user.id})` : "Finance Approver";
      approveSalary(salaryKey(record), approverName);
      setNotice({
        message: `Salary for ${record.name} approved. It is now ready to forward for payment.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to approve salary.",
        type: "info"
      });
    }
  };

  const handleReject = (record: SalaryRecord) => {
    try {
      rejectSalary(salaryKey(record), "Placed on hold by Finance Approver");
      setNotice({
        message: `Salary for ${record.name} rejected / placed on hold.`,
        type: "info"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to reject salary.",
        type: "info"
      });
    }
  };

  const handleForward = (record: SalaryRecord) => {
    try {
      const actorName = user ? `${user.name} (${user.id})` : "Finance Manager";
      forwardForPayment(salaryKey(record), actorName);
      setNotice({
        message: `Salary for ${record.name} (${salaryMoney(record.netPay)}) forwarded to Finance Payment Desk.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to forward salary.",
        type: "info"
      });
    }
  };

  const handleApproveAllPending = () => {
    if (!pendingApproval.length) return;
    try {
      const approverName = user ? `${user.name} (${user.id})` : "Finance Approver";
      pendingApproval.forEach(record => {
        approveSalary(salaryKey(record), approverName);
      });
      setNotice({
        message: `Successfully approved all ${pendingApproval.length} pending salaries (${salaryMoney(pendingAmount)}). They can now be forwarded for payment.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to approve salaries.",
        type: "info"
      });
    }
  };

  const handleForwardAllReady = () => {
    if (!readyToForward.length) return;
    try {
      const actorName = user ? `${user.name} (${user.id})` : "Finance Manager";
      const keys = readyToForward.map(r => salaryKey(r));
      forwardMultiple(keys, actorName);
      setNotice({
        message: `Successfully forwarded ${readyToForward.length} approved salaries (${salaryMoney(readyAmount)}) to the Payment Desk.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to forward salaries.",
        type: "info"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <Banknote size={13} />
              Payroll & Salary Approvals Desk
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">
              Salary Approvals & Forwarding
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Here the finance department verifies employee monthly salary approvals, authorizes pending payroll, and forwards approved salaries directly to the Payment Desk for bank disbursement.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white">
              <CalendarDays size={14} className="text-emerald-400" />
              <span>Payroll Month:</span>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="focus-ring cursor-pointer rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white outline-none"
              >
                {payrollMonths.map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {salaryMonthLabel(m)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Notice Banner */}
      {notice && (
        <div
          role="status"
          className={cn(
            "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs transition",
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300"
          )}
        >
          <div className="flex items-center gap-2.5">
            {notice.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="font-medium">{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="focus-ring rounded-lg p-1 text-current opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-[var(--text-subtle)]">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Net Payroll</span>
            <span className="grid size-8 place-items-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
              <Banknote size={15} />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--text)]">{salaryMoney(totalPayroll)}</p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">{monthlyRecords.length} staff enrolled for {salaryMonthLabel(month)}</p>
        </div>

        <div className="rounded-[22px] border border-amber-500/25 bg-amber-500/[0.04] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Pending Approval</span>
            <span className="grid size-8 place-items-center rounded-xl bg-amber-500/15 text-amber-600">
              <Clock3 size={15} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold tracking-tight text-[var(--text)]">{pendingApproval.length}</p>
            <span className="text-xs font-semibold text-amber-600">{salaryMoney(pendingAmount)}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">Requires finance sign-off before payment</p>
        </div>

        <div className="rounded-[22px] border border-emerald-500/25 bg-emerald-500/[0.04] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Ready to Forward</span>
            <span className="grid size-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <Zap size={15} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold tracking-tight text-[var(--text)]">{readyToForward.length}</p>
            <span className="text-xs font-semibold text-emerald-600">{salaryMoney(readyAmount)}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">Approved salaries ready for Payment Desk</p>
        </div>

        <div className="rounded-[22px] border border-blue-500/25 bg-blue-500/[0.04] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">In Payment Desk</span>
            <span className="grid size-8 place-items-center rounded-xl bg-blue-500/15 text-blue-600">
              <Send size={15} />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold tracking-tight text-[var(--text)]">{forwarded.length + disbursed.length}</p>
            <span className="text-xs font-semibold text-blue-600">{salaryMoney(forwardedAmount + disbursedAmount)}</span>
          </div>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">
            {disbursed.length} disbursed · {forwarded.length} awaiting disbursement
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <section className="space-y-4 rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {[
              { id: "all", label: "All salaries", count: monthlyRecords.length },
              { id: "pending", label: "Pending approval", count: pendingApproval.length, highlight: pendingApproval.length > 0 },
              { id: "ready", label: "Ready to forward", count: readyToForward.length, highlight: readyToForward.length > 0 },
              { id: "forwarded", label: "In payment desk", count: forwarded.length },
              { id: "disbursed", label: "Disbursed", count: disbursed.length }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                className={cn(
                  "focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition",
                  filter === tab.id
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                    filter === tab.id
                      ? "bg-white/20 text-white"
                      : tab.highlight
                      ? "bg-amber-500/15 text-amber-600"
                      : "bg-[var(--surface-soft)] text-[var(--text-subtle)]"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {pendingApproval.length > 0 && (
              <button
                type="button"
                onClick={handleApproveAllPending}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
              >
                <CheckCircle2 size={14} />
                Approve all pending ({pendingApproval.length})
              </button>
            )}

            {readyToForward.length > 0 && (
              <button
                type="button"
                onClick={handleForwardAllReady}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
              >
                <Send size={14} />
                Forward all approved ({readyToForward.length} · {salaryMoney(readyAmount)})
              </button>
            )}

            <Link
              to="/finance/payments?source=Salary"
              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]/80"
            >
              <ArrowUpRight size={14} />
              Open Payment Desk
            </Link>
          </div>
        </div>

        {/* Search & Department Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by employee name, ID, role or department..."
              className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] placeholder:text-[var(--text-subtle)]"
            />
          </div>

          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)]"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Salary Records List */}
      <section className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] bg-[var(--module-bg)] p-12 text-center">
            <Banknote size={32} className="mx-auto text-[var(--text-subtle)] opacity-50" />
            <h4 className="mt-3 text-sm font-semibold text-[var(--text)]">No salary records found</h4>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">Try adjusting your status filter, department, or search query.</p>
          </div>
        ) : (
          visible.map(record => {
            const isApproved = record.approvalStatus === "Approved";
            const isPendingApproval = record.approvalStatus === "Pending approval";
            const isForwarded = Boolean(record.forwardedAt);
            const isDisbursed = record.status === "Disbursed";
            const canForward = canForwardSalary(record);

            return (
              <article
                key={salaryKey(record)}
                className="group relative rounded-[22px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] transition hover:border-[var(--brand-primary)]/40 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  {/* Employee identity */}
                  <div className="flex items-start gap-4">
                    <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 text-xs font-bold text-[var(--text)]">
                      {record.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-[var(--text)]">{record.name}</h4>
                        <span className="rounded-md bg-[var(--surface-soft)] px-2 py-0.5 font-mono text-[9px] text-[var(--text-subtle)]">
                          {record.id}
                        </span>
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-semibold text-blue-600">
                          {record.department}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {record.designation} · {record.location} · {salaryMonthLabel(record.month)}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Status block */}
                  <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                    {/* Amount */}
                    <div className="text-left lg:text-right">
                      <b className="block text-lg font-bold tracking-tight text-[var(--text)]">
                        {salaryMoney(record.netPay)}
                      </b>
                      <small className="text-[9px] text-[var(--text-subtle)]">
                        Gross: {salaryMoney(record.basicHra + record.allowance)} · Ded: {salaryMoney(record.pfDeduction + record.esiDeduction + record.tdsDeduction)}
                      </small>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-col gap-1 text-left lg:text-right">
                      {/* Approval badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                          isApproved
                            ? "bg-emerald-500/10 text-emerald-600"
                            : record.approvalStatus === "Rejected"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {isApproved ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
                        {isApproved ? "Approved" : record.approvalStatus}
                      </span>

                      {/* Payment Forwarding badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                          isDisbursed
                            ? "bg-emerald-500/10 text-emerald-600"
                            : isForwarded
                            ? "bg-blue-500/10 text-blue-600"
                            : canForward
                            ? "bg-indigo-500/10 text-indigo-600"
                            : "bg-slate-500/10 text-slate-500"
                        )}
                      >
                        {isDisbursed ? (
                          <Check size={11} />
                        ) : isForwarded ? (
                          <Send size={11} />
                        ) : canForward ? (
                          <Zap size={11} />
                        ) : null}
                        {isDisbursed
                          ? "Disbursed"
                          : isForwarded
                          ? "In Payment Desk"
                          : canForward
                          ? "Ready to forward"
                          : "Pending approval"}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* If pending approval: show inline Approve and Reject */}
                      {isPendingApproval && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleReject(record)}
                            className="focus-ring inline-flex h-9 items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/[0.06] px-2.5 text-[11px] font-semibold text-red-600 hover:bg-red-500/15"
                            title="Reject or Hold Salary"
                          >
                            <X size={13} />
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApprove(record)}
                            className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700"
                            title="Authorize and Approve Salary"
                          >
                            <CheckCircle2 size={13} />
                            Approve
                          </button>
                        </>
                      )}

                      {/* If approved & can forward: show Forward for payment */}
                      {canForward && (
                        <button
                          type="button"
                          onClick={() => handleForward(record)}
                          className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
                          title="Forward approved salary to Finance Payment Desk"
                        >
                          <Send size={13} />
                          Forward for payment
                        </button>
                      )}

                      {/* If already forwarded: show link to Payments desk */}
                      {isForwarded && !isDisbursed && (
                        <Link
                          to="/finance/payments?source=Salary"
                          className="focus-ring inline-flex h-9 items-center gap-1 rounded-xl border border-blue-500/30 bg-blue-500/[0.06] px-2.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-500/15"
                          title="View this salary in the Payment Desk"
                        >
                          <ArrowUpRight size={13} />
                          Payment Desk
                        </Link>
                      )}

                      {/* Full breakdown button */}
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="focus-ring inline-flex h-9 items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-[11px] font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-soft)]/80 hover:text-[var(--text)]"
                      >
                        <Eye size={13} />
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-bar with audit & bank evidence */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--text-subtle)]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      Bank: <strong className="text-[var(--text-muted)]">{record.bankName}</strong> ({record.bankAccount})
                    </span>
                    <span>
                      IFSC: <strong className="text-[var(--text-muted)]">{record.ifsc}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isApproved && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Approved by {record.approvedBy || "Finance Approver"} on {record.approvedOn || "recorded date"}
                      </span>
                    )}
                    {isForwarded && (
                      <span className="text-blue-600 dark:text-blue-400">
                        · Forwarded on {new Date(record.forwardedAt!).toLocaleDateString()}
                      </span>
                    )}
                    {isDisbursed && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        · Paid on {record.paidOn} (Ref: {record.reference})
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Detail Overlay */}
      {selectedRecord && (
        <SalaryApprovalDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onForward={handleForward}
        />
      )}
    </div>
  );
}

export function CombinedApprovalsView() {
  const [type, setType] = useState<"Center" | "Procurement" | "Salary">("Center");
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-2 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Approval type">
          <button
            type="button"
            role="tab"
            aria-selected={type === "Center"}
            onClick={() => setType("Center")}
            className={cn(
              "focus-ring flex min-h-14 items-center justify-center gap-3 rounded-[18px] px-4 text-xs font-semibold transition",
              type === "Center"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            )}
          >
            <Building2 size={16} />
            Center approvals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={type === "Procurement"}
            onClick={() => setType("Procurement")}
            className={cn(
              "focus-ring flex min-h-14 items-center justify-center gap-3 rounded-[18px] px-4 text-xs font-semibold transition",
              type === "Procurement"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            )}
          >
            <ShoppingCart size={16} />
            Procurement approvals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={type === "Salary"}
            onClick={() => setType("Salary")}
            className={cn(
              "focus-ring flex min-h-14 items-center justify-center gap-3 rounded-[18px] px-4 text-xs font-semibold transition",
              type === "Salary"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            )}
          >
            <Banknote size={16} />
            Salary approvals
          </button>
        </div>
      </section>
      {type === "Center" ? (
        <CenterApprovalsView />
      ) : type === "Procurement" ? (
        <ProcurementApprovalsView />
      ) : (
        <SalaryApprovalsQueueView />
      )}
    </div>
  );
}
