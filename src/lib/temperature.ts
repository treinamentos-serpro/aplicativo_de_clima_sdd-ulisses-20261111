import type { Unit } from '../types/weather';

/** Converte °C para °F sem arredondar. */
export function convertCelsiusToFahrenheit(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

/** Temperatura para exibição na unidade escolhida, arredondada a inteiro. `null` permanece `null`. */
export function toDisplayTemperature(celsius: number | null, unit: Unit): number | null {
  if (celsius === null) return null;
  const value = unit === 'fahrenheit' ? convertCelsiusToFahrenheit(celsius) : celsius;
  return Math.round(value);
}
