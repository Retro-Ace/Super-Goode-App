# Super Goode Foundation QA

Date: 2026-03-25

## Data Contract

Current source-of-truth files:
- `/Users/anthonylarosa/CODEX/Super Goode/data/locations.json`
- `/Users/anthonylarosa/CODEX/Super Goode App/src/data/seed/locations.json`

Verified snapshot for this pass:
- 219 locations in both files
- The app seed matches the web dataset exactly right now
- Key set is stable and currently limited to 13 fields
- Score range is 7.2 to 9.3
- Only one entry is marked `confidence: low`
- 35 entries carry non-empty `notes`

Required fields in the current dataset:
- `name`: string
- `score`: number
- `subtitle`: string
- `address`: string
- `city`: string
- `state`: string
- `lat`: number
- `lng`: number
- `directionsUrl`: string
- `reviewUrl`: string
- `sourceType`: string
- `confidence`: string
- `notes`: string

Behavioral notes for the app:
- Keep `score` numeric and render it with one decimal place; do not coerce to an integer badge.
- Treat `lat` and `lng` as the only map coordinates; do not infer geocodes from address text.
- Render `notes` only when non-empty.
- Treat `sourceType` and `confidence` as provenance metadata, not user-facing content.
- Preserve `reviewUrl` and `directionsUrl` as external links and fail closed if a future record omits them.

## What Is Solid

- The app seed is currently a direct parity copy of the live web dataset.
- All current entries have valid coordinates and link strings.
- There are no duplicate normalized restaurant names in the current dataset.
- The dataset stays in the Chicago-area band, so map initial bounds can stay local without global fallbacks.

## Blind Spots To Watch

- Future remote JSON may omit `notes`, `sourceType`, `confidence`, `reviewUrl`, or `directionsUrl`; the UI should handle missing links without crashing.
- Instagram review URLs are not uniform. Some use `/reel/`, some `/reels/`, and some include query parameters.
- Some `directionsUrl` values encode suites, unit numbers, or parking-lot destinations; link handling should not rewrite or sanitize the destination portion.
- Search should normalize case, whitespace, apostrophes, and ampersands so names like `JJ Fish & Chicken` and `Rammy's Sub Contractors` remain findable.
- Favorites persistence should use a stable restaurant identity, not list index order, so syncing or resorting does not break saved items.
- A single low-confidence place exists in the source data, so QA should include a fallback check for records that need human review.

## V1 Checklist

- Load the seed dataset and verify the app starts with 219 locations.
- Confirm the list, detail, and map views all consume the same record shape.
- Open a restaurant review link and a directions link from one known record.
- Verify a restaurant with an empty `notes` field still renders cleanly.
- Verify the low-confidence record renders without special-case failures.
- Search for names with apostrophes, ampersands, and short substrings.
- Check that score sorting, if present, uses numeric comparison.
- Confirm favorites survive app relaunch and remain tied to the correct restaurant after sorting or filtering.
- Confirm invalid or missing external links are disabled instead of throwing.
- Confirm a location with missing or malformed coordinates is skipped or surfaced safely if introduced later.

## Smoke Test Checklist

- App launches without a red screen.
- Seed data loads on first launch.
- Search returns expected restaurants.
- A restaurant card opens its review URL.
- A restaurant card opens its directions URL.
- Favorite/unfavorite state persists after a restart.
- Empty-state UI appears when a search has no matches.
- Long names and subtitles do not truncate in a broken way.
- Map/list toggles, if present in the scaffold, do not desync the selected restaurant.

## Current Risks

- The app is still scaffold-only, so the first real risk is model drift when the UI layer starts reading the dataset.
- The eventual remote JSON endpoint may be partial on day one and should be treated as an untrusted source.
- The dataset is currently static and local, so release prep should assume a later migration from seed JSON to fetched JSON.

## Next QA Pass

After Dan finishes the scaffold, run the validator against both files:

```bash
npm run check:data -- src/data/seed/locations.json "/Users/anthonylarosa/CODEX/Super Goode/data/locations.json"
```

Then add a UI smoke pass focused on:
- search edge cases
- external link behavior
- favorites persistence
- missing-link fallbacks
- coordinate rendering
