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
import { searchLocations, searchGolfCourses } from '~/services/geocoding';
import { fetchForecast } from '~/services/forecast';
import { rankWindows } from '~/scoring/scoring';
import { applyWeightOverrides, scaleWindThresholds, scaleTempThresholds } from '~/scoring/scoring.config';
import { useSettings } from '~/context/SettingsContext';
import type { SelectedLocation, SearchResult } from '~/types/location';
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
const HERO_BG = '#0a3d1f';
const APP_BG = '#f8fafc';

export default function HomeScreen() {
  const { settings } = useSettings();

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [roundLength, setRoundLength] = useState(settings.roundLength);
  const [phase, setPhase] = useState<UIPhase>('idle');
  const [windows, setWindows] = useState<RankedWindow[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync default round length once when persisted settings load
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

  // Debounced combined search (golf courses + places)
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      void Promise.all([
        searchGolfCourses(searchQuery),
        searchLocations(searchQuery),
      ]).then(([courses, places]) => {
        const combined: SearchResult[] = [
          ...courses.slice(0, 5).map((c) => ({
            kind: 'course' as const,
            id: c.id,
            name: c.name,
            subtitle: [c.city, c.country].filter(Boolean).join(', '),
            latitude: c.latitude,
            longitude: c.longitude,
          })),
          ...places.slice(0, 4).map((p) => ({
            kind: 'place' as const,
            id: p.id,
            name: p.name,
            subtitle: [p.admin1, p.country].filter(Boolean).join(', '),
            latitude: p.latitude,
            longitude: p.longitude,
          })),
        ];
        setSearchResults(combined);
        setSearching(false);
      });
    }, 400);
    return () => {
      clearTimeout(timer);
      setSearching(false);
    };
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
      timing: { ...withUnits.timing, earliestStartHour: settings.earliestTeeHour },
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

  const handleResultSelect = useCallback((result: SearchResult) => {
    setSelectedLocation({
      displayName: result.name,
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
      style={{ flex: 1, backgroundColor: APP_BG }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Dark hero header ── */}
        <View
          style={{
            backgroundColor: HERO_BG,
            paddingTop: 52,
            paddingBottom: 20,
          }}
        >
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <Text style={{ color: '#ffffff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
              ⛳ Golf Weather
            </Text>
            <Text style={{ color: '#86efac', fontSize: 14, marginTop: 3 }}>
              Find your perfect tee window
            </Text>
          </View>

          <LocationInput
            gpsStatus={gpsStatus}
            selectedLocation={selectedLocation}
            searchQuery={searchQuery}
            searchResults={searchResults}
            searching={searching}
            onGpsPress={handleGpsPress}
            onSearchChange={setSearchQuery}
            onResultSelect={handleResultSelect}
            onClearLocation={handleClearLocation}
            dark
          />
        </View>

        {/* ── Date strip ── */}
        <View style={{ backgroundColor: '#ffffff', paddingTop: 14, paddingBottom: 10 }}>
          <DateStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </View>

        {/* ── Round length ── */}
        <View style={{ backgroundColor: '#ffffff', paddingHorizontal: 20, paddingBottom: 16, marginBottom: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
            Round Length
          </Text>
          <RoundLengthPicker roundLength={roundLength} onSelect={setRoundLength} />
        </View>

        {/* ── Loading ── */}
        {phase === 'loading' && (
          <View style={{ alignItems: 'center', paddingVertical: 64 }}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={{ color: '#94a3b8', marginTop: 14, fontSize: 14 }}>Checking the forecast…</Text>
          </View>
        )}

        {/* ── Idle prompt ── */}
        {phase === 'idle' && (
          <View style={{ alignItems: 'center', paddingVertical: 64, paddingHorizontal: 40 }}>
            <Text style={{ fontSize: 48 }}>⛳</Text>
            <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }}>
              Where are you playing?
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
              Search for a golf club or town to see the best tee windows scored by weather.
            </Text>
          </View>
        )}

        {/* ── Error ── */}
        {phase === 'error' && (
          <View style={{ marginHorizontal: 16, marginTop: 8, backgroundColor: '#fef2f2', borderRadius: 16, padding: 16 }}>
            <Text style={{ color: '#991b1b', fontWeight: '700', fontSize: 15 }}>Could not load forecast</Text>
            <Text style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>{errorMessage}</Text>
          </View>
        )}

        {/* ── Empty ── */}
        {phase === 'empty' && (
          <View style={{ marginHorizontal: 16, marginTop: 8, backgroundColor: '#fffbeb', borderRadius: 16, padding: 16 }}>
            <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 15 }}>No playable windows</Text>
            <Text style={{ color: '#b45309', fontSize: 13, marginTop: 6, lineHeight: 19 }}>
              No tee windows fit within today's daylight. Try a shorter round or pick a different day.
            </Text>
          </View>
        )}

        {/* ── Results ── */}
        {phase === 'results' && bestWindow !== undefined && (
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Today's Windows
              </Text>
            </View>

            <BestWindowCard
              window={bestWindow}
              windUnit={settings.windUnit}
              tempUnit={settings.tempUnit}
            />

            {windows.length > 1 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' }}>
                  Other Options
                </Text>
              </View>
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
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 24,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: '#e2e8f0',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ color: '#94a3b8', fontSize: 12 }}>Weather by Open-Meteo.com</Text>
              <Pressable onPress={() => void Linking.openURL(SUPPORT_URL)}>
                <Text style={{ color: '#16a34a', fontSize: 12, fontWeight: '600' }}>☕ Buy me a coffee</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
