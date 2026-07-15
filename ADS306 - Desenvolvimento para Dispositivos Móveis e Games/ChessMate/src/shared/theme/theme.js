import { Platform } from 'react-native';

// ChessMate — identidade "clube de xadrez clássico":
// marfim, nogueira, feltro esmeralda e detalhes em ouro, com tipografia serifada.
const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const theme = {
  colors: {
    // superfícies
    primary: '#f4ece0',      // marfim (fundo principal)
    surface: '#fffdf8',      // creme (cards)
    surfaceAlt: '#ece0cc',   // marfim mais profundo
    // marca
    emerald: '#1f5c43',      // feltro esmeralda
    emeraldDeep: '#103a2c',
    gold: '#b8860b',         // ouro velho (acento)
    goldSoft: '#d9b85b',
    // tabuleiro de torneio (green & buff)
    boardLight: '#e8d7b0',
    boardDark: '#4e7d63',
    boardSelected: '#cdb15a',
    boardMove: 'rgba(31, 92, 67, 0.45)',
    boardCapture: '#9e3b2c',
    boardLastMove: 'rgba(184, 134, 11, 0.45)', // último lance (amarelado)
    boardPremove: 'rgba(158, 59, 44, 0.55)',   // pré-move (avermelhado)
    // texto
    ink: '#2b241b',          // tinta nogueira escura
    inkSoft: '#6f6453',
    muted: '#9b8f79',
    // utilitários
    white: '#ffffff',
    light: '#f4ece0',
    dark: '#2b241b',
    gray: '#9b8f79',
    accent: '#b8860b',       // alias legado (= gold)
    danger: '#9e3b2c',       // oxblood
    line: '#e0d3b8',         // bordas suaves
    overlay: 'rgba(28, 22, 14, 0.78)',
  },
  fonts: {
    serif,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadow: {
    card: {
      shadowColor: '#2b241b',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};

export default theme;
