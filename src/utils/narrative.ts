import type { RankedWindow } from '~/scoring/scoring';
import { formatHour } from './format';

export type CardCondition = 'sunny' | 'rainy' | 'windy' | 'cold' | 'hot' | 'cloudy';

function avg(vals: number[]): number {
  if (vals.length === 0) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

export function getCardCondition(
  window: RankedWindow,
  tempUnit: 'celsius' | 'fahrenheit',
): CardCondition {
  const hours = window.hours;
  const avgRain = avg(hours.map((h) => h.precipProb));
  const maxGust = hours.reduce((m, h) => Math.max(m, h.windGust), 0);
  const avgTemp = avg(hours.map((h) => h.feelsLike));

  const coldThreshold = tempUnit === 'fahrenheit' ? 45 : 7;
  const hotThreshold = tempUnit === 'fahrenheit' ? 82 : 28;
  const gustThreshold = 30; // mph — same threshold scales in kmh are handled by scoring config

  if (avgRain > 45) return 'rainy';
  if (maxGust > gustThreshold) return 'windy';
  if (avgTemp < coldThreshold) return 'cold';
  if (avgTemp > hotThreshold) return 'hot';
  if (window.score >= 72 && avgRain < 20) return 'sunny';
  return 'cloudy';
}

// Returns a narrative like "Showers possible 11:00–13:00" or "Clear conditions throughout"
export function generateWindowNarrative(
  window: RankedWindow,
  windUnit: 'mph' | 'kmh',
): string {
  const hours = window.hours;

  const rainyHours = hours.filter((h) => h.precipProb >= 40);
  if (rainyHours.length === hours.length) return 'Rain likely throughout the round';
  if (rainyHours.length > 0) {
    const first = rainyHours[0];
    const last = rainyHours[rainyHours.length - 1];
    if (first === undefined || last === undefined) return 'Showers possible';
    return `Showers possible ${formatHour(first.hour)}–${formatHour(last.hour + 1)}`;
  }

  const windThreshold = windUnit === 'kmh' ? 40 : 25;
  const windyHours = hours.filter((h) => h.windSpeed > windThreshold);
  if (windyHours.length === hours.length) return 'Breezy throughout the round';
  if (windyHours.length > 0) {
    const first = windyHours[0];
    if (first === undefined) return 'Windy conditions';
    const isLater = first.hour > (hours[0]?.hour ?? 0) + 1;
    return isLater ? `Wind picks up from ${formatHour(first.hour)}` : 'Breezy throughout';
  }

  return 'Clear conditions throughout';
}

export function generateTip(
  window: RankedWindow,
  tempUnit: 'celsius' | 'fahrenheit',
): string {
  const hours = window.hours;
  const avgRain = avg(hours.map((h) => h.precipProb));
  const maxGust = hours.reduce((m, h) => Math.max(m, h.windGust), 0);
  const avgTemp = avg(hours.map((h) => h.feelsLike));

  const coldThreshold = tempUnit === 'fahrenheit' ? 45 : 7;
  const hotThreshold = tempUnit === 'fahrenheit' ? 82 : 28;

  if (avgRain > 65) return "Waterproofs on, soggy shoes expected ☂️";
  if (avgRain > 38) return "Brolly advised — showers likely at some point 🌂";
  if (maxGust > 42) return "Hold onto your hat — properly gusty out there 🎩";
  if (maxGust > 28) return "A breezy one — expect some interesting ball flights 🌬️";
  if (avgTemp < coldThreshold) return "Layer up before you tee off — it's a cold one 🧥";
  if (avgTemp > hotThreshold) return "Suncream and water bottle are non-negotiable ☀️";
  if (window.score >= 88) return "Near-perfect conditions — absolutely no excuses! 🏌️";
  if (window.score >= 75) return "A solid window — get out there and make it count ⛳";
  if (window.score >= 50) return "Playable with the right attitude 🤞";
  return "Not ideal, but real golfers don't melt 🤷";
}
