import { useCallback, useRef, useState } from 'react';
import { searchCities, toWeatherError } from '../services/weatherService';
import type { AsyncState, City } from '../types/weather';

/**
 * Busca de cidades com lista de resultados (AC-01.2, AC-01.3).
 * Respostas de buscas anteriores são descartadas pelo contador de requisição.
 */
export function useCitySearch() {
  const [state, setState] = useState<AsyncState<City[]>>({ status: 'idle' });
  const requestId = useRef(0);

  const search = useCallback((query: string) => {
    const id = ++requestId.current;
    setState({ status: 'loading' });
    searchCities(query).then(
      (cities) => {
        if (id !== requestId.current) return;
        setState(cities.length === 0 ? { status: 'empty' } : { status: 'success', data: cities });
      },
      (error: unknown) => {
        if (id === requestId.current) {
          setState({ status: 'error', error: toWeatherError(error) });
        }
      },
    );
  }, []);

  const reset = useCallback(() => {
    requestId.current++;
    setState({ status: 'idle' });
  }, []);

  return { state, search, reset };
}
