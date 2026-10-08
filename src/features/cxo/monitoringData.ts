import { areaTotals, financeAreas, formatCurrency, portfolioTotals } from "../finance/data";
import { employeeStatuses, projects, thematicAreas } from "../monitoring-evaluation/data";

export const executiveRoles = {
  ceo: { title: "Chief Executive Officer", heading: "A clear view of the organization.", description: "Monitor strategic progress, program outcomes and portfolio health.", focus: "Strategy & impact" },
  coo: { title: "Chief Operating Officer", heading: "Keep delivery moving forward.", description: "Monitor execution, team reporting and the projects that need attention.", focus: "Operations & delivery" },
  cfo: { title: "Chief Financial Officer", heading: "Every commitment in perspective.", description: "Monitor funding, expenditure and financial exposure across the portfolio.", focus: "Finance & stewardship" },
} as const;
export type ExecutiveRole = keyof typeof executiveRoles;
export function isExecutiveRole(value?: string): value is ExecutiveRole {
  return value === "ceo" || value === "coo" || value === "cfo";
}
export interface MonitorRecord {
  id: string;
  name: string;
  area: string;
  owner: string;
  progress: number;
  status: string;
  detail: string;
  facts: { label: string; value: string }[];
}
export function getMonitoringData(role: ExecutiveRole) {
  const delivery = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);
  const reporting = employeeStatuses.filter(e => e.status === "Submitted").length;
  const utilization = Math.round(portfolioTotals.spent / portfolioTotals.approved * 100);
  const metrics = role === "ceo" ? [
    { label: "Programs monitored", value: String(projects.length), note: "M&E project sample" },
    { label: "Average delivery", value: `${delivery}%`, note: "Across monitored programs" },
    { label: "Sanctioned portfolio", value: formatCurrency(portfolioTotals.approved), note: `${portfolioTotals.projects} finance projects` },
    { label: "Programs at risk", value: String(projects.filter(p => p.status === "At risk").length), note: "Requiring leadership attention" },
  ] : role === "coo" ? [
    { label: "Active projects", value: String(projects.filter(p => p.status !== "Completed").length), note: "In the M&E project sample" },
    { label: "Average delivery", value: `${delivery}%`, note: "Across monitored projects" },
    { label: "Reports submitted", value: `${reporting} / ${employeeStatuses.length}`, note: "Employee reporting sample" },
    { label: "Projects at risk", value: String(projects.filter(p => p.status === "At risk").length), note: "Review delivery exceptions" },
  ] : [
    { label: "Approved budget", value: formatCurrency(portfolioTotals.approved), note: `${portfolioTotals.projects} finance projects` },
    { label: "Funds released", value: formatCurrency(portfolioTotals.released), note: "Cumulative donor releases" },
    { label: "Verified expenditure", value: formatCurrency(portfolioTotals.spent), note: `${utilization}% of approved budget` },
    { label: "Open commitments", value: formatCurrency(portfolioTotals.committed), note: "Portfolio obligations" },
  ];
  const bars = role === "cfo"
    ? financeAreas.map(a => ({ name: a.name, value: areaTotals(a).utilization }))
    : thematicAreas.map(a => ({ name: a.name, value: a.progress }));
  const records: MonitorRecord[] = role === "cfo" ? financeAreas.flatMap(a => a.projects.map(p => ({
    id: p.id, name: p.name, area: a.name, owner: p.donor, progress: p.utilization, status: p.status,
    detail: `${p.name} is funded by ${p.donor} in ${p.location}. Financial status: ${p.status.toLowerCase()}.`,
    facts: [{ label: "Approved", value: formatCurrency(p.approved, true) }, { label: "Released", value: formatCurrency(p.released, true) }, { label: "Spent", value: formatCurrency(p.spent, true) }, { label: "Committed", value: formatCurrency(p.committed, true) }, { label: "Pending advances", value: formatCurrency(p.pendingAdvances, true) }, { label: "Location", value: p.location }],
  }))) : projects.map(p => ({
    id: p.id, name: p.name, area: p.area, owner: p.manager, progress: p.progress, status: p.status, detail: p.outcome,
    facts: [{ label: "Project lead", value: p.manager }, { label: "Location", value: p.location }, { label: "Beneficiaries", value: p.beneficiaries }, { label: "Budget", value: p.budget }, { label: "Expenditure", value: p.spent }, { label: "Period", value: p.period }],
  }));
  const priorities = role === "coo" ? employeeStatuses.filter(e => e.status !== "Submitted").map(e => ({ title: e.name, detail: `${e.unit} · ${e.completed}/${e.planned} activities completed`, status: e.status }))
    : records.filter(r => !["On track", "Completed"].includes(r.status)).map(r => ({ title: r.name, detail: `${r.area} · ${r.owner}`, status: r.status }));
  return { metrics, bars, records, priorities };
}
