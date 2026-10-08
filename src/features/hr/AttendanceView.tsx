import { useRef, useState } from "react";
import { Camera, Download, MapPin, Upload } from "lucide-react";
import { Overlay } from "../../components/ui/Overlay";
import { attendanceIssue, parseAttendance, type AttendanceRecord, type Punch } from "./model";
import type { HRStore } from "./store";
import { EmployeeCell, Filters, Metric, Register, Status, timestampLabel } from "./components";
import { exportCSV } from "./data";

function duration(record?: AttendanceRecord) {
  if (!record?.punchIn || !record.punchOut) return "—";
  const minutes = Math.round((Date.parse(record.punchOut.time) - Date.parse(record.punchIn.time)) / 60000);
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
export function AttendanceView({ store }: { store: HRStore }) {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState(store.data.attendance.map(r => r.date).sort().at(-1) || "2026-10-09");
  const [exceptionsOnly, setExceptionsOnly] = useState(false);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const daily = store.data.attendance.filter(r => r.date === date);
  const eligibleEmployees = store.data.employees.filter(e => e.joiningDate <= date);
  const entries = eligibleEmployees.map(employee => ({ employee, record: daily.find(r => r.employeeId === employee.id) }));
  const visible = entries.filter(({ employee, record }) => `${employee.name} ${employee.id}`.toLowerCase().includes(query.toLowerCase()) && (!exceptionsOnly || attendanceIssue(record) !== "Evidence received"));
  async function importFile(file?: File) {
    if (!file) return;
    setImportError(""); setImporting(true);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Attendance exports must be smaller than 5 MB.");
      const rows = parseAttendance(await file.text(), store.data.employees);
      if (store.commit(state => {
        const checked = parseAttendance(JSON.stringify(rows), state.employees);
        const keys = new Set(checked.map(r => `${r.employeeId}:${r.date}`));
        const existing = state.attendanceImportedAt ? state.attendance.filter(r => !keys.has(`${r.employeeId}:${r.date}`)) : [];
        return { ...state, attendance: [...existing, ...checked], attendanceImportedAt: new Date().toISOString() };
      }, `${rows.length} attendance records imported. Evidence remains read-only.`)) setDate(rows.map(r => r.date).sort().at(-1)!);
    } catch (e) { setImportError(e instanceof Error ? e.message : "The attendance file could not be read."); }
    finally { setImporting(false); if (input.current) input.current.value = ""; }
  }
  const formatExample = JSON.stringify([{ id: "PUNCH-001", employeeId: store.data.employees[0]?.id, date: "2026-10-09", punchIn: { time: "2026-10-09T09:20:00+05:30", latitude: 20.844, longitude: 85.151, accuracy: 15, photoUrl: "https://your-platform.example/punch-in.jpg" }, punchOut: { time: "2026-10-09T18:00:00+05:30", latitude: 20.844, longitude: 85.151, accuracy: 12, photoUrl: "https://your-platform.example/punch-out.jpg" } }], null, 2);
  return <>
    <div className="hr-banner"><Camera size={23} /><div><strong>{store.data.attendanceImportedAt ? "Platform export imported · Read-only evidence" : "Employee attendance platform · Connection pending"}</strong><p>{store.data.attendanceImportedAt ? `Last import: ${timestampLabel(store.data.attendanceImportedAt)} IST. Records are from an uploaded export, not a live feed.` : "Sample punch records are shown below. Live photos are not supplied in the sample. Connect the employee platform or import its export to review actual evidence."}</p></div><button className="cxo-button focus-ring" onClick={() => setShowFormat(true)}>Import format</button></div>
    <div className="cxo-metrics"><Metric label="Employees punched in" value={daily.filter(r => r.punchIn).length} detail={`${eligibleEmployees.length} employees joined by this date`} /><Metric label="Missing punch-out" value={daily.filter(r => r.punchIn && !r.punchOut).length} detail="Requires employee follow-up" /><Metric label="Evidence complete" value={daily.filter(r => attendanceIssue(r) === "Evidence received").length} detail="Both punches include photo and GPS" /><Metric label="No punch-in" value={entries.filter(e => !e.record?.punchIn).length} detail="Not automatically classified as absent" /></div>
    {importError && <p role="alert" className="hr-error">{importError}</p>}
    <Register title="Punch attendance" description="Punch-in and punch-out from the employee platform · Times in IST · Elapsed time excludes no breaks" headings={["Employee", "Punch-in", "Punch-out", "Elapsed", "Evidence", "Action"]} empty={!visible.length} actions={<div className="hr-buttons"><input ref={input} type="file" accept=".json,application/json" className="sr-only" aria-label="Import attendance JSON" onChange={e => void importFile(e.target.files?.[0])} /><button className="cxo-button focus-ring" disabled={importing} onClick={() => input.current?.click()}><Upload size={14} />{importing ? "Importing…" : "Import export"}</button><button className="cxo-button focus-ring" onClick={() => exportCSV(`attendance-${date}`, [["Employee ID", "Employee", "Date", "Punch-in", "Punch-out", "Elapsed", "Evidence"], ...visible.map(({ employee, record }) => [employee.id, employee.name, date, record?.punchIn?.time || "", record?.punchOut?.time || "", duration(record), attendanceIssue(record)])])}><Download size={14} />Export</button></div>} filters={<Filters query={query} setQuery={setQuery}><label><span className="sr-only">Attendance date</span><input type="date" required value={date} onChange={e => setDate(e.target.value)} /></label><label className="hr-checkbox"><input type="checkbox" checked={exceptionsOnly} onChange={e => setExceptionsOnly(e.target.checked)} />Exceptions only</label></Filters>}>
      {visible.map(({ employee, record }) => <tr key={employee.id}><td><EmployeeCell employee={employee} /></td><td>{timestampLabel(record?.punchIn?.time)}</td><td>{timestampLabel(record?.punchOut?.time)}</td><td>{duration(record)}</td><td><Status>{attendanceIssue(record)}</Status><span className="hr-cell-note">{record?.source ?? "No platform record"}</span></td><td><button className="cxo-button focus-ring" disabled={!record} onClick={() => setSelected(record!)}>View evidence</button></td></tr>)}
    </Register>
    {selected && <Overlay open title={store.data.employees.find(e => e.id === selected.employeeId)?.name} label={`Punch evidence · ${selected.date} · IST`} size="xl" onClose={() => setSelected(null)}><div className="hr-form"><p className="hr-description">{selected.source}. Photos and GPS evidence are supplied by the employee platform. HR cannot capture, replace or alter a punch here.</p><div className="hr-evidence-grid"><PunchEvidence title="Punch-in" punch={selected.punchIn} /><PunchEvidence title="Punch-out" punch={selected.punchOut} /></div></div></Overlay>}
    {showFormat && <Overlay open title="Attendance platform export" label="Integration format" onClose={() => setShowFormat(false)}><div className="hr-form"><p className="hr-description">Upload a JSON array with one daily punch pair per employee. IDs must match the employee register. Timestamps require a timezone; the date follows IST. GPS accuracy is in metres. Photos must be HTTPS URLs accessible to the reviewer. Missing photos are flagged. The first import replaces the sample preview; subsequent imports update matching employee/date pairs.</p><pre className="hr-code">{formatExample}</pre><p className="hr-description">Example URLs are placeholders. Use the actual platform’s secured photo URLs. No credentials or API keys should be included in the export.</p></div></Overlay>}
  </>;
}
function PunchEvidence({ title, punch }: { title: string; punch?: Punch }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <section className="hr-evidence"><h3>{title}</h3><p>{timestampLabel(punch?.time)}</p><div className="hr-photo">{punch?.photoUrl && !imageFailed ? <img src={punch.photoUrl} alt={`${title} photo supplied by the employee platform`} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : <><Camera size={30} /><span>{imageFailed ? "Photo could not be loaded" : "Live photo not received"}</span></>}</div>{punch ? <><p><MapPin size={14} />{punch.latitude.toFixed(5)}, {punch.longitude.toFixed(5)}</p><span className="hr-description">GPS accuracy: ±{punch.accuracy} m</span><a className="hr-inline-link focus-ring" href={`https://www.openstreetmap.org/?mlat=${punch.latitude}&mlon=${punch.longitude}#map=17/${punch.latitude}/${punch.longitude}`} target="_blank" rel="noreferrer">Open recorded location ↗</a></> : <p className="hr-description">No punch event received.</p>}</section>;
}
