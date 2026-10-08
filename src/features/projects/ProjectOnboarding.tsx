import { useId, useRef, useState, type ReactNode } from "react";
import { AlertCircle, Calendar, CheckCircle2, FolderPlus, PlusCircle, Save, Trash2, Upload } from "lucide-react";
import { Overlay } from "../../components/ui/Overlay";

const storageKey = "pantiss-project-onboarding-draft-v2";

interface TrancheConfig {
  id: string;
  percentage: number;
  tentativeDate: string;
}

interface Draft {
  name: string;
  area: string;
  location: string;
  manager: string;
  donor: string;
  budget: string;
  start: string;
  end: string;
  objective: string;
  trancheCount: string;
  tranches: TrancheConfig[];
  workOrderFileName: string;
}

const emptyTranche = (): TrancheConfig => ({
  id: crypto.randomUUID(),
  percentage: 0,
  tentativeDate: "",
});

const emptyDraft: Draft = {
  name: "",
  area: "",
  location: "",
  manager: "",
  donor: "",
  budget: "",
  start: "",
  end: "",
  objective: "",
  trancheCount: "",
  tranches: [],
  workOrderFileName: "",
};

const inputClass =
  "focus-ring mt-2 min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2.5 text-sm text-[var(--text)] outline-none";

function readDraft(): Draft {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    if (saved && typeof saved === "object") {
      const obj = saved as Record<string, unknown>;
      return {
        name: typeof obj.name === "string" ? obj.name : "",
        area: typeof obj.area === "string" ? obj.area : "",
        location: typeof obj.location === "string" ? obj.location : "",
        manager: typeof obj.manager === "string" ? obj.manager : "",
        donor: typeof obj.donor === "string" ? obj.donor : "",
        budget: typeof obj.budget === "string" ? obj.budget : "",
        start: typeof obj.start === "string" ? obj.start : "",
        end: typeof obj.end === "string" ? obj.end : "",
        objective: typeof obj.objective === "string" ? obj.objective : "",
        trancheCount: typeof obj.trancheCount === "string" ? obj.trancheCount : "",
        tranches: Array.isArray(obj.tranches) ? (obj.tranches as TrancheConfig[]) : [],
        workOrderFileName: typeof obj.workOrderFileName === "string" ? obj.workOrderFileName : "",
      };
    }
  } catch { /* Storage may be unavailable */ }
  return { ...emptyDraft };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-[var(--text-muted)]">{label}{children}</label>;
}

function totalPct(tranches: TrancheConfig[]) {
  return tranches.reduce((sum, t) => sum + (Number(t.percentage) || 0), 0);
}

export function ProjectOnboarding({ areas }: { areas: string[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(readDraft);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const formId = useId();

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setNotice("");
    setError("");
  };

  const close = () => { setOpen(false); trigger.current?.focus(); };

  /** When tranche count changes, rebuild the tranches array to match */
  const handleTrancheCountChange = (countStr: string) => {
    const count = parseInt(countStr, 10);
    update("trancheCount", countStr);
    if (isNaN(count) || count < 1 || count > 10) {
      update("tranches", []);
      return;
    }
    const existing = draft.tranches.slice(0, count);
    const toAdd = count - existing.length;
    const nextTranches = [
      ...existing,
      ...Array.from({ length: Math.max(0, toAdd) }, emptyTranche),
    ];
    update("tranches", nextTranches);
  };

  const updateTranche = (id: string, field: keyof Omit<TrancheConfig, "id">, value: string | number) => {
    update(
      "tranches",
      draft.tranches.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const pctTotal = totalPct(draft.tranches);
  const pctValid = draft.tranches.length === 0 || Math.abs(pctTotal - 100) < 0.01;

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--module-bg)] px-4 text-xs font-semibold text-[var(--brand-primary)] shadow-[var(--shadow-card)] transition hover:bg-[var(--surface-soft)]"
      >
        <FolderPlus size={16} aria-hidden="true" /> Project onboarding
      </button>

      <Overlay
        open={open}
        onClose={close}
        variant="panel"
        size="lg"
        title="Onboard a project"
        label="Project onboarding"
        description="Bring the essentials together before your project gets underway."
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={close} className="focus-ring rounded-xl px-4 py-3 text-xs font-medium text-[var(--text-muted)]">
              Close
            </button>
            <button type="submit" form={formId} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--brand-primary)] bg-[var(--surface-soft)] px-5 py-3 text-xs font-semibold text-[var(--brand-primary)]">
              <Save size={15} aria-hidden="true" /> Save onboarding draft
            </button>
          </div>
        }
      >
        <form
          id={formId}
          className="space-y-7 p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.name.trim()) { setError("Enter a project name to save your draft."); return; }
            if (draft.start && draft.end && draft.end < draft.start) { setError("The end date must be on or after the start date."); return; }
            if (!pctValid) { setError(`Tranche percentages must total exactly 100%. Currently at ${pctTotal}%.`); return; }
            try {
              localStorage.setItem(storageKey, JSON.stringify(draft));
              setNotice("Onboarding draft saved. You can close this panel and continue later.");
              setError("");
            } catch { setError("Your browser could not save this draft. Keep this panel open and try again."); }
          }}
        >
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--text-muted)]">
            Start with a project name and add details as they become available. Drafts are saved only in this browser; saving does not publish a project to the portfolio.
          </div>

          {/* 01 · Project essentials */}
          <fieldset className="space-y-4">
            <legend className="mb-4 text-sm font-semibold text-[var(--text)]">01 · Project essentials</legend>
            <Field label="Project name *">
              <input required maxLength={160} value={draft.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Rural Skills Initiative" className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Thematic area">
                <select value={draft.area} onChange={(e) => update("area", e.target.value)} className={inputClass}>
                  <option value="">Select an area</option>
                  {[...new Set([...areas, ...(draft.area ? [draft.area] : [])])].map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </Field>
              <Field label="Location">
                <input value={draft.location} onChange={(e) => update("location", e.target.value)} placeholder="District, state" className={inputClass} />
              </Field>
            </div>
            <Field label="Project objective">
              <textarea rows={3} maxLength={2000} value={draft.objective} onChange={(e) => update("objective", e.target.value)} placeholder="What will this project achieve, and who will it support?" className={inputClass + " resize-y"} />
            </Field>
          </fieldset>

          {/* 02 · Ownership & timeline */}
          <fieldset className="space-y-4 border-t border-[var(--border)] pt-5">
            <legend className="pr-3 text-sm font-semibold text-[var(--text)]">02 · Ownership &amp; timeline</legend>
            <Field label="Project manager">
              <input value={draft.manager} onChange={(e) => update("manager", e.target.value)} placeholder="Name of the responsible manager" className={inputClass} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date">
                <input type="date" value={draft.start} onChange={(e) => update("start", e.target.value)} className={inputClass} />
              </Field>
              <Field label="End date">
                <input type="date" min={draft.start || undefined} value={draft.end} onChange={(e) => update("end", e.target.value)} className={inputClass} />
              </Field>
            </div>
          </fieldset>

          {/* 03 · Funding */}
          <fieldset className="border-t border-[var(--border)] pt-5">
            <legend className="pr-3 text-sm font-semibold text-[var(--text)]">03 · Funding</legend>
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <Field label="Donor / funding partner">
                <input value={draft.donor} onChange={(e) => update("donor", e.target.value)} placeholder="Organisation name" className={inputClass} />
              </Field>
              <Field label="Proposed budget (INR)">
                <input type="number" min="0" step="0.01" value={draft.budget} onChange={(e) => update("budget", e.target.value)} placeholder="0.00" className={inputClass} />
              </Field>
            </div>
          </fieldset>

          {/* 04 · Work Order */}
          <fieldset className="border-t border-[var(--border)] pt-5">
            <legend className="pr-3 text-sm font-semibold text-[var(--text)]">04 · Work Order</legend>
            <div className="mt-4">
              <p className="text-xs text-[var(--text-muted)] mb-3">Upload the signed work order or MoU document for this project (PDF, JPG, PNG).</p>
              <label className="focus-ring flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--brand-primary)]">
                <Upload size={18} className="text-[var(--brand-primary)] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {draft.workOrderFileName || "Click to upload work order"}
                  </p>
                  <p className="text-[10px] text-[var(--text-subtle)] mt-0.5">PDF, JPG, PNG · up to 20 MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 20 * 1024 * 1024) { setError("Work order file must be under 20 MB."); return; }
                    update("workOrderFileName", file.name);
                    setError("");
                  }}
                />
              </label>
              {draft.workOrderFileName && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  <p className="text-xs text-[var(--text)] truncate">{draft.workOrderFileName}</p>
                  <button
                    type="button"
                    onClick={() => update("workOrderFileName", "")}
                    className="focus-ring rounded-lg p-1 text-[var(--text-muted)] hover:text-red-500"
                    aria-label="Remove work order"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </fieldset>

          {/* 05 · Payment Tranches */}
          <fieldset className="border-t border-[var(--border)] pt-5">
            <legend className="pr-3 text-sm font-semibold text-[var(--text)]">05 · Payment Tranches</legend>
            <div className="mt-4 space-y-4">
              <Field label="Number of payment tranches">
                <select
                  value={draft.trancheCount}
                  onChange={(e) => handleTrancheCountChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select number of tranches</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>{n} tranche{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </Field>

              {draft.tranches.length > 0 && (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-3 leading-5">
                      Set the percentage and tentative invoice date for each tranche. Percentages must total 100%.
                      <span className="ml-2 font-semibold text-[var(--text)]">
                        Each tranche is split: <span className="text-emerald-600">50% Corpus</span> + <span className="text-blue-600">50% Operations</span>.
                      </span>
                    </p>

                    {/* Tranche split info */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3">
                        <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Corpus allocation (50%)</p>
                        <p className="mt-1 text-lg font-bold text-emerald-600">
                          {draft.budget
                            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(parseFloat(draft.budget) * 0.5)
                            : "—"}
                        </p>
                        <p className="mt-0.5 text-[9px] text-emerald-600/70">From total project budget</p>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-3">
                        <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">Operations allocation (50%)</p>
                        <p className="mt-1 text-lg font-bold text-blue-600">
                          {draft.budget
                            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(parseFloat(draft.budget) * 0.5)
                            : "—"}
                        </p>
                        <p className="mt-0.5 text-[9px] text-blue-600/70">From total project budget</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {draft.tranches.map((tranche, index) => {
                        const pct = Number(tranche.percentage) || 0;
                        const budgetVal = parseFloat(draft.budget) || 0;
                        const trancheVal = budgetVal * (pct / 100);
                        const corpusVal = trancheVal * 0.5;
                        const opsVal = trancheVal * 0.5;
                        const formatINR = (val: number) =>
                          val > 0
                            ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)
                            : "—";

                        return (
                          <div key={tranche.id} className="rounded-xl border border-[var(--border)] bg-[var(--module-bg)] p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="grid size-6 place-items-center rounded-full bg-[var(--finance-accent-soft)] text-[10px] font-bold text-[var(--finance-accent)]">
                                {index + 1}
                              </span>
                              <h4 className="text-xs font-semibold text-[var(--text)]">Tranche {index + 1}</h4>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <Field label="Percentage of total (%)">
                                <input
                                  type="number"
                                  min="0.01"
                                  max="100"
                                  step="0.01"
                                  value={tranche.percentage || ""}
                                  onChange={(e) => updateTranche(tranche.id, "percentage", parseFloat(e.target.value) || 0)}
                                  placeholder="e.g. 25"
                                  className={inputClass}
                                />
                              </Field>
                              <Field label="Tentative invoice date">
                                <div className="relative">
                                  <input
                                    type="date"
                                    value={tranche.tentativeDate}
                                    onChange={(e) => updateTranche(tranche.id, "tentativeDate", e.target.value)}
                                    className={inputClass}
                                  />
                                  <Calendar size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                                </div>
                              </Field>
                            </div>
                            {(pct > 0 || budgetVal > 0) && (
                              <div className="mt-3 grid grid-cols-3 gap-2">
                                <div className="rounded-lg bg-[var(--surface-soft)] p-2 text-center">
                                  <p className="text-[9px] text-[var(--text-subtle)]">Tranche value</p>
                                  <p className="text-xs font-bold text-[var(--text)]">{formatINR(trancheVal)}</p>
                                </div>
                                <div className="rounded-lg bg-emerald-500/[0.06] p-2 text-center">
                                  <p className="text-[9px] text-emerald-600">Corpus (50%)</p>
                                  <p className="text-xs font-bold text-emerald-600">{formatINR(corpusVal)}</p>
                                </div>
                                <div className="rounded-lg bg-blue-500/[0.06] p-2 text-center">
                                  <p className="text-[9px] text-blue-600">Operations (50%)</p>
                                  <p className="text-xs font-bold text-blue-600">{formatINR(opsVal)}</p>
                                </div>
                              </div>
                            )}
                            {tranche.tentativeDate && (
                              <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                                <AlertCircle size={11} className="text-amber-500 shrink-0" />
                                <span>Alert will be raised if invoice is not submitted by {tranche.tentativeDate}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Percentage total indicator */}
                    <div className={`mt-3 flex items-center justify-between rounded-xl border px-4 py-3 ${pctValid ? "border-emerald-500/30 bg-emerald-500/[0.05]" : "border-red-500/30 bg-red-500/[0.05]"}`}>
                      <span className="text-xs font-medium text-[var(--text-muted)]">Total percentage allocated</span>
                      <span className={`text-sm font-bold ${pctValid ? "text-emerald-600" : "text-red-600"}`}>
                        {pctTotal.toFixed(1)}% {pctValid ? "✓" : `(must be 100%)`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </fieldset>

          {notice && (
            <p role="status" className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text)]">
              <CheckCircle2 size={18} className="shrink-0" />{notice}
            </p>
          )}
          {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
        </form>
      </Overlay>
    </>
  );
}
