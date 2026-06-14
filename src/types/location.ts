export type LocationSource = 'gps' | 'search';

export type LocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: LocationSource;
};
