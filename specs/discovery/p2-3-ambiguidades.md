# P2.3 — Ambiguidades e lacunas (PM cético)

Lista de ambiguidades do briefing, cada uma com pergunta em aberto e impacto de seguir sem resposta. A tabela completa com IDs está em [../discovery.md](../discovery.md), seção "Perguntas em Aberto".

## Lacunas de escopo

| Ambiguidade | Pergunta em aberto | Impacto se ficar sem resposta |
|-------------|--------------------|-------------------------------|
| "Clima atual" não define campos. | Temperatura, sensação térmica, umidade, vento, pressão e condição? | Contrato de dados e layout indefinidos. |
| "5 dias" não define início. | Começa hoje ou amanhã? Diário ou horário? | Contrato da API (`daily` ou `hourly`) indefinido. Alto risco de refazer UI e testes. |
| Unidade não define persistência. | A preferência °C/°F é lembrada entre sessões? | Estado global e primeira visita indefinidos. |
| "Buscar cidades" não define comportamento. | Quantos caracteres mínimos? Quantos resultados? Debounce? Mensagem de vazio? | Critérios de aceite incompletos. |
| Homônimos não tratados. | Como diferenciar cidades com o mesmo nome? | Usuário escolhe a cidade errada. |
| Não há cidade padrão nem histórico. | Abre em qual cidade? Favoritos entram no escopo? | Estado inicial e escopo indefinidos. |
| Geolocalização não citada. | Entra no escopo? | Questões de privacidade e permissão. |

## Lacunas técnicas e de plataforma

| Ambiguidade | Pergunta em aberto | Impacto se ficar sem resposta |
|-------------|--------------------|-------------------------------|
| "Dispositivos móveis" é vago. | Web responsiva ou app instalado (PWA ou nativo)? | Muda arquitetura, distribuição e critérios de aceite. |
| Navegadores e larguras não definidos. | Quais são suportados e em que largura mínima? | Breakpoints e matriz E2E indefinidos. |
| Hospedagem não confirmada. | GitHub Pages? | Build e base path do Vite podem quebrar. |
| Offline não citado. | O app funciona sem rede? | Service worker e cache não podem ser planejados. |
| Erro de rede não definido. | Mensagem, nova tentativa ou cache? | Estados de erro indefinidos. |

## Lacunas de negócio, dados e conformidade

| Ambiguidade | Pergunta em aberto | Impacto se ficar sem resposta |
|-------------|--------------------|-------------------------------|
| Uso do provedor não verificado. | O uso é comercial? Há atribuição e limite diário? | Possível violação de licença e bloqueio em produção. |
| Atualização não definida. | Frequência do clima atual? Mostrar "atualizado às HH:MM"? | Usuário vê dado defasado sem perceber. |
| Fuso horário e unidades secundárias. | Horários no fuso da cidade ou do usuário? Vento acompanha o toggle? | Formatação e escopo do toggle indefinidos. |
| Condições em texto. | Descrições em pt-BR? Mapeamento dos códigos WMO é nosso? | Textos inconsistentes e testes frágeis. |
| Métricas e acessibilidade sem meta. | Qual métrica de sucesso? Qual nível WCAG? Metas de desempenho? | Não há "pronto" verificável. |
| Analytics sem base legal. | Haverá coleta de métricas? Há consentimento (LGPD)? | Risco de coletar dado pessoal sem base legal. |

## Observação

As 22 perguntas (OQ-01 a OQ-22) já estão numeradas no discovery consolidado. Este arquivo apenas as reagrupa por tipo de lacuna.
