import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionLink = motion.create(Link);

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <MotionLink
      to="/"
      aria-label="Pantiss ERP home"
      className="focus-ring flex shrink-0 items-center rounded-md"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <motion.img
        layoutId="brand-mark"
        src={compact ? "/pantiss-mark.png" : "/pantiss-logo.png"}
        alt={compact ? "Pantiss" : "Pantiss — Group of Non-Profits"}
        className={
          compact
            ? "size-10 rounded-[10px] object-contain"
            : "h-10 w-auto max-w-[102px] object-contain sm:h-11 sm:max-w-[112px]"
        }
        draggable={false}
        whileHover={{ rotate: compact ? 2 : 0 }}
      />
    </MotionLink>
  );
}
