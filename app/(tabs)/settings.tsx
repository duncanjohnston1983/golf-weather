import { View, Text, ScrollView, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettings } from '~/context/SettingsContext';
import { DEFAULT_SETTINGS } from '~/types/settings';
import { RoundLengthPicker } from '@/components/RoundLengthPicker';
import { formatHour } from '~/utils/format';

const DARK = '#0a3d1f';

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 10 }}>
      <Text style={{ color: '#0f172a', fontSize: 17, fontWeight: '700' }}>{title}</Text>
      {subtitle !== undefined && (
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 3, lineHeight: 18 }}>{subtitle}</Text>
      )}
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <Text style={{ flex: 1, color: '#0f172a', fontSize: 15, fontWeight: '500' }}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#f1f5f9',
          borderRadius: 10,
          padding: 3,
        }}
      >
        {(['left', 'right'] as const).map((side) => (
          <Pressable
            key={side}
            onPress={() => onToggle(side)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 8,
              backgroundColor: value === side ? '#ffffff' : 'transparent',
              shadowColor: value === side ? '#000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: value === side ? 0.08 : 0,
              shadowRadius: 2,
              elevation: value === side ? 1 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: value === side ? '#0f172a' : '#94a3b8',
              }}
            >
              {side === 'left' ? leftLabel : rightLabel}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function WeightRow({
  icon,
  label,
  description,
  value,
  onChange,
  isLast = false,
}: {
  icon: string;
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 10,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, marginRight: 10, marginTop: 1 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600' }}>{label}</Text>
            <View
              style={{
                backgroundColor: '#f0fdf4',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: '#16a34a', fontSize: 13, fontWeight: '700' }}>
                {Math.round(value)}%
              </Text>
            </View>
          </View>
          <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{description}</Text>
        </View>
      </View>
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={5}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#16a34a"
        maximumTrackTintColor="#e2e8f0"
        thumbTintColor="#0a3d1f"
      />
    </View>
  );
}

function StepperRow({
  label,
  subtitle,
  displayValue,
  canDecrement,
  canIncrement,
  onDecrement,
  onIncrement,
  isLast = false,
}: {
  label: string;
  subtitle?: string;
  displayValue: string;
  canDecrement: boolean;
  canIncrement: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '500' }}>{label}</Text>
        {subtitle !== undefined && (
          <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 1 }}>{subtitle}</Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={onDecrement}
          disabled={!canDecrement}
          hitSlop={10}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: canDecrement ? '#f1f5f9' : '#fafafa',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20, color: canDecrement ? '#334155' : '#cbd5e1', lineHeight: 22 }}>−</Text>
        </Pressable>
        <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '700', width: 48, textAlign: 'center' }}>
          {displayValue}
        </Text>
        <Pressable
          onPress={onIncrement}
          disabled={!canIncrement}
          hitSlop={10}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: canIncrement ? '#f1f5f9' : '#fafafa',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 20, color: canIncrement ? '#334155' : '#cbd5e1', lineHeight: 22 }}>+</Text>
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

  const isDefault =
    settings.rainWeight === DEFAULT_SETTINGS.rainWeight &&
    settings.windWeight === DEFAULT_SETTINGS.windWeight &&
    settings.tempWeight === DEFAULT_SETTINGS.tempWeight;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      contentContainerStyle={{ paddingBottom: 48 }}
    >
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
      <SectionHeader
        title="Scoring Weights"
        subtitle="Slide to set how much each factor matters to you personally. The app balances them automatically — boost rain and the others shrink to compensate."
      />
      <Card>
        <WeightRow
          icon="🌧"
          label="Rain & Precipitation"
          description="How much does rain ruin your round?"
          value={settings.rainWeight}
          onChange={(v) => updateSettings({ rainWeight: v })}
        />
        <WeightRow
          icon="💨"
          label="Wind & Gusts"
          description="How sensitive are you to windy conditions?"
          value={settings.windWeight}
          onChange={(v) => updateSettings({ windWeight: v })}
        />
        <WeightRow
          icon="🌡"
          label="Temperature"
          description={'🥶 Too cold AND 🥵 too hot both hurt the score. Ideal range: 12–25 °C. Slide to zero if you\'ll play in any weather.'}
          value={settings.tempWeight}
          onChange={(v) => updateSettings({ tempWeight: v })}
          isLast
        />
      </Card>

      {/* Reset weights button */}
      {!isDefault && (
        <Pressable
          onPress={() =>
            updateSettings({
              rainWeight: DEFAULT_SETTINGS.rainWeight,
              windWeight: DEFAULT_SETTINGS.windWeight,
              tempWeight: DEFAULT_SETTINGS.tempWeight,
            })
          }
          style={{ marginHorizontal: 16, marginTop: 10, alignItems: 'center', paddingVertical: 10 }}
        >
          <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
            Reset weights to defaults
          </Text>
        </Pressable>
      )}

      {/* Defaults */}
      <SectionHeader title="Defaults" subtitle="These are applied each time you open the app." />
      <Card>
        <StepperRow
          label="Earliest tee time"
          subtitle="Windows starting before this are excluded"
          displayValue={formatHour(settings.earliestTeeHour)}
          canDecrement={settings.earliestTeeHour > TEE_MIN}
          canIncrement={settings.earliestTeeHour < TEE_MAX}
          onDecrement={() => updateSettings({ earliestTeeHour: settings.earliestTeeHour - TEE_STEP })}
          onIncrement={() => updateSettings({ earliestTeeHour: settings.earliestTeeHour + TEE_STEP })}
        />
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 16,
          }}
        >
          <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '500', marginBottom: 12 }}>
            Default round length
          </Text>
          <RoundLengthPicker
            roundLength={settings.roundLength}
            onSelect={(v) => updateSettings({ roundLength: v })}
          />
        </View>
      </Card>

      {/* About */}
      <SectionHeader title="About" />
      <Card>
        <View style={{ padding: 16 }}>
          <Text style={{ color: '#64748b', fontSize: 13, lineHeight: 20 }}>
            Golf Weather uses the{' '}
            <Text style={{ color: '#0f172a', fontWeight: '600' }}>Open-Meteo</Text> free weather API
            — no account required, no data collected.{'\n\n'}Scores are calculated on your device
            using your personal weight preferences.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
