# Family World — Master Delivery Register
**Owner:** OSMAR Ecosystems  
**Audit baseline:** 16 November 2026  
**Repository:** `osamaelsehimy/family-world-thimar-osmar`  
**Production branch:** `main` — this register is an audit proposal and does not change production behavior.

## Status vocabulary
- **Implemented / code present:** visible in the current source; production behavior still requires the stated tests.
- **Partial:** a foundation or limited slice exists, but the requested end-to-end capability is incomplete.
- **Prototype only:** present in a historical HTML/localStorage demo, not connected to production services.
- **Planned / documented:** described in product or technical documents, not implemented as a complete working feature.
- **Regression / missing from current navigation:** present in an earlier pilot or requested flow, but absent or inaccessible in the current app.
- **Verified production:** tested against the live deployment and real user sessions. Do not use this label without browser-level evidence.

## Executive findings
1. The membership system is **not a blank slate**. Trusted invite signup, member codes, pending status, approval RPC, invite creation RPC, directory RPCs, and an OSMAR admin console exist.
2. A concrete admin authorization mismatch exists: `osmar_pending_members()` checks the JWT `app_metadata.role = 'osmar_admin'`, while `osmar_review_member()` checks delegated permission `members.approve`. A delegated approver can therefore have permission to approve but fail to load the pending queue. The current app also renders the admin route only when that same legacy role claim is present.
3. The member directory RPC `osmar_member_directory_v2()` is owner-only, despite the permission catalogue defining `members.read`. The UI does not show email-confirmation status or invite-code usage/expiry/revocation details.
4. The current membership snapshot queried on 16 Nov 2026 showed 14 profiles, all marked active; 9 Auth users had confirmed email and 5 had not. There were 25 invitation codes, 18 usable, and 3 profiles without referral rows. This is a read-only snapshot, not a statement that these counts remain current. The active-but-unconfirmed records require owner review; this audit did not modify them.
5. The historical Friends & Family Pilot v4 had a draggable/editable network map, local admin tools, import/export of player result JSON/CSV, and sponsor/community tabs. These are not equivalent to production services. The current app has no network-map or friends/community route in its main navigation. Friends exists in an unmerged feature PR and is not part of current `main`.
6. The current app is trilingual at the UI-copy level (Arabic, English, Simplified Chinese), but that does not mean all learning content, moderation, support, legal materials, or every game has complete reviewed translations.
7. The 7 worlds and many game concepts are catalogued, but the worlds currently display “In development”; many games are explicitly disabled. Domino online is a lobby foundation, not a synchronized online match engine. Ludo is currently marked beta in the UI; technical specification says it is not yet a playable online multiplayer game.
8. The 3X 100 m² challenge has an implementation foundation. The 10,000 m² and 1000×1000 city-region concepts, Sponge City layers, and SMART/OKR/KPI/OBS/WBS/PMO/BI operating dashboards are primarily documented/planned rather than complete operational products.
9. The official artwork integration document identifies three required WebP files. Earlier repository review found the expected production asset paths were not populated on `main`; verify all three exact files before calling the brand artwork release complete.
10. The existing `docs/QA_AUDIT_2026-11-15.md` is historical and conflicts with the 16 Nov live snapshot (it reports 11 profiles and different invitation totals). Treat its test notes as dated evidence, not current membership counts or current release truth. Reconcile its PR and release-gate statements against current GitHub state before relying on them.

## Work register

| ID | Capability / request | Current evidence | Status | Priority | Acceptance / next action |
|---|---|---|---|---|---|
| FW-001 | Trusted invitation signup | Signup requires invite code and guardian attestation; auth trigger validates hash, expiry, revocation and use limit, increments usage, creates pending profile/referral and FW member code. | Implemented / code present | P0 | Browser test with confirmed and unconfirmed email, valid/invalid/expired/revoked/exhausted codes; verify no invite use is consumed on rejected signup. |
| FW-002 | Email confirmation reflected in membership admin | Auth records contain `email_confirmed_at`; directory RPC currently does not return it and UI has no verified/unverified badge. | Missing | P0 | Add safe confirmation field to owner/delegated-authorized directory response and show clear localized status. Do not approve unconfirmed records until policy is decided and enforced server-side. |
| FW-003 | Approve / reject memberships | UI calls `osmar_review_member`; RPC requires `members.approve`; pending queue RPC still checks only legacy app_metadata role. | Partial / authorization mismatch | P0 | Align pending queue and directory authorization with explicit permissions; test owner, delegated approver, invite-only operator and normal member. |
| FW-004 | Membership directory | Directory returns email, phone, member code, status, registration, referral type, inviter and profile labels; UI adds points/game stats and editing. RPC is owner-only. | Partial | P0 | Enforce `members.read` server-side for delegated readers; show email confirmation; avoid unnecessary child/personal data exposure. |
| FW-005 | Generate OSMAR invitation codes | UI calls `osmar_create_invite`; supports TRU/FAM/NET/OSM/TEAM, 1–500 uses, source label, copy feedback. RPC checks `invites.manage`. | Implemented / code present | P0 | Test real owner session, delegated invite manager and unauthorized member. Confirm code redemption, one-time visibility and usage accounting. |
| FW-006 | Invitation management history | UI shows only the newly generated code; it does not list historical codes, uses, max uses, expiry, revoked/exhausted state or source label. | Missing | P1 | Add owner/delegated-permission-safe invitation ledger; never reveal stored hashes or old raw codes. Add revoke flow and audit log. |
| FW-007 | OPM-style / custom invitation prefixes | Current RPC restricts types to TRU/FAM/NET/OSM/TEAM and emits type-prefixed random code; no OPM type. | Partial / decision needed | P1 | Confirm whether OPM is a new invite type or a brand campaign code; define mapping and redemption policy before migration. |
| FW-008 | Delegated administrators and least privilege | Permission manager UI and database assignment functions exist; core RPCs partly use permission checks. Pending queue and member directory still use inconsistent owner/legacy-role checks. | Partial | P0 | Complete server-side permission matrix for each operation; add tests for expiry, revocation, unconfirmed accounts, least privilege and audit events. |
| FW-009 | Editable family/network map | Pilot v4 has draggable SVG nodes, add/edit/delete/link/reset controls behind demo PIN and localStorage. No current app navigation/component for it. | Prototype only / regression from pilot | P1 | Rebuild as authenticated server-persisted admin workspace with owner-only structure changes, audit history, versioning and export. Never reuse demo PIN as security. |
| FW-010 | Friends / friend requests / community | A Friends feature exists in an open PR and migration, not current main. Current main navigation has no Friends or Community tab. | Not in production main | P1 | Review open PR, privacy and RLS; merge only after CI, cross-account and child-safety tests. Add block/report/moderation rules before broad community launch. |
| FW-011 | Seven practical worlds | Seven world definitions are localized in code; current world grid marks every world “In development”. | Partial / catalogue only | P1 | Deliver one complete world at a time with missions, age suitability, reviewed content, real progress and acceptance tests. |
| FW-012 | Playable games catalogue | Domino, 1024 and Ludo components are imported; several concepts (treasure hunt, Who Am I, story chain, backgammon, estimation, Sequence, snakes/ladders, quiz, memory, Connect Four) are disabled placeholders. | Partial | P1 | Publish an accurate Available/Beta/Coming Soon matrix and complete game acceptance tests before enabling each game. |
| FW-013 | Online Domino | Create/join/leave lobby foundation and Realtime lobby exist; no complete synchronized match engine. | Partial | P0 for online launch | Implement authoritative server state, private hands, legal move validation, idempotency, reconnect, final results and cross-device tests. |
| FW-014 | Online Ludo | UI marks Ludo Beta, but online engine specification says it is not a playable online game. | Planned / not online | P1 | Implement server-generated dice, legal moves, turn validation, reconnect and verified results; keep beta label until tests pass. |
| FW-015 | FWP points, awards and leaderboard | Member points summary, points directory and award RPC exist; local/demo points also exist in client experience. | Partial | P1 | Keep demo/local practice separate from verified awards; test idempotency, permissions and ledger audit. FWP is not money or ownership. |
| FW-016 | Thimar 3X — 100 m² family home | 3X experience, guide, challenge studio and apartment planner foundations exist; challenge workflow and server-side review/award RPCs exist. | Partial / active foundation | P1 | Test complete member submission/revision/approval and validate educational disclaimer (not licensed construction advice). |
| FW-017 | 10,000 m² enterprise/campus challenge | Described in master blueprint and concept materials. | Planned / documented | P2 | Define project workspace, OBS/WBS, PMO, schedule, risk, cost, safety and expert review acceptance criteria. |
| FW-018 | 1000×1000 city-region grid | Described as a collaborative planning concept, not a cadastral or official zoning system. | Planned / documented | P2 | Build cell/layer data model, collaborative permissions, provenance and geospatial QA; never imply legal land ownership or permit status. |
| FW-019 | Sponge City / water-sensitive planning | Master blueprint lists permeable streets, rain gardens, bioswales, green roofs, wetlands, retention ponds, rainwater harvesting, controlled greywater reuse and flood overflow routes. | Planned / documented | P2 | Build interactive layer and catchment data model; require local engineering/hydrology data and qualified review. |
| FW-020 | SMART / OKR / KPI / OBS / WBS / PMO / BI dashboards | Frameworks and candidate measures are in blueprint; no verified live operating dashboard is evidenced in current app. | Planned / documented | P2 | Define source-of-truth data, metric owner, calculation, cadence and permission scope before building dashboards. |
| FW-021 | Official character artwork and home planet composition | Artwork integration guide requires exact cover, character board and game board. Home experience and Character Studio have artwork slots; earlier review found expected brand files absent on main. | Partial / asset release gate | P0 visual identity | Upload exact owner-approved WebP originals to documented paths; verify all three load and restore the intended central planet/orbit/city hero composition on desktop/mobile. |
| FW-022 | Character/avatar studio and role cards | Character Studio has generic role concepts and image slots; app text explicitly says avatar/outfit customization and achievement progression remain in development. | Partial | P2 | Deliver safe avatar customization, approved character asset mapping, accessibility and moderated role-card progression. |
| FW-023 | Trilingual experience | Core UI strings include Arabic, English and Simplified Chinese. | Partial | P1 | Audit every screen, validation/error state, game rule, guide, accessibility label and support/legal content with human reviewers. Arabic Egyptian dialect remains the primary child/family voice. |
| FW-024 | Family Guide PDF | Guide page links to `OG01-Game-Guide-AR-EN.pdf`; a later generated 2.0 guide exists in project workspace. | Implemented / version alignment needed | P1 | Choose canonical guide version, ensure deployed link points to it, and check Arabic/English/Chinese coverage and all images. |
| FW-025 | Pilot export/import and family results CSV | Pilot v4 exports a player's JSON result and admin can import files, deduplicate submissions, export CSV/JSON. Current production app records local practice sessions and member points separately; no equivalent pilot file-import screen is evidenced. | Prototype only | P2 | Decide whether to retain a secure admin import workflow or replace with authenticated server submissions; never import untrusted points directly. |
| FW-026 | Sponsor/partner area | Sponsor tab exists in Pilot v4 only; no production route evidenced. | Prototype only | P3 | Define partner policy, child-safe advertising/sponsorship rules and disclosures before implementation. |
| FW-027 | Mobile PWA | Manifest/service worker and install prompt/help exist. | Partial | P1 | Test Android/iOS installation, update UX, offline limitations, cache invalidation and active-game-safe updates. |
| FW-028 | Islamic reference and reviewed learning | Product blueprint sets Islamic ethics as foundation and requires qualified review for religious material. Current UI includes values/verse references but no full editorial review workflow is evidenced. | Partial / governance needed | P0 content safety | Establish source citation, qualified reviewer, translation review, distinction between Quran/hadith/interpretation, correction and versioning workflow. |
| FW-029 | Child safety and privacy | Signup has guardian attestation; UI warns against entering child names/personal data. | Partial | P0 | Define age-appropriate accounts, guardian consent, minimization, retention/deletion, reporting/moderation and privacy policy. |
| FW-030 | Deployment and release assurance | GitHub Actions/Pages and migrations exist. Historical QA doc has stale counts and outdated PR statements; no current browser test evidence is available in this audit. | Partial | P0 | Reconcile QA doc, verify current main CI/deployment SHA, run real browser tests with owner/admin/member accounts, then release. |

## Historical Pilot v4 — feature comparison
The Pilot v4 HTML is a local-only prototype. Its map edits, missions, points, player identity, results and imported reports are stored in browser localStorage; admin access uses a demo PIN embedded in the file. It explicitly warns that there is no cloud account, live sync or server security.

Pilot features evidenced:
- 7 world tiles; family missions and lessons; demo FWP balance and badges.
- Player onboarding with display name, family, role and generated local player code.
- Interactive SVG network map with drag, add, edit, delete, relationship link and reset.
- Player JSON result export; admin multi-file JSON import; deduplication; CSV/JSON reports.
- Tabs for home, worlds, missions, network, cards/codes, learning, community, sponsors and admin.

Current production comparison:
- Authenticated signup, trusted invitation and member records replace pilot-only local identity.
- Current app has 7 world catalogue entries, game catalogue, profile/dashboard, Thimar 3X, Character Studio, guide and OSMAR admin.
- No production network editor, pilot JSON import/export, sponsor tab or visible friends/community tab is evidenced in current main.
- Pilot localStorage balances and admin PIN are not production security or points records and must never be migrated as authoritative data.

## Membership remediation sequence (no data edits in this audit)
1. Align `osmar_pending_members`, `osmar_member_directory_v2` and app route visibility with the same explicit server-side permission model. Preserve immutable owner access and least privilege.
2. Return Auth email-confirmation state to authorized admins and show it in the member directory.
3. Decide and enforce server-side whether email confirmation is mandatory before approval. Do not silently change the 5 existing active/unconfirmed accounts; present them for owner review.
4. Add invitation history with uses/max uses, expiry, revocation and source metadata; provide a safe revoke action.
5. Run browser tests using the real owner account, a delegated membership approver, a delegated invite manager, a normal active member and a pending/unconfirmed signup.
6. Verify each RPC denial and success case; run Supabase advisors and test the migration on a disposable database before any production migration.

## Release discipline
- This register is a baseline, not proof that each item is fixed.
- Do not merge feature branches or apply database changes solely because code compiles.
- Do not change live membership records, invite records, points or role assignments as part of an audit.
- Every item marked Partial/Planned needs an owner, tests and a release note before being called complete.
- Keep the public app on the last known-good main deployment until all P0 release gates pass.
