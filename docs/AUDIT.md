# AuraFarming audit (2026-10-02)

Reviewed the 23 original files before implementation. No AGENTS.md, backend,
Supabase dependency, database migrations, tests, lockfile or installed dependencies existed.

- `App.tsx`: navigation uses `currentScreen` state; all domain data uses React
  state initialized from `src/data/mockData.ts`. Refresh loses mutations.
- `GardenScreen`: lists demo plants, only renders first four, awards water rewards
  immediately. Footer has a fixed count/happiness.
- `ScannerScreen`: existing getUserMedia, video, canvas and gallery FileReader.
  Camera is opt-in, preview uses sample images, stream assignment occurs before
  video mounts, gallery selection leaves stream running; fake 1.2s scan delay.
- `IdentifyScreen`: fixed Monstera/Pothos/Philodendron candidates and confidence;
  manual picker uses unrelated fixed names and generic care traits.
- `PlacementScreen`: location/light choices reusable; tip assumes Monstera care.
- `AuraScoreScreen`: deterministic light + position formula, but ignores species
  requirements; reasons always assume indirect light. No actual air measurement.
- `CareDetailScreen`: nickname/moisture callbacks use state; history is fabricated.
- `MissionsScreen`: tasks from App/mockData; immediate reward messages; empty
  tasks would cause a NaN percentage.
- `TimelineScreen`: demo dated photos; new entry reuses current plant image.
  Empty garden can dereference undefined in the comparison/add modal.
- `ProfileScreen`: fixed user and badges; Reset Demo resets in-memory data.
- `Navigation`, `Toast`: reusable navigation/feedback; WebAudio sound effects
  preserved. CSS, index.html, main.tsx preserve the approved pixel visual design.
- `types.ts`: reuse Plant, Task, Badge, TimelinePhoto, UserProfile, PlacementConfig
  and ScreenType; extend with identification/storage/care fields.
- `mockData.ts`: contains fixed plants/scores/tasks/growth/player/badges plus
  remote decorative assets. Keep artwork, remove runtime demo domain data.
- `.env.example`: describes Gemini key locally. Replace with browser Supabase
  variables; Gemini secrets belong in the Edge Function environment only.
- `package.json`: unused Gemini/Express dependencies; scripts for dev/build/tsc.
  `vite.config.ts` does not inject Gemini secrets. tsconfig lacks strict checking.
- README is AI Studio boilerplate; metadata describes camera/server Gemini;
  gitignore already ignores local env files.

Implementation: keep these screen files and navigation; add small service modules,
anonymous session, private storage, RLS migrations and a validated server AI proxy.
Supabase connector returned no projects at audit time, so hosted verification needs
the user's project and server secret. Do not substitute mocks for failed requests.
