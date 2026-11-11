import type { Page, Route } from '@playwright/test';

const GEOCODING_HOST = 'geocoding-api.open-meteo.com';
const FORECAST_HOST = 'api.open-meteo.com';

const HOURS_PER_DAY = 24;
const FORECAST_DAYS = 5;

export const geocodingBody = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.63611,
      country: 'Brasil',
      admin1: 'São Paulo',
    },
  ],
};

function buildForecastBody() {
  const times: string[] = [];
  const temperatures: number[] = [];
  const precipitationProbability: number[] = [];
  const weatherCodes: number[] = [];
  const precipitation: number[] = [];

  for (let day = 0; day < FORECAST_DAYS; day++) {
    const date = new Date(Date.UTC(2025, 10, 11 + day));
    const isoDate = date.toISOString().slice(0, 10);
    for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
      times.push(`${isoDate}T${String(hour).padStart(2, '0')}:00`);
      temperatures.push(hour === 14 ? 30 : 20);
      precipitationProbability.push(hour === 14 ? 80 : 10);
      weatherCodes.push(hour === 14 ? 80 : 2);
      precipitation.push(hour === 14 ? 2 : 0);
    }
  }

  return {
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2025-11-11T14:00',
      temperature_2m: 24,
      relative_humidity_2m: 68,
      weather_code: 2,
      wind_speed_10m: 12,
      pressure_msl: 1012,
      precipitation: 0.2,
    },
    hourly: {
      time: times,
      temperature_2m: temperatures,
      precipitation_probability: precipitationProbability,
      weather_code: weatherCodes,
      precipitation,
    },
  };
}

export const forecastBody = buildForecastBody();

export type MockOptions = {
  geocoding?: { status: number; body: unknown };
  forecast?: { status: number; body: unknown } | ((attempt: number) => { status: number; body: unknown });
};

export type MockHandle = {
  geocodingRequests: () => number;
  forecastRequests: () => number;
};

/**
 * Intercepta as chamadas à Open-Meteo para que os testes E2E sejam
 * determinísticos e nunca acessem a API real.
 */
export async function mockOpenMeteo(page: Page, options: MockOptions = {}): Promise<MockHandle> {
  let geocodingCount = 0;
  let forecastCount = 0;

  await page.route(
    (url) => url.hostname === GEOCODING_HOST,
    async (route: Route) => {
      geocodingCount++;
      const response = options.geocoding ?? { status: 200, body: geocodingBody };
      await route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response.body),
      });
    },
  );

  await page.route(
    (url) => url.hostname === FORECAST_HOST,
    async (route: Route) => {
      forecastCount++;
      const forecast = options.forecast ?? { status: 200, body: forecastBody };
      const response = typeof forecast === 'function' ? forecast(forecastCount) : forecast;
      await route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response.body),
      });
    },
  );

  return {
    geocodingRequests: () => geocodingCount,
    forecastRequests: () => forecastCount,
  };
}
