# P2.2 — Separar funcional de não-funcional

Revisão dos requisitos de [../discovery.md](../discovery.md).

## Classificação item a item

| ID | Classificação atual | Avaliação |
|----|---------------------|-----------|
| RF-01 | Funcional | Correto. |
| RF-02 | Funcional | Correto. |
| RF-03 | Funcional | Correto. |
| RF-04 | Funcional | Correto. |
| RF-05 | Funcional | Classificação incorreta. "Usar em dispositivos móveis" é um atributo de qualidade (usabilidade e responsividade). Deveria ser não-funcional, mesmo que RNF-01 já o cubra. Sugestão: mover para RNF e manter RF-05 apenas como "usuário consegue concluir o fluxo principal no celular". |
| RF-06 | Funcional | Correto. Estados de loading, erro e vazio são comportamento observável. |
| RNF-01 | Não-funcional | Correto. |
| RNF-02 | Não-funcional | Correto. |
| RNF-03 | Não-funcional | Correto. |
| RNF-04 | Não-funcional | Mistura requisito de qualidade com requisito de processo (testes). Pode ficar como restrição de engenharia. |
| RNF-05 | Não-funcional | Correto. |
| RNF-06 | Não-funcional | Correto. |
| RNF-07 | Não-funcional | Correto. |
| RNF-08 | Não-funcional | É uma restrição de implantação, não de qualidade. Pode ficar em uma seção de restrições. |
| RNF-09 | Não-funcional | É uma restrição de idioma. Pode ficar em restrições. Ver decisão D-05 em [../discovery.md](../discovery.md). |

## Requisitos não-funcionais que faltam

| Sugestão | Categoria | Critério proposto |
|----------|-----------|-------------------|
| Desempenho com metas numéricas | Performance | Primeiro resultado de busca em até 1 s em 4G. Clima atual visível em até 2 s após a seleção. Meta a validar com OQ-11. |
| Disponibilidade e degradação | Disponibilidade | Se a API estiver fora do ar, o app mostra mensagem de erro e permite nova tentativa, sem tela em branco. |
| Responsividade | Responsividade | Sem scroll horizontal de 320 px a 1440 px. Alvos de toque de pelo menos 44 px. |
| Contraste e navegação por teclado | Acessibilidade | Nível WCAG 2.1 AA para contraste e foco visível. Todos os controles operáveis por teclado. |
| Atualização do dado | Confiabilidade | Exibir horário da última atualização. Definir TTL de cache (OQ-18). |
| Atribuição de fonte | Conformidade | Exibir crédito do Open-Meteo conforme os termos de uso (OQ-17). |

## Resumo

Três itens precisam de reclassificação (RF-05, RNF-04 e RNF-08/09 como restrições). Seis requisitos não-funcionais novos cobrem performance, disponibilidade, responsividade, acessibilidade, atualização do dado e conformidade.
