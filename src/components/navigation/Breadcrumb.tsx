import { ChevronRight, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

export function Breadcrumb({ current }: { current: string }) {
  return (
    <motion.nav
      aria-label="Breadcrumb"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-5 flex items-center gap-2 text-[11px] text-[var(--text-subtle)]"
    >
      <LayoutGrid size={13} />
      <span>Workspace</span>
      <ChevronRight size={12} />
      <motion.span
        layoutId="breadcrumb-current"
        className="font-medium text-[var(--text-muted)]"
      >
        {current}
      </motion.span>
    </motion.nav>
  );
}
