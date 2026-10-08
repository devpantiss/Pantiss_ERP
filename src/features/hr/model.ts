import { financeAreas } from "../finance/data";
import { createSalaryRecords, payrollMonths } from "../finance/salaryData";
import { skillCenters } from "../monitoring-evaluation/skillProjectData";

export type Approval = "Pending" | "Approved" | "Rejected";
export interface Employee {
  id: string; name: string; email: string; phone: string; areaId: string; designationId: string;
  joiningDate: string; status: "Active" | "Onboarding"; loginId?: string;
  /** Gross annual salary (CTC) in Rupees. Monthly = annual / 12. */
  annualSalary?: number;
}
export interface Designation { id: string; areaId: string; title: string; level: string; description: string }
export interface Assignment { employeeId: string; projectId: string; centerId: string; startDate: string }
export interface Assessment {
  employeeId: string; year: string; scores: Record<string, number>; notes: string; reviewer: string; updatedAt: string;
}
export interface Appraisal {
  employeeId: string; year: string; assessmentUpdatedAt: string; rating: number; notes: string; reviewer: string; completedAt: string;
  /** Optional on appraisals finalised before salary revisions were introduced. */
  incrementPercent?: number; previousAnnualSalary?: number; revisedAnnualSalary?: number;
}
export interface LeaveDecision { status: "Approved" | "Rejected"; reason: string; actor: string; at: string }
export interface Punch { time: string; latitude: number; longitude: number; accuracy: number; photoUrl?: string }
export interface AttendanceRecord { id: string; employeeId: string; date: string; punchIn?: Punch; punchOut?: Punch; source: string }

export type CandidateStage =
  | "Applied"
  | "Screening"
  | "Interview Scheduled"
  | "Technical Round"
  | "HR Round"
  | "Selected"
  | "Offer Released"
  | "Offer Accepted"
  | "Rejected"
  | "Onboarded";

export interface JobPosting {
  id: string;
  title: string;
  areaId: string;
  department: string;
  location: string;
  experience: string;
  openings: number;
  minSalary: number; // Gross Annual CTC in ₹
  maxSalary: number; // Gross Annual CTC in ₹
  status: "Active" | "Draft" | "Closed";
  postedDate: string;
  closingDate: string;
  description: string;
  requirements: string[];
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  currentCompany?: string;
  experienceYears: number;
  currentSalary?: number; // Gross Annual CTC in ₹
  expectedSalary: number; // Gross Annual CTC in ₹
  noticePeriod: string;
  stage: CandidateStage;
  rating?: number; // 1 to 5
  appliedDate: string;
  notes?: string;
  resumeSummary?: string;
}

export type InterviewRound =
  | "Initial Screening"
  | "Technical Assessment"
  | "Thematic Panel"
  | "HR & Cultural Fit"
  | "Final Leadership";

export type InterviewMode = "Google Meet" | "In-Person (HQ)" | "Phone Screen" | "Microsoft Teams";

export interface Interview {
  id: string;
  candidateId: string;
  jobId: string;
  round: InterviewRound;
  scheduledAt: string; // ISO datetime e.g. "2026-10-14T10:30"
  durationMinutes: number;
  interviewer: string;
  mode: InterviewMode;
  meetLink?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  feedback?: string;
  rating?: number; // 1 to 5
  recommendation?: "Advance to Next Round" | "Select for Offer" | "Hold" | "Reject";
}

export type OfferStatus = "Draft" | "Released" | "Accepted" | "Declined" | "Onboarded";

export interface OfferLetter {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  designationTitle: string;
  areaId: string;
  joiningDate: string;
  annualSalary: number; // Annual CTC
  monthlySalary: number;
  basicHra: number;
  allowance: number;
  expiryDate: string;
  status: OfferStatus;
  releasedAt: string;
  releasedBy: string;
  termsNotes?: string;
}

export interface HRState {
  employees: Employee[]; designations: Designation[]; assignments: Assignment[];
  assessments: Assessment[]; appraisals: Appraisal[]; leaveDecisions: Record<string, LeaveDecision>;
  attendance: AttendanceRecord[]; attendanceImportedAt?: string;
  jobPostings: JobPosting[];
  candidates: Candidate[];
  interviews: Interview[];
  offerLetters: OfferLetter[];
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
export const MAX_INCREMENT_PERCENT = 100;
export const monthlyFromAnnual = (annual: number) => Math.round(annual / 12);
export const annualFromMonthly = (monthly: number) => Math.round(monthly * 12);
/** Revised annual salary after applying an increment, rounded to the nearest Rupee. */
export function revisedSalary(annual: number, incrementPercent: number) { return Math.round(annual * (1 + incrementPercent / 100)); }
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
    return { id: record.id, name: record.name, email: `employee${index + 1}@example.org`, phone: `+91 90000 0010${index}`, areaId, designationId, joiningDate: "2025-04-01", status: "Active", loginId: record.id.replace("PAN-", "PNT-"), annualSalary: annualFromMonthly(record.basicHra + record.allowance) };
  });
  designations.push({ id: "skill-development:trainer", areaId: "skill-development", title: "Trainer", level: "Individual contributor", description: "Deliver training and assess learner progress." });
  employees.unshift({ id: "EMP-0001", name: "Aditya Sahu", email: "aditya.sahu@example.org", phone: "+91 98765 43210", areaId: "skill-development", designationId: "skill-development:trainer", joiningDate: "2026-10-01", status: "Active", annualSalary: 360000 });
  const assignments = salaries.map(record => ({ employeeId: record.id, projectId: record.projectId, centerId: projectCenters(record.projectId)[0].id, startDate: "2026-04-01" }));
  assignments.unshift({ employeeId: "EMP-0001", projectId: "FIN-SKI-01", centerId: "angul", startDate: "2026-10-01" });
  const attendance: AttendanceRecord[] = employees.slice(0, 6).map((employee, index) => ({
    id: `PUNCH-${index + 1}`, employeeId: employee.id, date: "2026-10-09", source: "Sample preview",
    punchIn: { time: `2026-10-09T09:${index === 2 ? "48" : "18"}:00+05:30`, latitude: 20.844 + index * .002, longitude: 85.151 + index * .002, accuracy: 15 + index * 5 },
    ...(index !== 4 ? { punchOut: { time: "2026-10-09T18:05:00+05:30", latitude: 20.844 + index * .002, longitude: 85.151 + index * .002, accuracy: 18 } } : {}),
  }));
  const jobPostings: JobPosting[] = [
    {
      id: "JOB-2026-01",
      title: "Community Livelihood Project Coordinator",
      areaId: "agriculture-livelihoods",
      department: "Field Operations & Rural Livelihoods",
      location: "Angul & Dhenkanal · Cluster Office",
      experience: "3–5 Years",
      openings: 2,
      minSalary: 480000,
      maxSalary: 650000,
      status: "Active",
      postedDate: "2026-09-15",
      closingDate: "2026-10-31",
      description: "Drive cluster-level farmer producer organisation (FPO) mobilisation, value chain interventions, and field team coordination.",
      requirements: [
        "Postgraduate degree in Rural Development, Social Work, or Agriculture.",
        "At least 3 years of demonstrated field project execution experience.",
        "Fluency in Odia and English; strong report writing skills.",
        "Willingness to travel across project intervention clusters."
      ]
    },
    {
      id: "JOB-2026-02",
      title: "Vocational Skill Trainer (Electrical & Solar)",
      areaId: "skill-development",
      department: "Technical Training & Lab Instruction",
      location: "Angul Skill Training Centre · On-site",
      experience: "2–4 Years",
      openings: 3,
      minSalary: 360000,
      maxSalary: 480000,
      status: "Active",
      postedDate: "2026-09-20",
      closingDate: "2026-11-15",
      description: "Instruct NSQF compliant electrical installation and solar panel technician modules, oversee hands-on workshop safety, and mentor student batches.",
      requirements: [
        "Diploma or B.Tech in Electrical / Electronics Engineering.",
        "Certified TOT (Trainer of Trainers) under NSDC / Skill India preferred.",
        "Hands-on equipment maintenance and safety lab protocol experience."
      ]
    },
    {
      id: "JOB-2026-03",
      title: "Senior Watershed & Agroforestry Lead",
      areaId: "environment-forest",
      department: "Natural Resource Management",
      location: "Bhubaneswar HQ · Field Deployment",
      experience: "5+ Years",
      openings: 1,
      minSalary: 650000,
      maxSalary: 850000,
      status: "Active",
      postedDate: "2026-10-01",
      closingDate: "2026-11-20",
      description: "Lead technical hydrology surveys, watershed ridge-to-valley treatments, agroforestry plantations, and community water committees.",
      requirements: [
        "Master's in Environmental Sciences, Hydrology, Forestry, or Civil Engineering.",
        "5+ years leading participatory watershed and natural regeneration projects.",
        "Working knowledge of GIS contour mapping and district line department liaison."
      ]
    },
    {
      id: "JOB-2026-04",
      title: "M&E and Impact Data Analytics Officer",
      areaId: "skill-development",
      department: "Monitoring, Evaluation & Learning",
      location: "Bhubaneswar State Office",
      experience: "1–3 Years",
      openings: 1,
      minSalary: 420000,
      maxSalary: 550000,
      status: "Draft",
      postedDate: "2026-10-05",
      closingDate: "2026-11-30",
      description: "Conduct field verification surveys, digitise learner outcome metrics, and prepare executive donor dashboards.",
      requirements: [
        "Degree in Statistics, Economics, Information Management, or related field.",
        "Proficiency in Excel, KoboToolbox, and BI reporting tools."
      ]
    }
  ];

  const candidates: Candidate[] = [
    {
      id: "APP-2026-101",
      jobId: "JOB-2026-01",
      name: "Priyanka Mishra",
      email: "priyanka.mishra@example.com",
      phone: "+91 98451 22340",
      currentCompany: "Gramin Vikas Trust",
      experienceYears: 4,
      currentSalary: 480000,
      expectedSalary: 600000,
      noticePeriod: "30 Days",
      stage: "Selected",
      rating: 4.8,
      appliedDate: "2026-09-22",
      notes: "Clear field leadership in women SHG federation federations. Panel recommended immediate offer release.",
      resumeSummary: "4 years experience managing farm livelihoods in Dhenkanal district with focus on organic millet promotion."
    },
    {
      id: "APP-2026-102",
      jobId: "JOB-2026-02",
      name: "Subhashis Nayak",
      email: "subhashis.nayak@example.com",
      phone: "+91 97760 88120",
      currentCompany: "Schneider Skill Institute",
      experienceYears: 3,
      currentSalary: 380000,
      expectedSalary: 450000,
      noticePeriod: "15 Days",
      stage: "Offer Released",
      rating: 4.5,
      appliedDate: "2026-09-25",
      notes: "Certified solar installer. Offer letter OFR-2026-01 released at ₹4,50,000 CTC. Awaiting acceptance.",
      resumeSummary: "Electrical Diploma holder with 3 years vocational classroom training experience in solar power."
    },
    {
      id: "APP-2026-103",
      jobId: "JOB-2026-01",
      name: "Tanvi Sundaram",
      email: "tanvi.s@example.com",
      phone: "+91 94371 90876",
      currentCompany: "Pradan Foundation",
      experienceYears: 2.5,
      currentSalary: 420000,
      expectedSalary: 520000,
      noticePeriod: "Immediate",
      stage: "Interview Scheduled",
      rating: 4.2,
      appliedDate: "2026-09-28",
      notes: "Technical round scheduled for Oct 12 with Dr. Minati Biswal.",
      resumeSummary: "M.Sc Agriculture with field project experience in micro-irrigation and post-harvest storage."
    },
    {
      id: "APP-2026-104",
      jobId: "JOB-2026-02",
      name: "Rajendra Prasad Jena",
      email: "rajendra.jena@example.com",
      phone: "+91 98610 33491",
      currentCompany: "L&T Skill Academy",
      experienceYears: 5,
      currentSalary: 420000,
      expectedSalary: 480000,
      noticePeriod: "30 Days",
      stage: "Offer Accepted",
      rating: 4.9,
      appliedDate: "2026-09-24",
      notes: "Offer letter OFR-2026-02 accepted! Candidate ready for ERP onboarding.",
      resumeSummary: "TOT Certified master trainer in Industrial Wiring & Safety. 5 years teaching batches in Cuttack & Angul."
    },
    {
      id: "APP-2026-105",
      jobId: "JOB-2026-03",
      name: "Debashree Mohanty",
      email: "debashree.m@example.com",
      phone: "+91 99372 11045",
      currentCompany: "WOTR Odisha",
      experienceYears: 6,
      currentSalary: 640000,
      expectedSalary: 780000,
      noticePeriod: "60 Days",
      stage: "Interview Scheduled",
      rating: 4.6,
      appliedDate: "2026-10-03",
      notes: "Screening cleared. Phone screen set for Oct 14 with HR.",
      resumeSummary: "M.Sc Forestry from OUAT. Managed 4 watershed ridge-to-valley projects across Rayagada and Koraput."
    },
    {
      id: "APP-2026-106",
      jobId: "JOB-2026-01",
      name: "Anil Kumar Barik",
      email: "anil.barik@example.com",
      phone: "+91 94380 66712",
      currentCompany: "Freelance Researcher",
      experienceYears: 1.5,
      currentSalary: 300000,
      expectedSalary: 450000,
      noticePeriod: "Immediate",
      stage: "Screening",
      rating: 3.5,
      appliedDate: "2026-10-06",
      notes: "Fresh postgraduate in Agricultural Economics. Resume under portfolio screening.",
      resumeSummary: "Recent post-graduate with thesis on collective bargaining in tribal vegetable markets."
    },
    {
      id: "APP-2026-107",
      jobId: "JOB-2026-02",
      name: "Siddharth Patnaik",
      email: "siddharth.p@example.com",
      phone: "+91 97771 44520",
      currentCompany: "ITI Cuttack",
      experienceYears: 2,
      currentSalary: 320000,
      expectedSalary: 400000,
      noticePeriod: "Immediate",
      stage: "Rejected",
      rating: 2.4,
      appliedDate: "2026-09-26",
      notes: "Did not meet technical safety benchmark during practical lab evaluation.",
      resumeSummary: "ITI Electrical certificate holder. Worked as junior workshop assistant."
    }
  ];

  const interviews: Interview[] = [
    {
      id: "INT-2026-01",
      candidateId: "APP-2026-101",
      jobId: "JOB-2026-01",
      round: "Thematic Panel",
      scheduledAt: "2026-10-04T11:00",
      durationMinutes: 45,
      interviewer: "Ramesh Chandra Das (Programme Director)",
      mode: "Google Meet",
      meetLink: "https://meet.google.com/pan-lvh-kzp",
      status: "Completed",
      rating: 5,
      feedback: "Exceptional clarity on grassroots mobilization and SHG federation finance. Recommend releasing offer for Senior Coordinator role.",
      recommendation: "Select for Offer"
    },
    {
      id: "INT-2026-02",
      candidateId: "APP-2026-103",
      jobId: "JOB-2026-01",
      round: "Technical Assessment",
      scheduledAt: "2026-10-12T14:30",
      durationMinutes: 45,
      interviewer: "Dr. Minati Biswal (Lead Agronomist)",
      mode: "Google Meet",
      meetLink: "https://meet.google.com/agr-tch-wxy",
      status: "Scheduled"
    },
    {
      id: "INT-2026-03",
      candidateId: "APP-2026-105",
      jobId: "JOB-2026-03",
      round: "Initial Screening",
      scheduledAt: "2026-10-14T10:00",
      durationMinutes: 30,
      interviewer: "Sunita Roy (HR Manager)",
      mode: "Phone Screen",
      status: "Scheduled"
    },
    {
      id: "INT-2026-04",
      candidateId: "APP-2026-104",
      jobId: "JOB-2026-02",
      round: "Thematic Panel",
      scheduledAt: "2026-10-01T15:00",
      durationMinutes: 60,
      interviewer: "Aditya Sahu (Lead Trainer)",
      mode: "In-Person (HQ)",
      status: "Completed",
      rating: 5,
      feedback: "Practical demonstration was flawless. Handled all safety equipment protocols with high confidence.",
      recommendation: "Select for Offer"
    }
  ];

  const offerLetters: OfferLetter[] = [
    {
      id: "OFR-2026-01",
      candidateId: "APP-2026-102",
      jobId: "JOB-2026-02",
      candidateName: "Subhashis Nayak",
      candidateEmail: "subhashis.nayak@example.com",
      candidatePhone: "+91 97760 88120",
      designationTitle: "Vocational Trainer (Electrical & Solar)",
      areaId: "skill-development",
      joiningDate: "2026-11-15",
      annualSalary: 450000,
      monthlySalary: 37500,
      basicHra: 26250,
      allowance: 11250,
      expiryDate: "2026-10-25",
      status: "Released",
      releasedAt: "2026-10-06T15:30:00+05:30",
      releasedBy: "Sunita Roy (HR Manager)",
      termsNotes: "Probationary period: 6 months. Workstation: Angul Skill Training Centre."
    },
    {
      id: "OFR-2026-02",
      candidateId: "APP-2026-104",
      jobId: "JOB-2026-02",
      candidateName: "Rajendra Prasad Jena",
      candidateEmail: "rajendra.jena@example.com",
      candidatePhone: "+91 98610 33491",
      designationTitle: "Lead Vocational Trainer",
      areaId: "skill-development",
      joiningDate: "2026-11-01",
      annualSalary: 480000,
      monthlySalary: 40000,
      basicHra: 28000,
      allowance: 12000,
      expiryDate: "2026-10-15",
      status: "Accepted",
      releasedAt: "2026-10-02T10:00:00+05:30",
      releasedBy: "Sunita Roy (HR Manager)",
      termsNotes: "Formal acceptance received on 2026-10-07. Awaiting onboarding into ERP."
    }
  ];

  return {
    employees,
    designations,
    assignments,
    attendance,
    assessments: [],
    appraisals: [],
    leaveDecisions: {},
    jobPostings,
    candidates,
    interviews,
    offerLetters
  };
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
  if (!Number.isFinite(employee.annualSalary) || employee.annualSalary! <= 0 || employee.annualSalary! > 100_000_000) throw new Error("Enter a valid annual salary.");
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
  const employee = state.employees.find(e => e.id === appraisal.employeeId);
  if (!employee?.annualSalary) throw new Error("Record the employee’s current salary in Onboarding before finalising the appraisal.");
  const increment = appraisal.incrementPercent;
  if (increment === undefined || !Number.isFinite(increment) || increment < 0 || increment > MAX_INCREMENT_PERCENT) throw new Error(`Enter an increment between 0% and ${MAX_INCREMENT_PERCENT}%.`);
  const previousAnnualSalary = employee.annualSalary;
  const revisedAnnualSalary = revisedSalary(previousAnnualSalary, increment);
  return {
    ...state,
    employees: state.employees.map(e => e.id === employee.id ? { ...e, annualSalary: revisedAnnualSalary } : e),
    appraisals: [...state.appraisals, { ...appraisal, incrementPercent: increment, previousAnnualSalary, revisedAnnualSalary }],
  };
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

export function saveJobPosting(state: HRState, posting: JobPosting): HRState {
  if (!posting.title.trim()) throw new Error("Job title is required.");
  if (!posting.areaId) throw new Error("Thematic area is required.");
  if (!posting.location.trim()) throw new Error("Job location is required.");
  if (posting.openings < 1) throw new Error("At least 1 vacancy opening is required.");
  if (posting.minSalary <= 0 || posting.maxSalary < posting.minSalary) throw new Error("Valid salary range (Annual CTC) is required.");
  if (!isDate(posting.closingDate)) throw new Error("A valid closing date is required.");
  const existing = state.jobPostings.find(j => j.id === posting.id);
  return {
    ...state,
    jobPostings: existing
      ? state.jobPostings.map(j => j.id === posting.id ? posting : j)
      : [posting, ...state.jobPostings]
  };
}

export function deleteJobPosting(state: HRState, id: string): HRState {
  if (state.candidates.some(c => c.jobId === id && c.stage !== "Rejected")) {
    throw new Error("Cannot delete a job posting with active candidates. Mark the posting as Closed instead.");
  }
  return { ...state, jobPostings: state.jobPostings.filter(j => j.id !== id) };
}

export function saveCandidate(state: HRState, candidate: Candidate): HRState {
  if (!candidate.name.trim()) throw new Error("Candidate name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email)) throw new Error("Valid candidate email is required.");
  if (candidate.phone.replace(/\D/g, "").length < 10) throw new Error("Valid 10-digit phone number is required.");
  if (!state.jobPostings.some(j => j.id === candidate.jobId)) throw new Error("Select an existing job posting.");
  if (candidate.expectedSalary <= 0) throw new Error("Expected salary must be greater than zero.");
  const existing = state.candidates.find(c => c.id === candidate.id);
  return {
    ...state,
    candidates: existing
      ? state.candidates.map(c => c.id === candidate.id ? candidate : c)
      : [candidate, ...state.candidates]
  };
}

export function updateCandidateStage(state: HRState, candidateId: string, stage: CandidateStage, note?: string): HRState {
  const candidate = state.candidates.find(c => c.id === candidateId);
  if (!candidate) throw new Error("Candidate not found.");
  return {
    ...state,
    candidates: state.candidates.map(c => c.id === candidateId ? {
      ...c,
      stage,
      notes: note ? (c.notes ? `${c.notes}\n[${new Date().toISOString().slice(0, 10)}] ${note}` : note) : c.notes
    } : c)
  };
}

export function scheduleInterview(state: HRState, interview: Interview): HRState {
  if (!state.candidates.some(c => c.id === interview.candidateId)) throw new Error("Select a valid candidate.");
  if (!state.jobPostings.some(j => j.id === interview.jobId)) throw new Error("Select a valid job posting.");
  if (!interview.interviewer.trim()) throw new Error("Interviewer / Panel name is required.");
  if (!interview.scheduledAt) throw new Error("Interview date and time are required.");
  const existing = state.interviews.find(i => i.id === interview.id);
  const updatedInterviews = existing
    ? state.interviews.map(i => i.id === interview.id ? interview : i)
    : [interview, ...state.interviews];
  // Auto update candidate stage to "Interview Scheduled" if in Applied/Screening
  const candidate = state.candidates.find(c => c.id === interview.candidateId);
  const nextCandidates = (candidate && (candidate.stage === "Applied" || candidate.stage === "Screening"))
    ? state.candidates.map(c => c.id === interview.candidateId ? { ...c, stage: "Interview Scheduled" as CandidateStage } : c)
    : state.candidates;
  return { ...state, interviews: updatedInterviews, candidates: nextCandidates };
}

export function submitInterviewFeedback(
  state: HRState,
  interviewId: string,
  feedback: string,
  rating: number,
  recommendation: NonNullable<Interview["recommendation"]>
): HRState {
  const interview = state.interviews.find(i => i.id === interviewId);
  if (!interview) throw new Error("Interview not found.");
  if (!feedback.trim()) throw new Error("Detailed evaluation feedback is required.");
  if (rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
  
  let nextStage: CandidateStage | undefined;
  if (recommendation === "Select for Offer") nextStage = "Selected";
  else if (recommendation === "Reject") nextStage = "Rejected";
  else if (recommendation === "Advance to Next Round") nextStage = "Technical Round";

  const updatedInterviews = state.interviews.map(i => i.id === interviewId ? {
    ...i,
    status: "Completed" as const,
    feedback: feedback.trim(),
    rating,
    recommendation
  } : i);

  const updatedCandidates = nextStage
    ? state.candidates.map(c => c.id === interview.candidateId ? { ...c, stage: nextStage!, rating } : c)
    : state.candidates;

  return { ...state, interviews: updatedInterviews, candidates: updatedCandidates };
}

export function releaseOfferLetter(state: HRState, offer: OfferLetter): HRState {
  const candidate = state.candidates.find(c => c.id === offer.candidateId);
  if (!candidate) throw new Error("Candidate not found.");
  if (offer.annualSalary <= 0) throw new Error("Valid annual salary (CTC) is required.");
  if (!offer.designationTitle.trim()) throw new Error("Designation title is required.");
  if (!isDate(offer.joiningDate)) throw new Error("Valid joining date is required.");
  if (!isDate(offer.expiryDate)) throw new Error("Valid offer expiry date is required.");

  const existing = state.offerLetters.find(o => o.id === offer.id);
  const updatedOffers = existing
    ? state.offerLetters.map(o => o.id === offer.id ? offer : o)
    : [offer, ...state.offerLetters];

  // Advance candidate stage
  const updatedCandidates = state.candidates.map(c => c.id === offer.candidateId ? {
    ...c,
    stage: (offer.status === "Accepted" ? "Offer Accepted" : offer.status === "Released" ? "Offer Released" : c.stage) as CandidateStage
  } : c);

  return { ...state, offerLetters: updatedOffers, candidates: updatedCandidates };
}

export function updateOfferStatus(state: HRState, offerId: string, status: OfferStatus): HRState {
  const offer = state.offerLetters.find(o => o.id === offerId);
  if (!offer) throw new Error("Offer letter not found.");
  const updatedOffers = state.offerLetters.map(o => o.id === offerId ? { ...o, status } : o);
  const nextCandidateStage: CandidateStage =
    status === "Accepted" ? "Offer Accepted"
    : status === "Declined" ? "Rejected"
    : status === "Onboarded" ? "Onboarded"
    : "Offer Released";
  const updatedCandidates = state.candidates.map(c => c.id === offer.candidateId ? { ...c, stage: nextCandidateStage } : c);
  return { ...state, offerLetters: updatedOffers, candidates: updatedCandidates };
}

export function onboardCandidateFromOffer(state: HRState, offerId: string): HRState {
  const offer = state.offerLetters.find(o => o.id === offerId);
  if (!offer) throw new Error("Offer letter not found.");
  if (offer.status !== "Accepted" && offer.status !== "Released") {
    throw new Error("Only accepted or released offers can be onboarded into ERP.");
  }
  const candidate = state.candidates.find(c => c.id === offer.candidateId);
  if (!candidate) throw new Error("Associated candidate not found.");

  if (state.employees.some(e => e.email.toLowerCase() === candidate.email.toLowerCase())) {
    throw new Error(`An employee with email ${candidate.email} is already registered in Onboarding.`);
  }

  let designation = state.designations.find(d => d.areaId === offer.areaId && d.title.toLowerCase() === offer.designationTitle.toLowerCase());
  const updatedDesignations = [...state.designations];
  if (!designation) {
    designation = {
      id: `${offer.areaId}:role:${crypto.randomUUID().slice(0, 6)}`,
      areaId: offer.areaId,
      title: offer.designationTitle,
      level: "Individual contributor",
      description: `Role created during recruitment of ${candidate.name}.`
    };
    updatedDesignations.push(designation);
  }

  const newEmployeeId = `EMP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const newEmployee: Employee = {
    id: newEmployeeId,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    areaId: offer.areaId,
    designationId: designation.id,
    joiningDate: offer.joiningDate,
    status: "Onboarding",
    annualSalary: offer.annualSalary
  };

  const updatedOffers = state.offerLetters.map(o => o.id === offerId ? { ...o, status: "Onboarded" as OfferStatus } : o);
  const updatedCandidates = state.candidates.map(c => c.id === candidate.id ? { ...c, stage: "Onboarded" as CandidateStage } : c);

  return {
    ...state,
    employees: [newEmployee, ...state.employees],
    designations: updatedDesignations,
    offerLetters: updatedOffers,
    candidates: updatedCandidates
  };
}
