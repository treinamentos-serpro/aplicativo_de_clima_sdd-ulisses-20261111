# Discovery — Aplicativo de Previsão do Tempo

## Contexto

A empresa solicitou um aplicativo de previsão do tempo. Os usuários devem poder:

- buscar cidades;
- ver o clima atual;
- ver a previsão de 5 dias;
- alternar entre Celsius e Fahrenheit;
- usar o app em dispositivos móveis.

Restrições já definidas nas instruções do projeto (não são ambiguidades):

- Dados via **Open-Meteo** (geocoding + forecast), sem API key.
- Stack: TypeScript strict, React + Vite, Tailwind (tema dark glassmorphism), Vitest + Testing Library, Playwright, pnpm, Biome.
- Estados de loading, erro e vazio são obrigatórios.
- Acessibilidade com roles/labels semânticos e suporte a teclado.

## Personas e Objetivos

Personas fictícias, derivadas do briefing. Devem ser validadas com o PM antes do Plan.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso (da perspectiva da persona) |
|---------|--------------------|-----------------|-----------------------------------------------|
| **P-01 — Rafael, viajante** | Planejar a semana ou uma viagem, consultando a previsão de 5 dias de uma cidade de destino. | Mobile, com frequência fora de casa; busca cidades que pode não conhecer. | Encontra a cidade certa na busca (sem confundir homônimos) e lê a previsão de 5 dias sem sair da tela. |
| **P-02 — Mariana, decidindo a roupa do dia** | Saber a temperatura atual da sua cidade antes de sair de casa. | Mobile, com pouco tempo, em movimento ou com uma mão ocupada. | Vê o clima atual da cidade em poucos toques, sem precisar buscar a cidade toda vez (ver OQ-11 para a meta de tempo). |
| **P-03 — Lucas, usuário que navega por teclado ou leitor de tela** | Consultar o clima com autonomia, sem depender de mouse ou de visão para cada elemento. | Desktop ou mobile, com teclado externo ou tecnologia assistiva. | Consegue buscar, selecionar uma cidade, ler o clima e alternar °C/°F apenas com teclado e leitor de tela, com labels e estados (loading, erro, vazio) anunciados. |

## Requisitos Funcionais

| ID | Requisito | Observação |
|----|-----------|------------|
| RF-01 | Buscar cidades por nome. | Resultados vêm do geocoding do Open-Meteo. Ver OQ-05. |
| RF-02 | Selecionar uma cidade e ver o clima atual (temperatura, condição, umidade, vento, pressão e precipitação). | Campos definidos na decisão D-07 (resolve OQ-02). |
| RF-03 | Ver a previsão de 5 dias da cidade selecionada. | Início do período não definido. Ver OQ-03. |
| RF-04 | Alternar entre °C e °F, aplicando a todas as temperaturas exibidas. | Persistência não definida. Ver OQ-04. |
| RF-05 | Usar o app em dispositivos móveis. | Dispositivos e breakpoints não definidos. Ver OQ-08. |
| RF-06 | Tratar estados de loading, erro e lista vazia na busca, no clima atual e na previsão. | Derivado das instruções do projeto. |

## Requisitos Não-Funcionais

| ID | Requisito | Status |
|----|-----------|--------|
| RNF-01 | Mobile-first: funcional de 320 px a desktop, com alvos de toque adequados e sem scroll horizontal. | Breakpoints finos ainda a definir (OQ-08). |
| RNF-02 | Acessibilidade: semântica HTML, labels, navegação por teclado e contraste adequado no tema glassmorphism. | Nível WCAG não definido (OQ-09). |
| RNF-03 | Desempenho: carga inicial < 2 s em conexão 4G típica; resultados de busca exibidos em até 1 s. | Metas preliminares. Validar com OQ-11. |
| RNF-04 | Testabilidade: lógica de conversão e serviços com testes unitários (Vitest); fluxos principais com E2E (Playwright). | Derivado das instruções do projeto. |
| RNF-05 | Resiliência: o app não quebra se o Open-Meteo estiver indisponível ou lento. | Comportamento de retry/cache não definido (OQ-12). |
| RNF-06 | Segurança e privacidade: nenhum segredo no código. Se houver geolocalização, pedir consentimento. | Geolocalização fora do briefing (OQ-07). |
| RNF-07 | Compatibilidade de navegadores. | Não definida (OQ-08). |
| RNF-08 | Hospedagem como site estático. | Presumido GitHub Pages pelo workflow `pages.yml`. Confirmar (OQ-10). |
| RNF-09 | Interface em pt-BR, conforme as convenções do projeto. | Decidido: pt-BR, sem i18n nesta versão (D-05, resolve OQ-01). |
| RNF-10 | Observabilidade básica: mensagens de erro claras ao usuário, sem jargão técnico. | Complementa RF-06 (estados de erro). |

## Riscos

| ID | Risco | Impacto | Probabilidade | Mitigação proposta |
|----|-------|---------|---------------|--------------------|
| R-01 | Dependência de API pública sem SLA garantido (Open-Meteo). | Alto | Média | Isolar o acesso em `src/services/`, tratar erros e avaliar cache. |
| R-02 | "Clima atual" e "5 dias" vagos geram retrabalho de UI e de contrato de dados. | Alto | Alta | Responder OQ-02 e OQ-03 antes do Plan. |
| R-03 | Homônimos na busca (cidades com o mesmo nome em países diferentes). | Médio | Alta | Exibir país/região nos resultados (confirmar em OQ-05). |
| R-04 | Conversão de unidades: arredondamento e local da conversão (cliente ou parâmetro da API). | Médio | Média | Decidir no Plan e definir regra de arredondamento. |
| R-05 | Fuso horário: previsão no horário da cidade ou do usuário. | Médio | Média | Definir regra (OQ-13). Open-Meteo oferece `timezone=auto`. |
| R-06 | Desempenho em rede móvel lenta. | Médio | Média | Definir metas (OQ-11) e medir no E2E. |
| R-07 | Contraste insuficiente no tema glassmorphism. | Médio | Média | Validar contraste antes do Review. |
| R-08 | Crescimento de escopo (favoritos, geolocalização, histórico, alertas). | Alto | Média | Lista explícita de "fora de escopo" na Spec. |

## Perguntas em Aberto (Open Questions)

Nenhuma destas respostas foi assumida. Cada uma depende de decisão do negócio ou do time.

| ID | Pergunta | Por que importa |
|----|----------|-----------------|
| OQ-01 | A interface será apenas em pt-BR ou precisa de internacionalização? | Afeta a estrutura de textos desde o início. |
| OQ-02 | Quais campos compõem o "clima atual"? (temperatura, sensação térmica, umidade, vento, pressão, condição) | Define contrato de dados e UI. |
| OQ-03 | A previsão de 5 dias começa hoje ou amanhã? Quais campos aparecem por dia? | Define intervalo da API e UI. |
| OQ-04 | Qual a unidade padrão ao abrir? A preferência °C/°F deve ser lembrada entre sessões? | Afeta estado global e primeira visita. |
| OQ-05 | Comportamento da busca: caracteres mínimos, número de resultados, debounce, mensagem sem resultados, desambiguação de homônimos. | Afeta UX e critérios de aceite. |
| OQ-06 | Existe cidade padrão ao abrir? Histórico ou favoritos entram no escopo? | Define estado inicial e escopo. |
| OQ-07 | Geolocalização do usuário está no escopo? | Traz questões de privacidade e permissão. |
| OQ-08 | Quais dispositivos, larguras mínimas e navegadores são suportados? | Define breakpoints e matriz E2E. |
| OQ-09 | Qual nível de acessibilidade é exigido (ex.: WCAG 2.1 AA)? | Define checklist de a11y no Review. |
| OQ-10 | Onde o app será hospedado? GitHub Pages é o alvo? | Afeta build e base path do Vite. |
| OQ-11 | Metas de desempenho (ex.: tempo até o primeiro resultado de busca, LCP em 4G)? | Define orçamento de performance. |
| OQ-12 | Reação a erro de rede ou API fora do ar: mensagem, nova tentativa, cache? | Define estados de erro. |
| OQ-13 | Horários no fuso da cidade ou do usuário? Velocidade do vento acompanha o toggle (km/h ↔ mph)? | Afeta formatação e escopo do toggle. |
| OQ-14 | Quem são os usuários e em que contexto usam o app? | Orienta prioridades de UX. |
| OQ-15 | Critérios de sucesso do negócio (métricas, prazo, público)? | Define o que é "pronto". |

### Lacunas adicionais (revisão de PM cético — P2.3)

Lacunas que não estão cobertas pelas OQs acima. Cada uma informa o impacto de seguir sem resposta.

| ID | Pergunta em aberto | Impacto se ficar sem resposta |
|----|--------------------|-------------------------------|
| OQ-16 | A previsão de 5 dias é diária (máx/mín + condição) ou horária? Se horária, quantas horas por dia são exibidas? | Sem definição, não há contrato de API (`daily` vs `hourly`) nem layout. Alto risco de refazer UI e testes E2E. |
| OQ-17 | O uso do Open-Meteo é comercial? Há exigência de atribuição e limite de requisições por dia? | Possível violação de licença de uso do provedor. Pode exigir plano pago ou chave, o que contradiz AS-02. Risco de bloqueio em produção. |
| OQ-18 | Qual a frequência de atualização do clima atual e o app deve mostrar "atualizado às HH:MM"? | Usuário pode ver dado defasado sem perceber. TTL de cache e critérios de aceite de "dado atual" ficam indefinidos. |
| OQ-19 | O app deve funcionar offline ou ser instalável (PWA)? Se sim, o que é exibido sem rede? | Sem resposta, o comportamento sem conexão fica indefinido. Service worker e estratégia de cache não podem ser planejados. |
| OQ-20 | As descrições de condição ("chuva moderada", "céu limpo") são em pt-BR? O mapeamento dos códigos WMO é feito por nós? | Textos sem tradução ou traduzidos de forma inconsistente quebram o padrão pt-BR (AS-08) e geram testes frágeis. |
| OQ-21 | "Dispositivos móveis" significa web responsiva ou app instalado (nativo/PWA)? | Escolha que muda arquitetura, distribuição e critérios de aceite. Erro aqui gera retrabalho grande, não de UI. |
| OQ-22 | Haverá coleta de métricas de uso (analytics)? Se houver, há consentimento e base legal (LGPD)? | Risco de coletar dados pessoais sem base legal. Também impede definir métricas de sucesso (OQ-15). |

## Suposições (Assumptions)

Suposições são premissas de trabalho para avançar. Cada uma pode ser invalidada por uma open question.

| ID | Suposição | Invalidada por |
|----|-----------|----------------|
| AS-01 | O app é um SPA estático, sem backend próprio. | Necessidade de contas ou cache server-side. |
| AS-02 | Open-Meteo atende ao volume esperado sem chave de API. | Limites de uso definidos pelo provedor ou OQ-11. |
| AS-03 | Não há autenticação nem dados pessoais armazenados. | OQ-06 e OQ-07. |
| AS-04 | A unidade padrão é Celsius. | OQ-04. |
| AS-05 | A previsão de 5 dias inclui o dia atual. | OQ-03. |
| AS-06 | Temperaturas são exibidas no fuso da cidade pesquisada. | OQ-13. |
| AS-07 | Alternar a unidade converte apenas temperaturas; velocidade do vento e precipitação mantêm unidade fixa. | OQ-13. |
| AS-08 | A interface é em pt-BR. | OQ-01. |
| AS-09 | Hospedagem em GitHub Pages. | OQ-10. |

## Decisões

Decisões tomadas para destravar a especificação. Cada uma confirma ou substitui uma suposição e fecha, total ou parcialmente, uma open question.

| ID | Decisão | Justificativa | Resolve | O que continua em aberto |
|----|---------|---------------|---------|--------------------------|
| D-01 | Fonte de dados: **Open-Meteo**, sem API key (geocoding + forecast). | Já definida nas instruções do projeto. Dispensa gestão de chave e qualquer backend próprio. | Confirma AS-01 e AS-02 (provisoriamente). | OQ-17 (licença comercial, atribuição e limites de requisições) **não está resolvida**. Pode exigir plano pago ou chave, o que contradiz AS-02. Precisa de verificação antes de produção. |
| D-02 | "5 dias" = **hoje + 4 dias seguintes**. | Mostra o dia corrente sem perder contexto e mantém o intervalo de 5 dias pedido. | Confirma AS-05. Resolve parcialmente OQ-03 (intervalo). | Campos por dia e formato diário ou horário seguem em aberto (OQ-03, OQ-16). |
| D-03 | Unidade padrão: **Celsius**. | Padrão adotado pelo público-alvo pt-BR e pelo sistema métrico. | Confirma AS-04. Resolve parcialmente OQ-04 (unidade padrão ao abrir). | Se a preferência °C/°F é lembrada entre sessões ainda não foi decidido. "Sem persistência de servidor" não responde se há persistência no navegador. |
| D-04 | **Sem autenticação e sem persistência de servidor.** | Mantém o app como SPA estático (AS-01) e sem dados pessoais armazenados no servidor (AS-03). Reduz a exposição à LGPD. | Confirma AS-01 e AS-03. Resolve parcialmente OQ-06 (sem favoritos ou histórico no servidor). | OQ-07 (geolocalização) e OQ-22 (analytics e consentimento) continuam abertas. Favoritos ou histórico no `localStorage` exigem nova decisão. |
| D-05 | **Idioma da UI: pt-BR.** | Público-alvo brasileiro. Mantém a suposição de interface em pt-BR. | Confirma AS-08. Resolve OQ-01 (sem internacionalização nesta versão). | Consequência assumida: os textos de condição (códigos WMO) serão mapeados e traduzidos pelo próprio app. Esse mapeamento (OQ-20) será detalhado na spec. |
| D-06 | **Sem geolocalização automática na v1.** Seleção de cidade é sempre manual. | Evita permissões de localização e questões de privacidade no MVP. Pode virar melhoria futura. | Resolve OQ-07 para a v1. | Reabrir se houver demanda por geolocalização. |
| D-07 | **Campos do clima atual:** temperatura, condição, umidade, vento, pressão e precipitação. | Cobre o que o usuário pediu em "clima atual" sem ampliar o contrato de dados. | Resolve OQ-02. | Sensação térmica fica fora da v1, conforme a lista aprovada. |

### Pendências que as decisões não resolvem

- **OQ-17** (licença e limites do Open-Meteo): bloqueante para produção.
- **OQ-16** (previsão diária ou horária): necessária antes do contrato de API.
- **OQ-07** (geolocalização) e **OQ-22** (analytics): dependem de decisão de privacidade.
