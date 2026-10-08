import { ArrowUpRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { financeAreas } from "../finance/data";
import { useSalaryRecords } from "../finance/useSalaryRecords";
import { isFinanceEligible, payrollMonths, salaryMoney, salaryMonthLabel } from "../finance/salaryData";
import { attendanceIssue, leaves, reviewYears, type HRState } from "./model";
import { Metric, Progress } from "./components";

export function HRDashboard({ data }: { data: HRState }) {
  const { records, error } = useSalaryRecords("hr");
  const month = payrollMonths[0];
  const payroll = records.filter(r => r.month === month);
  const readyHR = payroll.filter(r => r.adminApproval === "Approved" && r.hrApproval === "Pending");
  const latestDate = data.attendance.map(r => r.date).sort().at(-1) || "2026-10-09";
  const daily = data.attendance.filter(r => r.date === latestDate);
  const population = data.employees.filter(e => e.joiningDate <= latestDate);
  const exceptionCount = population.filter(e => attendanceIssue(daily.find(r => r.employeeId === e.id)) !== "Evidence received").length;
  const unassigned = data.employees.filter(e => !data.assignments.some(a => a.employeeId === e.id));
  const assessed = data.assessments.filter(a => a.year === reviewYears[0]).length;
  const completed = data.appraisals.filter(a => a.year === reviewYears[0]).length;
  const readyLeave = leaves.filter(l => l.adminStatus === "Approved" && !data.leaveDecisions[l.id]).length;
  const actions = [
    { to: "salary", title: `${readyHR.length} salaries ready for HR`, text: `${salaryMoney(readyHR.reduce((s, r) => s + r.netPay, 0))} awaiting release to Finance` },
    { to: "leave-management", title: `${readyLeave} leave requests ready for HR`, text: "Admin clearance received" },
    { to: "attendance", title: `${exceptionCount} attendance exceptions`, text: `Missing punches or photos · ${latestDate}` },
    { to: "project-assignment", title: `${unassigned.length} employees unassigned`, text: "Assign a primary project and centre" },
  ];
  const percent = (count: number) => data.employees.length ? Math.round(count / data.employees.length * 100) : 0;
  return <>
    {error && <p className="hr-error" role="alert">{error}</p>}
    <div className="cxo-metrics"><Metric label="Active employees" value={data.employees.filter(e => e.status === "Active").length} detail={`${data.employees.length} total employee records`} /><Metric label="Onboarding in progress" value={data.employees.filter(e => e.status === "Onboarding").length} detail={`${data.employees.filter(e => !e.loginId).length} access profiles not prepared`} /><Metric label="Unassigned employees" value={unassigned.length} detail="Primary project / centre needed" /><Metric label="Punch-in coverage" value={`${population.length ? Math.round(daily.filter(r => r.punchIn).length / population.length * 100) : 0}%`} detail={`${daily.filter(r => r.punchIn).length} of ${population.length} · ${latestDate}`} /></div>
    <div className="cxo-insights"><section className="cxo-panel cxo-chart"><div className="cxo-section-heading"><div><h2>People across thematic areas</h2><p>Current employee distribution</p></div><Users size={19} /></div><div className="cxo-bars">{financeAreas.map(area => { const count = data.employees.filter(e => e.areaId === area.id).length; return <div className="cxo-bar-row" key={area.id}><span>{area.name}</span><Progress value={percent(count)} label={area.name} /><strong>{count}</strong></div>; })}</div></section><section className="cxo-panel cxo-priorities"><div className="cxo-section-heading"><h2>Action centre</h2><span>HR priorities</span></div><div className="hr-action-list">{actions.map(action => <Link className="focus-ring" key={action.to} to={`/hr/${action.to}`}><div><strong>{action.title}</strong><span>{action.text}</span></div><ArrowUpRight size={17} /></Link>)}</div></section></div>
    <div className="cxo-metrics"><Metric label="Awaiting Admin approval" value={payroll.filter(r => r.adminApproval === "Pending").length} detail={`Salary records · ${salaryMonthLabel(month)}`} /><Metric label="Released to Finance" value={payroll.filter(isFinanceEligible).length} detail="Admin + HR approval completed" /><Metric label="KBI assessment coverage" value={`${percent(assessed)}%`} detail={`${assessed} of ${data.employees.length} · FY ${reviewYears[0]}`} /><Metric label="Year-end appraisals" value={`${completed}/${data.employees.length}`} detail={`Finalised · FY ${reviewYears[0]}`} /></div>
    <div className="hr-dashboard-bottom"><section className="cxo-panel hr-summary"><div><span className="cxo-eyebrow">Payroll awaiting HR · {salaryMonthLabel(month)}</span><h3>{salaryMoney(readyHR.reduce((s, r) => s + r.netPay, 0))}</h3><p>Only Admin-approved salaries can be released to Finance.</p></div><Link className="cxo-button focus-ring" to="/hr/salary">Review salaries<ArrowUpRight size={15} /></Link></section><section className="cxo-panel cxo-chart"><div className="cxo-section-heading"><h2>Annual review progress</h2><span>FY {reviewYears[0]}</span></div><div className="hr-review-progress"><span>KBI assessments <strong>{percent(assessed)}%</strong></span><Progress value={percent(assessed)} label="KBI assessment completion" /><span>Finalised appraisals <strong>{percent(completed)}%</strong></span><Progress value={percent(completed)} label="Appraisal completion" /></div></section></div>
  </>;
}
