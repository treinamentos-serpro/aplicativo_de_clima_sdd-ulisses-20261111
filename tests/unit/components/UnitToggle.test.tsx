import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('marca a unidade ativa com aria-pressed', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('chama onChange com a unidade escolhida pelo teclado', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });
});
