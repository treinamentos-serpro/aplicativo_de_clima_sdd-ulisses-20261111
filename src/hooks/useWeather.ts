import { useCallback, useRef, useState } from 'react';
import { getCurrentWeather, getForecast, toWeatherError } from '../services/weatherService';
import type { AsyncState, City, CurrentWeather, ForecastDay } from '../types/weather';

/**
 * Clima da cidade selecionada, em dois estados independentes (D-P2, EC-08):
 * a falha de um bloco não afeta o outro.
 * Cada bloco tem seu próprio contador: respostas de seleções ou tentativas antigas são descartadas.
 */
export function useWeather() {
  const [city, setCity] = useState<City | null>(null);
  const [current, setCurrent] = useState<AsyncState<CurrentWeather>>({ status: 'idle' });
  const [forecast, setForecast] = useState<AsyncState<ForecastDay[]>>({ status: 'idle' });
  const cityRef = useRef<City | null>(null);
  const currentRequestId = useRef(0);
  const forecastRequestId = useRef(0);

  const loadCurrent = useCallback((target: City) => {
    const id = ++currentRequestId.current;
    setCurrent({ status: 'loading' });
    getCurrentWeather(target).then(
      (data) => {
        if (id === currentRequestId.current) setCurrent({ status: 'success', data });
      },
      (error: unknown) => {
        if (id === currentRequestId.current) {
          setCurrent({ status: 'error', error: toWeatherError(error) });
        }
      },
    );
  }, []);

  const loadForecast = useCallback((target: City) => {
    const id = ++forecastRequestId.current;
    setForecast({ status: 'loading' });
    getForecast(target).then(
      (days) => {
        if (id !== forecastRequestId.current) return;
        setForecast(days.length === 0 ? { status: 'empty' } : { status: 'success', data: days });
      },
      (error: unknown) => {
        if (id === forecastRequestId.current) {
          setForecast({ status: 'error', error: toWeatherError(error) });
        }
      },
    );
  }, []);

  /** Seleciona uma cidade e dispara clima atual e previsão como requisições independentes. */
  const select = useCallback(
    (target: City) => {
      cityRef.current = target;
      setCity(target);
      loadCurrent(target);
      loadForecast(target);
    },
    [loadCurrent, loadForecast],
  );

  /** Remove a cidade e descarta respostas pendentes (ex.: ao iniciar nova busca). */
  const clear = useCallback(() => {
    cityRef.current = null;
    currentRequestId.current++;
    forecastRequestId.current++;
    setCity(null);
    setCurrent({ status: 'idle' });
    setForecast({ status: 'idle' });
  }, []);

  const retryCurrent = useCallback(() => {
    if (cityRef.current) loadCurrent(cityRef.current);
  }, [loadCurrent]);

  const retryForecast = useCallback(() => {
    if (cityRef.current) loadForecast(cityRef.current);
  }, [loadForecast]);

  return { city, current, forecast, select, clear, retryCurrent, retryForecast };
}
