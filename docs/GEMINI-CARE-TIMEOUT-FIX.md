# Gemini care timeout fix — 2026-10-30

Production logs showed `GEMINI_CARE_TIMEOUT`. Care previously inherited `GEMINI_MODEL`, which could select a slower model intended for another task.

- Care now uses its own `GEMINI_CARE_MODEL`, defaulting to `gemini-3.1-flash-lite`.
- Flash-Lite uses minimal thinking; output is capped at 4096 tokens, with concise descriptions and warnings.
- Production care model override is set to `gemini-3.1-flash-lite`.
- Deployed analyze-plant version 22, preserving the hosted Demo dataset route and internal authentication.
- Pl@ntNet remains responsible for image identification and confidence. Gemini receives names only. UI unchanged.

Live verification: a temporary Guest uploaded one existing hibiscus test image. The complete pipeline returned in 15,495 ms with Thai name ชบา, scientific name Hibiscus rosa-sinensis, unchanged confidence 0.44239, and non-fallback Gemini care (light, temperature, check interval and warnings). The uploaded image and temporary Auth user were deleted; user-owned records cascade on deletion.

This confirms one successful live request, not unlimited quota or guaranteed availability. Existing saved scan results are not regenerated; scan again for new care output. The interval remains a soil-check suggestion, not mandatory watering.

Verification: Edge type check and 8 Edge tests passed. Regression assertions cover the care model, minimal thinking, output cap, names-only input and unchanged recognition scores.
