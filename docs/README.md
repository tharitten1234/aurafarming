# Documentation

Start with the repository [README](../README.md) for the project overview.

## Current Guides

- [Setup and deployment](SETUP.md): local development, server secrets, Auth, and deployment steps.
- [Thai plant name references](THAI-PLANT-NAMES.md): sources for the deterministic name lookup.
- [Screenshots](screenshots/README.md): existing UI captures and their limitations.
- [Repository organization](REPOSITORY-CLEANUP.md): moved files, retained assets, and cleanup recommendations.
- [System alignment check](SYSTEM-ALIGNMENT.md): source/hosted comparison and remaining legacy wording or setup mismatches.

## Reports

These are dated records, not promises about current hosted service availability.

| Report | Use |
| --- | --- |
| [Live feature verification — 30 October 2026](reports/LIVE-FEATURE-VERIFICATION-2026-10-30.md) | Latest recorded browser/API checks, cleanup results, and unverified flows |
| [Code review — 30 October 2026](reports/CODE-REVIEW-REPORT-2026-10-30.md) | Academic review of an earlier source snapshot; some findings were addressed later |
| [Presentation fixes](reports/PRESENTATION-FIX-CHECK.md) | Missing-photo and scan-cancellation fixes before the later live audit |
| [Gemini timeout fix](reports/GEMINI-CARE-TIMEOUT-FIX.md) | Flash-Lite change and the live check before the latest deployment |

The code review and presentation report intentionally preserve their original branch and deployment statements. Read the later live verification report for the subsequent rollout; use the current source for actual behavior.

## Development History

[Archived notes](archive/README.md) document earlier UI imports, provider changes, and implementation work. In particular, older Gemini-only and Perenual descriptions do not describe the current normal scan path.

The [portfolio export](../exports/portfolio/README.txt) is generated presentation material, clearly separated from real UI captures.
