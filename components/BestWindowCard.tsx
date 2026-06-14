import { View, Text } from 'react-native';
import type { RankedWindow, HourInput } from '~/scoring/scoring';
import { ScoreBar } from './ScoreBar';
import { formatHour } from '~/utils/format';

type Props = {
  window: RankedWindow;
  windUnit?: 'mph' | 'kmh';
  tempUnit?: 'celsius' | 'fahrenheit';
};

function avgOf(hours: RankedWindow['hours'], key: keyof HourInput): number {
  if (hours.length === 0) return 0;
  return hours.reduce((sum, h) => sum + h[key], 0) / hours.length;
}

function maxOf(hours: RankedWindow['hours'], key: keyof HourInput): number {
  return hours.reduce((m, h) => Math.max(m, h[key]), 0);
}

function scoreColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-gray-50 rounded-xl p-2 items-center">
      <Text className="text-xs text-gray-400 mb-0.5">{label}</Text>
      <Text className="text-sm font-semibold text-gray-700">{value}</Text>
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
    <View className="bg-white rounded-2xl mx-4 mb-3 p-4">
      <Text className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-3">
        Best Window
      </Text>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-6xl font-bold" style={{ color: scoreColor(w.score) }}>
          {w.score}
        </Text>
        <View className="items-end flex-1 ml-4">
          <Text className="text-xl font-bold text-gray-900">
            {formatHour(w.startHour)}–{formatHour(w.endHour)}
          </Text>
          <Text className="text-sm text-gray-500 mt-1 text-right" numberOfLines={1}>
            {w.reason}
          </Text>
        </View>
      </View>
      <ScoreBar score={w.score} height={10} />
      <View className="flex-row gap-2 mt-3">
        <StatPill label="Wind" value={`${avgWind} ${windLabel}`} />
        <StatPill label="Gusts" value={`${maxGust} ${windLabel}`} />
        <StatPill label="Rain" value={`${avgRain}%`} />
        <StatPill label="Feels" value={`${avgTemp}${tempLabel}`} />
      </View>
    </View>
  );
}
