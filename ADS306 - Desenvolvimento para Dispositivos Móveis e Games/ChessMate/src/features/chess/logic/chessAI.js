/**
 * chessAI.js
 * -----------------------------------------------------------------------------
 * Motor de decisão da IA adversária. Implementa uma busca negamax com poda
 * alfa-beta sobre a árvore de lances gerada pelo `chessEngine`, avaliando as
 * posições por material + tabelas posicionais (piece-square tables). A função
 * pública é `selectBestMove`, consumida pela tela do jogo.
 *
 * Decisões de projeto:
 *  - Negamax (variante simétrica do minimax) para reduzir duplicação de código.
 *  - Poda alfa-beta + ordenação de lances (capturas primeiro, heurística MVV-LVA)
 *    para podar ramos cedo e manter a busca viável em dispositivos móveis.
 *  - Desempate aleatório entre lances de igual avaliação, evitando que a IA
 *    repita sempre a mesma sequência de abertura.
 */
import { BOARD_SIZE, COLORS, PIECE_TYPES } from './boardConstants';
import { executeMove, getAllMovesForColor, isInCheck } from './chessEngine';

/** Profundidade padrão da busca (em meios-lances / plies). */
export const DEFAULT_SEARCH_DEPTH = 3;

/** Pontuação atribuída a um mate; afastada do infinito para permitir aritmética. */
const MATE_SCORE = 1_000_000;

/** Tolerância para considerar dois lances "equivalentes" no desempate. */
const SCORE_EPSILON = 1e-6;

/** Valor material de cada tipo de peça (escala em centésimos de peão). */
const MATERIAL_VALUE = {
  [PIECE_TYPES.PAWN]: 100,
  [PIECE_TYPES.KNIGHT]: 320,
  [PIECE_TYPES.BISHOP]: 330,
  [PIECE_TYPES.ROOK]: 500,
  [PIECE_TYPES.QUEEN]: 900,
  [PIECE_TYPES.KING]: 20000,
};

// Tabelas posicionais na perspectiva das brancas: a linha 0 corresponde ao
// 8.º rank (lado preto) e a linha 7 ao 1.º rank (lado branco). Para as peças
// pretas a tabela é espelhada verticalmente (7 - linha).
// Tabela do peão com avanço central (d/e) valorizado o bastante para competir
// com o desenvolvimento de cavalos — assim a abertura varia entre peões e peças
// em vez de empurrar sempre as menores primeiro.
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 32, 32, 20, 10, 10],
  [5, 5, 15, 32, 32, 15, 5, 5],
  [2, 4, 12, 30, 30, 12, 4, 2],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_TABLE_MIDDLEGAME = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const KING_TABLE_ENDGAME = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const PIECE_SQUARE_TABLES = {
  [PIECE_TYPES.PAWN]: PAWN_TABLE,
  [PIECE_TYPES.KNIGHT]: KNIGHT_TABLE,
  [PIECE_TYPES.BISHOP]: BISHOP_TABLE,
  [PIECE_TYPES.ROOK]: ROOK_TABLE,
  [PIECE_TYPES.QUEEN]: QUEEN_TABLE,
};

/** Cor adversária. */
function getOpponent(color) {
  return color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
}

/**
 * Heurística simples de fim de jogo: ausência de damas ou pouquíssimas peças
 * menores. Usada para alternar a tabela posicional do rei (centralizar no final).
 */
function isEndgamePhase(board) {
  let queens = 0;
  let minors = 0;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      if (piece.type === PIECE_TYPES.QUEEN) queens++;
      if (piece.type === PIECE_TYPES.BISHOP || piece.type === PIECE_TYPES.KNIGHT) minors++;
    }
  }

  return queens === 0 || minors <= 2;
}

/** Bônus posicional de uma peça, já espelhado conforme a cor. */
function getPieceSquareBonus(piece, row, col, endgame) {
  if (piece.type === PIECE_TYPES.KING) {
    const table = endgame ? KING_TABLE_ENDGAME : KING_TABLE_MIDDLEGAME;
    const mirroredRow = piece.color === COLORS.WHITE ? row : 7 - row;
    return table[mirroredRow][col];
  }

  const table = PIECE_SQUARE_TABLES[piece.type];
  if (!table) return 0;

  const mirroredRow = piece.color === COLORS.WHITE ? row : 7 - row;
  return table[mirroredRow][col];
}

/**
 * Avalia uma posição na perspectiva de `color` (valores positivos = vantagem
 * para `color`). Combina material e tabelas posicionais; um pequeno bônus
 * preserva os direitos de roque para incentivar a segurança do rei.
 * @param {Array<Array<object|null>>} board
 * @param {string} color
 * @param {object} [castlingRights]
 * @returns {number}
 */
export function evaluatePosition(board, color, castlingRights) {
  let score = 0;
  const endgame = isEndgamePhase(board);

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const pieceScore = (MATERIAL_VALUE[piece.type] || 0) + getPieceSquareBonus(piece, row, col, endgame);
      score += piece.color === COLORS.WHITE ? pieceScore : -pieceScore;
    }
  }

  if (castlingRights) {
    if (!castlingRights.whiteKingMoved) score += 25;
    if (!castlingRights.blackKingMoved) score -= 25;
  }

  // Converte para a perspectiva da cor que estamos avaliando (negamax).
  return color === COLORS.WHITE ? score : -score;
}

/**
 * Ordena os lances priorizando capturas valiosas (MVV-LVA: vítima mais valiosa,
 * agressor mais barato). Boa ordenação maximiza os cortes da poda alfa-beta.
 */
function orderMoves(board, moves) {
  return moves
    .map((entry) => {
      const attacker = board[entry.fromRow][entry.fromCol];
      const victimSquare = entry.move.special === 'en_passant' && entry.move.capture
        ? board[entry.move.capture.row][entry.move.capture.col]
        : board[entry.move.row][entry.move.col];

      let priority = 0;
      if (victimSquare) {
        priority = 10 * (MATERIAL_VALUE[victimSquare.type] || 0) - (MATERIAL_VALUE[attacker?.type] || 0);
      }
      if (entry.move.promotion) {
        priority += MATERIAL_VALUE[entry.move.promotion] || 0;
      }

      return { entry, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .map((item) => item.entry);
}

/** Reconstrói o registro de "último lance" para o contexto do engine. */
function buildLastMove(board, fromRow, fromCol, move) {
  const piece = board[fromRow][fromCol];
  return {
    fromRow,
    fromCol,
    toRow: move.row,
    toCol: move.col,
    piece: piece ? { type: piece.type, color: piece.color } : null,
  };
}

/**
 * Busca negamax com poda alfa-beta. Retorna a avaliação da posição para a cor
 * que tem a vez, olhando `depth` meios-lances à frente.
 */
function negamax(board, depth, alpha, beta, color, lastMove, castlingRights) {
  if (depth === 0) {
    return evaluatePosition(board, color, castlingRights);
  }

  const moves = getAllMovesForColor(board, color, { lastMove, castlingRights });

  if (moves.length === 0) {
    // Sem lances legais: mate (penaliza, preferindo mates mais rápidos) ou afogamento.
    if (isInCheck(board, color)) {
      return -MATE_SCORE - depth;
    }
    return 0;
  }

  const orderedMoves = orderMoves(board, moves);
  const opponent = getOpponent(color);
  let bestScore = -Infinity;

  for (const { fromRow, fromCol, move } of orderedMoves) {
    const nextBoard = executeMove(board, fromRow, fromCol, move);
    const nextLastMove = buildLastMove(board, fromRow, fromCol, move);
    const score = -negamax(nextBoard, depth - 1, -beta, -alpha, opponent, nextLastMove, castlingRights);

    if (score > bestScore) bestScore = score;
    if (bestScore > alpha) alpha = bestScore;
    if (alpha >= beta) break; // corte alfa-beta
  }

  return bestScore;
}

/**
 * Escolhe o melhor lance para `color` na posição atual.
 * @param {Array<Array<object|null>>} board
 * @param {string} color cor que vai jogar (a IA)
 * @param {{ lastMove?: object|null, castlingRights?: object, depth?: number }} [options]
 * @returns {{ fromRow:number, fromCol:number, move:object } | null}
 */
export function selectBestMove(board, color, options = {}) {
  const { lastMove = null, castlingRights = {}, depth = DEFAULT_SEARCH_DEPTH } = options;

  const moves = getAllMovesForColor(board, color, { lastMove, castlingRights });
  if (moves.length === 0) {
    return null;
  }

  const orderedMoves = orderMoves(board, moves);
  const opponent = getOpponent(color);
  let bestScore = -Infinity;
  let bestCandidates = [];

  for (const candidate of orderedMoves) {
    const nextBoard = executeMove(board, candidate.fromRow, candidate.fromCol, candidate.move);
    const nextLastMove = buildLastMove(board, candidate.fromRow, candidate.fromCol, candidate.move);
    const score = -negamax(
      nextBoard,
      depth - 1,
      -Infinity,
      Infinity,
      opponent,
      nextLastMove,
      castlingRights
    );

    if (score > bestScore + SCORE_EPSILON) {
      bestScore = score;
      bestCandidates = [candidate];
    } else if (Math.abs(score - bestScore) <= SCORE_EPSILON) {
      bestCandidates.push(candidate);
    }
  }

  // Desempate aleatório para dar variedade às partidas.
  return bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
}
