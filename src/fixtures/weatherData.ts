import type { City, CurrentWeather, ForecastDay, HourlyForecast } from '../types/weather';

/** Agregado completo usado só nos fixtures de UI (o tipo foi removido de `types/weather.ts`). */
interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
}

/**
 * Dados de exemplo para desenvolver a UI sem a API.
 * Substituído pela camada de services no Module 07.
 */

const START_DATE = new Date(2026, 10, 11);
const CONDITIONS = ['Céu limpo', 'Parcialmente nublado', 'Chuva fraca', 'Nublado'];

function isoDate(base: Date, offsetDays: number): string {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildDay(dayIndex: number): ForecastDay {
  const date = isoDate(START_DATE, dayIndex);
  const hours: HourlyForecast[] = Array.from({ length: 24 }, (_, hour) => {
    const wave = Math.sin(((hour - 9) / 24) * Math.PI * 2);
    return {
      time: `${date}T${String(hour).padStart(2, '0')}:00`,
      temperatureC: Math.round(22 + dayIndex * 0.8 + wave * 4),
      condition: CONDITIONS[(dayIndex + Math.floor(hour / 6)) % CONDITIONS.length],
      precipitationMm: (dayIndex + hour) % 5 === 0 ? 0.4 : 0,
      precipitationProbability: ((dayIndex * 17 + hour * 7) % 11) * 10,
    };
  });
  return { date, hours };
}

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    region: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    observedAt: '2026-11-11T14:00',
    temperatureC: 24,
    condition: 'Parcialmente nublado',
    relativeHumidity: 68,
    windSpeedKmh: 12,
    pressureHpa: 1012,
    precipitationMm: 0.2,
  },
  forecast: [0, 1, 2, 3, 4].map(buildDay),
  fetchedAt: '2026-11-11T17:00:00Z',
};
