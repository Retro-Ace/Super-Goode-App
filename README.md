# Super Goode App

Super Goode App is the native mobile companion to Super Goode Map. It is an Expo + React Native + TypeScript app built around the existing Super Goode restaurant dataset and designed so the live web JSON can become the production feed later with minimal rewrite.

## Status

Current status: v1 foundation.

The repo currently includes:
- Expo Router app shell with bottom tabs for Map, Reviews, Favorites, and Profile
- restaurant detail route
- seeded data loading from the current Super Goode web dataset shape
- modular repository/data-source layer ready for a future remote JSON feed
- search and score filtering
- reusable restaurant cards and score UI
- directions and review external-link actions
- local favorites persistence with AsyncStorage
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
- If `EXPO_PUBLIC_LOCATIONS_FEED_URL` is set later, the repository can switch to a remote JSON feed without changing screen-level code.
- The app continues to use the existing Super Goode fields: `name`, `score`, `subtitle`, `address`, `city`, `state`, `lat`, `lng`, `directionsUrl`, `reviewUrl`, `sourceType`, `confidence`, `notes`.

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

- Map-first home screen with a plotted preview and ranked restaurant cards
- Reviews feed with search and score filters
- Restaurant detail screen with review and directions actions
- Favorites tab backed by persistent local storage
- Profile placeholder with current data-mode visibility
- Dataset validation and QA documentation for the current foundation pass

## Next Steps

- Replace the plotted map preview with a real interactive native map implementation
- Add better empty/error handling around future partial remote JSON feeds
- Add image/media treatment and richer detail-page content
- Add UI smoke testing for search, links, and favorites persistence
- Wire a stable live JSON endpoint into `EXPO_PUBLIC_LOCATIONS_FEED_URL` when available
