import { useState } from "react";
import { Building2, Mail, Plus, RefreshCw, UserPlus } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Overlay } from "../../components/ui/Overlay";
import { financeAreas } from "../finance/data";
import { assignEmployee, projectCenters, projects, saveEmployee, type Employee, type HRState } from "./model";
import type { HRStore } from "./store";
import { areaName, EmployeeCell, filterEmployees, Filters, Register, Status } from "./components";

export function OnboardingView({ store }: { store: HRStore }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [editing, setEditing] = useState<Employee | null>(null);
  const { data, commit } = store;
  const employees = filterEmployees(data, query, area);
  const create = () => setEditing({ id: `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, name: "", email: "", phone: "", areaId: "skill-development", designationId: "", joiningDate: new Date().toISOString().slice(0, 10), status: "Onboarding" });
  const generate = (id: string) => commit(state => {
    const employee = state.employees.find(e => e.id === id);
    if (!employee || employee.loginId) throw new Error("An access profile already exists or the employee was removed.");
    return { ...state, employees: state.employees.map(e => e.id === id ? { ...e, loginId: `PNT-${e.id}` } : e) };
  }, "Demo access profile prepared. Secure account activation must be completed in the employee platform.");
  return <>
    <div className="hr-banner"><UserPlus size={21} /><div><strong>One employee record, from joining to year-end review.</strong><p>Register employees, choose their designation and prepare their project and access details.</p></div></div>
    <Register title="Employee onboarding" description={`${data.employees.length} employees · Contact details shown are sample data`} headings={["User ID", "Name", "Role", "Contact", "Project & centre", "Login access", "Status"]} actions={<button className="hr-primary focus-ring" onClick={create}><Plus size={15} />Add employee</button>} filters={<Filters query={query} setQuery={setQuery} area={area} setArea={setArea} />} empty={!employees.length}>
      {employees.map(employee => {
        const assignment = data.assignments.find(a => a.employeeId === employee.id);
        const project = projects.find(p => p.id === assignment?.projectId);
        const center = assignment && projectCenters(assignment.projectId).find(c => c.id === assignment.centerId);
        const designation = data.designations.find(d => d.id === employee.designationId);
        return <tr key={employee.id}><td><code className="hr-id">{employee.id}</code></td><td><button className="hr-person-button focus-ring" onClick={() => setEditing(employee)} aria-label={`Edit ${employee.name}`}><EmployeeCell employee={employee} subtitle={areaName(employee.areaId)} /></button></td><td><span className="hr-role-tag">{designation?.title ?? "Not assigned"}</span><span className="hr-cell-note">{designation?.level}</span></td><td><span className="hr-contact">{employee.email}</span><span className="hr-cell-note">{employee.phone}</span></td><td>{project ? <><span className="hr-project-tag">{project.name}</span><span className="hr-cell-note"><Building2 size={13} />{center?.name}</span></> : <Status>Unassigned</Status>}<Link className="hr-inline-link focus-ring" to={`/hr/project-assignment?employee=${employee.id}`}>Assign project →</Link></td><td><div className="hr-access"><code>{employee.loginId || `PNT-${employee.id}`}</code><span>{employee.loginId ? "Activation pending · Demo" : "Access not prepared"}</span></div><div className="hr-buttons hr-access-buttons"><button className="cxo-button focus-ring" disabled={!!employee.loginId} onClick={() => generate(employee.id)}><RefreshCw size={12} />Generate</button>{employee.loginId ? <a className="cxo-button focus-ring" href={`mailto:${encodeURIComponent(employee.email)}?subject=${encodeURIComponent("Pantiss employee onboarding")}&body=${encodeURIComponent(`Hello ${employee.name},\n\nYour employee reference is ${employee.id} and your proposed login ID is ${employee.loginId}. HR will share secure activation instructions once your employee platform account is created.\n\nThis is an onboarding draft, not an account activation email.`)}`}><Mail size={12} />Draft email</a> : <button className="cxo-button" disabled><Mail size={12} />Draft email</button>}</div></td><td><Status>{employee.status}</Status></td></tr>;
      })}
    </Register><p className="hr-description hr-spacing">Generate prepares a demo access profile only. It does not create a working login or a password. Draft email opens your mail app; no email is sent automatically.</p>
    {editing && <Overlay open title={data.employees.some(e => e.id === editing.id) ? "Edit employee" : "Onboard employee"} label={editing.id} onClose={() => setEditing(null)}><EmployeeForm key={editing.id} employee={editing} data={data} error={store.error} onSave={employee => { if (commit(state => saveEmployee(state, employee), "Employee record saved.")) setEditing(null); }} /></Overlay>}
  </>;
}
function EmployeeForm({ employee, data, error, onSave }: { employee: Employee; data: HRState; error: string; onSave: (employee: Employee) => void }) {
  const [form, setForm] = useState(employee);
  function change<K extends keyof Employee>(key: K, value: Employee[K]) { setForm(previous => ({ ...previous, [key]: value })); }
  return <form className="hr-form" onSubmit={e => { e.preventDefault(); onSave({ ...form, name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() }); }}>
    <div className="hr-form-grid"><label>Full name<input className="hr-field" required maxLength={100} value={form.name} onChange={e => change("name", e.target.value)} /></label><label>Email address<input className="hr-field" type="email" required value={form.email} onChange={e => change("email", e.target.value)} /></label><label>Phone number<input className="hr-field" type="tel" required pattern="[+0-9 ()-]{10,20}" value={form.phone} onChange={e => change("phone", e.target.value)} /></label><label>Joining date<input className="hr-field" type="date" required value={form.joiningDate} onChange={e => change("joiningDate", e.target.value)} /></label><label>Thematic area<select className="hr-field" value={form.areaId} onChange={e => setForm(previous => ({ ...previous, areaId: e.target.value, designationId: "" }))}>{financeAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label><label>Job designation<select className="hr-field" required value={form.designationId} onChange={e => change("designationId", e.target.value)}><option value="">Select designation</option>{data.designations.filter(d => d.areaId === form.areaId).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label><label>Employment status<select className="hr-field" value={form.status} onChange={e => change("status", e.target.value as Employee["status"])}><option>Onboarding</option><option>Active</option></select></label></div>
    {employee.areaId !== form.areaId && data.assignments.some(a => a.employeeId === employee.id) && <p className="hr-description">Changing the thematic area removes the existing project assignment. Assign a project in the new area after saving.</p>}
    {error && <p className="hr-error" role="alert">{error}</p>}<button className="hr-primary focus-ring" type="submit">Save employee</button>
  </form>;
}

export function AssignmentView({ store }: { store: HRStore }) {
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [selected, setSelected] = useState<string | null>(params.get("employee"));
  const employee = store.data.employees.find(e => e.id === selected);
  const filtered = filterEmployees(store.data, query, area);
  return <>
    <div className="hr-banner"><Building2 size={21} /><div><strong>Deploy employees within their thematic area.</strong><p>Each employee has one primary project and centre assignment. Project choices follow their onboarding area.</p></div></div>
    <Register title="Project assignments" description="Primary deployment · Thematic area → Project → Centre" headings={["Employee", "Thematic area", "Primary project", "Centre / worksite", "Effective from", "Action"]} filters={<Filters query={query} setQuery={setQuery} area={area} setArea={setArea} />} empty={!filtered.length}>
      {filtered.map(e => { const a = store.data.assignments.find(item => item.employeeId === e.id); return <tr key={e.id}><td><EmployeeCell employee={e} /></td><td>{areaName(e.areaId)}</td><td>{projects.find(p => p.id === a?.projectId)?.name ?? <Status>Unassigned</Status>}</td><td>{a ? projectCenters(a.projectId).find(c => c.id === a.centerId)?.name : "—"}</td><td>{a?.startDate ?? "—"}</td><td><button className="cxo-button focus-ring" onClick={() => setSelected(e.id)}>{a ? "Reassign" : "Assign"}</button></td></tr>; })}
    </Register>
    {employee && <Overlay open title={employee.name} label="Project assignment" onClose={() => setSelected(null)}><AssignmentForm key={employee.id} employee={employee} store={store} onClose={() => setSelected(null)} /></Overlay>}
  </>;
}
function AssignmentForm({ employee, store, onClose }: { employee: Employee; store: HRStore; onClose: () => void }) {
  const existing = store.data.assignments.find(a => a.employeeId === employee.id);
  const [projectId, setProject] = useState(existing?.projectId || "");
  const [centerId, setCenter] = useState(existing?.centerId || "");
  const [startDate, setStartDate] = useState(existing?.startDate || employee.joiningDate);
  return <form className="hr-form" onSubmit={e => { e.preventDefault(); if (store.commit(state => assignEmployee(state, { employeeId: employee.id, projectId, centerId, startDate }), "Project assignment saved.")) onClose(); }}>
    <p className="hr-description">{areaName(employee.areaId)} · Joined {employee.joiningDate}</p>
    <label>Project<select className="hr-field" value={projectId} required onChange={e => { setProject(e.target.value); setCenter(""); }}><option value="">Select a project</option>{projects.filter(p => p.areaId === employee.areaId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label>Centre / worksite<select className="hr-field" value={centerId} required disabled={!projectId} onChange={e => setCenter(e.target.value)}><option value="">Select a centre</option>{projectCenters(projectId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Effective from<input type="date" className="hr-field" min={employee.joiningDate} required value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
    {store.error && <p role="alert" className="hr-error">{store.error}</p>}<button type="submit" className="hr-primary focus-ring">Save assignment</button>
  </form>;
}

export function DesignationsView({ store }: { store: HRStore }) {
  const [params, setParams] = useSearchParams();
  const area = financeAreas.find(a => a.id === params.get("area"));
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Individual contributor");
  const [description, setDescription] = useState("");
  const designations = store.data.designations.filter(d => d.areaId === area?.id);
  if (!area) return <div className="hr-area-grid">{financeAreas.map(a => <Link className="cxo-panel hr-area-card focus-ring" key={a.id} to={`/hr/job-designations?area=${a.id}`}><Building2 size={22} /><h3>{a.name}</h3><p>{store.data.designations.filter(d => d.areaId === a.id).length} designations · {store.data.employees.filter(e => e.areaId === a.id).length} employees</p><span>Manage designations →</span></Link>)}</div>;
  return <><button className="cxo-button focus-ring" onClick={() => setParams({})}>← All thematic areas</button><Register title={`${area.name} designations`} description="Available when onboarding employees in this thematic area" headings={["Job designation", "Level", "Responsibilities", "Employees"]} actions={<button className="hr-primary focus-ring" onClick={() => { setTitle(""); setDescription(""); setOpen(true); }}><Plus size={15} />Create designation</button>}>
    {designations.map(d => <tr key={d.id}><td><strong>{d.title}</strong></td><td>{d.level}</td><td className="hr-wrap-cell">{d.description}</td><td>{store.data.employees.filter(e => e.designationId === d.id).length}</td></tr>)}
  </Register>{open && <Overlay open title="Create job designation" label={area.name} onClose={() => setOpen(false)}><form className="hr-form" onSubmit={e => { e.preventDefault(); if (store.commit(state => {
    if (!title.trim() || !description.trim()) throw new Error("Enter a title and responsibilities.");
    if (state.designations.some(d => d.areaId === area.id && d.title.toLowerCase() === title.trim().toLowerCase())) throw new Error("This designation already exists in the thematic area.");
    return { ...state, designations: [...state.designations, { id: crypto.randomUUID(), areaId: area.id, title: title.trim(), level, description: description.trim() }] };
  }, "Designation created and available for employee onboarding.")) setOpen(false); }}><label>Designation title<input required maxLength={100} className="hr-field" value={title} onChange={e => setTitle(e.target.value)} /></label><label>Level<select className="hr-field" value={level} onChange={e => setLevel(e.target.value)}>{["Individual contributor", "Team lead", "Manager", "Head of function"].map(l => <option key={l}>{l}</option>)}</select></label><label>Responsibilities<textarea required maxLength={1000} className="hr-field" value={description} onChange={e => setDescription(e.target.value)} /></label>{store.error && <p role="alert" className="hr-error">{store.error}</p>}<button className="hr-primary focus-ring" type="submit">Create designation</button></form></Overlay>}</>;
}
