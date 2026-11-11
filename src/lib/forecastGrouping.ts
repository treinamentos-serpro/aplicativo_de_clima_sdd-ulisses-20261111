import type { ForecastDay, HourlyForecast } from '../types/weather';

export const MAX_FORECAST_DAYS = 5;
const HOURS_PER_DAY = 24;

/** Agrupa entradas horárias por dia local (`YYYY-MM-DD`). Mantém só dias com 24 horas, até `MAX_FORECAST_DAYS` (AC-02.1). */
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

  return Array.from(hoursByDate, ([date, hours]) => ({ date, hours }))
    .filter((day) => day.hours.length === HOURS_PER_DAY)
    .slice(0, MAX_FORECAST_DAYS);
}
