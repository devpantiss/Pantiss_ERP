import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { WorkspaceSidebar } from "../features/monitoring-evaluation/WorkspaceSidebar";
import { WorkspaceHeader } from "../features/monitoring-evaluation/WorkspaceHeader";
import { OverviewView } from "../features/monitoring-evaluation/OverviewView";
import { ProjectsView } from "../features/monitoring-evaluation/ProjectsView";
import { ReportsView } from "../features/monitoring-evaluation/ReportsView";
import { EmployeeStatusView } from "../features/monitoring-evaluation/EmployeeStatusView";
import { ProjectRecordView } from "../features/monitoring-evaluation/ProjectRecordView";
import { cn } from "../utils/cn";
import { useAuth } from "../hooks/useAuth";

const sections = ["dashboard", "projects", "reports", "employee-status"] as const;
type Section = typeof sections[number];

export default function MonitoringEvaluationPage() {
  const { section: sectionParam, projectId, centerId } = useParams();
  const section = projectId ? "projects" : (sectionParam ?? "dashboard");
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [section, projectId, centerId]);

  if (!user || user.moduleId !== "monitoring-evaluation") {
    return <Navigate to="/modules/core-operations" replace />;
  }

  if (!sections.includes(section as Section) || !user.allowedSections.includes(section as Section)) {
    return <Navigate to={`/monitoring-evaluation/${user.allowedSections[0]}`} replace />;
  }

  const activeSection = section as Section;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <WorkspaceSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed((value) => !value)}
        onMobileOpen={() => setMobileOpen(true)}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn("min-h-screen transition-[padding] duration-300", collapsed ? "lg:pl-[84px]" : "lg:pl-[248px]")}>
        <WorkspaceHeader section={activeSection} />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.24 }}
            >
              {activeSection === "dashboard" && <OverviewView />}
              {activeSection === "projects" && (projectId ? <ProjectRecordView projectId={projectId} centerId={centerId} /> : <ProjectsView />)}
              {activeSection === "reports" && <ReportsView />}
              {activeSection === "employee-status" && <EmployeeStatusView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
