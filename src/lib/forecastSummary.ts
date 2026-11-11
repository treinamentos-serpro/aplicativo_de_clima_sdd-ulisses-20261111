import type { ForecastDay } from '../types/weather';

export interface ForecastDaySummary {
  maxC: number | null;
  minC: number | null;
  precipitationMm: number | null;
  precipitationChance: number | null;
  condition: string | null;
}

/**
 * Resume um dia: máx/mín das temperaturas válidas, soma de chuva, maior
 * probabilidade de chuva e condição do horário de referência (12h, ou o primeiro horário).
 */
export function summarizeForecastDay(day: ForecastDay): ForecastDaySummary {
  const temps = day.hours
    .map((hour) => hour.temperatureC)
    .filter((value): value is number => value !== null);

  const rainValues = day.hours
    .map((hour) => hour.precipitationMm)
    .filter((value): value is number => value !== null);

  const chanceValues = day.hours
    .map((hour) => hour.precipitationProbability)
    .filter((value): value is number => value !== null);

  const reference = day.hours.find((hour) => hour.time.endsWith('T12:00')) ?? day.hours[0];

  return {
    maxC: temps.length > 0 ? Math.max(...temps) : null,
    minC: temps.length > 0 ? Math.min(...temps) : null,
    precipitationMm:
      rainValues.length > 0
        ? Math.round(rainValues.reduce((sum, v) => sum + v, 0) * 10) / 10
        : null,
    precipitationChance: chanceValues.length > 0 ? Math.max(...chanceValues) : null,
    condition: reference?.condition ?? null,
  };
}
