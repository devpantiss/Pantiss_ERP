import type { ReimbursementClaim, InvoiceAuditEvent } from "./employeeInvoiceStore";

type SampleInput = {
  number: number;
  employee: string;
  employeeId: string;
  type: "Invoice" | "Reimbursement";
  category: ReimbursementClaim["category"];
  supplier: string;
  description: string;
  quantity: number;
  rate: number;
  day: number;
  status: ReimbursementClaim["status"];
  note?: string;
};

function sample(input: SampleInput): ReimbursementClaim {
  const id = `DEMO-SKILL-${input.number}`;
  const timestamp = (offset: number, time = "10:00") => `2026-09-${String(input.day + offset).padStart(2, "0")}T${time}:00+05:30`;
  const events: InvoiceAuditEvent[] = [];
  const add = (offset: number, action: string, actor: string, detail: string) => events.push({ id: `${id}-${events.length + 1}`, date: timestamp(offset), action, actor, detail });
  add(0, `${input.type} submitted`, `${input.employee} (${input.employeeId})`, `${input.description} · Batch ODS-KJR-026 · Cost centre SKILL-KJR.`);
  add(1, "Supporting invoice checked", "Meera Das · Centre coordinator", `Sample document ${id}.pdf linked. Supplier: ${input.supplier}. Quantity and expense purpose reviewed.`);
  if (input.status === "Rejected") {
    add(2, "Claim rejected", "Rohit Sen · Finance reviewer", input.note ?? "Duplicate expense found in a previously settled claim. No payment released.");
  } else {
    add(2, "Programme manager approved", "Priya Mishra · Programme manager", "Expense confirmed against the training batch plan and project budget.");
    if (input.status !== "Pending Verification") add(3, "Finance approval recorded", "Rohit Sen · Finance reviewer", "Supporting amount matched to the claim. Approved for payment.");
    if (input.status === "Disbursed") {
      add(4, "Disbursement recorded", "Anita Rao · Treasury officer", `₹${(input.quantity * input.rate).toLocaleString("en-IN")} paid to ${input.type === "Reimbursement" ? input.employee : input.supplier}. Reference DEMO-UTR-${input.number}.`);
      add(5, "Payment reconciled", "Rohit Sen · Finance reviewer", "Sample bank entry matched to payment voucher. Claim closed.");
    }
  }
  return {
    id, claimantName: input.employee, employeeId: input.employeeId,
    project: "PMKVY 4.0 Odisha Skills", center: "Keonjhar Center", date: timestamp(0),
    category: input.category, amount: input.quantity * input.rate, billsCount: 1,
    description: input.description, receiptName: `${id}.pdf`, status: input.status,
    managerApproved: input.status !== "Rejected", financeAudited: ["Finance Approved", "Disbursed"].includes(input.status),
    ...(input.status === "Disbursed" ? { payoutDate: timestamp(4), bankUtr: `DEMO-UTR-${input.number}` } : {}),
    audit: events,
    sample: { type: input.type, supplier: input.supplier, batch: "ODS-KJR-026 · Assistant Electrician", budgetHead: input.category, items: [{ description: input.description, quantity: input.quantity, rate: input.rate }] },
  };
}

// Fictional demonstration records, deliberately labelled and isolated by stable IDs.
export const skillingAuditSamples: ReimbursementClaim[] = [
  { number: 101, employee: "Alok Kumar Sahoo", employeeId: "PAN-EMP-0103", type: "Invoice", category: "Printing & Supplies", supplier: "Demo Utkal Learning Supplies", description: "Learner workbooks and assessment packs for 60 trainees", quantity: 60, rate: 320, day: 3, status: "Disbursed" },
  { number: 102, employee: "Rina Behera", employeeId: "DEMO-EMP-021", type: "Reimbursement", category: "Inter-District Travel", supplier: "Demo Keonjhar Travel Desk", description: "Mobilisation visits to six villages: approved local transport", quantity: 6, rate: 850, day: 5, status: "Disbursed" },
  { number: 103, employee: "Sanjay Pradhan", employeeId: "DEMO-EMP-022", type: "Invoice", category: "Printing & Supplies", supplier: "Demo Skill Lab Stores", description: "Electrical practice kits for supervised practical sessions", quantity: 30, rate: 1250, day: 8, status: "Disbursed" },
  { number: 104, employee: "Rina Behera", employeeId: "DEMO-EMP-021", type: "Reimbursement", category: "Accommodation & Food", supplier: "Demo Training Guest House", description: "Trainer accommodation during the five-day assessment camp", quantity: 5, rate: 1800, day: 14, status: "Finance Approved" },
  { number: 105, employee: "Meera Das", employeeId: "DEMO-EMP-023", type: "Invoice", category: "Field Mobilization", supplier: "Demo Community Events", description: "Venue and seating for two learner counselling sessions", quantity: 2, rate: 4500, day: 18, status: "Finance Approved" },
  { number: 106, employee: "Sanjay Pradhan", employeeId: "DEMO-EMP-022", type: "Reimbursement", category: "Inter-District Travel", supplier: "Demo Regional Transport", description: "Trainer travel for employer placement visits", quantity: 3, rate: 1200, day: 24, status: "Pending Verification" },
  { number: 107, employee: "Alok Kumar Sahoo", employeeId: "PAN-EMP-0103", type: "Invoice", category: "Printing & Supplies", supplier: "Demo Utkal Learning Supplies", description: "Completion certificate folders for 60 learners", quantity: 60, rate: 75, day: 25, status: "Pending Verification" },
  { number: 108, employee: "Rina Behera", employeeId: "DEMO-EMP-021", type: "Reimbursement", category: "Accommodation & Food", supplier: "Demo Training Guest House", description: "Accommodation claim submitted again against an already approved receipt", quantity: 1, rate: 1800, day: 20, status: "Rejected", note: "Receipt duplicates DEMO-SKILL-104 supporting documentation. Original claim is approved and awaiting payment. Employee asked to submit a corrected claim; no payment authorised." },
].map((input) => sample(input as SampleInput));
