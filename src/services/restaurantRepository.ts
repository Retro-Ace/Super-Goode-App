import { locationsFeedUrl } from '@/src/data/config';
import { LocalLocationsDataSource } from '@/src/data/sources/localLocationsSource';
import { RemoteLocationsDataSource } from '@/src/data/sources/remoteLocationsSource';
import {
  loadCachedRemoteSnapshot,
  saveCachedRemoteSnapshot,
} from '@/src/services/restaurantSnapshotStorage';
import type { Restaurant } from '@/src/types/restaurant';
import type { RestaurantRecord } from '@/src/types/restaurant';
import { normalizeRestaurant, sortRestaurants, validateRestaurantFeed } from '@/src/utils/restaurants';

const REMOTE_TIMEOUT_MS = 6000;
const MIN_REMOTE_VALID_RATIO = 0.8;

export type RestaurantFeedStatus =
  | {
      mode: 'remote';
      remoteConfigured: true;
      url: string;
      droppedRecordCount: number;
      message: string;
      cachedAt: string;
      remoteFailureReason: null;
    }
  | {
      mode: 'cached-remote';
      remoteConfigured: true;
      url: string;
      droppedRecordCount: number;
      message: string;
      cachedAt: string;
      remoteFailureReason: string;
    }
  | {
      mode: 'local-seed';
      remoteConfigured: false;
      url: null;
      droppedRecordCount: 0;
      message: string;
      cachedAt: null;
      remoteFailureReason: null;
    }
  | {
      mode: 'local-fallback';
      remoteConfigured: true;
      url: string;
      droppedRecordCount: 0;
      message: string;
      cachedAt: null;
      remoteFailureReason: string;
    };

export type RestaurantFeedResult = {
  restaurants: Restaurant[];
  status: RestaurantFeedStatus;
};

function buildRestaurants(records: RestaurantRecord[]) {
  return sortRestaurants(records.map(normalizeRestaurant));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to load restaurants.';
}

function acceptRestaurantFeed(data: unknown) {
  const validation = validateRestaurantFeed(data);

  if (validation.totalCount === 0) {
    throw new Error('Locations feed did not return a usable array.');
  }

  if (validation.records.length === 0) {
    throw new Error('Locations feed did not contain any valid restaurant records.');
  }

  const validRatio = validation.records.length / validation.totalCount;

  if (validation.invalidCount > 0 && validRatio < MIN_REMOTE_VALID_RATIO) {
    throw new Error(
      `Locations feed validation failed. ${validation.invalidCount} of ${validation.totalCount} records were invalid.`
    );
  }

  return {
    records: validation.records,
    droppedRecordCount: validation.invalidCount,
  };
}

async function loadLocalSeed(status: RestaurantFeedStatus): Promise<RestaurantFeedResult> {
  const locations = await new LocalLocationsDataSource().getLocations();

  return {
    restaurants: buildRestaurants(locations),
    status,
  };
}

async function loadRemoteFeed(url: string): Promise<RestaurantFeedResult> {
  const rawLocations = await new RemoteLocationsDataSource(url, REMOTE_TIMEOUT_MS).getLocations();
  const acceptedFeed = acceptRestaurantFeed(rawLocations);
  const savedAt = new Date().toISOString();

  await saveCachedRemoteSnapshot({
    url,
    savedAt,
    droppedRecordCount: acceptedFeed.droppedRecordCount,
    records: acceptedFeed.records,
  });

  return {
    restaurants: buildRestaurants(acceptedFeed.records),
    status: {
      mode: 'remote',
      remoteConfigured: true,
      url,
      droppedRecordCount: acceptedFeed.droppedRecordCount,
      message: 'Live remote feed active.',
      cachedAt: savedAt,
      remoteFailureReason: null,
    },
  };
}

async function loadCachedSnapshot(url: string, remoteFailureReason: string): Promise<RestaurantFeedResult | null> {
  const snapshot = await loadCachedRemoteSnapshot();

  if (!snapshot) {
    return null;
  }

  return {
    restaurants: buildRestaurants(snapshot.records),
    status: {
      mode: 'cached-remote',
      remoteConfigured: true,
      url,
      droppedRecordCount: snapshot.droppedRecordCount,
      message: 'Cached remote snapshot active.',
      cachedAt: snapshot.savedAt,
      remoteFailureReason,
    },
  };
}

async function loadRestaurantFeed(): Promise<RestaurantFeedResult> {
  if (!locationsFeedUrl) {
    return loadLocalSeed({
      mode: 'local-seed',
      remoteConfigured: false,
      url: null,
      droppedRecordCount: 0,
      message: 'Local seeded JSON active.',
      cachedAt: null,
      remoteFailureReason: null,
    });
  }

  try {
    return await loadRemoteFeed(locationsFeedUrl);
  } catch (error) {
    const remoteFailureReason = getErrorMessage(error);
    const cachedSnapshotResult = await loadCachedSnapshot(locationsFeedUrl, remoteFailureReason);

    if (cachedSnapshotResult) {
      return cachedSnapshotResult;
    }

    return loadLocalSeed({
      mode: 'local-fallback',
      remoteConfigured: true,
      url: locationsFeedUrl,
      droppedRecordCount: 0,
      message: 'Bundled local seed fallback active.',
      cachedAt: null,
      remoteFailureReason,
    });
  }
}

let restaurantFeedCache: RestaurantFeedResult | null = null;
let restaurantFeedRequest: Promise<RestaurantFeedResult> | null = null;

export async function getRestaurantFeed() {
  if (restaurantFeedCache) {
    return restaurantFeedCache;
  }

  if (!restaurantFeedRequest) {
    restaurantFeedRequest = loadRestaurantFeed()
      .then((result) => {
        restaurantFeedCache = result;
        return result;
      })
      .finally(() => {
        restaurantFeedRequest = null;
      });
  }

  return restaurantFeedRequest;
}

export async function getRestaurants() {
  const result = await getRestaurantFeed();
  return result.restaurants;
}

export function clearRestaurantCache() {
  restaurantFeedCache = null;
  restaurantFeedRequest = null;
}
