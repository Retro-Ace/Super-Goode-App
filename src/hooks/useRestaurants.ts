import { useEffect, useState } from 'react';

import { getRestaurants } from '@/src/services/restaurantRepository';
import type { Restaurant } from '@/src/types/restaurant';

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getRestaurants()
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setRestaurants(items);
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

  return { restaurants, isLoading, error };
}
