# Account and farm naming fix — 2026-10-03 (Bangkok)

The reported permanent account already had its own profile and zero plants. Its legacy signup name was in Auth metadata, while the profile still displayed `Farmer AUR`. The migration recovers explicit legacy names, including the reported `slac`, without copying another account's garden.

Signup now asks for email and password only. Email confirmation remains required when configured by Supabase. After entering the game, a profile with no farm name must complete the naming screen. The owner-only `set_farm_name` RPC validates 1–80 trimmed characters and saves both `farm_name` and the displayed name. Profiles are created immediately by a private trigger on Auth signup; existing missing profiles are backfilled. Auth remains the identity/password system, and `public.profiles` contains app data linked by `user_id` — no duplicate password/user table is introduced.

Regular service calls require an existing session and cannot silently create a guest identity. Only the Guest button creates one. Switching identities clears plants, missions, growth records, profile and staged scans; stale initialization/data responses are rejected. Pending guest-to-email password setup is tied to that user ID. Guest conversion preserves its existing account and garden.

Verification: TypeScript, production build and five test groups passed. Actual PostgreSQL tests cover immediate profiles, empty/overlong name rejection, distinct names, RLS isolation and a new account not inheriting existing plants. Hosted verification with two temporary accounts confirmed automatic profile creation before initialization, separate names/gardens and name persistence after restoring a session. Both test accounts were removed. Browser signup shows two fields and the in-game naming screen is displayed. Actual personal email delivery, password entry and confirmation were not performed by the agent.

Supabase advisors report no ERROR. Existing Guest warnings are intentional with owner policies: [anonymous access advisor](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins). Existing project setting: [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

Reference: [Supabase user profiles and signup triggers](https://supabase.com/docs/guides/auth/managing-user-data).
