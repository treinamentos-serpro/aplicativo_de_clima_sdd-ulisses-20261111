import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/fixtures/weatherData';
import {
  WeatherServiceError,
  getCurrentWeather,
  getForecast,
  searchCities,
} from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getCurrentWeather: vi.fn(),
  getForecast: vi.fn(),
}));

const searchCitiesMock = vi.mocked(searchCities);
const getCurrentWeatherMock = vi.mocked(getCurrentWeather);
const getForecastMock = vi.mocked(getForecast);
const CITY_HEADING = 'São Paulo, São Paulo, Brasil';
const CITY_OPTION = 'São Paulo, São Paulo, Brasil';

async function searchFor(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: 'Buscar cidade' }), text);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  return user;
}

async function searchAndSelect(text: string) {
  const user = await searchFor(text);
  await user.click(await screen.findByRole('button', { name: CITY_OPTION }));
  return user;
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchCitiesMock.mockResolvedValue([mockWeatherData.city]);
    getCurrentWeatherMock.mockResolvedValue(mockWeatherData.current);
    getForecastMock.mockResolvedValue(mockWeatherData.forecast);
  });

  it('mostra a instrução inicial sem chamar a rede', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeInTheDocument();
    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(getCurrentWeatherMock).not.toHaveBeenCalled();
    expect(getForecastMock).not.toHaveBeenCalled();
  });

  it('busca vazia não chama a rede nem mostra erro', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeInTheDocument();
  });

  it('busca mostra lista de cidades sem carregar clima até a seleção (AC-01.2, AC-01.5)', async () => {
    render(<App />);

    await searchFor('São Paulo');

    expect(await screen.findByRole('heading', { name: 'Escolha a cidade' })).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledWith('São Paulo');
    expect(getCurrentWeatherMock).not.toHaveBeenCalled();
    expect(getForecastMock).not.toHaveBeenCalled();
  });

  it('selecionar a cidade mostra clima atual e 5 dias de previsão', async () => {
    render(<App />);

    await searchAndSelect('São Paulo');

    const current = await screen.findByRole('region', { name: CITY_HEADING });
    expect(current).toHaveTextContent('24°C');
    expect(current).toHaveTextContent('Parcialmente nublado');

    const forecast = await screen.findByRole('region', { name: 'Próximos dias' });
    expect(within(forecast).getAllByRole('article')).toHaveLength(5);
    expect(getCurrentWeatherMock).toHaveBeenCalledWith(mockWeatherData.city);
    expect(getForecastMock).toHaveBeenCalledWith(mockWeatherData.city);
    expect(screen.queryByRole('heading', { name: 'Escolha a cidade' })).not.toBeInTheDocument();
  });

  it('trocar para °F converte todas as temperaturas sem nova requisição', async () => {
    render(<App />);
    const user = await searchAndSelect('São Paulo');
    const current = await screen.findByRole('region', { name: CITY_HEADING });
    const requestsBefore =
      searchCitiesMock.mock.calls.length +
      getCurrentWeatherMock.mock.calls.length +
      getForecastMock.mock.calls.length;

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(current).toHaveTextContent('75°F');
    expect(within(screen.getByRole('region', { name: 'Próximos dias' })).queryByText(/°C/)).toBeNull();
    expect(
      searchCitiesMock.mock.calls.length +
        getCurrentWeatherMock.mock.calls.length +
        getForecastMock.mock.calls.length,
    ).toBe(requestsBefore);
  });

  it('busca sem resultados mostra estado vazio explícito', async () => {
    searchCitiesMock.mockResolvedValue([]);
    render(<App />);

    await searchFor('cidade inexistente');

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(getCurrentWeatherMock).not.toHaveBeenCalled();
  });

  it('falha da busca mostra erro em pt-BR e "Tentar novamente" refaz a busca', async () => {
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError('network'));
    render(<App />);
    const user = await searchFor('São Paulo');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Sem conexão com a internet');

    await user.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('button', { name: CITY_OPTION })).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(searchCitiesMock).toHaveBeenLastCalledWith('São Paulo');
  });

  it('falha do clima atual não esconde a previsão (AC-RF03.1, EC-08)', async () => {
    getCurrentWeatherMock.mockRejectedValueOnce(new WeatherServiceError('http'));
    render(<App />);
    await searchAndSelect('São Paulo');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('O serviço de clima está indisponível');
    expect(await screen.findByRole('region', { name: 'Próximos dias' })).toBeInTheDocument();
  });

  it('falha da previsão não esconde o clima atual (AC-RF03.1, EC-08)', async () => {
    getForecastMock.mockRejectedValueOnce(new WeatherServiceError('timeout'));
    render(<App />);
    await searchAndSelect('São Paulo');

    expect(await screen.findByRole('region', { name: CITY_HEADING })).toBeInTheDocument();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Próximos dias' })).not.toBeInTheDocument();
  });

  it('previsão vazia mostra estado vazio explícito (AC-RF06.3)', async () => {
    getForecastMock.mockResolvedValueOnce([]);
    render(<App />);
    await searchAndSelect('São Paulo');

    expect(await screen.findByRole('heading', { name: 'Previsão indisponível' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: CITY_HEADING })).toBeInTheDocument();
  });

  it('resposta parcial (campos null) não exibe NaN nem undefined', async () => {
    getCurrentWeatherMock.mockResolvedValueOnce({
      ...mockWeatherData.current,
      temperatureC: null,
      relativeHumidity: null,
      windSpeedKmh: null,
      pressureHpa: null,
      precipitationMm: null,
    });
    render(<App />);
    await searchAndSelect('São Paulo');

    await screen.findByRole('region', { name: CITY_HEADING });

    expect(document.body.textContent).not.toMatch(/NaN|undefined/);
    expect(screen.getAllByText('não disponível').length).toBeGreaterThan(0);
  });

  it('busca com acentos e emoji é enviada sem alteração ao serviço (EC-02)', async () => {
    searchCitiesMock.mockResolvedValueOnce([]);
    render(<App />);
    await searchFor('  Ñandú 😀 ');

    expect(searchCitiesMock).toHaveBeenCalledWith('Ñandú 😀');
    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
  });
});
