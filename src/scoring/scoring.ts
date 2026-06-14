import type { ForecastResponse } from '~/types/weather';
import { DEFAULT_SCORING, type ScoringConfig } from './scoring.config';

export type HourInput = {
  windSpeed: number;
  windGust: number;
  precipitation: number;
  precipProb: number;
  feelsLike: number;
};

export type HourDetail = HourInput & {
  hour: number;
  penalty: number;
};

export type RankedWindow = {
  startHour: number;
  endHour: number;
  roundLengthHours: number;
  score: number;
  reason: string;
  hours: HourDetail[];
};

function linearScale(value: number, low: number, high: number): number {
  if (value <= low) return 0;
  if (value >= high) return 100;
  return ((value - low) / (high - low)) * 100;
}

function computeTempPenalty(feelsLike: number, cfg: ScoringConfig['temp']): number {
  if (feelsLike >= cfg.idealMin && feelsLike <= cfg.idealMax) return 0;
  if (feelsLike < cfg.idealMin) {
    return linearScale(cfg.idealMin - feelsLike, 0, cfg.idealMin - cfg.coldMin);
  }
  return linearScale(feelsLike - cfg.idealMax, 0, cfg.hotMax - cfg.idealMax);
}

export function scoreHour(
  hour: HourInput,
  config: ScoringConfig = DEFAULT_SCORING,
): number {
  const effectiveWind =
    (1 - config.wind.gustWeight) * hour.windSpeed +
    config.wind.gustWeight * hour.windGust;

  const windPenalty = linearScale(
    effectiveWind,
    config.wind.calmThreshold,
    config.wind.roughThreshold,
  );

  const probPenalty = linearScale(hour.precipProb, config.rain.probLowPct, config.rain.probHighPct);
  const mmPenalty = linearScale(hour.precipitation, config.rain.mmLight, config.rain.mmHeavy);
  const rainPenalty = Math.max(probPenalty, mmPenalty);

  const tempPenalty = computeTempPenalty(hour.feelsLike, config.temp);

  const { rain, wind, temp } = config.weights;
  const total = rain * rainPenalty + wind * windPenalty + temp * tempPenalty;
  return Math.min(100, Math.max(0, total));
}

export function scoreWindow(penalties: readonly number[]): number {
  if (penalties.length === 0) return 0;
  const mean = penalties.reduce((sum, p) => sum + p, 0) / penalties.length;
  const max = Math.max(...(penalties as number[]));
  const windowPenalty = 0.5 * mean + 0.5 * max;
  return Math.round(Math.max(0, Math.min(100, 100 - windowPenalty)));
}

function parseHour(isoTime: string): number {
  const timePart = isoTime.split('T')[1] ?? '00:00';
  const hourStr = timePart.split(':')[0] ?? '0';
  return parseInt(hourStr, 10);
}

function formatHour(h: number): string {
  return `${String(Math.floor(h)).padStart(2, '0')}:00`;
}

export function generateReason(
  window: RankedWindow,
  config: ScoringConfig = DEFAULT_SCORING,
): string {
  const timeRange = `${formatHour(window.startHour)}–${formatHour(window.endHour)}`;

  if (window.score >= 80) {
    return `Comfortable ${timeRange}`;
  }

  let worstPenalty = -1;
  let worstHour: HourDetail | undefined;
  for (const h of window.hours) {
    if (h.penalty > worstPenalty) {
      worstPenalty = h.penalty;
      worstHour = h;
    }
  }

  if (worstHour === undefined) return `Score ${window.score}`;

  const effectiveWind =
    (1 - config.wind.gustWeight) * worstHour.windSpeed +
    config.wind.gustWeight * worstHour.windGust;

  const windContrib =
    linearScale(effectiveWind, config.wind.calmThreshold, config.wind.roughThreshold) *
    config.weights.wind;
  const rainContrib =
    Math.max(
      linearScale(worstHour.precipProb, config.rain.probLowPct, config.rain.probHighPct),
      linearScale(worstHour.precipitation, config.rain.mmLight, config.rain.mmHeavy),
    ) * config.weights.rain;
  const tempContrib = computeTempPenalty(worstHour.feelsLike, config.temp) * config.weights.temp;

  if (windContrib >= rainContrib && windContrib >= tempContrib) {
    const isGusty = worstHour.windGust > worstHour.windSpeed * 1.4;
    return isGusty ? `Gusty ${timeRange}` : `Windy ${timeRange}`;
  }

  if (rainContrib >= windContrib && rainContrib >= tempContrib) {
    return worstHour.precipProb >= config.rain.probHighPct
      ? `Rain likely ${timeRange}`
      : `Showers possible ${timeRange}`;
  }

  return worstHour.feelsLike < config.temp.idealMin
    ? `Cool ${timeRange}`
    : `Hot ${timeRange}`;
}

export function rankWindows(
  forecast: ForecastResponse,
  roundLengthHours: number,
  config: ScoringConfig = DEFAULT_SCORING,
): RankedWindow[] {
  const { hourly, daily } = forecast;

  const sunriseStr = daily.sunrise[0];
  const sunsetStr = daily.sunset[0];
  const sunriseHour = sunriseStr !== undefined ? parseHour(sunriseStr) : 5;
  const sunsetHour = sunsetStr !== undefined ? parseHour(sunsetStr) : 21;

  const hourIndexMap = new Map<number, number>();
  hourly.time.forEach((t, i) => {
    hourIndexMap.set(parseHour(t), i);
  });

  const earliestStart = Math.max(sunriseHour, config.timing.earliestStartHour);
  const latestStart =
    sunsetHour - roundLengthHours - config.timing.daylightBufferMins / 60;

  const windows: RankedWindow[] = [];

  for (let startHour = earliestStart; startHour <= Math.floor(latestStart); startHour++) {
    const hoursNeeded = Math.ceil(roundLengthHours);
    const hourDetails: HourDetail[] = [];

    for (let h = 0; h < hoursNeeded; h++) {
      const hour = startHour + h;
      const idx = hourIndexMap.get(hour);
      if (idx === undefined) continue;

      const input: HourInput = {
        windSpeed: hourly.wind_speed_10m[idx] ?? 0,
        windGust: hourly.wind_gusts_10m[idx] ?? 0,
        precipitation: hourly.precipitation[idx] ?? 0,
        precipProb: hourly.precipitation_probability[idx] ?? 0,
        feelsLike: hourly.apparent_temperature[idx] ?? 15,
      };

      hourDetails.push({ ...input, hour, penalty: scoreHour(input, config) });
    }

    if (hourDetails.length === 0) continue;

    const penalties = hourDetails.map((h) => h.penalty);
    const endHour = startHour + roundLengthHours;
    const score = scoreWindow(penalties);

    windows.push({
      startHour,
      endHour,
      roundLengthHours,
      score,
      reason: '',
      hours: hourDetails,
    });
  }

  windows.sort((a, b) => b.score - a.score);

  return windows.map((w) => ({ ...w, reason: generateReason(w, config) }));
}
