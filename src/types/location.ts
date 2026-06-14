export type LocationSource = 'gps' | 'search';

export type SelectedLocation = {
  displayName: string;
  latitude: number;
  longitude: number;
  source: LocationSource;
};

export type LocationResult = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  source: LocationSource;
};
