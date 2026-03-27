# Super Goode App

Super Goode App is the native mobile companion to Super Goode Map. It is an Expo + React Native + TypeScript app built around the existing Super Goode restaurant dataset and designed so the live web JSON can become the production feed later with minimal rewrite.

## Status

Current status: beta foundation.

Current app state:
- Native mobile companion to Super Goode Map
- Expo Router app shell with bottom tabs for Map, Reviews, Favorites, and Profile
- No restaurant detail route or detail page
- Seeded data loading from the current Super Goode web dataset shape
- Remote JSON feed support through `EXPO_PUBLIC_LOCATIONS_FEED_URL`
- Local seed fallback when the remote feed fails or is invalid
- In-app review viewer with external fallback
- Search and score filtering
- Directions actions and persistent favorites
- QA notes and dataset validation support

## Stack

- Expo
- React Native
- TypeScript
- Expo Router

## Data Source Architecture

The web repo remains the source of truth for restaurant data.

- Web source of truth: `../Super Goode/data/locations.json`
- App seed snapshot: `src/data/seed/locations.json`
- Seed sync script: `scripts/sync-locations-seed.mjs`
- Validator: `scripts/validate-location-data.mjs`
- Repository layer: `src/services/restaurantRepository.ts`
- Data sources:
  - `src/data/sources/localLocationsSource.ts`
  - `src/data/sources/remoteLocationsSource.ts`

Current behavior:
- The app loads a local parity snapshot of the web dataset.
- If `EXPO_PUBLIC_LOCATIONS_FEED_URL` is set, the repository can read a remote JSON feed without changing screen-level code.
- If the remote feed fails validation or times out, the app falls back to the local seeded JSON.
- The app continues to use the existing Super Goode fields: `name`, `score`, `subtitle`, `address`, `city`, `state`, `lat`, `lng`, `directionsUrl`, `reviewUrl`, `sourceType`, `confidence`, `notes`.
- Review URLs in the stored seed are normalized so review links stay consistent across the app.

## Local Run Commands

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

## Seed Sync Workflow

This repo does not own restaurant data long term. The web repo stays canonical.

To refresh the local app seed from the current web dataset:

```bash
npm run sync:seed
```

To validate the app seed:

```bash
npm run check:data
```

To verify the app seed still matches the web dataset exactly:

```bash
npm run check:data -- src/data/seed/locations.json "/Users/anthonylarosa/CODEX/Super Goode/data/locations.json"
```

## Repo Structure

```text
app/            Expo Router routes
assets/         app icons, splash assets, fonts
docs/qa/        QA notes and checklist artifacts
scripts/        seed sync and data validation helpers
src/components/ reusable UI
src/constants/  app theme values
src/data/       config, local seed, data-source adapters
src/hooks/      shared hooks
src/providers/  app-level state providers
src/screens/    routed screens
src/services/   repository and persistence services
src/types/      shared TypeScript models
src/utils/      helpers
```

## Main Features In Place

- Map tab with pins, popups, location, and filters
- Reviews feed with search, score filters, and in-app review viewer actions
- Favorites tab backed by persistent local storage
- Profile screen with current data-mode visibility
- Directions and review actions with normalized stored review URLs
- Dataset validation and QA documentation for the current foundation pass

## Next Steps

- Continue hardening remote feed validation and fallback behavior
- Add UI smoke testing for search, links, favorites persistence, and map interactions
- Add richer media and content treatments where useful
- Wire a stable live JSON endpoint into `EXPO_PUBLIC_LOCATIONS_FEED_URL` when available
