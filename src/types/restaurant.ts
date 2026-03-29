export type RestaurantSourceType = string;
export type RestaurantConfidence = 'high' | 'medium' | 'low' | string;

export type RestaurantLocation = {
  name: string;
  score: number;
  subtitle: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  googlePlaceUrl: string;
  directionsUrl: string;
  reviewUrl: string;
  sourceType: RestaurantSourceType;
  confidence: RestaurantConfidence;
  notes?: string;
};

export type RestaurantRecord = Omit<RestaurantLocation, 'notes'> & {
  notes: string;
};

export type Restaurant = RestaurantRecord & {
  id: string;
  cityState: string;
  fullAddress: string;
  searchableText: string;
};

export type RestaurantFilters = {
  query: string;
  minimumScore: number | null;
};
