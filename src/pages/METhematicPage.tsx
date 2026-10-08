import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { categories } from "../data/modules";
import { Overlay } from "../components/ui/Overlay";

const thematicIds = ["skill", "livelihood", "entrepreneurship", "nutrition", "health", "sanitation"];
const thematicCards = categories.find(category => category.id === "thematic-areas")!.modules.filter(module => thematicIds.includes(module.id));
const skillUrl = "https://erp-xi-ten.vercel.app/";
const cardClass = "focus-ring group flex min-h-60 flex-col rounded-3xl border border-[var(--border)] bg-[var(--module-bg)] p-6 text-left shadow-[var(--shadow-card)] transition hover:border-[var(--brand-primary)] hover:bg-[var(--surface-soft)]";

export default function METhematicPage() {
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  return <main className="mx-auto min-h-screen w-full max-w-[1180px] px-5 pb-16 pt-28 sm:px-8">
    <Link to="/modules/core-operations" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl text-xs text-[var(--text-muted)]"><ArrowLeft size={16} />Core Operations</Link>
    <header className="mb-8 mt-6">
      <p className="text-xs font-medium text-[var(--brand-primary)]">Monitoring & Evaluation</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">Thematic areas</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">Select a thematic area to continue.</p>
    </header>
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="M&E thematic areas">
      {thematicCards.map(module => {
        const Icon = module.icon;
        const isSkill = module.id === "skill";
        const content = <>
          <div className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-primary)]"><Icon size={23} aria-hidden="true" /></span><span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] text-[var(--text-muted)]">{isSkill ? "Available" : "Coming soon"}</span></div>
          <h2 className="mt-7 text-lg font-semibold text-[var(--text)]">{module.title}</h2>
          <p className="mt-2 flex-1 text-xs leading-5 text-[var(--text-muted)]">{module.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[var(--brand-primary)]">{isSkill ? <>Open Skill workspace<ExternalLink size={14} /><span className="sr-only"> (opens in a new tab)</span></> : <>Coming soon<ArrowUpRight size={14} /></>}</span>
        </>;
        return isSkill ? <a key={module.id} href={skillUrl} target="_blank" rel="noopener noreferrer" className={cardClass}>{content}</a>
          : <button key={module.id} type="button" className={cardClass} onClick={() => setComingSoon(module.title)} aria-haspopup="dialog">{content}</button>;
      })}
    </section>
    {comingSoon && <Overlay open onClose={() => setComingSoon(null)} title={`${comingSoon} · Coming soon`} size="sm" label="Monitoring & Evaluation"><div className="p-6"><Clock3 size={28} className="text-[var(--brand-primary)]" /><p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">The {comingSoon} monitoring workspace is coming soon.</p><button type="button" onClick={() => setComingSoon(null)} className="focus-ring mt-6 min-h-11 rounded-xl border border-[var(--border)] px-4 text-sm text-[var(--text)]">Back to thematic areas</button></div></Overlay>}
  </main>;
}
