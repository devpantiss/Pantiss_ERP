import { CheckCircle2, ChevronDown, Clock3, Download, Search, Send, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { employeeStatuses } from "./data";
import { cn } from "../../utils/cn";

const statusStyles = {
  Submitted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "In review": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Pending: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function EmployeeStatusView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const visibleEmployees = employeeStatuses;
  const filtered = useMemo(() => visibleEmployees.filter((employee) => {
    const matchesStatus = status === "All statuses" || employee.status === status;
    const search = query.trim().toLowerCase();
    return matchesStatus && (!search || `${employee.name} ${employee.role} ${employee.unit}`.toLowerCase().includes(search));
  }), [query, status, visibleEmployees]);
  const completion = Math.round(visibleEmployees.reduce((sum, employee) => sum + employee.completed, 0) / visibleEmployees.reduce((sum, employee) => sum + employee.planned, 0) * 100);
  const submittedCount = visibleEmployees.filter((employee) => employee.status === "Submitted").length;
  const pendingCount = visibleEmployees.filter((employee) => employee.status !== "Submitted").length;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(150px,.55fr))]">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-red-700 to-rose-500 p-6 text-white shadow-[0_20px_55px_rgba(220,38,38,.16)]"><div className="absolute -right-10 -top-12 size-40 rounded-full border border-white/15" /><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">July 2026 M&E cycle</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">Employee monthly status report</h2><p className="mt-2 max-w-lg text-xs leading-5 text-white/65">Track monitoring work plans, field verification days and evidence-submission compliance across Pantiss programme teams.</p></div>
        {[{ label: "Reporting officers", value: String(visibleEmployees.length), note: "Across 7 thematic areas", icon: UsersRound }, { label: "M&E reports submitted", value: String(submittedCount), note: `${Math.round(submittedCount / visibleEmployees.length * 100)}% reporting compliance`, icon: CheckCircle2 }, { label: "Pending validation", value: String(pendingCount), note: pendingCount ? "Evidence review due in 2 days" : "All evidence validated", icon: Clock3 }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]"><span className="grid size-9 place-items-center rounded-xl bg-red-500/10 text-red-500"><Icon size={17} /></span><p className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text)]">{item.value}</p><p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{item.label}</p><p className="mt-2 text-[9px] text-[var(--text-subtle)]">{item.note}</p></div>; })}
      </section>

      <section className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6"><div><h3 className="text-base font-semibold text-[var(--text)]">Monthly M&E submissions</h3><p className="mt-1 text-xs text-[var(--text-subtle)]">Review field monitoring delivery and supporting evidence status</p></div><div className="flex flex-wrap gap-2"><label className="relative min-w-0 flex-1 sm:w-52 sm:flex-none"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reporting officers" className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none" /></label><label className="relative"><select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring h-10 appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-3 pr-8 text-xs text-[var(--text-muted)] outline-none"><option>All statuses</option><option>Submitted</option><option>In review</option><option>Pending</option></select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" /></label><button type="button" className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"><Download size={14} />Export</button></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead><tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-[0.12em] text-[var(--text-subtle)]"><th className="px-6 py-4 font-semibold">Reporting officer</th><th className="px-5 py-4 font-semibold">Thematic area</th><th className="px-5 py-4 font-semibold">M&E activities</th><th className="px-5 py-4 font-semibold">Field verification</th><th className="px-5 py-4 font-semibold">Evidence status</th><th className="px-6 py-4 text-right font-semibold">Action</th></tr></thead>
            <tbody>{filtered.map((employee) => { const percent = Math.round(employee.completed / employee.planned * 100); return <tr key={employee.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-soft)]"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-500/10 text-[10px] font-semibold text-red-600 dark:text-red-400">{employee.initials}</span><span><span className="block text-xs font-semibold text-[var(--text)]">{employee.name}</span><span className="mt-0.5 block text-[9px] text-[var(--text-subtle)]">{employee.role} · {employee.id}</span></span></div></td><td className="px-5 py-4 text-xs text-[var(--text-muted)]">{employee.unit}</td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400" style={{ width: `${percent}%` }} /></div><span className="text-[10px] font-semibold text-[var(--text-muted)]">{employee.completed}/{employee.planned}</span></div></td><td className="px-5 py-4 text-xs font-medium text-[var(--text)]">{employee.fieldDays} days</td><td className="px-5 py-4"><span className={cn("rounded-full px-2.5 py-1 text-[9px] font-semibold", statusStyles[employee.status])}>{employee.status}</span></td><td className="px-6 py-4 text-right"><button type="button" className="focus-ring rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-500/10 dark:text-red-400">Review</button></td></tr>; })}</tbody>
          </table>
          {filtered.length === 0 && <div className="py-16 text-center text-xs text-[var(--text-subtle)]">No employee reports match your filters.</div>}
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div className="flex items-center gap-3"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${completion}%` }} /></div><span className="text-[10px] text-[var(--text-subtle)]">Monthly M&E activity completion: <strong className="text-[var(--text)]">{completion}%</strong></span></div><button type="button" className="focus-ring inline-flex h-9 w-fit items-center gap-2 rounded-xl bg-red-600 px-3 text-[10px] font-semibold text-white hover:bg-red-700"><Send size={13} />Send evidence reminders</button></div>
      </section>
    </div>
  );
}
