import type { GeocodingResult } from '~/types/weather';
import type { GolfCourseResult } from '~/types/location';

const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';

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

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements: OverpassElement[];
};

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length === 0) return [];

  const url = `${GEOCODING_BASE}?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = (await response.json()) as ApiResponse;
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

export async function searchGolfCourses(query: string): Promise<GolfCourseResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Escape regex special characters for Overpass QL
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const overpassQuery = `[out:json][timeout:8];
(
  node["leisure"="golf_course"]["name"~"${escaped}",i];
  way["leisure"="golf_course"]["name"~"${escaped}",i];
  relation["leisure"="golf_course"]["name"~"${escaped}",i];
);
out center 8;`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(OVERPASS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!response.ok) return [];

    const data = (await response.json()) as OverpassResponse;

    return data.elements
      .map((el): GolfCourseResult | null => {
        const lat = el.type === 'node' ? el.lat : el.center?.lat;
        const lon = el.type === 'node' ? el.lon : el.center?.lon;
        const name = el.tags?.['name'];
        if (lat === undefined || lon === undefined || name === undefined) return null;
        return {
          id: el.id,
          name,
          latitude: lat,
          longitude: lon,
          city: el.tags?.['addr:city'],
          country: el.tags?.['addr:country'],
        };
      })
      .filter((r): r is GolfCourseResult => r !== null);
  } catch {
    clearTimeout(timer);
    return [];
  }
}
