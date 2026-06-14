import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
  Linking,
} from 'react-native';
import { requestLocation } from '~/services/location';
import { searchLocations } from '~/services/geocoding';
import { fetchForecast } from '~/services/forecast';
import { rankWindows } from '~/scoring/scoring';
import { applyWeightOverrides, scaleWindThresholds, scaleTempThresholds } from '~/scoring/scoring.config';
import { useSettings } from '~/context/SettingsContext';
import type { GeocodingResult } from '~/types/weather';
import type { SelectedLocation } from '~/types/location';
import type { RankedWindow } from '~/scoring/scoring';
import { LocationInput } from '@/components/LocationInput';
import { DateStrip } from '@/components/DateStrip';
import { RoundLengthPicker } from '@/components/RoundLengthPicker';
import { BestWindowCard } from '@/components/BestWindowCard';
import { WindowRow } from '@/components/WindowRow';
import { formatDate } from '~/utils/format';

type UIPhase = 'idle' | 'loading' | 'results' | 'error' | 'empty';
type GpsStatus = 'idle' | 'requesting' | 'granted' | 'denied';

const SUPPORT_URL = 'https://ko-fi.com/dusklabs';

export default function HomeScreen() {
  const { settings } = useSettings();

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [roundLength, setRoundLength] = useState(settings.roundLength);
  const [phase, setPhase] = useState<UIPhase>('idle');
  const [windows, setWindows] = useState<RankedWindow[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync default round length once when persisted settings load from AsyncStorage
  const didSyncDefaults = useRef(false);
  useEffect(() => {
    if (!didSyncDefaults.current) {
      didSyncDefaults.current = true;
      setRoundLength(settings.roundLength);
    }
  }, [settings.roundLength]);

  // Auto-request GPS on mount
  useEffect(() => {
    void (async () => {
      setGpsStatus('requesting');
      const loc = await requestLocation();
      if (loc !== null) {
        setGpsStatus('granted');
        setSelectedLocation({
          displayName: 'My Location',
          latitude: loc.latitude,
          longitude: loc.longitude,
          source: 'gps',
        });
      } else {
        setGpsStatus('denied');
      }
    })();
  }, []);

  // Debounced geocoding search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      void searchLocations(searchQuery).then(setSearchResults);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build scoring config from current settings
  function buildScoringConfig() {
    const withWeights = applyWeightOverrides({
      rain: settings.rainWeight / 100,
      wind: settings.windWeight / 100,
      temp: settings.tempWeight / 100,
    });
    const withUnits = scaleWindThresholds(
      scaleTempThresholds(withWeights, settings.tempUnit),
      settings.windUnit,
    );
    return {
      ...withUnits,
      timing: {
        ...withUnits.timing,
        earliestStartHour: settings.earliestTeeHour,
      },
    };
  }

  // Fetch + score forecast whenever location / date / round / settings change
  useEffect(() => {
    if (selectedLocation === null) return;
    setPhase('loading');
    setWindows([]);

    const config = buildScoringConfig();

    void (async () => {
      try {
        const forecast = await fetchForecast(
          selectedLocation.latitude,
          selectedLocation.longitude,
          formatDate(selectedDate),
          { wind: settings.windUnit, temperature: settings.tempUnit },
        );
        const ranked = rankWindows(forecast, roundLength, config);
        setWindows(ranked);
        setPhase(ranked.length === 0 ? 'empty' : 'results');
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load forecast');
        setPhase('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, selectedDate, roundLength, settings]);

  const handleGpsPress = useCallback(() => {
    void (async () => {
      setGpsStatus('requesting');
      const loc = await requestLocation();
      if (loc !== null) {
        setGpsStatus('granted');
        setSelectedLocation({
          displayName: 'My Location',
          latitude: loc.latitude,
          longitude: loc.longitude,
          source: 'gps',
        });
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setGpsStatus('denied');
      }
    })();
  }, []);

  const handleLocationSelect = useCallback((result: GeocodingResult) => {
    const suffix = result.admin1 !== undefined ? `, ${result.admin1}` : '';
    setSelectedLocation({
      displayName: `${result.name}${suffix}`,
      latitude: result.latitude,
      longitude: result.longitude,
      source: 'search',
    });
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleClearLocation = useCallback(() => {
    setSelectedLocation(null);
    setPhase('idle');
    setWindows([]);
  }, []);

  const bestWindow = windows[0];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="pt-4 pb-3 px-4">
          <Text className="text-2xl font-bold text-gray-900">⛳ Golf Weather</Text>
          <Text className="text-sm text-gray-400 mt-0.5">Find your best window to play</Text>
        </View>

        {/* Location picker */}
        <LocationInput
          gpsStatus={gpsStatus}
          selectedLocation={selectedLocation}
          searchQuery={searchQuery}
          searchResults={searchResults}
          onGpsPress={handleGpsPress}
          onSearchChange={setSearchQuery}
          onLocationSelect={handleLocationSelect}
          onClearLocation={handleClearLocation}
        />

        {/* Date strip */}
        <DateStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        {/* Round length */}
        <View className="px-4 mb-4">
          <Text className="text-xs text-gray-400 mb-2 uppercase font-semibold tracking-wider">
            Round Length
          </Text>
          <RoundLengthPicker roundLength={roundLength} onSelect={setRoundLength} />
        </View>

        {/* ── Loading ── */}
        {phase === 'loading' && (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="text-gray-400 mt-3 text-sm">Loading forecast...</Text>
          </View>
        )}

        {/* ── Error ── */}
        {phase === 'error' && (
          <View className="mx-4 p-4 bg-red-50 rounded-xl">
            <Text className="text-red-700 font-semibold">Could not load forecast</Text>
            <Text className="text-red-500 text-sm mt-1">{errorMessage}</Text>
          </View>
        )}

        {/* ── Empty ── */}
        {phase === 'empty' && (
          <View className="mx-4 p-4 bg-amber-50 rounded-xl">
            <Text className="text-amber-700 font-semibold">No playable windows today</Text>
            <Text className="text-amber-600 text-sm mt-1">
              No tee windows fit the available daylight. Try a shorter round or pick a different
              day.
            </Text>
          </View>
        )}

        {/* ── Results ── */}
        {phase === 'results' && bestWindow !== undefined && (
          <>
            <BestWindowCard
              window={bestWindow}
              windUnit={settings.windUnit}
              tempUnit={settings.tempUnit}
            />

            {windows.length > 1 && (
              <Text className="px-4 mb-2 text-xs text-gray-400 uppercase font-semibold tracking-wider">
                All Windows
              </Text>
            )}

            {windows.slice(1).map((w) => (
              <WindowRow
                key={w.startHour}
                window={w}
                windUnit={settings.windUnit}
                tempUnit={settings.tempUnit}
              />
            ))}

            {/* Attribution + support */}
            <View className="mx-4 mt-5 pt-3 border-t border-gray-100 flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">Weather data by Open-Meteo.com</Text>
              <Pressable onPress={() => void Linking.openURL(SUPPORT_URL)}>
                <Text className="text-xs text-green-600 font-medium">☕ Support this app</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
