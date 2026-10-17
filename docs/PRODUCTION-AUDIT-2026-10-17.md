# train-ai2 verification — 17 October 2026

## Result

Core application operations passed against the existing hosted Supabase project using disposable accounts. One real scan identified the Wikimedia Commons Monstera photograph as `Monstera deliciosa` with confidence `0.87391`. Recognition remains usable when Perenual is unavailable. Perenual care retrieval is still unavailable in this live check, so complete species care coverage is not verified.

The supplied test authorization was used to create disposable identities, upload one photograph, exercise owner-scoped APIs and call the recognition endpoint once. Server credentials were captured only in process memory for cleanup; no credentials were printed or committed. All temporary account records and images were removed in finally blocks, including failure cases. Existing accounts and gardens were not changed.

## Hosted checks

- Anonymous authentication; profile creation by the signup trigger; farm onboarding and profile reload.
- Manual plant creation; reject watering before a fresh dry-soil observation; moist and dry observations; watering; rename; move.
- Private Storage upload and signed URL; live recognition with real provider score.
- Growth photo insertion and photo-mission completion; extra photo does not repeat Aura, XP or coins; password sign-in restores the same farm; archive removes the plant from the active garden.
- The first Timeline probe incorrectly reused a scans/ path and was rejected by the database constraint. Repeating with the normal growth/ path passed. This was a test-fixture correction, not a production-code defect.
- No missing plant or Timeline image objects were found in the pre-check. Two legacy anonymous identities from 2 October lack profile rows; the current signup trigger is enabled and new-profile creation passed. Existing initialize_profile handles profile creation on entry.

Email delivery, the complete browser signup/verification-link flow, Google OAuth and camera behavior on a physical phone were not exercised by this hosted API audit. Local tests cover camera fallback and ownership rules. This is not a claim that every browser or upstream service is error-free.

## Changes

- Bound optional Perenual care requests to an eight-second shared budget, including caller-provided abort signals, to reduce end-to-end scan timeout risk.
- Respect Perenual Retry-After as seconds or HTTP date, with bounded fallback, rather than always retrying after one minute.
- Avoid fetching Auth provider settings when Supabase is unconfigured. Login layout is unchanged.

TypeScript, production build, nine local test groups and seven Edge test groups passed. The new test exercises Retry-After parsing and bounds. The existing large-bundle warning remains.

## Deployment

After automatic approval review rejected the attempted production deployment, the user explicitly chose to keep this revision on train-ai2 and defer deployment. The last hosted function remains unchanged. The prepared deployment would replace only perenual-care.ts inside the retrieved hosted bundle, preserving the existing Demo dataset route and its authentication behavior. Do not blindly deploy the train-ai2 directory over the shared function: the hosted bundle also supports Demo requests.
