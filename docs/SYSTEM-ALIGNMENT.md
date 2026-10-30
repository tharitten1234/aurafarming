# Documentation and Live System Alignment

Checked on 30 October 2026 against local source, GitHub branch metadata, and read-only Supabase inspection. This is a dated snapshot, not a guarantee of future service availability. No recognition call, deployment, configuration edit, or database write was performed for this comparison.

## Confirmed Current State

- Supabase project `vbxyswkoinqpdzcqltfv` is `ACTIVE_HEALTHY`.
- Hosted `analyze-plant` is ACTIVE at version **24**. All nine retrieved function/dependency/configuration files match local source after normalizing line endings and trailing newlines.
- Normal scans use Pl@ntNet for image identification/confidence, then Gemini for names/care. A curated exact-species lookup overrides known Thai names.
- The configured care-model override matches `gemini-3.1-flash-lite`. This was checked by comparing secret-list metadata to known public model names; no provider API key was printed or persisted.
- The Demo route uses Pl@ntNet plus the Supabase `demo_plant_care` dataset. That table currently has **5 rows**; the normal frontend does not send the Demo careSource option.
- Email and Guest Auth are enabled; email confirmation is required; Google is disabled. Read-only connection preflight passed.
- Current public application tables are `profiles`, `plants`, `plant_scans`, `growth_logs`, `missions`, `user_missions`, `care_events`, and the Demo dataset table.

## Remaining Mismatches and Gaps

| Priority | Location | Text or implication | Actual behavior / correct description |
| --- | --- | --- | --- |
| High | `supabase/functions/.env.example:4` | Legacy Gemini settings are unused | `GEMINI_API_KEY` and `GEMINI_CARE_MODEL` are used by the current normal pipeline. Only the older generic `GEMINI_MODEL` entry is outside the current care fallback. |
| High | `supabase/functions/.env.example:6–8` | Model values are `gemini-3.8-flash` | Source default and verified hosted care override are `gemini-3.1-flash-lite`. Copying the template's explicit care override can select the older model even though the source default is different. |
| Medium | `supabase/functions/.env.example:3` | Perenual appears alongside required keys | Perenual is a retained legacy integration/test dependency, not a requirement for the normal Pl@ntNet/Gemini route. |
| Medium | `src/components/TimelineScreen.tsx:233,347,417` | Photo controls advertise +15 Aura/AuraScore without eligibility qualification | Hosted `private.growth_created` completes a due weekly photo mission; `private.aura_reward` awards +15 on the eligible transition to completed. Additional uploads do not repeat that weekly reward. Completing all active missions can also add the separate once-per-week +30 bonus. |
| Medium | `src/components/ProfileScreen.tsx:125,142` and placement/score screens | AuraScore names both accumulated player progress and placement suitability | Profile reads accumulated `aura_points`; the saved plant `aura_score` column is a placement Match Score. They are different quantities despite legacy names. The README separates them; application labels remain unchanged in this documentation task. |
| Medium | `index.html:7,9` and `metadata.json:3` | The Thai wording uses “ตรวจวัด” (measure) for light/space compatibility | The app estimates suitability from declared light and placement. It does not measure lux, air quality, humidity, temperature, or plant health with sensors. This wording risks overstating the capability. |
| Medium | Fresh-project deployment | A complete copy of the hosted Demo may be expected from migrations alone | `demo_plant_care` exists on the hosted project, but creation/seed data is not included in current repository migrations. Normal deployment and Demo provisioning are separate. The setup guide already states this. |
| Low | `careSource: perenual` in the Edge request schema | The request value can suggest that it selects Perenual | It is a retained compatibility value. Every non-Demo request currently takes the Gemini branch; it does not select Perenual. Do not document this as an available provider switch. |
| Low | Screenshot archive and portfolio export | Earlier UI images or generated mockups could be read as the current app | Captures reflect earlier development revisions; the portfolio image is generated presentation material. Neither should be cited as current UI parity, recognition accuracy, or proof of live feature success. |
| Publication | GitHub default branch | The redesigned README may be assumed to be published | At this check, `origin/main` is `3a67d47`; the documentation cleanup is local on `codex/repository-docs`. GitHub's default-branch README still contains older setup statements, including the earlier Gemini model fallback. No push or merge was performed in this comparison. |

The report references line numbers as observed at this check; later source edits may move them.

## Historical Records, Not Current Instructions

Archived documents describing Gemini-only identification, Perenual care, older model names, or earlier function versions preserve real development history. They have history notices and should not be rewritten to claim later behavior was already present.

The dated code review and presentation report also precede later fixes/deployment. Their original statements such as “not deployed” apply to their recorded stage. The later live report and this snapshot describe the subsequent hosted state.

## Verified Versus Still Unverified

Email/password login using disposable confirmed accounts and account isolation passed in the recorded live audit. That does not verify public signup email delivery, confirmation links from a real mailbox, Guest-to-email conversion end to end, password recovery, or Google OAuth. Physical phone cameras also remain outside that audit.

The readonly preflight proves connection/provider/session-guard checks only. It does not establish AI quota, plant-identification accuracy, email deliverability, or complete feature readiness.

## Changes Made in This Comparison

- Clarified curated Thai-name precedence and the actual feature-test scope in the README.
- Added the weekly-photo-reward qualification and the legacy score-label limitation to the README.
- Added this alignment inventory and links from the documentation index/setup guide.

The server environment template, UI wording, metadata, provider configuration, deployed function, and database were deliberately left unchanged under the documentation-only scope. The mismatches above are explicit follow-up items rather than silent behavior changes.
