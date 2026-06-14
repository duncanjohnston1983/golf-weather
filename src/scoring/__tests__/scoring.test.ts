import { DEFAULT_SCORING, applyWeightOverrides, normalizeWeights } from '../scoring.config';
import { scoreHour, scoreWindow, rankWindows, generateReason } from '../scoring';
import type { ForecastResponse } from '../../types/weather';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PERFECT: Parameters<typeof scoreHour>[0] = {
  windSpeed: 5,
  windGust: 5,
  precipitation: 0,
  precipProb: 0,
  feelsLike: 18,
};

const HURRICANE: Parameters<typeof scoreHour>[0] = {
  windSpeed: 60,
  windGust: 80,
  precipitation: 0,
  precipProb: 0,
  feelsLike: 18,
};

const DOWNPOUR: Parameters<typeof scoreHour>[0] = {
  windSpeed: 5,
  windGust: 5,
  precipitation: 5,
  precipProb: 90,
  feelsLike: 18,
};

function makeForecast(opts?: {
  windSpeeds?: number[];
  windGusts?: number[];
  precipitation?: number[];
  precipProb?: number[];
  feelsLike?: number[];
  sunrise?: string;
  sunset?: string;
}): ForecastResponse {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const zero = hours.map(() => 0);
  const warm = hours.map(() => 18);
  return {
    latitude: 52.28,
    longitude: -1.58,
    timezone: 'Europe/London',
    hourly: {
      time: hours.map((h) => `2026-06-14T${String(h).padStart(2, '0')}:00`),
      wind_speed_10m: opts?.windSpeeds ?? zero,
      wind_gusts_10m: opts?.windGusts ?? zero,
      precipitation: opts?.precipitation ?? zero,
      precipitation_probability: opts?.precipProb ?? zero,
      apparent_temperature: opts?.feelsLike ?? warm,
      weather_code: zero,
    },
    daily: {
      time: ['2026-06-14'],
      sunrise: [opts?.sunrise ?? '2026-06-14T05:00'],
      sunset: [opts?.sunset ?? '2026-06-14T21:00'],
    },
  };
}

// ─── scoreHour ────────────────────────────────────────────────────────────────

describe('scoreHour', () => {
  it('returns 0 penalty for perfect conditions', () => {
    expect(scoreHour(PERFECT)).toBe(0);
  });

  it('returns near-max penalty for hurricane wind', () => {
    const penalty = scoreHour(HURRICANE);
    expect(penalty).toBeGreaterThan(30);
  });

  it('returns high penalty for heavy downpour', () => {
    const penalty = scoreHour(DOWNPOUR);
    expect(penalty).toBeGreaterThan(40);
  });

  it('gusty conditions score worse than calm sustained wind', () => {
    const calmWind = scoreHour({ ...PERFECT, windSpeed: 20, windGust: 20 });
    const gustyWind = scoreHour({ ...PERFECT, windSpeed: 15, windGust: 35 });
    expect(gustyWind).toBeGreaterThan(calmWind);
  });

  it('cold temperature adds penalty', () => {
    const cold = scoreHour({ ...PERFECT, feelsLike: -5 });
    expect(cold).toBeGreaterThan(0);
  });

  it('hot temperature adds penalty', () => {
    const hot = scoreHour({ ...PERFECT, feelsLike: 38 });
    expect(hot).toBeGreaterThan(0);
  });

  it('ideal temperature adds no penalty', () => {
    const ideal = scoreHour({ ...PERFECT, feelsLike: 20 });
    expect(ideal).toBe(0);
  });

  it('weight overrides change the relative penalty', () => {
    const rainHeavy = applyWeightOverrides({ rain: 0.9, wind: 0.05, temp: 0.05 });
    const windHeavy = applyWeightOverrides({ rain: 0.05, wind: 0.9, temp: 0.05 });
    const rainyHour: Parameters<typeof scoreHour>[0] = {
      ...PERFECT,
      precipProb: 80,
      precipitation: 3,
    };
    expect(scoreHour(rainyHour, rainHeavy)).toBeGreaterThan(scoreHour(rainyHour, windHeavy));
  });
});

// ─── scoreWindow ──────────────────────────────────────────────────────────────

describe('scoreWindow', () => {
  it('returns 0 for empty array', () => {
    expect(scoreWindow([])).toBe(0);
  });

  it('returns 100 for all-zero penalties', () => {
    expect(scoreWindow([0, 0, 0, 0])).toBe(100);
  });

  it('returns 0 for all-100 penalties', () => {
    expect(scoreWindow([100, 100, 100, 100])).toBe(0);
  });

  it('penalises peak penalty heavier than average (max component)', () => {
    const spiky = scoreWindow([0, 0, 0, 100]);
    const even = scoreWindow([25, 25, 25, 25]);
    expect(spiky).toBeLessThan(even);
  });

  it('returns value in 0–100 range', () => {
    const score = scoreWindow([10, 30, 50, 20]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

// ─── normalizeWeights ────────────────────────────────────────────────────────

describe('normalizeWeights', () => {
  it('ensures weights sum to 1.0 after normalization', () => {
    const w = normalizeWeights({ rain: 50, wind: 35, temp: 15 });
    expect(w.rain + w.wind + w.temp).toBeCloseTo(1.0, 5);
  });

  it('falls back to defaults when all zero', () => {
    const w = normalizeWeights({ rain: 0, wind: 0, temp: 0 });
    expect(w).toEqual(DEFAULT_SCORING.weights);
  });
});

// ─── rankWindows ─────────────────────────────────────────────────────────────

describe('rankWindows', () => {
  it('returns windows sorted by score descending', () => {
    const morning = Array.from({ length: 24 }, (_, i) => (i >= 8 && i < 10 ? 0 : 60));
    const forecast = makeForecast({ windSpeeds: morning, windGusts: morning });
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i - 1]!.score).toBeGreaterThanOrEqual(windows[i]!.score);
    }
  });

  it('excludes windows outside daylight + buffer', () => {
    const forecast = makeForecast({ sunrise: '2026-06-14T06:00', sunset: '2026-06-14T20:00' });
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    const latest = Math.max(...windows.map((w) => w.startHour));
    // Latest start must be before 20:00 - 4h - 0.5h(buffer) = 15:30 → floor = 15
    expect(latest).toBeLessThanOrEqual(15);
  });

  it('returns empty array when daylight too short for round', () => {
    const forecast = makeForecast({ sunrise: '2026-06-14T07:00', sunset: '2026-06-14T08:00' });
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    expect(windows).toHaveLength(0);
  });

  it('earliest start is max(sunrise, earliestStartHour)', () => {
    const forecast = makeForecast({ sunrise: '2026-06-14T09:00' }); // sunrise after config 07:00
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    const earliest = Math.min(...windows.map((w) => w.startHour));
    expect(earliest).toBeGreaterThanOrEqual(9);
  });

  it('all-clear day produces at least one window scoring above 85', () => {
    const forecast = makeForecast(); // all zeros, 18°C — perfect conditions
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    expect(windows.length).toBeGreaterThan(0);
    expect(windows[0]!.score).toBeGreaterThan(85);
  });

  it('heavy rain + gale day produces windows all scoring below 20', () => {
    const rain = Array.from({ length: 24 }, () => 90);
    const gale = Array.from({ length: 24 }, () => 45); // well above roughThreshold 30
    const forecast = makeForecast({ precipProb: rain, windSpeeds: gale, windGusts: gale });
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    for (const w of windows) {
      expect(w.score).toBeLessThan(20);
    }
  });
});

// ─── generateReason ──────────────────────────────────────────────────────────

describe('generateReason', () => {
  it('says "Comfortable" for a high-scoring window', () => {
    const forecast = makeForecast();
    const [top] = rankWindows(forecast, 4, DEFAULT_SCORING);
    expect(top?.reason).toMatch(/Comfortable/);
  });

  it('says "Gusty" when gusts dominate', () => {
    const gusts = Array.from({ length: 24 }, () => 50);
    const speeds = Array.from({ length: 24 }, () => 10);
    const forecast = makeForecast({ windGusts: gusts, windSpeeds: speeds });
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    const hasGusty = windows.some((w) => w.reason.includes('Gusty'));
    expect(hasGusty).toBe(true);
  });

  it('says "Rain likely" when heavy rain probability dominates', () => {
    const rain = Array.from({ length: 24 }, () => 90);
    const forecast = makeForecast({ precipProb: rain });
    const windows = rankWindows(forecast, 4, DEFAULT_SCORING);
    const hasRain = windows.some((w) => w.reason.includes('Rain likely'));
    expect(hasRain).toBe(true);
  });

  it('says "Cool" when below-ideal temp dominates', () => {
    const cold = Array.from({ length: 24 }, () => -3);
    const forecast = makeForecast({ feelsLike: cold });
    const config = applyWeightOverrides({ rain: 0.05, wind: 0.05, temp: 0.9 });
    const windows = rankWindows(forecast, 4, config);
    const hasCool = windows.some((w) => w.reason.includes('Cool'));
    expect(hasCool).toBe(true);
  });
});
