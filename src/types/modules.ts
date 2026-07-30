import type { LucideIcon } from "lucide-react";

export type CategorySlug = "core-operations" | "thematic-areas" | "clients";

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  status?: "Live" | "Soon";
}

export interface Category {
  id: CategorySlug;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  modules: ModuleItem[];
}
