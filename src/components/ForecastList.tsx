import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  days: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ days, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title" className="flex flex-col gap-3">
      <h2 id="forecast-title" className="text-lg font-medium text-white/90">
        Próximos dias
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {days.map((day, index) => (
          <li key={day.date}>
            <ForecastCard day={day} index={index} unit={unit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
