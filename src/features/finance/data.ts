export type FinanceStatus = "On track" | "Watch" | "Action required";

export interface FinanceProject {
  id: string;
  name: string;
  areaId: string;
  donor: string;
  location: string;
  approved: number;
  released: number;
  spent: number;
  committed: number;
  pendingAdvances: number;
  utilization: number;
  status: FinanceStatus;
  lastVoucherDate: string;
}

export interface FinanceArea {
  id: string;
  name: string;
  shortName: string;
  color: string;
  approved: number;
  projects: FinanceProject[];
}

const areaDefinitions = [
  { id: "skill-development", name: "Skill Development", shortName: "Skills", color: "#dc2626", approved: 280, count: 8 },
  { id: "livelihood", name: "Livelihood", shortName: "Livelihood", color: "#059669", approved: 210, count: 6 },
  { id: "entrepreneurship", name: "Entrepreneurship", shortName: "Enterprise", color: "#f97316", approved: 160, count: 5 },
  { id: "nutrition", name: "Nutrition", shortName: "Nutrition", color: "#ca8a04", approved: 240, count: 7 },
  { id: "health", name: "Health", shortName: "Health", color: "#e11d48", approved: 320, count: 9 },
  { id: "sanitation", name: "Sanitation", shortName: "WASH", color: "#0891b2", approved: 130, count: 4 },
  { id: "climate-change", name: "Climate Change", shortName: "Climate", color: "#16a34a", approved: 190, count: 5 },
] as const;

const projectNames: Record<string, string[]> = {
  "skill-development": ["PMKVY 4.0 Odisha Skills", "Project Udaan", "Rural Technical Academy", "Women in Trades", "Green Jobs Pathway", "Digital Saksham", "Industrial Apprenticeship Bridge", "Youth Employability Mission"],
  livelihood: ["Samriddhi Livelihoods Programme", "Farm Prosperity Initiative", "Coastal Enterprise Network", "Tribal Producer Collective", "Resilient Household Economy", "Market Access Accelerator"],
  entrepreneurship: ["Saksham Women Enterprise", "Rural Incubation Lab", "Micro Enterprise Catalyst", "Youth Startup Pathway", "Community Business Network"],
  nutrition: ["Poshan Community Network", "First 1,000 Days", "Community Nutrition Fellows", "Adolescent Nutrition Mission", "Nutrition-Sensitive Villages", "Maternal Wellness Initiative", "Diet Diversity Campaign"],
  health: ["Swasthya Mobile Clinics", "Community NCD Screening", "Maternal Health Continuum", "Telehealth Access Network", "School Health Initiative", "Tribal Health Outreach", "Vision Care Mission", "Mental Wellbeing Programme", "Referral Strengthening Project"],
  sanitation: ["Jal Suraksha Mission", "School WASH Programme", "Safe Water Communities", "ODF Sustainability Initiative"],
  "climate-change": ["Green Village Resilience", "Watershed Restoration Mission", "Climate-Smart Agriculture", "Community Forestry Partnership", "Local Adaptation Fund"],
};

const donors = ["NSDC", "Tata Trusts", "Azim Premji Philanthropic Initiatives", "State Government", "HDFC Parivartan", "UNDP", "CSR Consortium"];
const locations = ["Odisha", "Jharkhand", "West Bengal", "Assam", "Bihar", "Chhattisgarh"];

function makeProjects(area: typeof areaDefinitions[number]): FinanceProject[] {
  const weights = Array.from({ length: area.count }, (_, index) => 1 + (index % 3) * 0.17);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight, index) => {
    const approved = area.approved * weight / weightTotal;
    const releaseRate = Math.min(0.98, 0.79 + (index % 4) * 0.055);
    const utilization = 58 + ((index * 7 + area.name.length) % 34);
    const released = approved * releaseRate;
    const spent = approved * utilization / 100;
    const committed = approved * (0.055 + (index % 3) * 0.022);
    const pendingAdvances = approved * (0.008 + (index % 4) * 0.006);
    const status: FinanceStatus = utilization < 64 || pendingAdvances > approved * 0.023
      ? "Action required"
      : utilization < 72 || releaseRate < 0.84 ? "Watch" : "On track";
    return {
      id: `FIN-${area.id.slice(0, 3).toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
      name: projectNames[area.id][index],
      areaId: area.id,
      donor: donors[(index + area.name.length) % donors.length],
      location: locations[(index + area.id.length) % locations.length],
      approved,
      released,
      spent,
      committed,
      pendingAdvances,
      utilization,
      status,
      lastVoucherDate: `${String(18 + index % 10).padStart(2, "0")} Jul 2026`,
    };
  });
}

export const financeAreas: FinanceArea[] = areaDefinitions.map((area) => ({
  id: area.id,
  name: area.name,
  shortName: area.shortName,
  color: area.color,
  approved: area.approved,
  projects: makeProjects(area),
}));

export function areaTotals(area: FinanceArea) {
  const sum = (key: "released" | "spent" | "committed" | "pendingAdvances") => area.projects.reduce((total, project) => total + project[key], 0);
  const released = sum("released");
  const spent = sum("spent");
  const committed = sum("committed");
  const pendingAdvances = sum("pendingAdvances");
  return {
    approved: area.approved,
    released,
    spent,
    committed,
    pendingAdvances,
    available: Math.max(0, area.approved - spent - committed),
    utilization: Math.round(spent / area.approved * 100),
    atRisk: area.projects.filter((project) => project.status === "Action required").length,
  };
}

export const portfolioTotals = financeAreas.reduce((totals, area) => {
  const current = areaTotals(area);
  return {
    approved: totals.approved + current.approved,
    released: totals.released + current.released,
    spent: totals.spent + current.spent,
    committed: totals.committed + current.committed,
    pendingAdvances: totals.pendingAdvances + current.pendingAdvances,
    available: totals.available + current.available,
    projects: totals.projects + area.projects.length,
    atRisk: totals.atRisk + current.atRisk,
  };
}, { approved: 0, released: 0, spent: 0, committed: 0, pendingAdvances: 0, available: 0, projects: 0, atRisk: 0 });

export function formatCurrency(lakhs: number, precise = false) {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(precise ? 2 : 1)} Cr`;
  return `₹${lakhs.toFixed(precise ? 2 : 1)} L`;
}
