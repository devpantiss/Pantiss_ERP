import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  PieChart,
  Calendar,
  FileText,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { formatCurrency } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

interface FixedDeposit {
  id: string;
  bankName: string;
  fdNumber: string;
  principal: number; // in Lakhs
  currentValue: number; // in Lakhs
  interestRate: number; // percentage
  startDate: string;
  maturityDate: string;
  tenureMonths: number;
  payoutType: "Cumulative" | "Quarterly Payout";
  status: "Active" | "Matured";
  lienStatus: "Unencumbered" | "Earmarked for Bank Guarantee";
}

interface MutualFund {
  id: string;
  schemeName: string;
  amc: string;
  folioNumber: string;
  category: "Liquid Fund" | "Overnight Fund" | "Ultra Short Term";
  investedAmount: number; // in Lakhs
  currentValue: number; // in Lakhs
  units: number;
  currentNav: number;
  returnPercentage: number;
  xirr: number;
  status: "Active";
}

const sampleFixedDeposits: FixedDeposit[] = [
  {
    id: "FD-2026-01",
    bankName: "State Bank of India",
    fdNumber: "SBI/FD/389102948",
    principal: 100.0,
    currentValue: 105.8,
    interestRate: 7.3,
    startDate: "15 Dec 2025",
    maturityDate: "15 Dec 2026",
    tenureMonths: 12,
    payoutType: "Cumulative",
    status: "Active",
    lienStatus: "Unencumbered"
  },
  {
    id: "FD-2026-02",
    bankName: "HDFC Bank Ltd",
    fdNumber: "HDFC/FD/502001928",
    principal: 80.0,
    currentValue: 85.2,
    interestRate: 7.5,
    startDate: "28 Feb 2026",
    maturityDate: "28 Feb 2027",
    tenureMonths: 12,
    payoutType: "Cumulative",
    status: "Active",
    lienStatus: "Unencumbered"
  },
  {
    id: "FD-2026-03",
    bankName: "ICICI Bank Ltd",
    fdNumber: "ICICI/FD/00420519",
    principal: 50.0,
    currentValue: 52.6,
    interestRate: 7.1,
    startDate: "10 Apr 2026",
    maturityDate: "10 Apr 2027",
    tenureMonths: 12,
    payoutType: "Cumulative",
    status: "Active",
    lienStatus: "Earmarked for Bank Guarantee"
  },
  {
    id: "FD-2026-04",
    bankName: "Axis Bank Ltd",
    fdNumber: "AXIS/FD/919020381",
    principal: 40.0,
    currentValue: 41.4,
    interestRate: 7.2,
    startDate: "05 Jun 2026",
    maturityDate: "05 Jun 2027",
    tenureMonths: 12,
    payoutType: "Cumulative",
    status: "Active",
    lienStatus: "Unencumbered"
  }
];

const sampleMutualFunds: MutualFund[] = [
  {
    id: "MF-2026-01",
    schemeName: "SBI Liquid Fund - Direct Plan - Growth",
    amc: "SBI Mutual Fund",
    folioNumber: "10492819/84",
    category: "Liquid Fund",
    investedAmount: 50.0,
    currentValue: 52.4,
    units: 14285.714,
    currentNav: 366.79,
    returnPercentage: 4.8,
    xirr: 7.6,
    status: "Active"
  },
  {
    id: "MF-2026-02",
    schemeName: "HDFC Overnight Fund - Direct Plan - Growth",
    amc: "HDFC Asset Management",
    folioNumber: "50201948/12",
    category: "Overnight Fund",
    investedAmount: 45.0,
    currentValue: 48.2,
    units: 12948.391,
    currentNav: 372.24,
    returnPercentage: 7.1,
    xirr: 7.1,
    status: "Active"
  },
  {
    id: "MF-2026-03",
    schemeName: "ICICI Prudential Ultra Short Term Fund - Direct - Growth",
    amc: "ICICI Prudential AMC",
    folioNumber: "88291049/91",
    category: "Ultra Short Term",
    investedAmount: 38.0,
    currentValue: 41.4,
    units: 15829.418,
    currentNav: 261.54,
    returnPercentage: 8.9,
    xirr: 8.2,
    status: "Active"
  }
];

export function InvestmentsView() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "fd" | "mf">("all");
  const [fixedDeposits] = useState<FixedDeposit[]>(sampleFixedDeposits);
  const [mutualFunds] = useState<MutualFund[]>(sampleMutualFunds);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFd, setSelectedFd] = useState<FixedDeposit | null>(null);
  const [selectedMf, setSelectedMf] = useState<MutualFund | null>(null);

  // Aggregated totals
  const totalFdValue = useMemo(() => {
    return fixedDeposits.reduce((acc, curr) => acc + curr.currentValue, 0);
  }, [fixedDeposits]);

  const totalMfValue = useMemo(() => {
    return mutualFunds.reduce((acc, curr) => acc + curr.currentValue, 0);
  }, [mutualFunds]);

  const totalPortfolioValue = totalFdValue + totalMfValue;

  const totalFdPrincipal = useMemo(() => {
    return fixedDeposits.reduce((acc, curr) => acc + curr.principal, 0);
  }, [fixedDeposits]);

  const totalMfInvested = useMemo(() => {
    return mutualFunds.reduce((acc, curr) => acc + curr.investedAmount, 0);
  }, [mutualFunds]);

  const totalGains = totalPortfolioValue - (totalFdPrincipal + totalMfInvested);

  // Filtered lists
  const filteredFds = useMemo(() => {
    return fixedDeposits.filter((fd) => {
      return (
        fd.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fd.fdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fd.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [fixedDeposits, searchQuery]);

  const filteredMfs = useMemo(() => {
    return mutualFunds.filter((mf) => {
      return (
        mf.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mf.amc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mf.folioNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [mutualFunds, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <button
            type="button"
            onClick={() => navigate("/finance/dashboard")}
            className="focus-ring inline-flex items-center gap-1 font-medium hover:text-[var(--text)] transition-colors"
          >
            <ChevronLeft size={14} /> Finance Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-[var(--text)]">Investments & Treasury Portfolio</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/finance/banking")}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:border-emerald-500/40 hover:text-[var(--text)] transition-all shadow-sm"
          >
            <Landmark size={13} className="text-emerald-500" /> View Banking Ledger <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-blue-950 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-blue-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <TrendingUp size={13} /> Institutional Treasury & Investments
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Mutual Funds & Fixed Deposits Portfolio
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Capital preservation and yield optimization across institutional fixed deposits and SEBI-regulated liquid mutual funds compliant with trust investment regulations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Consolidated Investment Portfolio Valuation Report (PDF) downloaded.")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-slate-900 shadow-md transition hover:bg-slate-100"
            >
              <Download size={14} /> Download Valuation Certificate
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              NAV Marked
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(totalPortfolioValue, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Total Portfolio Valuation</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Combined FD and Mutual Fund holdings</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <Landmark size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              4 Deposits
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(totalFdValue, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Total Fixed Deposits</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Principal: {formatCurrency(totalFdPrincipal, true)} · 7.3% avg rate</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <PieChart size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              3 Schemes
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(totalMfValue, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Total Liquid Mutual Funds</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Cost: {formatCurrency(totalMfInvested, true)} · 7.6% XIRR</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold text-teal-600">
              Accrued Gains
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(totalGains, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Unrealized Capital Yield</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Cumulative interest & capital appreciation</p>
        </article>
      </section>

      {/* Tabs & Filters */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "focus-ring rounded-xl px-4 py-2 text-xs font-semibold transition",
                activeTab === "all"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              All Assets ({fixedDeposits.length + mutualFunds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fd")}
              className={cn(
                "focus-ring rounded-xl px-4 py-2 text-xs font-semibold transition",
                activeTab === "fd"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              Fixed Deposits ({fixedDeposits.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("mf")}
              className={cn(
                "focus-ring rounded-xl px-4 py-2 text-xs font-semibold transition",
                activeTab === "mf"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[var(--surface-soft)] text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              Mutual Funds ({mutualFunds.length})
            </button>
          </div>

          <div className="relative min-w-[240px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bank, FD ref, MF scheme..."
              className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
            />
          </div>
        </div>

        {/* 1. Fixed Deposits Section */}
        {(activeTab === "all" || activeTab === "fd") && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                <Landmark size={15} className="text-emerald-600" /> Fixed Deposits ({filteredFds.length})
              </h4>
              <span className="text-[10px] text-[var(--text-subtle)]">
                Current Value: {formatCurrency(totalFdValue, true)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredFds.map((fd) => (
                <article
                  key={fd.id}
                  onClick={() => setSelectedFd(fd)}
                  className="group cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-bold text-blue-600">
                        {fd.interestRate}% p.a.
                      </span>
                      <h5 className="mt-2 text-xs font-bold text-[var(--text)]">{fd.bankName}</h5>
                      <p className="font-mono text-[9px] text-[var(--text-subtle)]">{fd.fdNumber}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-600">
                      {fd.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[var(--module-bg)] p-3 text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-[var(--text-subtle)]">Principal</span>
                      <p className="font-bold text-[var(--text)]">{formatCurrency(fd.principal, true)}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-[var(--text-subtle)]">Current Val</span>
                      <p className="font-bold text-emerald-600">{formatCurrency(fd.currentValue, true)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] text-[var(--text-subtle)]">
                    <span>Maturity: {fd.maturityDate}</span>
                    <span className="font-semibold text-emerald-600 group-hover:underline">Details →</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* 2. Mutual Funds Section */}
        {(activeTab === "all" || activeTab === "mf") && (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                <PieChart size={15} className="text-purple-600" /> Liquid Mutual Funds ({filteredMfs.length})
              </h4>
              <span className="text-[10px] text-[var(--text-subtle)]">
                Current Value: {formatCurrency(totalMfValue, true)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMfs.map((mf) => (
                <article
                  key={mf.id}
                  onClick={() => setSelectedMf(mf)}
                  className="group cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[8px] font-bold text-purple-600">
                        {mf.category}
                      </span>
                      <h5 className="mt-2 text-xs font-bold text-[var(--text)]">{mf.schemeName}</h5>
                      <p className="text-[9px] text-[var(--text-subtle)]">{mf.amc} · Folio: {mf.folioNumber}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600">
                      +{mf.xirr}% XIRR
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[var(--module-bg)] p-3 text-[10px]">
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-[var(--text-subtle)]">Invested Cost</span>
                      <p className="font-bold text-[var(--text)]">{formatCurrency(mf.investedAmount, true)}</p>
                    </div>
                    <div>
                      <span className="text-[8px] uppercase tracking-wider text-[var(--text-subtle)]">Current Value</span>
                      <p className="font-bold text-emerald-600">{formatCurrency(mf.currentValue, true)}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] text-[var(--text-subtle)]">
                    <span>Current NAV: ₹{mf.currentNav}</span>
                    <span className="font-semibold text-purple-600 group-hover:underline">View Folio →</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* FD Details Modal */}
      {selectedFd && (
        <Overlay
          open
          onClose={() => setSelectedFd(null)}
          variant="panel"
          size="md"
          zIndex={75}
          label="Fixed Deposit Certificate"
          title={selectedFd.bankName}
          description={`FD Reference: ${selectedFd.fdNumber}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-emerald-600 font-medium">
                <CheckCircle2 size={12} className="inline mr-1" /> Verified against bank advice
              </span>
              <button
                type="button"
                onClick={() => setSelectedFd(null)}
                className="focus-ring h-10 rounded-xl bg-[var(--brand-primary)] px-5 text-xs font-semibold text-white"
              >
                Close Certificate
              </button>
            </div>
          }
        >
          <div className="space-y-4 p-5 sm:p-6 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Principal Deposited</span>
                <p className="font-bold text-base text-[var(--text)] mt-1">{formatCurrency(selectedFd.principal, true)}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Current Maturity Value</span>
                <p className="font-bold text-base text-emerald-600 mt-1">{formatCurrency(selectedFd.currentValue, true)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Annual Interest Rate:</span>
                <span className="font-bold text-[var(--text)]">{selectedFd.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Tenure:</span>
                <span className="font-semibold text-[var(--text)]">{selectedFd.tenureMonths} Months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Start Date:</span>
                <span className="font-semibold text-[var(--text)]">{selectedFd.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Maturity Date:</span>
                <span className="font-bold text-emerald-600">{selectedFd.maturityDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Lien Status:</span>
                <span className="font-semibold text-[var(--text)]">{selectedFd.lienStatus}</span>
              </div>
            </div>
          </div>
        </Overlay>
      )}

      {/* MF Details Modal */}
      {selectedMf && (
        <Overlay
          open
          onClose={() => setSelectedMf(null)}
          variant="panel"
          size="md"
          zIndex={75}
          label="Mutual Fund Holding"
          title={selectedMf.schemeName}
          description={`AMC: ${selectedMf.amc} · Folio: ${selectedMf.folioNumber}`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-purple-600 font-medium">
                <BadgeCheck size={12} className="inline mr-1" /> SEBI Regulated Mutual Fund
              </span>
              <button
                type="button"
                onClick={() => setSelectedMf(null)}
                className="focus-ring h-10 rounded-xl bg-[var(--brand-primary)] px-5 text-xs font-semibold text-white"
              >
                Close Folio
              </button>
            </div>
          }
        >
          <div className="space-y-4 p-5 sm:p-6 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Cost of Investment</span>
                <p className="font-bold text-base text-[var(--text)] mt-1">{formatCurrency(selectedMf.investedAmount, true)}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase text-[var(--text-subtle)]">Current Market Value</span>
                <p className="font-bold text-base text-emerald-600 mt-1">{formatCurrency(selectedMf.currentValue, true)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Scheme Category:</span>
                <span className="font-semibold text-[var(--text)]">{selectedMf.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Total Units Held:</span>
                <span className="font-mono font-semibold text-[var(--text)]">{selectedMf.units.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Latest NAV:</span>
                <span className="font-bold text-[var(--text)]">₹{selectedMf.currentNav}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Annualized Return (XIRR):</span>
                <span className="font-bold text-emerald-600">+{selectedMf.xirr}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-subtle)]">Absolute Return:</span>
                <span className="font-bold text-emerald-600">+{selectedMf.returnPercentage}%</span>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
