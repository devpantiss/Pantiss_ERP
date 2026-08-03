import { Bell, CalendarDays, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../hooks/useAuth";

const titles: Record<string, { eyebrow: string; title: string }> = {
  dashboard: { eyebrow: "Monitoring & Evaluation", title: "Overall dashboard" },
  projects: { eyebrow: "Portfolio management", title: "Projects" },
  reports: { eyebrow: "Reporting centre", title: "Reports" },
  "employee-status": { eyebrow: "People & performance", title: "Employee monthly status" },
};

export function WorkspaceHeader({ section }: { section: string }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const current = titles[section] ?? titles.dashboard;

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/88 px-4 backdrop-blur-2xl sm:px-7 lg:px-8">
      <div className="min-w-0 pl-12 lg:pl-0">
        <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-red-500">{current.eyebrow}</p>
        <h1 className="mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-xl">{current.title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <label className="relative hidden md:block">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input type="search" placeholder="Search workspace" className="focus-ring h-10 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--text-ghost)]" />
        </label>
        <button type="button" className="focus-ring hidden h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 text-xs text-[var(--text-muted)] sm:flex">
          <CalendarDays size={15} /><span>Jul 2026</span><ChevronDown size={13} />
        </button>
        <button type="button" onClick={toggleTheme} className="focus-ring grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]" aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}>
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button type="button" className="focus-ring relative grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-muted)]" aria-label="Notifications">
          <Bell size={17} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500 ring-2 ring-[var(--background)]" />
        </button>
        <button type="button" className="focus-ring grid size-10 place-items-center rounded-xl bg-gradient-to-br from-red-600 to-rose-400 text-[10px] font-semibold text-white" aria-label={`Open ${user?.roleLabel ?? "user"} profile`}>{user?.initials ?? "--"}</button>
      </div>
    </header>
  );
}
