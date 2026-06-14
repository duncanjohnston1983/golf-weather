import { View, Text } from 'react-native';
import type { RankedWindow, HourInput } from '~/scoring/scoring';
import { ScoreBar } from './ScoreBar';
import { formatHour } from '~/utils/format';

type Props = {
  window: RankedWindow;
  windUnit?: 'mph' | 'kmh';
  tempUnit?: 'celsius' | 'fahrenheit';
};

const CARD_BG = '#0a3d1f';
const CARD_BG_LIGHT = 'rgba(255,255,255,0.10)';
const TEXT_DIM = 'rgba(255,255,255,0.55)';

function avgOf(hours: RankedWindow['hours'], key: keyof HourInput): number {
  if (hours.length === 0) return 0;
  return hours.reduce((sum, h) => sum + h[key], 0) / hours.length;
}

function maxOf(hours: RankedWindow['hours'], key: keyof HourInput): number {
  return hours.reduce((m, h) => Math.max(m, h[key]), 0);
}

function scoreTextColor(score: number): string {
  if (score >= 75) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{ backgroundColor: CARD_BG_LIGHT, flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
    >
      <Text style={{ color: TEXT_DIM, fontSize: 10, marginBottom: 2 }}>{label}</Text>
      <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

export function BestWindowCard({ window: w, windUnit = 'mph', tempUnit = 'celsius' }: Props) {
  const avgWind = avgOf(w.hours, 'windSpeed').toFixed(0);
  const maxGust = maxOf(w.hours, 'windGust').toFixed(0);
  const avgRain = avgOf(w.hours, 'precipProb').toFixed(0);
  const avgTemp = avgOf(w.hours, 'feelsLike').toFixed(0);
  const windLabel = windUnit === 'kmh' ? 'km/h' : 'mph';
  const tempLabel = tempUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <View
      style={{
        backgroundColor: CARD_BG,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* Label */}
      <Text style={{ color: TEXT_DIM, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 14 }}>
        Best Window
      </Text>

      {/* Score + time block */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        {/* Time + reason */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 }}>
            {formatHour(w.startHour)} – {formatHour(w.endHour)}
          </Text>
          <Text style={{ color: '#86efac', fontSize: 13, marginTop: 4 }} numberOfLines={1}>
            {w.reason}
          </Text>
        </View>

        {/* Score circle */}
        <View
          style={{
            backgroundColor: CARD_BG_LIGHT,
            borderRadius: 44,
            width: 84,
            height: 84,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1.5,
            borderColor: 'rgba(255,255,255,0.15)',
            marginLeft: 12,
          }}
        >
          <Text style={{ color: scoreTextColor(w.score), fontSize: 34, fontWeight: '900', lineHeight: 38 }}>
            {w.score}
          </Text>
          <Text style={{ color: TEXT_DIM, fontSize: 10 }}>/100</Text>
        </View>
      </View>

      {/* Score bar */}
      <ScoreBar score={w.score} height={5} />

      {/* Stat pills */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <StatPill label="Wind" value={`${avgWind} ${windLabel}`} />
        <StatPill label="Gusts" value={`${maxGust} ${windLabel}`} />
        <StatPill label="Rain" value={`${avgRain}%`} />
        <StatPill label="Feels" value={`${avgTemp}${tempLabel}`} />
      </View>
    </View>
  );
}
