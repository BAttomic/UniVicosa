/**
 * boardConstants.js
 * -----------------------------------------------------------------------------
 * Constantes de domínio do xadrez: dimensão do tabuleiro, identificadores de
 * tipos de peça e cores, valores materiais, glifos Unicode e a posição inicial
 * padrão montada de forma declarativa. Sem lógica de jogo aqui — apenas dados
 * estáveis reutilizados pelo engine, pela IA e pela UI.
 */
export const BOARD_SIZE = 8;

export const PIECE_TYPES = {
  KING: 'K',
  QUEEN: 'Q',
  ROOK: 'R',
  BISHOP: 'B',
  KNIGHT: 'N',
  PAWN: 'P',
};

export const COLORS = {
  WHITE: 'white',
  BLACK: 'black',
};

export const PIECE_VALUES = {
  P: 1,
  N: 3,
  B: 3,
  R: 5,
  Q: 9,
  K: 0,
};

export const UNICODE_PIECES = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

const createBackRank = (color) => [
  { type: PIECE_TYPES.ROOK, color },
  { type: PIECE_TYPES.KNIGHT, color },
  { type: PIECE_TYPES.BISHOP, color },
  { type: PIECE_TYPES.QUEEN, color },
  { type: PIECE_TYPES.KING, color },
  { type: PIECE_TYPES.BISHOP, color },
  { type: PIECE_TYPES.KNIGHT, color },
  { type: PIECE_TYPES.ROOK, color },
];

const createPawnRank = (color) => Array.from({ length: BOARD_SIZE }, () => ({ type: PIECE_TYPES.PAWN, color }));

const createEmptyRank = () => Array.from({ length: BOARD_SIZE }, () => null);

export const INITIAL_BOARD = [
  createBackRank(COLORS.BLACK),
  createPawnRank(COLORS.BLACK),
  createEmptyRank(),
  createEmptyRank(),
  createEmptyRank(),
  createEmptyRank(),
  createPawnRank(COLORS.WHITE),
  createBackRank(COLORS.WHITE),
];