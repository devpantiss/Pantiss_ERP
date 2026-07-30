import {
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  CircleDollarSign,
  CloudSun,
  Cross,
  Handshake,
  HeartHandshake,
  Landmark,
  Layers3,
  Lightbulb,
  Megaphone,
  Salad,
  Scale,
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
    accent: "from-blue-500 to-indigo-400",
    glow: "rgba(37, 99, 235, 0.32)",
    modules: [
      { id: "finance", title: "Finance", description: "Budgets, grants, ledgers and financial reporting.", icon: CircleDollarSign, accent: "from-emerald-400 to-cyan-400", status: "Live" },
      { id: "human-resources", title: "Human Resources", description: "People, performance, payroll and employee journeys.", icon: UsersRound, accent: "from-violet-400 to-fuchsia-400", status: "Live" },
      { id: "monitoring-evaluation", title: "Monitoring & Evaluation", description: "Measure outcomes, impact and program performance.", icon: ChartNoAxesCombined, accent: "from-blue-400 to-cyan-400", status: "Live" },
      { id: "communications", title: "Communications", description: "Campaigns, content and stakeholder engagement.", icon: Megaphone, accent: "from-orange-400 to-rose-400", status: "Live" },
      { id: "business-development", title: "Business Development", description: "Opportunities, proposals and partner pipelines.", icon: TrendingUp, accent: "from-cyan-400 to-blue-400", status: "Live" },
      { id: "strategy-innovation", title: "Strategy & Innovation", description: "Ideas, initiatives and long-range planning.", icon: Lightbulb, accent: "from-amber-300 to-orange-400", status: "Soon" },
    ],
  },
  {
    id: "thematic-areas",
    eyebrow: "Programs",
    title: "Thematic Areas",
    description: "Manage implementation domains.",
    icon: Layers3,
    accent: "from-cyan-400 to-blue-500",
    glow: "rgba(6, 182, 212, 0.28)",
    modules: [
      { id: "skill", title: "Skill", description: "Build capabilities through structured learning programs.", icon: Sparkles, accent: "from-blue-400 to-indigo-400", status: "Live" },
      { id: "livelihood", title: "Livelihood", description: "Enable sustainable income and resilient communities.", icon: Handshake, accent: "from-emerald-400 to-teal-400", status: "Live" },
      { id: "entrepreneurship", title: "Entrepreneurship", description: "Support founders, enterprises and market access.", icon: BriefcaseBusiness, accent: "from-violet-400 to-purple-400", status: "Live" },
      { id: "nutrition", title: "Nutrition", description: "Track nutrition initiatives and community outcomes.", icon: Salad, accent: "from-lime-400 to-emerald-400", status: "Live" },
      { id: "health", title: "Health", description: "Deliver accessible care and monitor health programs.", icon: Cross, accent: "from-rose-400 to-pink-400", status: "Live" },
      { id: "sanitation", title: "Sanitation", description: "Manage water, hygiene and sanitation interventions.", icon: Toilet, accent: "from-sky-400 to-cyan-400", status: "Soon" },
      { id: "climate-change", title: "Climate Change", description: "Coordinate climate resilience and adaptation work.", icon: CloudSun, accent: "from-teal-400 to-green-400", status: "Live" },
    ],
  },
  {
    id: "clients",
    eyebrow: "Partnerships",
    title: "Clients",
    description: "Manage external stakeholders.",
    icon: Users,
    accent: "from-violet-500 to-blue-500",
    glow: "rgba(124, 58, 237, 0.28)",
    modules: [
      { id: "government-partners", title: "Government Partners", description: "Coordinate public-sector programs and partnerships.", icon: Landmark, accent: "from-blue-400 to-indigo-400", status: "Live" },
      { id: "corporate-partners", title: "Corporate Partners", description: "Manage strategic corporate relationships and delivery.", icon: Building2, accent: "from-cyan-400 to-blue-400", status: "Live" },
      { id: "csr-foundations", title: "CSR Foundations", description: "Align grants, programs and impact commitments.", icon: HeartHandshake, accent: "from-rose-400 to-violet-400", status: "Live" },
      { id: "multilateral-organizations", title: "Multilateral Organizations", description: "Coordinate complex, multi-country development programs.", icon: Scale, accent: "from-amber-300 to-orange-400", status: "Live" },
    ],
  },
];

export const getCategory = (id?: string) =>
  categories.find((category) => category.id === id);
