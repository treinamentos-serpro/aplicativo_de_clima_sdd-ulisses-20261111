# P2.4 — Mapa de riscos

Riscos técnicos e de produto do Weather App. Probabilidade e impacto em baixa, média ou alta.

| ID | Risco | Tipo | Probabilidade | Impacto | Estratégia de mitigação |
|----|-------|------|---------------|---------|-------------------------|
| R-01 | Open-Meteo indisponível ou lento. Não há SLA garantido. | Técnico | Média | Alta | Isolar acesso em `src/services/`. Tratar erro e timeout. Mostrar estado de erro com nova tentativa. |
| R-02 | Uso comercial sem licença adequada. Pode exigir plano pago ou chave. | Produto e legal | Média | Alta | Verificar os termos de uso (OQ-17) antes de produção. Deixar o provedor atrás de uma interface para trocá-lo. |
| R-03 | Limite de requisições por dia atingido. | Técnico | Média | Média | Cache com TTL definido (OQ-18). Evitar buscas a cada tecla (debounce). |
| R-04 | Escopo vago de "clima atual" e "5 dias" gera retrabalho de API e UI. | Produto | Alta | Alta | Fechar OQ-02, OQ-03 e OQ-16 antes do Plan. |
| R-05 | Homônimos na busca levam à cidade errada. | Produto | Alta | Média | Exibir país e região nos resultados. |
| R-06 | Conversão de unidades com arredondamento inconsistente. | Técnico | Média | Média | Regra de arredondamento única em função pura, com teste unitário. |
| R-07 | Fuso horário errado nos horários da previsão. | Técnico | Média | Média | Usar `timezone=auto` do Open-Meteo e definir regra (OQ-13). |
| R-08 | Desempenho ruim em rede móvel lenta. | Técnico | Média | Média | Definir metas (OQ-11). Medir no E2E. Carregar só o necessário. |
| R-09 | Contraste insuficiente no tema glassmorphism. | Produto (a11y) | Média | Média | Checar contraste em todos os estados. Validar no Review. |
| R-10 | Crescimento de escopo (favoritos, geolocalização, alertas, histórico). | Produto | Média | Alta | Lista explícita de "fora de escopo" na Spec. |
| R-11 | Violação de privacidade com analytics ou geolocalização. | Legal | Baixa | Alta | Não coletar dados sem consentimento e base legal (OQ-22). |
| R-12 | Textos de condição fora do padrão pt-BR. | Produto | Média | Baixa | Dicionário próprio de códigos WMO em pt-BR (OQ-20). |

## Leitura rápida

- **Alto impacto e alta probabilidade:** R-04 (escopo vago) e R-05 (homônimos) são os mais urgentes.
- **Alto impacto, probabilidade média:** R-01 e R-02 dependem diretamente da fonte de dados. Ambos ficam em aberto nas decisões D-01 e OQ-17.
