# Super Goode Foundation QA

Date: 2026-03-29

## Current App State

- Native mobile companion to Super Goode Map.
- Main tabs are Map, Reviews, Favorites, and Profile.
- There is no restaurant detail route or restaurant detail page.
- Restaurant cards surface review, directions, and favorite actions directly.
- In-app review viewing is available, with external fallback for blocked or unavailable reviews.
- Remote feed wiring uses `EXPO_PUBLIC_LOCATIONS_FEED_URL` and now supports a cached remote snapshot before bundled seed fallback.
- Review URLs are normalized in-app before playback.

## Build 3 Release State

- Marketing version remains `1.0.0`.
- iOS build number is `3`.
- Final avatar icon assets are the active icon setup.
- EAS production iOS build `521b227d-6a87-4c4b-8711-42bc4b0cea81` finished successfully.
- The IPA is available from the finished build artifact URL.
- Submission to App Store Connect / TestFlight has not been started yet.
- `eas.json` production autoIncrement is `false` so this release stays pinned to build 3.

## Data Contract

Current source-of-truth files:
- `/Users/anthonylarosa/CODEX/Super Goode/data/locations.json`
- `/Users/anthonylarosa/CODEX/Super Goode App/src/data/seed/locations.json`

Verified snapshot for this pass:
- 229 locations in the app seed
- The app seed is aligned with the current verified shared dataset snapshot used by the app
- Key set is stable and currently limited to 14 fields
- Score range is 7.2 to 9.3
- Only one entry is marked `confidence: low`
- 35 entries carry non-empty notes
- Daruma Restaurant is present

Required fields in the current dataset:
- `name`: string
- `score`: number
- `subtitle`: string
- `address`: string
- `city`: string
- `state`: string
- `lat`: number
- `lng`: number
- `googlePlaceUrl`: string
- `directionsUrl`: string
- `reviewUrl`: string
- `sourceType`: string
- `confidence`: string
- `notes`: string

Behavioral notes for the app:
- Keep `score` numeric and render it with one decimal place; do not coerce it to an integer badge.
- Treat `lat` and `lng` as the only map coordinates; do not infer geocodes from address text.
- Treat `googlePlaceUrl` as required link metadata; do not invent it from address text or keep a stale placeholder.
- Render `notes` only when non-empty.
- Treat `sourceType` and `confidence` as provenance metadata, not user-facing content.
- Preserve `reviewUrl` and `directionsUrl` as external links and fail closed if a future record omits them.
- Accept blank `subtitle` values at runtime; Daruma proved the app should not reject a valid restaurant just because its subtitle is empty.
- Normalize review URLs in the app runtime rather than assuming the stored seed is always pre-cleaned.

## Runtime Feed Modes

Current feed order:
1. live remote feed
2. cached remote snapshot
3. bundled local seed fallback

Current status strings to expect in Profile:
- `Local seeded JSON active`
- `Live remote feed active`
- `Cached remote snapshot active`
- `Configured remote unavailable, using cached snapshot`
- `Bundled local seed fallback active`

Mode notes:
- `local-seed` means no remote URL is configured.
- `remote` means the live feed loaded successfully and the app cached the accepted snapshot on device.
- `cached-remote` means the live feed was unavailable or invalid, but a valid on-device snapshot exists.
- `local-fallback` means the live feed and cached snapshot were unavailable, so the bundled seed is being used.
- `npm run sync:seed` is a developer workflow only; it is not the same thing as the runtime cache.
- A launch that shows `Local seeded JSON active` with no remote env configured is not a cache failure.

## What Is Solid

- The app seed is currently aligned with the verified shared dataset snapshot used by the app.
- All current entries have valid coordinates and link strings.
- There are no duplicate normalized restaurant names in the current dataset.
- The dataset stays in the Chicago-area band, so map initial bounds can stay local without global fallbacks.
- Map, Reviews, Favorites, Profile, and review viewer flows all consume the same shared record shape.
- Cached remote snapshot behavior has been verified end to end.

## Cache and Feed Notes

- The remote feed is cached on device after a successful accepted remote load.
- The cache lives in app storage, not in the repo seed.
- If the remote feed fails later, the app can fall back to the cached snapshot before using the bundled seed.
- Earlier screenshots showing `Local seeded JSON active` came from a launch with no remote env configured, not from cached mode.
- That no-env launch was the reason those screenshots looked like bundled seed mode.
- After the later remote-enabled verification, cached remote snapshot mode worked as expected without another code fix.

## Smoke Test Checklist

- App launches without a red screen.
- Seed data loads on first launch.
- Search returns expected restaurants.
- A restaurant card opens the in-app review viewer.
- The review viewer close action returns cleanly to the originating screen.
- The review viewer fallback action opens externally when a review is blocked or unavailable.
- A restaurant card opens its directions URL.
- Favorite and unfavorite state persists after a restart.
- Empty-state UI appears when a search has no matches.
- Long names and subtitles do not truncate in a broken way.
- Map marker selection, search filtering, and popup state stay in sync.
- Profile reports the correct feed mode for each launch scenario.
- Cached remote snapshot mode is shown only when a valid snapshot exists and the live feed is unavailable.

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

## Current Risks

- Remote JSON inputs remain untrusted and should continue to be validated before use.
- Restaurant identity still depends on source fields, so future source corrections can affect favorites and deep links.
- WebView review content can still be blocked or blank even when the URL itself is valid.
- Small spacing regressions can still surface on the smallest phones with large text settings.
- A launch with no remote env configured will correctly show local seed mode; that should not be mistaken for a cache bug.

## Release Prep Note

- Re-run data validation against the web source file before release candidates.
- Keep the cache mode, bundled fallback mode, and seed-sync workflow separate in future release notes.
- Keep review URL normalization and remote snapshot cache behavior in the pre-release smoke checklist.
