import assert from "node:assert/strict";
import test from "node:test";
import { financeAreas } from "../src/features/finance/data.ts";
import { createSalaryRecords, payrollMonths, salaryKey, salaryTotals, updateSalaryPayment } from "../src/features/finance/salaryData.ts";

test("monthly payroll records have unique keys and valid project associations", () => {
  const records = createSalaryRecords();
  const projects = new Set(financeAreas.flatMap(area => area.projects.map(project => project.id)));
  assert.equal(records.length, 28);
  assert.equal(new Set(records.map(salaryKey)).size, records.length);
  assert.ok(records.every(record => projects.has(record.projectId)));
  for (const month of payrollMonths) assert.equal(records.filter(record => record.month === month).length, 7);
  for (const record of records) assert.equal(record.netPay, record.basicHra + record.allowance - record.pfDeduction - record.esiDeduction - record.tdsDeduction);
});

test("project totals distinguish paid, pending and held salaries by month", () => {
  const records = createSalaryRecords();
  const september = salaryTotals(records.filter(record => record.projectId === "FIN-SKI-01" && record.month === "2026-09"));
  const august = salaryTotals(records.filter(record => record.projectId === "FIN-SKI-01" && record.month === "2026-08"));
  assert.equal(september.employees, 2);
  assert.equal(september.paidCount, 1);
  assert.equal(september.paid, 77500);
  assert.equal(september.outstanding, 48673);
  assert.equal(august.paidCount, 2);
  assert.equal(august.outstanding, 0);
  const allSeptember = salaryTotals(records.filter(record => record.month === "2026-09"));
  assert.equal(allSeptember.outstanding, 48673 + 35060);
  assert.equal(allSeptember.net, allSeptember.paid + allSeptember.outstanding);
  assert.equal(allSeptember.gross - allSeptember.deductions, allSeptember.net);
  assert.equal(salaryTotals([]).net, 0);
});

test("payment updates affect only the selected employee and month", () => {
  const records = createSalaryRecords();
  const key = "PAN-EMP-0103:2026-09";
  const updated = updateSalaryPayment(records, key, { status: "Disbursed", paidOn: "2026-09-25", reference: " TEST-REF " });
  assert.equal(updated.find(record => salaryKey(record) === key).reference, "TEST-REF");
  assert.equal(records.find(record => salaryKey(record) === key).status, "Pending");
  for (const record of records.filter(record => salaryKey(record) !== key)) assert.deepEqual(updated.find(item => salaryKey(item) === salaryKey(record)), record);
  const held = updateSalaryPayment(updated, key, { status: "Hold", paidOn: "2026-09-25", reference: "TEST-REF" }).find(record => salaryKey(record) === key);
  assert.equal(held.paidOn, undefined);
  assert.equal(held.reference, undefined);
});

test("disbursement requires a real date and transaction reference", () => {
  const records = createSalaryRecords();
  const key = salaryKey(records[0]);
  assert.throws(() => updateSalaryPayment(records, key, { status: "Disbursed", paidOn: "2026-02-30", reference: "REF" }));
  assert.throws(() => updateSalaryPayment(records, key, { status: "Disbursed", paidOn: "2999-01-01", reference: "REF" }));
  assert.throws(() => updateSalaryPayment(records, key, { status: "Disbursed", paidOn: "2026-09-25", reference: " " }));
  assert.throws(() => updateSalaryPayment(records, "missing", { status: "Pending", paidOn: "", reference: "" }));
});
