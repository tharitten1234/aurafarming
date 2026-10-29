# Setup and Deployment

This guide describes the current repository. It does not change or provision a Supabase project automatically.

## Local Development

Use Node.js 22.12+ and npm. The checked development environment used Node.js 24. The Vite package supports `^20.19.0 || >=22.12.0`.

```bash
npm ci
```

Copy [the frontend template](../.env.example) to `.env.local` and enter your configured project's values:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

```bash
npm run dev
```

The development script requests port 3000. Open the URL printed by Vite. Only the project URL and publishable key belong in the browser; never prefix privileged or provider keys with `VITE_`.

## Supabase Project

For an existing project, review its migration history before applying changes. For a new project, review [the SQL migrations](../supabase/migrations/) and configure the CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migrations define application tables, ownership rules, private image storage, farm onboarding, and care/reward functions. Auth identities remain in `auth.users`; application profiles are linked by user ID.

The optional Demo route reads `demo_plant_care`, a dataset prepared in the existing hosted project. The repository migrations do not create or seed that dataset. A fresh deployment supports the normal Gemini route; Demo needs its dataset provisioned separately.

### Authentication

In the Supabase dashboard:

1. Enable Email authentication for account login and signup.
2. Enable Anonymous sign-ins if the Guest flow will be used.
3. Configure the Site URL and allowed redirect URLs for local and deployed frontends.
4. Configure email delivery and test confirmation links on an account you control.

Signup asks for email/password. Farm naming happens after authentication inside the game. Google login is optional, needs separate provider credentials, and was disabled in the latest recorded live check. Guest-to-Google linking also depends on manual identity-linking configuration.

### Server Secrets

The normal scan path needs these Edge Function secrets:

| Secret | Purpose |
| --- | --- |
| `PLANTNET_API_KEY` | Image identification and confidence |
| `GEMINI_API_KEY` | Thai names and care guidance |
| `GEMINI_CARE_MODEL` | Optional care-model override; source default is `gemini-3.1-flash-lite` |

Save secrets in the dashboard, or prepare an ignored server-only environment file and use:

```bash
npx supabase secrets set --env-file supabase/functions/.env.local --project-ref YOUR_PROJECT_REF
npx supabase functions deploy analyze-plant --project-ref YOUR_PROJECT_REF --use-api
```

The existing [server template](../supabase/functions/.env.example) includes legacy Perenual and Gemini model entries. Its comments and model values are historical: Perenual is not used by the current normal scan route, `GEMINI_MODEL` is not the current care fallback, and an explicit `GEMINI_CARE_MODEL` value overrides the source default. Review those entries rather than copying them blindly. The template is preserved unchanged by the repository cleanup.

Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the function runtime. The existing function configuration turns off gateway legacy JWT verification; the handler still requires a bearer token, verifies it with `auth.getUser()`, and checks ownership before reading a photo. Keep those checks intact.

## Data and Provider Flow

1. The browser compresses a selected/captured image to JPEG and uploads it under the user's private Storage path.
2. `analyze-plant` validates the session, path, size, and JPEG bytes.
3. Pl@ntNet returns species candidates and confidence.
4. Gemini receives names only and adds Thai names/care. The server preserves scientific names and confidence.
5. The user selects a candidate and placement before saving a plant.
6. Database functions enforce care rules, ownership, suitability scoring, and rewards.

If Gemini is unavailable, the app retains recognition with an explicit unavailable-care notice. Unknown values remain unknown. The Demo route uses a prepared Supabase dataset instead of Gemini. Historical scan records are not rewritten.

## Checks

```bash
npm run lint
npm test
npm run check:edge
npm run test:edge
npm run build
```

`lint` runs `tsc --noEmit`. Node tests include PGlite with minimal Auth/Storage test schemas and a simulated DOM; Edge tests mock HTTP services. They do not verify phone hardware, email delivery, AI availability, or remaining quota.

With the frontend running, `npm run check:presentation` performs read-only connection checks. An alternative frontend URL can be passed with `npm run check:presentation -- https://your-app-url`.

`scripts/smoke-live.mjs` is a legacy write-enabled test utility. It creates a Guest account, uploads images, can consume recognition quota, and removes uploaded images but does not delete the test Auth user/domain rows. Do not use it as a routine readiness check. Arrange full cleanup before an intentional run; this repository cleanup does not execute or modify it.

## Frontend Deployment and Phone Testing

`npm run build` writes `dist/`. `npm run preview` serves it locally for inspection; it is not a production hosting service. Deploy `dist/` to a static host and configure the Supabase redirect URLs for that host.

A phone camera needs a trusted HTTPS origin. For local demonstrations, keep both Vite and the HTTPS tunnel running. The existing Vite configuration allows one specific Quick Tunnel hostname; a newly assigned hostname will need a deliberate configuration update. No tunnel or hosting configuration is changed by this documentation task.

Test gallery upload, permission denial, physical camera capture, scan/save, and reload on the actual phone. See the [latest recorded live results](reports/LIVE-FEATURE-VERIFICATION-2026-10-30.md) for the checks already performed and the remaining limits.
