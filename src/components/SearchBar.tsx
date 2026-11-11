import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = query.trim();
    if (!city || disabled) return;
    onSearch(city);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="flex w-full gap-2">
      <label htmlFor="city-search" className="sr-only">
        Buscar cidade
      </label>
      <input
        id="city-search"
        type="text"
        name="city"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar cidade"
        autoComplete="off"
        className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/60 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      />
      <button
        type="submit"
        disabled={disabled}
        className="min-h-11 rounded-xl bg-accent-600 px-4 font-medium text-white enabled:hover:bg-accent-700 enabled:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
}
