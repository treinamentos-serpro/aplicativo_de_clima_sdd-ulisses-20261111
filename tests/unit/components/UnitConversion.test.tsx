import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import { mockWeatherData } from '../../../src/fixtures/weatherData';
import type { CurrentWeather as CurrentWeatherData, Unit } from '../../../src/types/weather';

const { city, current } = mockWeatherData;
const REGION_NAME = 'São Paulo, São Paulo, Brasil';

function ConvertibleWeather({ temperatureC }: { temperatureC: number }) {
  const [unit, setUnit] = useState<Unit>('celsius');
  const data: CurrentWeatherData = { ...current, temperatureC };
  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={city} current={data} unit={unit} />
    </>
  );
}

describe('conversão de unidade na UI (UnitToggle + CurrentWeather)', () => {
  it('0 °C vira 32 °F ao clicar em °F e volta a 0 °C ao clicar em °C', async () => {
    const user = userEvent.setup();
    render(<ConvertibleWeather temperatureC={0} />);
    const region = screen.getByRole('region', { name: REGION_NAME });

    expect(region).toHaveTextContent('0°C');

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(region).toHaveTextContent('32°F');

    await user.click(screen.getByRole('button', { name: '°C' }));
    expect(region).toHaveTextContent('0°C');
  });

  it('−40 °C continua −40 °F ao trocar a unidade', async () => {
    const user = userEvent.setup();
    render(<ConvertibleWeather temperatureC={-40} />);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByRole('region', { name: REGION_NAME })).toHaveTextContent('-40°F');
  });
});
