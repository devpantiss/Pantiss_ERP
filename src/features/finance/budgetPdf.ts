import type { jsPDF as JsPDF } from "jspdf";

export interface BudgetPdfLine {
  name: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface BudgetPdfData {
  id: string;
  title: string;
  status: string;
  thematicArea: string;
  projectName: string;
  projectId: string;
  fundingSource: string;
  fiscalYear: string;
  currency: string;
  trackingMethod: string;
  threshold: number;
  created: string;
  notes: string;
  lines: BudgetPdfLine[];
}

const emerald: [number, number, number] = [5, 150, 105];
const dark: [number, number, number] = [15, 23, 42];
const slate: [number, number, number] = [71, 85, 105];
const border: [number, number, number] = [226, 232, 240];

function money(value: number) {
  return value >= 100 ? `INR ${(value / 100).toFixed(2)} Cr` : `INR ${value.toFixed(2)} L`;
}

function drawBrandHeader(doc: JsPDF, label: string) {
  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PANTISS", 16, 11.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(167, 243, 208);
  doc.text(label.toUpperCase(), 194, 11.5, { align: "right" });
}

function drawFooter(doc: JsPDF, page: number, total: number, projectId: string) {
  doc.setDrawColor(...border);
  doc.line(16, 283, 194, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Pantiss Finance Division | ${projectId} | Internal budget document`, 16, 288);
  doc.text(`Page ${page} of ${total}`, 194, 288, { align: "right" });
}

function addSchedulePage(doc: JsPDF, data: BudgetPdfData, lines: BudgetPdfLine[], pageTitle: string) {
  doc.addPage();
  drawBrandHeader(doc, "Budget schedule");
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(pageTitle, 16, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text(`${data.projectName} | ${data.fiscalYear}`, 16, 41);
  let y = 51;

  const drawTableHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(16, y, 178, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...slate);
    doc.text("#", 19, y + 5.8);
    doc.text("COST HEAD / DESCRIPTION", 27, y + 5.8);
    doc.text("QTY", 133, y + 5.8, { align: "right" });
    doc.text("RATE", 160, y + 5.8, { align: "right" });
    doc.text("AMOUNT", 191, y + 5.8, { align: "right" });
    y += 9;
  };
  drawTableHeader();

  lines.forEach((line, index) => {
    const descriptionLines = doc.splitTextToSize(line.description || "No description provided", 91) as string[];
    const rowHeight = Math.max(15, 9 + descriptionLines.length * 3.2);
    if (y + rowHeight > 273) {
      doc.addPage();
      drawBrandHeader(doc, "Budget schedule continued");
      y = 29;
      drawTableHeader();
    }
    doc.setDrawColor(...border);
    doc.line(16, y + rowHeight, 194, y + rowHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text(String(index + 1).padStart(2, "0"), 19, y + 6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(doc.splitTextToSize(line.name, 91), 27, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...slate);
    doc.text(descriptionLines, 27, y + 10);
    doc.setFontSize(7);
    doc.text(line.quantity.toFixed(2), 133, y + 6, { align: "right" });
    doc.text(money(line.rate), 160, y + 6, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(money(line.quantity * line.rate), 191, y + 6, { align: "right" });
    y += rowHeight;
  });

  const total = lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);
  if (y + 20 > 273) { doc.addPage(); drawBrandHeader(doc, "Budget summary"); y = 32; }
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(119, y + 6, 75, 16, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...slate);
  doc.text("TOTAL PLANNED COST", 124, y + 12);
  doc.setFontSize(11);
  doc.setTextColor(...emerald);
  doc.text(money(total), 189, y + 17, { align: "right" });
}

export async function createBudgetPdf(data: BudgetPdfData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const total = data.lines.reduce((sum, line) => sum + line.quantity * line.rate, 0);

  doc.setFillColor(...dark);
  doc.rect(0, 0, 210, 297, "F");
  doc.setFillColor(...emerald);
  doc.rect(0, 0, 7, 297, "F");
  doc.setFillColor(6, 78, 59);
  doc.circle(188, 23, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.text("PANTISS", 18, 27);
  doc.setFontSize(7.5);
  doc.setTextColor(167, 243, 208);
  doc.text("FINANCE DIVISION | BUDGET CONTROL", 18, 35);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${data.id} | ${data.status.toUpperCase()}`, 192, 27, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(110, 231, 183);
  doc.text("PROJECT BUDGET", 18, 79);
  doc.setFontSize(30);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(data.title, 166) as string[];
  doc.text(titleLines, 18, 94);
  const titleBottom = 94 + titleLines.length * 10;
  doc.setFontSize(14);
  doc.setTextColor(226, 232, 240);
  doc.text(doc.splitTextToSize(data.projectName, 166), 18, titleBottom + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`${data.thematicArea} | ${data.projectId} | ${data.fiscalYear}`, 18, titleBottom + 20);

  const cardY = 166;
  const cards = [
    ["PLANNED COST", money(total)],
    ["COST HEADS", String(data.lines.length)],
    ["ALERT THRESHOLD", `${data.threshold}%`],
  ];
  cards.forEach(([label, value], index) => {
    const x = 18 + index * 59;
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(x, cardY, 53, 32, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(label, x + 5, cardY + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(value, x + 5, cardY + 22);
  });

  doc.setDrawColor(51, 65, 85);
  doc.line(18, 219, 192, 219);
  const meta = [
    ["Funding source", data.fundingSource],
    ["Currency", data.currency],
    ["Tracking", data.trackingMethod],
    ["Prepared", data.created],
  ];
  meta.forEach(([label, value], index) => {
    const x = 18 + (index % 2) * 89;
    const y = 232 + Math.floor(index / 2) * 24;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(label.toUpperCase(), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(226, 232, 240);
    doc.text(doc.splitTextToSize(value, 78), x, y + 6);
  });

  addSchedulePage(doc, data, data.lines, "Detailed cost-head schedule");

  doc.addPage();
  drawBrandHeader(doc, "Controls and approval");
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("Budget controls and approval", 16, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text("Review assumptions, thresholds and authorization before submission.", 16, 42);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16, 54, 178, 43, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...dark);
  doc.text("BUDGET NOTES", 22, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...slate);
  doc.text(doc.splitTextToSize(data.notes || "No additional assumptions or restrictions were recorded.", 163), 22, 75);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...dark);
  doc.text("Control settings", 16, 116);
  const controls = [
    ["Tracking method", data.trackingMethod],
    ["Utilization alert", `${data.threshold}% of planned cost`],
    ["Currency", data.currency],
    ["Workflow status", data.status],
  ];
  controls.forEach(([label, value], index) => {
    const y = 127 + index * 13;
    doc.setDrawColor(...border);
    doc.line(16, y + 5, 194, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...slate);
    doc.text(label, 18, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(value, 192, y, { align: "right" });
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Authorization", 16, 193);
  ["Prepared by", "Reviewed by", "Approved by"].forEach((label, index) => {
    const x = 16 + index * 60;
    doc.setDrawColor(148, 163, 184);
    doc.line(x, 239, x + 49, 239);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...dark);
    doc.text(label, x, 246);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...slate);
    doc.text("Name / signature / date", x, 251);
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    if (page > 1) drawFooter(doc, page, pages, data.projectId);
  }
  return doc;
}

export function budgetPdfFilename(data: BudgetPdfData) {
  const slug = `${data.projectId}-${data.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug || "project-budget"}.pdf`;
}
