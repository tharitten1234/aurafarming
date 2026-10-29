# Thai display names

Thai display names are a deterministic species-name lookup, not a language-model response. Scientific names, confidence and care facts are preserved. Names are resolved on the client so currently deployed scans and previously saved plants can display the known Thai names without deploying a new Edge Function. No bulk database rewrite is performed.

- Ocimum tenuiflorum → กะเพรา: https://www.dtam.moph.go.th/wp-content/uploads/dtam-pamphlet/TPD/2561/dtam-enew-06.pdf
- Ocimum sanctum → กะเพรา: https://www.rspg.or.th/plants_data/use/herbs09.htm
- Ocimum americanum → แมงลัก: https://archive.lib.cmu.ac.th/full/T/2011/biot21011ry_ch2.pdf
- Ocimum africanum → แมงลัก: https://thbif.onep.go.th/taxons/detail/48064
- Dracaena trifasciata → ลิ้นมังกร: accepted-name counterpart of Sansevieria trifasciata in the existing catalog; https://www.kew.org/plants/snake-plant

Ocimum basilicum retains the existing catalog label โหระพาอิตาเลียน. No cultivar is inferred from the image. Unknown species are not assigned a fabricated Thai name. The current normal scan path uses Pl@ntNet for image recognition and confidence; Perenual provides database care values formatted by Thai templates, with application-generated unavailable-data messages. Gemini is not used in this path.
