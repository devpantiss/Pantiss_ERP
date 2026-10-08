import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderKanban,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { financeAreas, type FinanceProject } from "./data";
import { getProjectTranches, readTranches, writeTranches, type ProjectTranche, type TrancheMap } from "./trancheStore";
import { useSearchParams } from "react-router-dom";
import { downloadClientInvoice, invoiceMoney, invoiceTotal, validateInvoice, type ClientInvoice } from "./clientInvoiceData";
import { Overlay } from "../../components/ui/Overlay";
import "./auditTrail.css";

const storageKey = "pantiss-client-invoices-v1";
const input = "focus-ring mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-sm text-[var(--text)]";
const btn = "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-medium text-[var(--text)] disabled:opacity-50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-[var(--text-muted)]">{label}{children}</label>;
}

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function seedInvoices(): ClientInvoice[] {
  const mk = (
    n: number, projectId: string, projectName: string, client: string, domain: string,
    description: string, quantity: number, rate: number, issued: number, due: number,
    status: ClientInvoice["status"],
  ): ClientInvoice => ({
    id: `seed-inv-${n}`,
    number: `INV-2026-${String(n).padStart(4, "0")}`,
    projectId, projectName, client,
    email: `accounts@${domain}`,
    address: `${client}, Corporate Office, Mumbai, Maharashtra 400001`,
    issuedOn: isoOffset(issued), dueOn: isoOffset(due),
    lines: [{ id: `seed-line-${n}`, description, quantity, rate }],
    notes: "Tranche payment as per project agreement.",
    status,
    ...(status !== "Draft" ? { raisedAt: new Date(Date.now() + issued * 86400000).toISOString() } : {}),
    ...(status === "Admin Verified" ? { adminVerifiedAt: new Date(Date.now() + (issued + 2) * 86400000).toISOString() } : {}),
  });
  return [
    mk(1, "FIN-SKI-01", "Skill Development Project 1", "Tata Trusts", "tatatrusts.org", "Tranche 1 – Skilling cohort onboarding", 1, 1250000, -45, -15, "Admin Verified"),
    mk(2, "FIN-HEA-01", "Health Project 1", "HDFC Parivartan", "hdfcbank.com", "Tranche 2 – Mobile health camps", 1, 840000, -30, -3, "Raised"),
    mk(3, "FIN-LIV-01", "Livelihood Project 1", "Infosys Foundation", "infosys.org", "Tranche 1 – Livelihood enablement", 1, 960000, -10, 5, "Raised"),
    mk(4, "FIN-NUT-01", "Nutrition Project 1", "Reliance Foundation", "reliancefoundation.org", "Tranche 3 – Nutrition kits distribution", 1, 540000, -8, 9, "Raised"),
    mk(5, "FIN-SAN-01", "Sanitation Project 1", "Wipro Cares", "wipro.com", "Tranche 2 – WASH infrastructure", 1, 720000, -20, -8, "Admin Verified"),
    mk(6, "FIN-CLI-01", "Climate Change Project 1", "Mahindra CSR", "mahindra.com", "Tranche 1 – Climate resilience pilots", 1, 680000, -2, 21, "Draft"),
    mk(7, "FIN-ENT-01", "Entrepreneurship Project 1", "Axis Foundation", "axisbank.com", "Tranche 2 – Incubation support", 1, 450000, 0, 14, "Draft"),
    mk(8, "FIN-RES-01", "Research & Analytics Project 1", "Azim Premji Foundation", "azimpremjifoundation.org", "Tranche 1 – Baseline study", 1, 390000, -14, 12, "Raised"),
  ];
}

function readInvoices() {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === null || stored === "[]") {
      const seeded = seedInvoices();
      localStorage.setItem(storageKey, JSON.stringify(seeded));
      return { invoices: seeded, error: "" };
    }
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((item) => validateInvoice(item) && ["Draft", "Raised", "Admin Verified"].includes(item.status))) throw new Error();
    return { invoices: parsed as ClientInvoice[], error: "" };
  } catch {
    return { invoices: [] as ClientInvoice[], error: "Saved invoices could not be loaded. Reload before making changes." };
  }
}

function newInvoice(projectId: string, projectName: string): ClientInvoice {
  const now = new Date();
  const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    number: `INV-${date.replaceAll("-", "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    projectId,
    projectName,
    client: "",
    email: "",
    address: "",
    issuedOn: date,
    dueOn: date,
    lines: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }],
    notes: "",
    status: "Draft",
  };
}

// Days until due date
function daysUntilDue(dueOn: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueOn);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function InvoicesView() {
  const [params, setParams] = useSearchParams();
  const area = financeAreas.find((item) => item.id === params.get("area"));
  const project = area?.projects.find((item) => item.id === params.get("project"));

  const navigate = (areaId?: string, projectId?: string) =>
    setParams({
      ...(areaId ? { area: areaId } : {}),
      ...(projectId ? { project: projectId } : {}),
    });

  const [initial] = useState(readInvoices);
  const [invoices, setInvoices] = useState(initial.invoices);
  const [error, setError] = useState(initial.error);

  const metricInvoices = invoices.filter((invoice) =>
    project ? invoice.projectId === project.id : area ? area.projects.some((item) => item.id === invoice.projectId) : true
  );
  const raisedInvoices = metricInvoices.filter((invoice) => invoice.status !== "Draft");
  const metricScope = project?.name ?? area?.name ?? "All thematic areas";
  const metrics = [
    { label: "Draft invoices", value: metricInvoices.filter((invoice) => invoice.status === "Draft").length, icon: FileText },
    { label: "Awaiting verification", value: metricInvoices.filter((invoice) => invoice.status === "Raised").length, icon: Clock },
    { label: "Admin verified", value: metricInvoices.filter((invoice) => invoice.status === "Admin Verified").length, icon: ShieldCheck },
    { label: "Total raised value", value: invoiceMoney(raisedInvoices.reduce((sum, invoice) => sum + invoiceTotal(invoice.lines), 0)), icon: CheckCircle2 },
  ];

  const save = (invoice: ClientInvoice) => {
    if (initial.error) return false;
    if (!validateInvoice(invoice)) {
      setError("Complete client details, valid line items and a due date on or after the issue date.");
      return false;
    }
    try {
      const current = readInvoices();
      if (current.error) throw new Error();
      if (current.invoices.some((item) => item.id !== invoice.id && item.number.toLowerCase() === invoice.number.toLowerCase())) {
        setError("This invoice number already exists. Choose another number.");
        return false;
      }
      const existing = current.invoices.find((item) => item.id === invoice.id);
      if (existing?.status === "Admin Verified") {
        setError("This invoice has been admin verified and cannot be modified.");
        return false;
      }
      const next = [invoice, ...current.invoices.filter((item) => item.id !== invoice.id)];
      localStorage.setItem(storageKey, JSON.stringify(next));
      setInvoices(next);
      setError("");
      return true;
    } catch {
      setError("Invoice could not be saved. Check browser storage and try again.");
      return false;
    }
  };

  return (
    <div className="finance-audit space-y-6">
      <header>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Client Invoices</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Select a thematic area and project to review tranche amounts, tentative dates and approval status before raising an invoice.
        </p>
      </header>

      <section aria-label={`Invoice metrics · ${metricScope}`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--finance-accent-soft)] text-[var(--finance-accent)]"><Icon size={17} aria-hidden="true" /></span>
            </div>
            <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-[var(--text)]">{value}</p>
            <p className="mt-2 text-xs text-[var(--text-subtle)]">{metricScope}</p>
          </article>
        ))}
      </section>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Invoice location" className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <button type="button" onClick={() => navigate()} className="focus-ring rounded-lg px-2 py-3">
          Thematic areas
        </button>
        {area && (
          <>
            <ChevronRight size={14} />
            <button type="button" onClick={() => navigate(area.id)} className="focus-ring rounded-lg px-2 py-3">
              {area.name}
            </button>
          </>
        )}
        {project && (
          <>
            <ChevronRight size={14} />
            <span aria-current="page" className="text-[var(--text)]">
              {project.name}
            </span>
          </>
        )}
      </nav>

      {/* Project Selector or Invoice View */}
      {!project ? (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-[var(--text)]">
            {area ? "Select a project" : "Select a thematic area"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(area ? area.projects : financeAreas).map((item) => {
              const projectInvoices = invoices.filter((i) => i.projectId === ("projects" in item ? undefined : item.id));
              const raised = projectInvoices.filter((i) => i.status === "Raised" || i.status === "Admin Verified").length;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => (area ? navigate(area.id, item.id) : navigate(item.id))}
                  className="focus-ring flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-6 text-left transition-colors hover:border-[var(--finance-accent-border)]"
                >
                  <FolderKanban size={22} className="shrink-0 text-[var(--finance-accent)]" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-[var(--text)]">{item.name}</span>
                    <span className="mt-2 block text-xs text-[var(--text-muted)]">
                      {"projects" in item
                        ? `${item.projects.length} projects`
                        : raised
                        ? `${raised} raised invoice${raised !== 1 ? "s" : ""}`
                        : "No invoices yet"}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <ProjectClientInvoices
          key={project.id}
          project={project}
          projectIndex={area!.projects.indexOf(project)}
          projectId={project.id}
          projectName={project.name}
          invoices={invoices}
          error={error}
          onSave={save}
          onSetError={setError}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROJECT-LEVEL CLIENT INVOICES
───────────────────────────────────────────────────────────────────────────── */
function ProjectClientInvoices({
  project,
  projectIndex,
  projectId,
  projectName,
  invoices,
  error,
  onSave,
  onSetError,
}: {
  project: FinanceProject;
  projectIndex: number;
  projectId: string;
  projectName: string;
  invoices: ClientInvoice[];
  error: string;
  onSave: (invoice: ClientInvoice) => boolean;
  onSetError: (error: string) => void;
}) {
  const [draft, setDraft] = useState<ClientInvoice | null>(null);
  const [selected, setSelected] = useState<ClientInvoice | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [trancheMap, setTrancheMap] = useState<TrancheMap>(readTranches);
  const tranches = getProjectTranches(trancheMap, project, projectIndex);

  const updateTranche = (no: number, patch: Partial<ProjectTranche>) => {
    const next = { ...trancheMap, [projectId]: tranches.map((t) => (t.no === no ? { ...t, ...patch } : t)) };
    setTrancheMap(next);
    try { writeTranches(next); } catch { onSetError("Tranche status could not be saved."); }
  };

  const approveTranche = (tranche: ProjectTranche) =>
    updateTranche(tranche.no, { adminApproved: true, adminApprovedAt: new Date().toISOString() });

  const raiseTrancheInvoice = (tranche: ProjectTranche) => {
    if (!tranche.adminApproved || tranche.invoiceId) return;
    const base = newInvoice(projectId, projectName);
    const due = new Date();
    due.setDate(due.getDate() + 30);
    const slug = project.donor.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const amount = Math.round(project.approved * 100000 * tranche.percentage) / 100;
    const invoice: ClientInvoice = {
      ...base,
      client: project.donor,
      email: `accounts@${slug}.org`,
      address: `${project.donor}, ${project.location}, India`,
      dueOn: new Date(due.getTime() - due.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
      lines: [{ id: crypto.randomUUID(), description: `Tranche ${tranche.no} (${tranche.percentage}%) – ${projectName}`, quantity: 1, rate: amount }],
      notes: "Tranche payment as per project agreement.",
      status: "Raised",
      raisedAt: new Date().toISOString(),
    };
    if (onSave(invoice)) updateTranche(tranche.no, { invoiceId: invoice.id });
  };

  const scoped = invoices.filter((invoice) => invoice.projectId === projectId);
  const visible = scoped.filter(
    (invoice) =>
      (statusFilter === "all" || invoice.status === statusFilter) &&
      `${invoice.number} ${invoice.client}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (draft && onSave(draft)) {
      setSelected(draft);
      setDraft(null);
    }
  };

  const download = async (invoice: ClientInvoice) => {
    setBusy(true);
    try {
      await downloadClientInvoice(invoice);
    } catch {
      onSetError("Could not create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleAdminVerify = (invoice: ClientInvoice) => {
    const verified: ClientInvoice = { ...invoice, status: "Admin Verified", adminVerifiedAt: new Date().toISOString() };
    if (onSave(verified)) setSelected(verified);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-6">
        <div>
          <h3 className="text-xl font-semibold text-[var(--text)]">{projectName}</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{project.donor} · Review the tranche schedule and raise invoices as approvals come through.</p>
        </div>
        <button
          type="button"
          onClick={() => { onSetError(""); setDraft(newInvoice(projectId, projectName)); }}
          className={btn}
        >
          <Plus size={16} /> Create invoice
        </button>
      </section>

      {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}

      {/* Tranche schedule */}
      <section aria-label="Tranche schedule" className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)]">Tranche-wise invoicing</h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{project.donor} · {tranches.length} tranches · An invoice can be raised only after super admin approval.</p>
          </div>
        </div>
        <div className="mt-4 divide-y divide-[var(--border)]">
          {tranches.map((tranche) => {
            const amount = Math.round(project.approved * 100000 * tranche.percentage) / 100;
            const invoice = tranche.invoiceId ? invoices.find((i) => i.id === tranche.invoiceId) : undefined;
            const raised = Boolean(invoice && invoice.status !== "Draft");
            const overdue = !raised && daysUntilDue(tranche.tentativeDate) < 0;
            return (
              <div key={tranche.no} className="grid items-center gap-4 py-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.2fr]">
                <div className="min-w-[10rem]">
                  <p className="text-sm font-semibold text-[var(--text)]">Tranche {tranche.no} · {tranche.percentage}%</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--text)]">{invoiceMoney(amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Tentative invoice date</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-[var(--text)]"><Calendar size={14} aria-hidden="true" /><time dateTime={tranche.tentativeDate}>{new Date(`${tranche.tentativeDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time></p>
                  {overdue && <p className="mt-1 text-xs text-[var(--audit-warning)]">Past tentative date · Invoice pending</p>}
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    tranche.adminApproved ? "bg-[var(--finance-accent-soft)] text-[var(--finance-accent)]" : "bg-[var(--surface-soft)] text-[var(--audit-warning)]"
                  }`}
                >
                  {tranche.adminApproved ? <ShieldCheck size={11} /> : <Clock size={11} />}
                  {tranche.adminApproved ? "Admin approved" : "Awaiting admin approval"}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {!tranche.adminApproved && (
                    <button type="button" onClick={() => approveTranche(tranche)} className={btn}>
                      <ShieldCheck size={14} /> Approve (Super Admin)
                    </button>
                  )}
                  {raised && invoice ? (
                    <button type="button" onClick={() => setSelected(invoice)} className={btn}>
                      <CheckCircle2 size={14} /> Raised · {invoice.number}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!tranche.adminApproved}
                      title={tranche.adminApproved ? "Raise invoice for this tranche" : "Requires super admin approval"}
                      onClick={() => raiseTrancheInvoice(tranche)}
                      className={`${btn} ${tranche.adminApproved ? "bg-[var(--finance-accent-soft)]" : "cursor-not-allowed"}`}
                    >
                      <FileText size={14} /> Raise invoice
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Invoice list */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5">
        <div className="flex flex-wrap gap-3">
          <input
            aria-label="Search client invoices"
            type="search"
            placeholder="Search invoice or client"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${input} mt-0 sm:max-w-sm`}
          />
          <select
            aria-label="Invoice status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${input} mt-0 sm:w-auto`}
          >
            <option value="all">All statuses</option>
            <option>Draft</option>
            <option>Raised</option>
            <option value="Admin Verified">Admin Verified</option>
          </select>
        </div>

        <div className="mt-5 divide-y divide-[var(--border)]">
          {visible.map((invoice) => {
            const days = daysUntilDue(invoice.dueOn);
            const isOverdue = invoice.status === "Raised" && days < 0;
            const isUrgent = invoice.status === "Raised" && days <= 3 && !isOverdue;
            return (
              <button
                type="button"
                key={invoice.id}
                onClick={() => setSelected(invoice)}
                className="focus-ring flex w-full flex-wrap items-center justify-between gap-4 rounded-lg py-5 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold text-[var(--text)]">{invoice.client || "—"}</span>
                  <span className="mt-1 block text-xs text-[var(--text-muted)]">
                    {invoice.number} · Due {invoice.dueOn}
                    {isOverdue && <span className="ml-2 text-red-500 font-semibold">({Math.abs(days)}d overdue)</span>}
                    {isUrgent && <span className="ml-2 text-amber-500 font-semibold">(Due in {days}d)</span>}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-right">
                  <span>
                    <span className="block text-sm font-semibold text-[var(--text)]">{invoiceMoney(invoiceTotal(invoice.lines))}</span>
                    <span className="mt-1 block text-xs text-[var(--finance-accent)]">{invoice.status} · View invoice</span>
                  </span>
                  {/* Admin Verified badge */}
                  {invoice.status === "Admin Verified" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                      <ShieldCheck size={10} /> Admin Verified
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {!visible.length && (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-[var(--text)]">{scoped.length ? "No matching invoices" : "No client invoices yet"}</p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {scoped.length ? "Change the search or status filter." : "Create the first invoice for this project."}
            </p>
          </div>
        )}
      </section>

      {/* Create / Edit Overlay */}
      {draft && (
        <Overlay
          open
          onClose={() => setDraft(null)}
          variant="panel"
          size="lg"
          title={invoices.some((item) => item.id === draft.id) ? "Edit draft invoice" : "Create client invoice"}
          description={projectName}
          footer={
            <button type="submit" form="client-invoice-form" className={btn}>
              Save draft & review
            </button>
          }
        >
          <form id="client-invoice-form" onSubmit={submit} className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice number">
                <input required maxLength={80} value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} className={input} />
              </Field>
              <Field label="Client / organization">
                <input required maxLength={180} value={draft.client} onChange={(e) => setDraft({ ...draft, client: e.target.value })} className={input} />
              </Field>
              <Field label="Client email">
                <input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={input} />
              </Field>
              <Field label="Issue date">
                <input required type="date" value={draft.issuedOn} onChange={(e) => setDraft({ ...draft, issuedOn: e.target.value })} className={input} />
              </Field>
              <Field label="Due date">
                <input required type="date" min={draft.issuedOn} value={draft.dueOn} onChange={(e) => setDraft({ ...draft, dueOn: e.target.value })} className={input} />
              </Field>
            </div>
            <Field label="Billing address">
              <textarea required rows={3} value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} className={input} />
            </Field>
            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-semibold text-[var(--text)]">Invoice items · INR</legend>
              {draft.lines.map((line, index) => (
                <div key={line.id} className="rounded-xl border border-[var(--border)] p-4">
                  <Field label={`Item ${index + 1} description`}>
                    <input required value={line.description} onChange={(e) => setDraft({ ...draft, lines: draft.lines.map((item) => (item.id === line.id ? { ...item, description: e.target.value } : item)) })} className={input} />
                  </Field>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(["quantity", "rate"] as const).map((field) => (
                      <Field key={field} label={field === "quantity" ? "Quantity" : "Unit rate (₹)"}>
                        <input type="number" required min="0.01" step="0.01" value={line[field] || ""} onChange={(e) => setDraft({ ...draft, lines: draft.lines.map((item) => (item.id === line.id ? { ...item, [field]: Number(e.target.value) } : item)) })} className={input} />
                      </Field>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-[var(--text)]">{invoiceMoney(invoiceTotal([line]))}</span>
                    <button type="button" disabled={draft.lines.length === 1} aria-label={`Remove item ${index + 1}`} onClick={() => setDraft({ ...draft, lines: draft.lines.filter((item) => item.id !== line.id) })} className={btn}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setDraft({ ...draft, lines: [...draft.lines, { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }] })} className={btn}>
                <Plus size={14} /> Add item
              </button>
            </fieldset>
            <Field label="Payment instructions / notes">
              <textarea rows={3} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className={input} />
            </Field>
            <p className="text-right text-xl font-semibold text-[var(--text)]">Total {invoiceMoney(invoiceTotal(draft.lines))}</p>
            {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
          </form>
        </Overlay>
      )}

      {/* View / Admin Verify Overlay */}
      {selected && !draft && (
        <Overlay
          open
          onClose={() => setSelected(null)}
          variant="panel"
          size="lg"
          title={selected.number}
          description={`${selected.status} · ${projectName}`}
          footer={
            <div className="flex flex-wrap gap-2 w-full items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={busy} onClick={() => download(selected)} className={btn}>
                  {busy ? "Generating…" : "Download PDF"}
                </button>
                {selected.status === "Draft" && (
                  <>
                    <button type="button" onClick={() => { setDraft(selected); setSelected(null); }} className={btn}>
                      Edit draft
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const raised: ClientInvoice = { ...selected, status: "Raised", raisedAt: new Date().toISOString() };
                        if (onSave(raised)) setSelected(raised);
                      }}
                      className={`${btn} bg-[var(--finance-accent-soft)]`}
                    >
                      Raise invoice
                    </button>
                  </>
                )}
                {selected.status === "Raised" && (
                  <button
                    type="button"
                    onClick={() => handleAdminVerify(selected)}
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <ShieldCheck size={14} /> Admin Verify (Super Admin)
                  </button>
                )}
              </div>
              {selected.status === "Admin Verified" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                  <ShieldCheck size={13} /> Admin Verified
                  {selected.adminVerifiedAt && <span className="text-emerald-500/70 text-[9px]">· {new Date(selected.adminVerifiedAt).toLocaleDateString("en-IN")}</span>}
                </span>
              )}
            </div>
          }
        >
          <div className="space-y-5 p-6">
            {/* Admin Verified Banner */}
            {selected.status === "Admin Verified" && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Super Admin Verified</p>
                  <p className="text-xs text-emerald-600/80">
                    This invoice has been reviewed and verified by a super admin.
                    {selected.adminVerifiedAt && ` Verified on ${new Date(selected.adminVerifiedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}.`}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">{selected.client}</h3>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{selected.email}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-muted)]">{selected.address}</p>
            </div>
            <p className="text-xs text-[var(--text-muted)]">Issued {selected.issuedOn} · Due {selected.dueOn}</p>

            {/* Due date alert */}
            {selected.status === "Raised" && (() => {
              const days = daysUntilDue(selected.dueOn);
              if (days < 0) return (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3">
                  <AlertTriangle size={14} className="text-red-600 shrink-0" />
                  <p className="text-xs text-red-700 dark:text-red-400">This invoice is <strong>{Math.abs(days)} days overdue.</strong> Follow up with the client immediately.</p>
                </div>
              );
              if (days <= 3) return (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3">
                  <AlertCircle size={14} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">This invoice is due in <strong>{days === 0 ? "today" : `${days} day${days !== 1 ? "s" : ""}`}.</strong> Please ensure payment is received on time.</p>
                </div>
              );
              return null;
            })()}

            <ul className="divide-y divide-[var(--border)]">
              {selected.lines.map((line) => (
                <li key={line.id} className="py-4">
                  <p className="text-sm text-[var(--text)]">{line.description}</p>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {line.quantity} × {invoiceMoney(line.rate)} = {invoiceMoney(invoiceTotal([line]))}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-xl font-semibold text-[var(--text)]">Total payable {invoiceMoney(invoiceTotal(selected.lines))}</p>
            <p className="whitespace-pre-wrap text-sm text-[var(--text-muted)]">{selected.notes}</p>
            <p className="text-xs leading-5 text-[var(--text-muted)]">
              {selected.status === "Draft"
                ? "Review the details before raising this invoice. Raised invoices cannot be edited."
                : selected.status === "Raised"
                ? "Invoice raised. Download the PDF to share with the client. Awaiting super admin verification."
                : "Invoice raised and verified by super admin. No further edits are possible."}
            </p>
            {error && <p role="alert" className="text-sm text-[var(--text)]">{error}</p>}
          </div>
        </Overlay>
      )}
    </div>
  );
}
