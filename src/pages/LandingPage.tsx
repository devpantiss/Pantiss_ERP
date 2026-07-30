import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CategoryCard } from "../components/cards/CategoryCard";
import { categories } from "../data/modules";
import type { Category } from "../types/modules";
import { useCategory } from "../hooks/useCategory";

export default function LandingPage() {
  const navigate = useNavigate();
  const { selectCategory } = useCategory();

  const handleSelect = (category: Category) => {
    selectCategory(category.id);
    navigate(`/modules/${category.id}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col justify-center px-5 pb-10 pt-24 sm:px-8">
      <section className="landing-stage relative mx-auto w-full py-6">
        <div className="landing-halo" aria-hidden />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="mb-9 flex items-end justify-between gap-6"
        >
          <div>
            <motion.span
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="mb-3 block text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-subtle)]"
            >
              Workspace
            </motion.span>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              className="text-balance text-[clamp(2.35rem,4vw,4rem)] font-medium leading-none tracking-[-0.06em] text-[var(--text)]"
            >
              Select where to begin.
            </motion.h1>
          </div>
          <motion.span
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="hidden pb-1 font-mono text-[10px] tracking-[0.12em] text-[var(--text-subtle)] sm:block"
          >
            03 / WORKSPACES
          </motion.span>
        </motion.div>

        <div className="workspace-deck">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              onSelect={handleSelect}
            />
          ))}
        </div>

      </section>
    </main>
  );
}
