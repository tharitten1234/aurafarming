# Empty pots and Gemini diagnosis — 2026-10-02

Garden slots are now data-driven. The old background had four plants painted into it regardless of the database; the new background has clear terrace floor. Vacant slots show an isolated transparent empty terracotta pot derived from the user's attached reference. An existing record without a known scientific species also shows the empty pot. Empty slots open scanning when clicked; archived plants free their slot. The original background is retained as a source asset.

Hosted logs showed Gemini 503 outages at 12:20, 12:21 and 12:32 UTC, followed by 429 at 12:32 UTC. A separate live test against the deployed version 11 returned `GEMINI_DAILY_QUOTA`: the Google project's requests-per-day quota is exhausted. Auth, Storage upload/download and the Edge handler work. No key values were read or changed. The temporary test image and test account were removed.

Version 11 keeps the original model and authenticated owner-path validation. Transient 502/503/504 responses get at most two retries with exponential backoff under the 45-second deadline. A 429 is not retried. Structured quota identifiers distinguish per-day quota from short-term rate limiting; the handler exposes only safe codes and retry delay, not raw provider messages. The frontend reports the cause and enforces a retry pause before uploading another scan. This does not increase the external quota.

To restore Gemini analysis, wait for the applicable quota reset or review the API key's Google project's quota/tier in Google AI Studio. No billing upgrade was performed. References: [Gemini troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting), [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits).
