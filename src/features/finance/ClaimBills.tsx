import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import type { ReimbursementClaim } from "./employeeInvoiceStore";
import { loadReceipt, type ClaimReceipt } from "./receiptStore";
import { SampleInvoiceDetails } from "./SampleInvoiceDetails";

function BillPreview({ receipt }: { receipt: ClaimReceipt }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    loadReceipt(receipt.id).then((blob) => {
      if (!active) return;
      if (!blob) { setError("This bill is unavailable in this browser. Please request the original attachment."); return; }
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => { if (active) setError("Could not load this bill. Close the review and try again."); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [receipt.id]);

  return <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4"><p className="min-w-0 break-all text-xs font-semibold text-[var(--text)]">{receipt.name}</p>{url && <a href={url} download={receipt.name} className="focus-ring inline-flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--finance-accent)]"><Download size={14} />Download bill</a>}</div>
    {error ? <p role="alert" className="p-6 text-sm text-[var(--text-muted)]">{error}</p> : !url ? <p role="status" className="p-6 text-sm text-[var(--text-muted)]">Loading bill…</p> : receipt.type === "application/pdf" ? <object data={url} type="application/pdf" aria-label={`Bill preview: ${receipt.name}`} className="h-[520px] w-full"><p className="p-6 text-sm text-[var(--text-muted)]">PDF preview is unavailable. Use Download bill to view the document.</p></object> : <img src={url} alt={`Bill: ${receipt.name}`} className="max-h-[600px] w-full object-contain p-3" />}
  </div>;
}

export function ClaimBills({ claim }: { claim: ReimbursementClaim }) {
  const receipts = claim.receipts ?? [];
  const [selectedId, setSelectedId] = useState(receipts[0]?.id);
  const selected = receipts.find((receipt) => receipt.id === selectedId) ?? receipts[0];
  return <section aria-label="Attached bills" className="rounded-2xl border border-[var(--border)] p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-[var(--text)]">Bills & receipts</h4><span className="text-xs text-[var(--text-muted)]">{receipts.length || claim.billsCount} bills</span></div>
    {receipts.length > 0 ? <>
      <p className="mt-2 text-xs text-[var(--text-muted)]">Select a bill to inspect its scan or download the original.</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">{receipts.map((receipt, index) => <li key={receipt.id}><button type="button" aria-pressed={selected?.id === receipt.id} onClick={() => setSelectedId(receipt.id)} className={`focus-ring flex h-full w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${selected?.id === receipt.id ? "border-[var(--finance-accent-border)] bg-[var(--finance-accent-soft)]" : "border-[var(--border)] hover:bg-[var(--surface-soft)]"}`}><FileText size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--finance-accent)]" /><span className="min-w-0"><span className="block text-[10px] text-[var(--text-muted)]">Bill {index + 1} · {Math.max(1, Math.round(receipt.size / 1024))} KB</span><span className="mt-1 block break-all text-xs font-medium text-[var(--text)]">{receipt.name}</span></span></button></li>)}</ul>
      {selected && <BillPreview key={selected.id} receipt={selected} />}
    </> : claim.sample ? <div className="mt-4"><SampleInvoiceDetails claim={claim} /></div> : <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-4"><p className="break-all text-xs font-medium text-[var(--text)]">{claim.receiptName || "No files attached"}</p><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">{claim.billsCount ? "This older claim records a bill count and filename only. Original scans were not saved and cannot be previewed." : "No bills were uploaded with this claim."}</p></div>}
  </section>;
}
