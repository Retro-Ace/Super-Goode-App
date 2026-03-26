export type ReviewProvider = 'instagram' | 'tiktok' | 'youtube' | 'web' | 'unknown';

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

function detectReviewProvider(url: string): ReviewProvider {
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

function stripTrackingParams(url: URL) {
  const keys = [...url.searchParams.keys()];

  for (const key of keys) {
    if (key.startsWith('utm_') || TRACKING_PARAM_NAMES.has(key)) {
      url.searchParams.delete(key);
    }
  }
}

function normalizePathname(pathname: string) {
  if (!pathname) {
    return '/';
  }

  return pathname.replace(/\/{2,}/g, '/');
}

export function normalizeReviewUrl(url?: string | null) {
  const trimmed = url?.trim();

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

export function getReviewProvider(url?: string | null): ReviewProvider {
  const normalizedUrl = normalizeReviewUrl(url);

  if (!normalizedUrl) {
    return 'unknown';
  }

  return detectReviewProvider(normalizedUrl);
}

export function getReviewProviderLabel(provider: ReviewProvider) {
  switch (provider) {
    case 'instagram':
      return 'Instagram review';
    case 'tiktok':
      return 'TikTok review';
    case 'youtube':
      return 'YouTube review';
    case 'web':
      return 'Web review';
    default:
      return 'Review link';
  }
}

export function getReviewExternalActionLabel(provider: ReviewProvider) {
  switch (provider) {
    case 'instagram':
      return 'Open in Instagram';
    case 'tiktok':
      return 'Open in TikTok';
    case 'youtube':
      return 'Open in YouTube';
    default:
      return 'Open in Browser';
  }
}
