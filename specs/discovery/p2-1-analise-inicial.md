# P2.1 — Análise inicial do briefing

> Gerado a partir apenas do briefing original, sem as decisões do P2.6.
> A versão consolidada e revisada está em [../discovery.md](../discovery.md).

## Briefing

"Sua empresa solicitou uma aplicação de previsão do tempo. Usuários devem poder: buscar cidades, ver o clima atual, ver a previsão de 5 dias, alternar entre Celsius e Fahrenheit e usar em dispositivos móveis."

## Contexto

Aplicação web de previsão do tempo, solicitada internamente. O público são usuários finais que consultam o clima de cidades específicas, principalmente pelo celular.

## Requisitos Funcionais

| ID | Requisito |
|----|-----------|
| RF-01 | Buscar cidades por nome. |
| RF-02 | Ver o clima atual da cidade selecionada. |
| RF-03 | Ver a previsão de 5 dias. |
| RF-04 | Alternar entre Celsius e Fahrenheit. |
| RF-05 | Usar a aplicação em dispositivos móveis. |

## Requisitos Não-Funcionais

| ID | Requisito |
|----|-----------|
| RNF-01 | Layout responsivo, utilizável em telas pequenas. |
| RNF-02 | Acessibilidade mínima (a definir o nível). |
| RNF-03 | Desempenho aceitável em rede móvel (a definir a meta). |
| RNF-04 | Disponibilidade e tratamento de falha da API externa (a definir). |

## Riscos

- Dependência de API externa sem garantia de disponibilidade.
- Escopo vago de "clima atual" e "5 dias" gerando retrabalho.
- Homônimos na busca de cidades.
- Crescimento de escopo.

## Perguntas em Aberto

- Quais campos compõem o clima atual?
- A previsão de 5 dias começa hoje ou amanhã?
- Qual a unidade padrão e a preferência é lembrada?
- Como a busca se comporta com resultados múltiplos ou nenhum resultado?
- O app é web responsivo ou app instalado?
- Qual a fonte de dados e quais são os termos de uso?

## Suposições

- Aplicação estática, sem backend próprio.
- Dados obtidos de API pública.
- Interface em português.
