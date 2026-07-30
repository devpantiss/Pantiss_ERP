import { ArrowUpRight } from "lucide-react";
import { memo } from "react";
import { motion } from "framer-motion";
import type { Category } from "../../types/modules";
import { Ripple } from "../ui/Ripple";
import { cn } from "../../utils/cn";
import { WorkspaceArtwork } from "./WorkspaceArtwork";

interface CategoryCardProps {
  category: Category;
  index: number;
  onSelect: (category: Category) => void;
}

export const CategoryCard = memo(function CategoryCard({
  category,
  index,
  onSelect,
}: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <motion.article
      layoutId={`category-shell-${category.id}`}
      initial={{ opacity: 0, y: 34, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 18, scale: 0.98 }}
      transition={{ delay: 0.1 + index * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{
        "--card-glow": category.glow,
      } as React.CSSProperties}
      className={cn(
        "group category-card workspace-lane relative min-h-[360px] md:min-h-[420px]",
        index < 2 && "workspace-lane--divided",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(category)}
        className="focus-ring relative size-full overflow-hidden text-left"
        aria-label={`Open ${category.title}`}
      >
        <Ripple>
          <div className={`workspace-panel workspace-panel--${category.id} relative flex size-full min-h-[360px] flex-col justify-between overflow-hidden p-6 md:min-h-[420px] md:p-7`}>
            <span className={`workspace-edge bg-gradient-to-r ${category.accent}`} aria-hidden />

            <div className="relative flex items-start justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[var(--text-subtle)]">
                <span className={`h-px w-5 bg-gradient-to-r ${category.accent}`} />
                0{index + 1}
              </span>
              <span className="grid size-9 translate-x-1 -translate-y-1 place-items-center text-[var(--text-subtle)] opacity-60 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[var(--text)] group-hover:opacity-100">
                <ArrowUpRight size={16} />
              </span>
            </div>

            <div className="relative flex flex-1 items-center py-7">
              <WorkspaceArtwork
                category={category.id}
                icon={Icon}
                accent={category.accent}
              />
            </div>

            <div className="relative border-t border-[var(--border)] pt-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-subtle)]">
                  {category.modules.length} modules
                </span>
                <span className={`h-1 w-1 rounded-full bg-gradient-to-br ${category.accent}`} />
              </div>
              <motion.h2
                layoutId={`category-title-${category.id}`}
                className="text-[25px] font-semibold leading-none tracking-[-0.045em] text-[var(--text)]"
              >
                {category.title}
              </motion.h2>
            </div>
          </div>
        </Ripple>
      </button>
    </motion.article>
  );
});
