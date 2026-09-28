import { useState, useMemo } from "react";
import {
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  CreditCard,
  Download,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileText,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  maskedNumber: string;
  branch: string;
  ifsc: string;
  accountType: "Operational" | "Disbursement" | "Grant Escrow" | "Field Imprest";
  balance: number; // in Lakhs
  uncleared: number;
  lastReconciled: string;
  status: "Active" | "Restricted";
  color: string;
}

interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  type: "Credit" | "Debit";
  amount: number; // in Lakhs
  party: string;
  utr: string;
  description: string;
  category: string;
  status: "Reconciled" | "Pending Clearance" | "Flagged";
}

const initialAccounts: BankAccount[] = [
  {
    id: "acc-1",
    bankName: "State Bank of India",
    accountNumber: "389201948210",
    maskedNumber: "•••• 8210",
    branch: "Bhubaneswar Main Branch, Odisha",
    ifsc: "SBIN0001042",
    accountType: "Operational",
    balance: 1842.5,
    uncleared: 14.2,
    lastReconciled: "Today, 11:30 AM",
    status: "Active",
    color: "#0284c7"
  },
  {
    id: "acc-2",
    bankName: "HDFC Bank Ltd",
    accountNumber: "50200039218412",
    maskedNumber: "•••• 8412",
    branch: "Saheed Nagar Branch, Bhubaneswar",
    ifsc: "HDFC0000284",
    accountType: "Disbursement",
    balance: 1218.4,
    uncleared: 22.8,
    lastReconciled: "Today, 10:45 AM",
    status: "Active",
    color: "#2563eb"
  },
  {
    id: "acc-3",
    bankName: "ICICI Bank Ltd",
    accountNumber: "00420500192399",
    maskedNumber: "•••• 1923",
    branch: "Infocity Branch, Bhubaneswar",
    ifsc: "ICIC0000042",
    accountType: "Grant Escrow",
    balance: 615.0,
    uncleared: 0.0,
    lastReconciled: "Yesterday, 05:15 PM",
    status: "Active",
    color: "#ea580c"
  },
  {
    id: "acc-4",
    bankName: "Axis Bank Ltd",
    accountNumber: "91902003810291",
    maskedNumber: "•••• 8102",
    branch: "Koraput Regional Office Branch",
    ifsc: "UTIB0000119",
    accountType: "Field Imprest",
    balance: 169.8,
    uncleared: 5.5,
    lastReconciled: "Today, 09:00 AM",
    status: "Active",
    color: "#9333ea"
  }
];

const initialTransactions: BankTransaction[] = [
  {
    id: "TXN-2026-9041",
    accountId: "acc-2",
    date: "28 Sep 2026",
    type: "Debit",
    amount: 14.85,
    party: "Apex Skill Training Consortium",
    utr: "HDFCR5202609280018",
    description: "Milestone-2 Batch Trainer Fees",
    category: "Training Disbursement",
    status: "Reconciled"
  },
  {
    id: "TXN-2026-9040",
    accountId: "acc-1",
    date: "27 Sep 2026",
    type: "Credit",
    amount: 125.0,
    party: "NSDC Central Mission Grant",
    utr: "SBIN4202609270094",
    description: "PMKVY 4.0 Q2 Installment release",
    category: "Grant Inflow",
    status: "Reconciled"
  },
  {
    id: "TXN-2026-9039",
    accountId: "acc-1",
    date: "27 Sep 2026",
    type: "Debit",
    amount: 8.6,
    party: "Zenith Digital & Hardware Labs",
    utr: "SBINR2202609270114",
    description: "Computer lab hardware for Keonjhar center",
    category: "Procurement",
    status: "Reconciled"
  },
  {
    id: "TXN-2026-9038",
    accountId: "acc-4",
    date: "26 Sep 2026",
    type: "Debit",
    amount: 3.4,
    party: "Tribal SHG Mobilization Unit",
    utr: "AXISR9202609260049",
    description: "Community venue rental & participant travel",
    category: "Field Expenses",
    status: "Pending Clearance"
  },
  {
    id: "TXN-2026-9037",
    accountId: "acc-3",
    date: "25 Sep 2026",
    type: "Credit",
    amount: 85.0,
    party: "Tata Trusts Livelihood Grant",
    utr: "ICICR1202609250081",
    description: "Farm Prosperity second tranche",
    category: "Donor Funding",
    status: "Reconciled"
  },
  {
    id: "TXN-2026-9036",
    accountId: "acc-2",
    date: "25 Sep 2026",
    type: "Debit",
    amount: 18.25,
    party: "State Healthcare Mission Supplies",
    utr: "HDFCR5202609250033",
    description: "Diagnostic kits & mobile clinic refits",
    category: "Health Supplies",
    status: "Pending Clearance"
  },
  {
    id: "TXN-2026-9035",
    accountId: "acc-1",
    date: "24 Sep 2026",
    type: "Debit",
    amount: 41.78,
    party: "Monthly Central Staff Payroll (142 staff)",
    utr: "SBINM0202609240001",
    description: "September 2026 net salary batch",
    category: "Payroll",
    status: "Reconciled"
  }
];

export function BankingView() {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [transactions, setTransactions] = useState<BankTransaction[]>(initialTransactions);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Credit" | "Debit">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "Reconciled" | "Pending Clearance">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // New transfer state
  const [transferFrom, setTransferFrom] = useState("acc-1");
  const [transferTo, setTransferTo] = useState("acc-2");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferPurpose, setTransferPurpose] = useState("");

  const totalLiquidity = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.balance, 0);
  }, [accounts]);

  const totalUncleared = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.uncleared, 0);
  }, [accounts]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchAccount = selectedAccountId === "all" || t.accountId === selectedAccountId;
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchSearch =
        t.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAccount && matchType && matchStatus && matchSearch;
    });
  }, [transactions, selectedAccountId, typeFilter, statusFilter, searchQuery]);

  const handleSyncFeeds = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) return;

    const sourceAcc = accounts.find((a) => a.id === transferFrom);
    const destAcc = accounts.find((a) => a.id === transferTo);
    if (!sourceAcc || !destAcc || sourceAcc.balance < amt) return;

    const newTxn: BankTransaction = {
      id: `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      accountId: transferFrom,
      date: "Today",
      type: "Debit",
      amount: amt,
      party: `Internal Transfer to ${destAcc.bankName} (${destAcc.accountType})`,
      utr: `INT${Date.now().toString().slice(-8)}`,
      description: transferPurpose || "Inter-account float replenishment",
      category: "Treasury Transfer",
      status: "Reconciled"
    };

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transferFrom) return { ...acc, balance: acc.balance - amt };
        if (acc.id === transferTo) return { ...acc, balance: acc.balance + amt };
        return acc;
      })
    );
    setTransactions((prev) => [newTxn, ...prev]);
    setShowTransferModal(false);
    setTransferAmount("");
    setTransferPurpose("");
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-800 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Landmark size={13} /> Banking & Treasury Desk
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Real-time Liquidity & Bank Feeds
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Consolidated multi-bank accounts, instant reconciliation against financial ledgers, and secure treasury transfer protocols for FY 2026–27.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncFeeds}
              disabled={syncing}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing API feeds..." : syncSuccess ? "Feeds reconciled!" : "Sync Bank Feeds"}
            </button>
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50"
            >
              <Plus size={15} /> Inter-Bank Transfer
            </button>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Landmark size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              4 Active A/Cs
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(totalLiquidity, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Total Liquid Balance</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Aggregated live across 4 institutional banks</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <CreditCard size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              Operational
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(accounts[0].balance + accounts[1].balance, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Available Disbursement Float</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">SBI & HDFC operational accounts</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Clock size={18} />
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600">
              In-Transit
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(totalUncleared, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Uncleared / In-Transit Checks</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Expected credit clearing within 24-48 hrs</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              Reconciled 99.4%
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            ₹0.00 Variance
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Ledger vs Bank Variance</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Automated EOD bank reconciliation verified</p>
        </article>
      </section>

      {/* Bank Accounts Registry */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text)]">Institutional Bank Accounts</h3>
            <p className="text-xs text-[var(--text-subtle)]">Designated bank accounts for core operations, grants, and regional floats</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? "all" : acc.id)}
              className={cn(
                "group cursor-pointer rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
                selectedAccountId === acc.id
                  ? "border-emerald-500 bg-emerald-500/[0.04] shadow-sm ring-2 ring-emerald-500/20"
                  : "border-[var(--border)] bg-[var(--module-bg)]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid size-9 place-items-center rounded-xl text-white text-xs font-bold"
                    style={{ background: acc.color }}
                  >
                    <Building2 size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">{acc.bankName}</h4>
                    <p className="text-[10px] text-[var(--text-subtle)]">{acc.maskedNumber}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[8px] font-semibold text-[var(--text-muted)]">
                  {acc.accountType}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Current Balance</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-[var(--text)]">
                  {formatCurrency(acc.balance, true)}
                </p>
              </div>

              <div className="mt-4 border-t border-[var(--border)] pt-3 text-[10px] text-[var(--text-subtle)] flex items-center justify-between">
                <span>IFSC: {acc.ifsc}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Reconciled</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions & Bank Statement Ledger */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FileText size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Bank Statement Ledger</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Showing {filteredTransactions.length} of {transactions.length} synced entries
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
                placeholder="Search UTR, party, narration..."
                className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Bank Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bankName} ({a.maskedNumber})
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Types</option>
              <option value="Credit">Credit (Inflow)</option>
              <option value="Debit">Debit (Disbursement)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Status</option>
              <option value="Reconciled">Reconciled</option>
              <option value="Pending Clearance">Pending Clearance</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                <th className="pb-3 pl-3">Date & ID</th>
                <th className="pb-3">Beneficiary / Party</th>
                <th className="pb-3">Account & Category</th>
                <th className="pb-3">Bank UTR / Reference</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              {filteredTransactions.map((t) => {
                const acc = accounts.find((a) => a.id === t.accountId);
                return (
                  <tr key={t.id} className="transition-colors hover:bg-[var(--surface-soft)]">
                    <td className="py-3.5 pl-3">
                      <p className="font-semibold text-[var(--text)]">{t.date}</p>
                      <p className="text-[10px] text-[var(--text-subtle)]">{t.id}</p>
                    </td>
                    <td className="py-3.5 max-w-[220px]">
                      <p className="truncate font-medium text-[var(--text)]">{t.party}</p>
                      <p className="truncate text-[10px] text-[var(--text-subtle)]">{t.description}</p>
                    </td>
                    <td className="py-3.5">
                      <p className="font-medium text-[var(--text)]">{acc?.bankName}</p>
                      <span className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-[10px] text-[var(--text-muted)]">
                      {t.utr}
                    </td>
                    <td className="py-3.5 text-right font-semibold">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-bold",
                          t.type === "Credit" ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text)]"
                        )}
                      >
                        {t.type === "Credit" ? "+" : "-"} {formatCurrency(t.amount, true)}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold",
                          t.status === "Reconciled"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {t.status === "Reconciled" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center">
              <AlertCircle size={24} className="mx-auto text-[var(--text-subtle)]" />
              <p className="mt-2 text-xs font-semibold text-[var(--text)]">No transactions found</p>
              <p className="text-[10px] text-[var(--text-subtle)]">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </section>

      {/* Transfer Overlay */}
      {showTransferModal && (
        <Overlay
          open
          onClose={() => setShowTransferModal(false)}
          variant="panel"
          size="md"
          zIndex={75}
          label="Treasury Float"
          title="Inter-Bank Float Transfer"
          description="Move funds between operational and project escrow accounts with dual authorization."
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-[var(--text-subtle)]">Instant intra-bank NEFT/RTGS</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="focus-ring h-10 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="bank-transfer-form"
                  className="focus-ring h-10 rounded-xl bg-emerald-600 px-5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                >
                  Execute Transfer
                </button>
              </div>
            </div>
          }
        >
          <form id="bank-transfer-form" onSubmit={handleExecuteTransfer} className="space-y-4 p-5 sm:p-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)]">Source Account</label>
              <select
                value={transferFrom}
                onChange={(e) => setTransferFrom(e.target.value)}
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)]"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.bankName} - {a.accountType} (Bal: {formatCurrency(a.balance, true)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)]">Destination Account</label>
              <select
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)]"
              >
                {accounts
                  .filter((a) => a.id !== transferFrom)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bankName} - {a.accountType} (Bal: {formatCurrency(a.balance, true)})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)]">
                Transfer Amount (in Lakhs ₹) <b className="text-red-500">*</b>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="e.g. 25.50"
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)]">Purpose / Authorization Note</label>
              <textarea
                rows={2}
                value={transferPurpose}
                onChange={(e) => setTransferPurpose(e.target.value)}
                placeholder="e.g. Regional field center disbursement float replenishment"
                className="focus-ring mt-1.5 w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-[10px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck size={14} className="mb-1 inline mr-1 text-emerald-600" />
              Transfer requests are recorded directly into the centralized audit trail with timestamp and initiator signature.
            </div>
          </form>
        </Overlay>
      )}
    </div>
  );
}
