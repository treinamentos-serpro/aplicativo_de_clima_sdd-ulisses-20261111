import { toDisplayTemperature } from '../lib/temperature';
import { getConditionIcon } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const NOT_AVAILABLE = 'não disponível';

function formatMetric(value: number | null, suffix: string): string {
  return value === null ? NOT_AVAILABLE : `${value}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const temperature = toDisplayTemperature(current.temperatureC, unit);
  const unitSymbol = unit === 'celsius' ? 'C' : 'F';
  const location = [city.name, city.region, city.country].filter(Boolean).join(', ');

  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidity, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, ' km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, ' mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, ' hPa') },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <h2 id="current-weather-title" className="text-lg font-medium text-white/90">
        {location}
      </h2>

      <div className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="text-6xl sm:text-8xl">
            {getConditionIcon(current.condition)}
          </span>
          <div>
            <p className="text-6xl font-semibold leading-none tracking-tight text-white sm:text-8xl">
              {temperature === null ? (
                <span className="text-4xl">{NOT_AVAILABLE}</span>
              ) : (
                <>
                  {temperature}
                  <span aria-hidden="true" className="text-4xl text-white/80">
                    °{unitSymbol}
                  </span>
                  <span className="sr-only">
                    {' '}
                    graus {unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}
                  </span>
                </>
              )}
            </p>
            <p className="mt-2 text-lg text-sun">{current.condition}</p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
          >
            <dt className="text-sm text-white/70">{metric.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-white sm:text-xl">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
