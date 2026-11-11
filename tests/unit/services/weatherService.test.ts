import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  REQUEST_TIMEOUT_MS,
  WeatherServiceError,
  getCurrentWeather,
  getForecast,
  searchCities,
} from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

const fetchMock = vi.fn();

const city: City = {
  id: 5809844,
  name: 'Seattle',
  country: 'United States',
  latitude: 47.60621,
  longitude: -122.33207,
  timezone: 'America/Los_Angeles',
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 });
}

function requestUrl(callIndex = 0): URL {
  return new URL(fetchMock.mock.calls[callIndex][0] as string);
}

function hourlyBody(totalHours: number) {
  const time: string[] = [];
  const temperature: number[] = [];
  const code: number[] = [];
  const precipitation: number[] = [];
  const probability: number[] = [];
  for (let i = 0; i < totalHours; i++) {
    const day = 11 + Math.floor(i / 24);
    const hour = i % 24;
    time.push(`2026-11-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00`);
    temperature.push(20 + (i % 10));
    code.push(i % 2 === 0 ? 0 : 61);
    precipitation.push(0);
    probability.push(i % 100);
  }
  return {
    hourly: {
      time,
      temperature_2m: temperature,
      weather_code: code,
      precipitation,
      precipitation_probability: probability,
    },
  };
}

const currentBody = {
  current: {
    time: '2026-11-11T14:00',
    temperature_2m: 14.2,
    relative_humidity_2m: 74,
    weather_code: 3,
    wind_speed_10m: 6.8,
    pressure_msl: 1015.6,
    precipitation: 0,
  },
};

describe('weatherService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('searchCities', () => {
    it('retorna [] para texto vazio ou só com espaços, sem chamar a rede', async () => {
      await expect(searchCities('')).resolves.toEqual([]);
      await expect(searchCities('   ')).resolves.toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('monta a URL com nome sem espaços extras, idioma pt e limite de 5', async () => {
      fetchMock.mockResolvedValue(jsonResponse({}));

      await searchCities('  São Paulo  ');

      const url = requestUrl();
      expect(url.origin + url.pathname).toBe('https://geocoding-api.open-meteo.com/v1/search');
      expect(url.searchParams.get('name')).toBe('São Paulo');
      expect(url.searchParams.get('count')).toBe('5');
      expect(url.searchParams.get('language')).toBe('pt');
      expect(url.searchParams.get('format')).toBe('json');
    });

    it('mapeia results para City', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          results: [
            {
              id: 5809844,
              name: 'Seattle',
              latitude: 47.60621,
              longitude: -122.33207,
              country: 'United States',
              country_code: 'US',
              admin1: 'Washington',
              timezone: 'America/Los_Angeles',
            },
          ],
        }),
      );

      await expect(searchCities('Seattle')).resolves.toEqual([
        {
          id: 5809844,
          name: 'Seattle',
          region: 'Washington',
          country: 'United States',
          countryCode: 'US',
          latitude: 47.60621,
          longitude: -122.33207,
          timezone: 'America/Los_Angeles',
        },
      ]);
    });

    it('aceita acentos e emoji sem quebrar e codifica a query na URL', async () => {
      fetchMock.mockResolvedValue(jsonResponse({}));

      await expect(searchCities('Ñandú 😀')).resolves.toEqual([]);

      expect(requestUrl().searchParams.get('name')).toBe('Ñandú 😀');
    });

    it('resposta {} (cidade inexistente) vira lista vazia, não erro', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ generationtime_ms: 0.1 }));

      await expect(searchCities('xyz')).resolves.toEqual([]);
    });

    it('descarta entradas sem os campos mínimos e mantém homônimos', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          results: [
            { id: 1, name: 'Santos', latitude: -23.9, longitude: -46.3, country: 'Brasil', admin1: 'São Paulo' },
            { id: 2, name: 'Santos', latitude: 40.0, longitude: -4.0, country: 'Espanha', admin1: 'Madrid' },
            { id: 3, name: 'Sem coordenadas', country: 'Brasil' },
          ],
        }),
      );

      const cities = await searchCities('Santos');

      expect(cities.map((c) => [c.region, c.country])).toEqual([
        ['São Paulo', 'Brasil'],
        ['Madrid', 'Espanha'],
      ]);
    });

    it('erro HTTP vira WeatherServiceError com status', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 503 }));

      const error = await searchCities('Recife').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(WeatherServiceError);
      expect(error).toMatchObject({ kind: 'http', status: 503 });
    });

    it('mensagem de erro HTTP não expõe o código ao usuário', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 503 }));

      const error = await searchCities('Recife').catch((e: unknown) => e);

      expect((error as Error).message).not.toMatch(/503/);
    });

    it('falha de rede vira WeatherServiceError do tipo network', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'network' });
    });

    it('JSON inválido vira WeatherServiceError do tipo invalid', async () => {
      fetchMock.mockResolvedValue(new Response('<html>', { status: 200 }));

      await expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'invalid' });
    });

    it('timeout aborta a requisição e vira WeatherServiceError do tipo timeout', async () => {
      vi.useFakeTimers();
      fetchMock.mockImplementation(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () =>
              reject(new DOMException('The operation was aborted.', 'AbortError')),
            );
          }),
      );

      const assertion = expect(searchCities('Recife')).rejects.toMatchObject({ kind: 'timeout' });
      await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

      await assertion;
    });
  });

  describe('getCurrentWeather', () => {
    it('monta uma requisição só com current, em km/h e fuso automático', async () => {
      fetchMock.mockResolvedValue(jsonResponse(currentBody));

      await getCurrentWeather(city);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = requestUrl();
      expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
      expect(url.searchParams.get('latitude')).toBe('47.60621');
      expect(url.searchParams.get('longitude')).toBe('-122.33207');
      expect(url.searchParams.get('timezone')).toBe('auto');
      expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
      expect(url.searchParams.get('current')).toContain('pressure_msl');
      expect(url.searchParams.has('hourly')).toBe(false);
    });

    it('mapeia o bloco current para CurrentWeather', async () => {
      fetchMock.mockResolvedValue(jsonResponse(currentBody));

      await expect(getCurrentWeather(city)).resolves.toEqual({
        observedAt: '2026-11-11T14:00',
        temperatureC: 14.2,
        condition: 'Nublado',
        relativeHumidity: 74,
        windSpeedKmh: 6.8,
        pressureHpa: 1015.6,
        precipitationMm: 0,
      });
    });

    it('campos ausentes viram null', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({ current: { time: '2026-11-11T14:00', temperature_2m: 20 } }),
      );

      await expect(getCurrentWeather(city)).resolves.toMatchObject({
        temperatureC: 20,
        relativeHumidity: null,
        windSpeedKmh: null,
        pressureHpa: null,
        precipitationMm: null,
        condition: 'Condição indisponível',
      });
    });

    it('resposta sem current válido lança invalid', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ current: { time: '2026-11-11T14:00' } }));

      await expect(getCurrentWeather(city)).rejects.toMatchObject({ kind: 'invalid' });
    });

    it('erro HTTP lança WeatherServiceError com status', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 429 }));

      await expect(getCurrentWeather(city)).rejects.toMatchObject({ kind: 'http', status: 429 });
    });
  });

  describe('getForecast', () => {
    it('monta uma requisição só com hourly, 5 dias e fuso automático', async () => {
      fetchMock.mockResolvedValue(jsonResponse(hourlyBody(120)));

      await getForecast(city);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const url = requestUrl();
      expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
      expect(url.searchParams.get('timezone')).toBe('auto');
      expect(url.searchParams.get('forecast_days')).toBe('5');
      expect(url.searchParams.get('hourly')).toContain('precipitation_probability');
      expect(url.searchParams.has('current')).toBe(false);
    });

    it('retorna dias de 24 horas com o formato de cada hora', async () => {
      fetchMock.mockResolvedValue(jsonResponse(hourlyBody(120)));

      const days = await getForecast(city);

      expect(days).toHaveLength(5);
      expect(days.every((day) => day.hours.length === 24)).toBe(true);
      expect(days[0].hours[0]).toEqual({
        time: '2026-11-11T00:00',
        temperatureC: 20,
        condition: 'Céu limpo',
        precipitationMm: 0,
        precipitationProbability: 0,
      });
    });

    it('oculta o dia incompleto (menos de 24 horas) e mantém os dias completos (AC-02.1)', async () => {
      const body = hourlyBody(120);
      body.hourly.time[0] = null as unknown as string;
      fetchMock.mockResolvedValue(jsonResponse(body));

      const days = await getForecast(city);

      expect(days).toHaveLength(4);
      expect(days.every((day) => day.hours.length === 24)).toBe(true);
      expect(days[0].date).toBe('2026-11-12');
    });

    it('sem horas válidas retorna [] (estado vazio, AC-RF06.3)', async () => {
      const body = hourlyBody(24);
      body.hourly.time = body.hourly.time.map(() => 'data-inválida');
      fetchMock.mockResolvedValue(jsonResponse(body));

      await expect(getForecast(city)).resolves.toEqual([]);
    });

    it('resposta sem o bloco hourly lança invalid', async () => {
      fetchMock.mockResolvedValue(jsonResponse(currentBody));

      await expect(getForecast(city)).rejects.toMatchObject({ kind: 'invalid' });
    });

    it('erro HTTP lança WeatherServiceError com status', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 429 }));

      await expect(getForecast(city)).rejects.toMatchObject({ kind: 'http', status: 429 });
    });
  });
});
