import { useEffect, useState } from "react";
import {
  createSalaryRecords,
  isFinanceEligible,
  reviewSalaryByHR,
  salaryKey,
  updateSalaryPayment,
  forwardSalaryForPayment,
  forwardMultipleSalariesForPayment,
  approveSalaryRecord,
  rejectSalaryRecord,
  recordSalaryDisbursement,
  type SalaryPaymentUpdate,
  type SalaryRecord
} from "./salaryData";

export const salaryStorageKey = "pantiss:salary-payments:v1";

export interface StoredSalaryPayment extends SalaryPaymentUpdate {
  key: string;
  hrApproval?: SalaryRecord["hrApproval"];
  hrApprovedBy?: string;
  hrApprovedOn?: string;
  hrReason?: string;
  forwardedAt?: string;
  forwardedBy?: string;
  approvalStatus?: SalaryRecord["approvalStatus"];
  approvedBy?: string;
  approvedOn?: string;
  rejectionReason?: string;
}

export function readSavedSalaryRecords(): { records: SalaryRecord[]; error: string } {
  const seed = createSalaryRecords();
  try {
    const raw = localStorage.getItem(salaryStorageKey);
    if (!raw) return { records: seed, error: "" };
    const updates: unknown = JSON.parse(raw);
    if (!Array.isArray(updates)) throw new Error("Invalid saved payroll");
    const records = updates.reduce((acc: SalaryRecord[], item: unknown) => {
      if (!item || typeof item !== "object") throw new Error("Invalid payment");
      const update = item as StoredSalaryPayment;
      if (typeof update.key !== "string" || typeof update.status !== "string") throw new Error("Invalid payment");
      return updateSalaryPayment(acc, update.key, update).map(record => {
        if (salaryKey(record) !== update.key) return record;
        return {
          ...record,
          hrApproval: update.hrApproval ?? record.hrApproval,
          hrApprovedBy: update.hrApprovedBy ?? record.hrApprovedBy,
          hrApprovedOn: update.hrApprovedOn ?? record.hrApprovedOn,
          hrReason: update.hrReason,
          forwardedAt: update.forwardedAt ?? record.forwardedAt,
          forwardedBy: update.forwardedBy ?? record.forwardedBy,
          approvalStatus: update.approvalStatus ?? record.approvalStatus,
          approvedBy: update.approvedBy ?? record.approvedBy,
          approvedOn: update.approvedOn ?? record.approvedOn,
          rejectionReason: update.rejectionReason,
        };
      });
    }, seed);
    return { records, error: "" };
  } catch {
    return { records: seed, error: "Saved salary payments could not be loaded. Demo records are shown; reload before making changes to saved payments." };
  }
}

export function useSalaryRecords(scope: "finance" | "hr" = "finance") {
  const [state, setState] = useState(readSavedSalaryRecords);
  useEffect(() => {
    const refresh = () => setState(readSavedSalaryRecords());
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);
  const persist = (transform: (records: SalaryRecord[]) => SalaryRecord[]) => {
    const latest = readSavedSalaryRecords();
    if (latest.error) throw new Error(latest.error);
    const records = transform(latest.records);
    const payments: StoredSalaryPayment[] = records.map(record => ({
      key: salaryKey(record),
      hrApproval: record.hrApproval,
      hrApprovedBy: record.hrApprovedBy,
      hrApprovedOn: record.hrApprovedOn,
      hrReason: record.hrReason,
      status: record.status,
      paidOn: record.paidOn ?? "",
      reference: record.reference ?? "",
      forwardedAt: record.forwardedAt,
      forwardedBy: record.forwardedBy,
      approvalStatus: record.approvalStatus,
      approvedBy: record.approvedBy,
      approvedOn: record.approvedOn,
      rejectionReason: record.rejectionReason,
    }));
    try {
      localStorage.setItem(salaryStorageKey, JSON.stringify(payments));
      window.dispatchEvent(new Event("storage"));
    } catch {
      throw new Error("Salary update could not be saved in this browser. Check available storage and try again.");
    }
    setState({ records, error: "" });
  };

  const forwardForPayment = (key: string, actor: string) => persist(records => forwardSalaryForPayment(records, key, actor));
  const forwardMultiple = (keys: string[], actor: string) => persist(records => forwardMultipleSalariesForPayment(records, keys, actor));
  const approveSalary = (key: string, approver: string) => persist(records => approveSalaryRecord(records, key, approver));
  const rejectSalary = (key: string, reason?: string) => persist(records => rejectSalaryRecord(records, key, reason));
  const savePayment = (key: string, update: SalaryPaymentUpdate) => persist(records => recordSalaryDisbursement(records, key, update));

  const reviewByHR = (key: string, decision: "Approved" | "Rejected", actor: string, reason?: string) => persist(records => reviewSalaryByHR(records, key, decision, actor, reason));

  return { ...state, records: scope === "hr" ? state.records : state.records.filter(isFinanceEligible), reviewByHR, savePayment, forwardForPayment, forwardMultiple, approveSalary, rejectSalary };
}

