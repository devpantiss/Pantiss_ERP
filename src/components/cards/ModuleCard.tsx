import { ArrowUpRight } from "lucide-react";
import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ModuleItem } from "../../types/modules";
import { Badge } from "../ui/Badge";
import { Ripple } from "../ui/Ripple";

export const ModuleCard = memo(function ModuleCard({
  module,
  index,
  onSelect,
  opensDialog = true,
}: {
  module: ModuleItem;
  index: number;
  onSelect?: (module: ModuleItem) => void;
  opensDialog?: boolean;
}) {
  const Icon = module.icon;
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12 + index * 0.055, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="group module-card relative min-h-[228px] rounded-3xl p-px"
    >
      <button
        type="button"
        className="focus-ring relative size-full overflow-hidden rounded-[23px] bg-[var(--module-bg)] text-left"
        aria-label={`Open ${module.title} module`}
        aria-haspopup={onSelect && opensDialog ? "dialog" : undefined}
        onClick={() => onSelect?.(module)}
      >
        <Ripple>
          <div className="relative flex size-full min-h-[226px] flex-col justify-between p-5 sm:p-6">
            <div className={`absolute -right-12 -top-14 size-36 rounded-full bg-gradient-to-br ${module.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-[0.11]`} />
            <span className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.12em] text-[var(--text-subtle)] opacity-40">
              MOD–{String(index + 1).padStart(2, "0")}
            </span>
            <div className="relative flex items-start justify-between">
              <span className={`grid size-11 place-items-center rounded-[14px] border border-white/[0.07] bg-gradient-to-br ${module.accent} text-white shadow-lg shadow-black/10`}>
                <Icon size={20} strokeWidth={1.7} />
              </span>
              <div className="mr-14">
                <Badge muted={module.status === "Soon"}>{module.status ?? "Live"}</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="mb-2 flex items-end justify-between gap-3">
                <h3 className="text-[17px] font-semibold tracking-[-0.025em] text-[var(--text)]">
                  {module.title}
                </h3>
                <ArrowUpRight
                  size={16}
                  className="shrink-0 text-[var(--text-subtle)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--text)]"
                />
              </div>
              <p className="max-w-[19rem] text-xs leading-5 text-[var(--text-muted)]">
                {module.description}
              </p>
              <div className="mt-5 flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((item) => (
                  <span
                    key={item}
                    className={`h-0.5 rounded-full transition-all duration-500 ${
                      item < 3 ? `w-4 bg-gradient-to-r ${module.accent} opacity-45` : "w-2 bg-[var(--border-strong)]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Ripple>
      </button>
    </motion.article>
  );
});
