import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  label: string;
  children: ReactNode;
}

export function IconButton({
  label,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "focus-ring grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)] backdrop-blur-xl transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text)]",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
