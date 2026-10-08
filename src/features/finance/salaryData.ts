export interface EmployeeSalaryRecord {
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

export const payrollMonths = ["2026-09", "2026-08", "2026-07", "2026-06"];

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


export interface SalaryRecord extends EmployeeSalaryRecord {
  month: string;
  projectId: string;
  adminApproval: "Approved" | "Pending" | "Rejected";
  adminApprovedBy?: string;
  adminApprovedOn?: string;
  hrApproval: "Approved" | "Pending" | "Rejected";
  hrApprovedBy?: string;
  hrApprovedOn?: string;
  hrReason?: string;
  approvalStatus: "Approved" | "Pending approval" | "Rejected";
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
  forwardedAt?: string;
  forwardedBy?: string;
  paidOn?: string;
  reference?: string;
}

// Explicit demo assignments to projects in the shared finance catalogue.
const employeeProjects: Record<string, string> = {
  "PAN-EMP-0101": "FIN-HEA-01",
  "PAN-EMP-0102": "FIN-SKI-01",
  "PAN-EMP-0103": "FIN-SKI-01",
  "PAN-EMP-0104": "FIN-LIV-01",
  "PAN-EMP-0105": "FIN-RES-01",
  "PAN-EMP-0106": "FIN-SKI-02",
  "PAN-EMP-0107": "FIN-HEA-01",
};

export const salaryKey = (record: Pick<SalaryRecord, "id" | "month">) => `${record.id}:${record.month}`;
export const salaryMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
export const salaryMonthLabel = (month: string) => new Date(`${month}-01T12:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
export const salaryDateLabel = (date?: string) => date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export function createSalaryRecords(): SalaryRecord[] {
  return payrollMonths.flatMap(month => sampleEmployees.map((employee, index) => {
    const status = month === "2026-09" && index === 2 ? "Pending" : month === "2026-09" && index === 6 ? "Hold" : employee.status;
    return {
      ...employee, month, projectId: employeeProjects[employee.id], status,
      adminApproval: status === "Hold" ? "Pending" as const : "Approved" as const,
      ...(status !== "Hold" ? { adminApprovedBy: "Admin (demo)", adminApprovedOn: `${month}-20` } : {}),
      hrApproval: status === "Disbursed" ? "Approved" as const : "Pending" as const,
      ...(status === "Disbursed" ? { hrApprovedBy: "HR Manager (demo)", hrApprovedOn: `${month}-21` } : {}),
      approvalStatus: status === "Hold" ? "Pending approval" as const : "Approved" as const,
      ...(status !== "Hold" ? { approvedBy: "Payroll approver (demo)", approvedOn: `${month}-22` } : {}),
      ...(status === "Disbursed" ? { forwardedAt: `${month}-23T10:00:00.000Z`, forwardedBy: "Finance Manager (demo)", paidOn: `${month}-24`, reference: `DEMO-${month.replace("-", "")}-${employee.id.slice(-4)}` } : {}),
    };
  }));
}

export function salaryTotals(records: SalaryRecord[]) {
  return records.reduce((total, record) => ({
    employees: total.employees + 1,
    gross: total.gross + record.basicHra + record.allowance,
    deductions: total.deductions + record.pfDeduction + record.esiDeduction + record.tdsDeduction,
    net: total.net + record.netPay,
    paid: total.paid + (record.status === "Disbursed" ? record.netPay : 0),
    outstanding: total.outstanding + (record.status !== "Disbursed" ? record.netPay : 0),
    paidCount: total.paidCount + Number(record.status === "Disbursed"),
  }), { employees: 0, gross: 0, deductions: 0, net: 0, paid: 0, outstanding: 0, paidCount: 0 });
}

export interface SalaryPaymentUpdate {
  status: SalaryRecord["status"];
  paidOn: string;
  reference: string;
}

export function updateSalaryPayment(records: SalaryRecord[], key: string, update: SalaryPaymentUpdate): SalaryRecord[] {
  if (!records.some(record => salaryKey(record) === key)) throw new Error("This salary record could not be found.");
  if (!["Disbursed", "Pending", "Hold"].includes(update.status)) throw new Error("Choose a valid payment status.");
  if (update.status === "Disbursed") {
    const date = new Date(`${update.paidOn}T00:00:00Z`);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(update.paidOn) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== update.paidOn || update.paidOn > todayKey) throw new Error("Enter a valid payment date that is not in the future.");
    if (!update.reference.trim()) throw new Error("Enter a bank transaction reference.");
  }
  return records.map(record => salaryKey(record) === key ? {
    ...record, status: update.status,
    paidOn: update.status === "Disbursed" ? update.paidOn : undefined,
    reference: update.status === "Disbursed" ? update.reference.trim() : undefined,
  } : record);
}

export function canForwardSalary(record: SalaryRecord): boolean {
  return isFinanceEligible(record) && record.approvalStatus === "Approved" && record.status === "Pending" && !record.forwardedAt;
}

export function forwardSalaryForPayment(records: SalaryRecord[], key: string, actor: string): SalaryRecord[] {
  const record = records.find(record => salaryKey(record) === key);
  if (!record) throw new Error("This salary record could not be found.");
  if (!canForwardSalary(record)) throw new Error("Only approved, pending salaries that have not been forwarded can be sent for payment.");
  if (!actor.trim()) throw new Error("The forwarding employee must be identified.");
  return records.map(record => salaryKey(record) === key ? { ...record, forwardedAt: new Date().toISOString(), forwardedBy: actor.trim() } : record);
}

export function recordSalaryDisbursement(records: SalaryRecord[], key: string, update: SalaryPaymentUpdate): SalaryRecord[] {
  const record = records.find(record => salaryKey(record) === key);
  if (!record || !isFinanceEligible(record) || record.approvalStatus !== "Approved" || !record.forwardedAt || record.status !== "Pending") throw new Error("This salary is not ready for payment. It must be approved and forwarded first.");
  if (update.status !== "Disbursed") throw new Error("Record a completed payment from the payment desk.");
  return updateSalaryPayment(records, key, update);
}

export function approveSalaryRecord(records: SalaryRecord[], key: string, approver: string): SalaryRecord[] {
  const record = records.find(record => salaryKey(record) === key);
  if (!record) throw new Error("This salary record could not be found.");
  if (!isFinanceEligible(record)) throw new Error("Admin and HR approval are required before Finance can process this salary.");
  const today = new Date().toISOString().slice(0, 10);
  return records.map(record => salaryKey(record) === key ? {
    ...record,
    approvalStatus: "Approved" as const,
    approvedBy: approver.trim() || "Finance Approver",
    approvedOn: today,
    status: record.status === "Hold" ? "Pending" as const : record.status,
  } : record);
}

export function rejectSalaryRecord(records: SalaryRecord[], key: string, reason?: string): SalaryRecord[] {
  const record = records.find(record => salaryKey(record) === key);
  if (!record) throw new Error("This salary record could not be found.");
  if (!isFinanceEligible(record)) throw new Error("Admin and HR approval are required before Finance can process this salary.");
  return records.map(record => salaryKey(record) === key ? {
    ...record,
    approvalStatus: "Rejected" as const,
    rejectionReason: reason?.trim(),
    status: "Hold" as const,
    forwardedAt: undefined,
    forwardedBy: undefined,
  } : record);
}

export function forwardMultipleSalariesForPayment(records: SalaryRecord[], keys: string[], actor: string): SalaryRecord[] {
  const now = new Date().toISOString();
  const keySet = new Set(keys);
  return records.map(record => {
    if (keySet.has(salaryKey(record)) && canForwardSalary(record)) {
      return { ...record, forwardedAt: now, forwardedBy: actor.trim() || "Finance Manager" };
    }
    return record;
  });
}

export function salaryWorkflowLabel(record: SalaryRecord): string {
  if (record.adminApproval !== "Approved") return `Admin ${record.adminApproval.toLowerCase()}`;
  if (record.hrApproval !== "Approved") return `HR ${record.hrApproval.toLowerCase()}`;
  if (record.status === "Disbursed") return "Disbursed";
  if (record.approvalStatus !== "Approved") return record.approvalStatus;
  if (record.status === "Hold") return "On hold";
  return record.forwardedAt ? "Forwarded for payment" : "Ready to forward";
}


/** Finance must never receive records before both upstream approvals. */
export function isFinanceEligible(record: SalaryRecord): boolean {
  return record.adminApproval === "Approved" && record.hrApproval === "Approved";
}

export function reviewSalaryByHR(records: SalaryRecord[], key: string, decision: "Approved" | "Rejected", actor: string, reason = ""): SalaryRecord[] {
  const record = records.find(item => salaryKey(item) === key);
  if (!record) throw new Error("Salary record not found.");
  if (record.adminApproval !== "Approved") throw new Error("Admin must approve this salary before HR can review it.");
  if (record.hrApproval !== "Pending" || record.status === "Disbursed" || record.forwardedAt) throw new Error("This salary has already been reviewed or processed.");
  if (!actor.trim()) throw new Error("An HR reviewer is required.");
  if (decision === "Rejected" && !reason.trim()) throw new Error("Add a reason before returning the salary.");
  return records.map(item => salaryKey(item) === key ? {
    ...item, hrApproval: decision, hrApprovedBy: actor.trim(), hrApprovedOn: new Date().toISOString(), hrReason: reason.trim(),
    approvalStatus: "Pending approval", approvedBy: undefined, approvedOn: undefined,
    status: decision === "Approved" ? "Pending" : "Hold",
  } : item);
}
