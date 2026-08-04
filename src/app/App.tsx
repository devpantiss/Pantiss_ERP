import { lazy, Suspense, useCallback, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import { AmbientBackground } from "../components/animations/AmbientBackground";
import { PageLoader } from "../components/animations/PageLoader";
import { TopNavigation } from "../components/layout/TopNavigation";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const ModulesPage = lazy(() => import("../pages/ModulesPage"));
const MonitoringEvaluationPage = lazy(() => import("../pages/MonitoringEvaluationPage"));
const FinancePage = lazy(() => import("../pages/FinancePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

function RouteFallback() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="size-5 animate-spin rounded-full border-2 border-red-500/20 border-t-red-500" aria-label="Loading page" />
    </div>
  );
}

export function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const isEnterpriseWorkspace = location.pathname.startsWith("/monitoring-evaluation") || location.pathname.startsWith("/finance");

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const completeLoading = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <AmbientBackground />
      <AnimatePresence>{loading && <PageLoader onComplete={completeLoading} />}</AnimatePresence>
      {!loading && (
        <>
          {!isEnterpriseWorkspace && <TopNavigation />}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<RouteFallback />}>
                <Routes location={location}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/modules/:categoryId" element={<ModulesPage />} />
                  <Route path="/monitoring-evaluation/:section?" element={<MonitoringEvaluationPage />} />
                  <Route path="/monitoring-evaluation/projects/:projectId" element={<MonitoringEvaluationPage />} />
                  <Route path="/monitoring-evaluation/projects/:projectId/centers/:centerId" element={<MonitoringEvaluationPage />} />
                  <Route path="/finance/:areaId?" element={<FinancePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </>
  );
}
