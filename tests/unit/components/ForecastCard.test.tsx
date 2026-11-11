import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../../src/components/ForecastCard';
import type { ForecastDay } from '../../../src/types/weather';

const day: ForecastDay = {
  date: '2026-11-13',
  hours: [
    {
      time: '2026-11-13T00:00',
      temperatureC: 10,
      condition: 'Chuva fraca',
      precipitationMm: 0.5,
      precipitationProbability: 40,
    },
    {
      time: '2026-11-13T12:00',
      temperatureC: 20,
      condition: 'Nublado',
      precipitationMm: 1.5,
      precipitationProbability: 80,
    },
  ],
};

describe('ForecastCard', () => {
  it('mostra máx e mín em Celsius por padrão', () => {
    render(<ForecastCard day={day} index={2} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'Sex' })).toBeInTheDocument();
    expect(screen.getByText('máx 20°C')).toBeInTheDocument();
    expect(screen.getByText('mín 10°C')).toBeInTheDocument();
  });

  it('converte máx e mín para Fahrenheit na unidade ativa', () => {
    render(<ForecastCard day={day} index={2} unit="fahrenheit" />);

    expect(screen.getByText('máx 68°F')).toBeInTheDocument();
    expect(screen.getByText('mín 50°F')).toBeInTheDocument();
  });

  it('mostra a maior probabilidade de chuva e a soma de precipitação', () => {
    render(<ForecastCard day={day} index={2} unit="celsius" />);

    expect(screen.getByText('Chuva: 80%')).toBeInTheDocument();
    expect(screen.getByText('2 mm')).toBeInTheDocument();
  });

  it('mostra "não disponível" quando o dia não tem temperaturas', () => {
    render(
      <ForecastCard
        day={{ date: '2026-11-13', hours: [{ ...day.hours[0], temperatureC: null }] }}
        index={2}
        unit="celsius"
      />,
    );

    expect(screen.getByText('não disponível', { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByText(/máx/)).not.toBeInTheDocument();
  });
});
