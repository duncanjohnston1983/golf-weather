import type { GeocodingResult } from '~/types/weather';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

type ApiResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

type ApiResponse = {
  results?: ApiResult[];
};

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const url = `${GEOCODING_BASE}?name=${encodeURIComponent(trimmed)}&count=10&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data: ApiResponse = (await response.json()) as ApiResponse;
    return (data.results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
    }));
  } catch {
    return [];
  }
}
