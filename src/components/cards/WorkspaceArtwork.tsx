import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { CategorySlug } from "../../types/modules";
import { cn } from "../../utils/cn";

interface WorkspaceArtworkProps {
  category: CategorySlug;
  icon: LucideIcon;
  accent: string;
}

function OperationsMap() {
  return (
    <svg viewBox="0 0 260 150" className="absolute inset-0 size-full" aria-hidden>
      <path className="art-line" d="M45 38H93C108 38 110 64 130 64S151 38 169 38h46" />
      <path className="art-line art-line--faint" d="M45 112H92c20 0 18-27 38-27s20 27 39 27h46" />
      <path className="art-line art-line--dashed" d="M45 38v74M215 38v74" />
      <rect className="art-node" x="29" y="28" width="32" height="20" rx="7" />
      <rect className="art-node" x="199" y="28" width="32" height="20" rx="7" />
      <rect className="art-node" x="29" y="102" width="32" height="20" rx="7" />
      <rect className="art-node" x="199" y="102" width="32" height="20" rx="7" />
      <circle className="art-pulse" cx="130" cy="75" r="37" />
      <circle className="art-pulse art-pulse--inner" cx="130" cy="75" r="27" />
    </svg>
  );
}

function ThematicLayers() {
  return (
    <svg viewBox="0 0 260 150" className="absolute inset-0 size-full" aria-hidden>
      <path className="art-layer art-layer--back" d="M47 44 130 18l83 26-83 26Z" />
      <path className="art-layer art-layer--middle" d="M47 67l83-26 83 26-83 26Z" />
      <path className="art-layer" d="m47 90 83-26 83 26-83 27Z" />
      <path className="art-line art-line--dashed" d="M47 90v15l83 27 83-27V90" />
      <circle className="art-pulse" cx="130" cy="75" r="31" />
    </svg>
  );
}

function ClientNetwork() {
  return (
    <svg viewBox="0 0 260 150" className="absolute inset-0 size-full" aria-hidden>
      <path className="art-line art-line--dashed" d="m130 75-75-35m75 35 76-35m-76 35-72 38m72-38 72 38" />
      <path className="art-line art-line--faint" d="M55 40 58 113M206 40l-4 73" />
      <circle className="art-node-circle" cx="55" cy="40" r="9" />
      <circle className="art-node-circle" cx="206" cy="40" r="9" />
      <circle className="art-node-circle" cx="58" cy="113" r="9" />
      <circle className="art-node-circle" cx="202" cy="113" r="9" />
      <circle className="art-pulse" cx="130" cy="75" r="35" />
      <circle className="art-pulse art-pulse--inner" cx="130" cy="75" r="25" />
    </svg>
  );
}

export function WorkspaceArtwork({
  category,
  icon: Icon,
  accent,
}: WorkspaceArtworkProps) {
  return (
    <div
      className={cn(
        "workspace-art relative h-[150px] w-full overflow-hidden md:h-[190px]",
        `workspace-art--${category}`,
      )}
      aria-hidden
    >
      <div className="art-grid absolute inset-0" />
      {category === "core-operations" && <OperationsMap />}
      {category === "thematic-areas" && <ThematicLayers />}
      {category === "clients" && <ClientNetwork />}
      <motion.div
        layoutId={`category-icon-${category}`}
        className={`workspace-art-icon absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[15px] bg-gradient-to-br ${accent} text-white`}
      >
        <span className="icon-sheen" />
        <Icon size={21} strokeWidth={1.65} />
      </motion.div>
    </div>
  );
}
