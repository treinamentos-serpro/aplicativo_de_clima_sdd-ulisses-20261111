# Backlog de Tarefas — Aplicativo de Previsão do Tempo

**Entrada:** [plans/weather-app-plan.md](../plans/weather-app-plan.md)
**Fonte da verdade dos requisitos:** [specs/weather-app-spec.md](../specs/weather-app-spec.md) (Rascunho v2)
**Status:** Rascunho para execução. Cada tarefa é uma unidade testável e pode ser delegada a um Coding Agent.

> Regra: uma tarefa = uma unidade testável. Tarefas de teste são explícitas.
> Ordem: respeite as dependências (`Deps`). Tarefas sem dependência podem rodar em paralelo.

---

## Legenda

- **Tipo:** `Data` (tipos, lib, services, hooks), `UI` (componentes, estilo), `Test` (unit/E2E), `Infra` (config, dependências, build).
- **Deps:** IDs que precisam estar concluídos antes.
- **Requisitos:** IDs da spec (RF, US, AC, EC, RNF) e do plano (D-P*).

---

## Premissas e ajustes em relação aos artefatos existentes

| # | Achado | Tratamento no backlog |
|---|--------|------------------------|
| P-1 | [playwright.config.ts](../playwright.config.ts) usa `pnpm dev` no `webServer`, mas o plano exige E2E contra o build de produção (`pnpm build` + preview). | Corrigido em **T-40**. |
| P-2 | [src/lib/format.ts](../src/lib/format.ts) já existe; o plano prevê `src/lib/formatters.ts`. | Consolidado em **T-06** (comportamento de `getDayLabel` e `getShortDate` preservado). |
| P-3 | [vite.config.ts](../vite.config.ts) referencia `tests/setup.ts` e `tests/unit/`, que ainda não existem. | Criados em **T-02**. |
| P-4 | [tsconfig.app.json](../tsconfig.app.json) já inclui `tests` no `include`, então `tsc -b` cobre os testes. | Nenhuma tarefa extra; validado no checklist final (**T-48**). |
| P-5 | AC-04.1 está bloqueado por OQ-06 (favoritos/histórico). | Fora do backlog. |
| P-6 | OQ-20 (textos pt-BR dos códigos WMO) e OQ-19 (offline do PWA) estão abertas. | Usar textos propostos em **T-04** e comportamento do plano em **T-38**; registrar confirmação do PM antes de fechar essas tarefas. |
| P-7 | OQ-17 (licença Open-Meteo) bloqueia produção, não o desenvolvimento. | Fora do backlog de código; tratar antes do deploy. |
| P-8 | **Contradição no plano:** zero dias válidos da previsão é `invalid` na seção Forecast horário (EC-12), mas `empty` no Data Flow e em State Management (AC-RF06.3). | Decisão pendente com o PM antes de **T-16** e **T-30**. |

---

## Visão geral por entrega

| Entrega | Tarefas | Foco |
|---------|---------|------|
| 0 — Fundação | T-01, T-02 | Tipos de domínio e setup de testes |
| 1 — Funções puras | T-03 a T-10 | Conversão, WMO, agrupamento de previsão, formatação |
| 2 — Acesso a dados | T-11 a T-17 | `fetch` com timeout, geocoding, clima atual, previsão |
| 3 — Estado e hooks | T-18 a T-23 | Busca, clima, unidade, descarte de respostas obsoletas |
| 4 — Componentes e composição | T-24 a T-35 | UI de busca, clima, previsão, erros, App |
| 5 — Bootstrap, estilo e PWA | T-36 a T-39 | Entrada, tema, responsivo, PWA |
| 6 — E2E e hardening | T-40 a T-47 | Fluxos, teclado, mobile, erros, a11y, PWA |
| 7 — Fechamento | T-48 | Checklist completo e cobertura de AC |

---

## Priorização, tamanho e fatias de entrega

**Prioridade:** `P0` = MVP funcional (busca, clima atual, previsão, °C/°F e seus testes unitários). `P1` = critérios de release v1 (PWA, publicação, E2E, teclado, mobile, a11y). `P2` = fechamento.
**Tamanho:** `P` = pequena (1 arquivo, até 2 critérios). `M` = média (2 arquivos ou 3+ critérios). `G` = grande (3+ arquivos, configuração ou dependências).
**Regra:** uma tarefa nunca depende de outra com prioridade mais baixa.

| ID | Prioridade | Tamanho | | ID | Prioridade | Tamanho |
|----|------------|---------|-|----|------------|---------|
| T-01 | P0 | M | | T-25 | P0 | P |
| T-02 | P0 | M | | T-26 | P0 | M |
| T-03 | P0 | M | | T-27 | P0 | P |
| T-04 | P0 | P | | T-28 | P0 | P |
| T-05 | P0 | M | | T-29 | P0 | M |
| T-06 | P0 | G | | T-30 | P0 | M |
| T-07 | P0 | P | | T-31 | P0 | M |
| T-08 | P0 | P | | T-32 | P0 | M |
| T-09 | P0 | M | | T-33 | P0 | M |
| T-10 | P0 | M | | T-34 | P0 | M |
| T-11 | P0 | M | | T-35 | P0 | P |
| T-12 | P0 | P | | T-36 | P0 | M |
| T-13 | P0 | P | | T-37 | P0 | M |
| T-14 | P0 | M | | T-38 | P1 | G |
| T-15 | P0 | M | | T-39 | P1 | P |
| T-16 | P0 | P | | T-40 | P1 | G |
| T-17 | P0 | M | | T-41 | P1 | P |
| T-18 | P0 | P | | T-42 | P1 | P |
| T-19 | P0 | M | | T-43 | P1 | M |
| T-20 | P0 | M | | T-44 | P1 | M |
| T-21 | P0 | M | | T-45 | P1 | P |
| T-22 | P0 | M | | T-46 | P1 | M |
| T-23 | P0 | P | | T-47 | P2 | P |
| T-24 | P0 | P | | T-48 | P2 | G |

### Fatias verticais de entrega

| Fatia | Tarefas | O que fica pronto | Visível ao usuário? |
|-------|---------|-------------------|---------------------|
| **F1 — Dados e domínio** | T-01 a T-17 | Tipos, funções puras e services testados com `fetch` mockado | Não (verificável por testes) |
| **F2 — Clima na tela** | T-18 a T-37 | Busca, seleção, clima atual, previsão, °C/°F, estados e tema | **Sim**, após T-34 e T-36 |
| **F3 — Qualidade e publicação** | T-38 a T-46 | PWA, build para Pages, E2E, teclado, mobile 320 px, erros e a11y | Validação |
| **F4 — Fechamento** | T-47, T-48 | E2E de PWA e checklist final (`lint`, `build`, `test`, Playwright) | Validação |

> Observação: a primeira tela visível depende de **T-34** (composição de `App`), que depende de quase todos os componentes P0. Se for preciso ver algo antes, vale criar um esqueleto de `App` com busca e clima atual como alternativa. Isso muda a ordem do backlog e deve ser combinado antes.

---

## Entrega 0 — Fundação

### T-01 — Criar contratos de domínio em `src/types/weather.ts`

- **Tipo:** Data
- **Deps:** nenhuma
- **Requisitos:** Plano, seção Data Model; RF-01 a RF-03; AS-04, AS-06, AS-07, RNF-10
- **Arquivos:** `src/types/weather.ts` (criar)
- **Descrição:** Tipos `Unit`, `City`, `CurrentWeather`, `HourlyForecast`, `ForecastDay`, `WeatherData`, `WeatherErrorKind`, `WeatherError` e `AsyncState<T>`, exatamente como no plano.
- **Aceite:**
  - [ ] Todos os tipos do plano são exportados com os mesmos nomes e campos.
  - [ ] `temperatureC`, `relativeHumidity`, `windSpeedKmh`, `pressureHpa` e `precipitationMm` aceitam `null`.
  - [ ] `pnpm build` passa sem erros de tipo.

### T-02 — Configurar setup de testes unitários

- **Tipo:** Test / Infra
- **Deps:** nenhuma
- **Requisitos:** RNF-04; plano, seção Testing Strategy; P-3
- **Arquivos:** `tests/setup.ts` (criar), `tests/unit/setup.test.ts` (criar)
- **Descrição:** Criar `tests/setup.ts` importando `@testing-library/jest-dom/vitest`, referenciado por `vite.config.ts`. Adicionar um teste de fumaça que comprova que o setup carrega e que matchers como `toBeInTheDocument` estão disponíveis.
- **Aceite:**
  - [ ] `pnpm test` roda e passa.
  - [ ] `pnpm lint` roda sobre `tests/` sem erro de caminho.
  - [ ] `pnpm build` passa com `tests/` incluído em `tsconfig.app.json`.

---

## Entrega 1 — Funções puras (`src/lib/`)

### T-03 — Implementar conversão de temperatura em `src/lib/temperature.ts`

- **Tipo:** Data
- **Deps:** nenhuma
- **Requisitos:** AC-07.1, AC-07.2, AC-07.3, EC-16; plano, `lib/temperature.ts`
- **Arquivos:** `src/lib/temperature.ts` (criar)
- **Descrição:** Funções puras `convertCelsiusToFahrenheit(c: number): number` e `toDisplayTemperature(celsius: number | null, unit: Unit): number | null`. Fórmula `°F = °C × 9/5 + 32`, arredondada para inteiro. `null` retorna `null`. Velocidade, pressão e precipitação não passam por aqui.
- **Aceite:**
  - [ ] 0 °C → 32 °F; 100 °C → 212 °F; −40 °C → −40 °F.
  - [ ] Unidade `celsius` devolve o valor original arredondado sem conversão.
  - [ ] `null` retorna `null`.

### T-04 — Implementar tradução WMO em `src/lib/wmoCodes.ts`

- **Tipo:** Data
- **Deps:** nenhuma
- **Requisitos:** AC-03.3, EC-13, R-10, OQ-20 (textos propostos, confirmar com PM)
- **Arquivos:** `src/lib/wmoCodes.ts` (criar)
- **Descrição:** Tabela única de códigos WMO → texto pt-BR, e função `getWeatherCondition(code: number | null): string`. Código desconhecido ou `null` retorna `"Condição indisponível"`.
- **Aceite:**
  - [ ] Todos os códigos WMO usados pela Open-Meteo estão mapeados em uma única tabela.
  - [ ] Código desconhecido retorna `"Condição indisponível"`.

### T-05 — Implementar agrupamento de previsão em `src/lib/forecastGrouping.ts`

- **Tipo:** Data
- **Deps:** T-01
- **Requisitos:** AC-02.1, EC-12; plano, seção Forecast horário
- **Arquivos:** `src/lib/forecastGrouping.ts` (criar)
- **Descrição:** Função pura `groupHourlyByDay(entries): ForecastDay[]` que recebe as entradas horárias (`time`, `temperatureC`, `condition`, `precipitationMm`) e agrupa por `time.slice(0, 10)`. Dias com menos de 24 entradas são mantidos com `hours` parcial. Limita o resultado a 5 dias.
- **Aceite:**
  - [ ] 120 entradas viram 5 dias de 24 horas.
  - [ ] Dia incompleto é mantido com `hours` parcial.
  - [ ] Entradas vazias retornam `[]`.

### T-06 — Consolidar formatadores em `src/lib/formatters.ts`

- **Tipo:** Data
- **Deps:** nenhuma
- **Requisitos:** AC-02.1, AC-02.3, RNF-09, OQ-18 (formato "atualizado às HH:MM", proposto); P-2
- **Arquivos:** `src/lib/formatters.ts` (criar a partir de `src/lib/format.ts`), `src/lib/format.ts` (remover após migração)
- **Descrição:** Mover `getDayLabel` e `getShortDate` de `format.ts` para `formatters.ts`, sem mudar o comportamento. Adicionar `formatHour(isoLocal: string): string` ("HH:MM") e `formatUpdatedAt(isoUtc: string, timeZone: string): string` ("atualizado às HH:MM").
- **Aceite:**
  - [ ] `getDayLabel` continua devolvendo "Hoje", "Amanhã" e o dia da semana abreviado.
  - [ ] `formatHour` e `formatUpdatedAt` devolvem `HH:MM` no fuso informado.
  - [ ] Nenhum import restante aponta para `format.ts`.

### T-07 — Testar `lib/temperature.ts`

- **Tipo:** Test
- **Deps:** T-03
- **Requisitos:** AC-07.3, EC-16, RNF-04
- **Arquivos:** `tests/unit/lib/temperature.test.ts` (criar)
- **Aceite:**
  - [ ] Cobre 0 → 32, 100 → 212, −40 → −40, arredondamento e `null`.
  - [ ] `pnpm test` passa.

### T-08 — Testar `lib/wmoCodes.ts`

- **Tipo:** Test
- **Deps:** T-04
- **Requisitos:** AC-03.3, EC-13, R-10
- **Arquivos:** `tests/unit/lib/wmoCodes.test.ts` (criar)
- **Aceite:**
  - [ ] Cada código mapeado retorna texto não vazio.
  - [ ] Código desconhecido e `null` retornam `"Condição indisponível"`.

### T-09 — Testar `lib/forecastGrouping.ts`

- **Tipo:** Test
- **Deps:** T-05
- **Requisitos:** AC-02.1, EC-12
- **Arquivos:** `tests/unit/lib/forecastGrouping.test.ts` (criar)
- **Aceite:**
  - [ ] 120 entradas → 5 dias × 24 horas.
  - [ ] Dia parcial preservado.
  - [ ] Agrupamento pela data local da cidade, sem deslocamento de fuso.

### T-10 — Testar `lib/formatters.ts`

- **Tipo:** Test
- **Deps:** T-06
- **Requisitos:** AC-02.1, AC-02.3, OQ-18
- **Arquivos:** `tests/unit/lib/formatters.test.ts` (criar)
- **Aceite:**
  - [ ] `getDayLabel` cobre índices 0, 1 e demais.
  - [ ] `getShortDate` formata "12 Jun".
  - [ ] `formatHour` e `formatUpdatedAt` cobrem um fuso diferente de UTC.

---

## Entrega 2 — Acesso a dados (`src/services/`)

### T-11 — Implementar cliente HTTP com timeout e classificação de erro

- **Tipo:** Data
- **Deps:** T-01
- **Requisitos:** AC-09.1, AC-09.3, RNF-05, RNF-10, D-P1 (timeout de 3000 ms); plano, seção Error Handling
- **Arquivos:** `src/services/openMeteoClient.ts` (criar)
- **Descrição:** Encapsular `fetch` com `AbortController` e timer de 3000 ms, limpo ao concluir. Retorna `{ ok: true, data } | { ok: false, error }` sem lançar exceção. Classifica: `TypeError` de rede → `network`; abort pelo timer → `timeout`; 429, 5xx ou não 2xx → `http` (com `status`); JSON inválido → `invalid`.
- **Aceite:**
  - [ ] Nenhuma exceção não tratada sai do módulo.
  - [ ] Timer é limpo em sucesso e em erro.
  - [ ] Cada situação mapeia para o `kind` da tabela do plano.

### T-12 — Testar `openMeteoClient` com `fetch` mockado

- **Tipo:** Test
- **Deps:** T-11
- **Requisitos:** AC-09.1, AC-09.3, EC-09, EC-11
- **Arquivos:** `tests/unit/services/openMeteoClient.test.ts` (criar)
- **Aceite:**
  - [ ] Cobre rede, timeout (fake timers), 429, 500, JSON inválido e sucesso.
  - [ ] Confirma que o timer é limpo.

### T-13 — Implementar `geocodingService.searchCities`

- **Tipo:** Data
- **Deps:** T-01, T-11
- **Requisitos:** RF-01, AC-01.2, AC-01.3, AC-01.4, D-P11
- **Arquivos:** `src/services/geocodingService.ts` (criar)
- **Descrição:** Monta a URL de geocoding com `name` (já `trim()`), `count=10`, `language=pt`, `format=json`. Mapeia `results` para `City` (`admin1` → `region`, `country_code` → `countryCode`). Resposta `{}` sem `results` retorna sucesso com lista vazia.
- **Aceite:**
  - [ ] Homônimos são retornados como cidades distintas (com `region` e `country`).
  - [ ] `{}` retorna lista vazia, não erro.

### T-14 — Testar `geocodingService` com `fetch` mockado

- **Tipo:** Test
- **Deps:** T-13
- **Requisitos:** AC-01.2, AC-01.3, AC-01.4, EC-05
- **Arquivos:** `tests/unit/services/geocodingService.test.ts` (criar)
- **Aceite:**
  - [ ] Mapeia `results` para `City`.
  - [ ] `{}` gera lista vazia.
  - [ ] Dois resultados com mesmo nome permanecem separados.

### T-15 — Implementar `forecastService.getCurrentWeather`

- **Tipo:** Data
- **Deps:** T-01, T-04, T-11
- **Requisitos:** RF-02, AC-03.1, AC-03.2, AC-03.3, AC-07.5, D-P8, D-P10
- **Arquivos:** `src/services/forecastService.ts` (criar)
- **Descrição:** Requisição `current` com `temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,precipitation`, `timezone=auto`. Mapeia para `CurrentWeather`. Campo ausente vira `null`. Sem nenhum campo mínimo válido vira `invalid`.
- **Aceite:**
  - [ ] Campos ausentes viram `null`.
  - [ ] `weather_code` passa por `getWeatherCondition`.
  - [ ] Temperatura permanece em Celsius.

### T-16 — Implementar `forecastService.getForecast`

- **Tipo:** Data
- **Deps:** T-01, T-05, T-11
- **Requisitos:** RF-03, AC-02.1, EC-12, D-P2
- **Arquivos:** `src/services/forecastService.ts` (editar)
- **Descrição:** Requisição `hourly=temperature_2m,weather_code,precipitation`, `forecast_days=5`, `timezone=auto`. Usa `groupHourlyByDay`. Se nenhum dia for válido, retorna `invalid`; se a lista estiver vazia após validação, retorna sucesso vazio para o estado "vazio".
- **Aceite:**
  - [ ] Retorna até 5 `ForecastDay`.
  - [ ] Zero dias válidos segue a decisão pendente do plano (ver P-8): `invalid` ou sucesso vazio. Não implementar ambos.

### T-17 — Testar `forecastService` com `fetch` mockado

- **Tipo:** Test
- **Deps:** T-15, T-16
- **Requisitos:** AC-03.2, AC-RF03.1, EC-08, EC-12
- **Arquivos:** `tests/unit/services/forecastService.test.ts` (criar)
- **Aceite:**
  - [ ] Clima atual e previsão são chamados de forma independente (duas requisições).
  - [ ] Campo ausente vira `null`.
  - [ ] Falha da previsão não afeta o resultado do clima atual.

---

## Entrega 3 — Estado e hooks (`src/hooks/`)

### T-18 — Implementar `useTemperatureUnit`

- **Tipo:** Data
- **Deps:** T-01
- **Requisitos:** RF-04, AC-07.1, D-03, D-P7
- **Arquivos:** `src/hooks/useTemperatureUnit.ts` (criar)
- **Descrição:** Estado em memória, padrão `celsius`, com `unit` e `toggleUnit`/`setUnit`. Sem persistência entre sessões (D-P6).
- **Aceite:**
  - [ ] Valor inicial é `celsius`.
  - [ ] Troca não dispara efeito colateral de rede.

### T-19 — Implementar `useCitySearch` com `requestId`

- **Tipo:** Data
- **Deps:** T-13
- **Requisitos:** RF-01, AC-01.1, EC-01, EC-04, EC-06, D-P3, R-12
- **Arquivos:** `src/hooks/useCitySearch.ts` (criar)
- **Descrição:** Estado `AsyncState<City[]>`. Busca só ao enviar; texto vazio após `trim()` não dispara requisição e retorna `idle` com instrução. Cada busca recebe `requestId` crescente; respostas com `requestId` antigo são descartadas. Usa `AbortController` para cancelar a anterior.
- **Aceite:**
  - [ ] Texto vazio não chama `searchCities`.
  - [ ] Resposta antiga não sobrescreve a nova.
  - [ ] Lista vazia vira estado `empty`.

### T-20 — Implementar `useWeather` com estados independentes

- **Tipo:** Data
- **Deps:** T-15, T-16
- **Requisitos:** RF-02, RF-03, RF-07, AC-01.5, EC-08, EC-06, EC-07, D-P2
- **Arquivos:** `src/hooks/useWeather.ts` (criar)
- **Descrição:** Recebe a `City` selecionada. Dois estados `AsyncState` independentes (`current` e `forecast`). Dispara as duas requisições com `Promise.allSettled`, cada uma com seu `requestId` e `AbortController`. Trocar de cidade descarta respostas da cidade anterior. Estado inicial é `idle`.
- **Aceite:**
  - [ ] Erro de um bloco não altera o outro.
  - [ ] Respostas de cidade antiga são descartadas.
  - [ ] Sem cidade selecionada, ambos os estados são `idle`.

### T-21 — Testar `useCitySearch`

- **Tipo:** Test
- **Deps:** T-19
- **Requisitos:** AC-01.1, EC-06, RNF-04
- **Arquivos:** `tests/unit/hooks/useCitySearch.test.ts` (criar)
- **Aceite:**
  - [ ] Texto vazio não dispara rede.
  - [ ] Duas buscas em sequência: a resposta da primeira não aparece.
  - [ ] Estados `loading`, `success`, `empty` e `error` são alcançados.

### T-22 — Testar `useWeather`

- **Tipo:** Test
- **Deps:** T-20
- **Requisitos:** EC-06, EC-07, EC-08, AC-01.5
- **Arquivos:** `tests/unit/hooks/useWeather.test.ts` (criar)
- **Aceite:**
  - [ ] Seleção dispara as duas requisições em paralelo.
  - [ ] Erro de previsão mantém clima atual em `success`.
  - [ ] Troca rápida de cidade descarta a resposta obsoleta.

### T-23 — Testar `useTemperatureUnit`

- **Tipo:** Test
- **Deps:** T-18
- **Requisitos:** AC-07.1, AC-07.4, RF-04
- **Arquivos:** `tests/unit/hooks/useTemperatureUnit.test.ts` (criar)
- **Aceite:**
  - [ ] Padrão `celsius`.
  - [ ] Alternar para `fahrenheit` e voltar.

---

## Entrega 4 — Componentes e composição (`src/components/`)

### T-24 — Criar componente `StatusMessage`

- **Tipo:** UI
- **Deps:** T-01
- **Requisitos:** RF-06, AC-06.1, AC-06.2, RNF-02
- **Arquivos:** `src/components/StatusMessage.tsx` (criar)
- **Descrição:** Exibe loading, erro ou vazio. Loading usa `role="status"`; erro usa `role="alert"`; ambos com `aria-live`.
- **Aceite:**
  - [ ] Cada estado tem texto em pt-BR.
  - [ ] Erro está ligado ao botão via `aria-describedby` quando houver botão.

### T-25 — Mapear `WeatherError` para mensagens pt-BR

- **Tipo:** Data
- **Deps:** T-01
- **Requisitos:** RNF-10, AC-09.1, AC-09.3; plano, tabela de mensagens
- **Arquivos:** `src/lib/errorMessages.ts` (criar; módulo sugerido, não listado no plano)
- **Descrição:** Função pura `getErrorMessage(error: WeatherError): string` com as quatro mensagens do plano (`network`, `timeout`, `http`, `invalid`).
- **Aceite:**
  - [ ] Nenhuma mensagem contém código HTTP, stack ou nome da API.
  - [ ] Os quatro `kind` são cobertos.

### T-26 — Criar componente `UnitToggle`

- **Tipo:** UI
- **Deps:** nenhuma
- **Requisitos:** RF-04, AC-05.2, AC-05.3, AC-07.1, RNF-01
- **Arquivos:** `src/components/UnitToggle.tsx` (criar)
- **Descrição:** Botões "°C" e "°F" com `aria-pressed` refletindo a unidade ativa. Controlado por props.
- **Aceite:**
  - [ ] `aria-pressed` reflete a unidade ativa.
  - [ ] Ativável por teclado (Enter e Espaço).
  - [ ] Alvo de toque de no mínimo 44×44 px.

### T-27 — Criar componente `SearchForm`

- **Tipo:** UI
- **Deps:** nenhuma
- **Requisitos:** RF-01, RF-07, AC-01.1, AC-05.1, AC-05.2, RNF-02
- **Arquivos:** `src/components/SearchForm.tsx` (criar)
- **Descrição:** `<form>` com `<label>` associado ao campo e botão "Buscar" (submit). Controlado por props (`value`, `onChange`, `onSubmit`). Exibe instrução de digitação quando não há busca.
- **Aceite:**
  - [ ] Enter e o botão disparam `onSubmit`.
  - [ ] Campo tem label acessível.

### T-28 — Criar componente `CityResultList`

- **Tipo:** UI
- **Deps:** T-01
- **Requisitos:** AC-01.2, AC-01.3, AC-05.1, AC-05.2, RF-01
- **Arquivos:** `src/components/CityResultList.tsx` (criar)
- **Descrição:** Lista de resultados mostrando nome, região e país. Navegação por setas, Enter para selecionar e Esc para fechar a lista.
- **Aceite:**
  - [ ] Homônimos exibem região e país.
  - [ ] Setas movem o foco; Enter seleciona; Esc fecha.

### T-29 — Criar componente `CurrentWeatherCard`

- **Tipo:** UI
- **Deps:** T-03, T-25
- **Requisitos:** RF-02, AC-03.1, AC-03.2, AC-07.1, AC-07.2, AC-07.5
- **Arquivos:** `src/components/CurrentWeatherCard.tsx` (criar)
- **Descrição:** Exibe temperatura (na unidade ativa), condição, umidade, vento (km/h), pressão e precipitação. Campos `null` mostram "não disponível" com nome acessível. Vento, pressão e precipitação não mudam com o toggle.
- **Aceite:**
  - [ ] Temperatura usa `toDisplayTemperature`.
  - [ ] `null` mostra "não disponível".
  - [ ] Vento permanece em km/h ao trocar a unidade.

### T-30 — Criar componente `ForecastSection`

- **Tipo:** UI
- **Deps:** T-03, T-06, T-24
- **Requisitos:** RF-03, AC-02.1, AC-02.2, AC-02.3, AC-07.2
- **Arquivos:** `src/components/ForecastSection.tsx` (criar)
- **Descrição:** Cinco dias com rótulos de `getDayLabel` e `getShortDate`. Cada hora mostra horário (`formatHour`), temperatura na unidade ativa e condição. Trata loading, erro e vazio via `StatusMessage`.
- **Aceite:**
  - [ ] Exibe até 5 dias com suas horas.
  - [ ] Loading é anunciado (`role="status"`).
  - [ ] Temperaturas mudam com o toggle.

### T-31 — Testar componentes de busca (`SearchForm`, `CityResultList`)

- **Tipo:** Test
- **Deps:** T-27, T-28
- **Requisitos:** AC-01.1, AC-01.2, AC-01.3, AC-05.1, AC-05.2
- **Arquivos:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/CityResultList.test.tsx` (criar)
- **Aceite:**
  - [ ] Submit com campo vazio não chama `onSubmit` com busca (ou mostra instrução).
  - [ ] Teclado navega e seleciona resultados.
  - [ ] Homônimos são distinguíveis.

### T-32 — Testar componentes de status e unidade (`StatusMessage`, `UnitToggle`)

- **Tipo:** Test
- **Deps:** T-24, T-26
- **Requisitos:** AC-05.2, AC-06.1, AC-06.2, AC-07.1
- **Arquivos:** `tests/unit/components/StatusMessage.test.tsx`, `tests/unit/components/UnitToggle.test.tsx` (criar)
- **Aceite:**
  - [ ] `role="alert"` em erro e `role="status"` em loading.
  - [ ] `aria-pressed` alterna corretamente.

### T-33 — Testar componentes de clima (`CurrentWeatherCard`, `ForecastSection`)

- **Tipo:** Test
- **Deps:** T-29, T-30
- **Requisitos:** AC-02.1, AC-02.2, AC-02.3, AC-03.1, AC-03.2, AC-07.2, AC-07.5
- **Arquivos:** `tests/unit/components/CurrentWeatherCard.test.tsx`, `tests/unit/components/ForecastSection.test.tsx` (criar)
- **Aceite:**
  - [ ] "não disponível" aparece para `null`.
  - [ ] Troca de unidade converte temperaturas e mantém vento.
  - [ ] Estados loading, erro e vazio renderizam.

### T-34 — Compor `App` com hooks e componentes

- **Tipo:** UI
- **Deps:** T-18, T-19, T-20, T-25, T-26, T-27, T-28, T-29, T-30
- **Requisitos:** RF-01 a RF-07, AC-01.5, AC-09.2, EC-08
- **Arquivos:** `src/components/App.tsx` (criar)
- **Descrição:** Composição da tela: busca, lista, cidade selecionada, clima atual, previsão e toggle. Cada bloco tem botão "Tentar novamente" que repete somente a sua requisição. Erro de busca ou previsão não apaga o clima atual já exibido (EC-08).
- **Aceite:**
  - [ ] Estado inicial mostra instrução sem erro (RF-07).
  - [ ] "Tentar novamente" repete apenas a requisição do bloco.
  - [ ] Erro de busca não limpa o clima exibido.

### T-35 — Testar `App` (integração de componentes com mocks de services)

- **Tipo:** Test
- **Deps:** T-34
- **Requisitos:** AC-01.5, AC-09.2, EC-08, RNF-04
- **Arquivos:** `tests/unit/components/App.test.tsx` (criar)
- **Aceite:**
  - [ ] Seleção de cidade chama clima e previsão.
  - [ ] Falha simulada mostra mensagem e "Tentar novamente" refaz só aquela requisição.

---

## Entrega 5 — Bootstrap, estilo e PWA

### T-36 — Criar entrada da aplicação em `src/main.tsx` e estilos base

- **Tipo:** Infra
- **Deps:** T-34
- **Requisitos:** RF-07, RNF-09
- **Arquivos:** `src/main.tsx` (criar), `src/index.css` (criar)
- **Descrição:** Monta `App` em `#root` com `StrictMode`. Importa Tailwind via `index.css`.
- **Aceite:**
  - [ ] `pnpm dev` abre a tela inicial sem erro no console.
  - [ ] `lang="pt-BR"` continua presente em `index.html`.

### T-37 — Aplicar tema dark glassmorphism e layout responsivo

- **Tipo:** UI
- **Deps:** T-36
- **Requisitos:** RF-05, AC-08.1, AC-08.2, RNF-01, RNF-02 (contraste), D-P12
- **Arquivos:** `tailwind.config.js` (editar se necessário), `src/index.css`, componentes de `src/components/` (editar)
- **Descrição:** Tema escuro com superfícies translúcidas. Layout sem scroll horizontal em 320 px. Foco visível em todos os controles. Contraste WCAG 2.1 AA.
- **Aceite:**
  - [ ] Sem scroll horizontal em 320 px.
  - [ ] Foco visível em busca, resultados e toggle.
  - [ ] Textos de corpo e rótulos atendem contraste AA.

### T-38 — Configurar PWA (manifest e service worker)

- **Tipo:** Infra
- **Deps:** T-36
- **Requisitos:** D-P4, RNF-08, OQ-19 (confirmar com PM); plano, Stack e Risks
- **Arquivos:** `package.json`, `pnpm-lock.yaml`, `vite.config.ts`, `index.html`, `src/pwa/` (se necessário)
- **Descrição:** Instalar `vite-plugin-pwa` com `pnpm add -D vite-plugin-pwa`. Configurar manifest e service worker para cachear apenas o shell estático. Dados de clima e busca **não** são cacheados e exibem erro de conexão offline.
- **Aceite:**
  - [ ] `pnpm build` gera `manifest.webmanifest` e service worker em `dist/`.
  - [ ] Nenhuma requisição à Open-Meteo é servida pelo cache.
  - [ ] `package.json` e `pnpm-lock.yaml` atualizados juntos.

### T-39 — Validar build e base path do GitHub Pages

- **Tipo:** Infra
- **Deps:** T-38
- **Requisitos:** RNF-08, OQ-10, D-P (risco de base path)
- **Arquivos:** `vite.config.ts` (somente se necessário)
- **Descrição:** Confirmar que `VITE_BASE` controla o `base` do Vite e que o padrão `/` funciona no preview local. Não definir o caminho final de produção aqui (OQ-10).
- **Aceite:**
  - [ ] `VITE_BASE=/x/ pnpm build` gera assets com o prefixo.
  - [ ] `pnpm build` padrão funciona sem variável.

---

## Entrega 6 — E2E e hardening

### T-40 — Ajustar Playwright: build + preview, projeto mobile 320 px e axe

- **Tipo:** Infra
- **Deps:** T-37, T-38
- **Requisitos:** P-1; AC-08.1, AC-08.2, RNF-02; plano, Testing Strategy (E2E)
- **Arquivos:** `playwright.config.ts`, `package.json`, `pnpm-lock.yaml`
- **Descrição:** Trocar o `webServer` de `pnpm dev` para build + preview (`pnpm build && pnpm preview --port 5173`). Adicionar projeto de viewport de 320 px (além do `mobile` atual). Instalar `@axe-core/playwright` com `pnpm add -D @axe-core/playwright`.
- **Aceite:**
  - [ ] `pnpm exec playwright test --list` lista os projetos `chromium` e `mobile-320`.
  - [ ] E2E sobe o preview de produção, não o dev server.
  - [ ] `@axe-core/playwright` aparece em `devDependencies`.

### T-41 — E2E do fluxo principal

- **Tipo:** Test
- **Deps:** T-34, T-40
- **Requisitos:** AC-01.1, AC-01.2, AC-01.5, AC-02.1, AC-03.1, AC-07.2
- **Arquivos:** `tests/e2e/main-flow.spec.ts` (criar)
- **Descrição:** Busca → seleção → clima atual + previsão → troca de unidade. Rotas de rede via `page.route`.
- **Aceite:**
  - [ ] Fluxo passa em `chromium`.
  - [ ] Após troca para °F, temperaturas mudam.

### T-42 — E2E de teclado

- **Tipo:** Test
- **Deps:** T-40
- **Requisitos:** AC-05.1, AC-05.2, AC-05.3
- **Arquivos:** `tests/e2e/keyboard.spec.ts` (criar)
- **Aceite:**
  - [ ] Tab/Shift+Tab percorrem campo, resultados e toggle.
  - [ ] Setas e Enter selecionam cidade sem mouse.

### T-43 — E2E de mobile 320 px

- **Tipo:** Test
- **Deps:** T-37, T-40
- **Requisitos:** AC-08.1, AC-08.2, AC-08.3, RF-05
- **Arquivos:** `tests/e2e/mobile.spec.ts` (criar)
- **Aceite:**
  - [ ] Em 320 px, `document.documentElement.scrollWidth <= clientWidth`.
  - [ ] Controles interativos têm no mínimo 44×44 px.
  - [ ] Busca, seleção e troca de unidade funcionam.

### T-44 — E2E de falha simulada e "Tentar novamente"

- **Tipo:** Test
- **Deps:** T-40
- **Requisitos:** AC-09.1, AC-09.2, AC-09.3, EC-09, EC-11
- **Arquivos:** `tests/e2e/error-handling.spec.ts` (criar)
- **Aceite:**
  - [ ] Rota abortada e rota com 500 exibem mensagem em pt-BR.
  - [ ] Timeout (rota que não responde) exibe mensagem de timeout.
  - [ ] "Tentar novamente" repete a requisição e exibe sucesso após a rota voltar.

### T-45 — E2E de troca de unidade sem nova requisição

- **Tipo:** Test
- **Deps:** T-40
- **Requisitos:** AC-07.4, AC-07.5
- **Arquivos:** `tests/e2e/unit-toggle.spec.ts` (criar)
- **Aceite:**
  - [ ] Contador de requisições não muda ao alternar a unidade.
  - [ ] Vento, pressão e precipitação permanecem inalterados.

### T-46 — E2E de acessibilidade com axe

- **Tipo:** Test
- **Deps:** T-37, T-40
- **Requisitos:** RNF-02, AC-06.1, AC-06.2, R-07
- **Arquivos:** `tests/e2e/a11y.spec.ts` (criar)
- **Aceite:**
  - [ ] Varredura `@axe-core/playwright` WCAG 2.1 AA sem violações críticas em estados inicial, loading, erro e sucesso.
  - [ ] Campos de busca e controles de unidade não violam as regras `label` e `button-name` do axe.
  - [ ] Nenhuma violação da regra `color-contrast` (mínimo 4,5:1) nos mesmos estados (RNF-02, R-07).

### T-47 — E2E de PWA (manifest e service worker)

- **Tipo:** Test
- **Deps:** T-38, T-40
- **Requisitos:** D-P4; plano, Testing Strategy (PWA)
- **Arquivos:** `tests/e2e/pwa.spec.ts` (criar)
- **Aceite:**
  - [ ] `<link rel="manifest">` presente.
  - [ ] Service worker registrado após carregamento.

---

## Entrega 7 — Fechamento

### T-48 — Rodar checklist completo e corrigir falhas

- **Tipo:** Test / Infra
- **Deps:** T-21, T-22, T-23, T-31, T-32, T-33, T-34, T-35, T-41, T-42, T-43, T-44, T-45, T-46, T-47
- **Requisitos:** Checklist do projeto (AGENTS.md / instruções)
- **Arquivos:** conforme falhas encontradas
- **Descrição:** Executar `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm exec playwright test`. Corrigir somente falhas introduzidas pelo backlog.
- **Aceite:**
  - [ ] `pnpm lint` passa.
  - [ ] `pnpm build` passa.
  - [ ] `pnpm test` passa.
  - [ ] `pnpm exec playwright test` passa nos projetos `chromium` e `mobile-320`.

---

## Cobertura de critérios de aceite

| AC | Descrição resumida | Tarefas |
|----|--------------------|---------|
| AC-01.1 | Busca vazia não requisita | T-19, T-21, T-27, T-31, T-41 |
| AC-01.2 | Resultado com nome, região, país | T-13, T-14, T-28, T-31 |
| AC-01.3 | Homônimos distintos | T-13, T-14, T-28, T-31 |
| AC-01.4 | Estado vazio na busca | T-13, T-14, T-19, T-21 |
| AC-01.5 | Seleção dispara clima e previsão | T-20, T-22, T-34, T-35, T-41 |
| AC-02.1 | 5 dias × 24 horas | T-05, T-09, T-16, T-30, T-33, T-41 |
| AC-02.2 | Loading da previsão anunciado | T-24, T-30, T-33 |
| AC-02.3 | Hora com temperatura, condição e unidade | T-06, T-10, T-30, T-33 |
| AC-03.1 | Campos do clima atual | T-15, T-17, T-29, T-33, T-41 |
| AC-03.2 | Campo ausente vira "não disponível" | T-15, T-17, T-29, T-33 |
| AC-03.3 | Código WMO desconhecido | T-04, T-08, T-15 |
| AC-05.1 | Teclado entre campo, resultados e toggle | T-27, T-28, T-31, T-42 |
| AC-05.2 | Foco visível e operável por teclado | T-26, T-27, T-28, T-32, T-37, T-42 |
| AC-05.3 | Ações por mouse disponíveis por teclado | T-26, T-28, T-42 |
| AC-06.1 | Loading, erro e vazio anunciados | T-24, T-32, T-46 |
| AC-06.2 | Erro associado ao campo ou região | T-24, T-46 |
| AC-07.1 | Padrão °C | T-18, T-23, T-26, T-29, T-32 |
| AC-07.2 | Troca converte previsão e atual | T-29, T-30, T-33, T-41 |
| AC-07.3 | Fórmula °F | T-03, T-07 |
| AC-07.4 | Troca sem nova requisição | T-45 |
| AC-07.5 | Vento, pressão e precipitação fora da conversão | T-15, T-29, T-33, T-45 |
| AC-08.1 | 320 px sem scroll horizontal | T-37, T-40, T-43 |
| AC-08.2 | Alvos de 44×44 px | T-26, T-37, T-43 |
| AC-08.3 | Fluxos completos no mobile | T-43 |
| AC-09.1 | Erro de rede, 5xx ou timeout exibe mensagem | T-11, T-12, T-25, T-44 |
| AC-09.2 | "Tentar novamente" repete só o bloco | T-34, T-35, T-44 |
| AC-09.3 | Qualquer falha não quebra a UI | T-11, T-12, T-44 |
| AC-RF03.1 | Falha da previsão mostra erro próprio e mantém o clima atual (EC-08) | T-16, T-17, T-22, T-30, T-34, T-35 |
| AC-RF06.1 | Loading do clima atual anunciado por região viva | T-20, T-24, T-30, T-33, T-46 |
| AC-RF06.2 | Erro do clima atual com "Tentar novamente" em pt-BR | T-24, T-25, T-34, T-44 |
| AC-RF06.3 | Previsão sem dias mostra estado vazio explícito | T-16, T-30, T-33 |
| AC-RF07.1 | Estado inicial sem cidade, sem requisição e com instrução | T-19, T-34, T-35, T-42 |

> AC-04.1 permanece sem tarefa (bloqueado por OQ-06, ver P-5).
