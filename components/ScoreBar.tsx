import { View } from 'react-native';

type Props = {
  score: number;
  height?: number;
};

export function ScoreBar({ score, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <View
      className="w-full bg-gray-200 rounded-full overflow-hidden"
      style={{ height }}
    >
      <View className={`${color} h-full rounded-full`} style={{ width: `${pct}%` }} />
    </View>
  );
}
