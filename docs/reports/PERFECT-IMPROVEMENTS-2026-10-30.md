# Perfect branch improvement review — 30 October 2026

Branch: `perfect`. Changes remain local; production and `main` are unchanged.

## Changes

- Load nine secondary screens with React.lazy and show a themed loading state.
- Add an application error boundary with reload recovery; do not clear local storage or saved gardens.
- Show an offline notice and remove connection listeners on unmount.
- Correct photo reward wording: the weekly photo mission pays once per plant per week, not for every photograph.
- Distinguish level experience from Aura points and placement Match Score.
- Keep the timeline plant selector and its displayed photos consistent after the selected plant disappears.
- Bound long toast messages and plant selectors to the phone viewport.
- Support keyboard focus, editable text selection, browser zoom and reduced motion while retaining the pixel farm artwork, fonts and palette.
- Describe placement scoring as an estimate rather than a sensor measurement.

## Evidence

- TypeScript and production build passed.
- Frontend tests: 15 passed, including two recovery/connectivity regression tests.
- Edge typecheck passed; Edge tests: 8 passed.
- Before: one 707.10 KB JS entry. After: 381.21 KB entry plus 215.22 KB Supabase chunk, with secondary screens loaded separately. This is a bundle result, not a measured device speedup.
- Edge browser checks at widths 320, 390, 430 and 1280: login visible, no horizontal overflow or page errors; offline notice appears and disappears.
- Live temporary-account checks: onboarding, actual Pl@ntNet/Gemini scan, placement/save, ownership isolation, care guards, growth photo and duplicate-reward protection, manual plant actions.
- Separate session audit: reload, settings/logout, login and A→B→A farm isolation passed without browser runtime errors.
- The older combined audit stopped at outdated button selectors (old photo label, then settings label). Those are automation failures; the independent session audit covers settings/logout. Do not report the combined script as entirely passed.

## Boundaries

No database migrations, provider changes, new dependencies, Git push or production deployment in this round. Existing uncommitted documentation and private exports were preserved. Physical phone cameras, email delivery, API quota exhaustion and high-load behavior remain outside this verification.
