import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { financeAreas } from "../finance/data";
import type { Employee, HRState } from "./model";

export function Metric({ label, value, detail }: { label: string; value: ReactNode; detail: string }) {
  return <article className="cxo-panel cxo-metric"><h2>{label}</h2><p>{value}</p><span>{detail}</span></article>;
}
export function Status({ children }: { children: string }) {
  const tone = /Rejected|missing|No punch|Returned/i.test(children) ? "error" : /Pending|Awaiting|Onboarding|Not|Unassigned/i.test(children) ? "warning" : "positive";
  return <span className="hr-status" data-tone={tone}>{children}</span>;
}
export function Progress({ value, label }: { value: number; label: string }) {
  return <div className="cxo-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>;
}
export function Register({ title, description, actions, filters, headings, children, empty = false }: { title: string; description?: string; actions?: ReactNode; filters?: ReactNode; headings: string[]; children: ReactNode; empty?: boolean }) {
  return <section className="cxo-panel cxo-register hr-register"><div className="cxo-section-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{actions}</div>{filters}<div className="cxo-table-scroll"><table><thead><tr>{headings.map(h => <th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>{empty && <p className="cxo-empty">No records match this view. Try another search or filter.</p>}</section>;
}
export function Filters({ query, setQuery, area, setArea, children }: { query: string; setQuery: (value: string) => void; area?: string; setArea?: (value: string) => void; children?: ReactNode }) {
  return <div className="cxo-filters"><label className="cxo-search"><Search size={16} /><span className="sr-only">Search employees</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search employee, email or ID" /></label>{setArea && <label><span className="sr-only">Thematic area</span><select value={area} onChange={e => setArea(e.target.value)}><option value="all">All thematic areas</option>{financeAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}{children}</div>;
}
export function EmployeeCell({ employee, subtitle }: { employee: Employee; subtitle?: string }) {
  return <div className="hr-person"><span className="hr-avatar" aria-hidden="true">{employee.name.split(" ").slice(0, 2).map(n => n[0]).join("")}</span><div><strong>{employee.name}</strong><span>{subtitle ?? employee.id}</span></div></div>;
}
export function filterEmployees(state: HRState, query: string, area: string) {
  return state.employees.filter(e => (area === "all" || e.areaId === area) && `${e.name} ${e.id} ${e.email}`.toLowerCase().includes(query.trim().toLowerCase()));
}
export function areaName(id: string) { return financeAreas.find(a => a.id === id)?.name ?? "Unassigned"; }
export function dateLabel(date?: string) { return date ? new Date(date.length === 10 ? `${date}T12:00:00` : date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Awaiting decision"; }
export function timestampLabel(date?: string) { return date ? new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Not received"; }
