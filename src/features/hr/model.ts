import { financeAreas } from "../finance/data";
import { createSalaryRecords, payrollMonths } from "../finance/salaryData";
import { skillCenters } from "../monitoring-evaluation/skillProjectData";

export type Approval = "Pending" | "Approved" | "Rejected";
export interface Employee {
  id: string; name: string; email: string; phone: string; areaId: string; designationId: string;
  joiningDate: string; status: "Active" | "Onboarding"; loginId?: string;
}
export interface Designation { id: string; areaId: string; title: string; level: string; description: string }
export interface Assignment { employeeId: string; projectId: string; centerId: string; startDate: string }
export interface Assessment {
  employeeId: string; year: string; scores: Record<string, number>; notes: string; reviewer: string; updatedAt: string;
}
export interface Appraisal { employeeId: string; year: string; assessmentUpdatedAt: string; rating: number; notes: string; reviewer: string; completedAt: string }
export interface LeaveDecision { status: "Approved" | "Rejected"; reason: string; actor: string; at: string }
export interface Punch { time: string; latitude: number; longitude: number; accuracy: number; photoUrl?: string }
export interface AttendanceRecord { id: string; employeeId: string; date: string; punchIn?: Punch; punchOut?: Punch; source: string }
export interface HRState {
  employees: Employee[]; designations: Designation[]; assignments: Assignment[];
  assessments: Assessment[]; appraisals: Appraisal[]; leaveDecisions: Record<string, LeaveDecision>;
  attendance: AttendanceRecord[]; attendanceImportedAt?: string;
}
export const reviewYears = ["2026–27", "2025–26"];
export const indicators = [
  { id: "collaboration", name: "Collaboration", weight: 30, detail: "Teamwork, knowledge sharing and constructive feedback." },
  { id: "ownership", name: "Ownership", weight: 30, detail: "Accountability, delivery and problem solving." },
  { id: "leadership", name: "People leadership", weight: 20, detail: "Coaching, inclusion and support for colleagues." },
  { id: "conduct", name: "Values & conduct", weight: 20, detail: "Integrity, respect and responsible decisions." },
];
export function assessmentScore(assessment: Pick<Assessment, "scores">): number {
  return Number(indicators.reduce((sum, indicator) => sum + (assessment.scores[indicator.id] || 0) * indicator.weight / 100, 0).toFixed(2));
}
export const projects = financeAreas.flatMap(area => area.projects);
export function projectCenters(projectId: string) {
  const project = projects.find(item => item.id === projectId);
  if (!project) return [];
  return projectId === "FIN-SKI-01" ? skillCenters.map(center => ({ id: center.id, name: center.name })) : [{ id: `${projectId}:office`, name: `${project.location} · Project office` }];
}
export const leaves: { id: string; employeeId: string; type: string; start: string; end: string; days: number; balance: number; reason: string; adminStatus: Approval; adminBy?: string; adminAt?: string; adminNote?: string }[] = [
  { id: "LV-1041", employeeId: "PAN-EMP-0102", type: "Earned leave", start: "2026-10-12", end: "2026-10-14", days: 3, balance: 12, reason: "Family commitment. Training handover completed with the centre lead.", adminStatus: "Approved", adminBy: "Programme Admin (demo)", adminAt: "2026-10-08", adminNote: "Backup trainer confirmed; team coverage approved." },
  { id: "LV-1042", employeeId: "PAN-EMP-0104", type: "Casual leave", start: "2026-10-15", end: "2026-10-15", days: 1, balance: 5, reason: "Personal appointment. Field visit rescheduled.", adminStatus: "Pending" },
  { id: "LV-1043", employeeId: "PAN-EMP-0103", type: "Earned leave", start: "2026-10-19", end: "2026-10-20", days: 2, balance: 8, reason: "Personal travel.", adminStatus: "Rejected", adminBy: "Centre Admin (demo)", adminAt: "2026-10-08", adminNote: "Assessment week requires trainer coverage; alternate dates requested." },
];

export function createHRState(): HRState {
  const salaries = createSalaryRecords().filter(record => record.month === payrollMonths[0]);
  const designations: Designation[] = financeAreas.flatMap(area => [
    { id: `${area.id}:coordinator`, areaId: area.id, title: "Project Coordinator", level: "Individual contributor", description: "Coordinate project delivery and reporting." },
    { id: `${area.id}:manager`, areaId: area.id, title: "Programme Manager", level: "Manager", description: "Lead programme planning, teams and outcomes." },
  ]);
  const employees: Employee[] = salaries.map((record, index) => {
    const areaId = projects.find(p => p.id === record.projectId)!.areaId;
    const designationId = `role:${record.id}`;
    designations.push({ id: designationId, areaId, title: record.designation, level: "Individual contributor", description: "Existing employee designation." });
    return { id: record.id, name: record.name, email: `employee${index + 1}@example.org`, phone: `+91 90000 0010${index}`, areaId, designationId, joiningDate: "2025-04-01", status: "Active", loginId: record.id.replace("PAN-", "PNT-") };
  });
  designations.push({ id: "skill-development:trainer", areaId: "skill-development", title: "Trainer", level: "Individual contributor", description: "Deliver training and assess learner progress." });
  employees.unshift({ id: "EMP-0001", name: "Aditya Sahu", email: "aditya.sahu@example.org", phone: "+91 98765 43210", areaId: "skill-development", designationId: "skill-development:trainer", joiningDate: "2026-10-01", status: "Active" });
  const assignments = salaries.map(record => ({ employeeId: record.id, projectId: record.projectId, centerId: projectCenters(record.projectId)[0].id, startDate: "2026-04-01" }));
  assignments.unshift({ employeeId: "EMP-0001", projectId: "FIN-SKI-01", centerId: "angul", startDate: "2026-10-01" });
  const attendance: AttendanceRecord[] = employees.slice(0, 6).map((employee, index) => ({
    id: `PUNCH-${index + 1}`, employeeId: employee.id, date: "2026-10-09", source: "Sample preview",
    punchIn: { time: `2026-10-09T09:${index === 2 ? "48" : "18"}:00+05:30`, latitude: 20.844 + index * .002, longitude: 85.151 + index * .002, accuracy: 15 + index * 5 },
    ...(index !== 4 ? { punchOut: { time: "2026-10-09T18:05:00+05:30", latitude: 20.844 + index * .002, longitude: 85.151 + index * .002, accuracy: 18 } } : {}),
  }));
  return { employees, designations, assignments, attendance, assessments: [], appraisals: [], leaveDecisions: {} };
}

export function assignEmployee(state: HRState, assignment: Assignment): HRState {
  const employee = state.employees.find(e => e.id === assignment.employeeId);
  const project = projects.find(p => p.id === assignment.projectId);
  if (!employee || !project || employee.areaId !== project.areaId) throw new Error("Choose a project within the employee’s thematic area.");
  if (!projectCenters(project.id).some(center => center.id === assignment.centerId)) throw new Error("Choose a centre belonging to this project.");
  if (!isDate(assignment.startDate) || assignment.startDate < employee.joiningDate) throw new Error("Assignment date must be on or after the joining date.");
  return { ...state, assignments: [...state.assignments.filter(a => a.employeeId !== employee.id), assignment] };
}
export function saveEmployee(state: HRState, employee: Employee): HRState {
  if (!employee.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email) || employee.phone.replace(/\D/g, "").length < 10 || !isDate(employee.joiningDate)) throw new Error("Enter a name, valid email, phone number and joining date.");
  if (!state.designations.some(d => d.id === employee.designationId && d.areaId === employee.areaId)) throw new Error("Choose a designation in this thematic area.");
  if (state.employees.some(e => e.id !== employee.id && e.email.toLowerCase() === employee.email.toLowerCase())) throw new Error("An employee with this email already exists.");
  const existing = state.employees.find(e => e.id === employee.id);
  const assignment = state.assignments.find(a => a.employeeId === employee.id);
  if (assignment && employee.joiningDate > assignment.startDate) throw new Error("Joining date cannot be after the current project assignment date.");
  return { ...state, employees: existing ? state.employees.map(e => e.id === employee.id ? employee : e) : [...state.employees, employee], assignments: existing?.areaId !== employee.areaId ? state.assignments.filter(a => a.employeeId !== employee.id) : state.assignments };
}
export function saveAssessment(state: HRState, assessment: Assessment): HRState {
  if (!state.employees.some(e => e.id === assessment.employeeId) || !reviewYears.includes(assessment.year)) throw new Error("Choose an employee and review year.");
  if (indicators.some(i => !Number.isInteger(assessment.scores[i.id]) || assessment.scores[i.id] < 1 || assessment.scores[i.id] > 5)) throw new Error("Rate every indicator from 1 to 5.");
  if (assessment.notes.trim().length < 10) throw new Error("Add supporting examples (at least 10 characters).");
  if (state.appraisals.some(a => a.employeeId === assessment.employeeId && a.year === assessment.year)) throw new Error("The year-end appraisal is complete. Its KBI assessment is locked.");
  return { ...state, assessments: [...state.assessments.filter(a => a.employeeId !== assessment.employeeId || a.year !== assessment.year), assessment] };
}
export function completeAppraisal(state: HRState, appraisal: Appraisal): HRState {
  const assessment = state.assessments.find(a => a.employeeId === appraisal.employeeId && a.year === appraisal.year);
  if (!assessment || assessment.updatedAt !== appraisal.assessmentUpdatedAt) throw new Error("Save and review the current employee KBI assessment first.");
  if (state.appraisals.some(a => a.employeeId === appraisal.employeeId && a.year === appraisal.year)) throw new Error("This appraisal is already complete.");
  if (!Number.isInteger(appraisal.rating) || appraisal.rating < 1 || appraisal.rating > 5 || appraisal.notes.trim().length < 10) throw new Error("Provide a valid rating and development notes (at least 10 characters).");
  return { ...state, appraisals: [...state.appraisals, appraisal] };
}
export function decideLeave(state: HRState, id: string, decision: LeaveDecision): HRState {
  const request = leaves.find(l => l.id === id);
  if (!request || request.adminStatus !== "Approved") throw new Error("Admin approval is required before HR can decide this request.");
  if (state.leaveDecisions[id]) throw new Error("This request has already been reviewed.");
  if (decision.status === "Rejected" && !decision.reason.trim()) throw new Error("Add a reason for rejection.");
  return { ...state, leaveDecisions: { ...state.leaveDecisions, [id]: decision } };
}
export function isDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value; }
export function attendanceIssue(record?: AttendanceRecord) {
  if (!record?.punchIn) return "No punch-in";
  if (!record.punchOut) return "Missing punch-out";
  if (!record.punchIn.photoUrl || !record.punchOut.photoUrl) return "Photo evidence missing";
  return "Evidence received";
}
export function parseAttendance(text: string, employees: Employee[]): AttendanceRecord[] {
  const rows: unknown = JSON.parse(text);
  if (!Array.isArray(rows) || rows.length > 5000 || rows.length === 0) throw new Error("Upload a JSON array containing 1–5,000 attendance records.");
  const keys = new Set<string>();
  return rows.map((row: unknown) => {
    if (!row || typeof row !== "object") throw new Error("Invalid attendance record.");
    const r = row as Record<string, unknown>;
    if (typeof r.id !== "string" || !r.id.trim() || typeof r.employeeId !== "string" || !employees.some(e => e.id === r.employeeId) || typeof r.date !== "string" || !isDate(r.date)) throw new Error("Each record needs an ID, a known employee ID and a valid date.");
    const key = `${r.employeeId}:${r.date}`;
    if (keys.has(key)) throw new Error("Only one daily punch pair per employee is supported; remove duplicate employee/date entries.");
    keys.add(key);
    const punch = (value: unknown): Punch | undefined => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== "object") throw new Error("Invalid punch evidence.");
      const p = value as Record<string, unknown>;
      if (typeof p.time !== "string" || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(p.time) || Number.isNaN(Date.parse(p.time)) || typeof p.latitude !== "number" || Math.abs(p.latitude) > 90 || typeof p.longitude !== "number" || Math.abs(p.longitude) > 180 || typeof p.accuracy !== "number" || p.accuracy < 0 || ![p.latitude, p.longitude, p.accuracy].every(Number.isFinite)) throw new Error("Punch evidence requires a timestamp with timezone, valid GPS coordinates and accuracy in metres.");
      if (p.photoUrl !== undefined && (typeof p.photoUrl !== "string" || !/^https:\/\/[^\s]+$/.test(p.photoUrl))) throw new Error("Photo URLs must use HTTPS.");
      return { time: p.time, latitude: p.latitude, longitude: p.longitude, accuracy: p.accuracy, photoUrl: p.photoUrl as string | undefined };
    };
    const punchIn = punch(r.punchIn), punchOut = punch(r.punchOut);
    if (!punchIn && !punchOut) throw new Error("Include at least one punch event per record.");
    if (punchIn && punchOut && Date.parse(punchOut.time) <= Date.parse(punchIn.time)) throw new Error("Punch-out must be after punch-in.");
    if (punchIn && new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(punchIn.time)) !== r.date) throw new Error("The attendance date must match punch-in in Asia/Kolkata.");
    return { id: r.id, employeeId: r.employeeId, date: r.date, punchIn, punchOut, source: "Platform export" };
  });
}
