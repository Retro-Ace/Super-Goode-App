import { useEffect, useState } from 'react';

import { getRestaurantFeed } from '@/src/services/restaurantRepository';
import type { RestaurantFeedStatus } from '@/src/services/restaurantRepository';
import type { Restaurant } from '@/src/types/restaurant';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedStatus, setFeedStatus] = useState<RestaurantFeedStatus | null>(null);

  useEffect(() => {
    let isMounted = true;

    getRestaurantFeed()
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setRestaurants(result.restaurants);
        setFeedStatus(result.status);
        setError(null);
      })
      .catch((requestError) => {
        if (!isMounted) {
          return;
        }

        const message =
          requestError instanceof Error ? requestError.message : 'Unable to load restaurants.';
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { restaurants, isLoading, error, feedStatus };
}
