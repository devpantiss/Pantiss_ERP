import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Scale, CheckCircle2, Clock, CreditCard, ReceiptText } from "lucide-react";
import { formatCurrency } from "./data";
import { cn } from "../../utils/cn";

import { TaxFilingEditor, FilingDocument, type FilingTarget } from "./TaxFilingEditor";
import { loadTaxFilings, type TaxFiling } from "./taxFilingStore";

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
  status: "Filed" | "Filed on Time" | "Upcoming" | "Action Required";
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

const initialGstRecords: GstReturnRecord[] = [
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
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view");
  const activeTab = view === "tds" || view === "itc" ? view : "gst";
  const setActiveTab = (tab: string) => setSearchParams({ view: tab }, { replace: true });
  const [filings, setFilings] = useState<Record<string, TaxFiling>>({});
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState<FilingTarget | null>(null);
  useEffect(() => {
    let active = true;
    loadTaxFilings().then((records) => {
      if (active) setFilings(Object.fromEntries(records.map((record) => [record.id, record])));
    }).catch(() => { if (active) setStorageError("Saved filings could not be loaded. Reload the page to try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const gstRecords = initialGstRecords.map((record): GstReturnRecord => {
    const filing = filings[`${record.returnType}-${record.period}`];
    return filing ? { ...record, status: "Filed", filedDate: filing.filedDate, arn: filing.reference } : record;
  });
  const filingButton = (item: FilingTarget) => <button type="button" disabled={loading || !!storageError} onClick={() => setTarget(item)} className="focus-ring mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--brand-primary)] disabled:opacity-50">{filings[item.id] ? "Edit filing" : "Update filing / upload"}</button>;
  const filedReturns = gstRecords.filter((record) => record.filedDate);
  const creditRecords = gstRecords.filter((record) => record.returnType === "GSTR-3B");
  const claimedCredit = creditRecords.reduce((total, record) => total + (record.filedDate ? record.itcClaimed : 0), 0);
  const pendingCredit = creditRecords.reduce((total, record) => total + (!record.filedDate ? record.itcClaimed : 0), 0);
  const totalTds = tdsChallans.reduce((total, record) => total + record.amount, 0);
  const paidTds = tdsChallans.reduce((total, record) => total + (record.status === "Paid & Reconciled" ? record.amount : 0), 0);
  const rupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
  const monitors = [
    { id: "gst", label: "GST filing", icon: Scale, value: `${filedReturns.length} / ${gstRecords.length} filed`, detail: `${gstRecords.length - filedReturns.length} returns awaiting filing · All listed periods` },
    { id: "itc", label: "Input tax credit tracking", icon: ReceiptText, value: formatCurrency(claimedCredit, true), detail: `${formatCurrency(pendingCredit, true)} proposed · Monthly GSTR-3B records` },
    { id: "tds", label: "TDS filing (total)", icon: CreditCard, value: rupees(totalTds), detail: `${rupees(paidTds)} paid · ${rupees(totalTds - paidTds)} scheduled` },
  ] as const;

  return (
    <div className="space-y-6">
      {loading && <p role="status" className="text-sm text-[var(--text-muted)]">Loading saved filings…</p>}
      {storageError && <p role="alert" className="text-sm text-[var(--text)]">{storageError}</p>}
      {notice && <p role="status" className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text)]">{notice}</p>}
      {target && <TaxFilingEditor key={target.id} target={target} existing={filings[target.id]} onClose={() => setTarget(null)} onSaved={(filing) => {
        setFilings((current) => ({ ...current, [filing.id]: filing }));
        setNotice(`${target.title} marked as filed. Supporting document saved.`);
        setTarget(null);
      }} />}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="text-xs font-medium text-[var(--brand-primary)]">Taxation monitor</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">Filings, credits & tax deducted</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">Monitor GST filing, track input tax credit, and review total TDS with payment and return-filing status in one place.</p>
        <p className="mt-4 text-xs text-[var(--text-subtle)]">Sample records · FY 2026–27, plus the prior-year annual GST return</p>
      </section>

      <section aria-label="Taxation summary" className="grid gap-4 md:grid-cols-3">
        {monitors.map(({ id, label, icon: Icon, value, detail }) => <article key={id} className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--surface-soft)] text-[var(--brand-primary)]"><Icon size={18} aria-hidden="true" /></span><h3 className="text-sm font-medium text-[var(--text-muted)]">{label}</h3></div>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-[var(--text)]">{value}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--text-subtle)]">{detail}</p>
        </article>)}
      </section>

      <nav aria-label="Taxation monitoring views" className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-2 sm:grid-cols-3">
        {monitors.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={activeTab === id} onClick={() => setActiveTab(id)} className={cn("focus-ring flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition", activeTab === id ? "border-[var(--brand-primary)] bg-[var(--surface-soft)] text-[var(--brand-primary)]" : "border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-soft)]")}><Icon size={16} aria-hidden="true" />{label}</button>)}
      </nav>

      {/* Tab Content */}
      {activeTab === "gst" && (
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">GST filing register</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Pantiss Foundation · GSTIN: 21AAATP1049M1Z3 (Odisha Jurisdiction)
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-600">
              {filedReturns.length} filed · {gstRecords.length - filedReturns.length} pending
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                  <th className="pb-3 pl-3">Return Type</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Filed Date</th><th className="pb-3">ARN Reference</th>
                  <th className="pb-3 text-right">Taxable Turnover</th>
                  <th className="pb-3 text-right">ITC Claimed</th>
                  <th className="pb-3 text-right">Cash Paid</th>
                  <th className="pb-3 text-center">Status</th><th className="pb-3 pl-3">Filing & document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                {gstRecords.map((r, i) => (
                  <tr key={i} className="transition-colors hover:bg-[var(--surface-soft)]">
                    <td className="py-3.5 pl-3 font-bold text-[var(--text)]">{r.returnType}</td>
                    <td className="py-3.5 font-medium">{r.period}</td>
                    <td className="py-3.5 text-[var(--text-muted)]">{r.dueDate}</td>
                    <td className="py-3.5 text-[var(--text-muted)]">{r.filedDate ?? "—"}</td><td className="py-3.5 font-mono text-[10px] text-[var(--text-subtle)]">
                      {r.arn ?? "—"}
                    </td>
                    <td className="py-3.5 text-right font-medium">{formatCurrency(r.turnover, true)}</td>
                    <td className="py-3.5 text-right font-medium text-emerald-600">
                      {r.returnType === "GSTR-3B" && r.filedDate ? formatCurrency(r.itcClaimed, true) : "—"}
                    </td>
                    <td className="py-3.5 text-right font-bold">
                      {r.returnType === "GSTR-3B" && r.filedDate ? formatCurrency(r.netPaidCash, true) : "—"}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold",
                          r.filedDate
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-blue-500/10 text-blue-600"
                        )}
                      >
                        {r.filedDate ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 max-w-[220px]">
                      {filingButton({ id: `${r.returnType}-${r.period}`, title: `${r.returnType} · ${r.period}`, reference: r.arn, filedDate: r.filedDate ? (r.filedDate.includes("-") ? r.filedDate : new Date(`${r.filedDate} UTC`).toISOString().slice(0, 10)) : undefined })}
                      {filings[`${r.returnType}-${r.period}`] && <FilingDocument filing={filings[`${r.returnType}-${r.period}`]} />}
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">TDS filing (total)</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                TAN: BBNP10928M · Remitted directly through State Bank of India
              </p>
            </div>
            <span className="text-xs text-[var(--text-subtle)]">{["24Q", "26Q"].filter((form) => filings[`TDS-${form}-Q2-2026-27`]).length} / 2 returns filed</span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[{ label: "Total TDS in register", value: totalTds }, { label: "Paid & reconciled", value: paidTds }, { label: "Scheduled payment", value: totalTds - paidTds }].map((item) => <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="text-xs text-[var(--text-muted)]">{item.label}</p><p className="mt-2 text-xl font-semibold text-[var(--text)]">{rupees(item.value)}</p></div>)}
          </div>
          <h4 className="mt-6 text-sm font-semibold text-[var(--text)]">Return-filing status · Q2 FY 2026–27</h4>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Totals cover the August and September challans listed below. July data has not been provided. Update each return with its filing acknowledgement.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">{["24Q", "26Q"].map((form) => {
            const records = tdsChallans.filter((record) => form === "24Q" ? record.section === "192 (Salaries)" : record.section !== "192 (Salaries)");
            const filing = filings[`TDS-${form}-Q2-2026-27`];
            return <article key={form} className="rounded-xl border border-[var(--border)] p-4"><h5 className="text-sm font-semibold text-[var(--text)]">Form {form} · {form === "24Q" ? "Salaries" : "Non-salary"}</h5><p className="mt-2 text-lg font-semibold text-[var(--text)]">{rupees(records.reduce((sum, record) => sum + record.amount, 0))}</p><p className="mt-2 text-xs text-[var(--text-muted)]">Filing status: {filing ? "Filed" : "Not verified"}</p><p className="mt-1 text-xs text-[var(--text-subtle)]">Acknowledgement: {filing?.reference ?? "Not available"}</p>{filing && <p className="mt-1 text-xs text-[var(--text-muted)]">Filed on {filing.filedDate}</p>}{filingButton({ id: `TDS-${form}-Q2-2026-27`, title: `Form ${form} · Q2 FY 2026–27` })}{filing && <FilingDocument filing={filing} />}</article>;
          })}</div>
          <h4 className="mt-6 text-sm font-semibold text-[var(--text)]">Supporting challan register</h4>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                  <th className="pb-3 pl-3">Challan ID & Month</th>
                  <th className="pb-3">Withholding Section</th>
                  <th className="pb-3">BSR Code</th>
                  <th className="pb-3">Challan No.</th>
                  <th className="pb-3">Tender Date</th>
                  <th className="pb-3 text-right">TDS Amount</th>
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

      {activeTab === "itc" && (
        <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="text-base font-semibold text-[var(--text)]">Input tax credit tracking</h3>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Monthly GSTR-3B credits, separated into claimed and proposed amounts. Annual returns and GSTR-1 are excluded from credit totals to avoid double counting.</p>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs">
            <caption className="sr-only">Monthly input tax credit claims and reconciliation status</caption>
            <thead className="border-b border-[var(--border)] text-[var(--text-subtle)]"><tr>{["Period", "Claimed ITC", "Proposed ITC", "Claim status", "GSTR-2B reconciliation"].map((heading) => <th scope="col" key={heading} className="px-3 py-3 font-medium">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">{creditRecords.map((record) => <tr key={record.period}><td className="px-3 py-4 font-medium">{record.period}</td><td className="px-3 py-4">{formatCurrency(record.filedDate ? record.itcClaimed : 0, true)}</td><td className="px-3 py-4">{formatCurrency(record.filedDate ? 0 : record.itcClaimed, true)}</td><td className="px-3 py-4">{record.filedDate ? "Claimed in filed return" : "Not yet claimed"}</td><td className="px-3 py-4 text-[var(--text-muted)]">Awaiting reconciliation data</td></tr>)}</tbody>
            <tfoot className="border-t border-[var(--border)] text-[var(--text)]"><tr><th scope="row" className="px-3 py-4">Total</th><td className="px-3 py-4 font-semibold">{formatCurrency(claimedCredit, true)}</td><td className="px-3 py-4 font-semibold">{formatCurrency(pendingCredit, true)}</td><td colSpan={2} /></tr></tfoot>
          </table></div>
          <p className="mt-4 rounded-xl bg-[var(--surface-soft)] p-4 text-xs leading-5 text-[var(--text-muted)]">Invoice-level matching, eligible credit and mismatches are awaiting purchase-register and GSTR-2B data.</p>
        </section>
      )}
    </div>
  );
}
