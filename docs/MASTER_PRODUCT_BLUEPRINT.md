# Family World × Thimar × OSMAR — Master Product Blueprint

**Product owner baseline:** 08 November 2026 PRD, with the implementation state maintained in this repository.  
**Steward:** OSMAR Ecosystems.  
**Principle:** بسم الله أوله وآخره — useful real-life value before gamification.

## 1. One ecosystem, three products

| Product | Job to be done | Core experience |
|---|---|---|
| **Family World** | Make useful family and community activities engaging | Safe family spaces, age-appropriate missions, games, shared progress, community service |
| **Thimar** | Turn trusted knowledge into applied learning | Reviewed learning paths, lessons, knowledge checks, applied tasks and progress records |
| **OSMAR** | Help organizations execute work visibly | Organization workspaces, projects, OBS/WBS, work items, milestones, risks, PMO and KPI reporting |

The products share identity, localization, consent, notification, audit and analytics foundations. Their family, learning and business data remain separately scoped. One deployment may host the modules, but a shared login never grants cross-domain access.

## 2. Product principles

1. Islamic values are the ethical foundation: sincerity, trustworthiness, justice, mercy, family ties, service, moderation and excellence. Religious material must be sourced and reviewed by qualified people; quotation, translation and explanation must be clearly distinguished.
2. Real-world usefulness comes before points, streaks or competition.
3. Child privacy, guardian oversight, accessibility and age-appropriate experiences are defaults.
4. FWP and THP are progress indicators only—not money, securities, ownership or investment returns.
5. The canonical product is multilingual and localization-ready (Egyptian Arabic first, English and Chinese interfaces), with controlled market activation.
6. Performance figures must be derived from real records. Demo figures must be labelled as examples.
7. A role assignment is not authorization by itself: server-side permission checks and tenant scope are authoritative.

## 3. Family World experience

Seven practical worlds organize family participation: home and daily life; family and relationships; learning and skills; nature and sustainability; work and enterprise; health and movement; community and service.

The first missions should be short, repeatable, safe for mixed ages and useful offline. Each mission has an age suitability, clear instructions, evidence/acceptance criteria, an owner or family context, and a reviewed points rule. Points are posted only by the trusted server-side ledger.

## 4. Three flagship 3X challenges

### 4.1 Family home — 100 m²

A 10 × 10 m learning challenge: household needs, room zoning, circulation, privacy, lighting, ventilation, water/energy, materials and a preliminary cost estimate. Deliverables are educational concepts, not licensed construction drawings.

### 4.2 Enterprise / campus — 10,000 m²

A 100 × 100 m project challenge for teams and specialists. It uses an OBS (who is accountable), WBS (what work is required), PMO controls, site flows, suppliers, schedule, cost, risks, safety and feasibility. Expert review is required before any real-world implementation.

### 4.3 Egypt city-region — 1000 × 1000 planning grid

A collaborative virtual planning canvas developed cell by cell. It is a learning and coordination model—not a cadastral map, title register, official zoning plan or building permit. Layers include land use, homes, education, worship, health, public services, mobility, water, energy, green/blue infrastructure, logistics, suppliers and community facilities.

### 4.4 Sponge City / water-sensitive city layer

Preserve the Sponge City idea as a first-class sustainability layer within the city challenge. The concept is to absorb, retain, clean, reuse and safely route water instead of treating rainfall as waste or sending all runoff immediately into drains.

Candidate planning systems:
- Permeable streets, paths and parking surfaces.
- Rain gardens, bioswales, planted swales and tree trenches.
- Green roofs and shaded green corridors.
- Wetlands, retention/detention ponds and constructed water landscapes.
- Rainwater harvesting for suitable non-potable uses.
- Greywater reuse only with appropriate treatment and public-health controls.
- Floodable parks, safe overland flow paths and emergency overflow routes.
- Catchment-level water balance, water-quality and maintenance planning.

Each city cell should record: catchment context; rainfall/runoff assumptions; infiltration/soil constraints; storage and conveyance capacity; water-quality risks; intended reuse; overflow path; maintenance owner; and affected communities. Do not invent engineering capacities: require local rainfall, soil, flood and utility data plus qualified engineering review.

Suggested indicators: runoff retained on site; peak runoff reduction; rainwater captured/reused; permeable/green-blue area share; water-quality compliance; flood-exposure reduction; maintenance completion. Baselines and targets must be set by qualified local specialists.

## 5. SMART, OKRs and KPIs — one management language

### SMART objective test
Every objective must be **Specific, Measurable, Achievable, Relevant and Time-bound**. It must name an owner, a baseline, a target, a due date, the evidence source and the review cadence.

### OKR structure
- **Objective:** a qualitative outcome that matters.
- **Key Results:** 2–5 measurable outcomes proving progress.
- **Initiatives:** the work selected to move the Key Results.
- **Owner / cadence:** one accountable owner and a weekly or monthly review.
- OKRs describe intended change; they are not a task checklist and must not be gamed by rewarding activity volume alone.

### Initial cross-product OKR examples (proposed pilot hypotheses)

**O1 — Families experience real value and return.**
- KR1: At least 50% of invited pilot families create a family space and complete a first mission within 7 days.
- KR2: At least 40% of started pilot missions are completed, interpreted by mission difficulty.
- KR3: Week-4 active-family retention reaches 25% as an early learning signal.

**O2 — Thimar turns learning into application.**
- KR1: At least 60% of enrolled pilot learners complete a first lesson within 7 days.
- KR2: At least 40% of lesson completers submit an applied task.

**O3 — OSMAR makes project delivery visible.**
- KR1: At least 70% of pilot organizations create a project and update one work item weekly.
- KR2: Establish a baseline for weekly active project contributors, overdue work, milestone health and open risks before setting a numeric scale target.

**O4 — Trust and reliability are release gates.**
- KR1: Zero unresolved critical safety/privacy incidents at pilot start; any critical incident triggers immediate pause and escalation.
- KR2: At least 99% crash-free pilot sessions and all critical journeys pass.
- KR3: Every privileged member/role change is audited and every protected operation has server-side authorization tests.

These are proposed pilot signals from the product requirements baseline, not forecasts, guarantees or industry benchmarks. Final targets follow usability testing and cohort baselines.

### KPI dictionary

| KPI | Definition / calculation | Source |
|---|---|---|
| Activation | Invited pilot families completing setup + first mission within 7 days ÷ invited pilot families | Family events |
| Mission completion | Completed missions ÷ started missions, segmented by mission and age suitability | Mission lifecycle |
| W4 retention | Families active in week 4 ÷ activated families in the cohort | Privacy-aware events |
| Learning activation | Learners completing first lesson within 7 days ÷ enrolled learners | Thimar records |
| Applied learning | Applied tasks completed ÷ lesson completers | Thimar task records |
| Project activation | Pilot organizations creating a project and updating one work item weekly ÷ pilot organizations | OSMAR project/work records |
| Milestone health | On-time milestones ÷ milestones due in period; report planned vs actual | OSMAR milestones |
| Work overdue | Open work items past due date | OSMAR work items |
| Open risk exposure | Count and weighted exposure of open risks by severity | OSMAR risk register |
| Crash-free sessions | Sessions without a crash ÷ all measured sessions | Platform telemetry |
| Critical trust incidents | Count of unresolved critical safety/privacy incidents | Moderation/security cases |
| Sponge City water retention | Modelled/observed runoff retained or reused within a catchment, with stated baseline and method | City challenge evidence |

Do not display zeros for unavailable or unconnected sources as if they were measured results. Show **Not connected / No data yet** separately from a real zero.

## 6. Operating rhythm and accountability

- **Daily:** service health, failed sign-ins, urgent safety cases and critical defects.
- **Weekly:** mission quality, member support, project delivery, blockers and OKR confidence.
- **Monthly:** cohort retention, learning outcomes, project/milestone health, costs, privacy/security and partner pipeline.
- **Quarterly:** strategy, product boundaries, market readiness, risk appetite and whether to expand, iterate or pause.

A dashboard is only trustworthy if each metric has an owner, definition, source, timestamp, filter and drill-through to authorized records.

## 7. Release sequence

1. Stabilize identity, member directory, roles, consent, audit and recovery.
2. Complete one family mission lifecycle and reliable game progress.
3. Complete one Thimar path and applied task with human-reviewed sources.
4. Complete one OSMAR project workflow: project → work items → milestones → risks → report.
5. Pilot the 100 m² challenge, then the 10,000 m² track with specialists.
6. Develop the Egypt 1000 × 1000 city and Sponge City layer using validated local data.
7. Expand markets and mobile distribution only after privacy, legal, safety, support and reliability gates.

## 8. Governance and boundaries

- Family spaces and organization workspaces are separate tenants.
- Children do not have public discoverability or open stranger messaging by default.
- Sponsors receive only approved aggregate reporting; no child-level activity or personal identifiers.
- The map's movable nodes are presentation layout only; moving a node never changes membership, ownership or permissions.
- No points purchase, cash conversion, equity, investment or return claims.
- Religious and educational content has source, rights, language version, reviewer and correction history.
- Privileged actions require least privilege, audit records and MFA/step-up controls where applicable.

## 9. Current implementation truth

This blueprint is the canonical strategic entry point, not a declaration that every module is already implemented. The live code, database migrations, test results and deployment records remain the evidence of implementation. Use the repository QA audit and release checks to distinguish **Live**, **Partial**, **Planned** and **Blocked**. Never promote a concept to “live” merely because it appears in a vision document.
