import { describe, expect, it } from 'vitest';
import { convertCelsiusToFahrenheit, toDisplayTemperature } from '../../../src/lib/temperature';

describe('toDisplayTemperature', () => {
  it('mantém Celsius arredondado', () => {
    expect(toDisplayTemperature(23.6, 'celsius')).toBe(24);
  });

  it('converte para Fahrenheit', () => {
    expect(toDisplayTemperature(0, 'fahrenheit')).toBe(32);
    expect(toDisplayTemperature(100, 'fahrenheit')).toBe(212);
    expect(toDisplayTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('arredonda o valor convertido para inteiro', () => {
    expect(toDisplayTemperature(24, 'fahrenheit')).toBe(75);
    expect(toDisplayTemperature(-10, 'fahrenheit')).toBe(14);
  });

  it('preserva null', () => {
    expect(toDisplayTemperature(null, 'fahrenheit')).toBeNull();
  });
});

describe('convertCelsiusToFahrenheit', () => {
  it('converte sem arredondar', () => {
    expect(convertCelsiusToFahrenheit(10)).toBe(50);
  });
});
