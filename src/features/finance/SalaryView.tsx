import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  Download,
  FileText,
  FolderKanban,
  Search,
  Send,
  ShieldCheck,
  Users,
  XCircle,
  AlertCircle
} from "lucide-react";
import { financeAreas } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";
import {
  payrollMonths,
  salaryDateLabel,
  salaryKey,
  salaryMoney,
  salaryMonthLabel,
  salaryTotals,
  canForwardSalary,
  salaryWorkflowLabel,
  type SalaryRecord
} from "./salaryData";
import { useAuth } from "../../hooks/useAuth";
import { useSalaryRecords } from "./useSalaryRecords";
import "./salary.css";

const surface = "rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] shadow-[var(--shadow-card)]";
const field = "focus-ring min-w-0 rounded-xl border border-[var(--border)] bg-[var(--module-bg)] px-3 py-2.5 text-xs text-[var(--text)]";
const action = "focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-xs font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]";

export function SalaryView() {
  const { records, error, forwardForPayment, forwardMultiple, approveSalary, rejectSalary } = useSalaryRecords();
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const area = financeAreas.find(item => item.id === params.get("area"));
  const project = area?.projects.find(item => item.id === params.get("project"));
  const month = payrollMonths.includes(params.get("month") ?? "") ? params.get("month")! : payrollMonths[0];
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "ready" | "forwarded" | "disbursed">("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const selected = records.find(record => salaryKey(record) === selectedKey);
  const areaProjectIds = new Set(area?.projects.map(item => item.id));
  const scopedRecords = records.filter(record => project ? record.projectId === project.id : area ? areaProjectIds.has(record.projectId) : true);
  const monthlyRecords = scopedRecords.filter(record => record.month === month);
  const totals = salaryTotals(monthlyRecords);

  // Status counts for the current scope & month
  const pendingApprovalCount = monthlyRecords.filter(r => r.approvalStatus === "Pending approval").length;
  const readyToForwardRecords = monthlyRecords.filter(r => canForwardSalary(r));
  const readyToForwardCount = readyToForwardRecords.length;
  const readyToForwardAmount = readyToForwardRecords.reduce((sum, r) => sum + r.netPay, 0);
  const forwardedCount = monthlyRecords.filter(r => r.forwardedAt && r.status !== "Disbursed").length;
  const disbursedCount = monthlyRecords.filter(r => r.status === "Disbursed").length;

  const visible = monthlyRecords.filter(record => {
    if (activeTab === "pending" && record.approvalStatus !== "Pending approval") return false;
    if (activeTab === "ready" && !canForwardSalary(record)) return false;
    if (activeTab === "forwarded" && (!record.forwardedAt || record.status === "Disbursed")) return false;
    if (activeTab === "disbursed" && record.status !== "Disbursed") return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return `${record.name} ${record.id} ${record.designation} ${record.department}`.toLowerCase().includes(q);
    }
    return true;
  });

  const navigateScope = (areaId?: string, projectId?: string, nextMonth = month) => {
    setParams({ month: nextMonth, ...(areaId ? { area: areaId } : {}), ...(projectId ? { project: projectId } : {}) });
    setQuery("");
    setActiveTab("all");
    setNotice(null);
  };

  const handleForwardSingle = (record: SalaryRecord) => {
    try {
      const actorName = user ? `${user.name} (${user.id})` : "Finance Manager";
      forwardForPayment(salaryKey(record), actorName);
      setNotice({
        message: `Salary for ${record.name} (${salaryMoney(record.netPay)}) has been forwarded to the Finance Payment Desk.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to forward salary.",
        type: "info"
      });
    }
  };

  const handleForwardAllApproved = () => {
    if (!readyToForwardRecords.length) return;
    try {
      const actorName = user ? `${user.name} (${user.id})` : "Finance Manager";
      const keys = readyToForwardRecords.map(r => salaryKey(r));
      forwardMultiple(keys, actorName);
      setNotice({
        message: `Successfully forwarded ${keys.length} approved salaries (${salaryMoney(readyToForwardAmount)}) to the Payment Desk.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to forward salaries.",
        type: "info"
      });
    }
  };

  const handleApproveSingle = (record: SalaryRecord) => {
    try {
      const approverName = user ? `${user.name} (${user.id})` : "Finance Approver";
      approveSalary(salaryKey(record), approverName);
      setNotice({
        message: `Salary for ${record.name} approved. It is now ready to be forwarded for payment.`,
        type: "success"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to approve salary.",
        type: "info"
      });
    }
  };

  const handleRejectSingle = (record: SalaryRecord) => {
    try {
      rejectSalary(salaryKey(record), "Rejected by Finance Review");
      setNotice({
        message: `Salary for ${record.name} placed on hold / rejected.`,
        type: "info"
      });
    } catch (err) {
      setNotice({
        message: err instanceof Error ? err.message : "Failed to reject salary.",
        type: "info"
      });
    }
  };

  return (
    <div className="salary-workspace space-y-6">
      <section className="salary-hero rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium opacity-80">
              <Coins size={15} /> Payroll &amp; Payment Authorizations
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Salary Approvals &amp; Payment Forwarding
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 opacity-80">
              Verify if monthly salaries are approved across projects, authorize pending requests, and forward them directly to the Finance Payment Desk for disbursement.
            </p>
          </div>
          <label className="flex flex-col gap-2 text-xs font-medium">
            Payroll month
            <select
              aria-label="Payroll month"
              value={month}
              onChange={event => navigateScope(area?.id, project?.id, event.target.value)}
              className={cn(field, "min-w-48")}
            >
              {payrollMonths.map(value => (
                <option key={value} value={value}>{salaryMonthLabel(value)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-xl border border-[var(--salary-warning)] p-4 text-sm text-[var(--text)]">
          {error}
        </p>
      )}

      {notice && (
        <div className={cn(
          "flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-medium animate-in fade-in duration-200",
          notice.type === "success"
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
        )}>
          <div className="flex items-center gap-2">
            {notice.type === "success" ? <CheckCircle2 size={16} className="shrink-0 text-emerald-600" /> : <AlertCircle size={16} className="shrink-0 text-amber-600" />}
            <span>{notice.message}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/finance/payments"
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Go to Payment Desk <ArrowUpRight size={13} />
            </Link>
            <button type="button" onClick={() => setNotice(null)} className="rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5">
              ✕
            </button>
          </div>
        </div>
      )}

      <nav aria-label="Salary location" className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
        <button type="button" aria-current={!area ? "page" : undefined} onClick={() => navigateScope()} className={action}>
          Thematic areas
        </button>
        {area && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <button type="button" aria-current={!project ? "page" : undefined} onClick={() => navigateScope(area.id)} className={action}>
              {area.name}
            </button>
          </>
        )}
        {project && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page" className="font-medium text-[var(--text)]">{project.name}</span>
          </>
        )}
      </nav>

      {/* Metrics Row */}
      <section aria-label={`${salaryMonthLabel(month)} salary summary`} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SalaryMetric
          label="Total Payroll"
          value={salaryMoney(totals.net)}
          detail={`${totals.employees} employees · Gross ${salaryMoney(totals.gross)}`}
          icon={<Coins size={17} />}
        />
        <SalaryMetric
          label="Pending Approval"
          value={String(pendingApprovalCount)}
          detail={pendingApprovalCount ? "Awaiting Finance review" : "All salaries approved"}
          icon={<Clock3 size={17} />}
        />
        <SalaryMetric
          label="Ready to Forward"
          value={String(readyToForwardCount)}
          detail={readyToForwardCount ? `${salaryMoney(readyToForwardAmount)} approved & ready` : "None waiting to forward"}
          icon={<Send size={17} />}
        />
        <SalaryMetric
          label="Disbursed / Paid"
          value={salaryMoney(totals.paid)}
          detail={`${totals.paidCount} of ${totals.employees} paid`}
          icon={<CheckCircle2 size={17} />}
        />
      </section>

      {!project ? (
        <section aria-labelledby="salary-scope-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 id="salary-scope-heading" className="text-lg font-semibold text-[var(--text)]">
                {area ? "Projects" : "Thematic areas"}
              </h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {area ? `Select a project in ${area.name} to view and forward employee salaries.` : "Select a thematic area to explore project payroll."}
              </p>
            </div>
            {area && (
              <button type="button" className={action} onClick={() => navigateScope()}>
                <ArrowLeft size={14} />All areas
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {area
              ? area.projects.map(item => (
                  <SalaryScopeCard
                    key={item.id}
                    title={item.name}
                    subtitle={item.location}
                    records={monthlyRecords.filter(record => record.projectId === item.id)}
                    icon={<FolderKanban size={20} />}
                    onClick={() => navigateScope(area.id, item.id)}
                  />
                ))
              : financeAreas.map(item => (
                  <SalaryScopeCard
                    key={item.id}
                    title={item.name}
                    subtitle={`${item.projects.length} projects`}
                    records={monthlyRecords.filter(record => item.projects.some(project => project.id === record.projectId))}
                    icon={<Building2 size={20} />}
                    onClick={() => navigateScope(item.id)}
                  />
                ))}
          </div>
        </section>
      ) : (
        <>
          {/* Main Employee Salary Register */}
          <section className={cn(surface, "overflow-hidden")} aria-labelledby="salary-register-heading">
            {/* Header with Title and Bulk Forward Action */}
            <div className="flex flex-col justify-between gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="salary-register-heading" className="text-lg font-semibold text-[var(--text)]">
                    Employee Salaries
                  </h3>
                  <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                    {project.name} · {salaryMonthLabel(month)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Verify approval status for each staff member and forward approved salaries to the payment desk.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {readyToForwardCount > 0 && (
                  <button
                    type="button"
                    onClick={handleForwardAllApproved}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
                  >
                    <Send size={14} />
                    Forward All Approved ({readyToForwardCount} · {salaryMoney(readyToForwardAmount)})
                  </button>
                )}

                <button
                  type="button"
                  disabled={!visible.length}
                  className={cn(action, "disabled:cursor-not-allowed disabled:opacity-40")}
                  onClick={() => downloadSalaryRegister(visible, project.name, month)}
                >
                  <Download size={14} /> Export CSV
                </button>
              </div>
            </div>

            {/* Workflow Filter Pills */}
            <div className="flex flex-wrap gap-2 border-y border-[var(--border)] bg-[var(--surface-soft)]/50 px-5 py-3 sm:px-6">
              {[
                { id: "all", label: `All Employees (${monthlyRecords.length})` },
                { id: "pending", label: `Pending Approval (${pendingApprovalCount})`, highlight: pendingApprovalCount > 0 },
                { id: "ready", label: `Ready to Forward (${readyToForwardCount})`, highlight: readyToForwardCount > 0 },
                { id: "forwarded", label: `Forwarded to Payments (${forwardedCount})` },
                { id: "disbursed", label: `Disbursed (${disbursedCount})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "focus-ring rounded-xl px-3 py-1.5 text-xs font-medium transition",
                    activeTab === tab.id
                      ? "bg-[var(--module-bg)] text-[var(--text)] shadow-sm border border-[var(--border)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-soft)]",
                    tab.highlight && activeTab !== tab.id && "text-amber-600 dark:text-amber-400 font-semibold"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="p-5 sm:px-6 sm:py-4">
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-[var(--text-muted)]">
                <Search size={15} aria-hidden="true" />
                <input
                  type="search"
                  aria-label="Search employees"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search by employee name, PAN-EMP ID, designation, or department..."
                  className="focus-ring min-w-0 flex-1 bg-transparent py-2.5 text-xs text-[var(--text)] outline-none"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                    Clear
                  </button>
                )}
              </label>
            </div>

            {/* Table */}
            {visible.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-left text-xs">
                  <caption className="sr-only">
                    Employee salary approvals and payments for {project.name}, {salaryMonthLabel(month)}
                  </caption>
                  <thead className="border-y border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]">
                    <tr>
                      {["Employee", "Gross Pay", "Deductions", "Net Salary", "Approval Status", "Payment Forwarding", "Actions"].map(label => (
                        <th key={label} scope="col" className="px-5 py-3 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {visible.map(record => {
                      const isApproved = record.approvalStatus === "Approved";
                      const isPendingApproval = record.approvalStatus === "Pending approval";
                      const isReadyToForward = canForwardSalary(record);
                      const isForwarded = Boolean(record.forwardedAt && record.status !== "Disbursed");
                      const isDisbursed = record.status === "Disbursed";

                      return (
                        <tr key={salaryKey(record)} className="transition-colors hover:bg-[var(--surface-soft)]/60">
                          {/* Employee Info */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-[var(--text)]">{record.name}</p>
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{record.designation}</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-subtle)]">
                              <span>{record.id}</span>
                              <span>·</span>
                              <span>{record.location}</span>
                            </div>
                          </td>

                          {/* Gross Pay */}
                          <td className="whitespace-nowrap px-5 py-4 text-[var(--text)]">
                            <span className="font-medium">{salaryMoney(record.basicHra + record.allowance)}</span>
                            <span className="mt-0.5 block text-[10px] text-[var(--text-subtle)]">Basic + Allowances</span>
                          </td>

                          {/* Deductions */}
                          <td className="whitespace-nowrap px-5 py-4 text-[var(--text-muted)]">
                            <span className="font-medium text-red-500/80">-{salaryMoney(record.pfDeduction + record.esiDeduction + record.tdsDeduction)}</span>
                            <span className="mt-0.5 block text-[10px] text-[var(--text-subtle)]">PF, ESI, TDS</span>
                          </td>

                          {/* Net Salary */}
                          <td className="whitespace-nowrap px-5 py-4 font-bold text-[var(--text)] text-sm">
                            {salaryMoney(record.netPay)}
                          </td>

                          {/* Approval Status Column */}
                          <td className="px-5 py-4">
                            {isApproved && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={13} /> Approved
                                </span>
                                <p className="mt-1 text-[10px] text-[var(--text-subtle)]">
                                  {record.approvedBy ?? "Finance Approver"} · {salaryDateLabel(record.approvedOn)}
                                </p>
                              </div>
                            )}

                            {isPendingApproval && (
                              <div className="space-y-1.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                  <Clock3 size={13} /> Pending approval
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveSingle(record)}
                                    className="focus-ring inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
                                    title="Approve salary"
                                  >
                                    <Check size={11} /> Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectSingle(record)}
                                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-[10px] font-medium text-[var(--text-muted)] hover:text-red-500"
                                    title="Reject or hold"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            )}

                            {record.approvalStatus === "Rejected" && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
                                  <XCircle size={13} /> Rejected / On hold
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleApproveSingle(record)}
                                  className="mt-1 block text-[10px] text-emerald-600 hover:underline"
                                >
                                  Re-evaluate &amp; approve
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Payment Forwarding Column */}
                          <td className="px-5 py-4">
                            {isDisbursed && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 size={13} /> Disbursed
                                </span>
                                <p className="mt-1 text-[10px] text-[var(--text-subtle)]">
                                  {record.paidOn ? salaryDateLabel(record.paidOn) : "Paid"}
                                  {record.reference ? ` · ${record.reference}` : ""}
                                </p>
                              </div>
                            )}

                            {isForwarded && (
                              <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                                  <ArrowUpRight size={13} /> Forwarded for Payment
                                </span>
                                <p className="mt-1 text-[10px] text-[var(--text-subtle)]">
                                  Desk: Finance Payments · {record.forwardedAt ? new Date(record.forwardedAt).toLocaleDateString("en-IN") : ""}
                                </p>
                              </div>
                            )}

                            {isReadyToForward && (
                              <button
                                type="button"
                                onClick={() => handleForwardSingle(record)}
                                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700"
                              >
                                <Send size={12} /> Forward for payment
                              </button>
                            )}

                            {!isDisbursed && !isForwarded && !isReadyToForward && (
                              <span className="text-[11px] text-[var(--text-subtle)]">
                                {isPendingApproval ? "Awaiting approval first" : "On hold"}
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {isForwarded && (
                                <Link
                                  to="/finance/payments"
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20"
                                >
                                  Payment desk <ArrowUpRight size={11} />
                                </Link>
                              )}
                              <button
                                type="button"
                                aria-label={`View salary details for ${record.name}`}
                                className={cn(action, "whitespace-nowrap px-2.5 py-1.5 text-[11px]")}
                                onClick={() => setSelectedKey(salaryKey(record))}
                              >
                                <FileText size={13} /> View details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-t border-[var(--border)] px-5 py-14 text-center">
                <Users size={26} className="mx-auto text-[var(--text-subtle)]" />
                <p className="mt-3 text-sm font-medium text-[var(--text)]">
                  {monthlyRecords.length ? "No matching employees found" : "No salary records for this month"}
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {monthlyRecords.length
                    ? "Try adjusting your search query or switching workflow filter tabs."
                    : "Choose another month or return to projects."}
                </p>
                {(query || activeTab !== "all") && (
                  <button
                    type="button"
                    className={cn(action, "mt-4")}
                    onClick={() => {
                      setQuery("");
                      setActiveTab("all");
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Month-Wise Payment Tracking */}
          <section className={cn(surface, "p-5 sm:p-6")} aria-labelledby="monthly-tracking-heading">
            <div className="flex items-center gap-3">
              <CalendarDays size={20} className="text-[var(--salary-accent)]" />
              <div>
                <h3 id="monthly-tracking-heading" className="text-base font-semibold text-[var(--text)]">
                  Month-wise payment tracking
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Compare this project’s payroll and open any month to review its employees.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {payrollMonths.map(value => {
                const summary = salaryTotals(scopedRecords.filter(record => record.month === value));
                return (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={month === value}
                    onClick={() => navigateScope(area?.id, project.id, value)}
                    className={cn(
                      "focus-ring rounded-xl border p-4 text-left transition-colors",
                      month === value
                        ? "border-[var(--salary-accent)] bg-[var(--salary-accent-soft)]"
                        : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                    )}
                  >
                    <span className="flex items-center justify-between gap-2 text-xs font-medium text-[var(--text)]">
                      {salaryMonthLabel(value)}
                      <ArrowUpRight size={14} />
                    </span>
                    <span className="mt-4 block text-lg font-semibold text-[var(--text)]">
                      {salaryMoney(summary.paid)}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--text-muted)]">
                      Paid · {summary.paidCount}/{summary.employees} employees
                    </span>
                    <SalaryProgress paid={summary.paidCount} total={summary.employees} />
                    <span className="mt-3 block text-xs text-[var(--text-muted)]">
                      {summary.employees ? `${salaryMoney(summary.outstanding)} outstanding` : "No payroll records"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {selected && (
        <SalaryDetails
          key={salaryKey(selected)}
          record={selected}
          history={records.filter(record => record.id === selected.id && record.projectId === selected.projectId)}
          onClose={() => setSelectedKey(null)}
          onForward={() => handleForwardSingle(selected)}
          onApprove={() => handleApproveSingle(selected)}
          onReject={() => handleRejectSingle(selected)}
        />
      )}
    </div>
  );
}

function SalaryMetric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return (
    <article className={cn(surface, "p-4 sm:p-5")}>
      <div className="flex items-center gap-2 text-[var(--salary-accent)]">
        {icon}
        <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
      </div>
      <p className="mt-4 break-words text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl">{value}</p>
      <p className="mt-2 text-xs text-[var(--text-muted)]">{detail}</p>
    </article>
  );
}

function SalaryProgress({ paid, total }: { paid: number; total: number }) {
  return (
    <div
      className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--border)]"
      role="progressbar"
      aria-label="Employees paid"
      aria-valuemin={0}
      aria-valuemax={Math.max(total, 1)}
      aria-valuenow={paid}
      aria-valuetext={`${paid} of ${total} employees paid`}
    >
      <div className="h-full rounded-full bg-[var(--salary-accent)]" style={{ width: `${total ? (paid / total) * 100 : 0}%` }} />
    </div>
  );
}

function SalaryScopeCard({
  title,
  subtitle,
  records,
  icon,
  onClick
}: {
  title: string;
  subtitle: string;
  records: SalaryRecord[];
  icon: ReactNode;
  onClick: () => void;
}) {
  const totals = salaryTotals(records);
  const readyCount = records.filter(r => canForwardSalary(r)).length;
  const pendingCount = records.filter(r => r.approvalStatus === "Pending approval").length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(surface, "focus-ring group p-5 text-left transition-colors hover:border-[var(--salary-accent)]")}
    >
      <span className="flex items-center justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-[var(--salary-accent-soft)] text-[var(--salary-accent)]">
          {icon}
        </span>
        <ArrowUpRight size={16} className="text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
      <h4 className="mt-5 text-sm font-semibold text-[var(--text)]">{title}</h4>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span>
          <span className="block text-lg font-semibold text-[var(--text)]">{salaryMoney(totals.net)}</span>
          <span className="mt-1 block text-xs text-[var(--text-muted)]">Net payroll</span>
        </span>
        <span className="text-xs text-[var(--text-muted)]">{totals.employees} employees</span>
      </div>
      <SalaryProgress paid={totals.paidCount} total={totals.employees} />
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{totals.paidCount} paid</span>
        {pendingCount > 0 ? (
          <span className="font-semibold text-amber-600 dark:text-amber-400">{pendingCount} pending approval</span>
        ) : readyCount > 0 ? (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{readyCount} ready to forward</span>
        ) : (
          <span>{totals.employees ? `${totals.employees - totals.paidCount} in queue` : "No records"}</span>
        )}
      </div>
    </button>
  );
}

function SalaryDetails({
  record,
  history,
  onClose,
  onForward,
  onApprove,
  onReject
}: {
  record: SalaryRecord;
  history: SalaryRecord[];
  onClose: () => void;
  onForward: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [error, setError] = useState("");
  const isApproved = record.approvalStatus === "Approved";
  const isPendingApproval = record.approvalStatus === "Pending approval";
  const isReadyToForward = canForwardSalary(record);

  const forward = () => {
    setError("");
    try {
      onForward();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salary could not be forwarded.");
    }
  };

  const project = financeAreas.flatMap(area => area.projects).find(project => project.id === record.projectId);

  return (
    <Overlay
      open
      onClose={onClose}
      variant="panel"
      size="lg"
      label="Employee Salary Record"
      title={record.name}
      description={`${record.id} · ${salaryMonthLabel(record.month)} · ${project?.name ?? record.projectId}`}
      footer={
        <div className="flex w-full items-center justify-between">
          <p className="text-[11px] text-[var(--text-muted)]">
            Bank: {record.bankName} (A/C: ...{record.bankAccount.slice(-4)})
          </p>
          <button type="button" className={action} onClick={onClose}>
            Close details
          </button>
        </div>
      }
    >
      <div className="salary-workspace space-y-6 p-5 sm:p-6">
        {/* Header Summary */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">{record.designation}</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {record.department} · {record.location}
            </p>
          </div>
          <div className="text-right">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isApproved
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : isPendingApproval
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-rose-500/10 text-rose-600"
              )}
            >
              {isApproved ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
              {record.approvalStatus}
            </span>
          </div>
        </div>

        {/* Net Salary Highlight */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent p-5 border border-emerald-500/20">
          <p className="text-xs text-[var(--text-muted)]">Net Payable Salary · {salaryMonthLabel(record.month)}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text)]">{salaryMoney(record.netPay)}</p>
          <p className="mt-3 text-xs text-[var(--text-muted)]">
            {record.bankName} · Account: {record.bankAccount} · IFSC: {record.ifsc}
          </p>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <SalaryBreakdown
            title="Earnings"
            rows={[
              ["Basic pay + HRA", record.basicHra],
              ["Allowances", record.allowance],
            ]}
            total={record.basicHra + record.allowance}
          />
          <SalaryBreakdown
            title="Deductions"
            rows={[
              ["EPF (Provident Fund)", record.pfDeduction],
              ["ESIC (Health)", record.esiDeduction],
              ["TDS (Income Tax)", record.tdsDeduction],
            ]}
            total={record.pfDeduction + record.esiDeduction + record.tdsDeduction}
          />
        </div>

        {/* Approval & Payment Forwarding Box */}
        <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-sm font-semibold text-[var(--text)]">Finance Department Authorization</h3>
            </div>
            <span className="text-xs font-semibold text-[var(--text)]">{salaryWorkflowLabel(record)}</span>
          </div>

          {/* Conditional Approval Controls */}
          {isPendingApproval ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <Clock3 size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Salary is awaiting Finance Approval
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-300/80">
                    Verify employee working days ({record.workingDays} days) and deduction amounts. Once approved, this salary can be forwarded for payment.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApprove();
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                    >
                      <Check size={14} /> Approve Salary
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onReject();
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-red-500"
                    >
                      Reject / Put on hold
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs leading-5 text-[var(--text-muted)]">
              <p className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Approved by {record.approvedBy ?? "Finance Approver"} on {salaryDateLabel(record.approvedOn)}
              </p>
            </div>
          )}

          {/* Forwarding Status & Action */}
          {record.forwardedAt && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-violet-900 dark:text-violet-200">Forwarded to Payment Desk</p>
                  <p className="mt-1 text-[11px] text-violet-800/70 dark:text-violet-300/70">
                    Released by {record.forwardedBy} on {new Date(record.forwardedAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <Link
                  to="/finance/payments"
                  className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  Payment desk <ArrowUpRight size={13} />
                </Link>
              </div>
            </div>
          )}

          {isReadyToForward && (
            <div>
              <button
                type="button"
                onClick={() => {
                  forward();
                  onClose();
                }}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
              >
                <Send size={14} /> Forward for payment
              </button>
              <p className="mt-2 text-[11px] text-[var(--text-muted)]">
                This will send the salary directly to the Finance Payment Desk for bank disbursement.
              </p>
            </div>
          )}

          {error && <p role="alert" className="text-xs text-[var(--salary-warning)]">{error}</p>}
        </section>

        {/* History */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--text)]">Monthly Payment History</h3>
          <div className="mt-4 divide-y divide-[var(--border)]">
            {history.map(item => (
              <article key={salaryKey(item)} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium text-[var(--text)]">{salaryMonthLabel(item.month)}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      item.approvalStatus === "Approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600"
                    )}
                  >
                    {item.approvalStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {salaryMoney(item.netPay)} · {item.paidOn ? `Paid ${salaryDateLabel(item.paidOn)}` : salaryWorkflowLabel(item)}
                </p>
                {item.reference && (
                  <p className="mt-1 break-all text-[11px] text-[var(--text-subtle)]">Reference: {item.reference}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </Overlay>
  );
}

function SalaryBreakdown({ title, rows, total }: { title: string; rows: [string, number][]; total: number }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)]/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)]">{title}</h3>
      <dl className="mt-3 space-y-2.5 text-xs">
        {rows.map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-[var(--text-muted)]">{label}</dt>
            <dd className="font-medium text-[var(--text)]">{salaryMoney(amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-[var(--border)] pt-2.5 font-bold text-[var(--text)]">
          <dt>Total {title}</dt>
          <dd>{salaryMoney(total)}</dd>
        </div>
      </dl>
    </section>
  );
}

function downloadSalaryRegister(records: SalaryRecord[], project: string, month: string) {
  const cell = (value: string | number) => `"${String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
  const rows = [
    [
      "Month",
      "Project",
      "Employee ID",
      "Employee",
      "Designation",
      "Department",
      "Bank",
      "Account No",
      "Gross",
      "EPF",
      "ESIC",
      "TDS",
      "Net Pay",
      "Approval Status",
      "Approved By",
      "Workflow",
      "Payment Date",
      "Bank Reference"
    ],
    ...records.map(record => [
      salaryMonthLabel(month),
      project,
      record.id,
      record.name,
      record.designation,
      record.department,
      record.bankName,
      record.bankAccount,
      record.basicHra + record.allowance,
      record.pfDeduction,
      record.esiDeduction,
      record.tdsDeduction,
      record.netPay,
      record.approvalStatus,
      record.approvedBy ?? "",
      salaryWorkflowLabel(record),
      record.paidOn ?? "",
      record.reference ?? ""
    ])
  ];
  const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map(row => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `salary-${records[0]?.projectId ?? "register"}-${month}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
