import { useState } from "react";
import type { ReimbursementClaim } from "./employeeInvoiceStore";

export function SampleInvoiceDetails({ claim }: { claim: ReimbursementClaim }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sample = claim.sample;
  if (!sample) return null;
  const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;
  async function download() {
    if (!sample) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      pdf.setFontSize(18);
      pdf.text("SAMPLE DOCUMENT - NOT A VALID TAX INVOICE", 15, 20, { maxWidth: 180 });
      pdf.setFontSize(11);
      const lines = [sample.type, `Reference: ${claim.id}`, `Project: ${claim.project}`, `Employee: ${claim.claimantName} (${claim.employeeId})`, `Supplier: ${sample.supplier}`, `Raised: ${claim.date.slice(0, 10)}`, `Batch: ${sample.batch}`, `Budget head: ${sample.budgetHead}`, "", ...sample.items.flatMap((item) => [item.description, `Quantity: ${item.quantity} x INR ${item.rate.toFixed(2)} = INR ${(item.quantity * item.rate).toFixed(2)}`]), "", `Total: INR ${claim.amount.toFixed(2)}`, `Current status: ${claim.status}`, ...(claim.bankUtr ? [`Sample payment reference: ${claim.bankUtr}`] : []), "", "Fictional demonstration data. No real supplier bill or payment is represented."];
      pdf.text(pdf.splitTextToSize(lines.join("\n"), 180), 15, 42);
      pdf.save(claim.receiptName);
      setError("");
    } catch { setError("Could not generate the sample document. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
    <p className="text-xs font-semibold text-[var(--finance-accent)]">Demo {sample.type.toLowerCase()} · Fictional data</p>
    <h3 className="mt-3 text-sm font-semibold text-[var(--text)]">{sample.supplier}</h3>
    <p className="mt-2 text-xs text-[var(--text-muted)]">{sample.batch}</p>
    <p className="mt-1 text-xs text-[var(--text-muted)]">Budget head: {sample.budgetHead}</p>
    <ul className="mt-4 space-y-3">{sample.items.map((item) => <li key={item.description} className="border-t border-[var(--border)] pt-3 text-xs text-[var(--text)]"><p className="leading-5">{item.description}</p><p className="mt-2 font-medium">{item.quantity} × {money(item.rate)} = {money(item.quantity * item.rate)}</p></li>)}</ul>
    <button type="button" disabled={busy} onClick={download} className="focus-ring mt-5 rounded-xl border border-[var(--finance-accent-border)] bg-[var(--module-bg)] px-4 py-3 text-xs font-semibold text-[var(--finance-accent)] disabled:opacity-50">{busy ? "Generating…" : "Download sample document"}</button>
    {error && <p role="alert" className="mt-3 text-xs text-[var(--text)]">{error}</p>}
  </section>;
}
