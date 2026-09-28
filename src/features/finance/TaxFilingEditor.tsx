import { useState, type FormEvent } from "react";
import { Overlay } from "../../components/ui/Overlay";
import { saveTaxFiling, type TaxFiling } from "./taxFilingStore";

export interface FilingTarget { id: string; title: string; filedDate?: string; reference?: string }
const control = "focus-ring mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-sm text-[var(--text)]";

export function TaxFilingEditor({ target, existing, onClose, onSaved }: { target: FilingTarget; existing?: TaxFiling; onClose: () => void; onSaved: (filing: TaxFiling) => void }) {
  const [date, setDate] = useState(existing?.filedDate ?? target.filedDate ?? "");
  const [reference, setReference] = useState(existing?.reference ?? target.reference ?? "");
  const [document, setDocument] = useState<File | undefined>(existing?.document);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!date || date > maxDate || !reference.trim() || !document) {
      setError("Enter a valid filing date, acknowledgement reference and supporting document.");
      return;
    }
    setSaving(true);
    setError("");
    const filing = { id: target.id, filedDate: date, reference: reference.trim(), document, updatedAt: new Date().toISOString() };
    try { await saveTaxFiling(filing); onSaved(filing); }
    catch { setError("The filing could not be saved. Your browser storage may be unavailable or full. Please try again."); }
    finally { setSaving(false); }
  }

  return <Overlay open onClose={() => { if (!saving) onClose(); }} title="Update filing & upload document" label={target.title} description="Record a completed filing and retain its acknowledgement." variant="panel" footer={<div className="flex w-full justify-end gap-3"><button disabled={saving} onClick={onClose} className="focus-ring rounded-xl border border-[var(--border)] px-4 py-3 text-xs text-[var(--text)]">Cancel</button><button disabled={saving} form="tax-filing-form" type="submit" className="focus-ring rounded-xl border border-[var(--brand-primary)] bg-[var(--surface-soft)] px-4 py-3 text-xs font-semibold text-[var(--brand-primary)] disabled:opacity-50">{saving ? "Saving…" : "Save as filed"}</button></div>}>
    <form id="tax-filing-form" onSubmit={submit} className="space-y-5 p-6">
      <p className="rounded-xl bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--text-muted)]">Saving updates this return to Filed. Documents and filing details are stored in this browser on this device.</p>
      <label className="block text-xs font-medium text-[var(--text-muted)]">Filing date<input required type="date" max={maxDate} value={date} onChange={(e) => setDate(e.target.value)} className={control} /></label>
      <label className="block text-xs font-medium text-[var(--text-muted)]">ARN / acknowledgement reference<input required maxLength={100} value={reference} onChange={(e) => setReference(e.target.value)} className={control} /></label>
      <label className="block text-xs font-medium text-[var(--text-muted)]">Filing acknowledgement document<input type="file" accept=".pdf,.jpg,.jpeg,.png" className={control} onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) {
          setError("Choose a non-empty PDF, JPG or PNG up to 10 MB.");
          setDocument(undefined);
          e.target.value = "";
          return;
        }
        setDocument(file); setError("");
      }} /><span className="mt-2 block text-xs text-[var(--text-subtle)]">PDF, JPG or PNG · Maximum 10 MB</span></label>
      {document && <p className="break-all rounded-xl border border-[var(--border)] p-3 text-xs text-[var(--text)]">Selected: {document.name}</p>}
      {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
    </form>
  </Overlay>;
}

export function FilingDocument({ filing }: { filing: TaxFiling }) {
  return <button type="button" className="focus-ring mt-2 block max-w-full truncate rounded-lg text-xs text-[var(--brand-primary)] underline" onClick={() => {
    const url = URL.createObjectURL(filing.document);
    const anchor = window.document.createElement("a");
    anchor.href = url; anchor.download = filing.document.name; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }}>Download {filing.document.name}</button>;
}
