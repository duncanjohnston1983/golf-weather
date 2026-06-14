import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-4xl mb-2">⛳</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-2">Golf Weather</Text>
      <Text className="text-base text-gray-500 text-center">
        Find your best window to play.{'\n'}Coming in Slice 2.
      </Text>
    </View>
  );
}
