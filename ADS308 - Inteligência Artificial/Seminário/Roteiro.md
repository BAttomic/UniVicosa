# Roteiro de Apresentação — Cidades Conectadas (Tema 5)
**Grupo 5 · Seminário ADS308 · ~30 min · 25 slides**

> Cada integrante apresenta um bloco (~5 min). Todos falam — a banca direciona perguntas a quem falou menos, então **respeitem o tempo de cada um**.
> Avise o próximo: ao terminar, passe a palavra ("agora o Bernardo vai falar sobre...").

| # | Integrante | Bloco | Slides | Tempo |
|---|-----------|-------|--------|-------|
| 1 | **Antônio** | Abertura & contexto | 1–4 | 5 min |
| 2 | **Bernardo** | Busca & otimização de rotas | 5–9 | 5 min |
| 3 | **Diego** | Consumo de modelos via APIs | 10–13 | 5 min |
| 4 | **Edson** | Dados temporais & previsão | 14–17 | 5 min |
| 5 | **Kayo** | Estudo de caso | 18–21 | 5 min |
| 6 | **Matheus** | Cisnes negros, conclusão & perguntas | 22–25 | 5 min |

---

## Bloco 1 — Antônio · Abertura & Contexto (slides 1–4) · ~5 min

**Slide 1 — Capa** *(~30s)*
- Cumprimente a banca. "Somos o Grupo 5 e nosso tema é Logística e Cidades Inteligentes."
- Apresente os 6 integrantes rapidamente.

**Slide 2 — Roteiro** *(~45s)*
- Mostre os 6 blocos e diga que cada um de vocês cobre uma parte.
- "São 3 tópicos técnicos, um estudo de caso real e uma discussão crítica no final."

**Slide 3 — O desafio da última milha** *(~1min30)*
- Explique o que é "última milha": o trecho final da entrega, da central até a porta do cliente.
- Ponto-chave: é a etapa **mais cara** — pode ser ~50% do custo logístico.
- Por quê? Muitas paradas, janelas de horário, trânsito imprevisível.
- A cidade gera dados (GPS, sensores, apps) → é matéria-prima para a IA.

**Slide 4 — Do dado urbano à decisão** *(~2min)*
- Apresente o pipeline (coleta → dados temporais → modelo → API → ação).
- **Esta é a ponte da apresentação**: cada etapa é um dos 3 tópicos obrigatórios.
- Termine apresentando os 3 cards (busca/otimização, APIs, dados temporais) e passe para o Bernardo.

---

## Bloco 2 — Bernardo · Busca & Otimização (slides 5–9) · ~5 min

**Slide 5 — Divisor "Tópico 1"** *(~15s)*
- "Meu bloco é sobre como a IA encontra o melhor caminho — e por que é difícil."

**Slide 6 — TSP & VRP (interativo)** *(~1min30)*
- **TSP** (Caixeiro Viajante): 1 veículo, visitar cada ponto uma vez, voltar à origem, menor rota.
- **VRP** (Roteamento de Veículos): frota inteira, com capacidade e janelas de horário — o problema real.
- **Demo:** clique no `+` aumentando *n* e mostre a explosão: com ~15 paradas já são bilhões de rotas; mostre o tempo de "força bruta".
- Conclusão: testar tudo é inviável → precisamos de algoritmos espertos.

**Slide 7 — BFS, Dijkstra e A\* (interativo)** *(~1min30)*
- **BFS**: sem peso, menor número de passos.
- **Dijkstra**: com peso (tempo/distância), menor custo.
- **A\***: Dijkstra + heurística `f = g + h` — *g* = custo já percorrido, *h* = estimativa até o destino (linha reta). É o que roda no GPS.
- **Demo (ruas reais de Viçosa, UniViçosa → Igreja de Fátima):** clique nos botões **BFS**, **Dijkstra** e **A\*** — os pontinhos mostram, ao vivo, os nós que cada algoritmo explora até achar a rota. Compare os números que aparecem:
  - **BFS** explora ~1000 nós e acha um caminho mais longo (~6,0 km) — ignora a distância, conta só "saltos".
  - **Dijkstra** explora ~870 nós e acha o caminho ótimo (~5,4 km).
  - **A\*** acha o **mesmo** caminho ótimo (~5,4 km) explorando só ~320 nós — a heurística "puxa" a busca na direção do destino.
- Frase de efeito: "Os três acham um caminho; o A* só trabalha menos para isso."
- *Obs.: o grafo das ruas está embutido no arquivo (OpenStreetMap) — funciona offline e no PDF.*

**Slide 8 — Metaheurísticas** *(~1min)*
- Quando achar o ótimo é caro, usamos métodos que dão soluções **muito boas em segundos**.
- Cite os 3 rapidamente: Genéticos (população evolui), Têmpera Simulada (aceita pioras e "esfria"), Colônia de Formigas (feromônio).
- Mencione o 2-opt como gancho para a demo.

**Slide 9 — Otimizador ao vivo (interativo)** *(~45s)*
- **Demo:** "Embaralhar pontos" → "Otimizar rota". Mostre o % de redução.
- Conecte com drones: rota 3D, bateria, zonas de exclusão aérea. Passe para o Diego.

---

## Bloco 3 — Diego · APIs (slides 10–13) · ~5 min

**Slide 10 — Divisor "Tópico 2"** *(~15s)*
- "Tenho um modelo treinado. Como o resto da cidade usa ele? Resposta: API."

**Slide 11 — Do modelo ao serviço** *(~1min30)*
- Diferença **treino (offline, pesado)** × **inferência (online, tempo real)**.
- Por que API: desacoplamento (o app não precisa entender o modelo), reuso/escala, atualização sem quebrar clientes.
- Padrão técnico: REST sobre HTTP, JSON, GET/POST, códigos 200/4xx/5xx.

**Slide 12 — Anatomia de uma requisição (interativo)** *(~1min30)*
- **Demo:** clique "Enviar requisição" → acompanhe app → gateway → modelo → tráfego.
- Mostre o JSON: a requisição (origem, paradas, transporte) e a resposta (ETA, distância, rota).
- "É literalmente uma pergunta e uma resposta pela rede."

**Slide 13 — O que existe por trás** *(~1min45)*
- Gateway + balanceador (escala), rate limiting e autenticação (segurança).
- Tempo real: filas (Kafka), cache para cortar latência.
- MLOps: modelo versionado (/v1, /v2), testes A/B, monitor de **drift**.
- Métricas: latência p95/p99, throughput. APIs reais: Google Directions/Distance Matrix, OpenRouteService. Passe para o Edson.

---

## Bloco 4 — Edson · Dados Temporais (slides 14–17) · ~5 min

**Slide 14 — Divisor "Tópico 3"** *(~15s)*
- "Para otimizar a rota, primeiro precisamos prever **onde e quando** haverá procura."

**Slide 15 — Componentes da série temporal** *(~1min30)*
- Toda série se decompõe em: **tendência** (longo prazo), **sazonalidade** (pico do almoço, fim de semana), **ciclo** (ondas longas) e **ruído** (aleatório).
- Decomposição aditiva vs multiplicativa (1 frase).

**Slide 16 — Estatística descritiva** *(~1min30)*
- Tendência central (média, mediana, moda), dispersão (desvio-padrão, IQR), extremos (picos/outliers), autocorrelação.
- Ponto forte: **por que a mediana importa** — um dia de promoção puxa a média e engana a frota; a mediana resiste.

**Slide 17 — Prevendo a procura (interativo)** *(~1min45)*
- **Demo:** passe o mouse nos pontos (mostra pedidos), clique "Tendência" e "Prever próximo período".
- Modelos: médias móveis (SMA/EWMA), ARIMA/SARIMA, Prophet. Erro: MAE/RMSE/MAPE.
- Objetivo: posicionar a frota **antes** da demanda. Passe para o Kayo.

---

## Bloco 5 — Kayo · Estudo de Caso (slides 18–21) · ~5 min

**Slide 18 — Divisor "Estudo de caso"** *(~15s)*
- "Agora juntando tudo no mundo real: dois casos."

**Slide 19 — Amazon Prime Air** *(~1min45)*
- Entrega por drone (MK30), até ~30 min, pacotes leves.
- Rota 3D + sense-and-avoid (visão computacional desvia de obstáculos).
- Autonomia: peso e vento entram no cálculo de bateria.
- Regulação do espaço aéreo (FAA).
- Diga **quais tópicos aparecem**: busca/otimização + dados de sensores.

**Slide 20 — Google Maps / Waze** *(~1min45)*
- Milhões de celulares = sensor coletivo de trânsito em tempo real.
- ETA preditivo (ML), reroteamento dinâmico, Distance Matrix API.
- Efeito de rede: mais usuários → dados melhores.
- Tópicos: APIs + dados temporais + busca.

**Slide 21 — Síntese** *(~1min15)*
- Use a tabela: mostre os 3 tópicos aparecendo nos 2 casos.
- "Mundos diferentes, mesmos três pilares." Passe para o Matheus.

---

## Bloco 6 — Matheus · Crítica, Conclusão & Perguntas (slides 22–25) · ~5 min

**Slide 22 — Pergunta provocativa (interativo)** *(~1min30)*
- Leia a pergunta: como lidar com **cisnes negros** que o modelo nunca viu?
- **Demo:** clique "Injetar evento imprevisto" — a previsão segue plana, mas o evento sai da curva.
- Explique: fora da distribuição dos dados, o modelo erra com confiança.

**Slide 23 — Como lidar com o cisne negro** *(~2min)* — *coração da análise crítica (20% da nota)*
- **Detecção de anomalias**: reconhecer "isto está fora do normal" mesmo sem prever o evento.
- **Contingência/fallback**: regras seguras quando o modelo perde confiança — degradar com elegância.
- **Humano no circuito**: decisões críticas voltam para a pessoa; a IA assiste.
- **Reaprender**: o evento raro vira dado de treino.
- Frase de efeito: "Robustez é projetar para o erro, não fingir que ele não existe."

**Slide 24 — Conclusão** *(~1min)*
- Recapitule os 3 pilares: busca/otimização, APIs, dados temporais.
- Mensagem final: a IA otimiza a cidade, mas precisa de supervisão para o imprevisto.

**Slide 25 — Obrigado / Perguntas** *(~30s + Q&A)*
- Agradeça e abra para perguntas.
- **Importante (regra do professor):** as perguntas vão preferencialmente a quem falou menos. Combinem antes quem responde o quê, e deixem os que falaram menos no bloco assumirem as respostas técnicas.

---

## Checklist final
- [ ] Apresentar em **tela cheia** (tecla `F`) e navegar com as **setas** do teclado.
- [ ] Testar os botões interativos antes (otimizar rota, enviar requisição, prever, cisne negro).
- [ ] Ensaiar o tempo: 5 min por pessoa, cronometrado. Mínimo total = 30 min.
- [ ] **Entrega:** exportar para **PDF** (Ctrl+P → "Salvar como PDF") e enviar no sistema até **03/06 às 20:15** — independente do dia da apresentação (24/06).
