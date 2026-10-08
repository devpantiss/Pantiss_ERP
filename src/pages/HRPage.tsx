import { Award, BriefcaseBusiness, CalendarCheck, CalendarDays, LayoutDashboard, Network, Target, UserPlus, Wallet } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { HRDashboard } from "../features/hr/HRDashboard";
import { SalaryApprovalsView, LeaveView } from "../features/hr/ApprovalViews";
import { AttendanceView } from "../features/hr/AttendanceView";
import { OnboardingView, AssignmentView, DesignationsView } from "../features/hr/PeopleViews";
import { PerformanceView } from "../features/hr/PerformanceViews";
import { useHRStore } from "../features/hr/store";
import "../features/cxo/cxo.css";
import "../features/hr/hr.css";

const navigation = [
  { label: "Dashboard", to: "/hr/dashboard", icon: LayoutDashboard },
  { label: "Employee Onboarding", to: "/hr/employee-onboarding", icon: UserPlus },
  { label: "Project Assignment", to: "/hr/project-assignment", icon: Network },
  { label: "Job Designations", to: "/hr/job-designations", icon: BriefcaseBusiness },
  { label: "Salary Approvals", to: "/hr/salary", icon: Wallet },
  { label: "Attendance", to: "/hr/attendance", icon: CalendarCheck },
  { label: "Leave Management", to: "/hr/leave-management", icon: CalendarDays },
  { label: "KBI Metrics", to: "/hr/kbi-metrics", icon: Target },
  { label: "Year-end Appraisals", to: "/hr/appraisals", icon: Award },
];
const descriptions: Record<string, string> = {
  dashboard: "Your people, approvals and priorities, connected in one place.",
  "employee-onboarding": "Welcome employees and prepare their role, deployment and access details.",
  "project-assignment": "Connect each employee to a project and centre in their thematic area.",
  "job-designations": "Define the roles your teams need, organised by thematic area.",
  salary: "Review Admin-approved salaries and release them to Finance.",
  attendance: "Review punch times, live photo evidence and recorded locations from the employee platform.",
  "leave-management": "Track Admin clearance and record HR decisions on employee leave requests.",
  "kbi-metrics": "Employee-wise Key Behavioural Indicators for the annual appraisal cycle.",
  appraisals: "Bring employee KBI assessments into a considered year-end review.",
};
export default function HRPage() {
  const { section = "dashboard" } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user || user.moduleId !== "human-resources" || user.role !== "hr-manager") return <Navigate to="/modules/core-operations" replace />;
  const current = navigation.find(item => item.to === `/hr/${section}`);
  if (!current) return <Navigate to="/hr/dashboard" replace />;
  return <DashboardLayout title={current.label} workspace="Human Resources" workspaceNote="People operations · Demo" userName={user.name} roleLabel={user.roleLabel} initials={user.initials} navigation={navigation} onSignOut={() => { logout(); navigate("/modules/core-operations"); }}><HRWorkspace key={section} section={section} title={current.label} /></DashboardLayout>;
}
function HRWorkspace({ section, title }: { section: string; title: string }) {
  const store = useHRStore();
  return <div className="cxo-page cxo-page--workspace hr-workspace">
    <div className="cxo-dashboard-heading"><div><span className="cxo-eyebrow">People & culture · FY 2026–27</span><h2 className="hr-title">{section === "dashboard" ? "Your people, at a glance." : title}</h2><p>{descriptions[section]}</p></div><span className="cxo-readonly">Demo workspace</span></div>
    {store.notice && <p className="hr-notice" role="status">{store.notice}</p>}{store.error && <p className="hr-error" role="alert">{store.error}</p>}
    {section === "dashboard" && <HRDashboard data={store.data} />}
    {section === "employee-onboarding" && <OnboardingView store={store} />}
    {section === "project-assignment" && <AssignmentView store={store} />}
    {section === "job-designations" && <DesignationsView store={store} />}
    {section === "salary" && <SalaryApprovalsView />}
    {section === "attendance" && <AttendanceView store={store} />}
    {section === "leave-management" && <LeaveView store={store} />}
    {section === "kbi-metrics" && <PerformanceView store={store} mode="kbi" />}
    {section === "appraisals" && <PerformanceView store={store} mode="appraisal" />}
    <p className="cxo-footnote">Demo environment · HR changes are saved in this browser. Admin decisions are sample records. Live attendance, account activation and email delivery need the employee platform connection.</p>
  </div>;
}
