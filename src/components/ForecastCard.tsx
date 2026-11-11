import { summarizeForecastDay } from '../lib/forecastSummary';
import { getDayLabel, getShortDate } from '../lib/format';
import { toDisplayTemperature } from '../lib/temperature';
import { getConditionIcon } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const summary = summarizeForecastDay(day);
  const label = getDayLabel(day.date, index);
  const max = toDisplayTemperature(summary.maxC, unit);
  const min = toDisplayTemperature(summary.minC, unit);
  const unitSymbol = unit === 'celsius' ? 'C' : 'F';
  const icon = summary.condition ? getConditionIcon(summary.condition) : '🌡️';

  return (
    <article className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md">
      <header>
        <h3 className="text-base font-semibold text-white">{label}</h3>
        <p className="text-xs text-white/70">{getShortDate(day.date)}</p>
      </header>
      <span aria-hidden="true" className="text-4xl">
        {icon}
      </span>
      <p className="text-sm text-white/90">
        {max === null || min === null ? (
          <span>não disponível</span>
        ) : (
          <>
            <span className="font-semibold text-white">
              máx {max}°{unitSymbol}
            </span>{' '}
            <span className="text-white/70">
              mín {min}°{unitSymbol}
            </span>
          </>
        )}
      </p>
      <p className="text-sm font-medium text-white/90">
        Chuva:{' '}
        {summary.precipitationChance === null
          ? 'não disponível'
          : `${summary.precipitationChance}%`}
      </p>
      <p className="text-xs text-white/70">
        {summary.precipitationMm === null
          ? 'precipitação não disponível'
          : `${summary.precipitationMm} mm`}
      </p>
    </article>
  );
}
