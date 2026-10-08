import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Mail,
  Plus,
  Printer,
  Search,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Overlay } from "../../components/ui/Overlay";
import { useAuth } from "../../hooks/useAuth";
import { financeAreas } from "../finance/data";
import {
  annualFromMonthly,
  monthlyFromAnnual,
  onboardCandidateFromOffer,
  releaseOfferLetter,
  saveCandidate,
  saveJobPosting,
  scheduleInterview,
  submitInterviewFeedback,
  updateCandidateStage,
  updateOfferStatus,
  type Candidate,
  type CandidateStage,
  type Interview,
  type InterviewMode,
  type InterviewRound,
  type JobPosting,
  type OfferLetter,
  type OfferStatus,
} from "./model";
import type { HRStore } from "./store";
import {
  areaName,
  dateLabel,
  dateTimeLabel,
  Filters,
  Metric,
  Register,
  rupees,
  SalarySummary,
  Status,
} from "./components";

/* ── Helpers ──────────────────────────────────────────────────────────── */
function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}
function urgencyLabel(days: number): { label: string; tone: "ok" | "warn" | "danger" } {
  if (days < 0) return { label: "Closed", tone: "danger" };
  if (days <= 5) return { label: `${days}d left`, tone: "danger" };
  if (days <= 14) return { label: `${days}d left`, tone: "warn" };
  return { label: `${days}d left`, tone: "ok" };
}

/** Stagger index → CSS animation delay so each card animates in sequence. */
function animDelay(i: number) { return { animationDelay: `${i * 40}ms` }; }

const STAGES: CandidateStage[] = [
  "Applied",
  "Screening",
  "Interview Scheduled",
  "Technical Round",
  "HR Round",
  "Selected",
  "Offer Released",
  "Offer Accepted",
  "Onboarded",
  "Rejected",
];

const INTERVIEW_ROUNDS: InterviewRound[] = [
  "Initial Screening",
  "Technical Assessment",
  "Thematic Panel",
  "HR & Cultural Fit",
  "Final Leadership",
];

const INTERVIEW_MODES: InterviewMode[] = [
  "Google Meet",
  "In-Person (HQ)",
  "Phone Screen",
  "Microsoft Teams",
];

/* Stages visible in "Interview Schedule" section */
const INTERVIEW_STAGES: CandidateStage[] = [
  "Screening",
  "Interview Scheduled",
  "Technical Round",
  "HR Round",
];

/* =========================================================================
   MAIN RECRUITMENT VIEW
   ========================================================================= */

/* Pipeline funnel stages shown across the top */
const FUNNEL_STAGES: { stage: CandidateStage; label: string; color: string }[] = [
  { stage: "Applied",            label: "Applied",     color: "var(--brand-primary)" },
  { stage: "Screening",          label: "Shortlisted", color: "#f59e0b" },
  { stage: "Interview Scheduled",label: "Interviews",  color: "#8b5cf6" },
  { stage: "Selected",           label: "Selected",    color: "#06b6d4" },
  { stage: "Offer Released",     label: "Offered",     color: "#10b981" },
  { stage: "Onboarded",          label: "Onboarded",   color: "#059669" },
];

export function RecruitmentView({ store }: { store: HRStore }) {
  const [tab, setTab] = useState<"jobs" | "interviews" | "offers" | "applicants">("jobs");

  const totalOpenings = store.data.jobPostings
    .filter(j => j.status === "Active")
    .reduce((sum, j) => sum + j.openings, 0);

  const activeCandidates = store.data.candidates.filter(c => c.stage !== "Rejected" && c.stage !== "Onboarded").length;
  const scheduledInterviews = store.data.interviews.filter(i => i.status === "Scheduled").length;
  const offersInPlay = store.data.offerLetters.filter(o => o.status === "Released" || o.status === "Accepted").length;
  const total = store.data.candidates.length || 1;

  return (
    <>
      {/* ── Page header: compact, purpose-first ─────────────────── */}
      <div className="rec-header">
        <div className="rec-header-left">
          <h2 className="rec-page-title">
            <UserCheck size={18} /> Recruitment &amp; Hiring
          </h2>
          <p className="rec-page-sub">
            {store.data.jobPostings.filter(j => j.status === "Active").length} active roles ·&nbsp;
            {activeCandidates} in pipeline ·&nbsp;
            {scheduledInterviews} interviews pending
          </p>
        </div>
        <div className="rec-header-right">
          <span className="rec-header-stat">
            <TrendingUp size={13} />
            {store.data.offerLetters.filter(o => o.status === "Onboarded").length} onboarded this cycle
          </span>
        </div>
      </div>

      {/* ── Pipeline funnel bar ──────────────────────────────────── */}
      <div className="rec-funnel" aria-label="Hiring pipeline overview">
        {FUNNEL_STAGES.map(({ stage, label, color }) => {
          const count = store.data.candidates.filter(c =>
            stage === "Interview Scheduled"
              ? INTERVIEW_STAGES.includes(c.stage)
              : c.stage === stage
          ).length;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={stage} className="rec-funnel-step">
              <div className="rec-funnel-bar-wrap">
                <div
                  className="rec-funnel-bar"
                  style={{ height: `${Math.max(4, pct * 2)}px`, background: color }}
                  role="img"
                  aria-label={`${label}: ${count}`}
                />
              </div>
              <span className="rec-funnel-count" style={{ color }}>{count}</span>
              <span className="rec-funnel-label">{label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Metrics row ─────────────────────────────────────────── */}
      <div className="cxo-metrics">
        <Metric
          label="Active Job Openings"
          value={store.data.jobPostings.filter(j => j.status === "Active").length}
          detail={`${totalOpenings} open positions across projects`}
        />
        <Metric
          label="Candidates in Pipeline"
          value={activeCandidates}
          detail={`${store.data.candidates.length} total applicants tracked`}
        />
        <Metric
          label="Interviews Pending"
          value={scheduledInterviews}
          detail={`${store.data.interviews.filter(i => i.status === "Completed").length} rounds completed`}
        />
        <Metric
          label="Offers in Play"
          value={offersInPlay}
          detail={`${store.data.offerLetters.filter(o => o.status === "Accepted").length} accepted · ${store.data.offerLetters.filter(o => o.status === "Onboarded").length} onboarded`}
        />
      </div>

      {/* ── Section tabs ────────────────────────────────────────── */}
      <div className="hr-tabs" role="tablist" aria-label="Recruitment workflow steps">
        <button type="button" role="tab" aria-selected={tab === "jobs"}
          className="hr-tab focus-ring" onClick={() => setTab("jobs")}>
          <Briefcase size={14} /> Job Postings
          <span className="hr-tab-badge">{store.data.jobPostings.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "interviews"}
          className="hr-tab focus-ring" onClick={() => setTab("interviews")}>
          <CalendarClock size={14} /> Interviews
          <span className="hr-tab-badge">{store.data.candidates.filter(c => INTERVIEW_STAGES.includes(c.stage)).length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "offers"}
          className="hr-tab focus-ring" onClick={() => setTab("offers")}>
          <FileCheck size={14} /> Offers &amp; Selection
          <span className="hr-tab-badge">{store.data.offerLetters.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === "applicants"}
          className="hr-tab focus-ring" onClick={() => setTab("applicants")}>
          <Users size={14} /> All Applicants (ATS)
          <span className="hr-tab-badge">{store.data.candidates.length}</span>
        </button>
      </div>

      {tab === "jobs"       && <JobPostingsSection store={store} />}
      {tab === "interviews" && <InterviewScheduleSection store={store} />}
      {tab === "offers"     && <OfferLettersSection store={store} />}
      {tab === "applicants" && <ApplicantsSection store={store} />}
    </>
  );
}

/* =========================================================================
   SHARED: JOB CARD — dense, scannable, urgency-aware
   ========================================================================= */

function JobCard({
  job,
  store,
  isSelected,
  onClick,
  badge,
  badgeColor,
  animIndex = 0,
}: {
  job: JobPosting;
  store: HRStore;
  isSelected: boolean;
  onClick: () => void;
  badge?: number;
  badgeColor?: "green" | "amber" | "blue";
  animIndex?: number;
}) {
  const applicantCount = store.data.candidates.filter(c => c.jobId === job.id).length;
  const days = daysUntil(job.closingDate);
  const urgency = urgencyLabel(days);
  const shortlisted = store.data.candidates.filter(c => c.jobId === job.id && c.stage !== "Applied" && c.stage !== "Rejected").length;

  return (
    <button
      type="button"
      className={`hr-job-card focus-ring rec-card-enter${isSelected ? " hr-job-card--selected" : ""}`}
      style={animDelay(animIndex)}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      {/* Top row: area tag + urgency + status */}
      <div className="hr-job-card-header">
        <span className="hr-role-tag" style={{ fontSize: "9px", padding: "3px 7px", lineHeight: 1.4 }}>
          {areaName(job.areaId)}
        </span>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {job.status === "Active" && (
            <span
              className="rec-urgency-tag"
              data-tone={urgency.tone}
              title={`Closes ${dateLabel(job.closingDate)}`}
            >
              {urgency.tone === "danger" && <AlertTriangle size={9} />}
              {urgency.label}
            </span>
          )}
          {badge !== undefined && badge > 0 && (
            <span
              className="hr-tab-badge"
              style={{
                background: badgeColor === "green" ? "var(--hr-success-soft)" : badgeColor === "amber" ? "var(--hr-warning-soft)" : undefined,
                color: badgeColor === "green" ? "var(--hr-success)" : badgeColor === "amber" ? "var(--hr-warning)" : undefined,
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Title + meta */}
      <div style={{ textAlign: "left" }}>
        <div className="hr-job-card-title">{job.title}</div>
        <div className="hr-job-card-meta">
          <span><Building2 size={10} />{job.location}</span>
          <span><Clock size={10} />{job.experience}</span>
          <span><Users size={10} />{job.openings} vacanc{job.openings > 1 ? "ies" : "y"}</span>
        </div>
      </div>

      {/* Mini pipeline strip */}
      <div className="rec-card-pipeline">
        <span className="rec-card-pip" title="Applied">{applicantCount}<small>applied</small></span>
        <ChevronRight size={9} style={{ color: "var(--border-strong)", flexShrink: 0 }} />
        <span className="rec-card-pip" title="In progress">{shortlisted}<small>active</small></span>
        <ChevronRight size={9} style={{ color: "var(--border-strong)", flexShrink: 0 }} />
        <span className="rec-card-pip" title="Onboarded">
          {store.data.candidates.filter(c => c.jobId === job.id && c.stage === "Onboarded").length}<small>onboarded</small>
        </span>
      </div>

      {/* Footer: salary + CTA */}
      <div className="hr-job-card-footer">
        <span className="hr-num" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {rupees(job.minSalary / 12)}–{rupees(job.maxSalary / 12)}<small>/mo</small>
        </span>
        <span className="rec-card-cta">
          View <ChevronRight size={11} />
        </span>
      </div>
    </button>
  );
}

/* =========================================================================
   2. JOB POSTINGS SECTION — Card Grid + Applicants Panel
   ========================================================================= */

function JobPostingsSection({ store }: { store: HRStore }) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    store.data.jobPostings[0]?.id ?? null
  );
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [applicantSearch, setApplicantSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | "Applied" | "Shortlisted">("all");
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedJob = store.data.jobPostings.find(j => j.id === selectedJobId) ?? null;
  const jobApplicants = useMemo(
    () => store.data.candidates.filter(c => c.jobId === selectedJobId),
    [store.data.candidates, selectedJobId]
  );

  const filteredApplicants = useMemo(() => {
    let list = jobApplicants;
    if (stageFilter === "Applied") list = list.filter(c => c.stage === "Applied");
    if (stageFilter === "Shortlisted") list = list.filter(c => c.stage !== "Applied" && c.stage !== "Rejected");
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.currentCompany ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [jobApplicants, stageFilter, applicantSearch]);

  function startCreate() {
    setEditingJob({
      id: `JOB-2026-0${store.data.jobPostings.length + 1}`,
      title: "",
      areaId: "skill-development",
      department: "Field Operations",
      location: "Bhubaneswar HQ",
      experience: "2–4 Years",
      openings: 1,
      minSalary: 420000,
      maxSalary: 600000,
      status: "Active",
      postedDate: new Date().toISOString().slice(0, 10),
      closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      description: "",
      requirements: [],
    });
    setIsCreating(true);
  }

  function handleShortlist(candidate: Candidate) {
    store.commit(
      state => updateCandidateStage(state, candidate.id, "Screening"),
      `${candidate.name} shortlisted for interview scheduling.`
    );
  }


  return (
    <>
      {/* Section header */}
      <div className="cxo-panel cxo-register hr-register">
        <div className="cxo-section-heading">
          <div>
            <h2>Job Requisitions &amp; Openings</h2>
            <p>Select a job card to view applicants, review resumes, and shortlist candidates.</p>
          </div>
          <button className="hr-primary focus-ring" onClick={startCreate}>
            <Plus size={15} /> Post New Role
          </button>
        </div>
      </div>

      <div className="hr-recruitment-layout">
        {/* Left: Job Cards with staggered animation */}
        <div className="hr-recruitment-cards">
          {store.data.jobPostings.length === 0 ? (
            <div className="hr-empty-panel" style={{ minHeight: 200 }}>
              <Briefcase size={28} />
              <p>No job postings yet.</p>
              <button className="cxo-button focus-ring" onClick={startCreate}>Post your first role</button>
            </div>
          ) : (
            store.data.jobPostings.map((job, idx) => {
              const applicantCount = store.data.candidates.filter(c => c.jobId === job.id).length;
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  store={store}
                  isSelected={selectedJobId === job.id}
                  onClick={() => { setSelectedJobId(job.id); setApplicantSearch(""); setStageFilter("all"); }}
                  badge={applicantCount}
                  badgeColor="blue"
                  animIndex={idx}
                />
              );
            })
          )}
        </div>


        {/* Right: Job Detail + Applicants Panel */}
        {selectedJob ? (
          <div className="hr-recruitment-panel rec-panel-enter">
            {/* Job Detail Header */}
            <div className="hr-panel-job-header">
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span className="hr-role-tag" style={{ fontSize: "11px" }}>{areaName(selectedJob.areaId)}</span>
                  <Status>{selectedJob.status}</Status>
                  {(() => {
                    const d = daysUntil(selectedJob.closingDate);
                    const u = urgencyLabel(d);
                    return (
                      <span className="rec-urgency-tag" data-tone={u.tone}>
                        <CalendarClock size={10} /> Closes {dateLabel(selectedJob.closingDate)} &middot; {u.label}
                      </span>
                    );
                  })()}
                </div>
                <h3 className="hr-panel-job-title">{selectedJob.title}</h3>
                <div className="hr-job-card-meta" style={{ marginTop: "8px" }}>
                  <span><Building2 size={12} />{selectedJob.location}</span>
                  <span><Clock size={12} />{selectedJob.experience}</span>
                  <span><Users size={12} />{selectedJob.openings} vacanc{selectedJob.openings > 1 ? "ies" : "y"}</span>
                </div>
              </div>
              <button
                className="cxo-button focus-ring"
                style={{ whiteSpace: "nowrap", alignSelf: "flex-start" }}
                onClick={() => { setEditingJob(selectedJob); setIsCreating(false); }}
              >
                Edit Posting
              </button>
            </div>

            {/* Salary Band */}
            <div className="hr-salary" style={{ margin: "0" }}>
              <header>
                <span>Salary Band (Annual CTC)</span>
                <small>{selectedJob.department}</small>
              </header>
              <dl>
                <div><dt>Min Annual</dt><dd>{rupees(selectedJob.minSalary)}</dd></div>
                <div><dt>Max Annual</dt><dd>{rupees(selectedJob.maxSalary)}</dd></div>
                <div><dt>Min Monthly</dt><dd>{rupees(selectedJob.minSalary / 12)}</dd></div>
                <div><dt>Max Monthly</dt><dd>{rupees(selectedJob.maxSalary / 12)}</dd></div>
              </dl>
            </div>

            {/* Description + Requirements */}
            {(selectedJob.description || selectedJob.requirements.length > 0) && (
              <div>
                <p className="hr-description" style={{ marginBottom: "10px" }}>{selectedJob.description}</p>
                {selectedJob.requirements.length > 0 && (
                  <ul className="hr-requirements-list">
                    {selectedJob.requirements.map((req, i) => (<li key={i}>{req}</li>))}
                  </ul>
                )}
              </div>
            )}

            {/* Applicants header + search/filter */}
            <div>
              <div className="hr-panel-section-head" style={{ marginBottom: 10 }}>
                <h4>Applicants <span>({jobApplicants.length})</span></h4>
                <button
                  className="hr-primary focus-ring"
                  style={{ minHeight: "34px", padding: "6px 14px", fontSize: "11px" }}
                  onClick={() => setShowAddCandidate(true)}
                >
                  <Plus size={13} /> Add Applicant
                </button>
              </div>

              {/* Search & filter bar */}
              {jobApplicants.length > 0 && (
                <div className="rec-search-bar">
                  <label className="rec-search-field">
                    <Search size={13} />
                    <input
                      ref={searchRef}
                      type="text"
                      placeholder="Search applicants by name, email, company…"
                      value={applicantSearch}
                      onChange={e => setApplicantSearch(e.target.value)}
                      className="focus-ring"
                    />
                    {applicantSearch && (
                      <button type="button" className="rec-search-clear" onClick={() => setApplicantSearch("")} aria-label="Clear search">×</button>
                    )}
                  </label>
                  <div className="rec-filter-chips">
                    {(["all", "Applied", "Shortlisted"] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        className={`rec-filter-chip focus-ring${stageFilter === f ? " rec-filter-chip--active" : ""}`}
                        onClick={() => setStageFilter(f)}
                      >
                        <Filter size={9} />
                        {f === "all" ? "All" : f}
                        {f === "Applied" && <span className="rec-chip-count">{jobApplicants.filter(c => c.stage === "Applied").length}</span>}
                        {f === "Shortlisted" && <span className="rec-chip-count">{jobApplicants.filter(c => c.stage !== "Applied" && c.stage !== "Rejected").length}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Applicant list */}
            {jobApplicants.length === 0 ? (
              <div className="hr-empty-panel">
                <Users size={28} />
                <p>No applicants yet for this posting.</p>
                <button className="cxo-button focus-ring" style={{ marginTop: "8px" }} onClick={() => setShowAddCandidate(true)}>
                  Register First Applicant
                </button>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="hr-empty-panel">
                <Search size={22} />
                <p>No applicants match your filter.</p>
              </div>
            ) : (
              <div className="hr-applicant-list">
                {filteredApplicants.map(candidate => (
                  <div key={candidate.id} className="hr-applicant-item">
                    <div className="hr-applicant-left">
                      <span className="hr-avatar" aria-hidden="true" style={{ width: "38px", height: "38px", fontSize: "12px", flexShrink: 0 }}>
                        {candidate.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                      </span>
                      <div>
                        <strong>{candidate.name}</strong>
                        <span className="hr-cell-note">{candidate.email} &middot; {candidate.phone}</span>
                        <span className="hr-cell-note">
                          {candidate.experienceYears} yrs exp &middot; Exp. <span className="hr-num">{rupees(candidate.expectedSalary)}/yr</span>
                          {candidate.currentCompany ? ` · ${candidate.currentCompany}` : ""}
                        </span>
                        {candidate.resumeSummary && (
                          <span className="rec-resume-blurb">&ldquo;{candidate.resumeSummary}&rdquo;</span>
                        )}
                      </div>
                    </div>
                    <div className="hr-applicant-right">
                      <span className="hr-stage-pill" data-stage={candidate.stage}>{candidate.stage}</span>
                      {candidate.rating && (
                        <span className="hr-stars" style={{ fontSize: "11px" }}>
                          {candidate.rating.toFixed(1)} <Star size={11} fill="#f59e0b" />
                        </span>
                      )}
                      <div className="hr-buttons" style={{ gap: "6px", marginTop: "4px" }}>
                        <button
                          className="cxo-button focus-ring"
                          style={{ minHeight: "32px", padding: "5px 10px", fontSize: "11px" }}
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Eye size={11} /> Profile
                        </button>
                        {candidate.stage === "Applied" && (
                          <button
                            className="hr-primary focus-ring"
                            style={{ minHeight: "32px", padding: "5px 12px", fontSize: "11px" }}
                            onClick={() => handleShortlist(candidate)}
                          >
                            <CheckCircle2 size={11} /> Shortlist
                          </button>
                        )}
                        {candidate.stage !== "Applied" && candidate.stage !== "Rejected" && candidate.stage !== "Onboarded" && (
                          <span className="hr-status" style={{ fontSize: "10px", padding: "4px 8px" }}>✓ Active</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="hr-recruitment-panel hr-empty-panel">
            <Briefcase size={32} />
            <p>Select a job posting to view details and applicants.</p>
          </div>
        )}
      </div>

      {/* Edit / Create Job Modal */}
      {editingJob && (
        <Overlay
          open
          title={isCreating ? "Create Job Requisition" : `Edit Requisition · ${editingJob.title}`}
          label={editingJob.id}
          onClose={() => setEditingJob(null)}
        >
          <JobPostingForm job={editingJob} store={store} onClose={() => setEditingJob(null)} />
        </Overlay>
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <Overlay
          open
          title={selectedCandidate.name}
          label={`Applicant Profile · ${selectedCandidate.id}`}
          onClose={() => setSelectedCandidate(null)}
        >
          <CandidateDetailView
            candidate={selectedCandidate}
            store={store}
            onScheduleInterview={() => setSelectedCandidate(null)}
            onMakeOffer={() => setSelectedCandidate(null)}
            onClose={() => setSelectedCandidate(null)}
          />
        </Overlay>
      )}

      {/* Add Applicant Modal */}
      {showAddCandidate && (
        <Overlay
          open
          title="Add Job Applicant"
          label={selectedJob ? `For: ${selectedJob.title}` : "Manual Registration"}
          onClose={() => setShowAddCandidate(false)}
        >
          <AddCandidateForm
            store={store}
            defaultJobId={selectedJob?.id}
            onClose={() => setShowAddCandidate(false)}
          />
        </Overlay>
      )}
    </>
  );
}

/* =========================================================================
   3. INTERVIEW SCHEDULE SECTION — Job Cards + Candidates Panel
   ========================================================================= */

function InterviewScheduleSection({ store }: { store: HRStore }) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    store.data.jobPostings[0]?.id ?? null
  );
  const [scheduleCandidate, setScheduleCandidate] = useState<Candidate | null>(null);
  const [evalInterview, setEvalInterview] = useState<Interview | null>(null);
  const [feedbackCandidate, setFeedbackCandidate] = useState<Candidate | null>(null);

  const selectedJob = store.data.jobPostings.find(j => j.id === selectedJobId) ?? null;

  /* Candidates shortlisted for this job (ready for interview) */
  const interviewCandidates = useMemo(
    () =>
      store.data.candidates.filter(
        c => c.jobId === selectedJobId && INTERVIEW_STAGES.includes(c.stage)
      ),
    [store.data.candidates, selectedJobId]
  );

  /* Latest interview per candidate */
  const latestInterview = (candidateId: string) => {
    const rounds = store.data.interviews
      .filter(i => i.candidateId === candidateId)
      .sort((a, b) => (b.scheduledAt > a.scheduledAt ? 1 : -1));
    return rounds[0] ?? null;
  };

  return (
    <>
      <div className="cxo-panel cxo-register hr-register">
        <div className="cxo-section-heading">
          <div>
            <h2>Interview Schedule &amp; Panel Evaluations</h2>
            <p>Click a job card to see shortlisted candidates. Schedule rounds and record decisions.</p>
          </div>
        </div>
      </div>

      <div className="hr-recruitment-layout">
        {/* Left: Job Cards */}
        <div className="hr-recruitment-cards">
          {store.data.jobPostings.map(job => {
            const count = store.data.candidates.filter(
              c => c.jobId === job.id && INTERVIEW_STAGES.includes(c.stage)
            ).length;
            return (
              <JobCard
                key={job.id}
                job={job}
                store={store}
                isSelected={selectedJobId === job.id}
                onClick={() => setSelectedJobId(job.id)}
                badge={count}
                badgeColor="amber"
              />
            );
          })}
        </div>

        {/* Right: Candidates Panel */}
        {selectedJob ? (
          <div className="hr-recruitment-panel">
            <div className="hr-panel-job-header">
              <div style={{ flex: 1 }}>
                <span className="hr-role-tag" style={{ fontSize: "11px" }}>{areaName(selectedJob.areaId)}</span>
                <h3 className="hr-panel-job-title">{selectedJob.title}</h3>
                <div className="hr-job-card-meta" style={{ marginTop: "6px" }}>
                  <span><Building2 size={12} />{selectedJob.location}</span>
                  <span><Users size={12} />{interviewCandidates.length} shortlisted</span>
                </div>
              </div>
            </div>

            <div className="hr-panel-section-head">
              <h4>Shortlisted Candidates <span>({interviewCandidates.length})</span></h4>
            </div>

            {interviewCandidates.length === 0 ? (
              <div className="hr-empty-panel">
                <Calendar size={28} />
                <p>No shortlisted candidates for this job yet.</p>
                <span className="hr-cell-note" style={{ marginTop: "6px", display: "block" }}>
                  Go to Job Postings and shortlist applicants first.
                </span>
              </div>
            ) : (
              <div className="hr-applicant-list">
                {interviewCandidates.map(candidate => {
                  const intv = latestInterview(candidate.id);
                  const allInterviews = store.data.interviews.filter(i => i.candidateId === candidate.id);
                  return (
                    <div key={candidate.id} className="hr-applicant-item">
                      <div className="hr-applicant-left">
                        <span className="hr-avatar" aria-hidden="true" style={{ width: "40px", height: "40px", fontSize: "13px" }}>
                          {candidate.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                        </span>
                        <div>
                          <strong>{candidate.name}</strong>
                          <span className="hr-cell-note">{candidate.email} · {candidate.experienceYears} yrs exp</span>
                          <span className="hr-cell-note">Notice: {candidate.noticePeriod} · Expected: {rupees(candidate.expectedSalary)}/yr</span>

                          {/* Interview rounds summary */}
                          {allInterviews.length > 0 && (
                            <div style={{ marginTop: "8px", display: "grid", gap: "6px" }}>
                              {allInterviews.map(iv => (
                                <div key={iv.id} className="hr-interview-row">
                                  <span className="hr-interview-round-tag">{iv.round}</span>
                                  <span className="hr-cell-note">{dateTimeLabel(iv.scheduledAt)}</span>
                                  <Status>{iv.status}</Status>
                                  {iv.rating && (
                                    <span className="hr-stars" style={{ fontSize: "11px" }}>
                                      {iv.rating}/5 <Star size={10} fill="#f59e0b" />
                                    </span>
                                  )}
                                  {iv.status !== "Completed" && (
                                    <button
                                      className="cxo-button focus-ring"
                                      style={{ minHeight: "26px", padding: "3px 8px", fontSize: "10px" }}
                                      onClick={() => { setEvalInterview(iv); setFeedbackCandidate(candidate); }}
                                    >
                                      Submit Feedback
                                    </button>
                                  )}
                                  {iv.status === "Completed" && (
                                    <button
                                      className="cxo-button focus-ring"
                                      style={{ minHeight: "26px", padding: "3px 8px", fontSize: "10px" }}
                                      onClick={() => { setEvalInterview(iv); setFeedbackCandidate(candidate); }}
                                    >
                                      View Feedback
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="hr-applicant-right">
                        <span className="hr-stage-pill" data-stage={candidate.stage}>{candidate.stage}</span>
                        <div className="hr-buttons" style={{ gap: "6px", marginTop: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                          <button
                            className="hr-primary focus-ring"
                            style={{ minHeight: "30px", padding: "5px 12px", fontSize: "11px", width: "100%" }}
                            onClick={() => setScheduleCandidate(candidate)}
                          >
                            <CalendarPlus size={12} /> Schedule Interview
                          </button>
                          <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                            <button
                              className="cxo-button focus-ring"
                              style={{
                                minHeight: "28px", padding: "4px 10px", fontSize: "10px", flex: 1,
                                color: "var(--hr-success)", borderColor: "var(--hr-success)"
                              }}
                              onClick={() =>
                                store.commit(
                                  state => updateCandidateStage(state, candidate.id, "Selected"),
                                  `${candidate.name} marked as Selected.`
                                )
                              }
                            >
                              <Check size={11} /> Selected
                            </button>
                            <button
                              className="cxo-button focus-ring"
                              style={{
                                minHeight: "28px", padding: "4px 10px", fontSize: "10px", flex: 1,
                                color: "var(--hr-error)", borderColor: "var(--hr-error)"
                              }}
                              onClick={() =>
                                store.commit(
                                  state => updateCandidateStage(state, candidate.id, "Rejected"),
                                  `${candidate.name} marked as Rejected.`
                                )
                              }
                            >
                              <XCircle size={11} /> Rejected
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="hr-recruitment-panel hr-empty-panel">
            <Calendar size={32} />
            <p>Select a job posting to view and schedule interviews.</p>
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {scheduleCandidate && (
        <Overlay
          open
          title={`Schedule Interview · ${scheduleCandidate.name}`}
          label={store.data.jobPostings.find(j => j.id === scheduleCandidate.jobId)?.title ?? "Interview"}
          onClose={() => setScheduleCandidate(null)}
        >
          <ScheduleInterviewForm
            candidate={scheduleCandidate}
            store={store}
            onClose={() => setScheduleCandidate(null)}
          />
        </Overlay>
      )}

      {/* Feedback Modal */}
      {evalInterview && feedbackCandidate && (
        <Overlay
          open
          title={`Interview Evaluation · ${evalInterview.round}`}
          label={feedbackCandidate.name}
          onClose={() => { setEvalInterview(null); setFeedbackCandidate(null); }}
        >
          <InterviewFeedbackForm
            interview={evalInterview}
            store={store}
            onClose={() => { setEvalInterview(null); setFeedbackCandidate(null); }}
          />
        </Overlay>
      )}
    </>
  );
}

/* =========================================================================
   4. OFFER LETTERS SECTION — Job Cards + Selected Candidates Panel
   ========================================================================= */

function OfferLettersSection({ store }: { store: HRStore }) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    store.data.jobPostings[0]?.id ?? null
  );
  const [offerCandidate, setOfferCandidate] = useState<Candidate | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<OfferLetter | null>(null);

  const selectedJob = store.data.jobPostings.find(j => j.id === selectedJobId) ?? null;

  /* Candidates selected for this job (Selected / Offer Released / Offer Accepted / Onboarded) */
  const selectedCandidates = useMemo(
    () =>
      store.data.candidates.filter(
        c => c.jobId === selectedJobId &&
          (c.stage === "Selected" || c.stage === "Offer Released" || c.stage === "Offer Accepted" || c.stage === "Onboarded")
      ),
    [store.data.candidates, selectedJobId]
  );

  return (
    <>
      <div className="cxo-panel cxo-register hr-register">
        <div className="cxo-section-heading">
          <div>
            <h2>Offer Letters &amp; Appointment Releases</h2>
            <p>Click a job card to see selected candidates. Release formal offer letters and onboard to ERP.</p>
          </div>
        </div>
      </div>

      <div className="hr-recruitment-layout">
        {/* Left: Job Cards */}
        <div className="hr-recruitment-cards">
          {store.data.jobPostings.map(job => {
            const count = store.data.candidates.filter(
              c => c.jobId === job.id &&
                (c.stage === "Selected" || c.stage === "Offer Released" || c.stage === "Offer Accepted" || c.stage === "Onboarded")
            ).length;
            return (
              <JobCard
                key={job.id}
                job={job}
                store={store}
                isSelected={selectedJobId === job.id}
                onClick={() => setSelectedJobId(job.id)}
                badge={count}
                badgeColor="green"
              />
            );
          })}
        </div>

        {/* Right: Selected Candidates Panel */}
        {selectedJob ? (
          <div className="hr-recruitment-panel">
            <div className="hr-panel-job-header">
              <div style={{ flex: 1 }}>
                <span className="hr-role-tag" style={{ fontSize: "11px" }}>{areaName(selectedJob.areaId)}</span>
                <h3 className="hr-panel-job-title">{selectedJob.title}</h3>
                <div className="hr-job-card-meta" style={{ marginTop: "6px" }}>
                  <span><Building2 size={12} />{selectedJob.location}</span>
                  <span><CheckCircle2 size={12} />{selectedCandidates.length} selected</span>
                </div>
              </div>
            </div>

            <div className="hr-panel-section-head">
              <h4>Selected Candidates <span>({selectedCandidates.length})</span></h4>
            </div>

            {selectedCandidates.length === 0 ? (
              <div className="hr-empty-panel">
                <FileCheck size={28} />
                <p>No selected candidates yet for this job.</p>
                <span className="hr-cell-note" style={{ marginTop: "6px", display: "block" }}>
                  Mark candidates as Selected in Interview Schedule first.
                </span>
              </div>
            ) : (
              <div className="hr-applicant-list">
                {selectedCandidates.map(candidate => {
                  const offer = store.data.offerLetters.find(o => o.candidateId === candidate.id);
                  return (
                    <div key={candidate.id} className="hr-applicant-item">
                      <div className="hr-applicant-left">
                        <span className="hr-avatar" aria-hidden="true" style={{ width: "40px", height: "40px", fontSize: "13px" }}>
                          {candidate.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                        </span>
                        <div>
                          <strong>{candidate.name}</strong>
                          <span className="hr-cell-note">{candidate.email} · {candidate.phone}</span>
                          <span className="hr-cell-note">
                            {candidate.experienceYears} yrs · Expected: {rupees(candidate.expectedSalary)}/yr
                          </span>
                          {offer && (
                            <div style={{ marginTop: "8px" }}>
                              <div className="hr-offer-summary">
                                <span className="hr-cell-note">
                                  Offer: <strong>{rupees(offer.annualSalary)}/yr</strong> · {rupees(offer.monthlySalary)}/mo
                                </span>
                                <span className="hr-cell-note">Joining: {dateLabel(offer.joiningDate)} · Expiry: {dateLabel(offer.expiryDate)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="hr-applicant-right">
                        <span className="hr-stage-pill" data-stage={candidate.stage}>{candidate.stage}</span>
                        <div className="hr-buttons" style={{ gap: "6px", marginTop: "8px", flexDirection: "column", alignItems: "flex-end" }}>
                          {!offer && (
                            <button
                              className="hr-primary focus-ring"
                              style={{ minHeight: "30px", padding: "5px 12px", fontSize: "11px", width: "100%" }}
                              onClick={() => setOfferCandidate(candidate)}
                            >
                              <Sparkles size={12} /> Release Offer Letter
                            </button>
                          )}
                          {offer && (
                            <button
                              className="cxo-button focus-ring"
                              style={{ minHeight: "30px", padding: "5px 12px", fontSize: "11px", width: "100%" }}
                              onClick={() => setSelectedOffer(offer)}
                            >
                              <FileText size={12} /> View Offer Letter
                            </button>
                          )}
                          {offer?.status === "Released" && (
                            <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                              <button
                                className="cxo-button focus-ring"
                                style={{
                                  minHeight: "28px", padding: "4px 8px", fontSize: "10px", flex: 1,
                                  color: "var(--hr-success)", borderColor: "var(--hr-success)"
                                }}
                                onClick={() =>
                                  store.commit(
                                    state => updateOfferStatus(state, offer.id, "Accepted"),
                                    `Offer accepted by ${candidate.name}.`
                                  )
                                }
                              >
                                <Check size={11} /> Accepted
                              </button>
                              <button
                                className="cxo-button focus-ring"
                                style={{
                                  minHeight: "28px", padding: "4px 8px", fontSize: "10px", flex: 1,
                                  color: "var(--hr-error)", borderColor: "var(--hr-error)"
                                }}
                                onClick={() =>
                                  store.commit(
                                    state => updateOfferStatus(state, offer.id, "Declined"),
                                    `Offer declined by ${candidate.name}.`
                                  )
                                }
                              >
                                <XCircle size={11} /> Declined
                              </button>
                            </div>
                          )}
                          {offer?.status === "Accepted" && (
                            <button
                              className="hr-primary focus-ring"
                              style={{
                                minHeight: "30px", padding: "5px 12px", fontSize: "11px", width: "100%",
                                background: "var(--hr-success)"
                              }}
                              onClick={() =>
                                store.commit(
                                  state => onboardCandidateFromOffer(state, offer.id),
                                  `${candidate.name} onboarded to ERP!`
                                )
                              }
                            >
                              <UserPlus size={12} /> Onboard to ERP
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="hr-recruitment-panel hr-empty-panel">
            <FileCheck size={32} />
            <p>Select a job posting to manage offers for selected candidates.</p>
          </div>
        )}
      </div>

      {/* Prepare Offer Modal */}
      {offerCandidate && (
        <Overlay
          open
          title={`Prepare Offer Letter · ${offerCandidate.name}`}
          label={store.data.jobPostings.find(j => j.id === offerCandidate.jobId)?.title ?? "Employment Offer"}
          onClose={() => setOfferCandidate(null)}
        >
          <CreateOfferForm
            candidate={offerCandidate}
            store={store}
            onClose={() => setOfferCandidate(null)}
          />
        </Overlay>
      )}

      {/* Formal Offer Letter View */}
      {selectedOffer && (
        <Overlay
          open
          title={`Letter of Employment Offer · ${selectedOffer.candidateName}`}
          label={`Document Ref: ${selectedOffer.id}`}
          onClose={() => setSelectedOffer(null)}
        >
          <OfferLetterDocumentView
            offer={selectedOffer}
            store={store}
            onClose={() => setSelectedOffer(null)}
          />
        </Overlay>
      )}
    </>
  );
}

/* =========================================================================
   1. APPLICANT TRACKING SECTION (ATS) — flat table view (unchanged)
   ========================================================================= */

function ApplicantsSection({ store }: { store: HRStore }) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [offerCandidate, setOfferCandidate] = useState<Candidate | null>(null);

  const filteredCandidates = useMemo(() => {
    return store.data.candidates.filter(c => {
      const matchesQuery = `${c.name} ${c.email} ${c.phone} ${c.currentCompany ?? ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesStage = stageFilter === "all" || c.stage === stageFilter;
      const matchesJob = jobFilter === "all" || c.jobId === jobFilter;
      return matchesQuery && matchesStage && matchesJob;
    });
  }, [store.data.candidates, query, stageFilter, jobFilter]);

  return (
    <>
      <Register
        title="Applicant Pipeline"
        description="Candidate profiles, stage transitions, interview scoring and offer releases"
        actions={
          <button className="hr-primary focus-ring" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Candidate
          </button>
        }
        filters={
          <Filters query={query} setQuery={setQuery}>
            <label>
              <span className="sr-only">Stage filter</span>
              <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
                <option value="all">All stages ({store.data.candidates.length})</option>
                {STAGES.map(s => {
                  const count = store.data.candidates.filter(c => c.stage === s).length;
                  return (
                    <option key={s} value={s}>
                      {s} ({count})
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              <span className="sr-only">Job filter</span>
              <select value={jobFilter} onChange={e => setJobFilter(e.target.value)}>
                <option value="all">All job openings</option>
                {store.data.jobPostings.map(j => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </label>
          </Filters>
        }
        headings={[
          "Candidate",
          "Applied Role",
          "Experience & CTC",
          "Stage",
          "Rating",
          "Applied Date",
          "Action",
        ]}
        empty={!filteredCandidates.length}
      >
        {filteredCandidates.map(candidate => {
          const job = store.data.jobPostings.find(j => j.id === candidate.jobId);
          return (
            <tr key={candidate.id}>
              <td>
                <button
                  type="button"
                  className="hr-person-button focus-ring"
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="hr-person">
                    <span className="hr-avatar" aria-hidden="true">
                      {candidate.name.split(" ").slice(0, 2).map(n => n[0]).join("")}
                    </span>
                    <div>
                      <strong>{candidate.name}</strong>
                      <span>{candidate.email}</span>
                    </div>
                  </div>
                </button>
              </td>
              <td>
                <strong>{job?.title ?? "General Application"}</strong>
                <span className="hr-cell-note">{areaName(job?.areaId ?? "")}</span>
              </td>
              <td>
                <span className="hr-num">{candidate.experienceYears} yrs exp</span>
                <span className="hr-cell-note hr-num">
                  Exp: {rupees(candidate.expectedSalary)} / yr
                </span>
              </td>
              <td>
                <span className="hr-stage-pill" data-stage={candidate.stage}>
                  {candidate.stage}
                </span>
              </td>
              <td>
                {candidate.rating ? (
                  <span className="hr-stars">
                    {candidate.rating.toFixed(1)} <Star size={12} fill="#f59e0b" />
                  </span>
                ) : (
                  <span className="hr-cell-note">Unrated</span>
                )}
              </td>
              <td>
                <span>{dateLabel(candidate.appliedDate)}</span>
                <span className="hr-cell-note">{candidate.noticePeriod} notice</span>
              </td>
              <td>
                <div className="hr-buttons" style={{ gap: "6px" }}>
                  <button
                    className="cxo-button focus-ring"
                    onClick={() => setSelectedCandidate(candidate)}
                    title="View candidate profile and progress"
                  >
                    <Eye size={12} /> View
                  </button>
                  {candidate.stage !== "Rejected" && candidate.stage !== "Onboarded" && (
                    <button
                      className="cxo-button focus-ring"
                      onClick={() => setInterviewCandidate(candidate)}
                      title="Schedule interview round"
                    >
                      <CalendarPlus size={12} /> Interview
                    </button>
                  )}
                  {candidate.stage === "Selected" && (
                    <button
                      className="hr-primary focus-ring"
                      style={{ minHeight: "32px", padding: "6px 12px", fontSize: "11px" }}
                      onClick={() => setOfferCandidate(candidate)}
                    >
                      <Sparkles size={12} /> Release Offer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </Register>

      {selectedCandidate && (
        <Overlay
          open
          title={selectedCandidate.name}
          label={`Applicant Profile · ${selectedCandidate.id}`}
          onClose={() => setSelectedCandidate(null)}
        >
          <CandidateDetailView
            candidate={selectedCandidate}
            store={store}
            onScheduleInterview={() => {
              setInterviewCandidate(selectedCandidate);
              setSelectedCandidate(null);
            }}
            onMakeOffer={() => {
              setOfferCandidate(selectedCandidate);
              setSelectedCandidate(null);
            }}
            onClose={() => setSelectedCandidate(null)}
          />
        </Overlay>
      )}

      {showAddModal && (
        <Overlay
          open
          title="Add Job Applicant"
          label="Manual Registration / Referral Entry"
          onClose={() => setShowAddModal(false)}
        >
          <AddCandidateForm store={store} onClose={() => setShowAddModal(false)} />
        </Overlay>
      )}

      {interviewCandidate && (
        <Overlay
          open
          title={`Schedule Interview · ${interviewCandidate.name}`}
          label={store.data.jobPostings.find(j => j.id === interviewCandidate.jobId)?.title ?? "Interview"}
          onClose={() => setInterviewCandidate(null)}
        >
          <ScheduleInterviewForm
            candidate={interviewCandidate}
            store={store}
            onClose={() => setInterviewCandidate(null)}
          />
        </Overlay>
      )}

      {offerCandidate && (
        <Overlay
          open
          title={`Prepare Offer Letter · ${offerCandidate.name}`}
          label={store.data.jobPostings.find(j => j.id === offerCandidate.jobId)?.title ?? "Employment Offer"}
          onClose={() => setOfferCandidate(null)}
        >
          <CreateOfferForm
            candidate={offerCandidate}
            store={store}
            onClose={() => setOfferCandidate(null)}
          />
        </Overlay>
      )}
    </>
  );
}

/* =========================================================================
   CANDIDATE DETAIL VIEW (shared modal content)
   ========================================================================= */

function CandidateDetailView({
  candidate,
  store,
  onScheduleInterview,
  onMakeOffer,
  onClose,
}: {
  candidate: Candidate;
  store: HRStore;
  onScheduleInterview: () => void;
  onMakeOffer: () => void;
  onClose: () => void;
}) {
  const job = store.data.jobPostings.find(j => j.id === candidate.jobId);
  const interviews = store.data.interviews.filter(i => i.candidateId === candidate.id);
  const offer = store.data.offerLetters.find(o => o.candidateId === candidate.id);
  const [stage, setStage] = useState(candidate.stage);
  const [stageNote, setStageNote] = useState("");

  function handleStageChange(newStage: CandidateStage) {
    setStage(newStage);
    store.commit(
      state => updateCandidateStage(state, candidate.id, newStage, stageNote),
      `Candidate moved to ${newStage}.`
    );
  }

  return (
    <div className="hr-candidate-detail">
      <div className="hr-candidate-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{candidate.name}</h3>
            <p className="hr-description" style={{ marginTop: "4px" }}>
              Applied for: <strong>{job?.title ?? "General"}</strong> · {areaName(job?.areaId ?? "")}
            </p>
            <div className="hr-cell-note" style={{ marginTop: "6px" }}>
              {candidate.email} · {candidate.phone} · Notice: {candidate.noticePeriod}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <span className="hr-stage-pill" data-stage={stage}>
              {stage}
            </span>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              <span>Change stage:</span>
              <select
                className="hr-field"
                style={{ minHeight: "32px", padding: "4px 8px", fontSize: "11px", width: "auto" }}
                value={stage}
                onChange={e => handleStageChange(e.target.value as CandidateStage)}
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="hr-form-grid">
        <div className="hr-salary">
          <header>
            <span>Compensation Expectation</span>
            <small>{candidate.currentCompany ? `Current: ${candidate.currentCompany}` : "New entrant"}</small>
          </header>
          <dl>
            <div>
              <dt>Expected CTC</dt>
              <dd>{rupees(candidate.expectedSalary)}</dd>
            </div>
            <div>
              <dt>Current CTC</dt>
              <dd>{candidate.currentSalary ? rupees(candidate.currentSalary) : "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="hr-salary" data-tone={offer ? "highlight" : "default"}>
          <header>
            <span>Offer Letter Status</span>
            <small>{offer ? offer.status : "No offer issued yet"}</small>
          </header>
          {offer ? (
            <dl>
              <div>
                <dt>Offered Annual CTC</dt>
                <dd>{rupees(offer.annualSalary)}</dd>
              </div>
              <div>
                <dt>Monthly Gross</dt>
                <dd>{rupees(offer.monthlySalary)}</dd>
              </div>
            </dl>
          ) : (
            <p className="hr-description" style={{ margin: "auto 0" }}>
              Mark candidate as <strong>Selected</strong> once panel rounds are complete to generate and release an official offer letter.
            </p>
          )}
        </div>
      </div>

      {candidate.resumeSummary && (
        <div>
          <h4 style={{ fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>Resume Highlights &amp; Competencies</h4>
          <p className="hr-code" style={{ fontSize: "12px" }}>{candidate.resumeSummary}</p>
        </div>
      )}

      {/* Interview History */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h4 style={{ fontSize: "13px", fontWeight: 600 }}>
            Interview Rounds ({interviews.length})
          </h4>
          {candidate.stage !== "Rejected" && candidate.stage !== "Onboarded" && (
            <button className="cxo-button focus-ring" onClick={onScheduleInterview}>
              <CalendarPlus size={13} /> Schedule Round
            </button>
          )}
        </div>

        {interviews.length ? (
          <div className="hr-candidate-timeline">
            {interviews.map(intv => (
              <div className="hr-candidate-timeline-item" key={intv.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div>
                    <strong>{intv.round}</strong> · <span>{dateTimeLabel(intv.scheduledAt)}</span>
                    <div className="hr-cell-note">
                      Interviewer: {intv.interviewer} ({intv.mode})
                    </div>
                  </div>
                  <Status>{intv.status}</Status>
                </div>
                {intv.feedback && (
                  <p style={{ marginTop: "8px", fontSize: "12px", color: "var(--text)", background: "var(--surface-soft)", padding: "8px 12px", borderRadius: "8px" }}>
                    "{intv.feedback}"
                    {intv.rating && (
                      <span className="hr-stars" style={{ display: "block", marginTop: "4px" }}>
                        Score: {intv.rating}/5 <Star size={11} fill="#f59e0b" />
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="cxo-empty" style={{ padding: "16px" }}>No interview rounds scheduled yet.</p>
        )}
      </div>

      <div className="hr-buttons" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
        {candidate.stage === "Selected" && !offer && (
          <button className="hr-primary focus-ring" onClick={onMakeOffer}>
            <Sparkles size={14} /> Release Formal Offer
          </button>
        )}
        {candidate.stage !== "Rejected" && candidate.stage !== "Onboarded" && (
          <button
            className="cxo-button focus-ring"
            style={{ color: "var(--hr-error)" }}
            onClick={() => handleStageChange("Rejected")}
          >
            <XCircle size={14} /> Mark Rejected
          </button>
        )}
        <button className="cxo-button focus-ring" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   ADD CANDIDATE FORM
   ========================================================================= */

function AddCandidateForm({
  store,
  defaultJobId,
  onClose,
}: {
  store: HRStore;
  defaultJobId?: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Candidate>>({
    id: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
    name: "",
    email: "",
    phone: "",
    jobId: defaultJobId || store.data.jobPostings[0]?.id || "",
    currentCompany: "",
    experienceYears: 2,
    expectedSalary: 450000,
    noticePeriod: "30 Days",
    stage: "Applied",
    appliedDate: new Date().toISOString().slice(0, 10),
    resumeSummary: "",
    notes: "",
  });

  return (
    <form
      className="hr-form"
      onSubmit={e => {
        e.preventDefault();
        if (
          store.commit(
            state =>
              saveCandidate(state, {
                ...form,
                id: form.id!,
                name: form.name!.trim(),
                email: form.email!.trim().toLowerCase(),
                phone: form.phone!.trim(),
                jobId: form.jobId!,
                experienceYears: Number(form.experienceYears) || 0,
                expectedSalary: Number(form.expectedSalary) || 0,
                currentSalary: form.currentSalary ? Number(form.currentSalary) : undefined,
                noticePeriod: form.noticePeriod || "Immediate",
                stage: (form.stage as CandidateStage) || "Applied",
                appliedDate: form.appliedDate || new Date().toISOString().slice(0, 10),
                resumeSummary: form.resumeSummary?.trim(),
              }),
            "New candidate registered in ATS pipeline."
          )
        ) {
          onClose();
        }
      }}
    >
      <div className="hr-form-grid">
        <label>
          Candidate Full Name
          <input
            className="hr-field"
            required
            maxLength={100}
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Ananya Das"
          />
        </label>
        <label>
          Email Address
          <input
            className="hr-field"
            type="email"
            required
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="candidate@example.org"
          />
        </label>
        <label>
          Phone Number
          <input
            className="hr-field"
            type="tel"
            required
            pattern="[+0-9 ()-]{10,20}"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="+91 98000 00000"
          />
        </label>
        <label>
          Target Job Requisition
          <select
            className="hr-field"
            required
            value={form.jobId}
            onChange={e => setForm(p => ({ ...p, jobId: e.target.value }))}
          >
            {store.data.jobPostings.map(j => (
              <option key={j.id} value={j.id}>
                {j.title} ({areaName(j.areaId)})
              </option>
            ))}
          </select>
        </label>
        <label>
          Total Experience (Years)
          <input
            className="hr-field"
            type="number"
            min={0}
            max={40}
            step={0.5}
            required
            value={form.experienceYears}
            onChange={e => setForm(p => ({ ...p, experienceYears: Number(e.target.value) }))}
          />
        </label>
        <label>
          Notice Period
          <select
            className="hr-field"
            value={form.noticePeriod}
            onChange={e => setForm(p => ({ ...p, noticePeriod: e.target.value }))}
          >
            <option>Immediate</option>
            <option>15 Days</option>
            <option>30 Days</option>
            <option>60 Days</option>
            <option>90 Days</option>
          </select>
        </label>
        <label>
          Current Company / Employer
          <input
            className="hr-field"
            value={form.currentCompany}
            onChange={e => setForm(p => ({ ...p, currentCompany: e.target.value }))}
            placeholder="Optional"
          />
        </label>
        <label>
          Expected Annual CTC
          <span className="hr-input-affix">
            <span>₹</span>
            <input
              className="hr-field"
              type="number"
              required
              min={100000}
              step={10000}
              value={form.expectedSalary}
              onChange={e => setForm(p => ({ ...p, expectedSalary: Number(e.target.value) }))}
            />
          </span>
        </label>
      </div>

      <label>
        Profile &amp; Experience Summary
        <textarea
          className="hr-field"
          maxLength={1500}
          value={form.resumeSummary}
          onChange={e => setForm(p => ({ ...p, resumeSummary: e.target.value }))}
          placeholder="Key qualifications, degree, past projects, skill highlights..."
        />
      </label>

      {store.error && <p className="hr-error" role="alert">{store.error}</p>}
      <button className="hr-primary focus-ring" type="submit">
        Register Candidate
      </button>
    </form>
  );
}

/* =========================================================================
   JOB POSTING FORM
   ========================================================================= */

function JobPostingForm({
  job,
  store,
  onClose,
}: {
  job: JobPosting;
  store: HRStore;
  onClose: () => void;
}) {
  const [form, setForm] = useState(job);
  const [reqsText, setReqsText] = useState(job.requirements.join("\n"));

  return (
    <form
      className="hr-form"
      onSubmit={e => {
        e.preventDefault();
        const requirements = reqsText
          .split("\n")
          .map(r => r.trim())
          .filter(Boolean);
        if (
          store.commit(
            state =>
              saveJobPosting(state, {
                ...form,
                title: form.title.trim(),
                department: form.department.trim(),
                location: form.location.trim(),
                requirements,
              }),
            `Job requisition ${form.title} saved.`
          )
        ) {
          onClose();
        }
      }}
    >
      <div className="hr-form-grid">
        <label>
          Job Title
          <input
            className="hr-field"
            required
            maxLength={120}
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Lead Vocational Trainer"
          />
        </label>
        <label>
          Thematic Area
          <select
            className="hr-field"
            value={form.areaId}
            onChange={e => setForm(p => ({ ...p, areaId: e.target.value }))}
          >
            {financeAreas.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Department
          <input
            className="hr-field"
            required
            value={form.department}
            onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
            placeholder="e.g. Technical Training & Labs"
          />
        </label>
        <label>
          Deployment Workstation / Centre
          <input
            className="hr-field"
            required
            value={form.location}
            onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            placeholder="e.g. Angul Skill Centre · On-site"
          />
        </label>
        <label>
          Experience Range
          <input
            className="hr-field"
            required
            value={form.experience}
            onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
            placeholder="e.g. 3–5 Years"
          />
        </label>
        <label>
          Number of Open Vacancies
          <input
            className="hr-field"
            type="number"
            min={1}
            max={50}
            required
            value={form.openings}
            onChange={e => setForm(p => ({ ...p, openings: Number(e.target.value) }))}
          />
        </label>
        <label>
          Minimum Salary (Annual CTC)
          <span className="hr-input-affix">
            <span>₹</span>
            <input
              className="hr-field"
              type="number"
              min={100000}
              step={10000}
              required
              value={form.minSalary}
              onChange={e => setForm(p => ({ ...p, minSalary: Number(e.target.value) }))}
            />
          </span>
        </label>
        <label>
          Maximum Salary (Annual CTC)
          <span className="hr-input-affix">
            <span>₹</span>
            <input
              className="hr-field"
              type="number"
              min={form.minSalary}
              step={10000}
              required
              value={form.maxSalary}
              onChange={e => setForm(p => ({ ...p, maxSalary: Number(e.target.value) }))}
            />
          </span>
        </label>
        <label>
          Closing Application Date
          <input
            className="hr-field"
            type="date"
            required
            value={form.closingDate}
            onChange={e => setForm(p => ({ ...p, closingDate: e.target.value }))}
          />
        </label>
        <label>
          Posting Status
          <select
            className="hr-field"
            value={form.status}
            onChange={e => setForm(p => ({ ...p, status: e.target.value as JobPosting["status"] }))}
          >
            <option>Active</option>
            <option>Draft</option>
            <option>Closed</option>
          </select>
        </label>
      </div>

      <div className="hr-salary" style={{ margin: "14px 0" }}>
        <header>
          <span>Calculated Monthly Salary Band</span>
          <small>Monthly = Annual ÷ 12</small>
        </header>
        <dl>
          <div>
            <dt>Min Monthly Gross</dt>
            <dd>{rupees(form.minSalary / 12)}</dd>
          </div>
          <div>
            <dt>Max Monthly Gross</dt>
            <dd>{rupees(form.maxSalary / 12)}</dd>
          </div>
        </dl>
      </div>

      <label>
        Job Description &amp; Core Purpose
        <textarea
          className="hr-field"
          required
          minLength={20}
          maxLength={2000}
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Detailed responsibilities, team leadership, field expectations..."
        />
      </label>

      <label>
        Key Requirements (One requirement per line)
        <textarea
          className="hr-field"
          rows={4}
          value={reqsText}
          onChange={e => setReqsText(e.target.value)}
          placeholder="Diploma / B.Tech degree required&#10;TOT certification preferred&#10;Proficiency in Odia & English..."
        />
      </label>

      {store.error && <p className="hr-error" role="alert">{store.error}</p>}
      <button className="hr-primary focus-ring" type="submit">
        Save Job Requisition
      </button>
    </form>
  );
}

/* =========================================================================
   SCHEDULE INTERVIEW FORM
   ========================================================================= */

function ScheduleInterviewForm({
  candidate,
  store,
  onClose,
}: {
  candidate?: Candidate;
  store: HRStore;
  onClose: () => void;
}) {
  const [candidateId, setCandidateId] = useState(candidate?.id || store.data.candidates[0]?.id || "");
  const selectedCand = store.data.candidates.find(c => c.id === candidateId);
  const [jobId, setJobId] = useState(selectedCand?.jobId || store.data.jobPostings[0]?.id || "");
  const [round, setRound] = useState<InterviewRound>("Technical Assessment");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [interviewer, setInterviewer] = useState("Dr. Alok Verma (Lead Technical Panel)");
  const [mode, setMode] = useState<InterviewMode>("Google Meet");
  const [meetLink, setMeetLink] = useState("https://meet.google.com/pan-interview-room");

  return (
    <form
      className="hr-form"
      onSubmit={e => {
        e.preventDefault();
        const interview: Interview = {
          id: `INT-2026-${Math.floor(100 + Math.random() * 900)}`,
          candidateId,
          jobId,
          round,
          scheduledAt,
          durationMinutes,
          interviewer: interviewer.trim(),
          mode,
          meetLink: mode.includes("Meet") || mode.includes("Teams") ? meetLink.trim() : undefined,
          status: "Scheduled",
        };
        if (store.commit(state => scheduleInterview(state, interview), `Interview scheduled with ${selectedCand?.name}.`)) {
          onClose();
        }
      }}
    >
      <div className="hr-form-grid">
        <label>
          Candidate
          <select
            className="hr-field"
            value={candidateId}
            required
            onChange={e => {
              setCandidateId(e.target.value);
              const c = store.data.candidates.find(item => item.id === e.target.value);
              if (c) setJobId(c.jobId);
            }}
          >
            {store.data.candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.stage})
              </option>
            ))}
          </select>
        </label>
        <label>
          Interview Round
          <select
            className="hr-field"
            value={round}
            onChange={e => setRound(e.target.value as InterviewRound)}
          >
            {INTERVIEW_ROUNDS.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          Interview Date &amp; Time
          <input
            className="hr-field"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />
        </label>
        <label>
          Duration (Minutes)
          <select
            className="hr-field"
            value={durationMinutes}
            onChange={e => setDurationMinutes(Number(e.target.value))}
          >
            <option value={30}>30 Minutes</option>
            <option value={45}>45 Minutes</option>
            <option value={60}>60 Minutes (1 Hour)</option>
            <option value={90}>90 Minutes</option>
          </select>
        </label>
        <label>
          Interviewer / Panel Name
          <input
            className="hr-field"
            required
            value={interviewer}
            onChange={e => setInterviewer(e.target.value)}
            placeholder="e.g. Ramesh Chandra Das (Programme Director)"
          />
        </label>
        <label>
          Interview Mode
          <select
            className="hr-field"
            value={mode}
            onChange={e => setMode(e.target.value as InterviewMode)}
          >
            {INTERVIEW_MODES.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      {(mode === "Google Meet" || mode === "Microsoft Teams") && (
        <label>
          Meeting URL
          <input
            className="hr-field"
            type="url"
            required
            value={meetLink}
            onChange={e => setMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
          />
        </label>
      )}

      {store.error && <p className="hr-error" role="alert">{store.error}</p>}
      <button className="hr-primary focus-ring" type="submit">
        Confirm &amp; Schedule Round
      </button>
    </form>
  );
}

/* =========================================================================
   INTERVIEW FEEDBACK FORM
   ========================================================================= */

function InterviewFeedbackForm({
  interview,
  store,
  onClose,
}: {
  interview: Interview;
  store: HRStore;
  onClose: () => void;
}) {
  const candidate = store.data.candidates.find(c => c.id === interview.candidateId);
  const [rating, setRating] = useState(interview.rating?.toString() || "4");
  const [feedback, setFeedback] = useState(interview.feedback || "");
  const [recommendation, setRecommendation] = useState<NonNullable<Interview["recommendation"]>>(
    interview.recommendation || "Select for Offer"
  );
  const isCompleted = interview.status === "Completed";

  return (
    <form
      className="hr-form"
      onSubmit={e => {
        e.preventDefault();
        if (
          store.commit(
            state =>
              submitInterviewFeedback(
                state,
                interview.id,
                feedback.trim(),
                Number(rating),
                recommendation
              ),
            `Interview evaluation submitted for ${candidate?.name}.`
          )
        ) {
          onClose();
        }
      }}
    >
      <div className="hr-candidate-card">
        <strong>{candidate?.name}</strong> · <span>{interview.round}</span>
        <div className="hr-cell-note">
          Interviewer: {interview.interviewer} · Scheduled: {dateTimeLabel(interview.scheduledAt)}
        </div>
      </div>

      <div className="hr-form-grid">
        <label>
          Evaluation Rating (1–5 Stars)
          <select
            className="hr-field"
            required
            disabled={isCompleted}
            value={rating}
            onChange={e => setRating(e.target.value)}
          >
            {[1, 2, 3, 4, 5].map(n => (
              <option key={n} value={n}>
                {n} / 5 {n === 5 ? "· Outstanding" : n === 4 ? "· Strong Fit" : n === 3 ? "· Acceptable" : "· Substandard"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Recommendation Decision
          <select
            className="hr-field"
            required
            disabled={isCompleted}
            value={recommendation}
            onChange={e => setRecommendation(e.target.value as NonNullable<Interview["recommendation"]>)}
          >
            <option value="Select for Offer">Select for Offer (Move to Selected)</option>
            <option value="Advance to Next Round">Advance to Next Round</option>
            <option value="Hold">Hold for Comparison</option>
            <option value="Reject">Reject Candidate</option>
          </select>
        </label>
      </div>

      <label>
        Panel Observations &amp; Technical Feedback
        <textarea
          className="hr-field"
          required
          minLength={10}
          maxLength={2000}
          readOnly={isCompleted}
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Record strengths, technical knowledge, safety compliance, communication skills..."
        />
      </label>

      {store.error && <p className="hr-error" role="alert">{store.error}</p>}
      {!isCompleted ? (
        <button className="hr-primary focus-ring" type="submit">
          Save Evaluation &amp; Update Candidate Stage
        </button>
      ) : (
        <button className="cxo-button focus-ring" type="button" onClick={onClose}>
          Close
        </button>
      )}
    </form>
  );
}

/* =========================================================================
   CREATE OFFER FORM
   ========================================================================= */

function CreateOfferForm({
  candidate,
  store,
  onClose,
}: {
  candidate?: Candidate;
  store: HRStore;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [candidateId, setCandidateId] = useState(candidate?.id || store.data.candidates[0]?.id || "");
  const selectedCandidate = store.data.candidates.find(c => c.id === candidateId);
  const targetJob = store.data.jobPostings.find(j => j.id === selectedCandidate?.jobId);

  const [designationTitle, setDesignationTitle] = useState(targetJob?.title || "Project Coordinator");
  const [areaId, setAreaId] = useState(targetJob?.areaId || "skill-development");
  const [joiningDate, setJoiningDate] = useState(() => {
    const d = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  });

  const [annualSalary, setAnnualSalary] = useState(
    selectedCandidate?.expectedSalary ? String(selectedCandidate.expectedSalary) : "480000"
  );
  const [monthlySalary, setMonthlySalary] = useState(
    selectedCandidate?.expectedSalary ? String(monthlyFromAnnual(selectedCandidate.expectedSalary)) : "40000"
  );
  const [termsNotes, setTermsNotes] = useState(
    "Probation period: 6 months. Annual performance review cycle in March. Standard medical and field travel allowances apply."
  );

  const annualNum = Number(annualSalary) || 0;
  const monthlyNum = Number(monthlySalary) || 0;
  const basicHra = Math.round(monthlyNum * 0.7);
  const allowance = monthlyNum - basicHra;

  function editAnnual(val: string) {
    setAnnualSalary(val);
    const n = Number(val);
    if (n > 0) setMonthlySalary(String(monthlyFromAnnual(n)));
  }

  function editMonthly(val: string) {
    setMonthlySalary(val);
    const n = Number(val);
    if (n > 0) setAnnualSalary(String(annualFromMonthly(n)));
  }

  return (
    <form
      className="hr-form"
      onSubmit={e => {
        e.preventDefault();
        const offer: OfferLetter = {
          id: `OFR-2026-${Math.floor(10 + Math.random() * 90)}`,
          candidateId,
          jobId: selectedCandidate?.jobId || targetJob?.id || "JOB-2026-01",
          candidateName: selectedCandidate?.name || "Candidate",
          candidateEmail: selectedCandidate?.email || "candidate@example.org",
          candidatePhone: selectedCandidate?.phone,
          designationTitle: designationTitle.trim(),
          areaId,
          joiningDate,
          annualSalary: annualNum,
          monthlySalary: monthlyNum,
          basicHra,
          allowance,
          expiryDate,
          status: "Released",
          releasedAt: new Date().toISOString(),
          releasedBy: user?.name || "HR Head",
          termsNotes: termsNotes.trim(),
        };

        if (
          store.commit(
            state => releaseOfferLetter(state, offer),
            `Offer letter released for ${offer.candidateName} at ${rupees(offer.annualSalary)}/yr.`
          )
        ) {
          onClose();
        }
      }}
    >
      <div className="hr-form-grid">
        <label>
          Select Candidate
          <select
            className="hr-field"
            value={candidateId}
            required
            onChange={e => {
              setCandidateId(e.target.value);
              const c = store.data.candidates.find(item => item.id === e.target.value);
              if (c) {
                const j = store.data.jobPostings.find(item => item.id === c.jobId);
                if (j) {
                  setDesignationTitle(j.title);
                  setAreaId(j.areaId);
                }
                if (c.expectedSalary) {
                  editAnnual(String(c.expectedSalary));
                }
              }
            }}
          >
            {store.data.candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} · {c.stage} ({rupees(c.expectedSalary)} expected)
              </option>
            ))}
          </select>
        </label>

        <label>
          Designation Title (Appointment Role)
          <input
            className="hr-field"
            required
            maxLength={100}
            value={designationTitle}
            onChange={e => setDesignationTitle(e.target.value)}
          />
        </label>

        <label>
          Thematic Area
          <select
            className="hr-field"
            value={areaId}
            onChange={e => setAreaId(e.target.value)}
          >
            {financeAreas.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Expected Joining Date
          <input
            className="hr-field"
            type="date"
            required
            value={joiningDate}
            onChange={e => setJoiningDate(e.target.value)}
          />
        </label>

        <label>
          Offer Acceptance Expiry Date
          <input
            className="hr-field"
            type="date"
            required
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
          />
        </label>
      </div>

      <div className="hr-salary-pair" style={{ margin: "16px 0" }}>
        <div className="hr-form-grid">
          <label>
            Offered Annual CTC (Yearly)
            <span className="hr-input-affix">
              <span>₹</span>
              <input
                className="hr-field"
                type="number"
                min={100000}
                max={100000000}
                step={5000}
                required
                value={annualSalary}
                onChange={e => editAnnual(e.target.value)}
              />
            </span>
          </label>
          <label>
            Offered Monthly Gross
            <span className="hr-input-affix">
              <span>₹</span>
              <input
                className="hr-field"
                type="number"
                min={8000}
                step={1000}
                required
                value={monthlySalary}
                onChange={e => editMonthly(e.target.value)}
              />
            </span>
          </label>
        </div>

        <SalarySummary
          label="Offered Compensation Package"
          tone="highlight"
          annual={annualNum > 0 ? annualNum : undefined}
          caption={`Basic + HRA: ${rupees(basicHra)}/mo · Allowance: ${rupees(allowance)}/mo`}
        />
      </div>

      <label>
        Special Offer Terms &amp; Conditions
        <textarea
          className="hr-field"
          rows={3}
          value={termsNotes}
          onChange={e => setTermsNotes(e.target.value)}
        />
      </label>

      {store.error && <p className="hr-error" role="alert">{store.error}</p>}
      <div className="hr-buttons" style={{ marginTop: "16px" }}>
        <button className="hr-primary focus-ring" type="submit">
          <Send size={14} /> Release &amp; Generate Formal Letter
        </button>
        <button className="cxo-button focus-ring" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/* =========================================================================
   OFFER LETTER DOCUMENT VIEW
   ========================================================================= */

function OfferLetterDocumentView({
  offer,
  store,
  onClose,
}: {
  offer: OfferLetter;
  store: HRStore;
  onClose: () => void;
}) {
  const annual = offer.annualSalary;
  const monthly = offer.monthlySalary;
  const basic = offer.basicHra;
  const allowance = offer.allowance;

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Formal Letter Paper */}
      <div className="hr-letter-paper" id="pantiss-offer-letter">
        <div className="hr-letterhead">
          <div>
            <h2>PANTISS FOUNDATION</h2>
            <p>
              Centre for Skill &amp; Rural Transformation · Registered Section 8 Enterprise<br />
              Plot 42, Infocity Avenue, Bhubaneswar, Odisha — 751024
            </p>
          </div>
          <div className="hr-letterhead-meta">
            <strong>Ref: {offer.id}</strong>
            <div>Date: {dateLabel(offer.releasedAt)}</div>
            <div>Validity: {dateLabel(offer.expiryDate)}</div>
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <strong>CONFIDENTIAL &amp; PERSONAL</strong>
          <div>To,</div>
          <strong style={{ fontSize: "14px" }}>{offer.candidateName}</strong>
          <div>{offer.candidateEmail} {offer.candidatePhone ? `· ${offer.candidatePhone}` : ""}</div>
        </div>

        <h3 className="hr-letter-title">
          SUBJECT: LETTER OF EMPLOYMENT OFFER AND APPOINTMENT
        </h3>

        <div className="hr-letter-body">
          <p>Dear {offer.candidateName},</p>
          <p>
            With reference to your application and subsequent interview evaluations with our selection panel, we are pleased to offer you the position of <strong>{offer.designationTitle}</strong> within the <strong>{areaName(offer.areaId)}</strong> programme at Pantiss Foundation.
          </p>
          <p>
            Your scheduled date of joining will be <strong>{dateLabel(offer.joiningDate)}</strong>. Please report to the project office at 09:30 AM for your onboarding verification and equipment provisioning.
          </p>

          <h4 style={{ fontWeight: 600, marginTop: "20px", marginBottom: "8px" }}>
            ANNEXURE A: COMPENSATION &amp; BENEFITS BREAKDOWN
          </h4>

          <table className="hr-letter-table">
            <thead>
              <tr>
                <th>Salary Component</th>
                <th style={{ textAlign: "right" }}>Monthly (₹)</th>
                <th style={{ textAlign: "right" }}>Annual (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary &amp; House Rent Allowance (HRA)</td>
                <td className="hr-num-cell">{rupees(basic)}</td>
                <td className="hr-num-cell">{rupees(basic * 12)}</td>
              </tr>
              <tr>
                <td>Special Field &amp; Operational Allowances</td>
                <td className="hr-num-cell">{rupees(allowance)}</td>
                <td className="hr-num-cell">{rupees(allowance * 12)}</td>
              </tr>
              <tr className="hr-total-row">
                <td>Total Cost to Organization (Gross CTC)</td>
                <td className="hr-num-cell">{rupees(monthly)}</td>
                <td className="hr-num-cell">{rupees(annual)}</td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ fontWeight: 600, marginTop: "20px", marginBottom: "8px" }}>
            TERMS OF APPOINTMENT
          </h4>
          <p>
            {offer.termsNotes || "Your appointment is subject to satisfactory verification of professional credentials and background checks."}
          </p>
          <p>
            This offer remains valid until <strong>{dateLabel(offer.expiryDate)}</strong>. Please indicate your acceptance by signing a duplicate copy or confirming via email response.
          </p>
        </div>

        <div className="hr-letter-sign">
          <div className="hr-letter-sign-box">
            <strong>For Pantiss Foundation</strong>
            <div className="hr-letter-seal">
              <Sparkles size={11} /> Digitally Authenticated HR Release
            </div>
            <div style={{ marginTop: "16px", fontWeight: 600 }}>{offer.releasedBy}</div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Head of Human Resources</span>
          </div>

          <div className="hr-letter-sign-box" style={{ textAlign: "right" }}>
            <strong>Candidate Acceptance</strong>
            <div style={{ marginTop: "34px", borderTop: "1px dashed var(--border)", paddingTop: "6px" }}>
              Signature: {offer.status === "Accepted" ? "✓ Accepted Electronically" : "__________________"}
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {offer.candidateName}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="hr-buttons" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="cxo-button focus-ring" onClick={() => window.print()}>
            <Printer size={14} /> Print / Save PDF
          </button>
          <a
            className="cxo-button focus-ring"
            href={`mailto:${encodeURIComponent(offer.candidateEmail)}?subject=${encodeURIComponent(
              `Formal Employment Offer Letter - ${offer.designationTitle} (Pantiss Foundation)`
            )}&body=${encodeURIComponent(
              `Dear ${offer.candidateName},\n\nWe are pleased to extend an offer of employment for the position of ${offer.designationTitle} at Pantiss Foundation with an Annual CTC of ₹${offer.annualSalary.toLocaleString("en-IN")} (Monthly Gross: ₹${offer.monthlySalary.toLocaleString("en-IN")}).\n\nYour joining date is scheduled for ${offer.joiningDate}.\n\nPlease review the attached offer letter and confirm your acceptance before ${offer.expiryDate}.\n\nBest regards,\n${offer.releasedBy}\nPantiss Human Resources`
            )}`}
          >
            <Mail size={14} /> Draft Email
          </a>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {offer.status === "Released" && (
            <>
              <button
                className="hr-primary focus-ring"
                onClick={() => {
                  store.commit(
                    state => updateOfferStatus(state, offer.id, "Accepted"),
                    `Offer marked as Accepted by ${offer.candidateName}.`
                  );
                  onClose();
                }}
              >
                <Check size={14} /> Mark as Accepted
              </button>
              <button
                className="cxo-button focus-ring"
                onClick={() => {
                  store.commit(
                    state => updateOfferStatus(state, offer.id, "Declined"),
                    `Offer marked as Declined by ${offer.candidateName}.`
                  );
                  onClose();
                }}
              >
                <XCircle size={14} /> Mark Declined
              </button>
            </>
          )}

          {offer.status === "Accepted" && (
            <button
              className="hr-primary focus-ring"
              onClick={() => {
                store.commit(
                  state => onboardCandidateFromOffer(state, offer.id),
                  `${offer.candidateName} transferred to ERP Employee Onboarding!`
                );
                onClose();
              }}
            >
              <UserPlus size={14} /> Transfer to ERP Onboarding
            </button>
          )}

          <button className="cxo-button focus-ring" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
