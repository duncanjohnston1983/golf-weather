import { View, Text, Pressable, TextInput, ActivityIndicator } from 'react-native';
import type { SelectedLocation, SearchResult } from '~/types/location';

type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied';

type Props = {
  gpsStatus: GpsStatus;
  selectedLocation: SelectedLocation | null;
  searchQuery: string;
  searchResults: SearchResult[];
  searching: boolean;
  onGpsPress: () => void;
  onSearchChange: (text: string) => void;
  onResultSelect: (result: SearchResult) => void;
  onClearLocation: () => void;
  dark?: boolean;
};

function gpsLabel(status: GpsStatus): string {
  if (status === 'requesting') return 'Finding location…';
  if (status === 'denied') return 'GPS unavailable';
  if (status === 'granted') return 'Re-use GPS';
  return 'Use my location';
}

export function LocationInput({
  gpsStatus,
  selectedLocation,
  searchQuery,
  searchResults,
  searching,
  onGpsPress,
  onSearchChange,
  onResultSelect,
  onClearLocation,
  dark = false,
}: Props) {
  const textColor = dark ? '#ffffff' : '#0f172a';
  const subTextColor = dark ? 'rgba(255,255,255,0.55)' : '#64748b';
  const inputBg = dark ? 'rgba(255,255,255,0.12)' : '#f1f5f9';
  const inputTextColor = dark ? '#ffffff' : '#0f172a';
  const placeholderColor = dark ? 'rgba(255,255,255,0.4)' : '#94a3b8';

  if (selectedLocation !== null) {
    return (
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: dark ? 'rgba(255,255,255,0.12)' : '#f1f5f9',
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <Text style={{ marginRight: 8, fontSize: 16 }}>
          {selectedLocation.source === 'gps' ? '📍' : '⛳'}
        </Text>
        <Text
          style={{ flex: 1, color: textColor, fontWeight: '600', fontSize: 15 }}
          numberOfLines={1}
        >
          {selectedLocation.displayName}
        </Text>
        <Pressable onPress={onClearLocation} hitSlop={10}>
          <Text style={{ color: subTextColor, fontSize: 18, fontWeight: '300' }}>✕</Text>
        </Pressable>
      </View>
    );
  }

  const courses = searchResults.filter((r) => r.kind === 'course');
  const places = searchResults.filter((r) => r.kind === 'place');

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 4 }}>
      {/* GPS button */}
      <Pressable
        onPress={onGpsPress}
        disabled={gpsStatus === 'requesting'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          backgroundColor: dark ? 'rgba(255,255,255,0.12)' : '#f0fdf4',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        {gpsStatus === 'requesting' ? (
          <ActivityIndicator size="small" color={dark ? '#86efac' : '#16a34a'} style={{ marginRight: 6 }} />
        ) : (
          <Text style={{ marginRight: 6, fontSize: 14 }}>📍</Text>
        )}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: gpsStatus === 'denied' ? subTextColor : (dark ? '#86efac' : '#15803d'),
          }}
        >
          {gpsLabel(gpsStatus)}
        </Text>
      </Pressable>

      {/* Search input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: inputBg,
          borderRadius: 14,
          paddingHorizontal: 14,
        }}
      >
        <Text style={{ marginRight: 8, fontSize: 14 }}>🔍</Text>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search golf club or town…"
          placeholderTextColor={placeholderColor}
          style={{ flex: 1, color: inputTextColor, fontSize: 15, paddingVertical: 13 }}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
        />
        {searching && (
          <ActivityIndicator size="small" color={dark ? '#86efac' : '#16a34a'} />
        )}
      </View>

      {/* GPS denied hint */}
      {gpsStatus === 'denied' && searchQuery.length === 0 && (
        <Text style={{ color: subTextColor, fontSize: 12, marginTop: 8, paddingHorizontal: 2 }}>
          Location permission denied — search for your club or town above.
        </Text>
      )}

      {/* Results dropdown */}
      {searchResults.length > 0 && (
        <View
          style={{
            marginTop: 6,
            backgroundColor: '#ffffff',
            borderRadius: 14,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.10,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Golf courses section */}
          {courses.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 }}>
                <Text style={{ color: '#16a34a', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
                  ⛳ Golf Courses
                </Text>
              </View>
              {courses.map((result) => (
                <Pressable
                  key={`course-${result.id}`}
                  onPress={() => onResultSelect(result)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f8fafc',
                    backgroundColor: pressed ? '#f0fdf4' : 'transparent',
                  })}
                >
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{result.name}</Text>
                  {result.subtitle.length > 0 && (
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{result.subtitle}</Text>
                  )}
                </Pressable>
              ))}
            </>
          )}

          {/* Locations section */}
          {places.length > 0 && (
            <>
              <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 }}>
                <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
                  📍 Locations
                </Text>
              </View>
              {places.map((result) => (
                <Pressable
                  key={`place-${result.id}`}
                  onPress={() => onResultSelect(result)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f8fafc',
                    backgroundColor: pressed ? '#f8fafc' : 'transparent',
                  })}
                >
                  <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{result.name}</Text>
                  {result.subtitle.length > 0 && (
                    <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{result.subtitle}</Text>
                  )}
                </Pressable>
              ))}
            </>
          )}
        </View>
      )}
    </View>
  );
}
