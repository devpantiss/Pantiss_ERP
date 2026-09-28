import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  History,
  FileText,
  Download,
  Lock,
  Layers,
  Users,
  Eye,
  Calendar,
  AlertCircle
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

export interface SystemAuditEntry {
  id: string;
  blockHash: string;
  timestamp: string;
  subsystem: "Budgets" | "Payments" | "Banking" | "Procurement" | "Payroll" | "Vendors" | "Reimbursements" | "Taxation";
  action: string;
  actor: string;
  role: string;
  project: string;
  referenceId: string;
  details: string;
  ipAddress: string;
}

const initialAuditLedger: SystemAuditEntry[] = [
  {
    id: "AUD-2026-9812",
    blockHash: "9f8a2c1b4e6d3f0a5c7e8d9b1a2c3e4f",
    timestamp: "28 Sep 2026 · 16:42:10",
    subsystem: "Payments",
    action: "Disbursement Slip Uploaded",
    actor: "Accounts Executive",
    role: "Finance Operations",
    project: "PMKVY 4.0 Odisha Skills",
    referenceId: "PAY-2026-081",
    details: "Bank UTR HDFCR5202609280018 attached; ₹14.85 L paid to Apex Skill Consortium.",
    ipAddress: "192.168.10.45"
  },
  {
    id: "AUD-2026-9811",
    blockHash: "4c7e8d9b1a2c3e4f9f8a2c1b4e6d3f0a",
    timestamp: "28 Sep 2026 · 14:15:32",
    subsystem: "Procurement",
    action: "Quotation Selected",
    actor: "Finance Manager",
    role: "Financial Approver",
    project: "Keonjhar IT Training Center",
    referenceId: "PR-2026-429",
    details: "Zenith Digital & Hardware selected at ₹8.60 L after comparing 3 compliant quotations.",
    ipAddress: "192.168.10.12"
  },
  {
    id: "AUD-2026-9810",
    blockHash: "1a2c3e4f9f8a2c1b4e6d3f0a4c7e8d9b",
    timestamp: "27 Sep 2026 · 18:05:19",
    subsystem: "Banking",
    action: "Bank Feed Reconciled",
    actor: "System Automation Daemon",
    role: "Automated Reconciler",
    project: "Central Treasury",
    referenceId: "RECON-SBI-0927",
    details: "14 matched transaction vouchers verified against SBI API statement. Zero variance.",
    ipAddress: "10.0.4.1"
  },
  {
    id: "AUD-2026-9809",
    blockHash: "8d9b1a2c3e4f4c7e9f8a2c1b4e6d3f0a",
    timestamp: "27 Sep 2026 · 11:30:00",
    subsystem: "Reimbursements",
    action: "Claim Verified",
    actor: "Finance Auditor",
    role: "Audit & Compliance",
    project: "Tribal Producer Collective",
    referenceId: "CLM-2026-0182",
    details: "Verified travel vouchers of Sunita Majhi (₹8,450); approved for next Thursday batch.",
    ipAddress: "192.168.10.19"
  },
  {
    id: "AUD-2026-9808",
    blockHash: "e4f9f8a2c1b4e6d3f0a4c7e8d9b1a2c3",
    timestamp: "26 Sep 2026 · 15:20:44",
    subsystem: "Budgets",
    action: "Budget Version Approved",
    actor: "Director of Finance",
    role: "Executive Authority",
    project: "Farm Prosperity Initiative",
    referenceId: "BDG-2026-LIV-02",
    details: "Revised Q3 allocation of ₹2.10 Cr approved with donor milestone re-alignment.",
    ipAddress: "192.168.10.02"
  },
  {
    id: "AUD-2026-9807",
    blockHash: "3f0a4c7e8d9b1a2c3e4f9f8a2c1b4e6d",
    timestamp: "24 Sep 2026 · 17:00:21",
    subsystem: "Payroll",
    action: "Monthly Payroll Run",
    actor: "Finance Manager",
    role: "Payroll Administrator",
    project: "Pan-Organization",
    referenceId: "PAYROLL-2026-09",
    details: "Direct debit batch of 142 employee net salaries (₹41.78 L) committed to SBI Corporate.",
    ipAddress: "192.168.10.12"
  },
  {
    id: "AUD-2026-9806",
    blockHash: "2c1b4e6d3f0a4c7e8d9b1a2c3e4f9f8a",
    timestamp: "20 Sep 2026 · 16:30:11",
    subsystem: "Taxation",
    action: "GSTR-3B Return Filed",
    actor: "Senior Tax Consultant",
    role: "Statutory Tax Officer",
    project: "Statutory Compliance",
    referenceId: "GST-2026-08",
    details: "Filed GSTR-3B for August 2026; ARN AA2108260018491 generated with ₹4.82 L net cash.",
    ipAddress: "192.168.10.33"
  }
];

export function AuditTrailsView() {
  const [ledger] = useState<SystemAuditEntry[]>(initialAuditLedger);
  const [searchQuery, setSearchQuery] = useState("");
  const [subsystemFilter, setSubsystemFilter] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState<SystemAuditEntry | null>(null);

  const filteredLedger = useMemo(() => {
    return ledger.filter((item) => {
      const matchSub = subsystemFilter === "all" || item.subsystem === subsystemFilter;
      const matchSearch =
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSub && matchSearch;
    });
  }, [ledger, subsystemFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <ShieldCheck size={13} /> Immutable Governance Ledger
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Centralized Financial Audit Trail
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Cryptographically chained event logs of every budget modification, voucher approval, bank remittance, and tax filing across the Pantiss ERP ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Audit trail integrity check passed: 1,842 block hashes validated.")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Lock size={14} /> Validate Chain Hashes
            </button>
            <button
              type="button"
              onClick={() => alert("Audit Trail Ledger (CSV) downloaded.")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
            >
              <Download size={14} /> Export Audit Log
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              SHA-256
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">1,842 Blocks</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Verified Ledger Events</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Zero tampering detected</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <Layers size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              Unified
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">8 Subsystems</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Connected Modules</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Budgets, banking, payroll, vendors, taxes</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <Users size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              Signatories
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">14 Approvers</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Active Digital Signatures</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Role-based multi-tier governance</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <CheckCircle2 size={18} />
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold text-teal-600">
              Audit Ready
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">100% Pass</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Statutory Readiness</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Compliant with CAG & CSR audit norms</p>
        </article>
      </section>

      {/* Filter and Event Log */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <History size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Live System Audit Feed</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Showing {filteredLedger.length} of {ledger.length} immutable events
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
                placeholder="Search actor, reference, details..."
                className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <select
              value={subsystemFilter}
              onChange={(e) => setSubsystemFilter(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Subsystems</option>
              <option value="Budgets">Budgets</option>
              <option value="Payments">Payments</option>
              <option value="Banking">Banking</option>
              <option value="Procurement">Procurement</option>
              <option value="Payroll">Payroll</option>
              <option value="Vendors">Vendors</option>
              <option value="Reimbursements">Reimbursements</option>
              <option value="Taxation">Taxation</option>
            </select>
          </div>
        </div>

        {/* Timeline list */}
        <div className="relative mt-6 space-y-4 pl-6 before:absolute before:bottom-4 before:left-[9px] before:top-4 before:w-px before:bg-[var(--border)]">
          {filteredLedger.map((item) => (
            <article
              key={item.id}
              className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-all hover:border-emerald-500/30 before:absolute before:-left-[20px] before:top-5 before:size-2.5 before:rounded-full before:border-2 before:border-[var(--module-bg)] before:bg-emerald-500"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600">
                      {item.subsystem}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--text)]">{item.action}</h4>
                    <span className="font-mono text-[9px] text-[var(--text-subtle)]">({item.referenceId})</span>
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-[var(--text-muted)]">
                    {item.actor} · <span className="text-[var(--text-subtle)]">{item.role}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-[var(--text-subtle)]">{item.timestamp}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(item)}
                    className="focus-ring inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-2.5 py-1 text-[9px] font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]"
                  >
                    <Eye size={10} /> Inspect
                  </button>
                </div>
              </div>

              <p className="mt-2.5 border-t border-[var(--border)] pt-2.5 text-xs text-[var(--text-muted)]">
                {item.details}
              </p>

              <div className="mt-2 flex items-center justify-between text-[8px] text-[var(--text-subtle)] font-mono">
                <span>Hash: {item.blockHash.slice(0, 16)}...</span>
                <span>IP: {item.ipAddress}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Inspect Overlay */}
      {selectedEntry && (
        <Overlay
          open
          onClose={() => setSelectedEntry(null)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Audit Ledger Block"
          title={`Audit Block ${selectedEntry.id}`}
          description={`${selectedEntry.action} · ${selectedEntry.timestamp}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-emerald-600 font-medium">
                <CheckCircle2 size={12} className="inline mr-1" />
                Cryptographic checksum verified
              </span>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="focus-ring h-10 rounded-xl bg-[var(--brand-primary)] px-5 text-xs font-semibold text-white"
              >
                Close Inspector
              </button>
            </div>
          }
        >
          <div className="space-y-4 p-5 sm:p-6 text-xs">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)] font-semibold">
                SHA-256 Cryptographic Block Seal
              </span>
              <p className="font-mono text-[11px] font-bold text-[var(--text)] break-all bg-[var(--module-bg)] p-3 rounded-lg border border-[var(--border)]">
                {selectedEntry.blockHash}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Subsystem</span>
                <p className="font-bold text-[var(--text)] mt-1">{selectedEntry.subsystem}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Reference ID</span>
                <p className="font-bold text-[var(--text)] mt-1">{selectedEntry.referenceId}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Signatory Actor</span>
                <p className="font-bold text-[var(--text)] mt-1">{selectedEntry.actor}</p>
                <p className="text-[10px] text-[var(--text-subtle)]">{selectedEntry.role}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Host Network / IP</span>
                <p className="font-mono font-bold text-[var(--text)] mt-1">{selectedEntry.ipAddress}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4">
              <span className="text-[9px] uppercase text-[var(--text-subtle)]">Detailed Audit Context</span>
              <p className="mt-1 leading-relaxed text-[var(--text)]">{selectedEntry.details}</p>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
