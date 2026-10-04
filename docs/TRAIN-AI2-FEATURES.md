# Feature rules on train-ai2 — 2026-10-05

No screen components, CSS, navigation, assets or App.tsx layout were changed. Existing controls display the revised data and use the existing APIs.

## Implemented

- Pl@ntNet still receives the image and returns scientific species and confidence. Gemini receives botanical names only, translates common names into Thai and supplies species-specific care without changing recognition results.
- Plant Match Score has an explicit domain function name. Its 60-point light / 40-point location rule is preserved, recalculated on movement, and remains separate from accumulated Aura. The older function name is a compatibility alias for existing screens.
- Soil inspection instructions include the individual plant's care description. A damp/wet result completes eligible soil missions without watering. A water record requires a fresh dry-soil check within 24 hours; duplicate same-day water records are idempotent. A calendar interval alone never flags a plant as needing water.
- Leaf care uses inspection instead of compulsory wiping for unknown species, cactus and other species outside the broad-leaf list. It never auto-schedules fertilizer or pruning.
- Weekly photo missions award +15 Aura once, ordinary missions +10, and completion of all active missions +30 once per owner/week. Additional photos remain available for comparison but do not award extra Aura, XP or coins. Existing plant-addition rewards and previously earned points are preserved.
- Skipped missions stay skipped on photo/soil actions. Postponed missions cannot be claimed early, show the actual due date, and become pending when due. Weekly boundaries use Asia/Bangkok independently of the device timezone.
- Current Care Streak becomes zero after a missed day. A persisted best streak preserves an earned badge. First-plant and photo badges count all owner records, including archived gardens; the displayed active plant count remains unchanged. Completed-task profile statistics use lifetime completed missions.

## Care references and limitations

Gemini care is still AI advice. The 15-species manual catalog is not claimed to be fully reference-verified. General soil-check guidance is supported by [RHS container watering](https://www.rhs.org.uk/container-gardening/how-to-water-containers). Verified Monstera context comes from [NC State Extension](https://plants.ces.ncsu.edu/plants/monstera-deliciosa/); the curated pet-toxicity warning comes from [ASPCA](https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants/swiss-cheese-plant).

For other species, toxicity is explicitly unknown until a source is verified. Unsourced toxicity/safety warnings are removed rather than treated as verified facts. Gemini descriptions must be Thai and exclude unsupported toxicity or ingestion claims. Source coverage is deliberately small; no claims are borrowed from a similar species.

The new best-streak field is seeded from each current stored streak; historical best streaks that were never recorded cannot be recovered. Previously saved identification rows are not rewritten. Photo Timeline remains user comparison, not automatic disease diagnosis.

Notification scheduling, chat, AR and automatic health analysis were not added because they require new controls or a separate product scope. Existing authentication, image compression, ownership checks and private Storage remain.

## Verification and rollout

PostgreSQL/PGlite tests exercise the actual migration, soil checks, wet-soil mission completion, reward idempotency, skip/postpone handling, best streak, owner isolation, archived plants and score recalculation. Domain tests cover Bangkok boundaries and badge persistence. Existing camera and recognition tests remain.

After explicit user authorization, the database migration at `supabase/migrations/20261004192914_care_mission_rules.sql` was applied to the existing Supabase project `vbxyswkoinqpdzcqltfv` as hosted migration `20261004194723_care_mission_rules`. Gemini guidance is deployed in the existing `analyze-plant` function (version 16). The source stays on `train-ai2`; no merge to main/develop was performed.

Hosted transaction tests passed for the dry-soil watering guard, damp-soil mission completion, duplicate watering and photo reward protection, +15 photo Aura, +30 weekly completion bonus, and best-streak persistence. All test records were rolled back. Metadata checks confirmed the new guards and trigger, removal of the old per-upload Aura trigger, zero inconsistent best streaks, and no authenticated-client UPDATE privilege on best streak. The earlier 14 local/Edge test groups, lint, build and Edge type checks passed.

The post-deployment security advisor reports the existing anonymous-user policy warnings (guest play is intentional and owner policies remain in place) and disabled leaked-password protection. This migration does not change Auth configuration or those policies.
