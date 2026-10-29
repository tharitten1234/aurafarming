# Repository Organization Review

This cleanup changes documentation and documentation asset locations only. No files were deleted. Application features, UI, dependencies, database schemas, Supabase configuration, environment templates, and runtime directories are intentionally unchanged.

## Findings

- The root already contains mostly necessary entry points, manifests, editor metadata, and build configuration. Moving these would add risk without improving navigation.
- The documentation root mixed current instructions, dated provider investigations, and twelve screenshot files. Some older reports describe Gemini-only or Perenual pipelines that no longer match the normal route.
- `exports/portfolio/` already groups the generated mockup with its provenance note. It remains separate from real screenshots.
- `docs/THAI-PLANT-NAMES.md` is cited in a source comment, so its path is preserved. Its description was updated to reflect the current provider roles.
- The tracked runtime artwork files have distinct SHA-256 hashes. Similar names are not evidence of duplicate content.
- `scripts/smoke-live.mjs` writes to a real project and has incomplete account cleanup. It is preserved unchanged and documented as a legacy, intentional-run utility; it is not part of normal setup or the read-only preflight.

## New Layout

```text
docs/
  README.md                 Documentation index
  SETUP.md                  Current setup and deployment guide
  THAI-PLANT-NAMES.md        Curated name references; original path retained
  REPOSITORY-CLEANUP.md      This inventory and cleanup recommendations
  reports/                  Dated code review and verification reports
  archive/                  Earlier implementation and provider notes
  screenshots/              Existing captures, unchanged image bytes
exports/portfolio/          Existing labelled mockup and provenance
```

## Files Modified or Added

| File | Change |
| --- | --- |
| `README.md` | Rewritten in simple English with project overview, actual features/stack, existing screenshots, setup, structure, status, and verified attribution |
| `docs/README.md` | Added a guide to current documentation and dated evidence |
| `docs/SETUP.md` | Added detailed setup/deployment guidance extracted from the old root README and checked against current source |
| `docs/THAI-PLANT-NAMES.md` | Corrected the outdated Perenual-only description; kept source citations |
| `docs/REPOSITORY-CLEANUP.md` | Added organization inventory and future review list |
| `docs/archive/README.md` | Added an index identifying historical provider/deployment records |
| `docs/screenshots/README.md` | Added screenshot index and capture/mockup distinctions |

Each moved Markdown report receives a brief dated/history notice. Its original findings remain as historical evidence. The implementation report's garden screenshot link and documentation path list were updated for the new locations. The existing relative link between the workspace comparison and UI-import note still resolves because both moved together.

## Complete Move List

Every source path below was directly under `docs/`; filenames are preserved.

| Original file | New location |
| --- | --- |
| `AUDIT.md` | `docs/archive/AUDIT.md` |
| `AUTH-FARM-ONBOARDING.md` | `docs/archive/AUTH-FARM-ONBOARDING.md` |
| `FRIEND-UI-UPGRADE.md` | `docs/archive/FRIEND-UI-UPGRADE.md` |
| `GARDEN-GEMINI-FIX.md` | `docs/archive/GARDEN-GEMINI-FIX.md` |
| `GEMINI-CARE-RESTORED.md` | `docs/archive/GEMINI-CARE-RESTORED.md` |
| `IMPLEMENTATION.md` | `docs/archive/IMPLEMENTATION.md` |
| `PERENUAL-CARE.md` | `docs/archive/PERENUAL-CARE.md` |
| `PRODUCTION-AUDIT-2026-10-17.md` | `docs/archive/PRODUCTION-AUDIT-2026-10-17.md` |
| `TRAIN-AI2-FEATURES.md` | `docs/archive/TRAIN-AI2-FEATURES.md` |
| `UI-WORKSPACE-CHECK.md` | `docs/archive/UI-WORKSPACE-CHECK.md` |
| `CODE-REVIEW-REPORT-2026-10-30.md` | `docs/reports/CODE-REVIEW-REPORT-2026-10-30.md` |
| `GEMINI-CARE-TIMEOUT-FIX.md` | `docs/reports/GEMINI-CARE-TIMEOUT-FIX.md` |
| `LIVE-FEATURE-VERIFICATION-2026-10-30.md` | `docs/reports/LIVE-FEATURE-VERIFICATION-2026-10-30.md` |
| `PRESENTATION-FIX-CHECK.md` | `docs/reports/PRESENTATION-FIX-CHECK.md` |
| `verified-empty-pots.jpg` | `docs/screenshots/verified-empty-pots.jpg` |
| `verified-farm-onboarding.jpg` | `docs/screenshots/verified-farm-onboarding.jpg` |
| `verified-friend-ui.jpg` | `docs/screenshots/verified-friend-ui.jpg` |
| `verified-garden.jpg` | `docs/screenshots/verified-garden.jpg` |
| `verified-hybrid-identification.png` | `docs/screenshots/verified-hybrid-identification.png` |
| `verified-missions-layout.png` | `docs/screenshots/verified-missions-layout.png` |
| `verified-navigation-clean.png` | `docs/screenshots/verified-navigation-clean.png` |
| `verified-navigation-restored.png` | `docs/screenshots/verified-navigation-restored.png` |
| `verified-plantnet.png` | `docs/screenshots/verified-plantnet.png` |
| `verified-provider-roles.png` | `docs/screenshots/verified-provider-roles.png` |
| `verified-shared-navigation.jpg` | `docs/screenshots/verified-shared-navigation.jpg` |
| `verified-ui-polish.png` | `docs/screenshots/verified-ui-polish.png` |

## Candidates for Later Review — Not Deleted

| Files or group | Reason to review | Safe next step |
| --- | --- | --- |
| `public/garden-pixel-art.jpg`, `public/garden_scene_only.jpg` | No direct reference found in the current source, entry point, or scripts; earlier notes say original artwork was retained as source material | Confirm artwork provenance/external tooling, then consider an approved source-art archive; do not remove on filename alone |
| `docs/screenshots/verified-navigation-clean.png`, `docs/screenshots/verified-navigation-restored.png`, `docs/screenshots/verified-ui-polish.png` | Overlapping historical UI checks; no exact-duplicate claim | Keep indexed history for now; request approval before removing captures after a current screenshot set exists |
| `scripts/smoke-live.mjs` | Legacy write-enabled audit with incomplete Auth-user cleanup | Review or replace in a separate engineering task before considering archival/removal; no script behavior changed here |
| `exports/portfolio/aurafarming-ui-mockup.png` and its `README.txt` | Presentation material rather than a runtime asset | Already grouped correctly; optionally relocate to a dedicated portfolio repository only after owner approval, keeping provenance with it |
| `exports/quota/` | Pre-existing untracked local account/quota screenshot, not portfolio content | Keep out of commits; owner should approve any later deletion |
| Ignored `.tmp/`, `dist/`, `node_modules/`, and `supabase/.temp/` | Local backups, generated build/dependency/tool state, not tracked project presentation | No deletion performed; `.tmp/` may contain useful backups and private data, while dependencies/build output can be regenerated |

`metadata.json`, `aurafarming.code-workspace`, lockfiles, `.vscode/settings.json`, environment templates, migrations, and all source/runtime folders are retained. External tools may use root metadata even when there is no source import. Legacy provider modules remain because tests import them; they are not safe deletion candidates in this documentation-only task.

## Validation Scope

The cleanup checks local Markdown links and image targets, unchanged protected-file hashes, unchanged screenshot bytes, tracked-file retention, and Git diff scope. Existing TypeScript, build, Node, and Edge checks are run without intentional hosted writes. Installation is documented with `npm ci`; no dependency install or environment/configuration change is part of this cleanup.

The full inventory above accounts for every new, modified, or moved documentation file. Decisions about deleting any retained file require a separate approval; no deletion is needed to use this layout.

### Results of This Cleanup Check

- All local Markdown links and HTML screenshot paths in the README and documentation resolve.
- The four README badge URLs, maintainer link, and local development URL returned HTTP 200 when checked. The example Supabase URL is intentionally a placeholder, not a live service.
- All 83 tracked files outside the documentation scope match their pre-cleanup SHA-256 hashes, including source, runtime assets, scripts, manifests/lockfiles, and configuration.
- All 26 moved files are retained; all twelve moved image files have unchanged bytes.
- TypeScript, production build, 13 Node test cases, Edge TypeScript, and 8 Edge test cases passed. The existing approximately 707 kB JavaScript bundle warning remains.
- A local Markdown preview at desktop and 390 px mobile width loaded the screenshots and had no page-level horizontal overflow. This approximates GitHub layout; it is not a claim of a GitHub-hosted visual test.
- No dependency installation, environment edit, Supabase write/deploy, or application behavior change was performed for this cleanup.
