import { useState } from "react";
import { Download, History } from "lucide-react";
import { budgetCategories } from "./budgetCategories";
import { booksCsv, downloadBookFile, money, type BookAuditEvent, type BookEntry } from "./booksData";
import { loadBooks } from "./booksStore";
import type { FinanceProject } from "./data";

const field = "focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-sm text-[var(--text)]";

function recordedHistory(entry: BookEntry): BookAuditEvent[] {
  const events = Array.isArray(entry.audit) ? entry.audit.filter(event => event && [event.id, event.at, event.actor, event.action, event.detail].every(value => typeof value === "string")) : [];
  const legacy = [];
  if (entry.importedAt && !events.some(event => event.action === "Imported from Tally")) legacy.push({ id: "legacy-import", at: entry.importedAt, actor: "Actor not recorded", action: "Imported from Tally", detail: `Historical import metadata · ${entry.sourceCompany ?? "Company not recorded"} · Voucher ${entry.sourceVoucherId ?? entry.reference}` });
  if (entry.exportedAt && !events.some(event => event.action === "Tally export prepared")) legacy.push({ id: "legacy-export", at: entry.exportedAt, actor: "Actor not recorded", action: "Tally export prepared", detail: "Historical export metadata. Posting in Tally is not confirmed." });
  return [...legacy, ...events].sort((a, b) => a.at.localeCompare(b.at));
}

function ExpenditureDetail({ entry }: { entry: BookEntry }) {
  const history = recordedHistory(entry);
  return <details className="group rounded-xl border border-[var(--border)] bg-[var(--module-bg)]">
    <summary className="focus-ring cursor-pointer rounded-xl p-4 text-sm text-[var(--text)]">
      <span className="ml-2 inline-flex w-[90%] flex-wrap items-center justify-between gap-3 align-middle"><span><strong className="font-medium">{entry.payee}</strong><span className="mt-1 block text-xs text-[var(--text-muted)]">{entry.date} · {entry.reference}</span></span><span className="text-right"><strong className="font-semibold">{money(entry.amount)}</strong><span className="mt-1 block text-xs text-[var(--finance-accent)]">Details & audit trail</span></span></span>
    </summary>
    <div className="space-y-5 border-t border-[var(--border)] p-4 sm:p-5">
      <dl className="grid gap-4 text-xs sm:grid-cols-2">{[
        ["Entry ID", entry.id], ["Component", entry.head], ["Payment date", entry.date], ["Voucher / reference", entry.reference],
        ["Source", entry.source === "tally" ? "Tally import" : "Manual entry"], ["Accounting treatment", entry.openingIncluded ? "Included in opening expenditure" : "Additional expenditure"],
        ["Source company", entry.sourceCompany ?? "Not recorded"], ["Source voucher", entry.sourceVoucherId ?? "Not recorded"], ["Cost centre", entry.sourceCostCentre ?? entry.projectId],
      ].map(([label, value]) => <div key={label}><dt className="text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words text-[var(--text)]">{value}</dd></div>)}</dl>
      <div><h5 className="text-xs font-medium text-[var(--text-muted)]">Narration</h5><p className="mt-2 whitespace-pre-wrap break-words text-sm text-[var(--text)]">{entry.narration}</p></div>
      <section aria-label={`Audit trail for ${entry.reference}`}><h5 className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]"><History size={16} aria-hidden="true" />Expenditure audit trail</h5>
        {history.length ? <ol className="mt-4 space-y-5 border-l border-[var(--border)] pl-4">{history.map(event => <li key={event.id}><p className="text-sm font-medium text-[var(--text)]">{event.action}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{event.actor} · <time dateTime={event.at}>{Number.isNaN(Date.parse(event.at)) ? event.at : new Date(event.at).toLocaleString("en-IN")}</time></p><p className="mt-2 break-words text-xs leading-5 text-[var(--text-muted)]">{event.detail}</p></li>)}</ol> : <p className="mt-3 text-xs text-[var(--text-muted)]">No audit events were recorded for this historical entry.</p>}
        <p className="mt-4 text-xs text-[var(--text-subtle)]">Only recorded events are shown. Approval and payment evidence are not attached to this Books record.</p>
      </section>
    </div>
  </details>;
}

export function ProjectExpenditureLedger({ project }: { project: FinanceProject }) {
  const [books] = useState(loadBooks);
  const [query, setQuery] = useState("");
  const [component, setComponent] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const entries = books.entries.filter(entry => entry.projectId === project.id);
  const visible = entries.filter(entry => (component === "all" || component === entry.head) && (!from || entry.date >= from) && (!to || entry.date <= to) && `${entry.payee} ${entry.reference} ${entry.narration} ${entry.id}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const openingDetail = entries.filter(entry => entry.openingIncluded).reduce((sum, entry) => sum + entry.amount, 0);
  const additional = entries.filter(entry => !entry.openingIncluded).reduce((sum, entry) => sum + entry.amount, 0);
  const openingGap = project.spent * 100000 - openingDetail;
  if (books.error) return <p role="alert" className="p-6 text-sm text-[var(--text)]">{books.error}</p>;
  return <div className="space-y-6 p-5 sm:p-7">
    <div><h3 className="text-lg font-semibold text-[var(--text)]">Component-wise expenditure ledger</h3><p className="mt-2 text-sm text-[var(--text-muted)]">Review every recorded Books entry and expand an expenditure to inspect its details and audit history.</p></div>
    <dl className="grid gap-3 sm:grid-cols-3">{[["Opening expenditure", project.spent * 100000], ["Additional expenditure", additional], ["Total expenditure", project.spent * 100000 + additional]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><dt className="text-xs text-[var(--text-muted)]">{label}</dt><dd className="mt-2 text-xl font-semibold text-[var(--text)]">{money(Number(value))}</dd></div>)}</dl>
    {Math.abs(openingGap) > .01 && <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--text-muted)]">{openingGap > 0 ? `${money(openingGap)} of opening expenditure has no component-level entries yet. Import the supporting vouchers through Books to complete this ledger.` : `Opening-detail entries exceed the opening expenditure by ${money(-openingGap)}. Review imported vouchers in Books.`} Component totals below include recorded entries only.</p>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-2 text-xs text-[var(--text-muted)]">Search expenditure<input className={field} type="search" value={query} placeholder="Payee, reference or narration" onChange={event => setQuery(event.target.value)} /></label>
      <label className="grid gap-2 text-xs text-[var(--text-muted)]">Component<select className={field} value={component} onChange={event => setComponent(event.target.value)}><option value="all">All components</option>{budgetCategories.map(head => <option key={head}>{head}</option>)}</select></label>
      <label className="grid gap-2 text-xs text-[var(--text-muted)]">From<input className={field} type="date" value={from} max={to || undefined} onChange={event => setFrom(event.target.value)} /></label>
      <label className="grid gap-2 text-xs text-[var(--text-muted)]">To<input className={field} type="date" value={to} min={from || undefined} onChange={event => setTo(event.target.value)} /></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[var(--text-muted)]">{visible.length} entries · {money(visible.reduce((sum, entry) => sum + entry.amount, 0))} in this view</p><button type="button" disabled={!visible.length} className={`${field} inline-flex items-center gap-2 disabled:opacity-50`} onClick={() => downloadBookFile(booksCsv(visible), `ledger-${project.id}.csv`, "text/csv;charset=utf-8")}><Download size={15} />Export entries</button></div>
    {budgetCategories.filter(head => component === "all" || component === head).map(head => {
      const items = visible.filter(entry => entry.head === head);
      return <section key={head} className="rounded-2xl border border-[var(--border)] p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h4 className="text-sm font-semibold text-[var(--text)]">{head}</h4><p className="mt-1 text-xs text-[var(--text-muted)]">{items.length} expenditure entries</p></div><p className="text-base font-semibold text-[var(--text)]">{money(items.reduce((sum, entry) => sum + entry.amount, 0))}</p></div><div className="space-y-3">{items.map(entry => <ExpenditureDetail key={entry.id} entry={entry} />)}</div>{!items.length && <p className="text-xs text-[var(--text-muted)]">No recorded expenditure matches this component and the current filters.</p>}</section>;
    })}
    <p className="text-xs text-[var(--text-subtle)]">Entries and audit events are stored in this browser. Historical actions cannot be reconstructed when no audit record exists.</p>
  </div>;
}
