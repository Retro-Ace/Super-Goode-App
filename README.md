# Super Goode App

Native mobile companion to [Super Goode Map](https://github.com/Retro-Ace/Super-Goode-Map). Super Goode App is an Expo + React Native + TypeScript app built around the shared Super Goode restaurant dataset. It focuses on a polished mobile browsing flow with Map, Reviews, Favorites, and Profile tabs plus an in-app review viewer.

![Super Goode App branding](assets/images/branding/super-goode-long.png)

## Current Status

- Beta-ready mobile companion app for iPhone and Android
- Four public tabs: Map, Reviews, Favorites, and Profile
- No restaurant detail page or detail route
- Live remote feed support through `EXPO_PUBLIC_LOCATIONS_FEED_URL`
- Runtime data priority: live remote feed, then cached remote snapshot, then bundled local seed fallback
- Review URLs are normalized in-app before playback
- Favorites persist locally on the device

## Highlights

- Map tab with pins, popups, location, and filters
- Reviews tab with branded header, search, score filters, and in-app review viewer
- Favorites tab backed by persistent local storage
- Profile tab with honest feed-mode and cache-state visibility
- Directions links and external review fallback actions
- Shared restaurant data model aligned with the Super Goode web source of truth

## Screenshots

Current app screenshots captured from the simulator.

<table>
  <tr>
    <td><img src="assets/screenshots/map-screen.png" alt="Map tab" width="240" /></td>
    <td><img src="assets/screenshots/reviews-screen.png" alt="Reviews tab" width="240" /></td>
    <td><img src="assets/screenshots/favorites-screen.png" alt="Favorites tab" width="240" /></td>
  </tr>
  <tr>
    <td><img src="assets/screenshots/profile-screen.png" alt="Profile tab" width="240" /></td>
    <td><img src="assets/screenshots/review-viewer.png" alt="In-app review viewer" width="240" /></td>
    <td><img src="assets/screenshots/map-popup-screen.png" alt="Map popup" width="240" /></td>
  </tr>
</table>

<img src="assets/screenshots/map-selected-screen.png" alt="Selected map state" width="360" />

The branding art remains in the repo for presentation and app identity:

![Super Goode logo mark](assets/images/branding/super-goode-full.png)

![Super Goode app icon](assets/images/super-goode-icon.png)

## Setup

```bash
npm install
npm run sync:seed
npm run check:data
npm run typecheck
npm run ios
```

Other launch options:

```bash
npm run android
npm run web
npm run start
```

## Data Source and Feed Behavior

The web repo remains the canonical source of truth for restaurant data.

- Web source of truth: `../Super Goode/data/locations.json`
- App seed snapshot: `src/data/seed/locations.json`
- Seed sync script: `scripts/sync-locations-seed.mjs`
- Validator: `scripts/validate-location-data.mjs`
- Review URL normalization check: `scripts/check-review-url-normalization.mjs`
- Repository layer: `src/services/restaurantRepository.ts`
- Runtime remote snapshot storage: `src/services/restaurantSnapshotStorage.ts`
- Data sources:
  - `src/data/sources/localLocationsSource.ts`
  - `src/data/sources/remoteLocationsSource.ts`

Current behavior:

- `npm run sync:seed` is a developer workflow that copies the web dataset into the app seed snapshot.
- The runtime cache is separate from the repo seed: a successful remote load is saved on device as a cached remote snapshot.
- If `EXPO_PUBLIC_LOCATIONS_FEED_URL` is set, the repository reads the live remote JSON feed first.
- If the live feed is unavailable or invalid and a cached remote snapshot exists, the app uses that snapshot next.
- If neither live remote data nor a cached remote snapshot is available, the app falls back to the bundled local seed.
- Review URLs are normalized in-app before the review viewer or external fallback uses them.
- The app continues to use the existing Super Goode fields: `name`, `score`, `subtitle`, `address`, `city`, `state`, `lat`, `lng`, `directionsUrl`, `reviewUrl`, `sourceType`, `confidence`, `notes`.

## Sync and Validation

```bash
npm run sync:seed
npm run check:data
npm run check:review-urls
```

To compare the app seed against the web source file in your local checkout:

```bash
npm run check:data -- src/data/seed/locations.json "/Users/anthonylarosa/CODEX/Super Goode/data/locations.json"
```

## Repo Structure

```text
app/            Expo Router routes
assets/         app icons, splash assets, branding images, screenshots
docs/           QA notes and breakdown files
scripts/        seed sync, validation, and review-url helpers
src/components/ reusable UI
src/constants/  app theme values
src/data/       config, local seed, and data-source adapters
src/hooks/      shared hooks
src/providers/  app-level state providers
src/screens/    routed screens
src/services/   repository, snapshot cache, and persistence services
src/types/      shared TypeScript models
src/utils/      helpers
```

## Project Notes

- The app is built for iPhone and Android.
- The Map, Reviews, Favorites, and Profile tabs are the current public app surface.
- The review viewer is in-app, with an external fallback if a review cannot be shown inside the app.
- The app does not have a separate permanent restaurant database.
