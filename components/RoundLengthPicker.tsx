import { View, Text, Pressable } from 'react-native';

const ROUND_OPTIONS = [3, 3.5, 4, 4.5, 5] as const;

type Props = {
  roundLength: number;
  onSelect: (h: number) => void;
};

export function RoundLengthPicker({ roundLength, onSelect }: Props) {
  return (
    <View className="flex-row gap-2">
      {ROUND_OPTIONS.map((h) => {
        const active = roundLength === h;
        return (
          <Pressable
            key={h}
            onPress={() => onSelect(h)}
            className={`flex-1 py-2 rounded-xl items-center ${active ? 'bg-green-600' : 'bg-gray-100'}`}
          >
            <Text
              className={`text-sm font-semibold ${active ? 'text-white' : 'text-gray-600'}`}
            >
              {h}h
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
