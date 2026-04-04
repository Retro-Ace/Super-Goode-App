import { createContext, useContext, useEffect, useState } from 'react';

import { loadFavoriteIds, saveFavoriteIds } from '@/src/services/favoritesStorage';

type FavoritesContextValue = {
  favoriteIds: string[];
  isReady: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({
  children,
  initialFavoriteIds,
}: {
  children: React.ReactNode;
  initialFavoriteIds?: string[];
}) {
  const hydratedFromBootstrap = initialFavoriteIds !== undefined;
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds ?? []);
  const [isReady, setIsReady] = useState(hydratedFromBootstrap);

  useEffect(() => {
    if (hydratedFromBootstrap) {
      return;
    }

    loadFavoriteIds()
      .then((ids) => {
        setFavoriteIds(ids);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, [hydratedFromBootstrap]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveFavoriteIds(favoriteIds);
  }, [favoriteIds, isReady]);

  function toggleFavorite(id: string) {
    setFavoriteIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id]
    );
  }

  function isFavorite(id: string) {
    return favoriteIds.includes(id);
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isReady, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error('useFavorites must be used inside FavoritesProvider.');
  }

  return context;
}
