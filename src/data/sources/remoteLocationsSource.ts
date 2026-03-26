import type { LocationsDataSource } from '@/src/data/sources/types';
import type { RestaurantRecord } from '@/src/types/restaurant';

export class RemoteLocationsDataSource implements LocationsDataSource {
  constructor(private readonly url: string) {}

  async getLocations() {
    const response = await fetch(this.url);

    if (!response.ok) {
      throw new Error(`Failed to load locations feed: ${response.status}`);
    }

    const data = (await response.json()) as unknown;

    if (!Array.isArray(data)) {
      throw new Error('Locations feed did not return an array.');
    }

    return data as RestaurantRecord[];
  }
}
