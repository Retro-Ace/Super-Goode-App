export type ReviewProvider = 'instagram' | 'tiktok' | 'youtube' | 'web' | 'unknown';

export function normalizeReviewUrl(url?: string | null) {
  const trimmed = url?.trim();
  return trimmed ? trimmed : null;
}

export function getReviewProvider(url?: string | null): ReviewProvider {
  const normalizedUrl = normalizeReviewUrl(url);

  if (!normalizedUrl) {
    return 'unknown';
  }

  const lowerUrl = normalizedUrl.toLowerCase();

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
