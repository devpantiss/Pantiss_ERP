import test from "node:test";
import assert from "node:assert/strict";
import { buildPaymentHierarchy, paymentAmount, paymentRecordKey } from "../src/features/finance/paymentHierarchy.ts";
import { createSalaryRecords, salaryKey, canForwardSalary, forwardSalaryForPayment, recordSalaryDisbursement } from "../src/features/finance/salaryData.ts";

const catalogue = [{ name: "Skills", projects: [{ name: "Skills A" }, { name: "Empty project" }] }, { name: "Health", projects: [{ name: "Health A" }] }];
const payment = (id, project, source = "Center", extra = {}) => ({ id, project, source, title: id, center: "Center", payee: "Payee", amount: 0.48673, status: "Approved", ...extra });

test("payments are grouped by thematic area and project without losing unmapped records", () => {
  const records = [payment("1", "Skills A"), payment("2", "Skills A", "Salary"), payment("3", "Health A", "Procurement", { thematicArea: "Legacy label" }), payment("4", "Unlisted", "Procurement", { thematicArea: "Research" }), payment("5", "Unmapped")];
  const hierarchy = buildPaymentHierarchy(records, catalogue);
  assert.equal(hierarchy.find(area => area.name === "Skills").projects.find(project => project.name === "Skills A").records.length, 2);
  assert.equal(hierarchy.find(area => area.name === "Skills").projects.find(project => project.name === "Empty project").records.length, 0);
  assert.equal(hierarchy.find(area => area.name === "Health").projects[0].records[0].id, "3");
  assert.equal(hierarchy.find(area => area.name === "Research").projects[0].records[0].id, "4");
  assert.equal(hierarchy.find(area => area.name === "Other / unassigned").projects[0].records[0].id, "5");
  assert.equal(hierarchy.flatMap(area => area.projects.flatMap(project => project.records)).length, records.length);
});

test("salary payment keys include months and rupee amounts retain precision", () => {
  assert.notEqual(paymentRecordKey(payment("EMP:2026-09", "Skills A", "Salary")), paymentRecordKey(payment("EMP:2026-08", "Skills A", "Salary")));
  assert.notEqual(paymentRecordKey(payment("same", "Skills A", "Center")), paymentRecordKey(payment("same", "Skills A", "Procurement")));
  assert.equal(paymentAmount(48673 / 100000), "₹48,673");
});

test("only approved salaries can be forwarded, once, without affecting another month", () => {
  const records = createSalaryRecords();
  const ready = records.find(canForwardSalary);
  assert.ok(ready);
  const key = salaryKey(ready);
  const forwarded = forwardSalaryForPayment(records, key, "Finance reviewer");
  assert.equal(forwarded.find(record => salaryKey(record) === key).forwardedBy, "Finance reviewer");
  assert.ok(forwarded.find(record => salaryKey(record) === key).forwardedAt);
  assert.deepEqual(forwarded.filter(record => salaryKey(record) !== key), records.filter(record => salaryKey(record) !== key));
  assert.throws(() => forwardSalaryForPayment(forwarded, key, "Finance reviewer"));
  for (const approvalStatus of ["Pending approval", "Rejected"]) assert.throws(() => forwardSalaryForPayment([{ ...ready, approvalStatus }], key, "Finance reviewer"));
});

test("payment desk requires approval and forwarding and prevents repeated disbursement", () => {
  const records = createSalaryRecords();
  const ready = records.find(canForwardSalary);
  const key = salaryKey(ready);
  const update = { status: "Disbursed", paidOn: "2026-09-25", reference: "UTR.TEST.123" };
  assert.throws(() => recordSalaryDisbursement(records, key, update));
  const forwarded = forwardSalaryForPayment(records, key, "Finance reviewer");
  const paid = recordSalaryDisbursement(forwarded, key, update);
  const record = paid.find(record => salaryKey(record) === key);
  assert.equal(record.reference, update.reference);
  assert.equal(record.forwardedAt, forwarded.find(record => salaryKey(record) === key).forwardedAt);
  assert.throws(() => recordSalaryDisbursement(paid, key, update));
});

test("history includes recorded payments awaiting slips and sorts dates newest first", async () => {
  const { paymentHistory } = await import("../src/features/finance/paymentHierarchy.ts");
  const records = [payment("ready", "Skills A"), payment("old", "Skills A", "Salary", { status: "Payment slip uploaded", paidOn: "2026-08-24" }), payment("receipt-pending", "Health A", "Center", { status: "In progress", paidOn: "2026-09-28", reference: "UTR-123" }), payment("legacy", "Skills A", "Procurement", { status: "Payment slip uploaded" })];
  assert.deepEqual(paymentHistory(records).map(record => record.id), ["receipt-pending", "old", "legacy"]);
  assert.equal(paymentHistory(records)[0].reference, "UTR-123");
  assert.equal(records[0].id, "ready");
});
