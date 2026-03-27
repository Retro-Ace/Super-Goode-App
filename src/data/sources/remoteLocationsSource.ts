import type { LocationsDataSource } from '@/src/data/sources/types';
import type { RestaurantRecord } from '@/src/types/restaurant';

export class RemoteLocationsDataSource implements LocationsDataSource {
  constructor(
    private readonly url: string,
    private readonly timeoutMs = 6000
  ) {}

  async getLocations() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;

    try {
      response = await fetch(this.url, { signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Locations feed timed out after ${this.timeoutMs}ms.`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

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
