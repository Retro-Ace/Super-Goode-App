# Super Goode Foundation QA

Date: 2026-03-27

## Current App State

- Native mobile companion to Super Goode Map.
- Main tabs are Map, Reviews, Favorites, and Profile.
- There is no restaurant detail route or restaurant detail page.
- Restaurant cards surface review, directions, and favorite actions directly.
- In-app review viewing is available, with external fallback for blocked or unavailable reviews.
- Remote feed wiring uses `EXPO_PUBLIC_LOCATIONS_FEED_URL` and falls back to the local seed when the remote feed fails or is invalid.
- Review URLs in the stored seed are normalized.

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
- Map, Reviews, Favorites, Profile, and review viewer flows all consume the same shared record shape.

## Blind Spots To Watch

- Future remote JSON may omit `notes`, `sourceType`, `confidence`, `reviewUrl`, or `directionsUrl`; the UI should handle missing links without crashing.
- Instagram review URLs are not uniform. Some use `/reel/`, some `/reels/`, and some include query parameters.
- Some `directionsUrl` values encode suites, unit numbers, or parking-lot destinations; link handling should not rewrite or sanitize the destination portion.
- Search should normalize case, whitespace, apostrophes, and ampersands so names like `JJ Fish & Chicken` and `Rammy's Sub Contractors` remain findable.
- Favorites persistence should use a stable restaurant identity, not list index order, so syncing or resorting does not break saved items.
- A single low-confidence place exists in the source data, so QA should include a fallback check for records that need human review.
- WebView review content can still be technically reachable but functionally blocked by a login wall or blank embed, so the fallback path needs device verification.

## Current Beta Checklist

- Load the seed dataset and verify the app starts with 219 locations.
- Confirm the Map, Reviews, Favorites, Profile, and review viewer flows all consume the same record shape.
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
- A restaurant card opens the in-app review viewer.
- The review viewer close action returns cleanly to the originating screen.
- The review viewer fallback action opens externally when a review is blocked or unavailable.
- A restaurant card opens its directions URL.
- Favorite/unfavorite state persists after a restart.
- Empty-state UI appears when a search has no matches.
- Long names and subtitles do not truncate in a broken way.
- Map marker selection, search filtering, and popup state stay in sync.

## Map Tab QA

What is currently solid in the code path:
- The map consumes the existing shared restaurant record shape through the same repository layer as the rest of the app.
- Coordinates are validated before pin rendering. Invalid or missing `lat` / `lng` values are skipped rather than forcing a broken marker.
- The map has a stable Chicago fallback region if the filtered result set has no usable coordinates.
- Single-result searches animate to a tighter region instead of relying on a multi-point fit.
- Selected-pin state is cleared when filters remove the selected restaurant from the active map result set.
- Device location is requested through foreground permission only and does not run on web.

Map-specific smoke checklist:
- Fresh install: confirm the first-launch foreground location prompt appears from the Map tab.
- Allow permission: confirm the user-location dot appears and `locate` recenters the map to the current position.
- Deny permission: confirm the map still loads restaurant pins and the screen shows a readable non-blocking error message.
- Deny with “don’t ask again”: confirm the UI shifts to the “off/settings” style state and does not loop permission prompts.
- Search while map is visible: confirm pins update and the selected footer clears if the selected spot falls out of the filtered set.
- Score filtering: confirm pin count changes and map fit still works after changing the score floor.
- Dense Chicago area taps: confirm tapping one pin does not leave the wrong restaurant in the footer after another pin is selected.
- Long restaurant names: confirm the selected footer truncates gracefully and does not overlap the score pill or action buttons.
- Keyboard open/close: confirm the top overlay remains usable and does not permanently cover the map after dismissing the keyboard.
- Utility buttons: confirm `scan` and `locate` remain reachable one-handed and do not sit under device safe areas.

Blind spots still worth hardening before larger map features:
- Simulator location can differ from real-device GPS stability, especially immediately after granting permission.
- `getCurrentPositionAsync` may be slow or fail indoors; the current UX reports an error but does not add retry backoff or last-known-location fallback.
- Marker density is still unclustered. The full dataset is acceptable for this pass, but dense neighborhoods will need observation on lower-end devices.
- Search/filter changes currently refit the map only on the first load or when the user explicitly taps the fit control. That is coherent, but should be validated as the intended behavior.
- The selected footer currently shows distance when user location exists, otherwise `cityState`; subtitle content is not shown in the footer anymore, so detail discovery depends on tapping through.
- Real-map QA should still be done on iPhone/Android rather than relying on web-only behavior.

Recommended release-prep checks before the next feature pass:
- Run an on-device pass once on iPhone and once on Android with fresh permissions.
- Verify at least one long-name restaurant and one dense downtown cluster manually.
- Re-run data validation against the web source file before release candidates:

```bash
npm run check:data -- src/data/seed/locations.json "/Users/anthonylarosa/CODEX/Super Goode/data/locations.json"
```

## Current Risks

- Remote JSON inputs remain untrusted and should continue to be validated before use.
- Restaurant identity still depends on source fields, so future source corrections can affect favorites and deep links.
- WebView review content can still be blocked or blank even when the URL itself is valid.
- Small spacing regressions can still surface on the smallest phones with large text settings.

## Next QA Pass

Before the next feature pass, run the validator against both files:

```bash
npm run check:data -- src/data/seed/locations.json "/Users/anthonylarosa/CODEX/Super Goode/data/locations.json"
```

Then add a UI smoke pass focused on:
- search edge cases
- external link behavior
- favorites persistence
- missing-link fallbacks
- review viewer close and fallback behavior
- coordinate rendering
