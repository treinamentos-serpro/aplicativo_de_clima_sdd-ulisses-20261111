import { describe, expect, it } from 'vitest';
import { getConditionIcon, getConditionText } from '../../../src/lib/weatherCodes';

describe('getConditionText', () => {
  it('traduz códigos WMO conhecidos para pt-BR', () => {
    expect(getConditionText(0)).toBe('Céu limpo');
    expect(getConditionText(63)).toBe('Chuva moderada');
    expect(getConditionText(95)).toBe('Trovoada');
  });

  it('usa texto genérico para código desconhecido', () => {
    expect(getConditionText(4)).toBe('Condição indisponível');
    expect(getConditionText(1000)).toBe('Condição indisponível');
  });

  it('usa texto genérico quando o código está ausente', () => {
    expect(getConditionText(null)).toBe('Condição indisponível');
  });
});

describe('getConditionIcon', () => {
  it('devolve o ícone da condição traduzida', () => {
    expect(getConditionIcon('Céu limpo')).toBe('☀️');
  });

  it('devolve o ícone genérico para texto desconhecido', () => {
    expect(getConditionIcon('Condição indisponível')).toBe('🌡️');
    expect(getConditionIcon('texto qualquer')).toBe('🌡️');
  });
});
