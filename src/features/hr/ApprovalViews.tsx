import { useState } from "react";
import { CheckCircle2, Download, ShieldCheck } from "lucide-react";
import { Overlay } from "../../components/ui/Overlay";
import { useAuth } from "../../hooks/useAuth";
import { useSalaryRecords } from "../finance/useSalaryRecords";
import { payrollMonths, salaryKey, salaryMoney, salaryMonthLabel, salaryWorkflowLabel, isFinanceEligible, type SalaryRecord } from "../finance/salaryData";
import { dateLabel, Filters, Metric, Register, Status } from "./components";
import { exportCSV } from "./data";
import { decideLeave, leaves } from "./model";
import type { HRStore } from "./store";

export function SalaryApprovalsView() {
  const { user } = useAuth();
  const { records, error, reviewByHR } = useSalaryRecords("hr");
  const [month, setMonth] = useState(payrollMonths[0]);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");
  const monthly = records.filter(r => r.month === month);
  const pendingHR = monthly.filter(r => r.adminApproval === "Approved" && r.hrApproval === "Pending");
  const visible = monthly.filter(r => `${r.name} ${r.id} ${r.department}`.toLowerCase().includes(query.trim().toLowerCase()) && (stage === "all" || (stage === "admin" && r.adminApproval !== "Approved") || (stage === "hr" && r.adminApproval === "Approved" && r.hrApproval === "Pending") || (stage === "finance" && isFinanceEligible(r)) || (stage === "returned" && r.hrApproval === "Rejected")));
  const selected = records.find(r => salaryKey(r) === selectedKey);
  function decide(record: SalaryRecord, decision: "Approved" | "Rejected") {
    try {
      reviewByHR(salaryKey(record), decision, user!.name, reason);
      setFeedback(decision === "Approved" ? `${record.name}’s salary is approved by HR and now visible in Finance.` : `${record.name}’s salary was returned with your reason. It remains outside Finance.`);
      setSelectedKey(null);
      setActionError("");
    } catch (e) { setActionError(e instanceof Error ? e.message : "Salary review could not be saved."); }
  }
  return <>
    <div className="hr-workflow"><span><ShieldCheck size={17} />1. Admin approval</span><span aria-hidden="true">→</span><strong>2. HR approval</strong><span aria-hidden="true">→</span><span>3. Finance processing</span></div>
    <div className="cxo-metrics"><Metric label="Awaiting Admin" value={monthly.filter(r => r.adminApproval === "Pending").length} detail="HR approval is locked" /><Metric label="Ready for HR approval" value={pendingHR.length} detail={salaryMoney(pendingHR.reduce((sum, r) => sum + r.netPay, 0)) + " net salary"} /><Metric label="Released to Finance" value={monthly.filter(isFinanceEligible).length} detail="Admin and HR have approved" /><Metric label="Returned by HR" value={monthly.filter(r => r.hrApproval === "Rejected").length} detail="Held outside Finance" /></div>
    {feedback && <p className="hr-notice" role="status">{feedback}</p>}{error && <p role="alert" className="hr-error">{error}</p>}
    <Register title="Salary approval register" description="Approve after Admin clearance. Finance receives only HR-approved records." headings={["Employee", "Net salary", "Admin approval", "HR approval", "Finance status", "Action"]} empty={!visible.length} actions={<button className="cxo-button focus-ring" onClick={() => exportCSV(`hr-approvals-${month}`, [["Employee", "ID", "Month", "Net pay", "Admin", "HR", "Finance"], ...visible.map(r => [r.name, r.id, r.month, r.netPay, r.adminApproval, r.hrApproval, isFinanceEligible(r) ? salaryWorkflowLabel(r) : "Not released"])])}><Download size={14} />Export</button>} filters={<Filters query={query} setQuery={setQuery}><label><span className="sr-only">Payroll month</span><select value={month} onChange={e => setMonth(e.target.value)}>{payrollMonths.map(m => <option key={m} value={m}>{salaryMonthLabel(m)}</option>)}</select></label><label><span className="sr-only">Approval stage</span><select value={stage} onChange={e => setStage(e.target.value)}><option value="all">All stages</option><option value="admin">Awaiting Admin clearance</option><option value="hr">Ready for HR</option><option value="finance">Released to Finance</option><option value="returned">Returned by HR</option></select></label></Filters>}>
      {visible.map(r => <tr key={salaryKey(r)}><td><strong>{r.name}</strong><span>{r.id} · {r.department}</span></td><td><strong>{salaryMoney(r.netPay)}</strong><span className="hr-cell-note">{r.workingDays} working days</span></td><td><Status>{r.adminApproval}</Status><span className="hr-cell-note">{r.adminApprovedBy ?? "Awaiting Admin"}</span></td><td><Status>{r.hrApproval}</Status><span className="hr-cell-note">{r.hrApprovedBy ?? "Not reviewed"}</span></td><td>{isFinanceEligible(r) ? salaryWorkflowLabel(r) : "Not released"}</td><td><button className="cxo-button focus-ring" onClick={() => { setSelectedKey(salaryKey(r)); setReason(""); setActionError(""); }}>{r.adminApproval === "Approved" && r.hrApproval === "Pending" ? "Review salary" : "View details"}</button></td></tr>)}
    </Register>
    {selected && <Overlay open title={selected.name} label={`HR salary review · ${salaryMonthLabel(selected.month)}`} onClose={() => setSelectedKey(null)}><div className="hr-form">
      <div className="hr-approval-grid"><ApprovalCard title="Admin decision" status={selected.adminApproval} actor={selected.adminApprovedBy} date={selected.adminApprovedOn} /><ApprovalCard title="HR decision" status={selected.hrApproval} actor={selected.hrApprovedBy} date={selected.hrApprovedOn} /></div>
      <dl className="hr-breakdown">{[["Basic + HRA", selected.basicHra], ["Allowances", selected.allowance], ["EPF", selected.pfDeduction], ["ESIC", selected.esiDeduction], ["TDS", selected.tdsDeduction], ["Net salary", selected.netPay]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{salaryMoney(Number(value))}</dd></div>)}</dl>
      {selected.adminApproval !== "Approved" ? <p className="hr-banner">HR approval is locked until Admin approves this salary.</p> : selected.hrApproval === "Pending" ? <><label>Review note / reason for return<textarea className="hr-field" maxLength={1500} value={reason} onChange={e => setReason(e.target.value)} placeholder="A reason is required when returning a salary." /></label><div className="hr-buttons"><button className="hr-primary focus-ring" onClick={() => decide(selected, "Approved")}><CheckCircle2 size={15} />Approve & release to Finance</button><button className="cxo-button focus-ring" disabled={!reason.trim()} onClick={() => decide(selected, "Rejected")}>Return salary</button></div></> : <p className="hr-description">{selected.hrReason || "HR review recorded."} {isFinanceEligible(selected) ? "This record is available to Finance for processing." : "This record has not been released to Finance."}</p>}
      {actionError && <p className="hr-error" role="alert">{actionError}</p>}
    </div></Overlay>}
  </>;
}
function ApprovalCard({ title, status, actor, date }: { title: string; status: string; actor?: string; date?: string }) {
  return <section className="hr-approval-card"><h3>{title}</h3><Status>{status}</Status><p>{actor ?? "No decision yet"}</p><span>{dateLabel(date)}</span></section>;
}

export function LeaveView({ store }: { store: HRStore }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const request = leaves.find(l => l.id === selected);
  const visible = leaves.filter(l => `${store.data.employees.find(e => e.id === l.employeeId)?.name} ${l.id}`.toLowerCase().includes(query.toLowerCase()) && (stage === "all" || l.adminStatus === stage));
  const hrReady = leaves.filter(l => l.adminStatus === "Approved" && !store.data.leaveDecisions[l.id]);
  function decide(status: "Approved" | "Rejected") {
    if (store.commit(state => decideLeave(state, request!.id, { status, reason: reason.trim(), actor: user!.name, at: new Date().toISOString() }), `Leave request ${status.toLowerCase()}.`)) setSelected(null);
  }
  return <>
    <div className="cxo-metrics"><Metric label="Awaiting Admin" value={leaves.filter(l => l.adminStatus === "Pending").length} detail="No HR action available yet" /><Metric label="Ready for HR" value={hrReady.length} detail="Admin has approved" /><Metric label="Approved leave days" value={leaves.reduce((sum, l) => sum + (store.data.leaveDecisions[l.id]?.status === "Approved" ? l.days : 0), 0)} detail="After both approvals" /><Metric label="Rejected by Admin" value={leaves.filter(l => l.adminStatus === "Rejected").length} detail="Returned before HR review" /></div>
    <Register title="Leave requests" description="Admin clearance and HR decisions shown separately" headings={["Employee", "Leave request", "Dates", "Balance", "Admin", "HR", "Action"]} filters={<Filters query={query} setQuery={setQuery}><label><span className="sr-only">Admin decision</span><select value={stage} onChange={e => setStage(e.target.value)}><option value="all">All Admin decisions</option>{["Pending", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}</select></label></Filters>} empty={!visible.length}>
      {visible.map(l => { const hr = store.data.leaveDecisions[l.id]; return <tr key={l.id}><td><strong>{store.data.employees.find(e => e.id === l.employeeId)?.name}</strong><span>{l.id}</span></td><td>{l.type}<span className="hr-cell-note">{l.days} day(s)</span></td><td>{dateLabel(l.start)}<span className="hr-cell-note">to {dateLabel(l.end)}</span></td><td>{l.balance - (hr?.status === "Approved" ? l.days : 0)} days</td><td><Status>{l.adminStatus}</Status></td><td><Status>{hr?.status ?? "Pending"}</Status></td><td><button className="cxo-button focus-ring" onClick={() => { setSelected(l.id); setReason(""); }}>Review</button></td></tr>; })}
    </Register>
    {request && <Overlay open title={store.data.employees.find(e => e.id === request.employeeId)?.name} label={request.id} onClose={() => setSelected(null)}><div className="hr-form"><div className="hr-approval-grid"><ApprovalCard title="Admin decision" status={request.adminStatus} actor={request.adminBy} date={request.adminAt} /><ApprovalCard title="HR decision" status={store.data.leaveDecisions[request.id]?.status ?? "Pending"} actor={store.data.leaveDecisions[request.id]?.actor} date={store.data.leaveDecisions[request.id]?.at} /></div><p>{request.type} · {dateLabel(request.start)} – {dateLabel(request.end)} · {request.days} day(s)</p><p className="hr-description">Employee: {request.reason}</p>{request.adminNote && <p className="hr-description">Admin: {request.adminNote}</p>}<p className="hr-description">Balance before approval: {request.balance} days. Balance after approval: {request.balance - request.days} days.</p>
    {request.adminStatus !== "Approved" ? <p className="hr-banner">{request.adminStatus === "Rejected" ? "Admin rejected this request. HR approval is unavailable." : "Waiting for Admin approval before HR review."}</p> : !store.data.leaveDecisions[request.id] ? <><label>HR note / reason for rejection<textarea className="hr-field" maxLength={1500} value={reason} onChange={e => setReason(e.target.value)} /></label><div className="hr-buttons"><button className="hr-primary focus-ring" onClick={() => decide("Approved")}>Approve leave</button><button className="cxo-button focus-ring" disabled={!reason.trim()} onClick={() => decide("Rejected")}>Reject leave</button></div></> : <p className="hr-description">{store.data.leaveDecisions[request.id].reason || "HR decision recorded."}</p>}
    {store.error && <p role="alert" className="hr-error">{store.error}</p>}</div></Overlay>}
  </>;
}
