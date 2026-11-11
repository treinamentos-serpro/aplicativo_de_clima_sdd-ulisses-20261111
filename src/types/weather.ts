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

/** Dados completos de uma cidade, montados pela camada de services. */
export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
  fetchedAt: string;
}

/** Categoria de falha da camada de services (ver `WeatherServiceError`). */
export type WeatherErrorKind = 'network' | 'timeout' | 'http' | 'invalid';
