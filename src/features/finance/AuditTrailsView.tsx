import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, FileText, FolderKanban, History, Search, Wallet, UsersRound } from "lucide-react";
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

  return <div className="finance-audit space-y-6">
    <section className="finance-audit-hero relative overflow-hidden rounded-[28px] p-6 shadow-xl sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full border border-[color:color-mix(in_srgb,var(--finance-on-hero)_10%,transparent)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--finance-on-hero)_15%,transparent)] bg-[color:color-mix(in_srgb,var(--finance-on-hero)_10%,transparent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]"><History size={13} aria-hidden="true" />Employee invoice audit trail</span>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Project invoices & audit history</h2>
        <p className="mt-2.5 max-w-2xl text-xs leading-relaxed opacity-80 sm:text-sm">Choose a thematic area, open a project, and follow the invoices raised by its employees from submission through finance approval and disbursement.</p>
        <p className="mt-4 text-[10px] opacity-70">Demo skilling audit: Skill Development → PMKVY 4.0 Odisha Skills. Includes fictional invoices, reimbursements and browser-saved employee claims.</p>
      </div>
    </section>
    {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
    <nav aria-label="Audit trail location" className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-3 text-xs text-[var(--text-muted)]">
      <button className="focus-ring rounded-lg px-2 py-1" onClick={() => { openArea(""); resetFilters(); }}>Thematic areas</button>
      {area && <><ChevronRight size={14} /><button className="focus-ring rounded-lg px-2 py-1" onClick={() => { openProject(""); resetFilters(); }}>{area.name}</button></>}
      {projectName && <><ChevronRight size={14} /><span aria-current="page" className="font-medium text-[var(--text)]">{projectName}</span></>}
    </nav>
    <section aria-label="Invoice summary" className="grid gap-3 sm:grid-cols-3">
      {[{ icon: FileText, label: "Employee invoice submissions", value: scoped.length }, { icon: Wallet, label: "Invoice value", value: money(scoped.reduce((sum, claim) => sum + claim.amount, 0)) }, { icon: UsersRound, label: "Employees", value: new Set(scoped.map((claim) => claim.employeeId)).size }].map((item) => <article key={item.label} className={surface}><span className="mb-4 grid size-10 place-items-center rounded-xl bg-[var(--finance-accent-soft)] text-[var(--finance-accent)]"><item.icon size={18} aria-hidden="true" /></span><p className="text-xs text-[var(--text-muted)]">{item.label}</p><p className="mt-2 text-2xl font-semibold text-[var(--text)]">{item.value}</p></article>)}
    </section>
    {!area && <section aria-label="Thematic areas" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{areas.map((item) => {
      const names = new Set(item.projects.map((project) => project.name));
      const invoices = claims.filter((claim) => names.has(claim.project));
      return <button key={item.id} onClick={() => { openArea(item.id); resetFilters(); }} className={surface + " finance-audit-card focus-ring text-left transition hover:bg-[var(--surface-soft)] hover:shadow-sm"}><span className="grid size-10 place-items-center rounded-xl bg-[var(--finance-accent-soft)] text-[var(--finance-accent)]"><FolderKanban size={18} aria-hidden="true" /></span><h3 className="mt-4 text-base font-semibold text-[var(--text)]">{item.name}</h3><p className="mt-2 text-xs text-[var(--text-muted)]">{item.projects.length} projects · {invoices.length} invoices</p><span className="mt-5 flex items-center justify-between text-sm text-[var(--text)]">{money(invoices.reduce((sum, claim) => sum + claim.amount, 0))}<ChevronRight size={16} /></span></button>;
    })}</section>}
    {area && !projectName && <section aria-label={`${area.name} projects`} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{area.projects.map((project) => {
      const invoices = claims.filter((claim) => claim.project === project.name);
      return <button key={project.id} onClick={() => { openProject(project.name); resetFilters(); }} className={surface + " finance-audit-card focus-ring text-left transition hover:bg-[var(--surface-soft)] hover:shadow-sm"}><p className="text-xs text-[var(--text-subtle)]">{project.id}</p><h3 className="mt-2 text-base font-semibold text-[var(--text)]">{project.name}</h3><p className="mt-3 text-xs text-[var(--text-muted)]">{invoices.length} employee invoices · {money(invoices.reduce((sum, claim) => sum + claim.amount, 0))}</p><span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--finance-accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--finance-accent)]">View invoice audit trail <ChevronRight size={14} /></span></button>;
    })}</section>}
    {projectName && <section className={surface}>
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-sm font-semibold text-[var(--text)]">Employee invoices</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{filtered.length} of {scoped.length} submissions · {projectName}</p></div><button onClick={() => { openProject(""); resetFilters(); }} className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-muted)]"><ArrowLeft size={14} />Back to projects</button></div>
      <div className="mt-5 flex flex-wrap gap-3"><label className="relative min-w-0 flex-1"><Search size={16} className="absolute left-3 top-3 text-[var(--text-subtle)]" /><input type="search" aria-label="Search invoice or employee" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice, employee or description" className="focus-ring h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-10 pr-3 text-sm text-[var(--text)]" /></label><select aria-label="Invoice status" value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-xs text-[var(--text)]"><option value="all">All statuses</option>{["Pending Verification", "Finance Approved", "Disbursed", "Rejected"].map((item) => <option key={item}>{item}</option>)}</select></div>
      {filtered.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><caption className="sr-only">Invoices raised by employees for {projectName}</caption><thead className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-[10px] text-[var(--text-subtle)]"><tr>{["Invoice / claim", "Employee", "Raised on", "Amount", "Status", "History"].map((label) => <th scope="col" key={label} className="px-3 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-[var(--border)]">{filtered.map((claim) => <tr key={claim.id} className="text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"><td className="max-w-[240px] px-3 py-4"><p className="font-semibold">{claim.id}</p><p className="mt-1 text-[var(--text-muted)]">{claim.sample ? `Demo ${claim.sample.type.toLowerCase()} · ` : ""}{claim.category}</p><p className="mt-1 line-clamp-2 text-[var(--text-subtle)]">{claim.description}</p></td><td className="px-3 py-4">{claim.claimantName}<span className="mt-1 block text-[var(--text-subtle)]">{claim.employeeId}</span></td><td className="px-3 py-4">{dateLabel(claim.date)}</td><td className="px-3 py-4 font-semibold">{money(claim.amount)}</td><td className="px-3 py-4"><span className="rounded-full bg-[var(--surface-soft)] px-3 py-1">{claim.status}</span></td><td className="px-3 py-4"><button onClick={() => setSelected(claim)} aria-label={`View history for ${claim.id}`} className="focus-ring inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--finance-accent)]"><History size={14} />View trail</button></td></tr>)}</tbody></table></div> : <div className="py-16 text-center text-[var(--text-muted)]"><FileText size={28} className="mx-auto" /><p className="mt-3 text-sm">{scoped.length ? "No invoices match your filters." : "No employee invoices have been raised for this project yet."}</p></div>}
    </section>}
    {selected && <Overlay open onClose={() => setSelected(null)} variant="panel" labelColor="var(--finance-accent)" title={selected.id} label="Employee invoice history" description={`${selected.project} · ${selected.claimantName}`}><div className="finance-audit space-y-6 p-6"><div className={surface}><p className="text-2xl font-semibold text-[var(--text)]">{money(selected.amount)}</p><p className="mt-2 text-sm text-[var(--text-muted)]">{selected.status} · {selected.center}</p><p className="mt-4 text-sm leading-6 text-[var(--text)]">{selected.description}</p><p className="mt-4 break-all text-xs text-[var(--text-muted)]">Supporting document reference: {selected.receiptName}</p>{selected.bankUtr && <p className="mt-2 text-xs text-[var(--text-muted)]">Payment reference: {selected.bankUtr}</p>}</div><SampleInvoiceDetails claim={selected} /><h3 className="text-sm font-semibold text-[var(--text)]">Recorded events</h3><ol className="space-y-4 border-l border-[var(--border)] pl-5">{(selected.audit ?? [{ id: `${selected.id}-opening`, date: selected.date, action: "Opening invoice record", actor: `${selected.claimantName} (${selected.employeeId})`, detail: `Existing status: ${selected.status}. Earlier approval timestamps and actors are not available.` }]).map((event) => <li key={event.id} className="finance-audit-event rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="text-sm font-semibold text-[var(--text)]">{event.action}</p><p className="mt-2 text-xs text-[var(--text-muted)]">{event.actor} · {dateLabel(event.date)}</p><p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">{event.detail}</p></li>)}</ol></div></Overlay>}
  </div>;
}
