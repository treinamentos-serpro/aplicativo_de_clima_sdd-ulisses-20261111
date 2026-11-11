import type { ForecastDay, HourlyForecast } from '../types/weather';

export const MAX_FORECAST_DAYS = 5;

/** Agrupa entradas horárias por dia local (`YYYY-MM-DD`), limitando a `MAX_FORECAST_DAYS` dias. */
export function groupHourlyByDay(entries: HourlyForecast[]): ForecastDay[] {
  const hoursByDate = new Map<string, HourlyForecast[]>();

  for (const entry of entries) {
    const date = entry.time.slice(0, 10);
    const hours = hoursByDate.get(date);
    if (hours) {
      hours.push(entry);
    } else {
      hoursByDate.set(date, [entry]);
    }
  }

  return Array.from(hoursByDate, ([date, hours]) => ({ date, hours })).slice(0, MAX_FORECAST_DAYS);
}
