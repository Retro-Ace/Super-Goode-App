import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = 'super-goode:favorites';

export async function loadFavoriteIds() {
  const storedValue = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

  if (!storedValue) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(storedValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveFavoriteIds(ids: string[]) {
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}
