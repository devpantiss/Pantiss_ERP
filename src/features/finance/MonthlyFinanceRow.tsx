import { useState } from "react";
import { ArrowUpRight, FileText, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { type FinanceArea, formatCurrency } from "./data";
import { loadBooks } from "./booksStore";
import { getProjectTranches, readTranches } from "./trancheStore";

const cardClass = "flex min-w-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6";
const linkClass = "focus-ring mt-5 inline-flex min-h-10 items-center justify-between gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-medium text-[var(--brand-primary)] transition hover:bg-[var(--surface-soft)]";

export function MonthlyFinanceRow({ area }: { area: FinanceArea }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [books] = useState(loadBooks);
  const [tranches] = useState(readTranches);
  const scheduled = area.projects.flatMap((project, index) =>
    getProjectTranches(tranches, project, index)
      .filter(tranche => tranche.tentativeDate.startsWith(`${month}-`))
      .map(tranche => ({ ...tranche, amount: project.approved * tranche.percentage / 100 })),
  );
  const inflow = scheduled.reduce((sum, tranche) => sum + tranche.amount, 0);
  const entries = books.entries.filter(entry =>
    entry.date.startsWith(`${month}-`) && area.projects.some(project => project.id === entry.projectId),
  );
  const outflow = entries.reduce((sum, entry) => sum + entry.amount, 0) / 100000;
  const pending = scheduled.filter(tranche => !tranche.invoiceId);
  const ready = pending.filter(tranche => tranche.adminApproved).length;
  const pendingValue = pending.reduce((sum, tranche) => sum + tranche.amount, 0);
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <section aria-labelledby="monthly-finance-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 id="monthly-finance-heading" className="text-base font-semibold text-[var(--text)]">Monthly overview</h3>
          <p className="mt-1 text-xs text-[var(--text-subtle)]">Cashflow planning and upcoming billing for {area.name}.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          Month
          <input type="month" value={month} onChange={event => {
            if (/^\d{4}-\d{2}$/.test(event.target.value)) setMonth(event.target.value);
          }} className="focus-ring min-h-10 rounded-xl border border-[var(--border)] bg-[var(--module-bg)] px-3 text-[var(--text)] [color-scheme:light] dark:[color-scheme:dark]" />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2" aria-live="polite">
        <article className={cardClass}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--brand-primary)]"><WalletCards size={18} aria-hidden="true" /></span>
            <div><h4 className="text-sm font-semibold text-[var(--text)]">Monthly cashflow</h4><p className="mt-1 text-xs text-[var(--text-subtle)]">{monthLabel} · Forecast</p></div>
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-[var(--text)]">{books.error ? "Unavailable" : formatCurrency(inflow - outflow, true)}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Scheduled inflows less recorded expenditure</p>
          <dl className="my-5 grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface-soft)] p-4">
            {[{ label: "Scheduled inflows", value: formatCurrency(inflow, true) }, { label: "Recorded expenditure", value: books.error ? "Unavailable" : formatCurrency(outflow, true) }].map(item => (
              <div key={item.label}><dt className="text-xs text-[var(--text-muted)]">{item.label}</dt><dd className="mt-2 text-base font-semibold text-[var(--text)]">{item.value}</dd></div>
            ))}
          </dl>
          <p className="flex-1 text-xs leading-5 text-[var(--text-subtle)]">{books.error || "Inflows follow tentative tranche dates, not confirmed receipts. Expenditure includes only entries recorded in Books."}{!books.error && entries.length === 0 && " No expenditure recorded for this month."}</p>
          <Link to="/finance/books" className={linkClass}>View expenditure books<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </article>
        <article className={cardClass}>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--brand-primary)]"><FileText size={18} aria-hidden="true" /></span>
            <div><h4 className="text-sm font-semibold text-[var(--text)]">Invoices to be raised</h4><p className="mt-1 text-xs text-[var(--text-subtle)]">Tranches scheduled for {monthLabel}</p></div>
          </div>
          <p className="mt-5 text-3xl font-semibold tracking-tight text-[var(--text)]">{formatCurrency(pendingValue, true)}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{pending.length} {pending.length === 1 ? "tranche awaiting an invoice" : "tranches awaiting invoices"}</p>
          <dl className="my-5 grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface-soft)] p-4">
            {[{ label: "Ready to raise", value: ready }, { label: "Awaiting approval", value: pending.length - ready }].map(item => (
              <div key={item.label}><dt className="text-xs text-[var(--text-muted)]">{item.label}</dt><dd className="mt-2 text-base font-semibold text-[var(--text)]">{item.value}</dd></div>
            ))}
          </dl>
          <p className="flex-1 text-xs leading-5 text-[var(--text-subtle)]">{pending.length ? "Raise invoices against approved tranches. Tranches already linked to an invoice are excluded." : "No scheduled tranches are awaiting invoices this month."}</p>
          <Link to={`/finance/invoices?area=${area.id}`} className={linkClass}>Review area invoices<ArrowUpRight size={15} aria-hidden="true" /></Link>
        </article>
      </div>
    </section>
  );
}
