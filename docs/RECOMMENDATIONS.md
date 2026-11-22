# Outfit rules

Pure functions take wardrobe, normalized preferences, history and an explicit reference timestamp. There are no network calls. Stable string IDs break score ties. Exactly one top and bottom are required. Formal occasions exclude sporty items; other mismatches lower scores.

Search considers up to 40 eligible pieces per category in stable ID order, at most 1,600 top/bottom combinations. One compatible shoe, layer and accessory is selected per pair using occasion/style/weather/color points, then ID as tie-breaker. This is a bounded heuristic, not an exhaustive optimization. The UI discloses the limit. Footwear preferences constrain shoes; absent compatible shoes are omitted. Hot weather omits outerwear. Optional pieces must pass compatibility thresholds.

Scores total 100:
- Occasion: average across included items, strong 30, possible 20, known mismatch 8, unknown 15.
- Color: top/bottom pair only. Listed strong pairs 30, different colors with a neutral 25, same color 20, unknown 18, other pairs 15.
- Weather: average top/bottom season suitability (0–20), plus 2 for a compatible cold-weather layer, capped at 20. All-season earns 20 except rainy (16); monsoon earns 18 in rain. Opposite hot/cold season earns 5. Unknown seasons receive 10. No waterproofing is inferred.
- Style: average included-item points: any/exact 10, versatile 8, neighboring styles 6, known mismatch 2, unknown 5.
- Repetition: exact unordered item-ID combination worn within 3 days earns 0; within 7 days earns 5; otherwise 10. Boundaries inclusive. Invalid/future timestamps ignored.

Missing optional categories do not receive zero points. Component averages are rounded before summation. The top three unique combinations are returned; one pair yields one result. Low scores remain visible with a caveat. Example: casual navy top + casual white bottom, both all-season, for college/normal/any with no history: 30 + 30 + 20 + 10 + 10 = 100. Worn yesterday: 90.

Scores and reasons are saved as snapshots. Regenerate to account for edits. Existing Phase 3 fixed favorites remain labeled legacy samples; new generated favorites are stored separately by combination ID. History keeps item snapshots for repetition checks even after clothing deletion. The UI clock refreshes on history changes and every minute.

Previously worn combinations require explicit Wear again confirmation before another history entry. Persisted history determines that state across restarts.
