import { View, Text, Pressable, TextInput } from 'react-native';
import type { GeocodingResult } from '~/types/weather';
import type { SelectedLocation } from '~/types/location';

type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied';

type Props = {
  gpsStatus: GpsStatus;
  selectedLocation: SelectedLocation | null;
  searchQuery: string;
  searchResults: GeocodingResult[];
  onGpsPress: () => void;
  onSearchChange: (text: string) => void;
  onLocationSelect: (result: GeocodingResult) => void;
  onClearLocation: () => void;
};

function gpsLabel(status: GpsStatus): string {
  if (status === 'requesting') return 'Finding...';
  if (status === 'denied') return 'GPS unavailable';
  if (status === 'granted') return 'Re-use GPS';
  return 'Use GPS';
}

function gpsIcon(status: GpsStatus): string {
  if (status === 'requesting') return '🔄';
  if (status === 'denied') return '📍';
  return '📍';
}

export function LocationInput({
  gpsStatus,
  selectedLocation,
  searchQuery,
  searchResults,
  onGpsPress,
  onSearchChange,
  onLocationSelect,
  onClearLocation,
}: Props) {
  if (selectedLocation !== null) {
    return (
      <View className="mx-4 mb-3 flex-row items-center bg-gray-100 rounded-xl px-3 py-3">
        <Text className="text-green-600 mr-2 text-base">📍</Text>
        <Text className="flex-1 text-gray-800 font-medium" numberOfLines={1}>
          {selectedLocation.displayName}
        </Text>
        <Pressable onPress={onClearLocation} hitSlop={8} className="p-1">
          <Text className="text-gray-400 text-base font-bold">✕</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mx-4 mb-3">
      <Pressable
        onPress={onGpsPress}
        disabled={gpsStatus === 'requesting'}
        className={`flex-row items-center self-start px-3 py-2 rounded-xl mb-2 ${
          gpsStatus === 'denied' ? 'bg-gray-100' : 'bg-green-50'
        }`}
      >
        <Text className="mr-1">{gpsIcon(gpsStatus)}</Text>
        <Text
          className={`text-sm font-medium ${
            gpsStatus === 'denied' ? 'text-gray-400' : 'text-green-700'
          }`}
        >
          {gpsLabel(gpsStatus)}
        </Text>
      </Pressable>

      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search for a town or golf club..."
        placeholderTextColor="#9ca3af"
        className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 text-base"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="search"
      />

      {gpsStatus === 'denied' && searchQuery.length === 0 && (
        <Text className="text-xs text-gray-400 mt-1.5 px-1">
          Location permission was denied. Search for your location above.
        </Text>
      )}

      {searchResults.length > 0 && (
        <View className="mt-1 bg-white rounded-xl border border-gray-100 overflow-hidden">
          {searchResults.slice(0, 5).map((result) => (
            <Pressable
              key={result.id}
              onPress={() => onLocationSelect(result)}
              className="px-4 py-3 border-b border-gray-50 active:bg-gray-50"
            >
              <Text className="text-gray-800 font-medium">{result.name}</Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                {[result.admin1, result.country].filter(Boolean).join(', ')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
