export type GeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
};

export type WeatherUnits = {
  wind: 'mph' | 'kmh';
  temperature: 'celsius' | 'fahrenheit';
};

export type HourlyData = {
  time: string[];
  apparent_temperature: number[];
  precipitation: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
};

export type DailyData = {
  time: string[];
  sunrise: string[];
  sunset: string[];
};

export type ForecastResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: HourlyData;
  daily: DailyData;
};
