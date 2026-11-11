# Especificação — Aplicativo de Previsão do Tempo

**Status:** Rascunho v2 (2026-11-11), com revisão crítica aplicada. Aguardando validação do PM e das OQs bloqueantes antes do Plan.
**Fontes:** [discovery.md](./discovery.md) e [discovery/](./discovery/) (personas, riscos, decisões D-01 a D-07).

> Esta especificação é a fonte única da verdade para Plan, Tasks, Code, Test e Review.
> Itens marcados como **[pendente OQ-xx]** dependem de decisão de negócio e **não** devem ser implementados como se estivessem definidos.

---

## Overview

### Problema

Usuários precisam consultar o clima de qualquer cidade rapidamente, em celular ou desktop, sem cadastro e sem instalar nada.

### Objetivo do produto (v1)

Permitir que o usuário:

1. busque uma cidade por nome;
2. veja o clima atual dessa cidade;
3. veja a previsão dos próximos 5 dias (hoje + 4 dias seguintes, conforme D-02);
4. alterne a exibição de temperaturas entre °C e °F;
5. use o app em dispositivos móveis, com acessibilidade por teclado e leitor de tela.

### Personas

| ID | Persona | Objetivo principal |
|----|---------|--------------------|
| P-01 | Rafael, viajante | Consultar a previsão de 5 dias de uma cidade de destino, identificando a cidade certa entre homônimos. |
| P-02 | Mariana, decidindo a roupa do dia | Ver a temperatura atual da sua cidade em poucos toques. |
| P-03 | Lucas, usuário de teclado ou leitor de tela | Buscar, escolher uma cidade, ler o clima e alternar °C/°F sem mouse. |

### Métricas de sucesso

Ainda não definidas de forma mensurável. **[pendente OQ-15]** e **[pendente OQ-22]** (métricas dependem de analytics e consentimento). Enquanto isso, os critérios de aceite deste documento servem como definição de "pronto".

### Restrições já definidas (não são ambiguidades)

- Dados via **Open-Meteo** (geocoding + forecast), sem API key (D-01). Licença e limites: **[pendente OQ-17]**.
- SPA estática, sem backend próprio e sem persistência de servidor (D-04, AS-01).
- Interface em pt-BR, sem internacionalização nesta versão (D-05).
- Sem geolocalização automática na v1; a seleção de cidade é sempre manual (D-06).
- Estados de loading, erro e vazio são obrigatórios em todas as telas de dados.
- Acessibilidade com semântica HTML, labels e navegação por teclado.

---

## Functional Requirements

Os IDs `RF-xx` são os mesmos do discovery, para rastreabilidade.

### RF-01 — Buscar cidades por nome

- O usuário digita o nome de uma cidade em um campo de busca.
- A busca usa o serviço de geocoding do Open-Meteo.
- Cada resultado exibe, no mínimo: **nome da cidade**, **região/estado** (quando disponível) e **país**.
- Homônimos (mesmo nome em lugares diferentes) são exibidos como resultados distintos, diferenciados por região e país (R-03).
- Texto vazio ou composto só por espaços **não** dispara a busca; a tela mostra uma instrução, não um erro.
- Número mínimo de caracteres para disparar a busca: **[pendente OQ-05]**.
- Número máximo de resultados exibidos: **[pendente OQ-05]**.
- A busca é disparada ao enviar o formulário (tecla Enter ou botão "Buscar"). Busca automática durante a digitação, com debounce: **[pendente OQ-05]**.
- O usuário seleciona um resultado por clique/toque ou pelo teclado (Enter sobre a opção focada).

### RF-02 — Clima atual

Ao selecionar uma cidade, o app exibe o clima atual com os campos definidos em D-07:

| Campo | Unidade exibida | Sujeito ao toggle °C/°F |
|-------|-----------------|-------------------------|
| Temperatura | °C ou °F (conforme RF-04) | Sim |
| Condição (ex.: "céu limpo", "chuva moderada") | Texto em pt-BR | Não |
| Umidade relativa | % | Não |
| Vento (velocidade) | km/h (unidade proposta) | Não (AS-07) |
| Pressão atmosférica | hPa (unidade proposta) | Não |
| Precipitação | mm (unidade proposta) | Não |

- A sensação térmica **não** faz parte da v1 (D-07).
- Os códigos de condição do Open-Meteo (WMO) são traduzidos pelo próprio app para pt-BR. Lista e textos: **[pendente OQ-20]**.
- Indicação de "atualizado às HH:MM" e frequência de atualização: **[pendente OQ-18]**.
- Nome da cidade exibido junto ao clima, com região e país, para evitar confusão entre homônimos.

### RF-03 — Previsão de 5 dias

- O período é **hoje + 4 dias seguintes**, totalizando 5 dias (D-02).
- Formato: **horário**, com **24 horas por dia** (decisão do PM, resolve OQ-16 e OQ-03 quanto aos campos).
  - Campos por hora: **temperatura, condição e precipitação**. Temperatura segue a unidade de RF-04; precipitação segue AS-07 (mm).
  - Total esperado: 5 dias × 24 horas = 120 entradas por resposta.
- As datas e horários seguem o fuso da cidade pesquisada (AS-06, **[pendente OQ-13]**).
- A previsão aparece na mesma tela do clima atual, sem navegação para outra página (persona P-01).

### RF-04 — Alternar °C / °F

- O toggle altera **todas** as temperaturas exibidas (clima atual e previsão).
- Conversão: °F = °C × 9/5 + 32. Arredondamento para inteiro na exibição (proposta; ver AS-10).
- O padrão ao abrir o app é **Celsius** (D-03).
- A troca de unidade **não** dispara nova requisição à API; é uma conversão de exibição.
- Velocidade do vento acompanha o toggle? **[pendente OQ-13]**. Por padrão (AS-07), não acompanha.
- A preferência é mantida durante a sessão. Persistir entre sessões no navegador: **[pendente OQ-04]**.
- O controle é acessível por teclado e tem nome e estado anunciados (`aria-pressed` ou equivalente).

### RF-05 — Uso em dispositivos móveis

- Layout funcional de 320 px de largura até desktop, sem scroll horizontal.
- Alvos de toque com tamanho adequado (ver RNF-01).
- Lista de dispositivos, larguras mínimas e navegadores suportados: **[pendente OQ-08]**.
- Se "dispositivos móveis" significa web responsiva ou app instalável (PWA/nativo): **[pendente OQ-21]**.

### RF-06 — Estados de loading, erro e vazio

Aplica-se à busca, ao clima atual e à previsão. Cada um tem um estado explícito:

- **Loading:** indicador visível e anunciado a leitores de tela; o conteúdo anterior não fica enganoso.
- **Erro:** mensagem clara em pt-BR, sem jargão técnico (RNF-10), com ação de tentar novamente. Comportamento de retry e cache: **[pendente OQ-12]**.
- **Vazio:** mensagem explícita quando a busca não retorna resultados, ou quando não há dados a exibir.

### RF-07 — Estado inicial

- Ao abrir o app, nenhuma cidade está selecionada e a tela mostra o campo de busca com uma instrução.
- Cidade padrão ao abrir: **[pendente OQ-06]**. Esta especificação **não** assume cidade padrão.

---

## User Stories

Formato: "Como [persona], quero [ação] para [valor]".

| ID | História | Persona | Requisitos |
|----|----------|---------|------------|
| US-01 | Como viajante, quero buscar uma cidade pelo nome e distinguir homônimos, para escolher o lugar certo. | P-01 | RF-01 |
| US-02 | Como viajante, quero ver a previsão de 5 dias da cidade escolhida na mesma tela, para planejar a semana sem navegar. | P-01 | RF-03 |
| US-03 | Como pessoa com pouco tempo, quero ver o clima atual da cidade em poucos toques, para decidir o que vestir. | P-02 | RF-02 |
| US-04 | Como pessoa que consulta sempre a mesma cidade, quero não precisar buscá-la toda vez, para economizar tempo. | P-02 | RF-07. **Pendente OQ-06** (favoritos/histórico exigem nova decisão de persistência, ver D-04). |
| US-05 | Como usuário de teclado, quero buscar, selecionar cidade e alternar °C/°F sem mouse, para usar o app com autonomia. | P-03 | RF-01, RF-04 |
| US-06 | Como usuário de leitor de tela, quero que carregamento, erro e lista vazia sejam anunciados, para saber o que está acontecendo. | P-03 | RF-06 |
| US-07 | Como usuário, quero alternar entre °C e °F e ver todas as temperaturas mudarem juntas, para ler na unidade que prefiro. | P-01, P-02 | RF-04 |
| US-08 | Como usuário de celular, quero que o app caiba na tela e seja fácil de tocar, para usá-lo em movimento. | P-02, P-01 | RF-05 |
| US-09 | Como usuário, quero uma mensagem clara quando o serviço de clima estiver fora do ar, para entender o que fazer. | Todas | RF-06, RNF-05 |

---

## Acceptance Criteria

Critérios verificáveis, em formato Dado/Quando/Então. Cada critério deve virar pelo menos um teste (unit ou E2E).

### US-01 — Busca de cidades

- **AC-01.1** Dado que o campo de busca está vazio, quando o usuário clica em buscar ou pressiona Enter, então nenhuma requisição é feita e a tela mostra a instrução de digitação (sem mensagem de erro).
- **AC-01.2** Dado que o usuário digita um nome com resultados, quando a busca termina, então cada resultado mostra nome, região (se houver) e país.
- **AC-01.3** Dado que existem duas cidades com o mesmo nome em países diferentes, quando a busca termina, então as duas aparecem como itens distintos e são diferenciáveis pela região/país.
- **AC-01.4** Dado que a busca não retorna resultados, quando a resposta chega, então a tela mostra estado vazio com mensagem explícita.
- **AC-01.5** Dado que o usuário seleciona um resultado, quando a seleção ocorre, então o clima atual e a previsão dessa cidade são carregados.

### US-02 — Previsão de 5 dias

- **AC-02.1** Dado que uma cidade foi selecionada, quando a previsão é exibida, então ela contém exatamente 5 dias, começando por hoje na data local da cidade, com 24 entradas horárias por dia.
- **AC-02.2** Dado que a previsão está carregando, quando o usuário observa a seção, então vê indicador de loading anunciado a leitores de tela.
- **AC-02.3** Dado que a previsão foi carregada, quando uma hora é exibida, então mostra temperatura (na unidade ativa), condição e precipitação; campos ausentes seguem AC-03.2.

### US-03 — Clima atual

- **AC-03.1** Dado que uma cidade foi selecionada e a resposta chegou, então são exibidos temperatura, condição, umidade, vento, pressão e precipitação (RF-02).
- **AC-03.2** Dado que um campo vem ausente da API, quando o clima é exibido, então o campo mostra "não disponível" em vez de quebrar a tela ou exibir `undefined`/`null`.
- **AC-03.3** Dado um código de condição sem tradução conhecida, quando o clima é exibido, então a condição mostra um texto genérico em pt-BR (ex.: "Condição indisponível").

### US-04 — Cidade recorrente (pendente)

- **AC-04.1** Bloqueado por **[pendente OQ-06]**. Não há critério testável até a decisão sobre favoritos/histórico e sua persistência no navegador.

### US-05 — Teclado

- **AC-05.1** Dado que o foco está no campo de busca, quando o usuário usa Tab/Shift+Tab e setas, então consegue alcançar resultados, selecionar uma cidade e alcançar o toggle °C/°F sem mouse.
- **AC-05.2** Dado que um controle interativo (campo, botão, resultado ou toggle) está na tela, quando recebe foco por teclado, então exibe indicador de foco visível e tem nome acessível (label ou texto).
- **AC-05.3** Dado que uma ação está disponível por mouse ou toque, quando o usuário usa somente teclado, então a mesma ação é executada, sem depender de hover ou gesto.

### US-06 — Estados anunciados

- **AC-06.1** Dado que a aplicação entra em loading, erro ou vazio, quando o estado aparece, então a mensagem é anunciada por região viva (`aria-live` ou equivalente).
- **AC-06.2** Dado que uma mensagem de erro é exibida, quando o leitor de tela alcança o campo ou a região relevante, então a mensagem está associada a eles (ex.: `aria-describedby`) e a informação não depende só de cor.

### US-07 — Toggle °C / °F

- **AC-07.1** Dado que a unidade padrão é Celsius, quando o app abre e uma cidade é carregada, então as temperaturas aparecem em °C.
- **AC-07.2** Dado que o usuário alterna para °F, quando a troca ocorre, então todas as temperaturas do clima atual e da previsão são convertidas na mesma ação.
- **AC-07.3** Dado uma temperatura em °C, quando exibida em °F, então o valor segue °F = °C × 9/5 + 32 (ex.: 0 °C → 32 °F; 100 °C → 212 °F; −40 °C → −40 °F), arredondado conforme AS-10.
- **AC-07.4** Dado que uma cidade está carregada, quando o usuário alterna a unidade, então nenhuma nova requisição à API é feita (verificável em E2E pela ausência de nova chamada de rede).
- **AC-07.5** Dado que o usuário alterna a unidade, quando a troca ocorre, então velocidade do vento, pressão e precipitação permanecem com a mesma unidade e o mesmo valor (AS-07).

### US-08 — Mobile

- **AC-08.1** Dado viewport de 320 px com uma cidade carregada, quando a página é renderizada, então não há scroll horizontal.
- **AC-08.2** Dado um controle interativo em viewport mobile, quando medido, então sua área de toque tem no mínimo 44×44 px (RNF-01).
- **AC-08.3** Dado viewport mobile, quando o E2E executa busca, seleção de cidade e troca de unidade, então os três fluxos concluem sem erro.

### US-09 — Erro de serviço

- **AC-09.1** Dado que a API falha (rede, 5xx, timeout), quando a busca ou o clima é solicitado, então aparece mensagem de erro em pt-BR, sem jargão, e a aplicação continua funcional.
- **AC-09.2** Dado que o erro foi exibido, quando o usuário aciona o botão "Tentar novamente", então uma nova requisição é feita para o mesmo recurso (busca, clima ou previsão). Retry automático e número de tentativas: **[pendente OQ-12]**.
- **AC-09.3** Dado que a API falha de qualquer forma (rede, 5xx, timeout ou resposta inválida), quando a falha ocorre, então nenhuma exceção não tratada chega à tela e a mensagem de erro é exibida (verificável por teste simulando falha da API).

### Requisitos funcionais sem história direta

- **AC-RF07.1** Dado que o app acabou de abrir, quando a tela é renderizada, então nenhuma cidade está selecionada, o campo de busca está visível com instrução e nenhuma requisição à API é feita.
- **AC-RF06.1** Dado que o clima atual está carregando, quando o usuário observa o bloco, então vê indicador de loading anunciado por região viva.
- **AC-RF06.2** Dado que o clima atual falhou, quando o erro é exibido, então aparece mensagem em pt-BR com o botão "Tentar novamente".
- **AC-RF06.3** Dado que a previsão retornou sem dias, quando o bloco é exibido, então aparece estado vazio com mensagem explícita.
- **AC-RF03.1** Dado que a previsão de 5 dias falhou, quando o bloco é exibido, então aparece erro próprio e o clima atual continua visível (EC-08).

### Cobertura de RF → critérios de aceite

| RF | Critérios de aceite |
|----|---------------------|
| RF-01 | AC-01.1 a AC-01.5 |
| RF-02 | AC-03.1 a AC-03.3 |
| RF-03 | AC-02.1, AC-02.2, AC-RF03.1 (contrato final pendente em AC-02.3) |
| RF-04 | AC-07.1 a AC-07.5 |
| RF-05 | AC-08.1 a AC-08.3 |
| RF-06 | AC-01.4, AC-06.1, AC-06.2, AC-09.1, AC-09.2, AC-RF06.1 a AC-RF06.3 |
| RF-07 | AC-RF07.1 |

---

## Non-Functional Requirements

| ID | Requisito | Critério verificável | Status |
|----|-----------|----------------------|--------|
| RNF-01 | Mobile-first, de 320 px ao desktop, com alvos de toque adequados e sem scroll horizontal. | Alvos interativos com no mínimo 44×44 px (proposta, padrão WCAG 2.5.5). Sem scroll horizontal em 320 px. | Breakpoints finos: **[pendente OQ-08]** |
| RNF-02 | Acessibilidade: semântica HTML, labels, navegação por teclado e contraste adequado. | Sem violações críticas em varredura automatizada. Foco visível. Texto com contraste mínimo 4,5:1 (WCAG 2.1 AA). | WCAG 2.1 AA (decisão do PM; resolve OQ-09) |
| RNF-03 | Desempenho: carga inicial < 2 s em 4G típico; resultados de busca em até 1 s. | Medido no E2E com throttling de rede. | Metas preliminares: **[pendente OQ-11]** |
| RNF-04 | Testabilidade: conversão e serviços com testes unitários; fluxos principais com E2E. | Cobertura dos AC deste documento por testes. | Definido |
| RNF-05 | Resiliência: o app não quebra se o Open-Meteo estiver indisponível ou lento. | Teste com falha simulada (AC-09.1 e AC-09.3). Timeout definido e mensagem de erro exibida. | Retry e cache: **[pendente OQ-12]** |
| RNF-06 | Segurança e privacidade: nenhum segredo no código; sem geolocalização na v1. | Nenhuma chave ou token versionado. Nenhuma permissão de localização solicitada. | Analytics e consentimento: **[pendente OQ-22]** |
| RNF-07 | Compatibilidade de navegadores. | Matriz de navegadores definida e coberta por E2E. | **[pendente OQ-08]** |
| RNF-08 | Hospedagem como site estático. | Build gera artefato estático publicável sem servidor. | Alvo GitHub Pages e base path: **[pendente OQ-10]** |
| RNF-09 | Interface em pt-BR, sem i18n nesta versão. | Todos os textos de UI em pt-BR. | Definido (D-05) |
| RNF-10 | Mensagens de erro claras ao usuário, sem jargão técnico. | Nenhuma mensagem exibe código HTTP, stack trace ou termo técnico da API. | Definido |
| RNF-11 | Funcionamento sem rede ou instalável (PWA). | Comportamento offline definido. | **[pendente OQ-19]**. Não especificado nesta versão. |
| RNF-12 | Atualização de dados. | Dado exibido indica o horário da última atualização. | **[pendente OQ-18]** |

---

## Edge Cases

| ID | Cenário | Comportamento esperado |
|----|---------|------------------------|
| EC-01 | Busca vazia ou só com espaços. | Nenhuma requisição. Instrução na tela, sem erro. |
| EC-02 | Busca com caracteres especiais, acentos ou emojis (ex.: "São Paulo", "Ñandú", "😀"). | Acentos são tratados corretamente. Caracteres sem resultado geram estado vazio. Nenhum erro de script. |
| EC-03 | Nome muito longo (ex.: 500 caracteres). | O campo não aceita digitação além do tamanho máximo definido, e nenhuma requisição é feita com texto truncado. Nenhum quebra de layout. Valor do limite: **[pendente OQ-05]**. |
| EC-04 | Busca sem resultados. | Estado vazio com mensagem explícita (AC-01.4). |
| EC-05 | Homônimos (ex.: duas cidades "Santa Rosa"). | Todos os resultados aparecem, cada um com região e país (AC-01.3). |
| EC-06 | Duas buscas em sequência rápida. | A resposta da busca mais antiga **não** sobrescreve a mais recente. |
| EC-07 | Usuário troca de cidade enquanto a previsão da anterior carrega. | A resposta antiga é descartada. Só a cidade atualmente selecionada aparece. |
| EC-08 | Clima atual disponível, mas previsão falha (ou o inverso). | Cada bloco mostra seu próprio erro. O outro bloco continua exibido. |
| EC-09 | Timeout da API. | Após o tempo limite definido, estado de erro com opção de tentar novamente (RNF-05). Durante a espera, a interface não fica travada. Tempo limite: **[pendente OQ-12]**. |
| EC-10 | Sem conexão com a internet. | Mensagem de erro de conexão em pt-BR. Comportamento offline: **[pendente OQ-19]**. |
| EC-11 | API responde com erro 429 (limite de requisições) ou 5xx. | Mensagem genérica em pt-BR, sem código técnico (RNF-10). |
| EC-12 | Resposta malformada ou com campos ausentes. | Campos ausentes mostram "não disponível" (AC-03.2). Resposta inválida gera estado de erro, nunca tela quebrada. |
| EC-13 | Código de condição (WMO) desconhecido. | Texto genérico em pt-BR (AC-03.3). |
| EC-14 | Troca de unidade durante o carregamento. | A unidade é aplicada assim que os dados chegarem, sem perder a preferência. |
| EC-15 | Troca de unidade com dados em erro. | Nenhuma temperatura é exibida. A preferência é mantida para a próxima consulta. |
| EC-16 | Temperatura exatamente em −40 °C ou 0 °C. | Conversão correta (−40 °C = −40 °F; 0 °C = 32 °F). |
| EC-17 | Cidade em fuso diferente do usuário. | Datas e horários seguem o fuso da cidade (AS-06, OQ-13). |
| EC-18 | Viewport de 320 px com nome de cidade longo. | Texto quebra ou é reticenciado sem scroll horizontal. |
| EC-19 | Uso só com teclado em lista de resultados. | Foco segue a ordem visual. Esc fecha a lista de resultados e devolve o foco ao campo de busca (proposta). Nenhuma armadilha de foco. |
| EC-20 | Limite de requisições do Open-Meteo atingido em produção. | Mensagem de erro (EC-11). Tratamento de cota: **[pendente OQ-17]**. |

---

## Assumptions

| ID | Premissa | Invalidada por |
|----|----------|----------------|
| AS-01 | O app é uma SPA estática, sem backend próprio (D-04). | Necessidade de contas ou cache no servidor. |
| AS-02 | O Open-Meteo atende ao volume esperado sem chave de API. | **[OQ-17]**: limites e licença comercial. |
| AS-03 | Não há autenticação nem dados pessoais armazenados no servidor (D-04). | OQ-06, OQ-07, OQ-22. |
| AS-04 | A unidade padrão é Celsius (D-03). | Revisão pelo PM. |
| AS-05 | A previsão de 5 dias inclui o dia atual (D-02). | OQ-03. |
| AS-06 | Temperaturas e horários são exibidos no fuso da cidade pesquisada. | OQ-13. |
| AS-07 | O toggle converte apenas temperaturas. Vento, pressão e precipitação mantêm unidade fixa. | OQ-13. |
| AS-08 | A interface é em pt-BR (D-05). | Nova exigência de i18n. |
| AS-09 | Hospedagem em GitHub Pages. | OQ-10. |
| AS-10 | Temperaturas são exibidas arredondadas para inteiro, e a conversão é feita no cliente. Unidades de vento (km/h), pressão (hPa) e precipitação (mm) são propostas. | Confirmação pelo PM e pelo Plan (R-04). |
| AS-11 | Clima atual e previsão são obtidos a cada seleção de cidade, sem cache entre sessões. | OQ-12 e OQ-18. |

---

## Risks

| ID | Risco | Impacto | Probabilidade | Mitigação |
|----|-------|---------|---------------|-----------|
| R-01 | Dependência de API pública sem SLA (Open-Meteo). | Alto | Média | Isolar acesso em serviço dedicado, tratar erros e timeouts, avaliar cache (OQ-12). |
| R-02 | "Clima atual" e "5 dias" vagos geram retrabalho de UI e de contrato de dados. | Alto | Alta | Campos fechados (D-07, D-02) e previsão horária de 24 h/dia (decisão do PM). Mitigado. |
| R-03 | Homônimos na busca. | Médio | Alta | Região e país sempre exibidos (RF-01, AC-01.3). |
| R-04 | Arredondamento e local da conversão de unidades. | Médio | Média | Regra em AS-10, decisão final no Plan. |
| R-05 | Fuso horário incorreto na previsão. | Médio | Média | Regra em AS-06. Confirmar OQ-13. |
| R-06 | Desempenho em rede móvel lenta. | Médio | Média | Metas em RNF-03 (OQ-11) e medição no E2E. |
| R-07 | Contraste insuficiente no tema glassmorphism. | Médio | Média | Checagem de contraste antes do Review (RNF-02). |
| R-08 | Crescimento de escopo (favoritos, geolocalização, histórico, alertas). | Alto | Média | Lista explícita em Out of Scope. |
| R-09 | Licença comercial ou limites do Open-Meteo bloqueiam produção. | Alto | Média | Verificar OQ-17 antes do deploy. Avaliar provedor alternativo ou plano pago. |
| R-10 | Tradução inconsistente dos códigos WMO para pt-BR. | Baixo | Alta | Tabela única de mapeamento, coberta por teste unitário (OQ-20). |
| R-11 | Dado defasado exibido sem aviso. | Médio | Média | Horário de atualização visível (RNF-12, OQ-18). |
| R-12 | Respostas fora de ordem em buscas rápidas exibem cidade errada. | Médio | Média | EC-06 e EC-07. Descartar respostas obsoletas. |

---

## Rastreabilidade (User Story → AC → RNF)

| US | Persona | Requisitos funcionais | Critérios de aceite | RNF relevantes |
|----|---------|-----------------------|---------------------|----------------|
| US-01 | P-01 | RF-01 | AC-01.1 a AC-01.5 | RNF-02, RNF-03, RNF-09 |
| US-02 | P-01 | RF-03 | AC-02.1 a AC-02.3 | RNF-01, RNF-03 |
| US-03 | P-02 | RF-02 | AC-03.1 a AC-03.3 | RNF-03, RNF-10 |
| US-04 | P-02 | RF-07 | AC-04.1 (bloqueado por OQ-06) | RNF-06 |
| US-05 | P-03 | RF-01, RF-04 | AC-05.1 a AC-05.3 | RNF-02 |
| US-06 | P-03 | RF-06 | AC-06.1, AC-06.2, AC-RF06.1 | RNF-02, RNF-10 |
| US-07 | P-01, P-02 | RF-04 | AC-07.1 a AC-07.5 | RNF-02, RNF-04 |
| US-08 | P-01, P-02 | RF-05 | AC-08.1 a AC-08.3 | RNF-01, RNF-07 |
| US-09 | Todas | RF-06 | AC-09.1 a AC-09.3, AC-RF06.2 | RNF-05, RNF-10 |

Cobertura de testes: cada AC acima deve virar pelo menos um teste (unit ou E2E). AC-04.1 fica sem teste até OQ-06 ser respondida.

## Out of Scope

Explicitamente **fora** da v1:

- Geolocalização automática ou pedido de permissão de localização (D-06).
- Login, cadastro, contas de usuário (D-04).
- Persistência de dados no servidor (D-04).
- Backend próprio ou proxy de API (AS-01).
- Sensação térmica (D-07).
- Alertas e notificações push.
- Mapas, radar ou camadas meteorológicas.
- Previsão além de 5 dias.
- Internacionalização, interface em outros idiomas (D-05).
- Métricas de uso e analytics, até a resolução de **OQ-22**.
- Aplicativo nativo (iOS/Android). Se "mobile" for PWA, ver **OQ-21**.

> Itens que dependem de decisão (favoritos/histórico, cidade padrão, persistência da unidade no navegador, offline/PWA) **não** estão listados aqui. Estão em Open Questions e só entram no escopo após decisão.

---

## Open Questions

Nenhuma destas foi assumida como resposta. Itens com "Bloqueia" indicam o próximo passo travado.

| ID | Pergunta | Bloqueia | Estado |
|----|----------|----------|--------|
| OQ-03 | Início do período (hoje ou amanhã) e campos por dia. Início resolvido por D-02; campos resolvidos pela previsão horária (RF-03). | Plan | Resolvida |
| OQ-04 | A preferência °C/°F é lembrada entre sessões (ex.: `localStorage`)? | Plan | Parcial (D-03) |
| OQ-05 | Caracteres mínimos, número máximo de resultados, debounce, limite de tamanho e mensagens da busca. | Plan | Aberta |
| OQ-06 | Cidade padrão ao abrir? Favoritos ou histórico entram na v1? | Plan | Parcial (D-04) |
| OQ-07 | Geolocalização. | — | Resolvida para v1 (D-06). Reabrir se houver demanda. |
| OQ-08 | Dispositivos, larguras mínimas e navegadores suportados. | Plan (E2E) | Aberta |
| OQ-09 | Nível de acessibilidade exigido. | Review | Resolvida: WCAG 2.1 AA (RNF-02) |
| OQ-10 | Hospedagem e base path do build (GitHub Pages?). | Plan | Aberta (AS-09) |
| OQ-11 | Metas de desempenho medidas (LCP em 4G, tempo até primeiro resultado). | Review | Aberta |
| OQ-12 | Retry, cache e timeout em erro de rede ou API. | Plan | Aberta |
| OQ-13 | Horários no fuso da cidade ou do usuário? Vento acompanha o toggle? | Plan | Aberta (AS-06, AS-07) |
| OQ-14 | Perfil detalhado dos usuários e contexto de uso. | — | Aberta (personas são fictícias) |
| OQ-15 | Critérios de sucesso do negócio (métricas, prazo, público). | Release | Aberta |
| OQ-16 | Previsão de 5 dias: formato e horas por dia. | Plan (contrato de API) | Resolvida: horária, 24 h/dia, temperatura + condição + precipitação (RF-03) |
| OQ-17 | Uso comercial do Open-Meteo, atribuição obrigatória e limites diários. | **Produção** | Aberta |
| OQ-18 | Frequência de atualização do clima atual e exibição de "atualizado às HH:MM". | Plan | Aberta |
| OQ-19 | O app funciona offline ou é instalável (PWA)? O que mostrar sem rede? | Plan | Aberta |
| OQ-20 | Descrições de condição em pt-BR: lista e mapeamento dos códigos WMO. | Code | Aberta |
| OQ-21 | "Dispositivos móveis" = web responsiva ou app instalado (nativo/PWA)? | Plan | Aberta |
| OQ-22 | Haverá analytics? Consentimento e base legal (LGPD). | Release | Aberta |

---

## Checklist de qualidade da spec

- [x] Todas as seções obrigatórias presentes.
- [x] Toda funcionalidade tem critério de aceite verificável, ou está marcada como pendente de OQ.
- [x] Nenhum detalhe de implementação (componentes, hooks, estrutura de pastas) foi definido aqui.
- [x] Ambiguidades estão em Open Questions, não assumidas.
- [ ] Revisão pelo PM das suposições AS-10 e AS-11 e das OQs bloqueantes restantes (OQ-05, OQ-12, OQ-17, OQ-21).
