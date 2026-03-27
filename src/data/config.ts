const rawLocationsFeedUrl = process.env.EXPO_PUBLIC_LOCATIONS_FEED_URL?.trim();

export const locationsFeedUrl = rawLocationsFeedUrl ? rawLocationsFeedUrl : null;
