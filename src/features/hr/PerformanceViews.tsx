import { useState } from "react";
import { Award, LockKeyhole, Save, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Overlay } from "../../components/ui/Overlay";
import { useAuth } from "../../hooks/useAuth";
import { assessmentScore, completeAppraisal, indicators, reviewYears, saveAssessment, type Assessment, type Employee } from "./model";
import type { HRStore } from "./store";
import { dateLabel, EmployeeCell, filterEmployees, Filters, Metric, Register, Status } from "./components";

export function PerformanceView({ store, mode }: { store: HRStore; mode: "kbi" | "appraisal" }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [year, setYear] = useState(reviewYears[0]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const filtered = filterEmployees(store.data, query, area);
  const assessed = store.data.assessments.filter(a => a.year === year);
  const completed = store.data.appraisals.filter(a => a.year === year);
  const selectedAssessment = store.data.assessments.find(a => a.employeeId === selected?.id && a.year === year);
  return <>
    <div className="hr-banner">{mode === "kbi" ? <Target size={23} /> : <Award size={23} />}<div><strong>{mode === "kbi" ? "Employee-wise KBI assessments, owned by HR." : "Year-end appraisal, informed by the employee’s KBI assessment."}</strong><p>{mode === "kbi" ? "Rate each behavioural indicator and record supporting examples for the selected review year." : "Complete KBI first, then record the overall rating and development plan. Finalising locks that year’s assessment."}</p></div></div>
    <div className="cxo-metrics"><Metric label="Review population" value={store.data.employees.length} detail={`Employee register · FY ${year}`} /><Metric label="KBI assessments saved" value={assessed.length} detail={`${store.data.employees.length - assessed.length} yet to be assessed`} /><Metric label="Average KBI score" value={assessed.length ? `${(assessed.reduce((s, a) => s + assessmentScore(a), 0) / assessed.length).toFixed(2)} / 5` : "—"} detail="Based on saved employee assessments" /><Metric label="Appraisals finalised" value={completed.length} detail={`${store.data.employees.length - completed.length} remaining for this year`} /></div>
    <Register title={mode === "kbi" ? "Employee KBI scorecards" : "Year-end appraisals"} description={`FY ${year} · 1 = needs improvement, 3 = meets expectations, 5 = role model`} headings={["Employee", "KBI score", "Assessed by", mode === "kbi" ? "Status" : "Overall rating", "Action"]} empty={!filtered.length} filters={<Filters query={query} setQuery={setQuery} area={area} setArea={setArea}><label><span className="sr-only">Review year</span><select value={year} onChange={e => setYear(e.target.value)}>{reviewYears.map(y => <option key={y}>{y}</option>)}</select></label></Filters>}>
      {filtered.map(e => { const assessment = assessed.find(a => a.employeeId === e.id); const appraisal = completed.find(a => a.employeeId === e.id); return <tr key={e.id}><td><EmployeeCell employee={e} /></td><td><strong>{assessment ? `${assessmentScore(assessment).toFixed(2)} / 5` : "Not assessed"}</strong></td><td>{assessment?.reviewer || "—"}<span className="hr-cell-note">{assessment ? dateLabel(assessment.updatedAt) : "Awaiting HR"}</span></td><td>{mode === "kbi" ? <Status>{appraisal ? "Finalised" : assessment ? "Assessment saved" : "Pending assessment"}</Status> : appraisal ? <><strong>{appraisal.rating} / 5</strong><span className="hr-cell-note">Finalised {dateLabel(appraisal.completedAt)}</span></> : <Status>{assessment ? "Ready for appraisal" : "Awaiting KBI"}</Status>}</td><td><button className="cxo-button focus-ring" disabled={mode === "appraisal" && !assessment} onClick={() => setSelected(e)}>{appraisal ? "View" : mode === "kbi" ? (assessment ? "Edit assessment" : "Assess employee") : "Review appraisal"}</button></td></tr>; })}
    </Register>
    {mode === "appraisal" && <p className="hr-description hr-spacing">Employees without a saved assessment need a <Link to="/hr/kbi-metrics" className="hr-inline-link">KBI assessment</Link> before their year-end appraisal.</p>}
    {selected && <Overlay open title={selected.name} label={`${mode === "kbi" ? "KBI assessment" : "Year-end appraisal"} · FY ${year}`} onClose={() => setSelected(null)}>{mode === "kbi" ? <AssessmentForm employee={selected} year={year} store={store} onClose={() => setSelected(null)} /> : selectedAssessment && <AppraisalForm employee={selected} assessment={selectedAssessment} store={store} onClose={() => setSelected(null)} />}</Overlay>}
  </>;
}
function AssessmentForm({ employee, year, store, onClose }: { employee: Employee; year: string; store: HRStore; onClose: () => void }) {
  const { user } = useAuth();
  const existing = store.data.assessments.find(a => a.employeeId === employee.id && a.year === year);
  const locked = store.data.appraisals.some(a => a.employeeId === employee.id && a.year === year);
  const [scores, setScores] = useState<Record<string, number>>(existing?.scores || {});
  const [notes, setNotes] = useState(existing?.notes || "");
  const isComplete = indicators.every(i => scores[i.id] >= 1 && scores[i.id] <= 5);
  return <form className="hr-form" onSubmit={event => { event.preventDefault(); if (store.commit(state => saveAssessment(state, { employeeId: employee.id, year, scores, notes: notes.trim(), reviewer: user!.name, updatedAt: new Date().toISOString() }), "Employee KBI assessment saved for the year-end appraisal.")) onClose(); }}>
    {locked && <p className="hr-banner"><LockKeyhole size={18} />Finalised appraisal · Assessment locked</p>}
    <div className="hr-score-header"><span>Weighted KBI score</span><strong>{isComplete ? assessmentScore({ scores }).toFixed(2) : "—"}<small> / 5</small></strong></div>
    {indicators.map(i => <div className="hr-indicator" key={i.id}><div><h3>{i.name} <span>{i.weight}% weight</span></h3><p>{i.detail}</p></div><label><span className="sr-only">{i.name} rating</span><select className="hr-field" required disabled={locked} value={scores[i.id] || ""} onChange={e => setScores(previous => ({ ...previous, [i.id]: Number(e.target.value) }))}><option value="">Rate</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label></div>)}
    <label>Evidence and HR observations<textarea className="hr-field" required minLength={10} maxLength={3000} readOnly={locked} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Record employee-specific examples and areas for development." /></label><p className="hr-description">Weighted score = sum of indicator rating × weight. The overall year-end rating is recorded separately in Appraisals.</p>
    {store.error && <p role="alert" className="hr-error">{store.error}</p>}{!locked && <button className="hr-primary focus-ring" type="submit"><Save size={15} />Save employee assessment</button>}
  </form>;
}
function AppraisalForm({ employee, assessment, store, onClose }: { employee: Employee; assessment: Assessment; store: HRStore; onClose: () => void }) {
  const { user } = useAuth();
  const existing = store.data.appraisals.find(a => a.employeeId === employee.id && a.year === assessment.year);
  const [rating, setRating] = useState(existing?.rating.toString() || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  return <form className="hr-form" onSubmit={e => { e.preventDefault(); if (store.commit(state => completeAppraisal(state, { employeeId: employee.id, year: assessment.year, assessmentUpdatedAt: assessment.updatedAt, rating: Number(rating), notes: notes.trim(), reviewer: user!.name, completedAt: new Date().toISOString() }), "Year-end appraisal finalised. The supporting KBI assessment is now locked.")) onClose(); }}>
    <div className="hr-score-header"><span>Employee KBI score · FY {assessment.year}</span><strong>{assessmentScore(assessment).toFixed(2)}<small> / 5</small></strong></div>
    <dl className="hr-breakdown">{indicators.map(i => <div key={i.id}><dt>{i.name} · {i.weight}%</dt><dd>{assessment.scores[i.id]} / 5</dd></div>)}</dl><p className="hr-description">Assessed by {assessment.reviewer} on {dateLabel(assessment.updatedAt)}.<br />{assessment.notes}</p>
    <label>Overall year-end rating<select className="hr-field" required disabled={!!existing} value={rating} onChange={e => setRating(e.target.value)}><option value="">Choose overall rating</option>{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label><label>Development plan and appraisal summary<textarea className="hr-field" required minLength={10} maxLength={3000} readOnly={!!existing} value={notes} onChange={e => setNotes(e.target.value)} /></label>
    {existing ? <p className="hr-banner"><LockKeyhole size={17} />Finalised by {existing.reviewer} on {dateLabel(existing.completedAt)}</p> : <p className="hr-description">Finalising records this review and locks its KBI assessment for FY {assessment.year}.</p>}
    {store.error && <p role="alert" className="hr-error">{store.error}</p>}{!existing && <button className="hr-primary focus-ring" type="submit">Finalise year-end appraisal</button>}
  </form>;
}
