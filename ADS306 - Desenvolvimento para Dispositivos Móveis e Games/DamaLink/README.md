<p align="center">
  <img src="assets/icon.png" width="110" alt="DamaLink"/>
</p>

<h1 align="center">DamaLink</h1>

<p align="center">
  App mobile híbrido: <b>utilitário de câmbio</b> (cotações em tempo real) + <b>jogo de damas 2D</b>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/React%20Native-61DAFB?logo=react&logoColor=black" alt="React Native"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/API-AwesomeAPI-4B32C3" alt="AwesomeAPI"/>
</p>

---

## ✨ Funcionalidades

**💱 Aba Câmbio** — consome a [AwesomeAPI](https://economia.awesomeapi.com.br)
- Lista dos principais pares do real (BRL) com cotação de compra, variação e atualização.
- Estados de **loading, erro e vazio** tratados; resiliência a falhas de rede e timeout.

**🔴 Aba Jogo (Damas)** — regras completas em lógica pura
- Tabuleiro 8×8 responsivo, **captura obrigatória e encadeada**, promoção a dama.
- Dama move/captura em diagonal por qualquer distância; brancas sempre começam.
- Bot adversário, timer de turno (30s), placar e modal de fim de jogo.

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| App | React Native (Expo) |
| Navegação | React Navigation (Bottom Tabs + Native Stack) |
| Rede | Axios (AwesomeAPI) |
| Estado | Hooks customizados (`useExchangeRates`, `useExchangeDetail`) |
| Lógica de jogo | JavaScript puro (`checkersEngine`) |

## 🏗️ Arquitetura

Organização **feature-based**: cada domínio (damas, câmbio) é autocontido em `src/features/<feature>`, com telas, hooks e lógica próprios. O código transversal vive em `src/shared` e a regra do jogo é separada da UI.

```mermaid
flowchart TD
  App[App.js] --> Nav[navigation · RootTabNavigator]
  Nav -->|aba 💱| Exch[features/exchange]
  Nav -->|aba 🔴| Game[features/checkers]
  Exch --> Hooks[hooks · useExchangeRates / Detail]
  Hooks --> ApiC[services/exchangeApi · Axios → AwesomeAPI]
  Game --> Engine[logic/checkersEngine · regras das damas]
  Exch -. usa .-> Shared[shared · componentes · tema neon · utils]
  Game -. usa .-> Shared
```

## ▶️ Como executar

```bash
npm install
npm start          # abre o Metro; escaneie o QR com o Expo Go
```

```bash
npm run android    # emulador/dispositivo Android
npm run ios         # simulador iOS
npm run web         # navegador
```

**Requisitos:** Node 20 LTS · Expo Go (Android/iOS) ou emulador/simulador.

## 🖥️ Apresentação

`apresentacao.html` (na raiz do projeto) é um deck de slides navegável com a visão geral de projeto, arquitetura e stack — abra direto no navegador.

---

<p align="center">
  <sub>📚 <b>ADS306 — Desenvolvimento para Dispositivos Móveis e Games</b> · Análise e Desenvolvimento de Sistemas — UniViçosa</sub><br/>
  <sub>Parte do repositório-portfólio <a href="../../">UniVicosa</a> · Curso concluído 🎓 · 👤 Bernardo Cordeiro Motta</sub>
</p>
