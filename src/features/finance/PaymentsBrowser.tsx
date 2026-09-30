import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Building2, ChevronRight, CreditCard, History, Search, Upload } from "lucide-react";
import { financeAreas } from "./data";
import { buildPaymentHierarchy, paymentAmount, paymentHistory, paymentRecordKey, type PaymentListRecord } from "./paymentHierarchy";
import { salaryDateLabel } from "./salaryData";
import { cn } from "../../utils/cn";
import "./salary.css";

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--module-bg)]";
const button = "focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-soft)]";

type Props = {
  records: PaymentListRecord[];
  error?: string;
  onPay: (key: string) => void;
  onDetails: (key: string) => void;
  onUpload: (key: string, file?: File) => void;
};

export function PaymentsBrowser({ records, error, onPay, onDetails, onUpload }: Props) {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const historyView = params.get("view") === "history";
  const areas = buildPaymentHierarchy(records, financeAreas);
  const area = areas.find(area => area.name === params.get("area"));
  const project = area?.projects.find(project => project.name === params.get("project"));
  const scoped = project?.records ?? area?.projects.flatMap(project => project.records) ?? records;
  const pending = scoped.filter(record => record.status === "Approved");
  const history = paymentHistory(scoped);
  const list = historyView ? history : pending;
  const visible = list.filter(record => `${record.id} ${record.title} ${record.payee} ${record.project} ${record.reference ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const navigate = (areaName?: string, projectName?: string, history = historyView) => {
    setParams({ ...(areaName ? { area: areaName } : {}), ...(projectName ? { project: projectName } : {}), ...(history ? { view: "history" } : {}) });
    setQuery("");
  };
  const cards = (area ? area.projects : areas.map(area => ({ name: area.name, records: area.projects.flatMap(project => project.records) }))).filter(card => card.records.length > 0);
  const showList = historyView || Boolean(project);

  return <div className="salary-workspace space-y-5">
    <header><h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Payments</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Pay approved requests or look up a previous payment.</p></header>
    <div role="group" aria-label="Payment views" className="flex gap-2 border-b border-[var(--border)] pb-4">
      {[{ history: false, label: "To pay", icon: CreditCard, count: pending.length }, { history: true, label: "Payment history", icon: History, count: history.length }].map(view => <button key={view.label} type="button" aria-pressed={historyView === view.history} onClick={() => navigate(area?.name, project?.name, view.history)} className={cn(button, "px-4 py-3", historyView === view.history && "border-[var(--salary-accent)] bg-[var(--salary-accent-soft)] text-[var(--salary-accent)]")}><view.icon size={15} />{view.label}<span className="text-[11px]">{view.count}</span></button>)}
    </div>
    {error && <p role="alert" className="text-sm text-[var(--salary-warning)]">{error}</p>}
    {(area || project) && <nav aria-label="Payment location" className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
      <button type="button" onClick={() => navigate()} className="focus-ring rounded px-1 py-2">All areas</button><ChevronRight size={13} />
      {area && <button type="button" onClick={() => navigate(area.name)} aria-current={!project ? "page" : undefined} className="focus-ring rounded px-1 py-2">{area.name}</button>}
      {project && <><ChevronRight size={13} /><span aria-current="page" className="text-[var(--text)]">{project.name}</span></>}
      {historyView && <button type="button" onClick={() => navigate(undefined, undefined, true)} className={cn(button, "ml-auto")}><ArrowLeft size={12} />All payment history</button>}
    </nav>}
    {!showList ? <section aria-label={area ? "Projects" : "Thematic areas"}>
      <h3 className="mb-3 text-sm font-medium text-[var(--text-muted)]">{area ? "Choose a project" : "Choose a thematic area"}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map(card => {
        const count = card.records.filter(record => record.status === "Approved").length;
        return <button type="button" key={card.name} onClick={() => area ? navigate(area.name, card.name) : navigate(card.name)} className={cn(surface, "focus-ring flex items-center gap-3 p-4 text-left transition-colors hover:border-[var(--salary-accent)]")}>
          <Building2 size={18} className="shrink-0 text-[var(--salary-accent)]" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-[var(--text)]">{card.name}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">{count ? `${count} to pay` : "All payments recorded"}</span></span><ChevronRight size={15} className="shrink-0 text-[var(--text-muted)]" />
        </button>;
      })}</div>
      {!cards.length && <p className="py-10 text-center text-sm text-[var(--text-muted)]">No payment requests yet.</p>}
    </section> : <section className={cn(surface, "overflow-hidden")} aria-label={historyView ? "Payment history" : "Payments to make"}>
      <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><h3 className="text-base font-semibold text-[var(--text)]">{historyView ? "Payment history" : project?.name}</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{historyView ? `${project?.name ?? area?.name ?? "All projects"} · Most recent first` : `${pending.length} approved payments`}</p></div>
        <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-[var(--text-muted)]"><Search size={14} /><input type="search" aria-label={historyView ? "Search payment history" : "Search payments"} value={query} onChange={event => setQuery(event.target.value)} placeholder={historyView ? "Payee, project or reference" : "Search payee"} className="focus-ring min-w-0 bg-transparent py-2.5 text-xs text-[var(--text)]" /></label>
      </div>
      {visible.length ? historyView ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs">
        <caption className="sr-only">Recorded payments for {project?.name ?? area?.name ?? "all projects"}</caption>
        <thead className="border-y border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]"><tr>{["Paid on", "Payment", "Amount", "Reference / receipt", ""].map(label => <th scope="col" key={label} className="px-5 py-3 font-medium">{label || <span className="sr-only">History</span>}</th>)}</tr></thead>
        <tbody className="divide-y divide-[var(--border)]">{visible.map(record => <tr key={paymentRecordKey(record)}>
          <td className="whitespace-nowrap px-5 py-4 text-[var(--text-muted)]">{record.paidOn ? salaryDateLabel(record.paidOn) : "Not recorded"}</td>
          <td className="max-w-[320px] px-5 py-4"><p className="font-medium text-[var(--text)]">{record.payee}</p><p className="mt-1 text-[var(--text-muted)]">{record.title}</p><p className="mt-1 text-[var(--text-muted)]">{record.project}</p></td>
          <td className="whitespace-nowrap px-5 py-4 font-semibold text-[var(--text)]">{paymentAmount(record.amount)}</td>
          <td className="max-w-[220px] px-5 py-4"><p className="break-all text-[var(--text)]">{record.reference ?? "Reference not recorded"}</p>{record.status === "In progress" ? <label className={cn(button, "mt-2 cursor-pointer focus-within:outline-2 focus-within:outline-[var(--salary-accent)]")}><Upload size={12} />Add payment slip<input type="file" accept=".pdf,.jpg,.jpeg,.png" aria-label={`Add payment slip for ${record.title}`} className="sr-only" onChange={event => { onUpload(paymentRecordKey(record), event.target.files?.[0]); event.target.value = ""; }} /></label> : <p className="mt-1 text-[var(--text-muted)]">{record.paymentSlip ?? "Payment recorded"}</p>}</td>
          <td className="px-5 py-4"><button type="button" onClick={() => onDetails(paymentRecordKey(record))} aria-label={`View payment history for ${record.title}`} className={button}>View history</button></td>
        </tr>)}</tbody>
      </table></div> : <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">{visible.map(record => <article key={paymentRecordKey(record)} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><h4 className="text-sm font-medium text-[var(--text)]">{record.payee}</h4><p className="mt-1 text-xs text-[var(--text-muted)]">{record.title}</p></div><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold text-[var(--text)]">{paymentAmount(record.amount)}</p><button type="button" onClick={() => onPay(paymentRecordKey(record))} className={cn(button, "border-[var(--salary-accent)] text-[var(--salary-accent)]")}>Record payment</button></div></article>)}</div> : <div className="border-t border-[var(--border)] px-5 py-12 text-center"><p className="text-sm font-medium text-[var(--text)]">{query ? "No matching payments" : historyView ? "No payment history yet" : "Nothing to pay"}</p><p className="mt-2 text-xs text-[var(--text-muted)]">{query ? "Try another search." : historyView ? "Recorded payments will appear here, including those awaiting a slip." : "Recorded payments are in Payment history."}</p>{query ? <button type="button" className={cn(button, "mt-4")} onClick={() => setQuery("")}>Clear search</button> : !historyView && <button type="button" className={cn(button, "mt-4")} onClick={() => navigate(area?.name, project?.name, true)}>View payment history</button>}</div>}
    </section>}
  </div>;
}
