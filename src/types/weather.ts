/** Unidade de exibição das temperaturas. Padrão: 'celsius'. */
export type Unit = 'celsius' | 'fahrenheit';

/** Cidade retornada pelo geocoding. Homônimos se diferenciam por region e country. */
export interface City {
  id: number;
  name: string;
  region?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/** Clima atual. Campos ausentes da API ficam null e são exibidos como "não disponível". */
export interface CurrentWeather {
  observedAt: string;
  temperatureC: number | null;
  condition: string;
  relativeHumidity: number | null;
  windSpeedKmh: number | null;
  pressureHpa: number | null;
  precipitationMm: number | null;
}

/** Uma hora da previsão. */
export interface HourlyForecast {
  time: string;
  temperatureC: number | null;
  condition: string;
  precipitationMm: number | null;
  precipitationProbability: number | null;
}
export interface ForecastDay {
  date: string;
  hours: HourlyForecast[];
}

/** Categoria de falha da camada de services (ver `WeatherServiceError`). */
export type WeatherErrorKind = 'network' | 'timeout' | 'http' | 'invalid';

/** Erro de services já pronto para a UI (`message` em pt-BR). */
export interface WeatherError extends Error {
  kind: WeatherErrorKind;
  status?: number;
}

/**
 * Estado de uma requisição isolada. `empty` vale para listas sem itens
 * (busca sem cidades ou previsão sem dias válidos).
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherError }
  | { status: 'success'; data: T };
