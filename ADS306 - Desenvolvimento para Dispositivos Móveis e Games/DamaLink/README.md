# DamaLink - Câmbio + Damas 2D

Projeto para a disciplina ADS306 — Desenvolvimento para Dispositivos Móveis e Games.

Um aplicativo híbrido que combina um utilitário de câmbio (AwesomeAPI) com um jogo de damas 2D.

## Tecnologias

- **React Native** (Expo)
- **React Navigation** (Bottom Tabs + Native Stack)
- **Axios** (consumo de API REST)
- **Hooks customizados** (useExchangeRates, useExchangeDetail)
- **Lógica pura** para regras do jogo de Damas

## API

- **AwesomeAPI** - https://economia.awesomeapi.com.br

## Funcionalidades

### Aba Câmbio
- Lista de pares principais do real (BRL)
- Cartões com compra, variação e atualização
- Estados de loading, erro e vazio
- Tratamento de falhas de rede e timeout

### Aba Jogo (Damas)
- Tabuleiro 8x8 responsivo
- Captura obrigatória e captura encadeada
- Promoção a dama
- Dama move e captura em diagonais por qualquer distância
- Brancas sempre começam (mesmo se for o bot)
- Player 1 sempre embaixo, com 50% de chance de ser preto ou branco
- Bot adversário com movimentos aleatórios
- Timer de turno (30s), placar e modal de fim de jogo

## Arquitetura

Organização **feature-based**: cada domínio (damas, câmbio) é autocontido em
`src/features/<feature>`, com telas, hooks e lógica próprios. Código transversal
(botões, tema, gradiente neon, utilitários) vive em `src/shared`, e a composição
das features acontece em `src/navigation`. A regra do jogo é separada da UI:
`checkersEngine` concentra toda a lógica das damas.

```
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── README.md
└── src/
    ├── features/
    │   ├── checkers/
    │   │   ├── logic/
    │   │   │   └── checkersEngine.js     # regras das damas (captura, dama, etc.)
    │   │   └── screens/
    │   │       └── CheckersGameScreen.jsx
    │   └── exchange/
    │       ├── services/
    │       │   └── exchangeApi.js         # cliente Axios da AwesomeAPI
    │       ├── hooks/
    │       │   ├── useExchangeRates.js
    │       │   └── useExchangeDetail.js
    │       └── screens/
    │           ├── ExchangeListScreen.jsx
    │           └── ExchangeDetailScreen.jsx
    ├── navigation/
    │   ├── RootTabNavigator.jsx           # abas Câmbio | Jogo
    │   └── ExchangeStackNavigator.jsx     # lista -> detalhe do câmbio
    └── shared/
        ├── components/                    # Button, Header, InfoCard, etc.
        ├── hooks/
        │   └── useGameLoop.js             # game loop (requestAnimationFrame)
        ├── theme/
        │   ├── colors.js                  # paleta neon + gradientes
        │   └── dimensions.js              # tokens responsivos
        └── utils/
            └── collisionDetection.js
```

## Apresentação

`apresentacao.html` na raiz é um deck de slides (navegável por teclado/clique)
com a visão geral do projeto, arquitetura e stack — abra direto no navegador.

## Instalação

```bash
npm install
```

## Execução

- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`
- **QR Code**: `npm start` e escaneie com o app Expo Go
