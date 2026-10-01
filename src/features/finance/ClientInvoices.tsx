import { useState, type FormEvent, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FinanceProject } from "./data";
import { Overlay } from "../../components/ui/Overlay";
import { downloadClientInvoice, invoiceMoney, invoiceTotal, validateInvoice, type ClientInvoice } from "./clientInvoiceData";

const storageKey = "pantiss-client-invoices-v1";
const input = "focus-ring mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-sm text-[var(--text)]";
const button = "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-medium text-[var(--text)] disabled:opacity-50";
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-xs font-medium text-[var(--text-muted)]">{label}{children}</label>; }
function readInvoices() {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(parsed) || !parsed.every(item => validateInvoice(item) && ["Draft", "Raised"].includes(item.status))) throw new Error();
    return { invoices: parsed as ClientInvoice[], error: "" };
  } catch { return { invoices: [] as ClientInvoice[], error: "Saved invoices could not be loaded. Reload before making changes." }; }
}
function newInvoice(project: FinanceProject): ClientInvoice {
  const now = new Date();
  const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return { id: crypto.randomUUID(), number: `INV-${date.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, projectId: project.id, projectName: project.name, client: "", email: "", address: "", issuedOn: date, dueOn: date, lines: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }], notes: "", status: "Draft" };
}
export function ClientInvoices({ project }: { project: FinanceProject }) {
  const [initial] = useState(readInvoices);
  const [invoices, setInvoices] = useState(initial.invoices);
  const [error, setError] = useState(initial.error);
  const [draft, setDraft] = useState<ClientInvoice | null>(null);
  const [selected, setSelected] = useState<ClientInvoice | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState(false);
  const scoped = invoices.filter(invoice => invoice.projectId === project.id);
  const visible = scoped.filter(invoice => (status === "all" || invoice.status === status) && `${invoice.number} ${invoice.client}`.toLowerCase().includes(query.trim().toLowerCase()));
  const save = (invoice: ClientInvoice) => {
    if (initial.error) return false;
    if (!validateInvoice(invoice)) { setError("Complete client details, valid line items and a due date on or after the issue date."); return false; }
    try {
      const current = readInvoices();
      if (current.error) throw new Error();
      if (current.invoices.some(item => item.id !== invoice.id && item.number.toLowerCase() === invoice.number.toLowerCase())) { setError("This invoice number already exists. Choose another number."); return false; }
      const existing = current.invoices.find(item => item.id === invoice.id);
      if (existing?.status === "Raised") { setError("This invoice has already been raised. Reopen the page to see its current state."); return false; }
      const next = [invoice, ...current.invoices.filter(item => item.id !== invoice.id)];
      localStorage.setItem(storageKey, JSON.stringify(next)); setInvoices(next); setError(""); return true;
    } catch { setError("Invoice could not be saved. Check browser storage and try again."); return false; }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); if (draft && save(draft)) { setSelected(draft); setDraft(null); } };
  const download = async (invoice: ClientInvoice) => { setBusy(true); try { await downloadClientInvoice(invoice); } catch { setError("Could not create the PDF. Please try again."); } finally { setBusy(false); } };
  return <div className="space-y-5">
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-6"><div><h3 className="text-xl font-semibold text-[var(--text)]">Client invoices</h3><p className="mt-2 text-sm text-[var(--text-muted)]">{project.name} · Create, review and raise invoices for payment.</p></div><button type="button" disabled={Boolean(initial.error)} onClick={() => { setError(""); setDraft(newInvoice(project)); }} className={button}><Plus size={16} />Create invoice</button></section>
    {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: "Draft invoices", value: scoped.filter(item => item.status === "Draft").length }, { label: "Raised invoices", value: scoped.filter(item => item.status === "Raised").length }, { label: "Raised value", value: invoiceMoney(scoped.filter(item => item.status === "Raised").reduce((sum, item) => sum + invoiceTotal(item.lines), 0)) }].map(item => <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5"><p className="text-xs text-[var(--text-muted)]">{item.label}</p><p className="mt-3 text-2xl font-semibold text-[var(--text)]">{item.value}</p></div>)}</div>
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5"><div className="flex flex-wrap gap-3"><input aria-label="Search client invoices" type="search" placeholder="Search invoice or client" value={query} onChange={event => setQuery(event.target.value)} className={`${input} mt-0 sm:max-w-sm`} /><select aria-label="Invoice status" value={status} onChange={event => setStatus(event.target.value)} className={`${input} mt-0 sm:w-auto`}><option value="all">All statuses</option><option>Draft</option><option>Raised</option></select></div>
      <div className="mt-5 divide-y divide-[var(--border)]">{visible.map(invoice => <button type="button" key={invoice.id} onClick={() => setSelected(invoice)} className="focus-ring flex w-full flex-wrap items-center justify-between gap-4 rounded-lg py-5 text-left"><span><span className="block text-sm font-semibold text-[var(--text)]">{invoice.client}</span><span className="mt-1 block text-xs text-[var(--text-muted)]">{invoice.number} · Due {invoice.dueOn}</span></span><span className="text-right"><span className="block text-sm font-semibold text-[var(--text)]">{invoiceMoney(invoiceTotal(invoice.lines))}</span><span className="mt-1 block text-xs text-[var(--finance-accent)]">{invoice.status} · View invoice</span></span></button>)}</div>
      {!visible.length && <div className="py-12 text-center"><p className="text-sm font-medium text-[var(--text)]">{scoped.length ? "No matching invoices" : "No client invoices yet"}</p><p className="mt-2 text-xs text-[var(--text-muted)]">{scoped.length ? "Change the search or status filter." : "Create the first invoice for this project."}</p></div>}
    </section>
    {draft && <Overlay open onClose={() => setDraft(null)} variant="panel" size="lg" title={invoices.some(item => item.id === draft.id) ? "Edit draft invoice" : "Create client invoice"} description={project.name} footer={<button type="submit" form="client-invoice-form" className={button}>Save draft & review</button>}><form id="client-invoice-form" onSubmit={submit} className="space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Invoice number"><input required maxLength={80} value={draft.number} onChange={e => setDraft({ ...draft, number: e.target.value })} className={input} /></Field><Field label="Client / organization"><input required maxLength={180} value={draft.client} onChange={e => setDraft({ ...draft, client: e.target.value })} className={input} /></Field><Field label="Client email"><input required type="email" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className={input} /></Field><Field label="Issue date"><input required type="date" value={draft.issuedOn} onChange={e => setDraft({ ...draft, issuedOn: e.target.value })} className={input} /></Field><Field label="Due date"><input required type="date" min={draft.issuedOn} value={draft.dueOn} onChange={e => setDraft({ ...draft, dueOn: e.target.value })} className={input} /></Field></div>
      <Field label="Billing address"><textarea required rows={3} value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} className={input} /></Field>
      <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold text-[var(--text)]">Invoice items · INR</legend>{draft.lines.map((line, index) => <div key={line.id} className="rounded-xl border border-[var(--border)] p-4"><Field label={`Item ${index + 1} description`}><input required value={line.description} onChange={e => setDraft({ ...draft, lines: draft.lines.map(item => item.id === line.id ? { ...item, description: e.target.value } : item) })} className={input} /></Field><div className="mt-3 grid grid-cols-2 gap-3">{(["quantity", "rate"] as const).map(field => <Field key={field} label={field === "quantity" ? "Quantity" : "Unit rate (₹)"}><input type="number" required min="0.01" step="0.01" value={line[field] || ""} onChange={e => setDraft({ ...draft, lines: draft.lines.map(item => item.id === line.id ? { ...item, [field]: Number(e.target.value) } : item) })} className={input} /></Field>)}</div><div className="mt-3 flex items-center justify-between"><span className="text-sm text-[var(--text)]">{invoiceMoney(invoiceTotal([line]))}</span><button type="button" disabled={draft.lines.length === 1} aria-label={`Remove item ${index + 1}`} onClick={() => setDraft({ ...draft, lines: draft.lines.filter(item => item.id !== line.id) })} className={button}><Trash2 size={14} /></button></div></div>)}<button type="button" onClick={() => setDraft({ ...draft, lines: [...draft.lines, { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }] })} className={button}><Plus size={14} />Add item</button></fieldset>
      <Field label="Payment instructions / notes"><textarea rows={3} value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} className={input} /></Field><p className="text-right text-xl font-semibold text-[var(--text)]">Total {invoiceMoney(invoiceTotal(draft.lines))}</p>{error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
    </form></Overlay>}
    {selected && !draft && <Overlay open onClose={() => setSelected(null)} variant="panel" size="lg" title={selected.number} description={`${selected.status} · ${project.name}`} footer={<div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => download(selected)} className={button}>{busy ? "Generating…" : "Download PDF"}</button>{selected.status === "Draft" && <><button type="button" onClick={() => { setDraft(selected); setSelected(null); }} className={button}>Edit draft</button><button type="button" onClick={() => { const raised: ClientInvoice = { ...selected, status: "Raised", raisedAt: new Date().toISOString() }; if (save(raised)) setSelected(raised); }} className={`${button} bg-[var(--finance-accent-soft)]`}>Raise invoice</button></>}</div>}><div className="space-y-5 p-6"><div><h3 className="text-lg font-semibold text-[var(--text)]">{selected.client}</h3><p className="mt-2 text-sm text-[var(--text-muted)]">{selected.email}</p><p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{selected.address}</p></div><p className="text-xs text-[var(--text-muted)]">Issued {selected.issuedOn} · Due {selected.dueOn}</p><ul className="divide-y divide-[var(--border)]">{selected.lines.map(line => <li key={line.id} className="py-4"><p className="text-sm text-[var(--text)]">{line.description}</p><p className="mt-2 text-xs text-[var(--text-muted)]">{line.quantity} × {invoiceMoney(line.rate)} = {invoiceMoney(invoiceTotal([line]))}</p></li>)}</ul><p className="text-xl font-semibold text-[var(--text)]">Total payable {invoiceMoney(invoiceTotal(selected.lines))}</p><p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">{selected.notes}</p><p className="text-xs leading-5 text-[var(--text-muted)]">{selected.status === "Draft" ? "Review the details before raising this invoice. Raised invoices cannot be edited." : "Invoice raised. Download the PDF to share with the client. No email has been sent."}</p>{error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}</div></Overlay>}
  </div>;
}
