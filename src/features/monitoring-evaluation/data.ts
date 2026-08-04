export interface ThematicAreaMetric {
  name: string;
  shortName: string;
  projects: number;
  reach: string;
  progress: number;
  budget: string;
  color: string;
  kpis: Array<{ label: string; value: string; note: string }>;
  indicators: Array<{ label: string; value: number }>;
}

export interface MonitoringProject {
  id: string;
  name: string;
  area: string;
  location: string;
  manager: string;
  status: "On track" | "At risk" | "Completed";
  progress: number;
  budget: string;
  spent: string;
  period: string;
  beneficiaries: string;
  outcome: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  cadence: string;
  lastGenerated: string;
  pages: number;
}

export interface EmployeeStatus {
  id: string;
  name: string;
  role: string;
  initials: string;
  unit: string;
  planned: number;
  completed: number;
  fieldDays: number;
  status: "Submitted" | "In review" | "Pending";
}

export const thematicAreas: ThematicAreaMetric[] = [
  {
    name: "Skill Development", shortName: "Skill", projects: 8, reach: "12.4K", progress: 78, budget: "₹2.8 Cr", color: "#dc2626",
    kpis: [
      { label: "Learners enrolled", value: "12,420", note: "54% women · deduplicated MIS" },
      { label: "Training completion rate", value: "86%", note: "10,681 learners completed" },
      { label: "Certification success rate", value: "78%", note: "Of candidates assessed" },
      { label: "Placement rate", value: "68%", note: "Wage or self-employment verified in 90 days" },
    ],
    indicators: [
      { label: "Learners with ≥80% attendance", value: 88 },
      { label: "Course completion rate", value: 86 },
      { label: "Certification success rate", value: 78 },
      { label: "90-day employment retention rate", value: 64 },
    ],
  },
  {
    name: "Livelihood", shortName: "Livelihood", projects: 6, reach: "8.7K", progress: 64, budget: "₹2.1 Cr", color: "#ef4444",
    kpis: [
      { label: "Households supported", value: "8,740", note: "Across 112 villages" },
      { label: "Average income increase", value: "24%", note: "Compared with baseline" },
      { label: "Producer groups active", value: "146", note: "82% meeting monthly" },
      { label: "Market linkages created", value: "38", note: "Buyer agreements verified" },
    ],
    indicators: [
      { label: "Households adopting promoted practices", value: 72 },
      { label: "Income records showing improvement", value: 64 },
      { label: "Producer groups financially active", value: 82 },
      { label: "Market linkage targets achieved", value: 61 },
    ],
  },
  {
    name: "Entrepreneurship", shortName: "Enterprise", projects: 5, reach: "3.2K", progress: 71, budget: "₹1.6 Cr", color: "#f97316",
    kpis: [
      { label: "Entrepreneurs incubated", value: "3,180", note: "61% women-led ventures" },
      { label: "Enterprises launched", value: "1,264", note: "Business registration verified" },
      { label: "12-month survival rate", value: "76%", note: "Active trading confirmed" },
      { label: "Local jobs created", value: "2,840", note: "Direct full-time equivalents" },
    ],
    indicators: [
      { label: "Business plans completed", value: 84 },
      { label: "Enterprises accessing finance", value: 58 },
      { label: "Enterprises active after 12 months", value: 76 },
      { label: "Women-led enterprises operational", value: 71 },
    ],
  },
  {
    name: "Nutrition", shortName: "Nutrition", projects: 7, reach: "18.1K", progress: 83, budget: "₹2.4 Cr", color: "#eab308",
    kpis: [
      { label: "Children screened", value: "18,140", note: "6–59 month age group" },
      { label: "SAM/MAM cases identified", value: "2,186", note: "100% referred for follow-up" },
      { label: "Nutrition recovery rate", value: "81%", note: "Based on verified follow-ups" },
      { label: "Caregivers counselled", value: "14,620", note: "IYCF and dietary diversity" },
    ],
    indicators: [
      { label: "Eligible children screened", value: 92 },
      { label: "Identified cases receiving follow-up", value: 88 },
      { label: "Children reaching recovery criteria", value: 81 },
      { label: "Households meeting diet diversity", value: 67 },
    ],
  },
  {
    name: "Health", shortName: "Health", projects: 9, reach: "24.8K", progress: 69, budget: "₹3.2 Cr", color: "#e11d48",
    kpis: [
      { label: "People screened", value: "24,820", note: "NCD and primary health screening" },
      { label: "Clinical consultations", value: "18,460", note: "Mobile and community clinics" },
      { label: "Referral completion", value: "74%", note: "Facility visits confirmed" },
      { label: "Health camps conducted", value: "286", note: "94% against annual plan" },
    ],
    indicators: [
      { label: "Planned outreach sessions delivered", value: 94 },
      { label: "High-risk cases followed up", value: 79 },
      { label: "Referred patients reaching facilities", value: 74 },
      { label: "Patient records complete", value: 86 },
    ],
  },
  {
    name: "Sanitation", shortName: "Sanitation", projects: 4, reach: "9.6K", progress: 58, budget: "₹1.3 Cr", color: "#fb7185",
    kpis: [
      { label: "Households with WASH access", value: "9,580", note: "Access physically verified" },
      { label: "Water points functional", value: "91%", note: "Tested during field visits" },
      { label: "ODF villages sustained", value: "68", note: "Verified through spot checks" },
      { label: "WASH sessions delivered", value: "412", note: "Schools and communities" },
    ],
    indicators: [
      { label: "Constructed facilities functional", value: 91 },
      { label: "Households practicing safe water storage", value: 73 },
      { label: "ODF verification sustained", value: 68 },
      { label: "Schools with active WASH committees", value: 76 },
    ],
  },
  {
    name: "Climate Change", shortName: "Climate", projects: 5, reach: "6.4K", progress: 75, budget: "₹1.9 Cr", color: "#16a34a",
    kpis: [
      { label: "Climate-resilient households", value: "6,420", note: "Practices verified on site" },
      { label: "Land restored", value: "2,860 ha", note: "GIS and field-verified area" },
      { label: "Sapling survival rate", value: "82%", note: "After two seasonal checks" },
      { label: "Water structures revived", value: "126", note: "Community assets functional" },
    ],
    indicators: [
      { label: "Households adopting resilient practices", value: 75 },
      { label: "Restoration target achieved", value: 72 },
      { label: "Plantation survival after 12 months", value: 82 },
      { label: "Community adaptation plans active", value: 69 },
    ],
  },
];

export const projects: MonitoringProject[] = [
  { id: "PNT-2401", name: "PMKVY 4.0 Odisha Skills", area: "Skill Development", location: "Odisha · 4 districts", manager: "Rakesh Swain", status: "On track", progress: 78, budget: "₹84.0 L", spent: "₹61.2 L", period: "01 Apr 2025 – 31 Dec 2026", beneficiaries: "1,248", outcome: "892 candidates certified across 18 vocational batches, with 612 verified placements." },
  { id: "PNT-2404", name: "Samriddhi Livelihoods Programme", area: "Livelihood", location: "Odisha · 5 districts", manager: "Neha Sahu", status: "On track", progress: 64, budget: "₹96.0 L", spent: "₹58.4 L", period: "May 2025 – Apr 2027", beneficiaries: "5,240", outcome: "3,860 households adopted improved farm and non-farm livelihood practices." },
  { id: "PNT-2407", name: "Saksham Women Enterprise", area: "Entrepreneurship", location: "Jharkhand · 3 districts", manager: "Rohan Kumar", status: "On track", progress: 71, budget: "₹62.5 L", spent: "₹41.8 L", period: "Jul 2025 – Jun 2027", beneficiaries: "1,280", outcome: "426 micro-enterprises have reached market-readiness." },
  { id: "PNT-2318", name: "Poshan Community Network", area: "Nutrition", location: "West Bengal · 6 districts", manager: "Meera Roy", status: "At risk", progress: 54, budget: "₹1.12 Cr", spent: "₹72.4 L", period: "Jan 2024 – Dec 2026", beneficiaries: "12,640", outcome: "8,900 households screened; follow-up coverage needs attention." },
  { id: "PNT-2322", name: "Swasthya Mobile Clinics", area: "Health", location: "Assam · 5 districts", manager: "Amit Singh", status: "On track", progress: 69, budget: "₹1.48 Cr", spent: "₹96.7 L", period: "Oct 2024 – Sep 2027", beneficiaries: "18,320", outcome: "26 mobile health camps operating on a monthly cycle." },
  { id: "PNT-2209", name: "Jal Suraksha Mission", area: "Sanitation", location: "Bihar · 4 districts", manager: "Kavita Jain", status: "Completed", progress: 100, budget: "₹78.0 L", spent: "₹76.1 L", period: "Apr 2023 – Mar 2026", beneficiaries: "9,580", outcome: "132 water points commissioned and handed to village committees." },
  { id: "PNT-2412", name: "Green Village Resilience", area: "Climate Change", location: "Chhattisgarh · 2 districts", manager: "Imran Ali", status: "On track", progress: 75, budget: "₹91.0 L", spent: "₹63.5 L", period: "Jun 2025 – May 2027", beneficiaries: "6,420", outcome: "1,860 households adopted climate-resilient farm practices." },
];

export const reportTemplates: ReportTemplate[] = [
  { id: "mpr", name: "MPR", description: "Monthly progress, output delivery, variance and financial utilization.", cadence: "Monthly", lastGenerated: "28 Jul 2026", pages: 18 },
  { id: "qpr", name: "QPR", description: "Quarterly outcomes, indicator trends, risks and management response.", cadence: "Quarterly", lastGenerated: "05 Jul 2026", pages: 34 },
  { id: "commencement", name: "Commencement Report", description: "Project inception context, baseline, approach and implementation plan.", cadence: "At project start", lastGenerated: "12 Jun 2026", pages: 42 },
  { id: "coffee-table", name: "Coffee Table Book", description: "Editorial impact stories, milestones and beneficiary narratives.", cadence: "Annual", lastGenerated: "18 Mar 2026", pages: 56 },
  { id: "photobook", name: "Photobook", description: "Curated field documentation with captions, locations and consent records.", cadence: "As required", lastGenerated: "02 May 2026", pages: 48 },
];

export const employeeStatuses: EmployeeStatus[] = [
  { id: "EMP-018", name: "Ananya Das", role: "Program Manager", initials: "AD", unit: "Skill Development", planned: 18, completed: 17, fieldDays: 8, status: "Submitted" },
  { id: "EMP-032", name: "Rohan Kumar", role: "Project Lead", initials: "RK", unit: "Entrepreneurship", planned: 16, completed: 14, fieldDays: 11, status: "In review" },
  { id: "EMP-041", name: "Meera Roy", role: "M&E Specialist", initials: "MR", unit: "Nutrition", planned: 20, completed: 18, fieldDays: 6, status: "Submitted" },
  { id: "EMP-057", name: "Amit Singh", role: "Field Coordinator", initials: "AS", unit: "Health", planned: 22, completed: 19, fieldDays: 15, status: "Submitted" },
  { id: "EMP-064", name: "Kavita Jain", role: "Program Officer", initials: "KJ", unit: "Sanitation", planned: 14, completed: 9, fieldDays: 10, status: "Pending" },
  { id: "EMP-071", name: "Imran Ali", role: "Climate Lead", initials: "IA", unit: "Climate Change", planned: 17, completed: 15, fieldDays: 12, status: "In review" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Employee Study Report — types & data
   ───────────────────────────────────────────────────────────────────────────── */

export type StudyRating = "Excellent" | "Good" | "Needs Improvement" | "Critical";

export interface EmployeeStudyRecord {
  id: string;
  name: string;
  initials: string;
  role: string;
  thematicArea: string;
  kpisCompleted: number;
  kpisTarget: number;
  activitiesCompleted: number;
  activitiesPlanned: number;
  fieldDays: number;
  trainingHours: number;
  evidenceScore: number;
  overallRating: StudyRating;
}

export interface EmployeeStudyPeriodData {
  period: string;
  employees: EmployeeStudyRecord[];
}

export const studyReportPeriods = [
  "July 2026",
  "June 2026",
  "May 2026",
  "April 2026",
  "March 2026",
  "February 2026",
  "January 2026",
  "December 2025",
];

export const employeeStudyData: Record<string, EmployeeStudyPeriodData[]> = {
  "Skill Development": [
    { period: "July 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 14, kpisTarget: 16, activitiesCompleted: 17, activitiesPlanned: 18, fieldDays: 8, trainingHours: 12, evidenceScore: 92, overallRating: "Excellent" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 11, kpisTarget: 14, activitiesCompleted: 13, activitiesPlanned: 15, fieldDays: 10, trainingHours: 18, evidenceScore: 85, overallRating: "Good" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 9, kpisTarget: 12, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 6, trainingHours: 8, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 12, kpisTarget: 15, activitiesCompleted: 14, activitiesPlanned: 16, fieldDays: 7, trainingHours: 14, evidenceScore: 88, overallRating: "Good" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 13, kpisTarget: 16, activitiesCompleted: 16, activitiesPlanned: 18, fieldDays: 7, trainingHours: 10, evidenceScore: 89, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 10, kpisTarget: 14, activitiesCompleted: 12, activitiesPlanned: 15, fieldDays: 9, trainingHours: 16, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 7, kpisTarget: 12, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 5, trainingHours: 6, evidenceScore: 65, overallRating: "Needs Improvement" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 11, kpisTarget: 15, activitiesCompleted: 13, activitiesPlanned: 16, fieldDays: 6, trainingHours: 12, evidenceScore: 84, overallRating: "Good" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 12, kpisTarget: 16, activitiesCompleted: 15, activitiesPlanned: 18, fieldDays: 9, trainingHours: 11, evidenceScore: 86, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 9, kpisTarget: 14, activitiesCompleted: 11, activitiesPlanned: 15, fieldDays: 8, trainingHours: 14, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 6, kpisTarget: 12, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 4, trainingHours: 4, evidenceScore: 58, overallRating: "Needs Improvement" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 10, kpisTarget: 15, activitiesCompleted: 12, activitiesPlanned: 16, fieldDays: 5, trainingHours: 10, evidenceScore: 80, overallRating: "Good" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 11, kpisTarget: 16, activitiesCompleted: 14, activitiesPlanned: 18, fieldDays: 8, trainingHours: 9, evidenceScore: 83, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 8, kpisTarget: 14, activitiesCompleted: 10, activitiesPlanned: 15, fieldDays: 7, trainingHours: 12, evidenceScore: 75, overallRating: "Good" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 5, kpisTarget: 12, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 3, trainingHours: 3, evidenceScore: 52, overallRating: "Critical" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 9, kpisTarget: 15, activitiesCompleted: 11, activitiesPlanned: 16, fieldDays: 6, trainingHours: 8, evidenceScore: 76, overallRating: "Good" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 10, kpisTarget: 16, activitiesCompleted: 13, activitiesPlanned: 18, fieldDays: 7, trainingHours: 8, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 7, kpisTarget: 14, activitiesCompleted: 9, activitiesPlanned: 15, fieldDays: 6, trainingHours: 10, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 5, kpisTarget: 12, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 4, trainingHours: 4, evidenceScore: 55, overallRating: "Needs Improvement" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 8, kpisTarget: 15, activitiesCompleted: 10, activitiesPlanned: 16, fieldDays: 5, trainingHours: 7, evidenceScore: 74, overallRating: "Good" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 9, kpisTarget: 16, activitiesCompleted: 12, activitiesPlanned: 18, fieldDays: 6, trainingHours: 7, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 8, activitiesPlanned: 15, fieldDays: 5, trainingHours: 9, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 4, kpisTarget: 12, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 3, trainingHours: 2, evidenceScore: 48, overallRating: "Critical" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 7, kpisTarget: 15, activitiesCompleted: 9, activitiesPlanned: 16, fieldDays: 4, trainingHours: 6, evidenceScore: 70, overallRating: "Good" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 8, kpisTarget: 16, activitiesCompleted: 11, activitiesPlanned: 18, fieldDays: 5, trainingHours: 6, evidenceScore: 75, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 7, activitiesPlanned: 15, fieldDays: 4, trainingHours: 8, evidenceScore: 64, overallRating: "Needs Improvement" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 4, kpisTarget: 12, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 3, trainingHours: 2, evidenceScore: 46, overallRating: "Critical" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 7, kpisTarget: 15, activitiesCompleted: 8, activitiesPlanned: 16, fieldDays: 4, trainingHours: 5, evidenceScore: 68, overallRating: "Needs Improvement" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-018", name: "Ananya Das", initials: "AD", role: "Program Manager", thematicArea: "Skill Development", kpisCompleted: 7, kpisTarget: 16, activitiesCompleted: 10, activitiesPlanned: 18, fieldDays: 4, trainingHours: 5, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-022", name: "Priya Mohanty", initials: "PM", role: "Training Coordinator", thematicArea: "Skill Development", kpisCompleted: 5, kpisTarget: 14, activitiesCompleted: 6, activitiesPlanned: 15, fieldDays: 4, trainingHours: 7, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-029", name: "Sanjay Patel", initials: "SP", role: "Placement Officer", thematicArea: "Skill Development", kpisCompleted: 3, kpisTarget: 12, activitiesCompleted: 4, activitiesPlanned: 14, fieldDays: 2, trainingHours: 2, evidenceScore: 44, overallRating: "Critical" },
      { id: "EMP-035", name: "Deepa Nair", initials: "DN", role: "Assessment Lead", thematicArea: "Skill Development", kpisCompleted: 6, kpisTarget: 15, activitiesCompleted: 7, activitiesPlanned: 16, fieldDays: 3, trainingHours: 4, evidenceScore: 65, overallRating: "Needs Improvement" },
    ]},
  ],
  "Livelihood": [
    { period: "July 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 12, kpisTarget: 15, activitiesCompleted: 14, activitiesPlanned: 16, fieldDays: 12, trainingHours: 8, evidenceScore: 88, overallRating: "Good" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 10, kpisTarget: 13, activitiesCompleted: 11, activitiesPlanned: 14, fieldDays: 14, trainingHours: 6, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 13, kpisTarget: 14, activitiesCompleted: 13, activitiesPlanned: 14, fieldDays: 10, trainingHours: 10, evidenceScore: 94, overallRating: "Excellent" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 11, kpisTarget: 15, activitiesCompleted: 13, activitiesPlanned: 16, fieldDays: 11, trainingHours: 7, evidenceScore: 84, overallRating: "Good" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 9, kpisTarget: 13, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 12, trainingHours: 5, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 12, kpisTarget: 14, activitiesCompleted: 12, activitiesPlanned: 14, fieldDays: 9, trainingHours: 9, evidenceScore: 91, overallRating: "Excellent" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 10, kpisTarget: 15, activitiesCompleted: 12, activitiesPlanned: 16, fieldDays: 10, trainingHours: 6, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 8, kpisTarget: 13, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 11, trainingHours: 4, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 11, kpisTarget: 14, activitiesCompleted: 11, activitiesPlanned: 14, fieldDays: 8, trainingHours: 8, evidenceScore: 87, overallRating: "Good" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 9, kpisTarget: 15, activitiesCompleted: 11, activitiesPlanned: 16, fieldDays: 9, trainingHours: 5, evidenceScore: 76, overallRating: "Good" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 7, kpisTarget: 13, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 10, trainingHours: 3, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 10, kpisTarget: 14, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 7, trainingHours: 7, evidenceScore: 84, overallRating: "Good" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 8, kpisTarget: 15, activitiesCompleted: 10, activitiesPlanned: 16, fieldDays: 8, trainingHours: 4, evidenceScore: 73, overallRating: "Good" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 6, kpisTarget: 13, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 9, trainingHours: 3, evidenceScore: 64, overallRating: "Needs Improvement" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 9, kpisTarget: 14, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 6, trainingHours: 6, evidenceScore: 80, overallRating: "Good" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 7, kpisTarget: 15, activitiesCompleted: 9, activitiesPlanned: 16, fieldDays: 7, trainingHours: 4, evidenceScore: 70, overallRating: "Good" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 5, kpisTarget: 13, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 8, trainingHours: 2, evidenceScore: 58, overallRating: "Needs Improvement" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 8, kpisTarget: 14, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 5, trainingHours: 5, evidenceScore: 76, overallRating: "Good" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 6, kpisTarget: 15, activitiesCompleted: 8, activitiesPlanned: 16, fieldDays: 6, trainingHours: 3, evidenceScore: 66, overallRating: "Needs Improvement" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 4, kpisTarget: 13, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 7, trainingHours: 2, evidenceScore: 54, overallRating: "Needs Improvement" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 7, kpisTarget: 14, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 5, trainingHours: 4, evidenceScore: 72, overallRating: "Good" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-044", name: "Neha Sahu", initials: "NS", role: "Program Manager", thematicArea: "Livelihood", kpisCompleted: 5, kpisTarget: 15, activitiesCompleted: 7, activitiesPlanned: 16, fieldDays: 5, trainingHours: 2, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-048", name: "Rajesh Behera", initials: "RB", role: "Livelihood Officer", thematicArea: "Livelihood", kpisCompleted: 4, kpisTarget: 13, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 6, trainingHours: 2, evidenceScore: 50, overallRating: "Critical" },
      { id: "EMP-053", name: "Sunita Devi", initials: "SD", role: "SHG Coordinator", thematicArea: "Livelihood", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 4, trainingHours: 3, evidenceScore: 68, overallRating: "Needs Improvement" },
    ]},
  ],
  "Entrepreneurship": [
    { period: "July 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 13, kpisTarget: 16, activitiesCompleted: 14, activitiesPlanned: 16, fieldDays: 11, trainingHours: 14, evidenceScore: 90, overallRating: "Excellent" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 10, kpisTarget: 13, activitiesCompleted: 11, activitiesPlanned: 13, fieldDays: 8, trainingHours: 16, evidenceScore: 86, overallRating: "Good" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 8, kpisTarget: 11, activitiesCompleted: 9, activitiesPlanned: 12, fieldDays: 13, trainingHours: 6, evidenceScore: 76, overallRating: "Good" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 12, kpisTarget: 16, activitiesCompleted: 13, activitiesPlanned: 16, fieldDays: 10, trainingHours: 12, evidenceScore: 86, overallRating: "Good" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 9, kpisTarget: 13, activitiesCompleted: 10, activitiesPlanned: 13, fieldDays: 7, trainingHours: 14, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 7, kpisTarget: 11, activitiesCompleted: 8, activitiesPlanned: 12, fieldDays: 11, trainingHours: 5, evidenceScore: 70, overallRating: "Good" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 11, kpisTarget: 16, activitiesCompleted: 12, activitiesPlanned: 16, fieldDays: 9, trainingHours: 10, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 8, kpisTarget: 13, activitiesCompleted: 9, activitiesPlanned: 13, fieldDays: 6, trainingHours: 12, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 6, kpisTarget: 11, activitiesCompleted: 7, activitiesPlanned: 12, fieldDays: 10, trainingHours: 4, evidenceScore: 64, overallRating: "Needs Improvement" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 10, kpisTarget: 16, activitiesCompleted: 11, activitiesPlanned: 16, fieldDays: 8, trainingHours: 8, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 7, kpisTarget: 13, activitiesCompleted: 8, activitiesPlanned: 13, fieldDays: 5, trainingHours: 10, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 5, kpisTarget: 11, activitiesCompleted: 6, activitiesPlanned: 12, fieldDays: 9, trainingHours: 3, evidenceScore: 58, overallRating: "Needs Improvement" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 9, kpisTarget: 16, activitiesCompleted: 10, activitiesPlanned: 16, fieldDays: 7, trainingHours: 7, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 6, kpisTarget: 13, activitiesCompleted: 7, activitiesPlanned: 13, fieldDays: 5, trainingHours: 8, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 4, kpisTarget: 11, activitiesCompleted: 5, activitiesPlanned: 12, fieldDays: 8, trainingHours: 2, evidenceScore: 52, overallRating: "Needs Improvement" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 8, kpisTarget: 16, activitiesCompleted: 9, activitiesPlanned: 16, fieldDays: 6, trainingHours: 6, evidenceScore: 70, overallRating: "Good" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 5, kpisTarget: 13, activitiesCompleted: 6, activitiesPlanned: 13, fieldDays: 4, trainingHours: 6, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 3, kpisTarget: 11, activitiesCompleted: 4, activitiesPlanned: 12, fieldDays: 7, trainingHours: 2, evidenceScore: 48, overallRating: "Critical" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 7, kpisTarget: 16, activitiesCompleted: 8, activitiesPlanned: 16, fieldDays: 5, trainingHours: 5, evidenceScore: 66, overallRating: "Needs Improvement" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 4, kpisTarget: 13, activitiesCompleted: 5, activitiesPlanned: 13, fieldDays: 3, trainingHours: 5, evidenceScore: 56, overallRating: "Needs Improvement" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 3, kpisTarget: 11, activitiesCompleted: 3, activitiesPlanned: 12, fieldDays: 6, trainingHours: 1, evidenceScore: 44, overallRating: "Critical" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-032", name: "Rohan Kumar", initials: "RK", role: "Project Lead", thematicArea: "Entrepreneurship", kpisCompleted: 6, kpisTarget: 16, activitiesCompleted: 7, activitiesPlanned: 16, fieldDays: 4, trainingHours: 4, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-036", name: "Pallavi Jena", initials: "PJ", role: "Enterprise Mentor", thematicArea: "Entrepreneurship", kpisCompleted: 4, kpisTarget: 13, activitiesCompleted: 4, activitiesPlanned: 13, fieldDays: 3, trainingHours: 4, evidenceScore: 52, overallRating: "Needs Improvement" },
      { id: "EMP-039", name: "Vikram Reddy", initials: "VR", role: "Market Linkage Officer", thematicArea: "Entrepreneurship", kpisCompleted: 2, kpisTarget: 11, activitiesCompleted: 3, activitiesPlanned: 12, fieldDays: 5, trainingHours: 1, evidenceScore: 40, overallRating: "Critical" },
    ]},
  ],
  "Nutrition": [
    { period: "July 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 16, kpisTarget: 18, activitiesCompleted: 18, activitiesPlanned: 20, fieldDays: 6, trainingHours: 10, evidenceScore: 95, overallRating: "Excellent" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 12, kpisTarget: 15, activitiesCompleted: 13, activitiesPlanned: 16, fieldDays: 9, trainingHours: 12, evidenceScore: 84, overallRating: "Good" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 10, kpisTarget: 14, activitiesCompleted: 11, activitiesPlanned: 14, fieldDays: 14, trainingHours: 6, evidenceScore: 78, overallRating: "Good" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 15, kpisTarget: 18, activitiesCompleted: 17, activitiesPlanned: 20, fieldDays: 5, trainingHours: 9, evidenceScore: 92, overallRating: "Excellent" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 11, kpisTarget: 15, activitiesCompleted: 12, activitiesPlanned: 16, fieldDays: 8, trainingHours: 10, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 9, kpisTarget: 14, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 12, trainingHours: 5, evidenceScore: 74, overallRating: "Good" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 14, kpisTarget: 18, activitiesCompleted: 16, activitiesPlanned: 20, fieldDays: 5, trainingHours: 8, evidenceScore: 88, overallRating: "Good" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 10, kpisTarget: 15, activitiesCompleted: 11, activitiesPlanned: 16, fieldDays: 7, trainingHours: 8, evidenceScore: 76, overallRating: "Good" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 8, kpisTarget: 14, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 11, trainingHours: 4, evidenceScore: 68, overallRating: "Needs Improvement" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 13, kpisTarget: 18, activitiesCompleted: 15, activitiesPlanned: 20, fieldDays: 4, trainingHours: 7, evidenceScore: 84, overallRating: "Good" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 9, kpisTarget: 15, activitiesCompleted: 10, activitiesPlanned: 16, fieldDays: 6, trainingHours: 7, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 7, kpisTarget: 14, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 10, trainingHours: 3, evidenceScore: 62, overallRating: "Needs Improvement" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 12, kpisTarget: 18, activitiesCompleted: 14, activitiesPlanned: 20, fieldDays: 4, trainingHours: 6, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 8, kpisTarget: 15, activitiesCompleted: 9, activitiesPlanned: 16, fieldDays: 5, trainingHours: 6, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 9, trainingHours: 3, evidenceScore: 56, overallRating: "Needs Improvement" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 11, kpisTarget: 18, activitiesCompleted: 13, activitiesPlanned: 20, fieldDays: 3, trainingHours: 5, evidenceScore: 76, overallRating: "Good" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 7, kpisTarget: 15, activitiesCompleted: 8, activitiesPlanned: 16, fieldDays: 5, trainingHours: 5, evidenceScore: 64, overallRating: "Needs Improvement" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 5, kpisTarget: 14, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 8, trainingHours: 2, evidenceScore: 50, overallRating: "Critical" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 10, kpisTarget: 18, activitiesCompleted: 12, activitiesPlanned: 20, fieldDays: 3, trainingHours: 4, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 6, kpisTarget: 15, activitiesCompleted: 7, activitiesPlanned: 16, fieldDays: 4, trainingHours: 4, evidenceScore: 60, overallRating: "Needs Improvement" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 5, kpisTarget: 14, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 7, trainingHours: 2, evidenceScore: 46, overallRating: "Critical" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-041", name: "Meera Roy", initials: "MR", role: "M&E Specialist", thematicArea: "Nutrition", kpisCompleted: 9, kpisTarget: 18, activitiesCompleted: 11, activitiesPlanned: 20, fieldDays: 2, trainingHours: 3, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-045", name: "Geeta Mahapatra", initials: "GM", role: "Nutrition Counsellor", thematicArea: "Nutrition", kpisCompleted: 5, kpisTarget: 15, activitiesCompleted: 6, activitiesPlanned: 16, fieldDays: 4, trainingHours: 3, evidenceScore: 55, overallRating: "Needs Improvement" },
      { id: "EMP-050", name: "Arvind Mishra", initials: "AM", role: "Community Health Worker", thematicArea: "Nutrition", kpisCompleted: 4, kpisTarget: 14, activitiesCompleted: 4, activitiesPlanned: 14, fieldDays: 6, trainingHours: 1, evidenceScore: 42, overallRating: "Critical" },
    ]},
  ],
  "Health": [
    { period: "July 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 18, kpisTarget: 20, activitiesCompleted: 19, activitiesPlanned: 22, fieldDays: 15, trainingHours: 8, evidenceScore: 91, overallRating: "Excellent" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 14, kpisTarget: 17, activitiesCompleted: 15, activitiesPlanned: 18, fieldDays: 12, trainingHours: 10, evidenceScore: 86, overallRating: "Good" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 11, kpisTarget: 15, activitiesCompleted: 12, activitiesPlanned: 16, fieldDays: 16, trainingHours: 6, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 9, kpisTarget: 13, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 10, trainingHours: 12, evidenceScore: 74, overallRating: "Good" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 17, kpisTarget: 20, activitiesCompleted: 18, activitiesPlanned: 22, fieldDays: 14, trainingHours: 7, evidenceScore: 88, overallRating: "Good" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 13, kpisTarget: 17, activitiesCompleted: 14, activitiesPlanned: 18, fieldDays: 11, trainingHours: 9, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 10, kpisTarget: 15, activitiesCompleted: 11, activitiesPlanned: 16, fieldDays: 14, trainingHours: 5, evidenceScore: 76, overallRating: "Good" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 8, kpisTarget: 13, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 9, trainingHours: 10, evidenceScore: 70, overallRating: "Good" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 16, kpisTarget: 20, activitiesCompleted: 17, activitiesPlanned: 22, fieldDays: 13, trainingHours: 6, evidenceScore: 84, overallRating: "Good" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 12, kpisTarget: 17, activitiesCompleted: 13, activitiesPlanned: 18, fieldDays: 10, trainingHours: 8, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 9, kpisTarget: 15, activitiesCompleted: 10, activitiesPlanned: 16, fieldDays: 12, trainingHours: 4, evidenceScore: 70, overallRating: "Good" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 7, kpisTarget: 13, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 8, trainingHours: 8, evidenceScore: 64, overallRating: "Needs Improvement" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 15, kpisTarget: 20, activitiesCompleted: 16, activitiesPlanned: 22, fieldDays: 12, trainingHours: 5, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 11, kpisTarget: 17, activitiesCompleted: 12, activitiesPlanned: 18, fieldDays: 9, trainingHours: 7, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 8, kpisTarget: 15, activitiesCompleted: 9, activitiesPlanned: 16, fieldDays: 11, trainingHours: 3, evidenceScore: 64, overallRating: "Needs Improvement" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 6, kpisTarget: 13, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 7, trainingHours: 6, evidenceScore: 58, overallRating: "Needs Improvement" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 14, kpisTarget: 20, activitiesCompleted: 15, activitiesPlanned: 22, fieldDays: 11, trainingHours: 5, evidenceScore: 76, overallRating: "Good" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 10, kpisTarget: 17, activitiesCompleted: 11, activitiesPlanned: 18, fieldDays: 8, trainingHours: 6, evidenceScore: 70, overallRating: "Good" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 7, kpisTarget: 15, activitiesCompleted: 8, activitiesPlanned: 16, fieldDays: 10, trainingHours: 3, evidenceScore: 58, overallRating: "Needs Improvement" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 5, kpisTarget: 13, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 6, trainingHours: 5, evidenceScore: 52, overallRating: "Needs Improvement" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 13, kpisTarget: 20, activitiesCompleted: 14, activitiesPlanned: 22, fieldDays: 10, trainingHours: 4, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 9, kpisTarget: 17, activitiesCompleted: 10, activitiesPlanned: 18, fieldDays: 7, trainingHours: 5, evidenceScore: 66, overallRating: "Needs Improvement" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 6, kpisTarget: 15, activitiesCompleted: 7, activitiesPlanned: 16, fieldDays: 9, trainingHours: 2, evidenceScore: 52, overallRating: "Needs Improvement" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 4, kpisTarget: 13, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 5, trainingHours: 4, evidenceScore: 46, overallRating: "Critical" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 12, kpisTarget: 20, activitiesCompleted: 13, activitiesPlanned: 22, fieldDays: 9, trainingHours: 3, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 8, kpisTarget: 17, activitiesCompleted: 9, activitiesPlanned: 18, fieldDays: 6, trainingHours: 4, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 5, kpisTarget: 15, activitiesCompleted: 6, activitiesPlanned: 16, fieldDays: 8, trainingHours: 2, evidenceScore: 48, overallRating: "Critical" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 4, kpisTarget: 13, activitiesCompleted: 4, activitiesPlanned: 14, fieldDays: 5, trainingHours: 3, evidenceScore: 42, overallRating: "Critical" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-057", name: "Amit Singh", initials: "AS", role: "Field Coordinator", thematicArea: "Health", kpisCompleted: 11, kpisTarget: 20, activitiesCompleted: 12, activitiesPlanned: 22, fieldDays: 8, trainingHours: 3, evidenceScore: 64, overallRating: "Needs Improvement" },
      { id: "EMP-060", name: "Ritu Sharma", initials: "RS", role: "Health Program Officer", thematicArea: "Health", kpisCompleted: 7, kpisTarget: 17, activitiesCompleted: 8, activitiesPlanned: 18, fieldDays: 5, trainingHours: 3, evidenceScore: 58, overallRating: "Needs Improvement" },
      { id: "EMP-063", name: "Manoj Yadav", initials: "MY", role: "Clinical Outreach Lead", thematicArea: "Health", kpisCompleted: 4, kpisTarget: 15, activitiesCompleted: 5, activitiesPlanned: 16, fieldDays: 7, trainingHours: 1, evidenceScore: 44, overallRating: "Critical" },
      { id: "EMP-068", name: "Lakshmi Bose", initials: "LB", role: "Community Health Supervisor", thematicArea: "Health", kpisCompleted: 3, kpisTarget: 13, activitiesCompleted: 3, activitiesPlanned: 14, fieldDays: 4, trainingHours: 2, evidenceScore: 38, overallRating: "Critical" },
    ]},
  ],
  "Sanitation": [
    { period: "July 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 10, kpisTarget: 14, activitiesCompleted: 11, activitiesPlanned: 14, fieldDays: 10, trainingHours: 6, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 12, kpisTarget: 14, activitiesCompleted: 13, activitiesPlanned: 14, fieldDays: 14, trainingHours: 4, evidenceScore: 88, overallRating: "Good" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 8, kpisTarget: 12, activitiesCompleted: 9, activitiesPlanned: 12, fieldDays: 12, trainingHours: 8, evidenceScore: 72, overallRating: "Good" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 9, kpisTarget: 14, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 9, trainingHours: 5, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 11, kpisTarget: 14, activitiesCompleted: 12, activitiesPlanned: 14, fieldDays: 13, trainingHours: 3, evidenceScore: 84, overallRating: "Good" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 7, kpisTarget: 12, activitiesCompleted: 8, activitiesPlanned: 12, fieldDays: 11, trainingHours: 7, evidenceScore: 68, overallRating: "Needs Improvement" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 8, kpisTarget: 14, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 8, trainingHours: 5, evidenceScore: 70, overallRating: "Good" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 10, kpisTarget: 14, activitiesCompleted: 11, activitiesPlanned: 14, fieldDays: 12, trainingHours: 3, evidenceScore: 80, overallRating: "Good" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 6, kpisTarget: 12, activitiesCompleted: 7, activitiesPlanned: 12, fieldDays: 10, trainingHours: 6, evidenceScore: 62, overallRating: "Needs Improvement" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 7, kpisTarget: 14, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 7, trainingHours: 4, evidenceScore: 66, overallRating: "Needs Improvement" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 9, kpisTarget: 14, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 11, trainingHours: 2, evidenceScore: 76, overallRating: "Good" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 5, kpisTarget: 12, activitiesCompleted: 6, activitiesPlanned: 12, fieldDays: 9, trainingHours: 5, evidenceScore: 56, overallRating: "Needs Improvement" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 6, trainingHours: 3, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 8, kpisTarget: 14, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 10, trainingHours: 2, evidenceScore: 72, overallRating: "Good" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 4, kpisTarget: 12, activitiesCompleted: 5, activitiesPlanned: 12, fieldDays: 8, trainingHours: 4, evidenceScore: 50, overallRating: "Critical" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 5, kpisTarget: 14, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 5, trainingHours: 3, evidenceScore: 58, overallRating: "Needs Improvement" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 7, kpisTarget: 14, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 9, trainingHours: 2, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 3, kpisTarget: 12, activitiesCompleted: 4, activitiesPlanned: 12, fieldDays: 7, trainingHours: 3, evidenceScore: 44, overallRating: "Critical" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 4, kpisTarget: 14, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 4, trainingHours: 2, evidenceScore: 54, overallRating: "Needs Improvement" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 8, trainingHours: 1, evidenceScore: 64, overallRating: "Needs Improvement" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 3, kpisTarget: 12, activitiesCompleted: 3, activitiesPlanned: 12, fieldDays: 6, trainingHours: 2, evidenceScore: 40, overallRating: "Critical" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-064", name: "Kavita Jain", initials: "KJ", role: "Program Officer", thematicArea: "Sanitation", kpisCompleted: 3, kpisTarget: 14, activitiesCompleted: 4, activitiesPlanned: 14, fieldDays: 4, trainingHours: 2, evidenceScore: 50, overallRating: "Critical" },
      { id: "EMP-067", name: "Suresh Nayak", initials: "SN", role: "WASH Engineer", thematicArea: "Sanitation", kpisCompleted: 5, kpisTarget: 14, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 7, trainingHours: 1, evidenceScore: 60, overallRating: "Needs Improvement" },
      { id: "EMP-070", name: "Puja Oram", initials: "PO", role: "Community Mobilizer", thematicArea: "Sanitation", kpisCompleted: 2, kpisTarget: 12, activitiesCompleted: 2, activitiesPlanned: 12, fieldDays: 5, trainingHours: 2, evidenceScore: 36, overallRating: "Critical" },
    ]},
  ],
  "Climate Change": [
    { period: "July 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 14, kpisTarget: 17, activitiesCompleted: 15, activitiesPlanned: 17, fieldDays: 12, trainingHours: 10, evidenceScore: 90, overallRating: "Excellent" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 11, kpisTarget: 14, activitiesCompleted: 12, activitiesPlanned: 14, fieldDays: 8, trainingHours: 14, evidenceScore: 86, overallRating: "Good" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 9, kpisTarget: 12, activitiesCompleted: 10, activitiesPlanned: 13, fieldDays: 16, trainingHours: 4, evidenceScore: 76, overallRating: "Good" },
    ]},
    { period: "June 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 13, kpisTarget: 17, activitiesCompleted: 14, activitiesPlanned: 17, fieldDays: 11, trainingHours: 9, evidenceScore: 86, overallRating: "Good" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 10, kpisTarget: 14, activitiesCompleted: 11, activitiesPlanned: 14, fieldDays: 7, trainingHours: 12, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 8, kpisTarget: 12, activitiesCompleted: 9, activitiesPlanned: 13, fieldDays: 14, trainingHours: 3, evidenceScore: 72, overallRating: "Good" },
    ]},
    { period: "May 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 12, kpisTarget: 17, activitiesCompleted: 13, activitiesPlanned: 17, fieldDays: 10, trainingHours: 8, evidenceScore: 82, overallRating: "Good" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 9, kpisTarget: 14, activitiesCompleted: 10, activitiesPlanned: 14, fieldDays: 6, trainingHours: 10, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 7, kpisTarget: 12, activitiesCompleted: 8, activitiesPlanned: 13, fieldDays: 12, trainingHours: 3, evidenceScore: 66, overallRating: "Needs Improvement" },
    ]},
    { period: "April 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 11, kpisTarget: 17, activitiesCompleted: 12, activitiesPlanned: 17, fieldDays: 9, trainingHours: 7, evidenceScore: 78, overallRating: "Good" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 8, kpisTarget: 14, activitiesCompleted: 9, activitiesPlanned: 14, fieldDays: 5, trainingHours: 8, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 6, kpisTarget: 12, activitiesCompleted: 7, activitiesPlanned: 13, fieldDays: 11, trainingHours: 2, evidenceScore: 60, overallRating: "Needs Improvement" },
    ]},
    { period: "March 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 10, kpisTarget: 17, activitiesCompleted: 11, activitiesPlanned: 17, fieldDays: 8, trainingHours: 6, evidenceScore: 74, overallRating: "Good" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 7, kpisTarget: 14, activitiesCompleted: 8, activitiesPlanned: 14, fieldDays: 4, trainingHours: 7, evidenceScore: 68, overallRating: "Needs Improvement" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 5, kpisTarget: 12, activitiesCompleted: 6, activitiesPlanned: 13, fieldDays: 10, trainingHours: 2, evidenceScore: 54, overallRating: "Needs Improvement" },
    ]},
    { period: "February 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 9, kpisTarget: 17, activitiesCompleted: 10, activitiesPlanned: 17, fieldDays: 7, trainingHours: 5, evidenceScore: 70, overallRating: "Good" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 6, kpisTarget: 14, activitiesCompleted: 7, activitiesPlanned: 14, fieldDays: 4, trainingHours: 6, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 4, kpisTarget: 12, activitiesCompleted: 5, activitiesPlanned: 13, fieldDays: 9, trainingHours: 1, evidenceScore: 48, overallRating: "Critical" },
    ]},
    { period: "January 2026", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 8, kpisTarget: 17, activitiesCompleted: 9, activitiesPlanned: 17, fieldDays: 6, trainingHours: 4, evidenceScore: 66, overallRating: "Needs Improvement" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 5, kpisTarget: 14, activitiesCompleted: 6, activitiesPlanned: 14, fieldDays: 3, trainingHours: 5, evidenceScore: 56, overallRating: "Needs Improvement" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 3, kpisTarget: 12, activitiesCompleted: 4, activitiesPlanned: 13, fieldDays: 8, trainingHours: 1, evidenceScore: 42, overallRating: "Critical" },
    ]},
    { period: "December 2025", employees: [
      { id: "EMP-071", name: "Imran Ali", initials: "IA", role: "Climate Lead", thematicArea: "Climate Change", kpisCompleted: 7, kpisTarget: 17, activitiesCompleted: 8, activitiesPlanned: 17, fieldDays: 5, trainingHours: 3, evidenceScore: 62, overallRating: "Needs Improvement" },
      { id: "EMP-074", name: "Nandini Prusty", initials: "NP", role: "GIS & Environment Officer", thematicArea: "Climate Change", kpisCompleted: 4, kpisTarget: 14, activitiesCompleted: 5, activitiesPlanned: 14, fieldDays: 3, trainingHours: 4, evidenceScore: 52, overallRating: "Needs Improvement" },
      { id: "EMP-078", name: "Tapan Samal", initials: "TS", role: "Plantation Supervisor", thematicArea: "Climate Change", kpisCompleted: 2, kpisTarget: 12, activitiesCompleted: 3, activitiesPlanned: 13, fieldDays: 7, trainingHours: 1, evidenceScore: 38, overallRating: "Critical" },
    ]},
  ],
};
