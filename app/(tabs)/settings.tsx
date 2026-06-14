import { View, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-4xl mb-2">⚙️</Text>
      <Text className="text-2xl font-bold text-gray-800 mb-2">Settings</Text>
      <Text className="text-base text-gray-500 text-center">
        Units, scoring weights, preferences.{'\n'}Coming in Slice 5.
      </Text>
    </View>
  );
}
