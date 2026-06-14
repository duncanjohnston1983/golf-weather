import type { ForecastResponse, WeatherUnits } from '~/types/weather';

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

const HOURLY_FIELDS =
  'apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m';

const DAILY_FIELDS = 'sunrise,sunset';

export async function fetchForecast(
  latitude: number,
  longitude: number,
  date: string,
  units: WeatherUnits,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: HOURLY_FIELDS,
    daily: DAILY_FIELDS,
    start_date: date,
    end_date: date,
    timezone: 'auto',
    wind_speed_unit: units.wind,
    temperature_unit: units.temperature,
  });

  const response = await fetch(`${FORECAST_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status}`);
  }

  return (await response.json()) as ForecastResponse;
}
