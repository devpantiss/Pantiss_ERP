import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { categories } from "../../data/modules";
import type { CategorySlug } from "../../types/modules";
import { cn } from "../../utils/cn";

export function WorkspaceRail({ active }: { active: CategorySlug }) {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28">
        <div className="mb-4 px-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
          Workspaces
        </div>
        <div className="space-y-1.5">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isActive = category.id === active;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => navigate(`/modules/${category.id}`)}
                className={cn(
                  "focus-ring group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                  isActive
                    ? "bg-[var(--surface-strong)] text-[var(--text)]"
                    : "text-[var(--text-subtle)] hover:bg-[var(--surface-soft)] hover:text-[var(--text-muted)]",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute -left-px top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa]"
                  />
                )}
                <span className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-[10px] border transition-colors",
                  isActive
                    ? "border-blue-400/15 bg-blue-400/10 text-blue-400"
                    : "border-[var(--border)] bg-[var(--surface-soft)]",
                )}>
                  <Icon size={15} strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium">{category.title}</span>
                  <span className="mt-0.5 block text-[9px] opacity-55">
                    {String(index + 1).padStart(2, "0")} / {category.modules.length} modules
                  </span>
                </span>
                <ChevronRight size={12} className={cn("transition-transform", isActive ? "opacity-70" : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-50")} />
              </button>
            );
          })}
        </div>
        <div className="mx-3 my-6 h-px bg-[var(--border)]" />
        <div className="px-3">
          <div className="mb-2 flex items-center justify-between text-[9px] text-[var(--text-subtle)]">
            <span>Workspace capacity</span>
            <span>68%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-[var(--surface-strong)]">
            <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        </div>
      </div>
    </aside>
  );
}
