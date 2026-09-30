import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ChevronRight, FileText, FolderKanban, History, Search, Wallet, UsersRound, Clock3 } from "lucide-react";
import { financeAreas } from "./data";
import { useEmployeeInvoices, type ReimbursementClaim } from "./employeeInvoiceStore";
import { Overlay } from "../../components/ui/Overlay";

import "./auditTrail.css";
import { SampleInvoiceDetails } from "./SampleInvoiceDetails";

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]";
const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
const dateLabel = (date: string) => Number.isNaN(Date.parse(date)) ? date : new Date(date).toLocaleString("en-IN", { dateStyle: "medium", ...(date.includes("T") ? { timeStyle: "short" as const } : {}) });

export function AuditTrailsView() {
  const { claims, error } = useEmployeeInvoices();
  const [searchParams, setSearchParams] = useSearchParams();
  const areaId = searchParams.get("area") ?? "";
  const requestedProject = searchParams.get("project") ?? "";
  const openArea = (id: string) => setSearchParams(id ? { area: id } : {});
  const openProject = (name: string) => setSearchParams({ area: areaId, ...(name ? { project: name } : {}) });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<ReimbursementClaim | null>(null);
  const knownNames = new Set(financeAreas.flatMap((area) => area.projects.map((project) => project.name)));
  const unassigned = [...new Set(claims.filter((claim) => !knownNames.has(claim.project)).map((claim) => claim.project))];
  const areas = [...financeAreas, ...(unassigned.length ? [{ id: "unassigned", name: "Central / unassigned", projects: unassigned.map((name) => ({ id: name, name })) }] : [])];
  const area = areas.find((item) => item.id === areaId);
  const projectName = area?.projects.some((project) => project.name === requestedProject) ? requestedProject : "";
  const areaNames = new Set(area?.projects.map((project) => project.name) ?? []);
  const scoped = claims.filter((claim) => projectName ? claim.project === projectName : area ? areaNames.has(claim.project) : true);
  const filtered = scoped.filter((claim) => (status === "all" || claim.status === status) && `${claim.id} ${claim.claimantName} ${claim.employeeId} ${claim.description} ${claim.receiptName}`.toLowerCase().includes(query.trim().toLowerCase()));
  const resetFilters = () => { setQuery(""); setStatus("all"); };

  const directoryItems = area
    ? area.projects.map((project) => ({ id: project.id, name: project.name, projectNames: [project.name], projectCount: null }))
    : areas.map((item) => ({ id: item.id, name: item.name, projectNames: item.projects.map((project) => project.name), projectCount: item.projects.length }));
  const pending = scoped.filter((claim) => claim.status === "Pending Verification").length;
  const summary = [
    { icon: FileText, label: "Invoice submissions", value: scoped.length, detail: projectName ? "In this project" : area ? "Across this area" : "Across all thematic areas" },
    { icon: Wallet, label: "Total invoice value", value: money(scoped.reduce((sum, claim) => sum + claim.amount, 0)), detail: "Submitted claim amounts" },
    { icon: UsersRound, label: "Employees", value: new Set(scoped.map((claim) => claim.employeeId)).size, detail: "With submitted invoices" },
    { icon: Clock3, label: "Awaiting verification", value: pending, detail: "Pending finance review" },
  ];

  return <div className="finance-audit audit-page">
    <header className="audit-header">
      <div><span className="audit-eyebrow"><History size={14} aria-hidden="true" />Finance / Records</span>
        <h2>Audit trail</h2>
        <p>Follow every employee invoice, from submission to disbursement.</p>
      </div>
      <div className="audit-header-note"><span className="audit-icon"><FolderKanban size={20} aria-hidden="true" /></span><div><strong>Project-wise history</strong><span>Invoices, approvals & payment records</span></div></div>
    </header>
    {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
    <nav aria-label="Audit trail location" className="audit-breadcrumb">
      <button aria-current={!area ? "page" : undefined} className="focus-ring" onClick={() => { openArea(""); resetFilters(); }}>All thematic areas</button>
      {area && <><ChevronRight size={14} aria-hidden="true" /><button aria-current={!projectName ? "page" : undefined} className="focus-ring" onClick={() => { openProject(""); resetFilters(); }}>{area.name}</button></>}
      {projectName && <><ChevronRight size={14} aria-hidden="true" /><span aria-current="page">{projectName}</span></>}
    </nav>
    <section aria-label="Invoice summary" className="audit-summary">
      {summary.map((item) => <article key={item.label} className="audit-stat"><div className="audit-stat-label"><span>{item.label}</span><item.icon size={17} aria-hidden="true" /></div><p className="audit-stat-value">{item.value}</p><p className="audit-stat-detail">{item.detail}</p></article>)}
    </section>
    {!projectName && <section className="audit-browser" aria-labelledby="audit-browser-title">
      <div className="audit-section-heading"><div><h3 id="audit-browser-title">{area ? area.name : "Explore thematic areas"}</h3><p>{area ? "Choose a project to review employee invoices and recorded events." : "Choose an area to explore its projects and invoice history."}</p></div><span className="audit-count">{area ? `${area.projects.length} projects` : `${areas.length} areas`}</span></div>
      <div className="audit-card-grid">{directoryItems.map((item) => {
        const names = new Set(item.projectNames);
        const invoices = claims.filter((claim) => names.has(claim.project));
        const awaiting = invoices.filter((claim) => claim.status === "Pending Verification").length;
        return <button key={item.id} onClick={() => { if (area) openProject(item.name); else openArea(item.id); resetFilters(); }} className="audit-directory-card focus-ring">
          <div className="audit-card-top"><span className="audit-icon">{area ? <FileText size={19} aria-hidden="true" /> : <FolderKanban size={19} aria-hidden="true" />}</span><ArrowUpRight className="audit-card-arrow" size={17} aria-hidden="true" /></div>
          <h4>{item.name}</h4>
          <p className="audit-card-meta">{item.projectCount !== null ? `${item.projectCount} projects · ` : ""}{invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}</p>
          <div className="audit-card-bottom"><div><span>Invoice value</span><strong>{money(invoices.reduce((sum, claim) => sum + claim.amount, 0))}</strong></div><span className={awaiting ? "audit-card-state has-pending" : "audit-card-state"}>{awaiting ? `${awaiting} pending` : invoices.length ? "View records" : "No submissions"}</span></div>
        </button>;
      })}</div>
    </section>}
    {projectName && <section className="audit-invoice-panel">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-sm font-semibold text-[var(--text)]">Employee invoices</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{filtered.length} of {scoped.length} submissions · {projectName}</p></div><button onClick={() => { openProject(""); resetFilters(); }} className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)]"><ArrowLeft size={14} />Back to projects</button></div>
      <div className="audit-filters"><label className="relative min-w-0 flex-1 audit-search"><Search size={16} className="absolute left-3 top-3 text-[var(--text-subtle)]" /><input type="search" aria-label="Search invoice or employee" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, employee or description" className="focus-ring h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-3 text-sm text-[var(--text)]" /></label><select aria-label="Invoice status" value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-xs text-[var(--text)]"><option value="all">All statuses</option>{["Pending Verification", "Finance Approved", "Disbursed", "Rejected"].map((item) => <option key={item}>{item}</option>)}</select></div>
      {filtered.length ? <div className="audit-table-scroll focus-ring" role="region" aria-label="Employee invoices" tabIndex={0}><table className="w-full min-w-[800px] text-left text-xs"><caption className="sr-only">Invoices raised by employees for {projectName}</caption><thead className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[10px] text-[var(--text-subtle)]"><tr>{["Invoice / claim", "Employee", "Raised on", "Amount", "Status", "History"].map((label) => <th scope="col" key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{filtered.map((claim) => <tr key={claim.id} className="text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"><td className="max-w-[240px] px-3 py-4"><p className="font-semibold">{claim.id}</p><p className="mt-1 text-[var(--text-muted)]">{claim.sample ? `Demo ${claim.sample.type.toLowerCase()} · ` : ""}{claim.category}</p><p className="mt-1 line-clamp-2 text-[var(--text-subtle)]">{claim.description}</p></td><td className="px-3 py-4">{claim.claimantName}<span className="mt-1 block text-[var(--text-subtle)]">{claim.employeeId}</span></td><td className="px-3 py-4">{dateLabel(claim.date)}</td><td className="px-3 py-4 font-semibold">{money(claim.amount)}</td><td className="px-3 py-4"><span className="audit-status" data-status={claim.status}>{claim.status}</span></td><td className="px-3 py-4"><button onClick={() => setSelected(claim)} aria-label={`View history for ${claim.id}`} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--finance-accent)]"><History size={14} />View trail</button></td></tr>)}</tbody></table></div> : <div className="py-16 text-center text-[var(--text-muted)]"><FileText size={28} className="mx-auto" /><p className="mt-3 text-sm">{scoped.length ? "No invoices match your filters." : "No employee invoices have been raised for this project yet."}</p>{(query || status !== "all") && <button className="focus-ring audit-reset" onClick={resetFilters}>Clear filters</button>}</div>}
    </section>}
    <aside className="audit-demo-note"><FileText size={16} aria-hidden="true" /><p><strong>Demo records included.</strong> Explore Skill Development → PMKVY 4.0 Odisha Skills for sample invoices and reimbursements. Employee claims saved in this browser also appear here.</p></aside>
    {selected && <Overlay open onClose={() => setSelected(null)} variant="panel" labelColor="var(--finance-accent)" title={selected.id} label="Employee invoice history" description={`${selected.project} · ${selected.claimantName}`}><div className="finance-audit space-y-6 p-6"><div className={surface}><p className="text-2xl font-semibold text-[var(--text)]">{money(selected.amount)}</p><p className="mt-2 text-sm text-[var(--text-muted)]">{selected.status} · {selected.center}</p><p className="mt-4 text-sm leading-6 text-[var(--text)]">{selected.description}</p><p className="mt-4 break-all text-xs text-[var(--text-muted)]">Supporting document reference: {selected.receiptName}</p>{selected.bankUtr && <p className="mt-2 text-xs text-[var(--text-muted)]">Payment reference: {selected.bankUtr}</p>}</div><SampleInvoiceDetails claim={selected} /><h3 className="text-sm font-semibold text-[var(--text)]">Recorded events</h3><ol className="space-y-4 border-l border-[var(--border)] pl-5">{(selected.audit ?? [{ id: `${selected.id}-opening`, date: selected.date, action: "Opening invoice record", actor: `${selected.claimantName} (${selected.employeeId})`, detail: `Existing status: ${selected.status}. Earlier approval timestamps and actors are not available.` }]).map((event) => <li key={event.id} className="finance-audit-event rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="text-sm font-semibold text-[var(--text)]">{event.action}</p><p className="mt-2 text-xs text-[var(--text-muted)]">{event.actor} · {dateLabel(event.date)}</p><p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">{event.detail}</p></li>)}</ol></div></Overlay>}
  </div>;
}
