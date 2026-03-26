import type { RestaurantRecord } from '@/src/types/restaurant';

export interface LocationsDataSource {
  getLocations(): Promise<RestaurantRecord[]>;
}
