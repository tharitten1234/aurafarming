# AuraFarming presentation — branch demo

## Start

Run `npm run dev`, then open http://localhost:3000/?demo=1. For a built preview, run `npm run build` then `npm run preview` and use the displayed address with `?demo=1`. Keep the local server running. Open without the query parameter to use real Supabase authentication and live recognition.

The demo starts with five plants: Monstera deliciosa (มอนสเตอร่า), Epipremnum aureum (พลูด่าง), Dracaena trifasciata (ลิ้นมังกร), Ocimum basilicum (โหระพา), Echinocactus grusonii (กระบองเพชรถังทอง). Images are bundled original SVG illustrations, not photographs or proof of live recognition. Illustrations, profile and initial Timeline records are explicitly demonstration fixtures. The demo does not call Pl@ntNet, Perenual, Gemini or Supabase and does not alter real accounts or server data.

Changes persist in this browser under `aurafarming.presentation.v1`. Profile → reset restores the prepared garden and clears demonstration progress only. Browser storage limits may prevent persistence of many large photo uploads, but the current session remains usable. Authentication/sign-up must be demonstrated separately in the real mode with internet access; the demo is not evidence of hosted database integration.

## Five-minute presentation

1. Explain the aim: record plant care and encourage consistent observation through missions and Aura.
2. Open the seeded garden and select Monstera. Show its scientific name, prepared Thai care advice and location.
3. Check soil as moist: the soil mission completes without watering. Then check dry and demonstrate recording water where appropriate. This demonstrates software behavior, not advice to water a real moist plant.
4. Complete leaf inspection, open Timeline and upload a locally saved image. Use one of `public/demo/*.svg` as an explicit illustration if no personal photo is available. Photo mission earns 15 Aura once; an extra upload earns no duplicate points.
5. Change placement to show deterministic Plant Match Score (60 light + 40 location), then open Profile for accumulated Aura and badges. These are different scores.
6. Open Scan: select one of the five prepared examples. The badge says DEMO and the selection is manual, with no fabricated AI confidence. Confirm placement and add the example to the garden.
7. If time permits, show postpone/skip, rename, archive and reset. The offline demo contains a single prepared mission round and is not a replacement for the production weekly scheduler.

## Plant care references

Concise care text is manually prepared; uncertain temperatures and fixed watering intervals remain unknown. Soil condition and local light must be checked in practice. UK growing guides require adaptation to Thai climate.

- Monstera: https://www.rhs.org.uk/plants/swiss-cheese-plants/how-to-grow-swiss-cheese-plants
- Pothos: https://www.rhs.org.uk/plants/91403/epipremnum-aureum/details
- Snake plant identity: https://www.kew.org/plants/snake-plant
- Basil: https://www.rhs.org.uk/herbs/basil/grow-your-own
- Golden barrel cactus identity: https://herbaria.plants.ox.ac.uk/bol/plants400/Profiles/EF/Echinocactus

## Before presenting

Start the server, open the demo link, reset progress, check all local illustrations load, and rehearse the steps on the presentation device. Have a personal photo ready for Timeline. Keep real scanning as an optional online demonstration: internet and upstream quotas cannot be guaranteed. Do not describe the prepared selection as live AI recognition.

## Verification

TypeScript and production build passed. The ten domain/database/camera/demo tests passed, plus the new React demo UI test passed separately. The UI test verifies demo startup, prepared plant selection and zero fetch calls. Browser screenshot inspection was unavailable because the browser connector could not reach the local server. A built preview is running at port 3000 for manual visual review. No Supabase migration or production function deployment is required for this local demonstration mode.
