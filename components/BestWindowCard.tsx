import { View, Text } from 'react-native';
import type { RankedWindow, HourInput } from '~/scoring/scoring';
import { ScoreBar } from './ScoreBar';
import { WeatherEffect } from './WeatherEffect';
import { formatHour } from '~/utils/format';
import {
  getCardCondition,
  generateWindowNarrative,
  generateTip,
  type CardCondition,
} from '~/utils/narrative';

type Props = {
  window: RankedWindow;
  windUnit?: 'mph' | 'kmh';
  tempUnit?: 'celsius' | 'fahrenheit';
};

type Theme = {
  bg: string;
  accentText: string;
  dimText: string;
  scoreColor: (s: number) => string;
  decorEmoji: string;
};

const THEMES: Record<CardCondition, Theme> = {
  sunny: {
    bg: '#14532d',
    accentText: '#86efac',
    dimText: 'rgba(255,255,255,0.55)',
    scoreColor: () => '#4ade80',
    decorEmoji: '☀️',
  },
  cloudy: {
    bg: '#0a3d1f',
    accentText: '#86efac',
    dimText: 'rgba(255,255,255,0.5)',
    scoreColor: (s) => (s >= 75 ? '#4ade80' : s >= 50 ? '#fbbf24' : '#f87171'),
    decorEmoji: '⛅',
  },
  rainy: {
    bg: '#1e3a5f',
    accentText: '#93c5fd',
    dimText: 'rgba(255,255,255,0.5)',
    scoreColor: () => '#93c5fd',
    decorEmoji: '🌧️',
  },
  windy: {
    bg: '#1c3a2e',
    accentText: '#a7f3d0',
    dimText: 'rgba(255,255,255,0.5)',
    scoreColor: () => '#a7f3d0',
    decorEmoji: '🌬️',
  },
  cold: {
    bg: '#1e2d52',
    accentText: '#bae6fd',
    dimText: 'rgba(255,255,255,0.5)',
    scoreColor: () => '#bae6fd',
    decorEmoji: '❄️',
  },
  hot: {
    bg: '#7c2d12',
    accentText: '#fed7aa',
    dimText: 'rgba(255,255,255,0.5)',
    scoreColor: () => '#fbbf24',
    decorEmoji: '🌡️',
  },
};

function avgOf(hours: RankedWindow['hours'], key: keyof HourInput): number {
  if (hours.length === 0) return 0;
  return hours.reduce((sum, h) => sum + h[key], 0) / hours.length;
}

function maxOf(hours: RankedWindow['hours'], key: keyof HourInput): number {
  return hours.reduce((m, h) => Math.max(m, h[key]), 0);
}

function StatPill({
  label,
  value,
  dimText,
}: {
  label: string;
  value: string;
  dimText: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
        paddingVertical: 9,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: dimText, fontSize: 10, marginBottom: 2 }}>{label}</Text>
      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export function BestWindowCard({ window: w, windUnit = 'mph', tempUnit = 'celsius' }: Props) {
  const condition = getCardCondition(w, tempUnit);
  const theme = THEMES[condition];
  const narrative = generateWindowNarrative(w, windUnit);
  const tip = generateTip(w, tempUnit);

  const avgWind = avgOf(w.hours, 'windSpeed').toFixed(0);
  const maxGust = maxOf(w.hours, 'windGust').toFixed(0);
  const avgRain = avgOf(w.hours, 'precipProb').toFixed(0);
  const avgTemp = avgOf(w.hours, 'feelsLike').toFixed(0);
  const windLabel = windUnit === 'kmh' ? 'km/h' : 'mph';
  const tempLabel = tempUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <View
      style={{
        backgroundColor: theme.bg,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
        elevation: 8,
      }}
    >
      {/* Animated weather effect */}
      <WeatherEffect condition={condition} />

      {/* Ghost decor emoji */}
      <Text
        style={{
          position: 'absolute',
          right: -8,
          top: -8,
          fontSize: 120,
          opacity: 0.09,
          transform: [{ rotate: '12deg' }],
        }}
        pointerEvents="none"
      >
        {theme.decorEmoji}
      </Text>

      <View style={{ padding: 20 }}>
        {/* Label row */}
        <Text
          style={{
            color: theme.dimText,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Best Window
        </Text>

        {/* Time + score circle */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: '#ffffff',
                fontSize: 28,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              {formatHour(w.startHour)} – {formatHour(w.endHour)}
            </Text>
            <Text
              style={{ color: theme.accentText, fontSize: 13, marginTop: 4 }}
              numberOfLines={1}
            >
              {narrative}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 44,
              width: 82,
              height: 82,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.18)',
              marginLeft: 12,
            }}
          >
            <Text
              style={{
                color: theme.scoreColor(w.score),
                fontSize: 33,
                fontWeight: '900',
                lineHeight: 36,
              }}
            >
              {w.score}
            </Text>
            <Text style={{ color: theme.dimText, fontSize: 10 }}>/100</Text>
          </View>
        </View>

        {/* Score bar */}
        <ScoreBar score={w.score} height={4} />

        {/* Tip blurb */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 9,
            marginTop: 12,
          }}
        >
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18 }}>
            {tip}
          </Text>
        </View>

        {/* Stat pills */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 12 }}>
          <StatPill label="Wind" value={`${avgWind} ${windLabel}`} dimText={theme.dimText} />
          <StatPill label="Gusts" value={`${maxGust} ${windLabel}`} dimText={theme.dimText} />
          <StatPill label="Rain" value={`${avgRain}%`} dimText={theme.dimText} />
          <StatPill label="Feels" value={`${avgTemp}${tempLabel}`} dimText={theme.dimText} />
        </View>
      </View>
    </View>
  );
}
