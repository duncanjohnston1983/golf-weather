export type ScoringWeights = {
  rain: number;
  wind: number;
  temp: number;
};

export type ScoringConfig = {
  wind: {
    calmThreshold: number;
    roughThreshold: number;
    gustWeight: number;
  };
  rain: {
    probLowPct: number;
    probHighPct: number;
    mmLight: number;
    mmHeavy: number;
  };
  temp: {
    idealMin: number;
    idealMax: number;
    coldMin: number;
    hotMax: number;
  };
  weights: ScoringWeights;
  timing: {
    daylightBufferMins: number;
    earliestStartHour: number;
  };
};

export const DEFAULT_SCORING: ScoringConfig = {
  wind: {
    calmThreshold: 10,
    roughThreshold: 30,
    gustWeight: 0.4,
  },
  rain: {
    probLowPct: 5,
    probHighPct: 60,
    mmLight: 0.5,
    mmHeavy: 2.0,
  },
  temp: {
    idealMin: 12,
    idealMax: 25,
    coldMin: 0,
    hotMax: 35,
  },
  weights: {
    rain: 0.5,
    wind: 0.35,
    temp: 0.15,
  },
  timing: {
    daylightBufferMins: 30,
    earliestStartHour: 7,
  },
};

export function normalizeWeights(w: ScoringWeights): ScoringWeights {
  const total = w.rain + w.wind + w.temp;
  if (total === 0) return DEFAULT_SCORING.weights;
  return { rain: w.rain / total, wind: w.wind / total, temp: w.temp / total };
}

export function applyWeightOverrides(
  partial: Partial<ScoringWeights>,
  base: ScoringConfig = DEFAULT_SCORING,
): ScoringConfig {
  const merged: ScoringWeights = { ...base.weights, ...partial };
  return { ...base, weights: normalizeWeights(merged) };
}

// Convert mph thresholds to kmh for forecasts fetched in kmh
export function scaleWindThresholds(
  config: ScoringConfig,
  windUnit: 'mph' | 'kmh',
): ScoringConfig {
  if (windUnit === 'mph') return config;
  const scale = 1.60934;
  return {
    ...config,
    wind: {
      ...config.wind,
      calmThreshold: config.wind.calmThreshold * scale,
      roughThreshold: config.wind.roughThreshold * scale,
    },
  };
}

// Convert Celsius thresholds to Fahrenheit for forecasts fetched in °F
export function scaleTempThresholds(
  config: ScoringConfig,
  tempUnit: 'celsius' | 'fahrenheit',
): ScoringConfig {
  if (tempUnit === 'celsius') return config;
  const toF = (c: number) => c * 1.8 + 32;
  return {
    ...config,
    temp: {
      idealMin: toF(config.temp.idealMin),
      idealMax: toF(config.temp.idealMax),
      coldMin: toF(config.temp.coldMin),
      hotMax: toF(config.temp.hotMax),
    },
  };
}
