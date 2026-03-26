import seedLocations from '@/src/data/seed/locations.json';
import type { LocationsDataSource } from '@/src/data/sources/types';
import type { RestaurantRecord } from '@/src/types/restaurant';

export class LocalLocationsDataSource implements LocationsDataSource {
  async getLocations() {
    return seedLocations as RestaurantRecord[];
  }
}
