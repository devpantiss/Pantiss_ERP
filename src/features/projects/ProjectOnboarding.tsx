import { useId, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, FolderPlus, Save } from "lucide-react";
import { Overlay } from "../../components/ui/Overlay";

const storageKey = "pantiss-project-onboarding-draft";
const emptyDraft = { name: "", area: "", location: "", manager: "", donor: "", budget: "", start: "", end: "", objective: "" };
type Draft = typeof emptyDraft;
const inputClass = "focus-ring mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none";

function readDraft(): Draft {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (saved && typeof saved === "object") {
      return Object.fromEntries(Object.entries(emptyDraft).map(([key, value]) => [key, typeof (saved as Record<string, unknown>)[key] === "string" ? (saved as Record<string, string>)[key] : value])) as Draft;
    }
  } catch { /* Storage may be unavailable; the form still works in memory. */ }
  return { ...emptyDraft };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-[var(--text-muted)]">{label}{children}</label>;
}

export function ProjectOnboarding({ areas }: { areas: string[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(readDraft);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const formId = useId();
  const update = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice("");
    setError("");
  };
  const close = () => { setOpen(false); trigger.current?.focus(); };

  return <>
    <button ref={trigger} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--module-bg)] px-4 text-xs font-semibold text-[var(--brand-primary)] shadow-[var(--shadow-card)] transition hover:bg-[var(--surface-soft)]">
      <FolderPlus size={16} aria-hidden="true" /> Project onboarding
    </button>
    <Overlay open={open} onClose={close} variant="panel" size="lg" title="Onboard a project" label="Project onboarding" description="Bring the essentials together before your project gets underway." footer={<div className="flex w-full flex-wrap items-center justify-between gap-3"><button type="button" onClick={close} className="focus-ring rounded-xl px-4 py-3 text-xs font-medium text-[var(--text-muted)]">Close</button><button type="submit" form={formId} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--brand-primary)] bg-[var(--surface-soft)] px-5 py-3 text-xs font-semibold text-[var(--brand-primary)]"><Save size={15} aria-hidden="true" />Save onboarding draft</button></div>}>
      <form id={formId} className="space-y-7 p-5 sm:p-7" onSubmit={(event) => {
        event.preventDefault();
        if (!draft.name.trim()) { setError("Enter a project name to save your draft."); return; }
        if (draft.start && draft.end && draft.end < draft.start) { setError("The end date must be on or after the start date."); return; }
        try {
          localStorage.setItem(storageKey, JSON.stringify(draft));
          setNotice("Onboarding draft saved. You can close this panel and continue later.");
          setError("");
        } catch { setError("Your browser could not save this draft. Keep this panel open and try again."); }
      }}>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--text-muted)]">Start with a project name and add details as they become available. Drafts are saved only in this browser; saving does not publish a project to the portfolio.</div>
        <fieldset className="space-y-4"><legend className="mb-4 text-sm font-semibold text-[var(--text)]">01 · Project essentials</legend>
          <Field label="Project name *"><input required maxLength={160} value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Rural Skills Initiative" className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Thematic area"><select value={draft.area} onChange={(e) => update("area", e.target.value)} className={inputClass}><option value="">Select an area</option>{[...new Set([...areas, ...(draft.area ? [draft.area] : [])])].map((area) => <option key={area}>{area}</option>)}</select></Field>
            <Field label="Location"><input value={draft.location} onChange={(e) => update("location", e.target.value)} placeholder="District, state" className={inputClass} /></Field>
          </div>
          <Field label="Project objective"><textarea rows={3} maxLength={2000} value={draft.objective} onChange={(e) => update("objective", e.target.value)} placeholder="What will this project achieve, and who will it support?" className={inputClass + " resize-y"} /></Field>
        </fieldset>
        <fieldset className="space-y-4 border-t border-[var(--border)] pt-5"><legend className="pr-3 text-sm font-semibold text-[var(--text)]">02 · Ownership & timeline</legend>
          <Field label="Project manager"><input value={draft.manager} onChange={(e) => update("manager", e.target.value)} placeholder="Name of the responsible manager" className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Start date"><input type="date" value={draft.start} onChange={(e) => update("start", e.target.value)} className={inputClass} /></Field><Field label="End date"><input type="date" min={draft.start || undefined} value={draft.end} onChange={(e) => update("end", e.target.value)} className={inputClass} /></Field></div>
        </fieldset>
        <fieldset className="border-t border-[var(--border)] pt-5"><legend className="pr-3 text-sm font-semibold text-[var(--text)]">03 · Funding</legend><div className="grid gap-4 sm:grid-cols-2"><Field label="Donor / funding partner"><input value={draft.donor} onChange={(e) => update("donor", e.target.value)} placeholder="Organisation name" className={inputClass} /></Field><Field label="Proposed budget (INR)"><input type="number" min="0" step="0.01" value={draft.budget} onChange={(e) => update("budget", e.target.value)} placeholder="0.00" className={inputClass} /></Field></div></fieldset>
        {notice && <p role="status" className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text)]"><CheckCircle2 size={18} className="shrink-0" />{notice}</p>}
        {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
      </form>
    </Overlay>
  </>;
}
