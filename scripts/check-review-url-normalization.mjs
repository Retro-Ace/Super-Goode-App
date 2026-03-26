import { readFileSync } from 'node:fs';

const TRACKING_PARAM_NAMES = new Set([
  'fbclid',
  'gclid',
  'igsh',
  'mibextid',
  'si',
  'source',
  'utm_campaign',
  'utm_content',
  'utm_id',
  'utm_medium',
  'utm_name',
  'utm_source',
  'utm_term',
]);

function detectReviewProvider(url) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('instagram.com')) {
    return 'instagram';
  }

  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  }

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }

  if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) {
    return 'web';
  }

  return 'unknown';
}

function stripTrackingParams(url) {
  const keys = [...url.searchParams.keys()];

  for (const key of keys) {
    if (key.startsWith('utm_') || TRACKING_PARAM_NAMES.has(key)) {
      url.searchParams.delete(key);
    }
  }
}

function normalizePathname(pathname) {
  if (!pathname) {
    return '/';
  }

  return pathname.replace(/\/{2,}/g, '/');
}

function normalizeReviewUrl(url) {
  const trimmed = typeof url === 'string' ? url.trim() : '';

  if (!trimmed) {
    return null;
  }

  try {
    const normalizedUrl = new URL(trimmed);
    const provider = detectReviewProvider(trimmed);

    normalizedUrl.hostname = normalizedUrl.hostname.toLowerCase();
    normalizedUrl.pathname = normalizePathname(normalizedUrl.pathname);
    normalizedUrl.hash = '';

    if (provider === 'instagram' || provider === 'tiktok') {
      normalizedUrl.search = '';
      return normalizedUrl.toString();
    }

    if (provider === 'youtube') {
      const isWatchPath = normalizedUrl.hostname.includes('youtube.com') && normalizedUrl.pathname === '/watch';
      const videoId = isWatchPath ? normalizedUrl.searchParams.get('v') : null;

      normalizedUrl.search = '';

      if (videoId) {
        normalizedUrl.searchParams.set('v', videoId);
      }

      return normalizedUrl.toString();
    }

    if (provider === 'web') {
      stripTrackingParams(normalizedUrl);
      return normalizedUrl.toString();
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

const datasetPath = process.argv[2] ?? 'src/data/seed/locations.json';
const raw = readFileSync(datasetPath, 'utf8');
const locations = JSON.parse(raw);

const changed = locations
  .map((location) => {
    const normalized = normalizeReviewUrl(location.reviewUrl);
    return normalized && normalized !== location.reviewUrl
      ? { name: location.name, before: location.reviewUrl, after: normalized }
      : null;
  })
  .filter(Boolean);

console.log(
  JSON.stringify(
    {
      datasetPath,
      total: locations.length,
      changedCount: changed.length,
      samples: changed.slice(0, 10),
    },
    null,
    2
  )
);
