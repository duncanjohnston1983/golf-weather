import { View, Text, ScrollView, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '~/context/SettingsContext';
import { RoundLengthPicker } from '@/components/RoundLengthPicker';
import { formatHour } from '~/utils/format';

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="px-4 pt-5 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {title}
    </Text>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-4 bg-white rounded-2xl overflow-hidden">
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  leftLabel,
  rightLabel,
  value,
  onToggle,
  isLast = false,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  value: 'left' | 'right';
  onToggle: (v: 'left' | 'right') => void;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <Text className="flex-1 text-base text-gray-800">{label}</Text>
      <View className="flex-row bg-gray-100 rounded-lg p-0.5">
        <Pressable
          onPress={() => onToggle('left')}
          className={`px-3 py-1.5 rounded-md ${value === 'left' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text
            className={`text-sm font-medium ${value === 'left' ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {leftLabel}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onToggle('right')}
          className={`px-3 py-1.5 rounded-md ${value === 'right' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text
            className={`text-sm font-medium ${value === 'right' ? 'text-gray-900' : 'text-gray-400'}`}
          >
            {rightLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  isLast = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  isLast?: boolean;
}) {
  return (
    <View className={`px-4 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base text-gray-800">{label}</Text>
        <Text className="text-sm font-semibold text-green-600">{Math.round(value)}%</Text>
      </View>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={5}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#16a34a"
        maximumTrackTintColor="#e5e7eb"
        thumbTintColor="#16a34a"
      />
    </View>
  );
}

function StepperRow({
  label,
  value,
  onDecrement,
  onIncrement,
  displayValue,
  canDecrement,
  canIncrement,
  isLast = false,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  displayValue: string;
  canDecrement: boolean;
  canIncrement: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <Text className="flex-1 text-base text-gray-800">{label}</Text>
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onDecrement}
          disabled={!canDecrement}
          className={`w-8 h-8 rounded-full items-center justify-center ${canDecrement ? 'bg-gray-100' : 'bg-gray-50'}`}
          hitSlop={8}
        >
          <Text className={`text-lg font-bold ${canDecrement ? 'text-gray-700' : 'text-gray-300'}`}>
            −
          </Text>
        </Pressable>
        <Text className="text-base font-semibold text-gray-900 w-12 text-center">
          {displayValue}
        </Text>
        <Pressable
          onPress={onIncrement}
          disabled={!canIncrement}
          className={`w-8 h-8 rounded-full items-center justify-center ${canIncrement ? 'bg-gray-100' : 'bg-gray-50'}`}
          hitSlop={8}
        >
          <Text className={`text-lg font-bold ${canIncrement ? 'text-gray-700' : 'text-gray-300'}`}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const TEE_MIN = 5;
const TEE_MAX = 11;
const TEE_STEP = 0.5;

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Units */}
      <SectionHeader title="Units" />
      <Card>
        <ToggleRow
          label="Wind speed"
          leftLabel="mph"
          rightLabel="km/h"
          value={settings.windUnit === 'mph' ? 'left' : 'right'}
          onToggle={(v) => updateSettings({ windUnit: v === 'left' ? 'mph' : 'kmh' })}
        />
        <ToggleRow
          label="Temperature"
          leftLabel="°C"
          rightLabel="°F"
          value={settings.tempUnit === 'celsius' ? 'left' : 'right'}
          onToggle={(v) => updateSettings({ tempUnit: v === 'left' ? 'celsius' : 'fahrenheit' })}
          isLast
        />
      </Card>

      {/* Scoring weights */}
      <SectionHeader title="Scoring Weights" />
      <Text className="px-4 pb-2 text-xs text-gray-400">
        Adjust how much each factor influences the score. Weights are normalised automatically.
      </Text>
      <Card>
        <SliderRow
          label="🌧 Rain"
          value={settings.rainWeight}
          onChange={(v) => updateSettings({ rainWeight: v })}
        />
        <SliderRow
          label="💨 Wind"
          value={settings.windWeight}
          onChange={(v) => updateSettings({ windWeight: v })}
        />
        <SliderRow
          label="🌡 Temperature"
          value={settings.tempWeight}
          onChange={(v) => updateSettings({ tempWeight: v })}
          isLast
        />
      </Card>

      {/* Defaults */}
      <SectionHeader title="Defaults" />
      <Card>
        {/* Earliest tee time */}
        <StepperRow
          label="Earliest tee time"
          value={settings.earliestTeeHour}
          displayValue={formatHour(settings.earliestTeeHour)}
          canDecrement={settings.earliestTeeHour > TEE_MIN}
          canIncrement={settings.earliestTeeHour < TEE_MAX}
          onDecrement={() =>
            updateSettings({ earliestTeeHour: settings.earliestTeeHour - TEE_STEP })
          }
          onIncrement={() =>
            updateSettings({ earliestTeeHour: settings.earliestTeeHour + TEE_STEP })
          }
        />
        {/* Default round length */}
        <View className="px-4 py-3">
          <Text className="text-base text-gray-800 mb-2">Default round length</Text>
          <RoundLengthPicker
            roundLength={settings.roundLength}
            onSelect={(v) => updateSettings({ roundLength: v })}
          />
        </View>
      </Card>
    </ScrollView>
  );
}
