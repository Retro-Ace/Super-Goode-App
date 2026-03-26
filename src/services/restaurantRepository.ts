import { locationsFeedUrl } from '@/src/data/config';
import { LocalLocationsDataSource } from '@/src/data/sources/localLocationsSource';
import { RemoteLocationsDataSource } from '@/src/data/sources/remoteLocationsSource';
import type { LocationsDataSource } from '@/src/data/sources/types';
import type { Restaurant } from '@/src/types/restaurant';
import { normalizeRestaurant, sortRestaurants } from '@/src/utils/restaurants';

class RestaurantRepository {
  constructor(private readonly dataSource: LocationsDataSource) {}

  async getRestaurants() {
    const locations = await this.dataSource.getLocations();

    return sortRestaurants(locations.map(normalizeRestaurant));
  }
}

function buildRepository() {
  const dataSource = locationsFeedUrl
    ? new RemoteLocationsDataSource(locationsFeedUrl)
    : new LocalLocationsDataSource();

  return new RestaurantRepository(dataSource);
}

let restaurantsCache: Restaurant[] | null = null;
let restaurantRequest: Promise<Restaurant[]> | null = null;

export async function getRestaurants() {
  if (restaurantsCache) {
    return restaurantsCache;
  }

  if (!restaurantRequest) {
    restaurantRequest = buildRepository()
      .getRestaurants()
      .then((restaurants) => {
        restaurantsCache = restaurants;
        return restaurants;
      })
      .finally(() => {
        restaurantRequest = null;
      });
  }

  return restaurantRequest;
}

export function clearRestaurantCache() {
  restaurantsCache = null;
  restaurantRequest = null;
}
