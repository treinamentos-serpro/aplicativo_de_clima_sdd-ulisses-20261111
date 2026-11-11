import { useCallback, useRef, useState } from 'react';
import { WeatherServiceError, getWeather, searchCities } from '../services/weatherService';
import type { WeatherData } from '../types/weather';

export type WeatherViewState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherServiceError }
  | { status: 'success'; data: WeatherData };

/**
 * Orquestra busca → seleção → clima. `retry` refaz a última busca.
 * Respostas de buscas antigas são descartadas quando uma nova começa.
 */
export function useWeather() {
  const [state, setState] = useState<WeatherViewState>({ status: 'idle' });
  const lastQuery = useRef('');
  const requestId = useRef(0);

  const search = useCallback(async (name: string) => {
    const id = ++requestId.current;
    const query = name.trim();
    lastQuery.current = query;

    if (query === '') {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });
    try {
      const cities = await searchCities(query);
      if (id !== requestId.current) return;
      if (cities.length === 0) {
        setState({ status: 'empty' });
        return;
      }

      // Seleção provisória: usa o primeiro resultado até a lista de cidades (T-28).
      const data = await getWeather(cities[0]);
      if (id !== requestId.current) return;
      setState({ status: 'success', data });
    } catch (error) {
      if (id !== requestId.current) return;
      const serviceError =
        error instanceof WeatherServiceError ? error : new WeatherServiceError('invalid');
      setState({ status: 'error', error: serviceError });
    }
  }, []);

  const retry = useCallback(() => search(lastQuery.current), [search]);

  return { state, search, retry };
}
