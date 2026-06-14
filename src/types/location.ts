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

export type GolfCourseResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
};

export type SearchResult = {
  kind: 'course' | 'place';
  id: number;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};
