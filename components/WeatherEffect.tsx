import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import type { CardCondition } from '~/utils/narrative';

// ── Rain ──────────────────────────────────────────────────────────────────────

const RAIN_DROPS = [
  { left: '7%', duration: 1250, delay: 0 },
  { left: '21%', duration: 1100, delay: 320 },
  { left: '38%', duration: 1380, delay: 150 },
  { left: '55%', duration: 1200, delay: 560 },
  { left: '71%', duration: 1080, delay: 200 },
  { left: '86%', duration: 1320, delay: 700 },
] as const;

function RainDrop({ left, duration, delay }: { left: string; duration: number; delay: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-18, 220] });
  const opacity = progress.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, 0.4, 0.35, 0] });

  return (
    <Animated.View
      style={[
        styles.rainDrop,
        { left: left as never, transform: [{ translateY }], opacity },
      ]}
    />
  );
}

function RainEffect() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {RAIN_DROPS.map((d, i) => (
        <RainDrop key={i} left={d.left} duration={d.duration} delay={d.delay} />
      ))}
    </View>
  );
}

// ── Snow ──────────────────────────────────────────────────────────────────────

const SNOW_FLAKES = [
  { left: '10%', duration: 3200, delay: 0, swing: 8 },
  { left: '29%', duration: 2800, delay: 900, swing: -6 },
  { left: '48%', duration: 3600, delay: 400, swing: 10 },
  { left: '67%', duration: 2900, delay: 1300, swing: -8 },
  { left: '83%', duration: 3100, delay: 650, swing: 7 },
] as const;

function Snowflake({ left, duration, delay, swing }: { left: string; duration: number; delay: number; swing: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-10, 220] });
  const translateX = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, swing, 0] });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.5, 0.45, 0] });

  return (
    <Animated.View
      style={[
        styles.snowFlake,
        { left: left as never, transform: [{ translateY }, { translateX }], opacity },
      ]}
    />
  );
}

function SnowEffect() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {SNOW_FLAKES.map((f, i) => (
        <Snowflake key={i} left={f.left} duration={f.duration} delay={f.delay} swing={f.swing} />
      ))}
    </View>
  );
}

// ── Heat shimmer ──────────────────────────────────────────────────────────────

const HEAT_WAVES = [
  { top: '60%', delay: 0, duration: 2200 },
  { top: '72%', delay: 600, duration: 1900 },
  { top: '84%', delay: 300, duration: 2400 },
] as const;

function HeatWave({ top, delay, duration }: { top: string; delay: number; duration: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [progress, duration, delay]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const opacity = progress.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.18, 0.18, 0] });

  return (
    <Animated.View
      style={[
        styles.heatWave,
        { top: top as never, transform: [{ translateY }], opacity },
      ]}
    />
  );
}

function HeatEffect() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {HEAT_WAVES.map((w, i) => (
        <HeatWave key={i} top={w.top} delay={w.delay} duration={w.duration} />
      ))}
    </View>
  );
}

// ── Wind streaks ──────────────────────────────────────────────────────────────

const WIND_STREAKS = [
  { top: '25%', duration: 900, delay: 0, width: 60 },
  { top: '42%', duration: 750, delay: 280, width: 40 },
  { top: '58%', duration: 1050, delay: 120, width: 70 },
  { top: '72%', duration: 820, delay: 450, width: 45 },
] as const;

function WindStreak({ top, duration, delay, width }: { top: string; duration: number; delay: number; width: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [progress, duration, delay]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-width - 20, 400] });
  const opacity = progress.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 0.3, 0.3, 0] });

  return (
    <Animated.View
      style={[
        { position: 'absolute', top: top as never, height: 1.5, width, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
        { transform: [{ translateX }], opacity },
      ]}
    />
  );
}

function WindEffect() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {WIND_STREAKS.map((s, i) => (
        <WindStreak key={i} top={s.top} duration={s.duration} delay={s.delay} width={s.width} />
      ))}
    </View>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function WeatherEffect({ condition }: { condition: CardCondition }) {
  if (condition === 'rainy') return <RainEffect />;
  if (condition === 'cold') return <SnowEffect />;
  if (condition === 'hot') return <HeatEffect />;
  if (condition === 'windy') return <WindEffect />;
  return null;
}

const styles = StyleSheet.create({
  rainDrop: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  snowFlake: {
    position: 'absolute',
    top: 0,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  heatWave: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,200,80,0.6)',
  },
});
