# Implementation report — 2026-10-02

The existing nine-screen React app has been connected to Supabase services without replacing the UI framework or duplicating screens. The audit is in `AUDIT.md`.

## Files created

- `src/services/{supabase,auth,images,scans,plants,missions,growthLogs,profile,auraScore}.ts`
- `supabase/config.toml`
- `supabase/migrations/20261002083143_seminar_mvp.sql`
- `supabase/migrations/20261002084821_security_indexes.sql`
- `supabase/functions/_shared/identification.ts`
- `supabase/functions/analyze-plant/{index.ts,index.test.ts,deno.json,deno.lock}`
- `supabase/functions/.env.example`
- `tests/{domain,database,camera}.test.ts`
- `scripts/smoke-live.mjs`
- `docs/{AUDIT,IMPLEMENTATION}.md`
- `package-lock.json`
- Ignored `.env.local` with the supplied public project configuration; no Gemini key.

## Files modified

`src/App.tsx`, `src/types.ts`, `src/index.css`, `src/data/mockData.ts`, and existing screen components: Garden, Scanner, Identify, Placement, AuraScore, CareDetail, Missions, Timeline, Profile, Toast. Also `.env.example`, `.gitignore`, `package.json`, `tsconfig.json`, `vite.config.ts`, `README.md`.

Navigation, main.tsx, index.html, sound effects and metadata remain in place. Decorative assets stay in mockData.ts; no demo plants, missions, player or history are used at runtime.

## Deployed backend

Project: `vbxyswkoinqpdzcqltfv` (Aurafarming).

Six tables: profiles, plants, plant_scans, growth_logs, missions, user_missions. All six have RLS; shared mission definitions are read-only. Composite ownership foreign keys, explicit grants and atomic reward operations prevent cross-user references and repeated mission payouts. Security-definer implementation functions live in private; public RPC wrappers are invokers.

Bucket: plant-images, private, 5 MB. Four ownership policies cover SELECT/INSERT/UPDATE/DELETE under the user's first folder segment.

Edge Function: analyze-plant, deployed and active. It verifies sessions with Auth, validates owner image paths and JPEG bytes, asks Gemini for structured plant/care data, validates output and stores scans. No frontend Gemini call/key. Environment model override has a single gemini-3.8-flash default.

## Verified

- Strict TypeScript compilation and Vite production build passed.
- Five Node test groups passed: camera/fallback/gallery/lifecycle, migrations/RLS/rewards, deterministic AuraScore, malformed AI and non-plant guards.
- Deno type checking and Edge handler tests passed (HTTP services mocked).
- Both migrations applied to the hosted project; all six tables have RLS and the bucket is private.
- Hosted security advisor initially returned no findings after the second migration. After anonymous sign-ins were enabled, the latest advisor warns about intentional anonymous authenticated access to owner-protected tables and Storage. Ownership isolation is covered by database tests. See [anonymous access advisory](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins). It also reports [leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection); this MVP currently uses anonymous sessions rather than password accounts.
- Anonymous sign-in, real profile initialization/query, mission definitions and empty Garden/Growth queries passed against the actual API after Anonymous Sign-ins was enabled.
- A real plant reference image from the existing approved asset was uploaded to private Storage, read back through a signed link (63,283 bytes), then removed.
- Live Gemini analysis identified Monstera deliciosa at confidence 0.98. Hosted plant insertion, database-calculated AuraScore 100, moisture care, mission completion, growth-photo insertion and restored-session reload all passed. The two dedicated CLI test identities and their domain records were cleaned up; uploaded objects were removed by the smoke script.
- Browser gallery → Gemini identification → placement → AuraScore → save to Garden → page reload passed. The sample Monstera remains in the browser's anonymous garden for review; screenshot: `verified-garden.jpg`.
- Production JavaScript scan found no GEMINI_API_KEY, Gemini API endpoint, service_role or Google API-key pattern. The publishable Supabase key is intentionally public.

## Remaining verification

The earlier missing-secret HTTP 503 is resolved. Subsequent browser attempts encountered Google Gemini HTTP 503. The handler now retries transient 502/503/504 responses at most twice within its existing 45-second deadline; success after a transient outage and persistent-outage bounds are tested. The complete browser flow then passed.

Camera lifecycle/fallback was tested with a simulated DOM; a physical phone camera and phone HTTPS flow still need testing. Browser verification covers startup, empty Garden/Missions/Growth/Profile and the complete gallery scan/save/reload flow. Care, mission and growth persistence also passed against the hosted API.

`smoke-live.mjs` can take an actual JPEG path and verify hosted analysis → plant save → care → mission → growth log → reload from a restored session. It creates a separate anonymous test identity, deletes its uploaded image objects after the run, and prints only test IDs/statuses, never tokens/keys. Test domain rows need explicit cleanup using those test identity IDs after validation.

## Run/configuration

See README for local setup, the two VITE_SUPABASE_* variables, server-only GEMINI_API_KEY/GEMINI_MODEL, migration/deploy commands and HTTPS phone camera testing. No secrets were committed; this workspace has no Git repository initialized. Known seminar MVP limitations include one-time starter missions, no push notifications/account linking, optional growth AI assessment not implemented, and heuristic AuraScore rather than sensor measurements.

## Pl@ntNet migration — 2026-10-03

- New analysis uses Pl@ntNet v2/all with automatic organ detection, five candidate results and the existing Auth/Storage/owner checks. Server-only PLANTNET_API_KEY was saved in the existing project. Gemini is no longer called for new scans.
- Existing database rows and API contracts remain compatible. The legacy gemini_model column records plantnet-v2/all for new scans; no migration or existing garden edits were required.
- Pl@ntNet does not supply the care fields used by the app. These remain null/unknown, with an explanation and the existing provisional AuraScore calculation. No care requirements were inferred from another species.
- Live public Pl@ntNet sample recognition succeeded: Hibiscus rosa-sinensis, score 0.44239, four alternatives. The low score correctly triggers the existing uncertain-result path. Language th returned No localization available for th; requests now use en. Common/scientific names come from the provider.
- Deployment and configured-function authentication check passed (missing session rejected with 401). Live verification did not create remote accounts or domain records. The full authenticated storage/save path was covered by mocked Edge and PostgreSQL tests, not rerun against a real user account.

## Thai names and Gemini care — 2026-10-03

New scans retain Pl@ntNet species recognition and confidence. Gemini receives the scientific names (not the photograph), translates all candidate common names into Thai, and returns species-specific Thai care guidance. The server requires Thai names, complete matching species, valid care values and unchanged confidence. Unknown requirements remain null/unknown. Non-plants bypass Gemini. Existing records are not rewritten.

Gemini uses the existing server secret and model, with an optional GEMINI_CARE_MODEL override. Transient 502/503/504 responses retry at most twice within a 30-second deadline. Provider-specific errors explain unavailable service, quota, configuration and incomplete Thai results. Keys remain server-only.

Mission cards now give task names room and place compact rewards below them. Identification uses a smaller photo and scrollable care content with fixed confirmation controls. Both layouts were visually checked at 340 × 707; the shared navigation was not changed.

Live Gemini verification returned ชบา and Thai care for Hibiscus rosa-sinensis, retaining the fixture scientific name and confidence. A short-lived token-protected verification function was deleted after use. No user account, garden or scan record was created by that verification. The authenticated analysis path is covered by mocked Edge tests; it was not rerun against a real user's session.
Final verification: TypeScript, production build, Deno check, all 3 Edge tests and all 5 app/database test groups passed. Updated analyze-plant was deployed to vbxyswkoinqpdzcqltfv. Temporary local layout pages and probe token were removed.

## Provider roles synchronized — 2026-10-05

Local files had reverted to the older Gemini image-analysis implementation. Retrieved the active analyze-plant version 15 from the existing Supabase project and restored its local handler and shared Pl@ntNet/Gemini-care modules. The deployed function already uses the requested roles, so no remote deployment or data changes were necessary.

Pl@ntNet receives the JPEG and supplies species, alternatives and confidence. Gemini receives only botanical names, supplies Thai names and care, and must preserve exact scientific species and scores. New local tests verify both calls, ownership, quota, non-plants, Thai names, immutable scores/species and bounded transient retries. The client allows the combined provider deadline and retains distinct provider errors. UI recognition labels now say Pl@ntNet; Thai-name/care content identifies Gemini; manually selected care identifies the catalog.

TypeScript, Vite production build, Deno checking, two hybrid Edge test groups and five existing app/database test groups passed. UI labels checked using a separate local fixture without creating accounts or uploading images. Fixture data is not a live recognition result. Existing saved scans were not rewritten.

## PR #2 conflict resolution — 2026-10-05

Merged develop into train-ai while retaining the compact identification/mission layout, care display and all existing UI improvements. Recognition labels and manual-selection attribution come from the latest provider-role change. Both Edge test sets are retained: five Edge groups cover normalization, ownership, upstream failures, Thai care, unchanged species/confidence and bounded retries. All five app/database groups, TypeScript, Deno checking and production build passed before merging the PR.
