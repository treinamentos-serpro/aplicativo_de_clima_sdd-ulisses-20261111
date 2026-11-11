import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../../src/lib/format';

describe('getDayLabel', () => {
  it('rotula o primeiro dia como Hoje e o segundo como Amanhã', () => {
    expect(getDayLabel('2026-11-11', 0)).toBe('Hoje');
    expect(getDayLabel('2026-11-12', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana abreviado para os demais dias', () => {
    expect(getDayLabel('2026-11-13', 2)).toBe('Sex');
  });
});

describe('getShortDate', () => {
  it('formata como "dia Mês" sem deslocar a data pelo fuso', () => {
    expect(getShortDate('2026-11-11')).toBe('11 Nov');
    expect(getShortDate('2026-01-01')).toBe('1 Jan');
  });
});
