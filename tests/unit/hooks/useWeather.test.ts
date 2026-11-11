import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import { WeatherServiceError, getWeather, searchCities } from '../../../src/services/weatherService';
import type { City, WeatherData } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

const seattle: City = {
  id: 1,
  name: 'Seattle',
  country: 'United States',
  latitude: 47.6,
  longitude: -122.3,
  timezone: 'America/Los_Angeles',
};

const weatherData = { city: seattle, forecast: [], fetchedAt: '' } as unknown as WeatherData;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe('useWeather', () => {
  beforeEach(() => {
    searchCitiesMock.mockReset();
    getWeatherMock.mockReset();
  });

  it('começa em idle', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('texto vazio volta para idle sem chamar o service', async () => {
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('   '));

    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(getWeatherMock).not.toHaveBeenCalled();
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('busca → seleção → clima resulta em success com a primeira cidade', async () => {
    searchCitiesMock.mockResolvedValue([seattle]);
    getWeatherMock.mockResolvedValue(weatherData);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Seattle'));

    expect(searchCitiesMock).toHaveBeenCalledWith('Seattle');
    expect(getWeatherMock).toHaveBeenCalledWith(seattle);
    expect(result.current.state).toEqual({ status: 'success', data: weatherData });
  });

  it('lista vazia resulta em empty e não busca clima', async () => {
    searchCitiesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('xyz'));

    expect(getWeatherMock).not.toHaveBeenCalled();
    expect(result.current.state).toEqual({ status: 'empty' });
  });

  it('erro do service resulta em error com o WeatherServiceError', async () => {
    const error = new WeatherServiceError('timeout');
    searchCitiesMock.mockRejectedValue(error);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Recife'));

    expect(result.current.state).toEqual({ status: 'error', error });
  });

  it('erro inesperado (fora do WeatherServiceError) vira error do tipo invalid', async () => {
    searchCitiesMock.mockRejectedValue(new TypeError('falha inesperada'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Recife'));

    expect(result.current.state).toMatchObject({ status: 'error', error: { kind: 'invalid' } });
  });

  it('erro ao buscar o clima também resulta em error', async () => {
    searchCitiesMock.mockResolvedValue([seattle]);
    getWeatherMock.mockRejectedValue(new WeatherServiceError('network'));
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('Seattle'));

    expect(result.current.state).toMatchObject({ status: 'error', error: { kind: 'network' } });
  });

  it('retry refaz a última busca', async () => {
    searchCitiesMock
      .mockRejectedValueOnce(new WeatherServiceError('network'))
      .mockResolvedValueOnce([seattle]);
    getWeatherMock.mockResolvedValue(weatherData);
    const { result } = renderHook(() => useWeather());

    await act(() => result.current.search('  Seattle '));
    expect(result.current.state.status).toBe('error');

    await act(() => result.current.retry());

    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(searchCitiesMock).toHaveBeenLastCalledWith('Seattle');
    expect(result.current.state).toEqual({ status: 'success', data: weatherData });
  });

  it('resposta de uma busca antiga não sobrescreve a nova', async () => {
    const first = deferred<City[]>();
    const second = deferred<City[]>();
    searchCitiesMock.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    getWeatherMock.mockResolvedValue(weatherData);
    const { result } = renderHook(() => useWeather());

    let firstSearch!: Promise<void>;
    let secondSearch!: Promise<void>;
    act(() => {
      firstSearch = result.current.search('Santos');
      secondSearch = result.current.search('Seattle');
    });

    await act(async () => {
      second.resolve([seattle]);
      await secondSearch;
    });
    await act(async () => {
      first.resolve([]);
      await firstSearch;
    });

    expect(result.current.state).toEqual({ status: 'success', data: weatherData });
  });
});
