# Business Development workspace

Capability: BD operators monitor funding opportunities, proposal readiness, partner relationships, follow-ups and annual targets across Pantiss thematic programs.

Design contract: quiet editorial workspace, existing Pantiss shell and semantic tokens; teal growth accents, compact readable tables, actionable deadlines. Primary action: create an opportunity. Targets: 1440x900 and 390x844. Local reference: existing Finance/M&E shell.

Implementation: typed opportunities, partners and activities; stage transitions from Identified through Qualified, Proposal, Negotiation to Won/Lost; local browser storage with visible failure feedback; no claimed remote synchronization. All metrics derive from opportunity records. Sample data explicitly labeled. CSV exports current filtered records. Details expose owner, next action, proposal checklist and activity history. Search and thematic filters share scope across views. Awarded records represent signed commitments, not cash receipts.

States: synchronous local initialization (no remote loading); empty search has reset; storage failures preserve current state and explain browser-only limitation; success confirmed inline; sample data marks partial organizational coverage; no new authorization boundary (demo workspace only).

Open production decisions: authenticated BD roles, backend integration, actual funder data, document storage, approval authority, fiscal target and FX policies. No real contracts, submissions or messages are sent.

Handoff: frontend implementation ready; production multi-user operations require backend and authorization contracts.
