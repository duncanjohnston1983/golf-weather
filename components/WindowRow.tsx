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

function scoreBg(score: number): string {
  if (score >= 75) return '#f0fdf4';
  if (score >= 50) return '#fffbeb';
  return '#fef2f2';
}

export function WindowRow({ window: w, windUnit = 'mph', tempUnit = 'celsius' }: Props) {
  const [expanded, setExpanded] = useState(false);
  const windLabel = windUnit === 'kmh' ? 'km/h' : 'mph';
  const tempLabel = tempUnit === 'fahrenheit' ? '°F' : '°C';

  const avgWind = (w.hours.reduce((s, h) => s + h.windSpeed, 0) / Math.max(w.hours.length, 1)) | 0;
  const maxGust = w.hours.reduce((m, h) => Math.max(m, h.windGust), 0) | 0;
  const avgRain = (w.hours.reduce((s, h) => s + h.precipProb, 0) / Math.max(w.hours.length, 1)) | 0;
  const avgTemp = (w.hours.reduce((s, h) => s + h.feelsLike, 0) / Math.max(w.hours.length, 1)) | 0;

  return (
    <Pressable
      onPress={() => setExpanded((e) => !e)}
      style={{
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ padding: 14 }}>
        {/* Top row: score badge + time + chevron */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          {/* Score badge */}
          <View
            style={{
              backgroundColor: scoreBg(w.score),
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              marginRight: 12,
              minWidth: 52,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: scoreColor(w.score), fontSize: 20, fontWeight: '800' }}>
              {w.score}
            </Text>
          </View>

          {/* Time + reason */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '700' }}>
              {formatHour(w.startHour)} – {formatHour(w.endHour)}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {w.reason}
            </Text>
          </View>

          <Text style={{ color: '#cbd5e1', fontSize: 12, marginLeft: 8 }}>
            {expanded ? '▲' : '▼'}
          </Text>
        </View>

        {/* Score bar */}
        <ScoreBar score={w.score} height={4} />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', marginTop: 10, gap: 12 }}>
          <Text style={{ color: '#64748b', fontSize: 12 }}>💨 {avgWind} {windLabel}</Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>↑ {maxGust} {windLabel}</Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>🌧 {avgRain}%</Text>
          <Text style={{ color: '#64748b', fontSize: 12 }}>🌡 {avgTemp}{tempLabel}</Text>
        </View>
      </View>

      {/* Expanded hour-by-hour */}
      {expanded && (
        <View style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          {w.hours.map((h) => (
            <View
              key={h.hour}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderBottomWidth: 1,
                borderBottomColor: '#f8fafc',
              }}
            >
              <Text style={{ color: '#94a3b8', fontSize: 12, width: 44, fontWeight: '600' }}>
                {formatHour(h.hour)}
              </Text>
              <Text style={{ color: '#475569', fontSize: 12, flex: 1 }}>
                {`💨 ${h.windSpeed | 0}↑${h.windGust | 0} ${windLabel}  🌧 ${h.precipProb}%  🌡 ${h.feelsLike | 0}${tempLabel}`}
              </Text>
              <View style={{ width: 56 }}>
                <ScoreBar score={100 - h.penalty} height={4} />
              </View>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}
