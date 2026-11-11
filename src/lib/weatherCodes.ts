/**
 * Tradução dos códigos WMO (Open-Meteo) para texto pt-BR e ícone.
 * Os textos seguem a proposta do plano (OQ-20 ainda aberta).
 */

interface WeatherCodeInfo {
  condition: string;
  icon: string;
}

const UNKNOWN: WeatherCodeInfo = { condition: 'Condição indisponível', icon: '🌡️' };

const WMO_CODES: Record<number, WeatherCodeInfo> = {
  0: { condition: 'Céu limpo', icon: '☀️' },
  1: { condition: 'Predominantemente limpo', icon: '🌤️' },
  2: { condition: 'Parcialmente nublado', icon: '⛅' },
  3: { condition: 'Nublado', icon: '☁️' },
  45: { condition: 'Nevoeiro', icon: '🌫️' },
  48: { condition: 'Nevoeiro com geada', icon: '🌫️' },
  51: { condition: 'Garoa fraca', icon: '🌦️' },
  53: { condition: 'Garoa moderada', icon: '🌦️' },
  55: { condition: 'Garoa intensa', icon: '🌦️' },
  56: { condition: 'Garoa congelante fraca', icon: '🌧️' },
  57: { condition: 'Garoa congelante intensa', icon: '🌧️' },
  61: { condition: 'Chuva fraca', icon: '🌧️' },
  63: { condition: 'Chuva moderada', icon: '🌧️' },
  65: { condition: 'Chuva forte', icon: '🌧️' },
  66: { condition: 'Chuva congelante fraca', icon: '🌧️' },
  67: { condition: 'Chuva congelante forte', icon: '🌧️' },
  71: { condition: 'Neve fraca', icon: '🌨️' },
  73: { condition: 'Neve moderada', icon: '🌨️' },
  75: { condition: 'Neve forte', icon: '❄️' },
  77: { condition: 'Grãos de neve', icon: '❄️' },
  80: { condition: 'Pancadas de chuva fracas', icon: '🌦️' },
  81: { condition: 'Pancadas de chuva moderadas', icon: '🌧️' },
  82: { condition: 'Pancadas de chuva violentas', icon: '🌧️' },
  85: { condition: 'Pancadas de neve fracas', icon: '🌨️' },
  86: { condition: 'Pancadas de neve fortes', icon: '🌨️' },
  95: { condition: 'Trovoada', icon: '⛈️' },
  96: { condition: 'Trovoada com granizo', icon: '⛈️' },
  99: { condition: 'Trovoada com granizo forte', icon: '⛈️' },
};

/** Texto pt-BR para um código WMO. Código desconhecido ou ausente vira "Condição indisponível". */
export function getConditionText(code: number | null): string {
  if (code === null) return UNKNOWN.condition;
  return (WMO_CODES[code] ?? UNKNOWN).condition;
}

/** Ícone para um texto de condição produzido por `getConditionText`. */
export function getConditionIcon(condition: string): string {
  const entry = Object.values(WMO_CODES).find((info) => info.condition === condition);
  return (entry ?? UNKNOWN).icon;
}
