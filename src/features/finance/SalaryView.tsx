import { useState, useMemo } from "react";
import {
  Coins,
  Search,
  Filter,
  Download,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  Printer,
  ChevronRight,
  ShieldCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

interface EmployeeSalaryRecord {
  id: string;
  name: string;
  designation: string;
  department: "Field Operations" | "Skill Development" | "Health & Nutrition" | "Executive & Finance" | "M&E";
  location: string;
  workingDays: number;
  basicHra: number; // in Rupees
  allowance: number;
  pfDeduction: number;
  esiDeduction: number;
  tdsDeduction: number;
  netPay: number;
  bankAccount: string;
  bankName: string;
  ifsc: string;
  uan: string;
  status: "Disbursed" | "Pending" | "Hold";
}

const payrollMonths = ["September 2026", "August 2026", "July 2026", "June 2026"];

const sampleEmployees: EmployeeSalaryRecord[] = [
  {
    id: "PAN-EMP-0101",
    name: "Dr. Priyadarshini Mohapatra",
    designation: "Chief Medical Officer",
    department: "Health & Nutrition",
    location: "Bhubaneswar HQ",
    workingDays: 30,
    basicHra: 110000,
    allowance: 35000,
    pfDeduction: 13200,
    esiDeduction: 0,
    tdsDeduction: 16500,
    netPay: 115300,
    bankAccount: "38910294819",
    bankName: "State Bank of India",
    ifsc: "SBIN0001042",
    uan: "100918294819",
    status: "Disbursed"
  },
  {
    id: "PAN-EMP-0102",
    name: "Subhashree Ray",
    designation: "State Project Manager - Skills",
    department: "Skill Development",
    location: "Keonjhar Center",
    workingDays: 30,
    basicHra: 75000,
    allowance: 20000,
    pfDeduction: 9000,
    esiDeduction: 0,
    tdsDeduction: 8500,
    netPay: 77500,
    bankAccount: "502000491829",
    bankName: "HDFC Bank",
    ifsc: "HDFC0000284",
    uan: "100928194820",
    status: "Disbursed"
  },
  {
    id: "PAN-EMP-0103",
    name: "Alok Kumar Sahoo",
    designation: "Lead Technical Trainer",
    department: "Skill Development",
    location: "Rourkela Center",
    workingDays: 29,
    basicHra: 45000,
    allowance: 12000,
    pfDeduction: 5400,
    esiDeduction: 427,
    tdsDeduction: 2500,
    netPay: 48673,
    bankAccount: "918020039182",
    bankName: "Axis Bank",
    ifsc: "UTIB0000119",
    uan: "100938194831",
    status: "Disbursed"
  },
  {
    id: "PAN-EMP-0104",
    name: "Sunita Majhi",
    designation: "District Field Coordinator",
    department: "Field Operations",
    location: "Koraput District",
    workingDays: 30,
    basicHra: 38000,
    allowance: 10000,
    pfDeduction: 4560,
    esiDeduction: 360,
    tdsDeduction: 1200,
    netPay: 41880,
    bankAccount: "004205001928",
    bankName: "ICICI Bank",
    ifsc: "ICIC0000042",
    uan: "100948194842",
    status: "Disbursed"
  },
  {
    id: "PAN-EMP-0105",
    name: "Bishnu Charan Das",
    designation: "Senior M&E Analyst",
    department: "M&E",
    location: "Bhubaneswar HQ",
    workingDays: 30,
    basicHra: 62000,
    allowance: 18000,
    pfDeduction: 7440,
    esiDeduction: 0,
    tdsDeduction: 6200,
    netPay: 66360,
    bankAccount: "389201948102",
    bankName: "State Bank of India",
    ifsc: "SBIN0001042",
    uan: "100958194853",
    status: "Disbursed"
  },
  {
    id: "PAN-EMP-0106",
    name: "Debashis Nayak",
    designation: "Finance & Accounts Specialist",
    department: "Executive & Finance",
    location: "Bhubaneswar HQ",
    workingDays: 30,
    basicHra: 55000,
    allowance: 15000,
    pfDeduction: 6600,
    esiDeduction: 0,
    tdsDeduction: 4800,
    netPay: 58600,
    bankAccount: "502000918291",
    bankName: "HDFC Bank",
    ifsc: "HDFC0000284",
    uan: "100968194864",
    status: "Disbursed"
  },
  {
    id: "PAN-EMP-0107",
    name: "Kavita Soren",
    designation: "Community Health Nurse",
    department: "Health & Nutrition",
    location: "Mayurbhanj Mobile Clinic",
    workingDays: 28,
    basicHra: 32000,
    allowance: 8000,
    pfDeduction: 3840,
    esiDeduction: 300,
    tdsDeduction: 800,
    netPay: 35060,
    bankAccount: "919020048192",
    bankName: "Axis Bank",
    ifsc: "UTIB0000119",
    uan: "100978194875",
    status: "Disbursed"
  }
];

export function SalaryView() {
  const [selectedMonth, setSelectedMonth] = useState("September 2026");
  const [employees, setEmployees] = useState<EmployeeSalaryRecord[]>(sampleEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [selectedSlip, setSelectedSlip] = useState<EmployeeSalaryRecord | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = deptFilter === "all" || emp.department === deptFilter;
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [employees, deptFilter, searchQuery]);

  // Aggregate stats
  const totals = useMemo(() => {
    const gross = employees.reduce((acc, curr) => acc + curr.basicHra + curr.allowance, 0);
    const deductions = employees.reduce(
      (acc, curr) => acc + curr.pfDeduction + curr.esiDeduction + curr.tdsDeduction,
      0
    );
    const net = employees.reduce((acc, curr) => acc + curr.netPay, 0);
    return { gross, deductions, net };
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-indigo-950 to-emerald-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-indigo-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <Coins size={13} /> Payroll & Remuneration Desk
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Monthly Salary Register & Statutory Rollout
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Consolidated staff payroll register for {selectedMonth}. Includes EPF, ESIC, professional tax deductions, and automated corporate batch banking.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="focus-ring h-11 rounded-xl border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur outline-none"
            >
              {payrollMonths.map((m) => (
                <option key={m} value={m} className="text-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => alert("Bank NEFT Direct Debit batch file downloaded (142 beneficiary records).")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50"
            >
              <Download size={14} /> Download NEFT File
            </button>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Users size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              100% Disbursed
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            ₹{(totals.gross / 100000).toFixed(2)} Lakhs
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Gross Monthly Payroll</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">142 employees across field & HQ</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <ShieldCheck size={18} />
            </span>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-600">
              EPF / ESIC / TDS
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            ₹{(totals.deductions / 100000).toFixed(2)} Lakhs
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Statutory Deductions</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Ready for challan filing by 15th</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              SBI Corporate
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            ₹{(totals.net / 100000).toFixed(2)} Lakhs
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Net Disbursed Take-home</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Ref: SBINM0202609240001</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <Calendar size={18} />
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold text-teal-600">
              FY 2026-27
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">0 Days Delay</p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Payroll Timeliness</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Processed on 24th of current month</p>
        </article>
      </section>

      {/* Salary Register Table */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Coins size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Employee Salary Register</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Showing {filteredEmployees.length} of {employees.length} employee records
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
                placeholder="Search staff, Emp ID, designation..."
                className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Field Operations">Field Operations</option>
              <option value="Skill Development">Skill Development</option>
              <option value="Health & Nutrition">Health & Nutrition</option>
              <option value="Executive & Finance">Executive & Finance</option>
              <option value="M&E">M&E</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">
                <th className="pb-3 pl-3">Employee</th>
                <th className="pb-3">Department & Location</th>
                <th className="pb-3 text-right">Gross Pay</th>
                <th className="pb-3 text-right">EPF (12%)</th>
                <th className="pb-3 text-right">TDS</th>
                <th className="pb-3 text-right">Net Take-Home</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="transition-colors hover:bg-[var(--surface-soft)]">
                  <td className="py-3.5 pl-3">
                    <p className="font-semibold text-[var(--text)]">{emp.name}</p>
                    <p className="text-[10px] text-[var(--text-subtle)]">{emp.id} · {emp.designation}</p>
                  </td>
                  <td className="py-3.5">
                    <p className="font-medium text-[var(--text)]">{emp.department}</p>
                    <span className="text-[10px] text-[var(--text-subtle)]">{emp.location}</span>
                  </td>
                  <td className="py-3.5 text-right font-medium">
                    ₹{(emp.basicHra + emp.allowance).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-right font-mono text-[11px] text-[var(--text-muted)]">
                    ₹{emp.pfDeduction.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-right font-mono text-[11px] text-[var(--text-muted)]">
                    ₹{emp.tdsDeduction.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{emp.netPay.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                      <CheckCircle2 size={10} /> Disbursed
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSlip(emp)}
                      className="focus-ring inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--module-bg)]"
                    >
                      <FileText size={11} /> Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payslip Overlay */}
      {selectedSlip && (
        <Overlay
          open
          onClose={() => setSelectedSlip(null)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Salary Pay Slip"
          title={`Payslip for ${selectedMonth}`}
          description={`${selectedSlip.id} · ${selectedSlip.name} (${selectedSlip.designation})`}
          footer={
            <div className="flex w-full items-center justify-between">
              <span className="text-[10px] text-[var(--text-subtle)]">Confidential employee document</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="focus-ring inline-flex h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 text-xs font-semibold text-[var(--text-muted)]"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="focus-ring h-10 rounded-xl bg-[var(--brand-primary)] px-5 text-xs font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 p-6">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <h4 className="text-base font-bold text-[var(--text)]">Pantiss Foundation</h4>
                <p className="text-[10px] text-[var(--text-subtle)]">Plot #142, Infocity Road, Bhubaneswar, Odisha</p>
                <p className="text-[10px] text-[var(--text-subtle)]">Salary Slip: {selectedMonth}</p>
              </div>
              <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
                DISBURSED
              </span>
            </div>

            {/* Employee Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Employee ID</span>
                <p className="font-semibold text-[var(--text)]">{selectedSlip.id}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Department</span>
                <p className="font-semibold text-[var(--text)]">{selectedSlip.department}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Bank Account</span>
                <p className="font-mono font-semibold text-[var(--text)]">•••• {selectedSlip.bankAccount.slice(-4)}</p>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">EPF UAN</span>
                <p className="font-mono font-semibold text-[var(--text)]">{selectedSlip.uan}</p>
              </div>
            </div>

            {/* Earnings & Deductions Breakdown */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <h5 className="border-b border-[var(--border)] pb-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Earnings
                </h5>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Basic Pay + HRA</span>
                    <span className="font-semibold text-[var(--text)]">₹{selectedSlip.basicHra.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Special & Field Allowance</span>
                    <span className="font-semibold text-[var(--text)]">₹{selectedSlip.allowance.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold">
                    <span>Total Earnings</span>
                    <span>₹{(selectedSlip.basicHra + selectedSlip.allowance).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <h5 className="border-b border-[var(--border)] pb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                  Deductions
                </h5>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Employee EPF (12%)</span>
                    <span className="font-semibold text-[var(--text)]">₹{selectedSlip.pfDeduction.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">ESIC</span>
                    <span className="font-semibold text-[var(--text)]">₹{selectedSlip.esiDeduction.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Income Tax (TDS Section 192)</span>
                    <span className="font-semibold text-[var(--text)]">₹{selectedSlip.tdsDeduction.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2 flex justify-between font-bold text-red-500">
                    <span>Total Deductions</span>
                    <span>₹{(selectedSlip.pfDeduction + selectedSlip.esiDeduction + selectedSlip.tdsDeduction).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/80">Net Pay Disbursed</p>
                <p className="text-2xl font-extrabold">₹{selectedSlip.netPay.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-right text-[10px] text-white/80">
                Disbursed to {selectedSlip.bankName}
                <br />
                UTR Ref: SBINM0202609240001
              </p>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
