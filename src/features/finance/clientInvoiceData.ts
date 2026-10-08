export interface InvoiceLine { id: string; description: string; quantity: number; rate: number }
export interface ClientInvoice {
  id: string; number: string; projectId: string; projectName: string;
  client: string; email: string; address: string; issuedOn: string; dueOn: string;
  lines: InvoiceLine[]; notes: string; status: "Draft" | "Raised" | "Admin Verified"; raisedAt?: string;
  adminVerifiedAt?: string;
}
export const invoiceTotal = (lines: InvoiceLine[]) => lines.reduce((sum, line) => sum + Math.round(line.quantity * line.rate * 100), 0) / 100;
export const invoiceMoney = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
export function validateInvoice(invoice: ClientInvoice): boolean {
  return Boolean(invoice.id && invoice.number.trim() && invoice.projectId && invoice.client.trim() && invoice.address.trim() && /^\S+@\S+\.\S+$/.test(invoice.email) && /^\d{4}-\d{2}-\d{2}$/.test(invoice.issuedOn) && /^\d{4}-\d{2}-\d{2}$/.test(invoice.dueOn) && invoice.dueOn >= invoice.issuedOn && invoice.lines.length && invoice.lines.every(line => line.description.trim() && Number.isFinite(line.quantity) && line.quantity > 0 && Number.isFinite(line.rate) && line.rate > 0) && Number.isFinite(invoiceTotal(invoice.lines)));
}
export async function downloadClientInvoice(invoice: ClientInvoice) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  let y = 20;
  const write = (text: string, size = 11) => {
    pdf.setFontSize(size);
    for (const line of pdf.splitTextToSize(text, 175)) {
      if (y > 275) { pdf.addPage(); y = 20; }
      pdf.text(line, 18, y); y += size * .5 + 2;
    }
    y += 3;
  };
  const statusLabel = invoice.status === "Draft" ? "DRAFT INVOICE" : invoice.status === "Admin Verified" ? "INVOICE (ADMIN VERIFIED)" : "INVOICE";
  write(statusLabel, 22);
  write(`Pantiss | ${invoice.number}`);
  write(`Project: ${invoice.projectName}`);
  write(`Issued: ${invoice.issuedOn} | Due: ${invoice.dueOn}`);
  if (invoice.status === "Admin Verified" && invoice.adminVerifiedAt) {
    write(`Admin Verified on: ${new Date(invoice.adminVerifiedAt).toLocaleDateString("en-IN")}`);
  }
  write(`Bill to: ${invoice.client}\n${invoice.email}\n${invoice.address}`);
  invoice.lines.forEach((line, index) => write(`${index + 1}. ${line.description}\n${line.quantity} x INR ${line.rate.toFixed(2)} = INR ${(Math.round(line.quantity * line.rate * 100) / 100).toFixed(2)}`));
  write(`Total payable: INR ${invoiceTotal(invoice.lines).toFixed(2)}`, 16);
  if (invoice.notes) write(`Payment instructions / notes\n${invoice.notes}`);
  pdf.save(`${invoice.number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`);
}
