# P2.7 — Auto-crítica do discovery

Crítica de [../discovery.md](../discovery.md), como um arquiteto de soluções.

## O que ainda está vago

- **Contrato de clima atual (OQ-02):** sem lista de campos, não há modelo de dados nem componente de UI definido.
- **Granularidade da previsão (OQ-16):** "5 dias" pode ser diário ou horário. As duas opções geram APIs e layouts diferentes.
- **Comportamento da busca (OQ-05):** sem regra para caracteres mínimos, resultados vazios e homônimos, a spec não tem critérios de aceite testáveis.
- **"Dispositivos móveis" (OQ-21):** web responsiva e PWA levam a arquiteturas diferentes. Ainda não está decidido.
- **Metas não numéricas (RNF-03, OQ-11):** "desempenho aceitável" não é verificável.

## O que pode gerar retrabalho

- **Licença do provedor (OQ-17):** se o uso for comercial, a troca de fonte afeta a camada de serviços e os testes.
- **Persistência da unidade (OQ-04):** decidir depois que o estado é global muda o hook de preferências e os testes E2E.
- **Fuso horário e vento (OQ-13):** afetam formatação e o escopo do toggle. Mudar depois toca em vários componentes.
- **Cache e offline (OQ-18, OQ-19):** são decisões de arquitetura. Adicionar depois exige service worker e nova estratégia de dados.

## O que falta para começar a spec com segurança

1. Fechar OQ-02, OQ-03 e OQ-16. Sem isso, o contrato de API não existe.
2. Confirmar a licença do Open-Meteo (OQ-17). É bloqueante para produção.
3. Decidir se é web responsivo ou PWA (OQ-21).
4. Definir os critérios de aceite da busca (OQ-05), com números.
5. Transformar "desempenho" e "acessibilidade" em metas numéricas (OQ-09, OQ-11).

## Veredito

As decisões D-01 a D-05 destravam a arquitetura básica. Antes de escrever a spec, ainda faltam os itens 1 a 3 acima. Os itens 4 e 5 podem entrar na spec como premissas, desde que marcados como pendentes.
