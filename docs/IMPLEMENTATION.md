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

## Provider roles synchronized — 2026-10-05

Local files had reverted to the older Gemini image-analysis implementation. Retrieved the active analyze-plant version 15 from the existing Supabase project and restored its local handler and shared Pl@ntNet/Gemini-care modules. The deployed function already uses the requested roles, so no remote deployment or data changes were necessary.

Pl@ntNet receives the JPEG and supplies species, alternatives and confidence. Gemini receives only botanical names, supplies Thai names and care, and must preserve exact scientific species and scores. New local tests verify both calls, ownership, quota, non-plants, Thai names, immutable scores/species and bounded transient retries. The client allows the combined provider deadline and retains distinct provider errors. UI recognition labels now say Pl@ntNet; Thai-name/care content identifies Gemini; manually selected care identifies the catalog.

TypeScript, Vite production build, Deno checking, two hybrid Edge test groups and five existing app/database test groups passed. UI labels checked using a separate local fixture without creating accounts or uploading images. Fixture data is not a live recognition result. Existing saved scans were not rewritten.
