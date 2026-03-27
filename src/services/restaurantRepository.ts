import { locationsFeedUrl } from '@/src/data/config';
import { LocalLocationsDataSource } from '@/src/data/sources/localLocationsSource';
import { RemoteLocationsDataSource } from '@/src/data/sources/remoteLocationsSource';
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
    }
  | {
      mode: 'local-seed';
      remoteConfigured: false;
      url: null;
      droppedRecordCount: 0;
      message: string;
    }
  | {
      mode: 'local-fallback';
      remoteConfigured: true;
      url: string;
      droppedRecordCount: number;
      message: string;
    };

export type RestaurantFeedResult = {
  restaurants: Restaurant[];
  status: RestaurantFeedStatus;
};

function buildRestaurants(records: RestaurantRecord[]) {
  return sortRestaurants(records.map(normalizeRestaurant));
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
  const validation = validateRestaurantFeed(rawLocations);

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

  const droppedRecordCount = validation.invalidCount;

  return {
    restaurants: buildRestaurants(validation.records),
    status: {
      mode: 'remote',
      remoteConfigured: true,
      url,
      droppedRecordCount,
      message: 'Remote JSON feed active.',
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
    });
  }

  try {
    return await loadRemoteFeed(locationsFeedUrl);
  } catch (error) {
    return loadLocalSeed({
      mode: 'local-fallback',
      remoteConfigured: true,
      url: locationsFeedUrl,
      droppedRecordCount: 0,
      message: 'Local seeded JSON fallback active.',
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
