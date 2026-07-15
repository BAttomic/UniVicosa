# ChessMate

App Expo (React Native) com duas experiencias: clima e xadrez contra IA.
Projeto para a disciplina ADS306 - Desenvolvimento para Dispositivos Moveis e Games.

## Recursos

- Xadrez contra IA (minimax 2 ply) com relogio de 10 minutos por lado.
- Regras: roque, en passant, promocao (selecao manual com auto-queen em 5s), cheque e xeque-mate.
- Empates por repeticao de posicao (3x) e regra dos 50 lances.
- Placar de capturas, contador de jogadas e orientacao do tabuleiro pelo jogador.
- Clima: lista de capitais brasileiras e detalhes por cidade.

## Tecnologias

- Expo SDK 54, React Native 0.81
- React Navigation (tabs + stack)
- Axios

## Requisitos

- Node 20 LTS (recomendado para Expo SDK 54)
- Expo Go (Android/iOS) ou emulador/simulador

## Como executar

```bash
npm install
npm run start
```

Comandos uteis:

```bash
npm run android
npm run ios
npm run web
npm test
```

## Configurar API de clima

Por padrao, o app tenta usar a OpenWeatherMap. Se a chave nao estiver configurada, ele usa um fallback (Open-Meteo) para as cidades ja mapeadas no codigo.

1. Gere uma chave gratuita em https://openweathermap.org/api
2. Edite `src/features/weather/services/weatherApi.js` e substitua `COLOQUE_SUA_KEY_AQUI` pela sua chave.

## Arquitetura

Organização **feature-based**: cada domínio (xadrez, clima) é autocontido em
`src/features/<feature>`, com telas, componentes e lógica próprios. Código
transversal (botões, tema, cabeçalho) vive em `src/shared`, e a composição das
features acontece em `src/navigation`. A regra de xadrez é separada da UI:
`chessEngine` cuida das regras e `chessAI` da busca (negamax com poda alfa-beta).

```
src/
  features/
    chess/
      components/
        ChessPiece.jsx          # sprite da peça
      logic/
        boardConstants.js       # tipos, valores e posição inicial
        chessEngine.js          # regras (lances legais, xeque, roque, etc.)
        chessAI.js              # IA: negamax + alfa-beta + piece-square tables
      screens/
        ChessGameScreen.jsx     # estado/UI da partida
    weather/
      services/
        weatherApi.js           # OpenWeatherMap + fallback Open-Meteo
      screens/
        WeatherListScreen.jsx
        WeatherDetailScreen.jsx
  navigation/
    RootTabNavigator.jsx        # abas Clima | Xadrez
    WeatherStackNavigator.jsx   # lista -> detalhe do clima
  shared/
    components/                 # AppButton, AppHeader, InfoCard
    theme/
      theme.js                  # paleta, tipografia, espaçamentos
```

## Apresentação

`apresentacao.html` na raiz é um deck de slides (navegável por teclado/clique)
com a visão geral do projeto, arquitetura e stack — abra direto no navegador.

## Licenca

Nao definida.
