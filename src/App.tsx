import { useCallback, useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { state, search, retry } = useWeather();
  const resultRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((text: string) => void search(text), [search]);
  const handleRetry = useCallback(() => void retry(), [retry]);

  // Após cada busca concluída, leva o foco ao resultado (ou à mensagem de erro/vazio).
  useEffect(() => {
    if (state.status === 'idle' || state.status === 'loading') return;
    resultRef.current?.focus();
  }, [state]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-800 to-night-900 font-sans text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-night-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:gap-4">
          <h1 className="text-xl font-semibold tracking-tight">
            <span aria-hidden="true">☀️</span> Clima
          </h1>
          <div className="order-2 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1">
            <SearchBar onSearch={handleSearch} disabled={state.status === 'loading'} />
          </div>
          <div className="order-1 ml-auto sm:order-3 sm:ml-0">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        aria-busy={state.status === 'loading'}
        className="mx-auto max-w-6xl px-4 py-6 sm:py-10"
      >
        <div ref={resultRef} tabIndex={-1} className="flex flex-col gap-6 focus:outline-none">
          {state.status === 'idle' && <EmptyState />}
          {state.status === 'loading' && <LoadingState message="Buscando clima…" />}
          {state.status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              hint="Verifique o nome digitado e tente outra busca."
              announce
            />
          )}
          {state.status === 'error' && (
            <ErrorState message={state.error.message} onRetry={handleRetry} />
          )}
          {state.status === 'success' && (
            <>
              <CurrentWeather city={state.data.city} current={state.data.current} unit={unit} />
              <ForecastList days={state.data.forecast} unit={unit} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
