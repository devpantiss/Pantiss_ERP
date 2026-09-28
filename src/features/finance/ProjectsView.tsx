import { useState, useMemo } from "react";
import {
  FolderKanban,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ArrowUpRight,
  Download,
  DollarSign,
  TrendingUp,
  FileCheck,
  ChevronRight
} from "lucide-react";
import { financeAreas, formatCurrency, type FinanceProject } from "./data";
import { cn } from "../../utils/cn";
import { Overlay } from "../../components/ui/Overlay";

export function ProjectsView() {
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedDonor, setSelectedDonor] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<FinanceProject | null>(null);

  // Flatten all projects
  const allProjects = useMemo(() => {
    return financeAreas.flatMap((area) =>
      area.projects.map((p) => ({ ...p, areaName: area.name, areaColor: area.color }))
    );
  }, []);

  const donors = useMemo(() => {
    return ["all", ...new Set(allProjects.map((p) => p.donor))];
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchArea = selectedArea === "all" || p.areaId === selectedArea;
      const matchDonor = selectedDonor === "all" || p.donor === selectedDonor;
      const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.donor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchArea && matchDonor && matchStatus && matchSearch;
    });
  }, [allProjects, selectedArea, selectedDonor, selectedStatus, searchQuery]);

  const summary = useMemo(() => {
    const approved = filteredProjects.reduce((acc, curr) => acc + curr.approved, 0);
    const released = filteredProjects.reduce((acc, curr) => acc + curr.released, 0);
    const spent = filteredProjects.reduce((acc, curr) => acc + curr.spent, 0);
    const committed = filteredProjects.reduce((acc, curr) => acc + curr.committed, 0);
    const avgUtil =
      filteredProjects.length > 0
        ? Math.round(
            filteredProjects.reduce((acc, curr) => acc + curr.utilization, 0) /
              filteredProjects.length
          )
        : 0;
    return { approved, released, spent, committed, avgUtil };
  }, [filteredProjects]);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-24 size-72 rounded-full border border-white/10" />
        <div className="absolute right-24 top-12 size-36 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]">
              <FolderKanban size={13} /> Project Financial Portfolios
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Project Grant Allocations & Burn Analysis
            </h2>
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-white/70 sm:text-sm">
              Comprehensive financial oversight for all 44 active programs across 6 states. Track donor releases, burn rates, advance settlements, and utilization certificates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => alert("Consolidated Project Financials Master Report (Excel) exported.")}
              className="focus-ring inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-semibold text-emerald-900 shadow-md transition hover:bg-emerald-50"
            >
              <Download size={14} /> Export Portfolio Report
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FolderKanban size={18} />
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
              {filteredProjects.length} Projects
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(summary.approved, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Total Approved Grant Budget</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Combined donor grant allocations</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <DollarSign size={18} />
            </span>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
              Released
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {formatCurrency(summary.released, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Donor Funds Received</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Tranches cleared into designated escrow</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <TrendingUp size={18} />
            </span>
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
              Disbursed
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.spent, true)}
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Verified Project Expenditure</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Audited against payment vouchers</p>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500/10 text-teal-600">
              <FileCheck size={18} />
            </span>
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold text-teal-600">
              Average
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold tracking-tight text-[var(--text)]">
            {summary.avgUtil}%
          </p>
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">Portfolio Grant Burn Rate</p>
          <p className="mt-2 text-[10px] text-[var(--text-subtle)]">Utilization against approved envelope</p>
        </article>
      </section>

      {/* Filter and Project List */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--module-bg)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <FolderKanban size={17} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">Project Financial Register</h3>
              <p className="text-[10px] text-[var(--text-subtle)]">
                Showing {filteredProjects.length} of {allProjects.length} projects
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search project, donor, state..."
                className="focus-ring h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none"
              />
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Thematic Areas</option>
              {financeAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <select
              value={selectedDonor}
              onChange={(e) => setSelectedDonor(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Donors</option>
              {donors.slice(1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="focus-ring h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text)] outline-none"
            >
              <option value="all">All Status</option>
              <option value="On track">On track</option>
              <option value="Watch">Watch</option>
              <option value="Action required">Action required</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5 transition-all hover:border-emerald-500/30 hover:shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[8px] font-bold text-white"
                      style={{ background: p.areaColor }}
                    >
                      {p.areaName}
                    </span>
                    <h4 className="mt-2 truncate text-sm font-bold text-[var(--text)]">{p.name}</h4>
                    <p className="text-[10px] text-[var(--text-subtle)]">
                      {p.id} · {p.donor} ({p.location})
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[8px] font-semibold",
                      p.status === "On track"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : p.status === "Watch"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[var(--module-bg)] p-3 text-[10px]">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Approved</span>
                    <p className="font-bold text-[var(--text)]">{formatCurrency(p.approved, true)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Released</span>
                    <p className="font-bold text-[var(--text)]">{formatCurrency(p.released, true)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Spent</span>
                    <p className="font-bold text-emerald-600">{formatCurrency(p.spent, true)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Committed</span>
                    <p className="font-bold text-[var(--text-muted)]">{formatCurrency(p.committed, true)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--text-subtle)]">Grant Burn Rate</span>
                    <span className="font-bold text-[var(--text)]">{p.utilization}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.utilization}%`, background: p.areaColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4 text-[10px]">
                <span className="text-[var(--text-subtle)]">Last Voucher: {p.lastVoucherDate}</span>
                <button
                  type="button"
                  onClick={() => setSelectedProject(p)}
                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--module-bg)] px-3 py-1.5 text-[10px] font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]"
                >
                  View Details <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Details Overlay */}
      {selectedProject && (
        <Overlay
          open
          onClose={() => setSelectedProject(null)}
          variant="panel"
          size="lg"
          zIndex={75}
          label="Project Financial Profile"
          title={selectedProject.name}
          description={`${selectedProject.id} · Donor: ${selectedProject.donor} · Location: ${selectedProject.location}`}
          footer={
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="focus-ring h-10 rounded-xl bg-[var(--brand-primary)] px-5 text-xs font-semibold text-white ml-auto"
            >
              Close Dossier
            </button>
          }
        >
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Approved</span>
                <p className="mt-1 text-sm font-bold text-[var(--text)]">
                  {formatCurrency(selectedProject.approved, true)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Released</span>
                <p className="mt-1 text-sm font-bold text-blue-600">
                  {formatCurrency(selectedProject.released, true)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Spent</span>
                <p className="mt-1 text-sm font-bold text-emerald-600">
                  {formatCurrency(selectedProject.spent, true)}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                <span className="text-[9px] uppercase tracking-wider text-[var(--text-subtle)]">Utilization</span>
                <p className="mt-1 text-sm font-bold text-[var(--text)]">
                  {selectedProject.utilization}%
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] p-4 space-y-2">
              <h4 className="text-xs font-bold text-[var(--text)]">Utilization Certificate (UC) Status</h4>
              <p className="text-xs text-[var(--text-muted)]">
                Form GFR-12A certified for Tranche 1 expenditure. Next quarterly submission due within 45 days of tranche exhaust.
              </p>
              <div className="mt-3 flex items-center justify-between text-xs border-t border-[var(--border)] pt-3">
                <span className="text-[var(--text-subtle)]">Last Voucher Audit:</span>
                <span className="font-semibold text-[var(--text)]">{selectedProject.lastVoucherDate}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-subtle)]">Pending Field Advances:</span>
                <span className="font-semibold text-[var(--text)]">{formatCurrency(selectedProject.pendingAdvances, true)}</span>
              </div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
