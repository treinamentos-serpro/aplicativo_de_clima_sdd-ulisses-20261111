import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import { mockWeatherData } from '../../../src/fixtures/weatherData';

const { city, current } = mockWeatherData;

describe('CurrentWeather', () => {
  it('exibe a temperatura em Celsius e converte ao trocar para Fahrenheit', () => {
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);
    const region = screen.getByRole('region', { name: 'São Paulo, São Paulo, Brasil' });
    expect(region).toHaveTextContent('24°C');

    rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);
    expect(region).toHaveTextContent('75°F');
    expect(region).not.toHaveTextContent('24°');
  });

  it('mantém o vento em km/h ao trocar a unidade', () => {
    const { rerender } = render(<CurrentWeather city={city} current={current} unit="celsius" />);
    expect(screen.getByText('12 km/h')).toBeInTheDocument();

    rerender(<CurrentWeather city={city} current={current} unit="fahrenheit" />);
    expect(screen.getByText('12 km/h')).toBeInTheDocument();
  });

  it('mostra "não disponível" para campos nulos', () => {
    render(
      <CurrentWeather
        city={city}
        current={{ ...current, relativeHumidity: null }}
        unit="celsius"
      />,
    );
    expect(screen.getByText('não disponível')).toBeInTheDocument();
  });
});
