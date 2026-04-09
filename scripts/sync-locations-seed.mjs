import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const appRoot = process.cwd();
const sourcePath = path.resolve(appRoot, '../Super Goode/data/locations.json');
const destinationDir = path.resolve(appRoot, 'src/data/seed');
const destinationPath = path.resolve(destinationDir, 'locations.json');

function getTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getRequiredString(value) {
  const normalized = getTrimmedString(value);
  return normalized.length > 0 ? normalized : null;
}

function getFiniteNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getCoordinateValue(value) {
  if (value === null || value === undefined) {
    return {
      value: null,
      isValid: true,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      value: null,
      isValid: true,
    };
  }

  const parsed = getFiniteNumber(value);

  return {
    value: parsed,
    isValid: parsed !== null,
  };
}

function normalizeEntry(entry, index) {
  const name = getRequiredString(entry?.name);
  const city = getRequiredString(entry?.city);
  const state = getRequiredString(entry?.state);
  const reviewUrl = getRequiredString(entry?.reviewUrl);
  const score = getFiniteNumber(entry?.score);
  const latResult = getCoordinateValue(entry?.lat);
  const lngResult = getCoordinateValue(entry?.lng);
  const lat = latResult.value;
  const lng = lngResult.value;

  if (!name || !city || !state || !reviewUrl || score === null || !latResult.isValid || !lngResult.isValid) {
    throw new Error(`Source row ${index} is missing required app fields.`);
  }

  const hasLat = lat !== null;
  const hasLng = lng !== null;

  if (hasLat !== hasLng) {
    throw new Error(`Source row ${index} has only one coordinate value.`);
  }

  if (
    score < 0 ||
    score > 10 ||
    (lat !== null && (lat < -90 || lat > 90)) ||
    (lng !== null && (lng < -180 || lng > 180))
  ) {
    throw new Error(`Source row ${index} has an out-of-range score or coordinate.`);
  }

  return {
    name,
    score,
    subtitle: getTrimmedString(entry?.subtitle),
    address: getTrimmedString(entry?.address),
    city,
    state,
    lat,
    lng,
    googlePlaceUrl: getTrimmedString(entry?.googlePlaceUrl),
    directionsUrl: getTrimmedString(entry?.directionsUrl),
    reviewUrl,
    sourceType: getRequiredString(entry?.sourceType) ?? 'unknown',
    confidence: getRequiredString(entry?.confidence) ?? 'medium',
    notes: getTrimmedString(entry?.notes),
  };
}

async function main() {
  await access(sourcePath);
  await mkdir(destinationDir, { recursive: true });

  const sourceContents = await readFile(sourcePath, 'utf8');
  const parsed = JSON.parse(sourceContents);

  if (!Array.isArray(parsed)) {
    throw new Error('Expected the web locations file to contain a JSON array.');
  }

  const normalized = parsed.map((entry, index) => normalizeEntry(entry, index));
  const mappedCount = normalized.filter((entry) => entry.lat !== null && entry.lng !== null).length;

  await writeFile(destinationPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');

  console.log(
    `Synced ${normalized.length} locations (${mappedCount} with coordinates) from ${sourcePath} to ${destinationPath}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
