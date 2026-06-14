import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { searchLocations } from '~/services/geocoding';
import { fetchForecast } from '~/services/forecast';

// Slice 2 acceptance test — logs real Open-Meteo data for Warwick to console on mount
// Remove this useEffect in Slice 4 when real UI is built
export default function HomeScreen() {
  useEffect(() => {
    void (async () => {
      const locations = await searchLocations('Warwick');
      const first = locations[0];
      if (!first) {
        console.log('[Slice 2] No geocoding results for Warwick');
        return;
      }
      console.log('[Slice 2] Geocoding result:', first.name, first.country, first.latitude, first.longitude);

      const today = new Date().toISOString().slice(0, 10);
      try {
        const forecast = await fetchForecast(first.latitude, first.longitude, today, {
          wind: 'mph',
          temperature: 'celsius',
        });
        console.log('[Slice 2] Wind speeds (first 6h):', forecast.hourly.wind_speed_10m.slice(0, 6));
        console.log('[Slice 2] Wind gusts  (first 6h):', forecast.hourly.wind_gusts_10m.slice(0, 6));
        console.log('[Slice 2] Rain prob   (first 6h):', forecast.hourly.precipitation_probability.slice(0, 6));
        console.log('[Slice 2] Sunrise:', forecast.daily.sunrise[0]);
        console.log('[Slice 2] Sunset: ', forecast.daily.sunset[0]);
      } catch (err) {
        console.error('[Slice 2] Forecast error:', err);
      }
    })();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-4xl mb-2">⛳</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-2">Golf Weather</Text>
      <Text className="text-base text-gray-500 text-center">
        Find your best window to play.{'\n'}Coming in Slice 4.
      </Text>
    </View>
  );
}
