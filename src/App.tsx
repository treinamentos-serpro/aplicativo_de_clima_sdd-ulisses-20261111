import { useCallback, useEffect, useRef, useState } from 'react';
import CityResultList from './components/CityResultList';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useCitySearch } from './hooks/useCitySearch';
import { useWeather } from './hooks/useWeather';
import type { City, Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const search = useCitySearch();
  const weather = useWeather();
  const lastQuery = useRef('');
  const resultRef = useRef<HTMLDivElement>(null);

  const { search: runSearch, reset: resetSearch } = search;
  const { select, clear, retryCurrent, retryForecast } = weather;
  const searchStatus = search.state.status;
  const currentStatus = weather.current.status;

  const handleSearch = useCallback(
    (text: string) => {
      lastQuery.current = text;
      clear();
      runSearch(text);
    },
    [clear, runSearch],
  );
  const handleRetrySearch = useCallback(() => runSearch(lastQuery.current), [runSearch]);
  const handleSelect = useCallback(
    (city: City) => {
      resetSearch();
      select(city);
    },
    [resetSearch, select],
  );

  // Após cada busca concluída, leva o foco ao resultado (lista, vazio ou erro).
  useEffect(() => {
    if (searchStatus === 'success' || searchStatus === 'empty' || searchStatus === 'error') {
      resultRef.current?.focus();
    }
  }, [searchStatus]);

  // Após o clima atual carregar, leva o foco ao resultado. A previsão não move o foco.
  useEffect(() => {
    if (currentStatus === 'success' || currentStatus === 'error') {
      resultRef.current?.focus();
    }
  }, [currentStatus]);

  const isBusy = searchStatus === 'loading' || currentStatus === 'loading';

  return (
    <div className="min-h-screen bg-gradient-to-b from-night-800 to-night-900 font-sans text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-night-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:gap-4">
          <h1 className="text-xl font-semibold tracking-tight">
            <span aria-hidden="true">☀️</span> Clima
          </h1>
          <div className="order-2 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1">
            <SearchBar onSearch={handleSearch} disabled={searchStatus === 'loading'} />
          </div>
          <div className="order-1 ml-auto sm:order-3 sm:ml-0">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main aria-busy={isBusy} className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div ref={resultRef} tabIndex={-1} className="flex flex-col gap-6 focus:outline-none">
          {weather.city === null && searchStatus === 'idle' && <EmptyState />}
          {searchStatus === 'loading' && <LoadingState message="Buscando cidades…" />}
          {searchStatus === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              hint="Verifique o nome digitado e tente outra busca."
              announce
            />
          )}
          {searchStatus === 'error' && (
            <ErrorState message={search.state.error.message} onRetry={handleRetrySearch} />
          )}
          {searchStatus === 'success' && (
            <CityResultList cities={search.state.data} onSelect={handleSelect} />
          )}

          {weather.city !== null && (
            <>
              {weather.current.status === 'loading' && <LoadingState message="Buscando clima…" />}
              {weather.current.status === 'error' && (
                <ErrorState message={weather.current.error.message} onRetry={retryCurrent} />
              )}
              {weather.current.status === 'success' && (
                <CurrentWeather
                  city={weather.city}
                  current={weather.current.data}
                  unit={unit}
                />
              )}

              {weather.forecast.status === 'loading' && (
                <LoadingState message="Carregando previsão…" />
              )}
              {weather.forecast.status === 'error' && (
                <ErrorState message={weather.forecast.error.message} onRetry={retryForecast} />
              )}
              {weather.forecast.status === 'empty' && (
                <EmptyState
                  title="Previsão indisponível"
                  hint="A previsão para esta cidade não está disponível no momento."
                  announce
                />
              )}
              {weather.forecast.status === 'success' && (
                <ForecastList days={weather.forecast.data} unit={unit} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
