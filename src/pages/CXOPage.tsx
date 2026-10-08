import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, ArrowLeft, ArrowUpRight, Check, Eye, EyeOff, FolderKanban, LayoutDashboard, LockKeyhole, Search, ShieldCheck, Users } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { demoAccounts } from "../app/auth-context";
import { useAuth } from "../hooks/useAuth";
import { Overlay } from "../components/ui/Overlay";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { executiveRoles, getMonitoringData, isExecutiveRole, type ExecutiveRole, type MonitorRecord } from "../features/cxo/monitoringData";
import "../features/cxo/cxo.css";

export default function CXOPage() {
  const { role, view } = useParams();
  const { user } = useAuth();
  if (!isExecutiveRole(role) || !["login", "dashboard"].includes(view ?? "")) return <Navigate to="/modules/cxo" replace />;
  if (view === "login") return <ExecutiveLogin key={role} role={role} />;
  if (user?.moduleId !== "cxo" || user.role !== role) return <Navigate to={`/cxo/${role}/login`} replace />;
  return <ExecutiveDashboard key={role} role={role} />;
}

function ExecutiveLogin({ role }: { role: ExecutiveRole }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const account = demoAccounts.find(a => a.moduleId === "cxo" && a.role === role)!;
  const config = executiveRoles[role];
  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (email.trim().toLowerCase() !== account.id || password !== account.password) {
      setError(`Use the ${role.toUpperCase()} demo credentials shown below.`);
      return;
    }
    if (login(email, password, false)) navigate(`/cxo/${role}/dashboard`, { replace: true });
  }
  return <main className="cxo-page cxo-login">
    <Link to="/modules/cxo" className="cxo-back focus-ring"><ArrowLeft size={16} />All executive roles</Link>
    <div className="cxo-login-layout">
      <section className="cxo-login-intro">
        <span className="cxo-eyebrow">CXO / {config.focus}</span>
        <h1>{config.heading}</h1>
        <p>{config.description}</p>
        <div className="cxo-access"><ShieldCheck size={20} /><div><strong>Monitoring access</strong><span>Read-only visibility into performance and exceptions.</span></div></div>
      </section>
      <section className="cxo-panel cxo-signin" aria-labelledby="cxo-signin-title">
        <span className="cxo-role-mark">{role.toUpperCase()}</span>
        <h2 id="cxo-signin-title">Sign in as {role.toUpperCase()}</h2>
        <p>{config.title}</p>
        <form onSubmit={submit} className="cxo-form">
          <label htmlFor="cxo-email">Email address</label>
          <input id="cxo-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder={`${role}@pantiss.org`} aria-invalid={Boolean(error)} aria-describedby={error ? "cxo-login-error" : undefined} />
          <label htmlFor="cxo-password">Password</label>
          <div className="cxo-password">
            <input id="cxo-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? "cxo-login-error" : undefined} />
            <button type="button" className="focus-ring" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          {error && <p id="cxo-login-error" role="alert" className="cxo-error">{error}</p>}
          <button className="cxo-primary focus-ring" type="submit">Open monitoring dashboard<ArrowUpRight size={16} /></button>
        </form>
        <div className="cxo-demo"><strong>Demo credentials</strong><span>{account.id}</span><span>Password: <code>{account.password}</code></span><button type="button" className="cxo-button focus-ring" onClick={() => { setEmail(account.id); setPassword(account.password); setError(""); }}>Fill demo credentials</button></div>
        <p className="cxo-footnote">Demo environment · Sample data · No production authentication</p>
      </section>
    </div>
  </main>;
}

function Progress({ value, label }: { value: number; label: string }) {
  return <div className="cxo-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

function ExecutiveDashboard({ role }: { role: ExecutiveRole }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const config = executiveRoles[role];
  const base = `/cxo/${role}/dashboard`;

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hash]);
  const data = getMonitoringData(role);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<MonitorRecord | null>(null);
  const filtered = data.records.filter(r => (area === "all" || r.area === area) && (status === "all" || r.status === status) && `${r.name} ${r.id} ${r.owner}`.toLowerCase().includes(query.toLowerCase()));
  return <DashboardLayout
    title={`${role.toUpperCase()} monitoring dashboard`}
    workspace={`CXO · ${config.focus}`}
    userName={user?.name ?? config.title}
    roleLabel={user?.roleLabel ?? config.title}
    initials={role.toUpperCase()}
    navigation={[
      { label: "Dashboard", to: base, icon: LayoutDashboard },
      { label: role === "coo" ? "Reporting follow-up" : "Attention required", to: `${base}#attention`, icon: AlertTriangle },
      { label: role === "cfo" ? "Financial portfolio" : role === "coo" ? "Delivery monitor" : "Program portfolio", to: `${base}#portfolio`, icon: FolderKanban },
      { label: "Executive roles", to: "/modules/cxo", icon: Users },
    ]}
    onSignOut={() => { logout(); navigate(`/cxo/${role}/login`, { replace: true }); }}
  >
  <div className="cxo-page cxo-page--workspace">
    <header className="cxo-dashboard-heading">
      <div><span className="cxo-eyebrow">{config.title}</span><p>{config.description}</p></div>
      <span className="cxo-readonly"><LockKeyhole size={14} />Read-only · Demo</span>
    </header>
    <section className="cxo-metrics" aria-label="Key performance indicators">
      {data.metrics.map((m, i) => <article className="cxo-panel cxo-metric" key={m.label}><span className="cxo-metric-index">0{i + 1}</span><h2>{m.label}</h2><p>{m.value}</p><span>{m.note}</span></article>)}
    </section>
    <div className="cxo-insights">
      <section className="cxo-panel cxo-chart" aria-labelledby="cxo-chart-title">
        <div className="cxo-section-heading"><h2 id="cxo-chart-title">{role === "cfo" ? "Budget utilization" : role === "coo" ? "Delivery by thematic area" : "Strategic program progress"}</h2><span>{role === "cfo" ? "Spent / approved" : "Reported progress"}</span></div>
        <div className="cxo-bars">{data.bars.map(b => <div className="cxo-bar-row" key={b.name}><span>{b.name}</span><Progress label={b.name} value={b.value} /><strong>{b.value}%</strong></div>)}</div>
      </section>
      <section id="attention" className="cxo-panel cxo-priorities" aria-labelledby="cxo-priority-title">
        <div className="cxo-section-heading"><h2 id="cxo-priority-title">{role === "coo" ? "Reporting follow-up" : "Attention required"}</h2><span>{data.priorities.length} items</span></div>
        <div className="cxo-priority-list">{data.priorities.length ? data.priorities.map((p, i) => <article key={`${p.title}-${i}`}><span className="cxo-status" data-attention="true">{p.status}</span><h3>{p.title}</h3><p>{p.detail}</p></article>) : <p className="cxo-empty"><Check size={20} />No open exceptions in this sample.</p>}</div>
      </section>
    </div>
    <section id="portfolio" className="cxo-panel cxo-register" aria-labelledby="cxo-register-title">
      <div className="cxo-section-heading"><div><h2 id="cxo-register-title">{role === "cfo" ? "Financial portfolio" : role === "coo" ? "Delivery monitor" : "Program portfolio"}</h2><p>Select a project to inspect its monitoring summary.</p></div><span aria-live="polite">{filtered.length} of {data.records.length} projects</span></div>
      <div className="cxo-filters">
        <label className="cxo-search"><Search size={16} /><span className="sr-only">Search projects</span><input type="search" placeholder="Search project or owner" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label><span className="sr-only">Filter thematic area</span><select value={area} onChange={e => setArea(e.target.value)}><option value="all">All thematic areas</option>{[...new Set(data.records.map(r => r.area))].map(a => <option key={a}>{a}</option>)}</select></label>
        <label><span className="sr-only">Filter status</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">All statuses</option>{[...new Set(data.records.map(r => r.status))].map(s => <option key={s}>{s}</option>)}</select></label>
      </div>
      <div className="cxo-table-scroll"><table><thead><tr><th scope="col">Project</th><th scope="col">{role === "cfo" ? "Donor" : "Project lead"}</th><th scope="col">{role === "cfo" ? "Utilization" : "Delivery"}</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Details</span></th></tr></thead><tbody>{filtered.map(r => <tr key={r.id}><td><strong>{r.name}</strong><span>{r.id} · {r.area}</span></td><td>{r.owner}</td><td><div className="cxo-table-progress"><Progress value={r.progress} label={`${r.name} progress`} /><span>{r.progress}%</span></div></td><td><span className="cxo-status" data-attention={!["On track", "Completed"].includes(r.status)}>{r.status}</span></td><td><button className="cxo-button focus-ring" aria-label={`View ${r.name}`} onClick={() => setSelected(r)}>View<ArrowUpRight size={14} /></button></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="cxo-empty"><p>No projects match these filters.</p><button className="cxo-button focus-ring" onClick={() => { setQuery(""); setArea("all"); setStatus("all"); }}>Clear filters</button></div>}
    </section>
    <p className="cxo-footnote">Demo monitoring snapshot · Finance and M&E use their existing sample datasets with different project coverage. Figures are cumulative and are not live feeds.</p>
    {selected && <Overlay open onClose={() => setSelected(null)} title={selected?.name} label={`${role.toUpperCase()} · Monitoring summary`} description={selected ? `${selected.id} · ${selected.area}` : undefined}>
      {selected && <div className="cxo-detail"><span className="cxo-readonly"><LockKeyhole size={14} />Read-only</span><p>{selected.detail}</p><Progress value={selected.progress} label="Project progress" /><p>{selected.progress}% {role === "cfo" ? "budget utilized" : "complete"} · {selected.status}</p><dl>{selected.facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl></div>}
    </Overlay>}
  </div>
  </DashboardLayout>;
}
