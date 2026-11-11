import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCitySearch } from '../../../src/hooks/useCitySearch';
import { WeatherServiceError, searchCities } from '../../../src/services/weatherService';
import type { City } from '../../../src/types/weather';

vi.mock('../../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../src/services/weatherService')>()),
  searchCities: vi.fn(),
}));

const searchCitiesMock = vi.mocked(searchCities);

const seattle: City = {
  id: 1,
  name: 'Seattle',
  country: 'United States',
  latitude: 47.6,
  longitude: -122.3,
  timezone: 'America/Los_Angeles',
};

describe('useCitySearch', () => {
  beforeEach(() => {
    searchCitiesMock.mockReset();
  });

  it('começa em idle', () => {
    const { result } = renderHook(() => useCitySearch());

    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('lista de cidades resulta em success', async () => {
    searchCitiesMock.mockResolvedValue([seattle]);
    const { result } = renderHook(() => useCitySearch());

    await act(async () => {
      result.current.search('Seattle');
    });

    expect(result.current.state).toEqual({ status: 'success', data: [seattle] });
  });

  it('lista vazia resulta em empty', async () => {
    searchCitiesMock.mockResolvedValue([]);
    const { result } = renderHook(() => useCitySearch());

    await act(async () => {
      result.current.search('xyz');
    });

    expect(result.current.state).toEqual({ status: 'empty' });
  });

  it('erro do service resulta em error com a falha', async () => {
    const error = new WeatherServiceError('network');
    searchCitiesMock.mockRejectedValue(error);
    const { result } = renderHook(() => useCitySearch());

    await act(async () => {
      result.current.search('Recife');
    });

    expect(result.current.state).toEqual({ status: 'error', error });
  });

  it('reset volta para idle e descarta a resposta pendente', async () => {
    let resolve!: (value: City[]) => void;
    searchCitiesMock.mockReturnValue(new Promise<City[]>((res) => (resolve = res)));
    const { result } = renderHook(() => useCitySearch());

    act(() => {
      result.current.search('Seattle');
    });
    act(() => {
      result.current.reset();
    });
    await act(async () => {
      resolve([seattle]);
    });

    expect(result.current.state).toEqual({ status: 'idle' });
  });
});
