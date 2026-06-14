import * as Location from 'expo-location';
import type { LocationResult } from '~/types/location';

export async function requestLocation(): Promise<LocationResult | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    return null;
  }

  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy,
      source: 'gps',
    };
  } catch {
    return null;
  }
}
