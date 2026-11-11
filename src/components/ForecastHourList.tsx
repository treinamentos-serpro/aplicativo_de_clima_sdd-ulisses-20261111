import { getHourLabel } from '../lib/format';
import { toDisplayTemperature } from '../lib/temperature';
import { getConditionIcon } from '../lib/weatherCodes';
import type { HourlyForecast, Unit } from '../types/weather';

interface ForecastHourListProps {
  hours: HourlyForecast[];
  unit: Unit;
}

const NOT_AVAILABLE = 'não disponível';

export default function ForecastHourList({ hours, unit }: ForecastHourListProps) {
  const unitSymbol = unit === 'celsius' ? 'C' : 'F';

  return (
    <ul aria-label="Previsão por hora" className="flex w-full flex-col gap-1 text-left text-sm">
      {hours.map((hour) => {
        const temperature = toDisplayTemperature(hour.temperatureC, unit);
        return (
          <li key={hour.time} className="flex items-center justify-between gap-2">
            <span className="w-12 text-white/80">{getHourLabel(hour.time)}</span>
            <span aria-hidden="true">{getConditionIcon(hour.condition)}</span>
            <span className="sr-only">{hour.condition}</span>
            <span className="font-medium text-white">
              {temperature === null ? NOT_AVAILABLE : `${temperature}°${unitSymbol}`}
            </span>
            <span className="w-16 text-right text-white/70">
              {hour.precipitationMm === null ? '—' : `${hour.precipitationMm} mm`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
