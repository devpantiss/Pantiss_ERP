export interface PaymentListRecord {
  id: string;
  source: "Procurement" | "Center" | "Salary";
  title: string;
  project: string;
  thematicArea?: string;
  center: string;
  payee: string;
  amount: number; // Lakhs, matching finance payment records.
  status: "Approved" | "In progress" | "Payment slip uploaded";
  paymentSlip?: string;
  paidOn?: string;
  reference?: string;
}

interface CatalogueArea { name: string; projects: { name: string }[] }
export interface PaymentArea { name: string; projects: { name: string; records: PaymentListRecord[] }[] }

export function buildPaymentHierarchy(records: PaymentListRecord[], catalogue: CatalogueArea[]): PaymentArea[] {
  const areas: PaymentArea[] = catalogue.map(area => ({ name: area.name, projects: area.projects.map(project => ({ name: project.name, records: [] })) }));
  for (const record of records) {
    const areaName = catalogue.find(area => area.projects.some(project => project.name === record.project))?.name ?? record.thematicArea ?? "Other / unassigned";
    let area = areas.find(area => area.name === areaName);
    if (!area) { area = { name: areaName, projects: [] }; areas.push(area); }
    let project = area.projects.find(project => project.name === record.project);
    if (!project) { project = { name: record.project, records: [] }; area.projects.push(project); }
    project.records.push(record);
  }
  return areas;
}

export const paymentRecordKey = (record: Pick<PaymentListRecord, "id" | "source">) => `${record.source}:${record.id}`;
export const paymentAmount = (amount: number) => `₹${Math.round(amount * 100000).toLocaleString("en-IN")}`;
export const paymentStatusLabel = (record: PaymentListRecord) => record.status === "Approved" ? "Ready to pay" : record.status === "In progress" ? "Awaiting payment slip" : "Paid";

export function paymentHistory(records: PaymentListRecord[]): PaymentListRecord[] {
  return records.filter(record => record.status !== "Approved").sort((a, b) => (b.paidOn ?? "").localeCompare(a.paidOn ?? ""));
}
