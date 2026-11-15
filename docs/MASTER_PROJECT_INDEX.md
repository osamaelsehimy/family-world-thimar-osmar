# Family World — Canonical Project Index

This file is the single entry point for product, design, engineering and operating decisions. It points to the canonical source files; it does not erase historical prototypes or approved decisions.

## Canonical documents

1. **Master product direction:** [MASTER_PRODUCT_BLUEPRINT.md](./MASTER_PRODUCT_BLUEPRINT.md) — one ecosystem, three products, Sponge City extension, SMART/OKR/KPI framework and staged roadmap.
2. **Requirements and MVP scope:** [Family World PRD & MVP Roadmap v1](../) — the approved baseline is maintained in the owner's Library as `Family_World_Final_PRD_MVP_Roadmap_v1.docx`. It defines requirements, release gates, proposed pilot scorecard and non-functional requirements.
3. **Technical architecture:** `Family_World_Technical_Architecture_v1.docx` in the owner's Library — modular monolith, domain boundaries, identity, data and service architecture.
4. **Identity and authorization:** `Family_World_Owner_Identity_Access_Plan_v1_2.docx` and `Family_World_Role_Matrix_Login_Test_Plan_v1_2.xlsx` in the owner's Library; repository implementation policy: [OSMAR_RBAC_LEAST_PRIVILEGE.md](./OSMAR_RBAC_LEAST_PRIVILEGE.md).
5. **Delivery backlog:** `Family_World_MVP_Execution_Backlog_v1.xlsx` in the owner's Library. Keep one current backlog and close duplicates only after reconciliation.
6. **Product vision and challenge guide:** [FAMILY_WORLD_VISION_GUIDE_AR_EN.md](./FAMILY_WORLD_VISION_GUIDE_AR_EN.md).
7. **Game networking contract:** [ONLINE_GAME_ENGINE_SPEC.md](./ONLINE_GAME_ENGINE_SPEC.md).
8. **Brand assets:** [BRAND_ARTWORK_INTEGRATION.md](./BRAND_ARTWORK_INTEGRATION.md) and [ORIGINAL_ASSET_POLICY.md](./ORIGINAL_ASSET_POLICY.md).
9. **Quality and release truth:** [QA_AUDIT_2026-11-15.md](./QA_AUDIT_2026-11-15.md), automated scripts in `scripts/`, migrations in `supabase/migrations/`, and GitHub Actions results.

## Source-of-truth rules

- Product decisions: this index + Master Product Blueprint + approved PRD. If they differ, record a decision and update the canonical document; do not silently pick a prototype.
- Implemented behavior: source code + applied database migrations + passing automated tests + verified deployment.
- Member records: Supabase `auth.users` and `public.profiles`; never reconstruct the member count from visible member-code sequence numbers.
- Permission truth: server-side RPCs, RLS and trusted `app_metadata`; never client-only hidden buttons.
- Artwork truth: approved original files and the artwork register; a placeholder illustration is not official brand artwork.
- KPI truth: source records with a timestamp and definition. Demo values must be visibly marked as samples.

## Historical material — preserve, don't confuse with production

The Library includes early prototypes such as `Family_World_Thimar_OSMAR_v3.html`, `family_world_ecosystem_v1.html`, `index.html`, `Family_World_OSMAR_v4_1_Pilot.html` and the family pilot HTML. These are design/history references, not production applications. Do not merge their demo data, localStorage state, sample balances or demo admin controls into the production member database.

The owner also supplied an official artwork ZIP. Keep it as the source archive until its files are integrated and verified in the repository. Do not delete or overwrite the archive.

## File hygiene

- Keep one canonical current document per topic; older versions remain archived with a clear “superseded” note rather than being silently deleted.
- No duplicate production apps, credentials, real member exports or personal child data in the repository.
- Every new feature has an owner, acceptance criteria, tests, migration (if needed), and release note.
- Do not remove a file until its contents have been reconciled into a canonical source and references have been checked.
