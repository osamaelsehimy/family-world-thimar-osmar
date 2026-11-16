# Family World — Connected World Product Blueprint (v1)

**Product:** Family World – Thimar OSMAR  
**Developer:** OSMAR Ecosystems  
**Status:** Product blueprint / implementation plan. This document does not claim the planned features are implemented or launch-ready.

## 1. Product promise

Family World is one connected, family-safe, values-led world—not a loose collection of unrelated mini-games. Members learn, play, collaborate, complete practical challenges, improve a virtual home, and explore educational worlds. Real-world utility is the north star; virtual rewards must never be confused with money, investment, ownership, or guaranteed benefits.

The first flagship experience is **Thimar 3X — The 100 m² Flexible Family Apartment**. It combines:
- A playful progression loop inspired by merge-and-decorate games (original mechanics and art; no copying of Gossip Harbor, Candy Crush, characters, levels, UI, audio, or assets).
- A realistic architectural planning workflow with explicit assumptions and professional review gates.
- A shared family project in which members contribute according to permissions and age-appropriate roles.

## 2. Core connected loop

1. Choose a household profile (couple, small family, medium family, multigenerational, or custom).
2. Select a household goal and a room/zone to improve.
3. Play eligible mini-games, learning activities, and cooperative tasks.
4. Earn non-monetary FWP experience/points only from published, validated rules.
5. Spend eligible virtual home credits in the in-world catalogue to unlock decorative/furnishing choices. No cash value, cash-out, staking, betting, or purchase-to-win mechanics.
6. Place and arrange furniture, kitchen modules, storage, lighting concepts, and decor in the apartment planner.
7. Complete practical learning tasks (measure, compare, plan, budget, safety, accessibility, privacy, energy).
8. Collaborate with household members; review changes and approve shared decisions.
9. Submit a project portfolio and receive transparent feedback.
10. Unlock the next challenge based on learning/progress—not pay-to-win.

The loop must be useful even if the user never spends money and must not pressure children to make purchases.

## 3. Product areas and information architecture

### A. Home / World Hub
- Clear entry points: Continue Home Project, Play, Learn, Family Tasks, Marketplace, Community, Profile.
- One primary next action; avoid crowded navigation and duplicated 3X entry points.
- Show progress, family contribution, and next recommended task without exposing private household data publicly.

### B. Game Arcade
Organize games by genre and purpose, not one long mixed list:
- Classic tabletop: Dominoes, Ludo, Backgammon, Estimation, Sequence.
- Puzzle & merge: 1024, original match-3 game, Memory Match, Connect Four.
- Family party: Quiz, Who Am I?, Story in Turns, Treasure Hunt.
- Board adventures: Snakes & Ladders, Phase Challenge.
- Learning games: age-banded literacy, numeracy, science, environment, financial literacy, and Islamic values content with reviewed sources.

Each game card must truthfully show: playable / beta / coming soon; local / online; player count; estimated session; rules; age guidance; language support; and point eligibility. No empty cards or implied functionality. Coming-soon items must be clearly separated from playable games.

### C. Thimar Home Studio
- Household profile and needs.
- Realistic floor-plan editor (dimensions, walls, doors, windows, columns, wet areas, circulation).
- Area schedule with validated sum and explicit gross/net area definition.
- Furniture and kitchen catalogue with dimensions, placement, collision/clearance checks, and accessibility considerations.
- Lighting, ventilation, privacy, safety, storage, energy, materials, and budget tasks.
- Autosave, version history, undo/redo, compare versions, export portfolio.
- Clearly label concept outputs; they are not construction drawings, permits, or a substitute for licensed professional review.

### D. Marketplace / Home Store
- Start as a **virtual catalogue** of unlockable in-game items, not real commerce.
- Each item has category, dimensions, compatible room/zone, virtual credit cost, unlock conditions, locale, and asset/license provenance.
- Separate virtual items from any future real-world product listings.
- A future real marketplace requires seller verification, product safety/quality, pricing, delivery, returns, tax, consumer protection, moderation, and legal review.
- Location/time personalization must be opt-in and coarse-grained by default; do not infer or expose exact home location. Use region/country and local availability only when user explicitly enables it.
- Never imply a product is available, purchasable, or deliverable unless inventory and seller integrations verify it.

### E. Learning Worlds
- Short structured lessons, interactive stories, animated/cartoon episodes, characters, skill cards, quizzes, and hands-on family activities.
- The user's previously supplied cartoon/visual material should be treated as a source asset only after it is located and reviewed; do not invent its content.
- Build original characters and stories with consistent art direction and licensing records.
- Arabic, English, and Simplified Chinese content architecture from the beginning; Arabic-first UX with natural language quality review.
- Islamic references require careful source verification and scholarly review; distinguish established teachings from educational interpretation.

### F. Family & Community
- Shared household space with owner/guardian roles, age-appropriate member roles, consent-based collaboration, invitations, activity feed, and contribution history.
- Private household projects stay private by default.
- Children use guardian-supervised accounts and protected interactions.
- Public community requires reporting, blocking, moderation, safeguarding, and clear community standards before launch.

### G. Personal Progress / Member Dashboard
- Separate game practice stats from verified online match results.
- Separate learning completion, household contribution, and project review.
- FWP ledger must show source, rule, date, status, and reversal/correction history.
- Never equate game scores or family activity with employee productivity or financial performance.

## 4. Apartment challenge: baseline brief

- Total design target: 100 m², with gross/net measurement convention explicitly selected before final area validation.
- Flexible household profiles: couple; small family; medium family; multigenerational; custom.
- Reference plan must include a documented boundary, entrance, orientation, windows/facades, columns/structural constraints, shafts/wet services, and assumptions.
- A sample area schedule is illustrative only until the geometry and area convention are defined.
- Room and furniture dimensions must be editable and checked against circulation, door swings, access, and basic safety constraints.
- Challenge output: household brief, dimensioned concept plan, area schedule, furniture layout, privacy/circulation review, lighting/ventilation assumptions, material palette, budget range with assumptions, decision log, and reviewer feedback.
- A qualified architect/engineer must review any plan before it is represented as buildable or used for construction.

## 5. Game quality standards

### Ludo
- Replace the current linear 52-cell prototype with a recognizable classic cross-shaped Ludo board.
- Provide a concise illustrated rules tutorial before play, turn highlighting, legal-move highlighting, token selection, dice feedback, safe squares, home lanes, captures, and clear finish conditions.
- Define one rule variant and document it consistently across AR/EN/ZH.
- Mobile touch targets and contrast must be tested.

### Dominoes
- Keep current configurable rules, but improve visual quality and accessibility.
- Offer distinct board themes and tile palettes with readable pips and contrast (e.g. ivory, blue, green, warm wood; palettes must not alter game logic).
- Add color-blind-safe patterns/labels where needed.
- Validate tile orientation, open ends, responsive chain layout, and touch interaction.

### Playing cards
- Any card game needs a coherent deck system: four suits, clear rank hierarchy, accessible colors and suit symbols, readable backs, and consistent card dimensions.
- Red/black alone is insufficient for color accessibility; preserve suit symbols and contrast.
- Card games must publish their exact regional rule variant.

### 1024
- Improve polish, animations, responsive tile sizing, sound/motion preferences, tutorial, undo clarity, best score persistence, difficulty/goal modes, and accessible keyboard/touch controls.
- Test merge edge cases, win/continue, no-moves state, undo, restart, and score correctness.
- Do not add competitive leaderboards until anti-cheat and fair scoring are defined.

### Original match-3 game
- Create an original match-3 title with its own visual identity, board, pieces, boosters, level objectives, progression map, and sound/art direction.
- Do not copy Candy Crush characters, level layouts, art, names, effects, or distinctive UI.
- Levels should teach pattern recognition and optionally connect to home-project goals (e.g. earn a bounded decoration unlock), without creating pressure to spend.
- Offline/local play first; online events only after fairness, privacy, and moderation design.

## 6. Rewards, points, and economy

- Maintain a distinction between FWP achievement points, non-monetary in-game credits, and any future real-money transactions.
- Publish earning rules, caps, expiry (if any), eligibility, review requirements, and correction process.
- Never sell FWP, promise investment returns, offer cash redemption, or permit wagering.
- Store unlocks must not imply real-world ownership or delivery.
- Prevent duplicate awards with idempotency keys and server-authoritative award rules.
- For children, no targeted monetization, manipulative timers, loot boxes, or pressure mechanics.

## 7. WBS and delivery phases

### Phase 0 — Product and technical audit
- Inventory every route, card, game, challenge, table, RPC, and feature flag.
- Tag each as implemented, partially implemented, prototype, planned, or retired.
- Remove duplicate navigation and misleading empty/coming-soon cards.
- Review permissions, RLS, child safety, privacy, analytics, and dependencies.

### Phase 1 — Coherent shell and visual system
- Establish navigation, design tokens, typography, iconography, card hierarchy, responsive layout, and AR/EN/ZH content conventions.
- Create shared game shell and common states (loading, error, paused, rules, results).
- Deliver high-fidelity Ludo board, Domino palettes, and 1024 polish.

### Phase 2 — Apartment vertical slice
- Household profiles and family collaboration.
- Fixed documented reference apartment geometry.
- Functional plan editor and area validation.
- Furniture/kitchen catalogue with dimensions and placement.
- Save/version history and export.
- Challenge tasks, rubric, reviewer workflow, and safe FWP award.

### Phase 3 — Connected game-to-home progression
- Game catalog metadata and level system.
- Reward rules mapped to specific home unlocks.
- Original match-3 playable MVP.
- Shared family goals and contribution attribution.
- Anti-abuse and duplicate-award tests.

### Phase 4 — Learning worlds and content
- Content management model, lesson/episode/character taxonomy, translations, review workflow, asset licensing, accessibility.
- Add supplied cartoon assets only after source inspection and rights confirmation.

### Phase 5 — Marketplace foundations
- Virtual-only store with original assets and inventory metadata.
- Real-world commerce is a separate gated project requiring legal, seller, payment, tax, fulfillment, return, and consumer-safety integrations.

### Phase 6 — Release readiness
- Automated tests, cross-device QA, security review, accessibility, performance, backup/restore, monitoring, privacy policy, child-safety policy, support, and release rollback.
- Google Play publication requires a release-grade Android package/build pipeline, signing, store listing, privacy/data safety disclosures, content rating, testing tracks, and policy compliance. A PWA is not itself a Play Store release.

## 8. Definition of done

A feature is not “ready” because it renders or builds. It must have:
- Acceptance criteria and tested user flows.
- Arabic, English, and Simplified Chinese coverage where in scope.
- Mobile layout and accessibility checks.
- Loading, empty, error, offline, and recovery states.
- Authorization/RLS and abuse tests for server-backed behavior.
- Data retention and privacy notes.
- Telemetry that measures product health without exposing sensitive family data.
- Documentation and rollback plan.

## 9. Current baseline — known limitations to preserve honestly

At the time this blueprint was drafted:
- Domino is a local game against bots; online rooms are a waiting lobby, not synchronized gameplay.
- Ludo is a local prototype with a linear track, not a familiar classic cross-shaped board; it is not online.
- 1024 is a playable local game but needs the quality improvements listed above.
- Several catalogue games are placeholders/coming soon and are not playable.
- Thimar 3X has an initial task/submission workflow, not the full realistic floor-plan/furniture studio.
- The public app is a PWA; this is not the same as a published Google Play app.
- Existing points and game activity must be presented according to their actual validation source; local practice results are self-reported.

## 10. Immediate next implementation gate

Do not attempt a broad “everything at once” rewrite. First:
1. Audit current app routes and remove duplicated/empty presentation.
2. Define shared visual design tokens and reusable game cards.
3. Rebuild Ludo as classic cross-board and complete rule tutorial.
4. Add selectable, accessible Domino table/tile color themes.
5. Improve 1024 and add regression tests.
6. Prototype the apartment loop with one room (kitchen or living room): earn a clearly labeled virtual unlock through a game/learning task, place a dimensioned item, save the layout, and see the family contribution.
7. Only then expand the full furniture catalogue and original match-3 progression.

**Release principle:** Ship a smaller coherent, tested product rather than a wide catalogue of unfinished promises.
