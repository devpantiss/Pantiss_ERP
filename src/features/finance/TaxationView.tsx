import { useState, useMemo } from "react";
import {
  Scale,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Download,
  Building2,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { formatCurrency } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

interface GstReturnRecord {
  period: string;
  returnType: "GSTR-1" | "GSTR-3B" | "GSTR-9";
  dueDate: string;
  filedDate?: string;
  arn?: string;
  turnover: number; // in Lakhs
  taxLiability: number; // in Lakhs
  itcClaimed: number; // in Lakhs
  netPaidCash: number;
  status: "Filed on Time" | "Upcoming" | "Action Required";
}

interface TdsChallanRecord {
  challanId: string;
  month: string;
  section: "194C (Contractors)" | "194J (Professionals)" | "192 (Salaries)" | "194I (Rent)";
  amount: number; // in Rupees
  bsrCode: string;
  challanNo: string;
  tenderDate: string;
  cin: string;
  status: "Paid & Reconciled" | "Scheduled";
}

const gstRecords: GstReturnRecord[] = [
  {
    period: "August 2026",
    returnType: "GSTR-3B",
    dueDate: "20 Sep 2026",
    filedDate: "18 Sep 2026",
    arn: "AA2108260018491",
    turnover: 98.4,
    taxLiability: 12.4,
    itcClaimed: 7.58,
    netPaidCash: 4.82,
    status: "Filed on Time"
  },
  {
    period: "August 2026",
    returnType: "GSTR-1",
    dueDate: "11 Sep 2026",
    filedDate: "09 Sep 2026",
    arn: "AA2108260009182",
    turnover: 98.4,
    taxLiability: 12.4,
    itcClaimed: 0,
    netPaidCash: 0,
    status: "Filed on Time"
  },
  {
    period: "September 2026",
    returnType: "GSTR-1",
    dueDate: "11 Oct 2026",
    turnover: 104.2,
    taxLiability: 13.8,
    itcClaimed: 8.1,
    netPaidCash: 5.7,
    status: "Upcoming"
  },
  {
    period: "September 2026",
    returnType: "GSTR-3B",
    dueDate: "20 Oct 2026",
    turnover: 104.2,
    taxLiability: 13.8,
    itcClaimed: 8.1,
    netPaidCash: 5.7,
    status: "Upcoming"
  },
  {
    period: "FY 2025-26",
    returnType: "GSTR-9",
    dueDate: "31 Dec 2026",
    turnover: 1140.0,
    taxLiability: 142.0,
    itcClaimed: 89.0,
    netPaidCash: 53.0,
    status: "Upcoming"
  }
];

const tdsChallans: TdsChallanRecord[] = [
  {
    challanId: "CHL-2026-081",
    month: "August 2026",
    section: "194C (Contractors)",
    amount: 148500,
    bsrCode: "0001042",
    challanNo: "09182",
    tenderDate: "07 Sep 2026",
    cin: "SBIN2609000104209182",
    status: "Paid & Reconciled"
  },
  {
    challanId: "CHL-2026-082",
    month: "August 2026",
    section: "194J (Professionals)",
    amount: 224000,
    bsrCode: "0001042",
    challanNo: "09183",
    tenderDate: "07 Sep 2026",
    cin: "SBIN2609000104209183",
    status: "Paid & Reconciled"
  },
  {
    challanId: "CHL-2026-083",
    month: "August 2026",
    section: "192 (Salaries)",
    amount: 270000,
    bsrCode: "0001042",
    challanNo: "09184",
    tenderDate: "07 Sep 2026",
    cin: "SBIN2609000104209184",
    status: "Paid & Reconciled"
  },
  {
    challanId: "CHL-2026-091",
    month: "September 2026",
    section: "194C (Contractors)",
    amount: 162000,
    bsrCode: "0001042",
    challanNo: "Pending",
    tenderDate: "Due 07 Oct 2026",
    cin: "Scheduled",
    status: "Scheduled"
  },
  {
    challanId: "CHL-2026-092",
    month: "September 2026",
    section: "194J (Professionals)",
    amount: 215000,
    bsrCode: "0001042",
    challanNo: "Pending",
    tenderDate: "Due 07 Oct 2026",
    cin: "Scheduled",
    status: "Scheduled"
  }
];

export function TaxationView() {
  const [activeTab, setActiveTab] = useState<"gst" | "tds" | "fcra">("gst");
  const [selectedChallan, setSelectedChallan] = useState<TdsChallanRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Scale size={13} /> Statutory Tax & Regulatory Compliance
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Goods & Services Tax, TDS & 12A/80G Desk
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Integrated statutory tax registry for GST returns, Challan ITNS-281 withholding tax remittances, 26AS matching, and charitable trust tax exemptions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Statutory Tax Compliance Pack FY 2026-27 (Q1-Q2) downloaded.")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50"
            >
              <Download size={14} /> Download Tax Audit Pack
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Scale size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              Active GSTIN
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">₹4.82 Lakhs</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Net Cash GST Paid (Last Month)</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Output ₹12.40L less Input Credit ₹7.58L</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <CreditCard size={18} />
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold text-teal-600">
              Challan 281
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">₹6.42 Lakhs</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">TDS Remitted Last Month</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">100% matched against Form 26AS</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              Compliant
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">12A & 80G</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Income Tax Exemption Status</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Valid through FY 2028-29</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <Calendar size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              Next Deadline
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">07 Oct 2026</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">TDS Challan Filing Due</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">September withholding remittance</p>
        </article>
      </section>

      {/* Tabs */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-2 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("gst")}
            className={cn(
              "focus-ring flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
              activeTab === "gst"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            )}
          >
            <Scale size={15} /> Goods & Services Tax (GST)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tds")}
            className={cn(
              "focus-ring flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
              activeTab === "tds"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            )}
          >
            <CreditCard size={15} /> TDS Challans & ITNS 281
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fcra")}
            className={cn(
              "focus-ring flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold transition",
              activeTab === "fcra"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
            )}
          >
            <ShieldCheck size={15} /> 12A / 80G & FCRA Exemptions
          </button>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === "gst" && (
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">GST Return Filings Schedule</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Pantiss Foundation · GSTIN: 21AAATP1049M1Z3 (Odisha Jurisdiction)
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-600">
              Good Compliance Standing
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                  <th className="pb-3 pl-3">Return Type</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">ARN Reference</th>
                  <th className="pb-3 text-right">Taxable Turnover</th>
                  <th className="pb-3 text-right">Input Tax Credit</th>
                  <th className="pb-3 text-right">Cash Paid</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                {gstRecords.map((r, i) => (
                  <tr key={i} className="transition-colors hover:bg-[var(--surface-soft)]">
                    <td className="py-3.5 pl-3 font-bold text-[var(--text)]">{r.returnType}</td>
                    <td className="py-3.5 font-medium">{r.period}</td>
                    <td className="py-3.5 text-[var(--text-muted)]">{r.dueDate}</td>
                    <td className="py-3.5 font-mono text-[10px] text-[var(--text-subtle)]">
                      {r.arn ?? "—"}
                    </td>
                    <td className="py-3.5 text-right font-medium">{formatCurrency(r.turnover)}</td>
                    <td className="py-3.5 text-right font-medium text-emerald-600">
                      {r.itcClaimed ? formatCurrency(r.itcClaimed) : "—"}
                    </td>
                    <td className="py-3.5 text-right font-bold">
                      {r.netPaidCash ? formatCurrency(r.netPaidCash) : "—"}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                          r.status === "Filed on Time"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {r.status === "Filed on Time" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "tds" && (
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">TDS Challan ITNS-281 Register</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                TAN: BBNP10928M · Remitted directly through State Bank of India
              </p>
            </div>
            <span className="text-xs text-[var(--text-subtle)]">Quarterly Form 24Q & 26Q compliant</span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                  <th className="pb-3 pl-3">Challan ID & Month</th>
                  <th className="pb-3">Withholding Section</th>
                  <th className="pb-3">BSR Code</th>
                  <th className="pb-3">Challan No.</th>
                  <th className="pb-3">Tender Date</th>
                  <th className="pb-3 text-right">Tax Deducted & Paid</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                {tdsChallans.map((c) => (
                  <tr key={c.challanId} className="transition-colors hover:bg-[var(--surface-soft)]">
                    <td className="py-3.5 pl-3">
                      <p className="font-semibold text-[var(--text)]">{c.challanId}</p>
                      <p className="text-[10px] text-[var(--text-subtle)]">{c.month}</p>
                    </td>
                    <td className="py-3.5 font-medium">{c.section}</td>
                    <td className="py-3.5 font-mono text-[11px] text-[var(--text-muted)]">{c.bsrCode}</td>
                    <td className="py-3.5 font-mono text-[11px] text-[var(--text-muted)]">{c.challanNo}</td>
                    <td className="py-3.5 text-[var(--text-muted)]">{c.tenderDate}</td>
                    <td className="py-3.5 text-right font-bold text-[var(--text)]">
                      ₹{c.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                          c.status === "Paid & Reconciled"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        )}
                      >
                        {c.status === "Paid & Reconciled" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "fcra" && (
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-6 shadow-[var(--shadow-card)] space-y-6">
          <div className="border-b border-[var(--border)] pb-4">
            <h3 className="text-base font-semibold text-[var(--text)]">
              Tax Exemption & Non-Profit Statutory Certifications
            </h3>
            <p className="text-xs text-[var(--text-subtle)]">
              Registered charitable foundation exemptions under Indian Income Tax Act 1961
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-600">
                12A CERTIFICATE
              </span>
              <h4 className="mt-3 text-sm font-bold text-[var(--text)]">Tax Exemption on Income</h4>
              <p className="mt-1 font-mono text-xs text-[var(--text-subtle)]">URN: AABTP1049ME20214</p>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                Exempts foundation from corporate income tax under Section 12AA/12AB. Valid through Assessment Year 2029-30.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
              <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[9px] font-bold text-blue-600">
                80G CERTIFICATE
              </span>
              <h4 className="mt-3 text-sm font-bold text-[var(--text)]">Donor 50% Tax Deduction</h4>
              <p className="mt-1 font-mono text-xs text-[var(--text-subtle)]">URN: AABTP1049MF20215</p>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                Allows corporate and individual CSR donors to claim 50% tax deductions on all contributions. Annual Form 10BD filed.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
              <span className="rounded-full bg-purple-500/10 px-2.5 py-1 text-[9px] font-bold text-purple-600">
                FCRA DESIGNATED
              </span>
              <h4 className="mt-3 text-sm font-bold text-[var(--text)]">Foreign Contribution Regulation</h4>
              <p className="mt-1 font-mono text-xs text-[var(--text-subtle)]">FCRA Reg: 104928192</p>
              <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
                SBI New Delhi Main Branch designated FCRA account active. Annual Form FC-4 returns audited and filed.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
