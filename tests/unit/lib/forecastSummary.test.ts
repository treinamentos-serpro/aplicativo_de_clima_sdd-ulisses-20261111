import { describe, expect, it } from 'vitest';
import { summarizeForecastDay } from '../../../src/lib/forecastSummary';
import type { ForecastDay, HourlyForecast } from '../../../src/types/weather';

function hour(time: string, overrides: Partial<HourlyForecast> = {}): HourlyForecast {
  return {
    time,
    temperatureC: 20,
    condition: 'Céu limpo',
    precipitationMm: 0,
    precipitationProbability: 0,
    ...overrides,
  };
}

describe('summarizeForecastDay', () => {
  it('usa a maior probabilidade de chuva entre as horas do dia', () => {
    const day: ForecastDay = {
      date: '2026-11-11',
      hours: [
        hour('2026-11-11T09:00', { precipitationProbability: 20 }),
        hour('2026-11-11T15:00', { precipitationProbability: 80 }),
        hour('2026-11-11T20:00', { precipitationProbability: null }),
      ],
    };

    expect(summarizeForecastDay(day).precipitationChance).toBe(80);
  });

  it('retorna null para probabilidade quando nenhuma hora tem o dado', () => {
    const day: ForecastDay = {
      date: '2026-11-11',
      hours: [hour('2026-11-11T12:00', { precipitationProbability: null })],
    };

    expect(summarizeForecastDay(day).precipitationChance).toBeNull();
  });
});
