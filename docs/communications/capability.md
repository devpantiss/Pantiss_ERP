# Communications monitoring workspace

Capability: Pantiss communications operators plan campaigns, prepare content, track editorial readiness, record publication results, monitor media and coordinate stakeholder follow-ups.

Design contract: reuse the Pantiss dashboard shell, shared workspace controls and token-based light/dark themes. Quiet editorial hierarchy, violet communication accents and an upcoming-publications rail. Primary action: create content. Target viewports: 1440x900 and 390x844. Local reference: Business Development overview and existing login.

Actors: communications-manager demo account. Login is required for module routes; other demo modules redirect to Core Operations. These are client-side demo boundaries, not production authorization.

Surfaces: overview, campaigns, editorial calendar, content & approvals, stakeholders, media monitoring, performance reports. Content moves Idea → Drafting → In review → Approved → Published. Approval requires all three readiness checks. Publication can only be recorded from Approved; this records a manual publication and never posts externally. Metrics only include Published records and are explicitly manual samples. Campaign scope aggregates related content. Search/channel filters label their scope.

Persistence: browser-local state. Save failures retain current session changes and surface a warning. CSV exports content matching current content filters. Real email, scheduling, publication, analytics synchronization, document uploads and multi-user approvals are outside scope.

States: synchronous local initialization, existing route loader; empty filter results offer reset; invalid publication/approval shows actionable feedback; storage failure keeps in-memory changes; mutation success announces status; sample labels identify partial organizational coverage; demo login enforces module identity.

Open production decisions: CMS/social integrations, actual KPIs, media sources, consent evidence storage, role-based approvals, campaign budgets and retention policy. No third-party content is published or messages sent.
