import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import type { RankedWindow } from '~/scoring/scoring';
import { ScoreBar } from './ScoreBar';
import { formatHour } from '~/utils/format';

type Props = {
  window: RankedWindow;
  windUnit?: 'mph' | 'kmh';
  tempUnit?: 'celsius' | 'fahrenheit';
};

function scoreColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

export function WindowRow({ window: w, windUnit = 'mph', tempUnit = 'celsius' }: Props) {
  const [expanded, setExpanded] = useState(false);
  const windLabel = windUnit === 'kmh' ? 'km/h' : 'mph';
  const tempLabel = tempUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      className="bg-white mx-4 mb-2 rounded-xl overflow-hidden"
    >
      <View className="p-3">
        <View className="flex-row items-center mb-2">
          <Text
            className="text-2xl font-bold w-12"
            style={{ color: scoreColor(w.score) }}
          >
            {w.score}
          </Text>
          <View className="flex-1 ml-2">
            <Text className="font-semibold text-gray-900">
              {formatHour(w.startHour)}–{formatHour(w.endHour)}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
              {w.reason}
            </Text>
          </View>
          <Text className="text-gray-300 ml-2">{expanded ? '▲' : '▼'}</Text>
        </View>
        <ScoreBar score={w.score} />
        <View className="flex-row mt-2 gap-3">
          <Text className="text-xs text-gray-400">
            💨 {w.hours.reduce((s, h) => s + h.windSpeed, 0) / Math.max(w.hours.length, 1) | 0} {windLabel}
          </Text>
          <Text className="text-xs text-gray-400">
            ↑{w.hours.reduce((m, h) => Math.max(m, h.windGust), 0) | 0} {windLabel}
          </Text>
          <Text className="text-xs text-gray-400">
            🌧 {w.hours.reduce((s, h) => s + h.precipProb, 0) / Math.max(w.hours.length, 1) | 0}%
          </Text>
          <Text className="text-xs text-gray-400">
            🌡 {w.hours.reduce((s, h) => s + h.feelsLike, 0) / Math.max(w.hours.length, 1) | 0}{tempLabel}
          </Text>
        </View>
      </View>

      {expanded && (
        <View className="border-t border-gray-100">
          {w.hours.map((h) => (
            <View
              key={h.hour}
              className="flex-row items-center px-3 py-2 border-b border-gray-50"
            >
              <Text className="text-xs text-gray-400 w-12">{formatHour(h.hour)}</Text>
              <Text className="text-xs text-gray-600 flex-1">
                {`💨 ${h.windSpeed | 0}↑${h.windGust | 0} ${windLabel}  🌧 ${h.precipProb}%  🌡 ${h.feelsLike | 0}${tempLabel}`}
              </Text>
              <View className="w-16">
                <ScoreBar score={100 - h.penalty} height={4} />
              </View>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
