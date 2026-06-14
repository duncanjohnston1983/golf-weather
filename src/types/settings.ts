export type UserSettings = {
  windUnit: 'mph' | 'kmh';
  tempUnit: 'celsius' | 'fahrenheit';
  rainWeight: number;       // 0-100 (raw %)
  windWeight: number;       // 0-100 (raw %)
  tempWeight: number;       // 0-100 (raw %)
  roundLength: number;      // 3 | 3.5 | 4 | 4.5 | 5
  earliestTeeHour: number;  // 5..11 in 0.5 increments
};

export const DEFAULT_SETTINGS: UserSettings = {
  windUnit: 'mph',
  tempUnit: 'celsius',
  rainWeight: 50,
  windWeight: 35,
  tempWeight: 15,
  roundLength: 4,
  earliestTeeHour: 7,
};
