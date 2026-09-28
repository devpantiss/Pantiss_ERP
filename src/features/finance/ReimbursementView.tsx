import { useState, useMemo } from "react";
import {
  Receipt,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Paperclip,
  CreditCard,
  Building2,
  Calendar,
  XCircle,
  ShieldCheck,
  Eye,
  Download
} from "lucide-react";
import { financeAreas, formatCurrency } from "./data";
import { useEmployeeInvoices, type ReimbursementClaim } from "./employeeInvoiceStore";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

export function ReimbursementView() {
  const { claims, setClaims, error: invoiceError } = useEmployeeInvoices();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ReimbursementClaim | null>(null);

  // New claim form state
  const [claimantName, setClaimantName] = useState("");
  const [empId, setEmpId] = useState("");
  const [project, setProject] = useState("PMKVY 4.0 Odisha Skills");
  const [center, setCenter] = useState("Keonjhar Center");
  const [category, setCategory] = useState<ReimbursementClaim["category"]>("Inter-District Travel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchCat = categoryFilter === "all" || c.category === categoryFilter;
      const matchSearch =
        c.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.project.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchCat && matchSearch;
    });
  }, [claims, statusFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const pending = claims.filter((c) => c.status === "Pending Verification").length;
    const approved = claims.filter((c) => c.status === "Finance Approved");
    const approvedTotal = approved.reduce((acc, curr) => acc + curr.amount, 0);
    const disbursed = claims.filter((c) => c.status === "Disbursed");
    const disbursedTotal = disbursed.reduce((acc, curr) => acc + curr.amount, 0);
    return { pending, approvedCount: approved.length, approvedTotal, disbursedTotal };
  }, [claims]);

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!claimantName || isNaN(amt) || amt <= 0) return;

    const newClaim: ReimbursementClaim = {
      id: `CLM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      claimantName: claimantName.trim(),
      employeeId: empId.trim() || "PAN-EMP-TEMP",
      project,
      center,
      date: new Date().toISOString(),
      category,
      amount: amt,
      billsCount: 1,
      description: description.trim() || "Out-of-pocket field operational expenses",
      receiptName: receiptFile?.name || "voucher-receipt.pdf",
      status: "Pending Verification",
      managerApproved: true,
      financeAudited: false
    };

    if (!setClaims([newClaim, ...claims])) return;
    setShowNewClaimModal(false);
    // reset form
    setClaimantName("");
    setEmpId("");
    setAmount("");
    setDescription("");
    setReceiptFile(null);
  };

  const handleApproveClaim = (claimId: string) => {
    const saved = setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? { ...c, status: "Finance Approved", financeAudited: true }
          : c
      )
    );
    if (saved) setSelectedClaim(null);
  };

  const handleDisburseClaim = (claimId: string) => {
    const utr = `HDFCR5${Date.now().toString().slice(-8)}`;
    const saved = setClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? { ...c, status: "Disbursed", payoutDate: new Date().toISOString(), bankUtr: utr }
          : c
      )
    );
    if (saved) setSelectedClaim(null);
  };

  return (
    <div className="space-y-6">
      {invoiceError && <p role="alert" className="rounded-xl border border-[var(--border)] p-4 text-sm text-[var(--text)]">{invoiceError}</p>}
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Receipt size={13} /> Expense Reimbursement & Travel Advance
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Staff Claims & Field Out-of-Pocket Desk
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Audited employee claims reimbursement pipeline with receipt verification, reporting manager pre-clearance, and automated bank disbursement.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewClaimModal(true)}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50"
            >
              <Plus size={15} /> Submit Expense Claim
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Clock size={18} />
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600">
              In Review
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">{stats.pending} Claims</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Pending Finance Verification</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Manager-approved; awaiting voucher audit</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <CheckCircle2 size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              Approved
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            ₹{stats.approvedTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Approved for Payout ({stats.approvedCount})</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Scheduled for weekly Thursday batch NEFT</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              Settled
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            ₹{stats.disbursedTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Disbursed This Month</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">100% reconciled against bank vouchers</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              SLA Met
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">2.8 Days</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Avg Settlement Turnaround</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">From receipt submission to bank credit</p>
        </article>
      </section>

      {/* Claims Queue */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Receipt size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Reimbursement Claims Queue</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Showing {filteredClaims.length} of {claims.length} claims
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, ID, project..."
                className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Status</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Finance Approved">Finance Approved</option>
              <option value="Disbursed">Disbursed</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Expense Categories</option>
              <option value="Inter-District Travel">Inter-District Travel</option>
              <option value="Field Mobilization">Field Mobilization</option>
              <option value="Accommodation & Food">Accommodation & Food</option>
              <option value="Printing & Supplies">Printing & Supplies</option>
              <option value="Emergency Float">Emergency Float</option>
            </select>
          </div>
        </div>

        {/* Claims Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                <th className="pb-3 pl-3">Claim ID & Date</th>
                <th className="pb-3">Claimant</th>
                <th className="pb-3">Project & Center</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-right">Claim Amount</th>
                <th className="pb-3 text-center">Receipts</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="transition-colors hover:bg-[var(--surface-soft)]">
                  <td className="py-3.5 pl-3">
                    <p className="font-semibold text-[var(--text)]">{claim.id}</p>
                    <p className="text-[10px] text-[var(--text-subtle)]">{claim.date}</p>
                  </td>
                  <td className="py-3.5">
                    <p className="font-medium text-[var(--text)]">{claim.claimantName}</p>
                    <p className="text-[10px] text-[var(--text-subtle)]">{claim.employeeId}</p>
                  </td>
                  <td className="py-3.5 max-w-[200px]">
                    <p className="truncate font-medium text-[var(--text)]">{claim.project}</p>
                    <p className="truncate text-[10px] text-[var(--text-subtle)]">{claim.center}</p>
                  </td>
                  <td className="py-3.5">
                    <span className="rounded bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                      {claim.category}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-[var(--text)]">
                    ₹{claim.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                      <Paperclip size={11} /> {claim.billsCount} files
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                        claim.status === "Disbursed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : claim.status === "Finance Approved"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-600"
                      )}
                    >
                      {claim.status === "Disbursed" ? (
                        <CheckCircle2 size={10} />
                      ) : claim.status === "Finance Approved" ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      {claim.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-3">
                    <button
                      type="button"
                      onClick={() => setSelectedClaim(claim)}
                      className="focus-ring inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--module-bg)]"
                    >
                      Review Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Submit Claim Overlay */}
      {showNewClaimModal && (
        <Overlay
          open
          onClose={() => setShowNewClaimModal(false)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Expense Claim"
          title="Submit Staff Expense Reimbursement"
          description="Submit out-of-pocket expenses incurred during field operations with verified bills."
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-[var(--text-subtle)]">Attached bills will be saved to audit vault</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewClaimModal(false)}
                  className="focus-ring h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="submit-claim-form"
                  className="focus-ring h-10 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Submit for Approval
                </button>
              </div>
            </div>
          }
        >
          <form id="submit-claim-form" onSubmit={handleCreateClaim} className="space-y-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Employee Name <b className="text-red-500">*</b>
                </label>
                <input
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. Sunita Majhi"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Employee ID</label>
                <input
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="e.g. PAN-EMP-0104"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Associated Project</label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                >
                  {financeAreas.map((area) => <optgroup key={area.id} label={area.name}>{area.projects.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</optgroup>)}
                  <option value="Executive & Core Finance">Executive & Core Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Cost Center</label>
                <input
                  value={center}
                  onChange={(e) => setCenter(e.target.value)}
                  placeholder="e.g. Koraput Regional Office"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                >
                  <option value="Inter-District Travel">Inter-District Travel</option>
                  <option value="Field Mobilization">Field Mobilization</option>
                  <option value="Accommodation & Food">Accommodation & Food</option>
                  <option value="Printing & Supplies">Printing & Supplies</option>
                  <option value="Emergency Float">Emergency Float</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Claim Amount (₹) <b className="text-red-500">*</b>
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 8450"
                  className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)]">Purpose & Expense Details</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe trip details, dates, attendees or materials purchased..."
                className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)]">Attach Bills / Receipts (PDF or Images)</label>
              <label className="focus-ring mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/[0.04] p-4">
                <Paperclip size={18} className="text-emerald-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[var(--text)]">
                    {receiptFile ? receiptFile.name : "Upload invoice/voucher scans"}
                  </p>
                  <p className="text-[10px] text-[var(--text-subtle)]">PDF, JPG, PNG up to 10 MB</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </form>
        </Overlay>
      )}

      {/* Review Claim Overlay */}
      {selectedClaim && (
        <Overlay
          open
          onClose={() => setSelectedClaim(null)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Claim Audit"
          title={`Claim ${selectedClaim.id}`}
          description={`${selectedClaim.claimantName} (${selectedClaim.employeeId}) · ${selectedClaim.project}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-[var(--text-subtle)]">Recorded in immutable audit trail</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  className="focus-ring h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
                >
                  Close
                </button>
                {selectedClaim.status === "Pending Verification" && (
                  <button
                    type="button"
                    onClick={() => handleApproveClaim(selectedClaim.id)}
                    className="focus-ring h-10 rounded-xl bg-blue-600 px-5 text-xs font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Approve for Payout
                  </button>
                )}
                {selectedClaim.status === "Finance Approved" && (
                  <button
                    type="button"
                    onClick={() => handleDisburseClaim(selectedClaim.id)}
                    className="focus-ring h-10 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                  >
                    Disburse Reimbursement
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Claim Amount</span>
                <p className="mt-1 text-xl font-bold text-[var(--text)]">₹{selectedClaim.amount.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Category</span>
                <p className="mt-1 text-sm font-semibold text-[var(--text)]">{selectedClaim.category}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Status</span>
                <p className="mt-1 text-sm font-bold text-emerald-600">{selectedClaim.status}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-2">
              <h4 className="text-xs font-bold text-[var(--text)]">Claim Particulars</h4>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">{selectedClaim.description}</p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">{selectedClaim.receiptName}</p>
                  <p className="text-[10px] text-[var(--text-subtle)]">{selectedClaim.billsCount} scanned receipts attached</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(`Opening ${selectedClaim.receiptName} in PDF viewer.`)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-[var(--module-bg)] border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]"
              >
                <Eye size={12} /> View Scan
              </button>
            </div>

            {selectedClaim.bankUtr && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <h5 className="text-xs font-bold text-[var(--text)]">Settlement Details</h5>
                <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">Bank UTR: {selectedClaim.bankUtr}</p>
                <p className="text-[10px] text-[var(--text-subtle)]">Paid on: {selectedClaim.payoutDate}</p>
              </div>
            )}
          </div>
        </Overlay>
      )}
    </div>
  );
}
