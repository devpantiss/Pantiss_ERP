import {
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  CloudSun,
  Cross,
  Handshake,
  Layers3,
  Lightbulb,
  Megaphone,
  Salad,
  Sparkles,
  Toilet,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import type { Category } from "../types/modules";

export const categories: Category[] = [
  {
    id: "core-operations",
    eyebrow: "Organization",
    title: "Core Operations",
    description: "Manage internal organizational functions.",
    icon: Building2,
    accent: "from-blue-600 to-cyan-400",
    glow: "rgba(37, 99, 235, 0.32)",
    modules: [
      { id: "finance", title: "Finance", description: "Budgets, grants, ledgers and financial reporting.", icon: CircleDollarSign, accent: "from-emerald-400 to-cyan-400", status: "Live" },
      { id: "human-resources", title: "Human Resources", description: "People, performance, payroll and employee journeys.", icon: UsersRound, accent: "from-blue-500 to-indigo-400", status: "Live" },
      { id: "monitoring-evaluation", title: "Monitoring & Evaluation", description: "Measure outcomes, impact and program performance.", icon: ChartNoAxesCombined, accent: "from-blue-500 to-cyan-400", status: "Live" },
      { id: "communications", title: "Communications", description: "Campaigns, content and stakeholder engagement.", icon: Megaphone, accent: "from-orange-400 to-amber-400", status: "Live" },
      { id: "business-development", title: "Business Development", description: "Opportunities, proposals and partner pipelines.", icon: TrendingUp, accent: "from-cyan-400 to-blue-500", status: "Live" },
      { id: "strategy-innovation", title: "Strategy & Innovation", description: "Ideas, initiatives and long-range planning.", icon: Lightbulb, accent: "from-amber-300 to-orange-400", status: "Soon" },
    ],
  },
  {
    id: "thematic-areas",
    eyebrow: "Programs",
    title: "Thematic Areas",
    description: "Manage implementation domains.",
    icon: Layers3,
    accent: "from-cyan-400 to-blue-600",
    glow: "rgba(6, 182, 212, 0.28)",
    modules: [
      { id: "skill", title: "Skill", description: "Build capabilities through structured learning programs.", icon: Sparkles, accent: "from-violet-500 to-purple-400", status: "Live" },
      { id: "livelihood", title: "Livelihood", description: "Enable sustainable income and resilient communities.", icon: Handshake, accent: "from-emerald-400 to-teal-400", status: "Live" },
      { id: "entrepreneurship", title: "Entrepreneurship", description: "Support founders, enterprises and market access.", icon: BriefcaseBusiness, accent: "from-blue-500 to-indigo-400", status: "Live" },
      { id: "nutrition", title: "Nutrition", description: "Track nutrition initiatives and community outcomes.", icon: Salad, accent: "from-lime-400 to-emerald-400", status: "Live" },
      { id: "health", title: "Health", description: "Deliver accessible care and monitor health programs.", icon: Cross, accent: "from-sky-400 to-blue-400", status: "Live" },
      { id: "sanitation", title: "Sanitation", description: "Manage water, hygiene and sanitation interventions.", icon: Toilet, accent: "from-cyan-400 to-blue-500", status: "Soon" },
      { id: "climate-change", title: "Climate Change", description: "Coordinate climate resilience and adaptation work.", icon: CloudSun, accent: "from-teal-400 to-green-400", status: "Live" },
    ],
  },
  {
    id: "cxo",
    eyebrow: "Leadership",
    title: "CXO",
    description: "Monitor organizational performance, delivery and financial health.",
    icon: Users,
    accent: "from-violet-600 to-purple-400",
    glow: "rgba(124, 58, 237, 0.28)",
    modules: [
      { id: "ceo", title: "CEO", description: "Chief Executive Officer · Strategy, portfolio health and program outcomes.", icon: Building2, accent: "from-blue-600 to-cyan-400", status: "Live" },
      { id: "coo", title: "COO", description: "Chief Operating Officer · Project delivery, team reporting and operational risks.", icon: Layers3, accent: "from-violet-600 to-purple-400", status: "Live" },
      { id: "cfo", title: "CFO", description: "Chief Financial Officer · Budgets, utilization and financial exposure.", icon: CircleDollarSign, accent: "from-emerald-600 to-teal-400", status: "Live" },
    ],
  },
];

export const getCategory = (id?: string) =>
  categories.find((category) => category.id === id);
