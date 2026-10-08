import type { FinanceProject } from "./data";

export interface ProjectTranche {
  no: number;
  percentage: number;
  tentativeDate: string;
  /** Super-admin approval; the invoice can only be raised once this is true. */
  adminApproved: boolean;
  adminApprovedAt?: string;
  /** Id of the client invoice raised against this tranche. */
  invoiceId?: string;
}

export type TrancheMap = Record<string, ProjectTranche[]>;

export const trancheStorageKey = "pantiss-project-tranches-v1";

const splits: number[][] = [[40, 30, 30], [50, 50], [30, 30, 20, 20], [25, 25, 25, 25]];

/** Seed invoices (see InvoicesView) already raised against these tranches. */
const seededInvoices: Record<string, Record<number, string>> = {
  "FIN-SKI-01": { 1: "seed-inv-1" },
  "FIN-HEA-01": { 2: "seed-inv-2" },
  "FIN-LIV-01": { 1: "seed-inv-3" },
  "FIN-NUT-01": { 3: "seed-inv-4" },
  "FIN-SAN-01": { 2: "seed-inv-5" },
  "FIN-RES-01": { 1: "seed-inv-8" },
};

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function seedTranches(project: FinanceProject, index: number): ProjectTranche[] {
  const split = splits[index % splits.length];
  const linked = seededInvoices[project.id] ?? {};
  const maxLinked = Math.max(0, ...Object.keys(linked).map(Number));
  return split.map((percentage, i) => {
    const no = i + 1;
    const invoiceId = linked[no];
    return {
      no,
      percentage,
      tentativeDate: isoOffset(-60 + i * 45 + (index % 4) * 6),
      // Everything up to the last raised tranche is approved, plus the next one in line.
      adminApproved: Boolean(invoiceId) || no <= maxLinked || no === Math.max(1, maxLinked + 1) && index % 3 !== 2,
      ...(invoiceId ? { invoiceId } : {}),
    };
  });
}

export function readTranches(): TrancheMap {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(trancheStorageKey) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as TrancheMap) : {};
  } catch {
    return {};
  }
}

export function writeTranches(map: TrancheMap) {
  localStorage.setItem(trancheStorageKey, JSON.stringify(map));
}

/** Returns the saved tranche plan for a project, seeding it on first access. */
export function getProjectTranches(map: TrancheMap, project: FinanceProject, index: number): ProjectTranche[] {
  return map[project.id] ?? seedTranches(project, index);
}
