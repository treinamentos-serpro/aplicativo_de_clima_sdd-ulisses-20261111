import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../../src/hooks/useWeather';
import {
  WeatherServiceError,
  getCurrentWeather,
  getForecast,
} from '../../../src/services/weatherService';
import type { City, CurrentWeather, ForecastDay } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/services/weatherService')>()),
  getCurrentWeather: vi.fn(),
  getForecast: vi.fn(),
}));

const getCurrentWeatherMock = vi.mocked(getCurrentWeather);
const getForecastMock = vi.mocked(getForecast);

const seattle: City = {
  id: 1,
  name: 'Seattle',
  country: 'United States',
  latitude: 47.6,
  longitude: -122.3,
  timezone: 'America/Los_Angeles',
};

const current = { observedAt: '2026-11-11T14:00', temperatureC: 14 } as unknown as CurrentWeather;
const forecast = [{ date: '2026-11-11', hours: [] }] as unknown as ForecastDay[];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useWeather', () => {
  beforeEach(() => {
    getCurrentWeatherMock.mockReset();
    getForecastMock.mockReset();
  });

  it('começa sem cidade e com estados idle', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.city).toBeNull();
    expect(result.current.current).toEqual({ status: 'idle' });
    expect(result.current.forecast).toEqual({ status: 'idle' });
  });

  it('select dispara clima atual e previsão como requisições independentes', async () => {
    getCurrentWeatherMock.mockResolvedValue(current);
    getForecastMock.mockResolvedValue(forecast);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });

    expect(result.current.city).toEqual(seattle);
    expect(getCurrentWeatherMock).toHaveBeenCalledWith(seattle);
    expect(getForecastMock).toHaveBeenCalledWith(seattle);
    expect(result.current.current).toEqual({ status: 'success', data: current });
    expect(result.current.forecast).toEqual({ status: 'success', data: forecast });
  });

  it('falha da previsão não altera o clima atual', async () => {
    getCurrentWeatherMock.mockResolvedValue(current);
    getForecastMock.mockRejectedValue(new WeatherServiceError('timeout'));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });

    expect(result.current.current).toEqual({ status: 'success', data: current });
    expect(result.current.forecast).toMatchObject({ status: 'error', error: { kind: 'timeout' } });
  });

  it('falha do clima atual não altera a previsão', async () => {
    getCurrentWeatherMock.mockRejectedValue(new WeatherServiceError('network'));
    getForecastMock.mockResolvedValue(forecast);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });

    expect(result.current.current).toMatchObject({ status: 'error', error: { kind: 'network' } });
    expect(result.current.forecast).toEqual({ status: 'success', data: forecast });
  });

  it('previsão sem dias vira empty', async () => {
    getCurrentWeatherMock.mockResolvedValue(current);
    getForecastMock.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });

    expect(result.current.forecast).toEqual({ status: 'empty' });
  });

  it('erro inesperado vira error do tipo invalid', async () => {
    getCurrentWeatherMock.mockRejectedValue(new TypeError('falha inesperada'));
    getForecastMock.mockResolvedValue(forecast);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });

    expect(result.current.current).toMatchObject({ status: 'error', error: { kind: 'invalid' } });
  });

  it('retryCurrent refaz só o clima atual', async () => {
    getCurrentWeatherMock
      .mockRejectedValueOnce(new WeatherServiceError('network'))
      .mockResolvedValueOnce(current);
    getForecastMock.mockResolvedValue(forecast);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });
    await act(async () => {
      result.current.retryCurrent();
    });

    expect(getCurrentWeatherMock).toHaveBeenCalledTimes(2);
    expect(getForecastMock).toHaveBeenCalledTimes(1);
    expect(result.current.current).toEqual({ status: 'success', data: current });
  });

  it('retryForecast refaz só a previsão', async () => {
    getCurrentWeatherMock.mockResolvedValue(current);
    getForecastMock
      .mockRejectedValueOnce(new WeatherServiceError('http', 500))
      .mockResolvedValueOnce(forecast);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      result.current.select(seattle);
    });
    await act(async () => {
      result.current.retryForecast();
    });

    expect(getCurrentWeatherMock).toHaveBeenCalledTimes(1);
    expect(getForecastMock).toHaveBeenCalledTimes(2);
    expect(result.current.forecast).toEqual({ status: 'success', data: forecast });
  });

  it('resposta antiga é descartada quando outra cidade é selecionada', async () => {
    const first = deferred<CurrentWeather>();
    const other: City = { ...seattle, id: 2, name: 'Recife' };
    getCurrentWeatherMock.mockReturnValueOnce(first.promise).mockResolvedValueOnce(current);
    getForecastMock.mockResolvedValue(forecast);
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.select(seattle);
    });
    await act(async () => {
      result.current.select(other);
    });
    await act(async () => {
      first.resolve({ ...current, temperatureC: 99 });
    });

    expect(result.current.city).toEqual(other);
    expect(result.current.current).toEqual({ status: 'success', data: current });
  });

  it('clear remove a cidade e descarta respostas pendentes', async () => {
    const pending = deferred<CurrentWeather>();
    getCurrentWeatherMock.mockReturnValue(pending.promise);
    getForecastMock.mockResolvedValue(forecast);
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.select(seattle);
    });
    act(() => {
      result.current.clear();
    });
    await act(async () => {
      pending.resolve(current);
    });

    expect(result.current.city).toBeNull();
    expect(result.current.current).toEqual({ status: 'idle' });
    expect(result.current.forecast).toEqual({ status: 'idle' });
  });
});
