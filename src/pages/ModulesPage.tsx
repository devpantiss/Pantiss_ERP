import { AnimatePresence, motion } from "framer-motion";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { getCategory } from "../data/modules";
import { ModuleCard } from "../components/cards/ModuleCard";
import { Breadcrumb } from "../components/navigation/Breadcrumb";
import { useCategory } from "../hooks/useCategory";
import { WorkspaceRail } from "../components/navigation/WorkspaceRail";
import { LoginDialog } from "../components/auth/LoginDialog";
import type { ModuleItem } from "../types/modules";
import type { AuthUser } from "../app/auth-context";
import { useAuth } from "../hooks/useAuth";

export default function ModulesPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const category = getCategory(categoryId);
  const { selectCategory } = useCategory();
  const [selectedModule, setSelectedModule] = useState<ModuleItem | null>(null);
  const closeLogin = useCallback(() => setSelectedModule(null), []);
  const openModule = useCallback((module: ModuleItem) => {
    if (module.id === "human-resources" && user?.moduleId === module.id) {
      navigate("/hr/dashboard");
      return;
    }
    if (module.id === "finance" && user?.moduleId === module.id) {
      navigate("/finance/dashboard");
      return;
    }
    if (module.id === "monitoring-evaluation") {
      navigate("/monitoring-evaluation");
      return;
    }
    setSelectedModule(module);
  }, [navigate, user]);
  const handleAuthenticated = useCallback((authenticatedUser: AuthUser) => {
    if (selectedModule?.id === "human-resources") navigate("/hr/dashboard");
    if (selectedModule?.id === "finance") {
      navigate("/finance/dashboard");
    }
    if (selectedModule?.id === "monitoring-evaluation") {
      navigate(`/monitoring-evaluation/${authenticatedUser.allowedSections[0]}`);
    }
    setSelectedModule(null);
  }, [navigate, selectedModule]);

  useEffect(() => {
    if (category) selectCategory(category.id);
  }, [category, selectCategory]);

  if (!category) return <Navigate to="/" replace />;

  const Icon = category.icon;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1320px] px-5 pb-16 pt-28 sm:px-8 lg:px-10">
      <div className="grid gap-9 lg:grid-cols-[210px_minmax(0,1fr)] xl:gap-12">
        <WorkspaceRail active={category.id} />
        <section className="min-w-0">
        <Breadcrumb current={category.title} />
        <motion.div
          layoutId={`category-shell-${category.id}`}
          transition={{ type: "spring", stiffness: 150, damping: 24 }}
          className="module-hero relative mb-8 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-card)] sm:p-8"
          style={{ "--card-glow": category.glow } as React.CSSProperties}
        >
          <span className="absolute right-5 top-1/2 hidden -translate-y-1/2 font-mono text-[120px] leading-none tracking-[-0.1em] text-[var(--text)] opacity-[0.025] sm:block">
            {String(categoriesIndex(category.id) + 1).padStart(2, "0")}
          </span>
          <div className={`absolute -right-20 -top-28 size-72 rounded-full bg-gradient-to-br ${category.accent} opacity-[0.07] blur-3xl`} />
          <div className="grid-pattern absolute inset-0 opacity-[0.08] [mask-image:linear-gradient(to_left,black,transparent_65%)]" />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <motion.div
              layoutId={`category-icon-${category.id}`}
              className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${category.accent} text-white shadow-[0_12px_32px_var(--card-glow)]`}
            >
              <Icon size={25} strokeWidth={1.7} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]"
              >
                {category.eyebrow} workspace
              </motion.div>
              <motion.h1
                layoutId={`category-title-${category.id}`}
                className="text-3xl font-semibold tracking-[-0.045em] text-[var(--text)] sm:text-[38px]"
              >
                {category.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mt-2 text-sm text-[var(--text-muted)]"
              >
                {category.description} {category.id === "cxo" ? "Select your executive role to sign in." : "Select an operating module to continue."}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-[10px] font-medium text-[var(--text-subtle)]"
            >
              {category.modules.length} available
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex items-end justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.025em] text-[var(--text)]">
              {category.id === "cxo" ? "Executive monitoring" : "Modules"}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-subtle)]">
              Continue to the workspace you need.
            </p>
          </div>
          <span className="hidden text-[10px] text-[var(--text-subtle)] sm:inline">
            Updated just now
          </span>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {category.modules.map((module, index) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              opensDialog={category.id !== "cxo" && module.id !== "monitoring-evaluation"}
              onSelect={category.id === "cxo" ? module => navigate(`/cxo/${module.id}/login`) : category.id === "core-operations" ? openModule : undefined}
            />
          ))}
        </div>
        </section>
      </div>
      <AnimatePresence>
        {selectedModule && <LoginDialog module={selectedModule} onClose={closeLogin} onSuccess={handleAuthenticated} />}
      </AnimatePresence>
    </main>
  );
}

function categoriesIndex(id: string) {
  const order = ["core-operations", "thematic-areas", "cxo"];
  return order.indexOf(id);
}
