# AuraFarming seminar MVP

Uses the updated friend-supplied RAR UI (garden scene, collection, login, care, timeline and profile) with the existing React + TypeScript + Vite + Tailwind and Supabase integration. See `docs/FRIEND-UI-UPGRADE.md` for the completed upgrade and verification.

## Local setup

Requires Node.js 22.12+ (tested with Node 24). Install with `npm ci`.
Copy `.env.example` to `.env.local` and set:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Only the publishable key belongs in the browser. Never put `GEMINI_API_KEY` or a Supabase service-role key in a VITE_ variable. `.env.local` is ignored by Git. Run `npm run dev`, then open http://localhost:3000.

## Supabase setup

For this workspace, migrations and `analyze-plant` have been deployed to project `vbxyswkoinqpdzcqltfv` (Aurafarming). The frontend URL/publishable key are configured in the ignored `.env.local`.

For another project:

1. Enable **Authentication → Sign In / Providers → Anonymous → Save**. Guest sessions use real auth.users IDs and the authenticated database role. Email login/signup uses Supabase Auth; guest email conversion verifies email before setting a password. Configure redirect URLs for your deployment. Google login requires the Google provider credentials; linking a guest to Google also requires manual identity linking.
2. Use the Supabase CLI installed as a pinned dev dependency:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

3. In **Edge Functions → Secrets**, save `GEMINI_API_KEY`. Set `GEMINI_MODEL` if needed; the single default is `gemini-3.8-flash`. Do not send the key through chat or place it in frontend files. Alternatively copy `supabase/functions/.env.example` to the ignored `supabase/functions/.env.local`, enter the real values, and run:

```powershell
npx supabase secrets set --env-file supabase/functions/.env.local --project-ref YOUR_PROJECT_REF
npx supabase functions deploy analyze-plant --project-ref YOUR_PROJECT_REF --use-api
```

The function config disables gateway legacy JWT verification, but the handler requires a bearer token and verifies it through Supabase Auth `getUser()` before any image access. Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY inside the function runtime. Neither is shipped as a privileged browser credential.

## Data and image ownership

Signup asks only for email/password. After successful authentication, accounts without a saved farm name set it in the game before entering the garden. Auth identities stay in `auth.users`; an insert trigger immediately creates the linked row in `public.profiles`, even before email confirmation. `profiles.farm_name` is saved by an owner-only RPC. Existing explicit signup names are recovered from legacy metadata; garden records are not copied between accounts. Session changes clear the previous garden and reject stale responses. Only the explicit Guest button creates an anonymous identity.

Tables: `profiles`, `plants`, `plant_scans`, `growth_logs`, `missions`, `user_missions`, `care_events`. All have RLS. Mission definitions are read-only shared content; other rows are private to their owner. Composite foreign keys prevent references to someone else's plants/scans. Aura, XP and rewards are applied atomically by internal database functions; completed missions cannot be reopened for repeated rewards. Weekly missions renew on initialization using the Bangkok calendar, with a once-per-week completion bonus. Water rewards are limited to once per plant/day. Badges derive from persistent progress.

Private bucket: `plant-images`, max 5 MB, JPEG/PNG/WebP. Storage SELECT/INSERT/UPDATE/DELETE policies require the first path segment to equal auth.uid(). Paths are `{userId}/scans/...`, `/growth/...`, `/avatars/...`. Browser uploads are compressed to JPEG at max 1600 px. Photos display through signed links, refreshed before expiry. No public unrestricted uploads.

Flow: camera/gallery → Storage → analyze-plant → Gemini structured JSON → saved scan → existing identification/placement/AuraScore screens → saved plant → Garden/Care/Missions/Growth/Profile. Non-plants and unnamed species cannot create a plant record. Alternatives include their own care requirements. AuraScore is deterministic and is recomputed in the database from validated scan requirements, placement and light.

## Verification

```powershell
npm run lint
npm run build
npm test
npm run check:edge
npm run test:edge
```

`npm test` exercises the actual PostgreSQL migration using PGlite with minimal test Auth/Storage schemas, RLS isolation, foreign-key ownership, duplicate rewards, AI validation and the camera component in a simulated DOM. Edge tests mock Supabase/Gemini HTTP responses and verify authentication/path validation, valid results, non-plants, malformed responses and upstream failures. These tests do not establish hosted Gemini success or physical camera compatibility.

`scripts/smoke-live.mjs` tests the configured hosted project with a separate anonymous user and a temporary image transport fixture; it removes the test image afterwards. Run only intentionally because it creates an anonymous test account. The fixture is not a plant recognition test.

## Test on a phone

Use an HTTPS deployment of the built `dist` directory, or a trusted HTTPS tunnel to the local Vite server. Plain `http://PC-IP:3000` on a phone cannot provide live camera access. Open the HTTPS URL in Safari/Chrome, enter Scan, allow the camera, frame a real leaf/flower and press the shutter. Check the actual identification, select placement/light, save and reopen the plant. Complete care/mission actions, add a fresh growth photo and refresh: data should still load for the same anonymous browser session. Deny camera permission separately and test Gallery; it should still work. The shutter opens the mobile capture picker if live video is unavailable.

## MVP limitations

- Guest identity persists in this browser; the Guest return button restores the same garden. Clearing browser data loses access unless the account has been linked to a verified email. Email delivery and Google OAuth require project configuration and have not been verified using a real personal account.
- Weekly missions are generated when the user opens the app; push notifications are not implemented.
- Growth AI assessment is a nullable field, not implemented; growth photos/notes persist.
- Pixel plant sprite and avatar are decorative artwork retained from the approved UI, not generated per species. The actual captured photo is used in identification/growth views.
- AuraScore uses declared light/placement as a heuristic, not measured lux, air circulation or temperature. Unknown light produces an explained provisional score of 50.
- A per-user scan limit is 20/hour; anonymous account abuse controls/CAPTCHA require project configuration for a public release.
- Hosted verification and physical phone camera results are recorded in `docs/IMPLEMENTATION.md`. Do not infer them from the local tests.

References: [Supabase anonymous sessions](https://supabase.com/docs/guides/auth/auth-anonymous), [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control), [Edge Function auth](https://supabase.com/docs/guides/functions/auth), [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output).
