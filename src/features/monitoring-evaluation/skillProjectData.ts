export interface SkillCandidate {
  id: string;
  name: string;
  batch: string;
  jobRole: string;
  status: "In Progress" | "Assessment Due" | "Certified";
  durationReceived: number;
  durationTotal: number;
  theoryHours: number;
  practicalHours: number;
  placement: "Placed" | "Interview Scheduled" | "Employer Mapping";
  phone: string;
  aadhaar: string;
  dateOfBirth: string;
  gender: "Female" | "Male";
  qualification: string;
  experience: string;
  submitted: string;
  mobilizer: string;
  employer: string;
  designation: string;
  salary: string;
  joiningDate: string;
  insuranceProvider: string;
  policyNumber: string;
  coverage: string;
  insuranceStart: string;
  insuranceEnd: string;
  nominee: string;
}

export interface SkillCenter {
  id: string;
  name: string;
  district: string;
  manager: string;
  batches: number;
  learners: number;
  attendance: number;
  completion: number;
  certification: number;
  placement: number;
  retention: number;
  womenShare: number;
  evidence: number;
  health: "Healthy" | "Watch";
  candidates: SkillCandidate[];
}

const candidateNames = [
  "Sasmita Nayak", "Deepak Sahu", "Priyanka Behera", "Aman Pradhan",
  "Monalisa Rout", "Ritesh Patra", "Sweta Majhi", "Tanmay Das",
  "Anjali Barik", "Sourav Jena", "Purnima Mohanty", "Bikash Dalei",
  "Rashmita Singh", "Debasis Rout", "Kalyani Sethi", "Manoj Behera",
  "Lipsa Pradhan", "Rohit Naik", "Suchitra Das", "Abinash Sahoo",
];

function makeCandidates(centerCode: string, jobRole: string, count: number): SkillCandidate[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${centerCode}-${String(index + 1).padStart(3, "0")}`,
    name: candidateNames[index % candidateNames.length],
    batch: `${centerCode}-ELEC-${101 + Math.floor(index / 4)}`,
    jobRole: index % 5 === 4 ? "Safety Technician" : index % 4 === 3 ? "Assistant Electrician" : jobRole,
    status: index % 4 === 3 ? "Assessment Due" : index % 3 === 2 ? "Certified" : "In Progress",
    durationReceived: 32 + (index * 3) % 14,
    durationTotal: 48,
    theoryHours: 104 + index * 8,
    practicalHours: 156 + index * 11,
    placement: index % 3 === 2 ? "Placed" : index % 2 === 0 ? "Employer Mapping" : "Interview Scheduled",
    phone: `+91 90000 ${String(10001 + index).padStart(5, "0")}`,
    aadhaar: `XXXX-XXXX-${2210 + index * 10}`,
    dateOfBirth: `${1990 + index}-0${index % 8 + 1}-15`,
    gender: index % 2 === 0 ? "Female" : "Male",
    qualification: index % 3 === 0 ? "10th Pass" : index % 3 === 1 ? "ITI" : "12th Pass",
    experience: `${index % 3} Years`,
    submitted: "2026-01-10",
    mobilizer: "Rahul Pradhan",
    employer: index % 3 === 2 ? "JSW Steel" : index % 2 === 0 ? "Tata Steel" : "Vedanta Resources",
    designation: index % 5 === 4 ? "Safety Technician" : index % 4 === 3 ? "Assistant Electrician" : jobRole,
    salary: `₹${(14500 + index * 975).toLocaleString("en-IN")}`,
    joiningDate: index % 3 === 2 ? "01 Jul 2026" : "Pending",
    insuranceProvider: index % 2 === 0 ? "ICICI Lombard" : "New India Assurance",
    policyNumber: index % 2 === 0 ? `POL-OD-${88301 + index}` : "Pending",
    coverage: index % 2 === 0 ? "₹2,50,000" : "—",
    insuranceStart: index % 2 === 0 ? "02 Apr 2026" : "—",
    insuranceEnd: index % 2 === 0 ? "29 May 2027" : "30 Apr 2027",
    nominee: index % 2 === 0 ? "Father" : "Spouse",
  }));
}

export const skillCenters: SkillCenter[] = [
  { id: "angul", name: "Angul Skill Development Center", district: "Angul", manager: "Subhasis Patnaik", batches: 5, learners: 326, attendance: 91, completion: 88, certification: 82, placement: 72, retention: 67, womenShare: 51, evidence: 96, health: "Healthy", candidates: makeCandidates("ANG", "Electrical Technician", 20) },
  { id: "keonjhar", name: "Keonjhar Skill Development Center", district: "Keonjhar", manager: "Madhusmita Nayak", batches: 4, learners: 284, attendance: 88, completion: 86, certification: 79, placement: 66, retention: 63, womenShare: 56, evidence: 92, health: "Healthy", candidates: makeCandidates("KEO", "Industrial Electrician", 18) },
  { id: "sundargarh", name: "Sundargarh Training Center", district: "Sundargarh", manager: "Pradeep Sahu", batches: 5, learners: 348, attendance: 84, completion: 79, certification: 72, placement: 61, retention: 55, womenShare: 48, evidence: 84, health: "Watch", candidates: makeCandidates("SUN", "Fitter – Mechanical Assembly", 20) },
  { id: "jajpur", name: "Jajpur Skills & Livelihood Center", district: "Jajpur", manager: "Rashmi Das", batches: 4, learners: 290, attendance: 89, completion: 87, certification: 80, placement: 69, retention: 65, womenShare: 58, evidence: 94, health: "Healthy", candidates: makeCandidates("JAJ", "Welding Technician", 18) },
];

export const skillProjectTeam = [
  { id: "PNT-EMP-0001", name: "Aditya Sahu", initials: "AS", role: "Lead Trainer", status: "Active" },
  { id: "PNT-EMP-0002", name: "Meera Das", initials: "MD", role: "Placement Officer", status: "Active" },
  { id: "PNT-EMP-0003", name: "Rahul Pradhan", initials: "RP", role: "Mobilization Lead", status: "Active" },
  { id: "PNT-EMP-0008", name: "Ananya Mishra", initials: "AM", role: "Director – Programs", status: "Active" },
];

export const skillEvidence = [
  { title: "Enrollment documentation", category: "Enrollment", stage: "Mobilization", date: "08 Jul 2026", image: "/images/skill-development/enrollment-counselling.jpg", alt: "Trainees completing enrollment documents at a skill center" },
  { title: "Electrical workshop delivery", category: "Training", stage: "Learning", date: "11 Jul 2026", image: "/images/skill-development/electrical-training.jpg", alt: "Electrical technician trainees practicing under instructor supervision" },
  { title: "Industry exposure visit", category: "Training", stage: "Exposure", date: "14 Jul 2026", image: "/images/skill-development/industry-exposure.jpg", alt: "Vocational trainees attending an industrial exposure visit" },
  { title: "Candidate counselling", category: "Enrollment", stage: "Verification", date: "17 Jul 2026", image: "/images/skill-development/enrollment-counselling.jpg", alt: "Young trainees receiving enrollment guidance" },
  { title: "Employer connect", category: "Placements", stage: "Interview", date: "22 Jul 2026", image: "/images/skill-development/placement-drive.jpg", alt: "A trainee speaking with an employer during a placement drive" },
  { title: "Safety compliance review", category: "Compliance", stage: "Evidence", date: "25 Jul 2026", image: "/images/skill-development/industry-exposure.jpg", alt: "Trainees wearing protective equipment inside an industrial facility" },
  { title: "Placement readiness", category: "Placements", stage: "Readiness", date: "28 Jul 2026", image: "/images/skill-development/placement-drive.jpg", alt: "Candidates participating in employer interviews" },
  { title: "Center operations", category: "Compliance", stage: "Monitoring", date: "31 Jul 2026", image: "/images/skill-development/electrical-training.jpg", alt: "Instructor monitoring a practical electrical workshop" },
];
