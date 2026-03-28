import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import type { RestaurantRecord } from '@/src/types/restaurant';
import { validateRestaurantFeed } from '@/src/utils/restaurants';

const RESTAURANT_SNAPSHOT_VERSION = 1;
const RESTAURANT_SNAPSHOT_FILENAME = 'super-goode-remote-snapshot.json';
const LEGACY_RESTAURANT_SNAPSHOT_STORAGE_KEY = 'super-goode:remote-snapshot';

export type CachedRemoteSnapshot = {
  version: number;
  source: 'remote';
  url: string;
  savedAt: string;
  recordCount: number;
  droppedRecordCount: number;
  records: RestaurantRecord[];
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isValidTimestamp(value: string) {
  return Number.isFinite(Date.parse(value));
}

function getSnapshotFileUri() {
  return FileSystem.documentDirectory
    ? `${FileSystem.documentDirectory}${RESTAURANT_SNAPSHOT_FILENAME}`
    : null;
}

function parseCachedRemoteSnapshot(value: unknown) {
  if (!isPlainObject(value)) {
    return null;
  }

  const version = getNumber(value.version);
  const source = value.source;
  const url = getString(value.url);
  const savedAt = getString(value.savedAt);
  const droppedRecordCount = getNumber(value.droppedRecordCount);
  const records = Array.isArray(value.records) ? value.records : null;

  if (
    version !== RESTAURANT_SNAPSHOT_VERSION ||
    source !== 'remote' ||
    !url ||
    !savedAt ||
    !isValidTimestamp(savedAt) ||
    droppedRecordCount === null ||
    !records
  ) {
    return null;
  }

  const validation = validateRestaurantFeed(records);

  if (validation.records.length === 0 || validation.invalidCount > 0) {
    return null;
  }

  return {
    version,
    source,
    url,
    savedAt,
    recordCount: validation.records.length,
    droppedRecordCount,
    records: validation.records,
  } satisfies CachedRemoteSnapshot;
}

export async function loadCachedRemoteSnapshot() {
  const snapshotFileUri = getSnapshotFileUri();

  if (!snapshotFileUri) {
    return null;
  }

  try {
    const snapshotFileInfo = await FileSystem.getInfoAsync(snapshotFileUri);

    if (!snapshotFileInfo.exists) {
      return null;
    }

    const storedValue = await FileSystem.readAsStringAsync(snapshotFileUri);
    return parseCachedRemoteSnapshot(JSON.parse(storedValue) as unknown);
  } catch {
    return null;
  }
}

export async function saveCachedRemoteSnapshot(snapshot: {
  url: string;
  savedAt: string;
  droppedRecordCount: number;
  records: RestaurantRecord[];
}) {
  const snapshotFileUri = getSnapshotFileUri();

  if (!snapshotFileUri) {
    return;
  }

  const payload: CachedRemoteSnapshot = {
    version: RESTAURANT_SNAPSHOT_VERSION,
    source: 'remote',
    url: snapshot.url,
    savedAt: snapshot.savedAt,
    recordCount: snapshot.records.length,
    droppedRecordCount: snapshot.droppedRecordCount,
    records: snapshot.records,
  };

  await FileSystem.writeAsStringAsync(snapshotFileUri, JSON.stringify(payload));
  await AsyncStorage.removeItem(LEGACY_RESTAURANT_SNAPSHOT_STORAGE_KEY);
}

export async function clearCachedRemoteSnapshot() {
  const snapshotFileUri = getSnapshotFileUri();

  if (!snapshotFileUri) {
    return;
  }

  try {
    await FileSystem.deleteAsync(snapshotFileUri, { idempotent: true });
    await AsyncStorage.removeItem(LEGACY_RESTAURANT_SNAPSHOT_STORAGE_KEY);
  } catch {
    // Ignore cache cleanup errors so a stale snapshot never breaks app startup.
  }
}
