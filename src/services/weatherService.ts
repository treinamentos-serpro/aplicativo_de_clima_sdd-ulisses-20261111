import { groupHourlyByDay, MAX_FORECAST_DAYS } from '../lib/forecastGrouping';
import { getConditionText } from '../lib/weatherCodes';
import type {
  City,
  CurrentWeather,
  ForecastDay,
  HourlyForecast,
  WeatherData,
  WeatherErrorKind,
} from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const SEARCH_RESULT_LIMIT = 5;
const CURRENT_FIELDS =
  'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,precipitation';
const HOURLY_FIELDS = 'temperature_2m,weather_code,precipitation,precipitation_probability';

export const REQUEST_TIMEOUT_MS = 3000;

const ERROR_MESSAGES: Record<WeatherErrorKind, string> = {
  network: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
  timeout: 'A conexão demorou demais. Tente novamente em instantes.',
  http: 'O serviço de clima está indisponível no momento. Tente novamente.',
  invalid: 'A resposta do serviço de clima veio incompleta. Tente novamente.',
};

/** Erro tipado da camada de services. `message` já é amigável para a UI. */
export class WeatherServiceError extends Error {
  readonly kind: WeatherErrorKind;
  readonly status?: number;

  constructor(kind: WeatherErrorKind, status?: number) {
    super(ERROR_MESSAGES[kind]);
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function valueAt(list: unknown, index: number): unknown {
  return Array.isArray(list) ? list[index] : undefined;
}

/**
 * GET com timeout via AbortController. Devolve o JSON já parseado.
 * Toda falha vira WeatherServiceError; nenhum erro cru escapa.
 */
async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new WeatherServiceError('http', response.status);
    return await response.json();
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    if (controller.signal.aborted) throw new WeatherServiceError('timeout');
    if (error instanceof SyntaxError) throw new WeatherServiceError('invalid');
    throw new WeatherServiceError('network');
  } finally {
    clearTimeout(timer);
  }
}

/** Busca cidades pelo nome. Texto vazio retorna `[]` sem chamar a rede. */
export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (query === '') return [];

  const params = new URLSearchParams({
    name: query,
    count: String(SEARCH_RESULT_LIMIT),
    language: 'pt',
    format: 'json',
  });
  const body = await fetchJson(`${GEOCODING_URL}?${params}`);
  return parseCities(body);
}

/** Clima atual e previsão de 5 dias (em Celsius) para a cidade. */
export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    timezone: 'auto',
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    forecast_days: String(MAX_FORECAST_DAYS),
    wind_speed_unit: 'kmh',
  });
  const body = await fetchJson(`${FORECAST_URL}?${params}`);

  const current = parseCurrent(body);
  const forecast = parseForecast(body);
  if (!current || forecast.length !== MAX_FORECAST_DAYS) {
    throw new WeatherServiceError('invalid');
  }

  return { city, current, forecast, fetchedAt: new Date().toISOString() };
}

function parseCities(body: unknown): City[] {
  if (!isRecord(body) || !Array.isArray(body.results)) return [];

  return body.results.flatMap((entry): City[] => {
    if (!isRecord(entry)) return [];
    const latitude = toNumber(entry.latitude);
    const longitude = toNumber(entry.longitude);
    if (
      typeof entry.id !== 'number' ||
      typeof entry.name !== 'string' ||
      typeof entry.country !== 'string' ||
      latitude === null ||
      longitude === null
    ) {
      return [];
    }

    return [
      {
        id: entry.id,
        name: entry.name,
        region: typeof entry.admin1 === 'string' ? entry.admin1 : undefined,
        country: entry.country,
        countryCode: typeof entry.country_code === 'string' ? entry.country_code : undefined,
        latitude,
        longitude,
        timezone: typeof entry.timezone === 'string' ? entry.timezone : '',
      },
    ];
  });
}

/** Campos ausentes viram `null`. Sem nenhum campo válido, retorna `null`. */
function parseCurrent(body: unknown): CurrentWeather | null {
  if (!isRecord(body) || !isRecord(body.current)) return null;

  const current = body.current;
  const weatherCode = toNumber(current.weather_code);
  const data: CurrentWeather = {
    observedAt: typeof current.time === 'string' ? current.time : '',
    temperatureC: toNumber(current.temperature_2m),
    condition: getConditionText(weatherCode),
    relativeHumidity: toNumber(current.relative_humidity_2m),
    windSpeedKmh: toNumber(current.wind_speed_10m),
    pressureHpa: toNumber(current.pressure_msl),
    precipitationMm: toNumber(current.precipitation),
  };

  const hasAnyValue =
    weatherCode !== null ||
    data.temperatureC !== null ||
    data.relativeHumidity !== null ||
    data.windSpeedKmh !== null ||
    data.pressureHpa !== null ||
    data.precipitationMm !== null;

  return hasAnyValue ? data : null;
}

function parseForecast(body: unknown): ForecastDay[] {
  if (!isRecord(body) || !isRecord(body.hourly)) return [];

  const hourly = body.hourly;
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  const entries: HourlyForecast[] = [];

  times.forEach((time, index) => {
    if (typeof time !== 'string') return;
    entries.push({
      time,
      temperatureC: toNumber(valueAt(hourly.temperature_2m, index)),
      condition: getConditionText(toNumber(valueAt(hourly.weather_code, index))),
      precipitationMm: toNumber(valueAt(hourly.precipitation, index)),
      precipitationProbability: toNumber(valueAt(hourly.precipitation_probability, index)),
    });
  });

  return groupHourlyByDay(entries);
}
