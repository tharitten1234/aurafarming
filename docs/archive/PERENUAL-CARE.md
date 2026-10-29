# Perenual care integration

> Historical record: provider choices, setup steps, and deployment states may be outdated. See the [documentation index](../README.md) for current guidance.

The scan pipeline uses Pl@ntNet for identification and confidence, and Perenual for care lookup by exact scientific name. Gemini is no longer called by `analyze-plant`. Existing saved scans retain their historical advice.

Set `PERENUAL_API_KEY` as an Edge Function secret only. No key belongs in the browser or repository. Endpoint documentation: https://www.perenual.com/docs/api.

Search results are matched to the exact species; cultivar or different-species matches are rejected. Supported watering, light and difficulty fields are presented using Thai templates. Temperature and soil-check intervals remain unknown when not provided. Established Thai names come from the existing manual catalog; other names explicitly show that a verified Thai name is unavailable, with the scientific name retained. This is not automatic translation of every botanical name.

A bounded one-hour cache reduces repeat lookups within an Edge instance; it is not persistent or shared across instances. Up to two API requests are needed per uncached candidate. Missing or inaccessible details show an explicit unknown-care message. Provider quota, configuration, timeout or invalid-data errors preserve Pl@ntNet recognition and return explicit unavailable-care text with unknown care fields. A short circuit breaker stops repeated calls within the same Edge instance. Scores are never increased or replaced.

Verification: TypeScript, Edge type checks, build, five existing Edge test groups and the new Perenual group passed. Live search accepted the supplied key; live detail/adapter requests returned HTTP 429, so successful live care retrieval has not yet been verified. The key was saved as a Supabase secret and the function deployed to the existing project. Only the care-provider label changed on the result screen; layout and other features were preserved.
