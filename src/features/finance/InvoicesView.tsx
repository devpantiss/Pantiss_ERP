import { useSearchParams } from "react-router-dom";
import { ChevronRight, FolderKanban } from "lucide-react";
import { financeAreas } from "./data";
import { CombinedApprovalsView } from "./FinanceOperationsViews";
import { ClientInvoices } from "./ClientInvoices";
import "./auditTrail.css";

export function InvoicesView() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "client" ? "client" : "internal";
  const area = financeAreas.find(item => item.id === params.get("area"));
  const project = area?.projects.find(item => item.id === params.get("project"));
  const navigate = (areaId?: string, projectId?: string) => setParams({ tab, ...(areaId ? { area: areaId } : {}), ...(projectId ? { project: projectId } : {}) });
  return <div className="finance-audit space-y-6">
    <header><h2 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Invoices</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Review internal expenses and raise client invoices, organized by thematic area and project.</p></header>
    <div role="tablist" aria-label="Invoice type" className="flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-2">
      {(["internal", "client"] as const).map((value, index) => <button key={value} id={`invoice-tab-${value}`} role="tab" aria-selected={tab === value} aria-controls="invoice-panel" tabIndex={tab === value ? 0 : -1} onKeyDown={event => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "internal" : event.key === "End" ? "client" : index === 0 ? "client" : "internal"; setParams({ tab: next }); document.getElementById(`invoice-tab-${next}`)?.focus(); } }} onClick={() => setParams({ tab: value })} className={`focus-ring min-h-11 flex-1 rounded-xl px-4 text-sm font-medium ${tab === value ? "bg-[var(--finance-accent-soft)] text-[var(--finance-accent)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"}`}>{value === "internal" ? "Internal invoices" : "Client invoices"}</button>)}
    </div>
    <div id="invoice-panel" role="tabpanel" aria-labelledby={`invoice-tab-${tab}`} className="space-y-5">
      <nav aria-label="Invoice location" className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]"><button type="button" onClick={() => navigate()} className="focus-ring rounded-lg px-2 py-3">Thematic areas</button>{area && <><ChevronRight size={14} /><button type="button" onClick={() => navigate(area.id)} className="focus-ring rounded-lg px-2 py-3">{area.name}</button></>}{project && <><ChevronRight size={14} /><span aria-current="page" className="text-[var(--text)]">{project.name}</span></>}</nav>
      {!project ? <section><h3 className="mb-4 text-lg font-semibold text-[var(--text)]">{area ? "Select a project" : "Select a thematic area"}</h3><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{(area ? area.projects : financeAreas).map(item => <button type="button" key={item.id} onClick={() => area ? navigate(area.id, item.id) : navigate(item.id)} className="focus-ring flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-6 text-left transition-colors hover:border-[var(--finance-accent-border)]"><FolderKanban size={22} className="shrink-0 text-[var(--finance-accent)]" /><span className="flex-1"><span className="block text-sm font-semibold text-[var(--text)]">{item.name}</span><span className="mt-2 block text-xs text-[var(--text-muted)]">{"projects" in item ? `${item.projects.length} projects` : "View project invoices"}</span></span><ChevronRight size={16} className="text-[var(--text-muted)]" /></button>)}</div></section> : tab === "internal" ? <CombinedApprovalsView key={project.id} project={project} /> : <ClientInvoices key={project.id} project={project} />}
    </div>
  </div>;
}
