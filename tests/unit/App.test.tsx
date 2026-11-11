import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/fixtures/weatherData';
import { WeatherServiceError, getWeather, searchCities } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';


vi.mock('../../src/services/weatherService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/services/weatherService')>()),
  searchCities: vi.fn(),
  getWeather: vi.fn(),
}));

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);
const CITY_HEADING = 'São Paulo, São Paulo, Brasil';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

async function searchFor(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: 'Buscar cidade' }), text);
  await user.click(screen.getByRole('button', { name: 'Buscar' }));
  return user;
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchCitiesMock.mockResolvedValue([mockWeatherData.city]);
    getWeatherMock.mockResolvedValue(mockWeatherData);
  });

  it('mostra a instrução inicial sem chamar a rede', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeInTheDocument();
    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('busca vazia não chama a rede nem mostra erro', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeInTheDocument();
  });

  it('busca com resultado mostra clima atual e 5 dias de previsão', async () => {
    render(<App />);

    await searchFor('São Paulo');

    const current = await screen.findByRole('region', { name: CITY_HEADING });
    expect(current).toHaveTextContent('24°C');
    expect(current).toHaveTextContent('Parcialmente nublado');

    const forecast = screen.getByRole('region', { name: 'Próximos dias' });
    expect(within(forecast).getAllByRole('article')).toHaveLength(5);
    expect(searchCitiesMock).toHaveBeenCalledWith('São Paulo');
    expect(getWeatherMock).toHaveBeenCalledWith(mockWeatherData.city);
  });

  it('trocar para °F converte todas as temperaturas sem nova requisição', async () => {
    render(<App />);
    const user = await searchFor('São Paulo');
    const current = await screen.findByRole('region', { name: CITY_HEADING });
    const requestsBefore = searchCitiesMock.mock.calls.length + getWeatherMock.mock.calls.length;

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
    expect(current).toHaveTextContent('75°F');
    expect(within(screen.getByRole('region', { name: 'Próximos dias' })).queryByText(/°C/)).toBeNull();
    expect(searchCitiesMock.mock.calls.length + getWeatherMock.mock.calls.length).toBe(
      requestsBefore,
    );
  });

  it('busca sem resultados mostra estado vazio explícito', async () => {
    searchCitiesMock.mockResolvedValue([]);
    render(<App />);

    await searchFor('cidade inexistente');

    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('falha do serviço mostra erro em pt-BR e "Tentar novamente" refaz a busca', async () => {
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError('network'));
    render(<App />);
    const user = await searchFor('São Paulo');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Sem conexão com a internet');

    await user.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('region', { name: CITY_HEADING })).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(searchCitiesMock).toHaveBeenLastCalledWith('São Paulo');
  });

  it('troca de unidade durante o carregamento é aplicada quando os dados chegam', async () => {
    const pending = deferred<WeatherData>();
    getWeatherMock.mockReturnValue(pending.promise);
    render(<App />);
    const user = await searchFor('São Paulo');
    await screen.findByText('Buscando clima…');

    await user.click(screen.getByRole('button', { name: '°F' }));
    await act(async () => {
      pending.resolve(mockWeatherData);
    });

    expect(await screen.findByRole('region', { name: CITY_HEADING })).toHaveTextContent('75°F');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('com erro nenhuma temperatura aparece e a unidade escolhida vale na nova busca', async () => {
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError('network'));
    render(<App />);
    const user = await searchFor('São Paulo');
    const alert = await screen.findByRole('alert');

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(alert).not.toHaveTextContent('°');
    expect(screen.queryByRole('region', { name: CITY_HEADING })).not.toBeInTheDocument();

    await user.click(within(alert).getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('region', { name: CITY_HEADING })).toHaveTextContent('75°F');
  });

  it('resposta parcial (campos null) não exibe NaN nem undefined', async () => {
    const partial: WeatherData = {
      ...mockWeatherData,
      current: {
        ...mockWeatherData.current,
        temperatureC: null,
        relativeHumidity: null,
        windSpeedKmh: null,
        pressureHpa: null,
        precipitationMm: null,
      },
      forecast: mockWeatherData.forecast.map((day, index) =>
        index === 0
          ? {
              ...day,
              hours: day.hours.map((hour) => ({
                ...hour,
                temperatureC: null,
                precipitationProbability: null,
                precipitationMm: null,
              })),
            }
          : day,
      ),
    };
    getWeatherMock.mockResolvedValueOnce(partial);
    render(<App />);
    await searchFor('São Paulo');

    await screen.findByRole('region', { name: CITY_HEADING });

    expect(document.body.textContent).not.toMatch(/NaN|undefined/);
    expect(screen.getAllByText('não disponível').length).toBeGreaterThan(0);
  });

  it('busca com acentos e emoji é enviada sem alteração ao serviço (EC-02)', async () => {
    searchCitiesMock.mockResolvedValueOnce([]);
    render(<App />);
    await searchFor('  Ñandú 😀 ');

    expect(searchCitiesMock).toHaveBeenCalledWith('Ñandú 😀');
    expect(await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
  });

  it('anuncia busca sem resultados em região de status', async () => {
    searchCitiesMock.mockResolvedValueOnce([]);
    render(<App />);
    await searchFor('Xyzzyville');

    await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' });

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
  });

  it('move o foco para o resultado ao concluir a busca', async () => {
    render(<App />);
    await searchFor('São Paulo');

    const region = await screen.findByRole('region', { name: CITY_HEADING });
    expect(region.closest('[tabindex="-1"]')).toHaveFocus();
  });

  it('mantém o foco no campo de busca durante o carregamento', async () => {
    const pending = deferred<(typeof mockWeatherData)['city'][]>();
    searchCitiesMock.mockReturnValueOnce(pending.promise);
    render(<App />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: 'Buscar cidade' });

    await user.type(input, 'São Paulo{Enter}');

    expect(screen.getByRole('status')).toHaveTextContent('Buscando clima');
    expect(input).toHaveFocus();
    expect(input).toBeEnabled();

    await act(async () => {
      pending.resolve([mockWeatherData.city]);
    });
    expect(await screen.findByRole('region', { name: CITY_HEADING })).toBeInTheDocument();
  });
});

