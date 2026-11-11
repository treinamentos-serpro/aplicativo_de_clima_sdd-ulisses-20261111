import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CityResultList from '../../../src/components/CityResultList';
import type { City } from '../../../src/types/weather';

const cities: City[] = [
  {
    id: 1,
    name: 'Santos',
    region: 'São Paulo',
    country: 'Brasil',
    latitude: -23.9,
    longitude: -46.3,
    timezone: 'America/Sao_Paulo',
  },
  {
    id: 2,
    name: 'Santos',
    region: 'Madrid',
    country: 'Espanha',
    latitude: 40,
    longitude: -4,
    timezone: 'Europe/Madrid',
  },
];

describe('CityResultList', () => {
  it('mostra região e país para diferenciar homônimos (AC-01.3)', () => {
    render(<CityResultList cities={cities} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Santos, São Paulo, Brasil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Santos, Madrid, Espanha' })).toBeInTheDocument();
  });

  it('seleciona a cidade ao clicar', async () => {
    const onSelect = vi.fn();
    render(<CityResultList cities={cities} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('button', { name: 'Santos, Madrid, Espanha' }));

    expect(onSelect).toHaveBeenCalledWith(cities[1]);
  });

  it('navega com setas e seleciona com Enter', async () => {
    const onSelect = vi.fn();
    render(<CityResultList cities={cities} onSelect={onSelect} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: 'Santos, São Paulo, Brasil' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Santos, Madrid, Espanha' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Santos, São Paulo, Brasil' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(cities[1]);
  });
});
