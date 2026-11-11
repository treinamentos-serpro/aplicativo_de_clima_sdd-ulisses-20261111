import type { KeyboardEvent } from 'react';
import type { City } from '../types/weather';

interface CityResultListProps {
  cities: City[];
  onSelect: (city: City) => void;
}

/** Cidade com nome, região e país, para diferenciar homônimos (AC-01.3). */
function describeCity(city: City): string {
  return [city.name, city.region, city.country].filter(Boolean).join(', ');
}

export default function CityResultList({ cities, onSelect }: CityResultListProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;

    event.preventDefault();
    const step = event.key === 'ArrowDown' ? 1 : -1;
    const next = (current + step + buttons.length) % buttons.length;
    buttons[next]?.focus();
  }

  return (
    <section aria-labelledby="city-results-title" className="flex flex-col gap-3">
      <h2 id="city-results-title" className="text-lg font-medium text-white/90">
        Escolha a cidade
      </h2>
      <ul onKeyDown={handleKeyDown} className="flex flex-col gap-2">
        {cities.map((city) => (
          <li key={city.id}>
            <button
              type="button"
              onClick={() => onSelect(city)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white backdrop-blur-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              {describeCity(city)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
