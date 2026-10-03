# Friend UI upgrade — 2026-10-02

Source: `C:/Users/tarit/Downloads/aurafarming---สแกนและดูแลพืชสไตล์พิกเซิล กี.rar`.
Working project: `C:/Users/tarit/OneDrive/Desktop/aurafarming`.
Original files are backed up in `.tmp/before-friend-ui` on this computer. The archive's bundled node_modules were not imported.

The newer garden artwork, collection with search/location filters, login, identification catalog, Plant Match Score, care controls, growth form and profile are now integrated. Existing camera/gallery, placement and mission components retain their tested real-data handlers. The archive's simulated plant API and locally entered credential settings were removed. Gemini still runs through the original private Edge Function, and frontend configuration uses the original ignored .env.local.

Supabase project remains `vbxyswkoinqpdzcqltfv`. Migration `20261002112622_friend_ui_features.sql` has been applied. It adds manual catalog plants, owner-checked move/archive RPCs, care history, growth activity/notes/score snapshots, cumulative player Aura and weekly missions. Archiving preserves plant records and hides them from the active garden. Plant Match Score uses declared light (60%) and placement (40%); it is a heuristic, not a measured health score. Unknown plants get an explained provisional score of 50. Manual catalog records are marked manual with zero AI confidence and use a generic thumbnail; choosing a catalog entry after a scan does not retain the scan photo as that plant's cover.

Email login and signup call Supabase Auth. A guest adds an email, verifies it, and then sets a password, preserving the original user ID. Email verification links and Google OAuth need the production URL configured in Supabase. Google is currently disabled in the project and the UI indicates this; guest OAuth linking also requires manual identity linking. Real email delivery, account conversion and Google login were not tested with personal credentials.

Verification completed:

- TypeScript, production build, all five Node test groups, Edge type check and Edge test passed.
- Hosted anonymous API test passed: profile initialization, manual Monstera score 100, move, moisture event/history, private JPEG upload, growth notes and score snapshot, archive/active filtering, cumulative Aura 50 (manual 15 + growth 15 + two missions 20). Test images and both isolated test accounts were removed.
- Browser loaded the existing garden, collection, plant care, empty growth timeline/upload form and profile from the new UI. Physical phone camera access and OAuth/email confirmation require separate device/account verification.
- Build has a non-blocking bundle-size warning (approximately 699 kB JavaScript before gzip).

Supabase advisors report no ERROR. Guest-access warnings are intentional with owner RLS: [anonymous policy advisor](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins). Leaked-password protection is disabled in project settings: [password protection configuration](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). New low-traffic indexes are reported unused; these were retained for foreign-key/history lookups.

Run `npm run dev` from the working project, then open `http://localhost:3000`. Existing environment configuration is ready on this computer. The portable `aurafarming.code-workspace` points to this project.
