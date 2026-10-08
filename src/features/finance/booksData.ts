import { financeAreas } from "./data";
import { budgetCategories, type BudgetCategory } from "./budgetCategories";

export const booksProjects = financeAreas.flatMap(area => area.projects);
export interface BookAuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
}
export interface BookEntry {
  audit?: BookAuditEvent[];
  id: string;
  projectId: string;
  head: BudgetCategory;
  date: string;
  payee: string;
  reference: string;
  narration: string;
  amount: number; // INR, unlike the existing project aggregates (lakhs).
  exportedAt?: string;
  source?: "tally";
  importedAt?: string;
  sourceCompany?: string;
  sourceVoucherId?: string;
  sourceCostCentre?: string;
  openingIncluded?: boolean;
}
export interface TallySettings {
  company: string;
  bankLedger: string;
  costCategory: string;
  ledgers: Record<BudgetCategory, string>;
  costCentres: Record<string, string>;
}
export const defaultTallySettings: TallySettings = {
  company: "", bankLedger: "", costCategory: "Primary Cost Category",
  ledgers: Object.fromEntries(budgetCategories.map(head => [head, head])) as Record<BudgetCategory, string>,
  costCentres: Object.fromEntries(booksProjects.map(project => [project.id, project.name])),
};
export const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount);
// XML 1.0 excludes these control characters from text content.
// eslint-disable-next-line no-control-regex
export const xmlEscape = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[<>&"']/g, char => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[char]!);
export function tallyXml(entries: BookEntry[], settings: TallySettings) {
  if (!entries.length || !settings.company.trim() || !settings.bankLedger.trim() || !settings.costCategory.trim()) throw new Error("Enter the Tally company, bank ledger and cost category before exporting.");
  const vouchers = entries.map(entry => {
    const ledger = settings.ledgers[entry.head]?.trim();
    const centre = settings.costCentres[entry.projectId]?.trim();
    if (!ledger || !centre) throw new Error("Map every selected budget head and project before exporting.");
    if (ledger === settings.bankLedger.trim()) throw new Error("The expense ledger and bank ledger must be different.");
    const amount = entry.amount.toFixed(2);
    return `<TALLYMESSAGE xmlns:UDF="TallyUDF"><VOUCHER VCHTYPE="Payment" ACTION="Create" OBJVIEW="Accounting Voucher View"><DATE>${entry.date.replaceAll("-", "")}</DATE><GUID>${xmlEscape(entry.id)}</GUID><VOUCHERTYPENAME>Payment</VOUCHERTYPENAME><VOUCHERNUMBER>${xmlEscape(entry.id)}</VOUCHERNUMBER><REFERENCE>${xmlEscape(entry.reference)}</REFERENCE><NARRATION>${xmlEscape(`${entry.payee}: ${entry.narration}`)}</NARRATION><ALLLEDGERENTRIES.LIST><LEDGERNAME>${xmlEscape(ledger)}</LEDGERNAME><ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-${amount}</AMOUNT><CATEGORYALLOCATIONS.LIST><CATEGORY>${xmlEscape(settings.costCategory)}</CATEGORY><ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><COSTCENTREALLOCATIONS.LIST><NAME>${xmlEscape(centre)}</NAME><AMOUNT>-${amount}</AMOUNT></COSTCENTREALLOCATIONS.LIST></CATEGORYALLOCATIONS.LIST></ALLLEDGERENTRIES.LIST><ALLLEDGERENTRIES.LIST><LEDGERNAME>${xmlEscape(settings.bankLedger)}</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>${amount}</AMOUNT></ALLLEDGERENTRIES.LIST></VOUCHER></TALLYMESSAGE>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME><STATICVARIABLES><SVCURRENTCOMPANY>${xmlEscape(settings.company)}</SVCURRENTCOMPANY></STATICVARIABLES></REQUESTDESC><REQUESTDATA>${vouchers}</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;
}
export function downloadBookFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function booksCsv(entries: BookEntry[]) {
  const cell = (value: string | number) => `"${String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
  return ["Voucher,Date,Project,Budget head,Payee,Reference,Amount (INR),Narration,Source,Tally company,Included in opening,Tally export", ...entries.map(entry => [entry.id, entry.date, booksProjects.find(p => p.id === entry.projectId)?.name ?? entry.projectId, entry.head, entry.payee, entry.reference, entry.amount, entry.narration, entry.source === "tally" ? "Tally import" : "Manual", entry.sourceCompany ?? "", entry.openingIncluded ? "Yes" : "No", entry.exportedAt ?? "Not exported"].map(cell).join(","))].join("\r\n");
}
