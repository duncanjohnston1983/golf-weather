import { View, Text, Pressable, ScrollView } from 'react-native';
import { isSameDay } from '~/utils/format';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

type Props = {
  selectedDate: Date;
  onDateSelect: (d: Date) => void;
};

export function DateStrip({ selectedDate, onDateSelect }: Props) {
  const today = new Date();
  const dates = Array.from({ length: 16 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-3"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {dates.map((d) => {
        const active = isSameDay(d, selectedDate);
        const dayLabel = DAY_LABELS[d.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6] ?? '?';
        return (
          <Pressable
            key={d.toISOString().slice(0, 10)}
            onPress={() => onDateSelect(d)}
            className={`py-2 px-3 rounded-xl items-center`}
            style={{ minWidth: 52, backgroundColor: active ? '#16a34a' : '#f3f4f6' }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: active ? '#fff' : '#6b7280' }}
            >
              {dayLabel}
            </Text>
            <Text
              className="text-lg font-bold"
              style={{ color: active ? '#fff' : '#111827' }}
            >
              {d.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
