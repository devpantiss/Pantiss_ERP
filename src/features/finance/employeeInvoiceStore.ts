import { useState, type SetStateAction } from "react";
import type { ClaimReceipt } from "./receiptStore";
import { skillingAuditSamples } from "./skillingAuditSamples";

export interface InvoiceAuditEvent {
  id: string;
  date: string;
  action: string;
  actor: string;
  detail: string;
}

export interface ReimbursementClaim {
  id: string;
  claimantName: string;
  employeeId: string;
  project: string;
  center: string;
  date: string;
  category: "Inter-District Travel" | "Field Mobilization" | "Accommodation & Food" | "Printing & Supplies" | "Emergency Float";
  amount: number; // in Rupees
  billsCount: number;
  description: string;
  receiptName: string;
  receipts?: ClaimReceipt[];
  status: "Pending Verification" | "Finance Approved" | "Disbursed" | "Rejected";
  managerApproved: boolean;
  financeAudited: boolean;
  payoutDate?: string;
  bankUtr?: string;
  audit?: InvoiceAuditEvent[];
  sample?: {
    type: "Invoice" | "Reimbursement";
    supplier: string;
    batch: string;
    budgetHead: string;
    items: { description: string; quantity: number; rate: number }[];
  };
}

const initialClaims: ReimbursementClaim[] = [
  ...skillingAuditSamples,
  {
    id: "CLM-2026-0182",
    claimantName: "Sunita Majhi",
    employeeId: "PAN-EMP-0104",
    project: "Tribal Producer Collective",
    center: "Koraput Regional Office",
    date: "27 Sep 2026",
    category: "Inter-District Travel",
    amount: 8450,
    billsCount: 4,
    description: "Travel to 6 tribal SHG clusters in Semiliguda and Kundra blocks for farmer registration.",
    receiptName: "koraput-travel-bills.pdf",
    status: "Finance Approved",
    managerApproved: true,
    financeAudited: true
  },
  {
    id: "CLM-2026-0181",
    claimantName: "Alok Kumar Sahoo",
    employeeId: "PAN-EMP-0103",
    project: "PMKVY 4.0 Odisha Skills",
    center: "Keonjhar Center",
    date: "26 Sep 2026",
    category: "Printing & Supplies",
    amount: 14200,
    billsCount: 2,
    description: "Emergency batch study materials, assessment answer sheets and lab badge lanyards.",
    receiptName: "print-invoice-keonjhar.pdf",
    status: "Pending Verification",
    managerApproved: true,
    financeAudited: false
  },
  {
    id: "CLM-2026-0180",
    claimantName: "Kavita Soren",
    employeeId: "PAN-EMP-0107",
    project: "Swasthya Mobile Clinics",
    center: "Mayurbhanj Mobile Clinic",
    date: "25 Sep 2026",
    category: "Field Mobilization",
    amount: 6800,
    billsCount: 3,
    description: "Community health mobilization shamiana rental & refreshment for screening camp in Baripada.",
    receiptName: "mayurbhanj-camp-receipts.pdf",
    status: "Disbursed",
    managerApproved: true,
    financeAudited: true,
    payoutDate: "27 Sep 2026",
    bankUtr: "HDFCR5202609270841"
  },
  {
    id: "CLM-2026-0179",
    claimantName: "Bishnu Charan Das",
    employeeId: "PAN-EMP-0105",
    project: "Maternal Health Continuum",
    center: "Bhubaneswar HQ",
    date: "24 Sep 2026",
    category: "Accommodation & Food",
    amount: 11500,
    billsCount: 3,
    description: "Donor evaluation team field visit stay and logistics in Rayagada.",
    receiptName: "hotel-rayagada-bills.pdf",
    status: "Disbursed",
    managerApproved: true,
    financeAudited: true,
    payoutDate: "26 Sep 2026",
    bankUtr: "SBINR2202609260192"
  },
  {
    id: "CLM-2026-0178",
    claimantName: "Debashis Nayak",
    employeeId: "PAN-EMP-0106",
    project: "Executive & Core Finance",
    center: "Bhubaneswar HQ",
    date: "23 Sep 2026",
    category: "Emergency Float",
    amount: 5200,
    billsCount: 1,
    description: "Statutory filing stamp papers, ROC courier and chartered accountant notarization fees.",
    receiptName: "notary-stamp-receipts.pdf",
    status: "Finance Approved",
    managerApproved: true,
    financeAudited: true
  }
];

const storageKey = "pantiss-employee-invoices-v1";

function readClaims(): ReimbursementClaim[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return initialClaims;
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every((item) => item && typeof item.id === "string" && typeof item.project === "string" && typeof item.claimantName === "string" && typeof item.amount === "number")) throw new Error("Invalid invoice data");
  const saved = parsed as ReimbursementClaim[];
  const ids = new Set(saved.map((claim) => claim.id));
  return [...skillingAuditSamples.filter((claim) => !ids.has(claim.id)), ...saved];
}

export function useEmployeeInvoices() {
  const [initial] = useState(() => {
    try { return { claims: readClaims(), error: "" }; }
    catch { return { claims: initialClaims, error: "Saved invoices could not be loaded. Reload before making changes." }; }
  });
  const [claims, updateClaims] = useState(initial.claims);
  const [error, setError] = useState(initial.error);
  const setClaims = (action: SetStateAction<ReimbursementClaim[]>): boolean => {
    if (initial.error) return false;
    const next = typeof action === "function" ? action(claims) : action;
    const recorded = next.map((claim) => {
      const previous = claims.find((item) => item.id === claim.id);
      if (previous && previous.status === claim.status) return claim;
      const event: InvoiceAuditEvent = {
        id: crypto.randomUUID(), date: new Date().toISOString(),
        action: !previous ? "Invoice raised" : claim.status === "Finance Approved" ? "Finance approval recorded" : claim.status === "Disbursed" ? "Disbursement recorded" : "Invoice status updated",
        actor: !previous ? `${claim.claimantName} (${claim.employeeId})` : "Finance workflow",
        detail: !previous ? `${claim.description} · Supporting document: ${claim.receiptName}` : `${previous.status} → ${claim.status}${claim.bankUtr ? ` · UTR: ${claim.bankUtr}` : ""}`,
      };
      const history = previous?.audit ?? (previous ? [{ id: `${claim.id}-opening`, date: previous.date, action: "Opening record", actor: previous.claimantName, detail: `Existing status: ${previous.status}. Earlier event timestamps are unavailable.` }] : []);
      return { ...claim, audit: [...history, event] };
    });
    try { localStorage.setItem(storageKey, JSON.stringify(recorded)); updateClaims(recorded); setError(""); return true; }
    catch { setError("Invoice changes could not be saved. Browser storage may be full or unavailable. Please try again."); return false; }
  };
  return { claims, setClaims, error };
}
